from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from fastapi import Form
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.message import Conversation, ConversationMember, Message, MessageRead
from app.utils.files import save_upload

router = APIRouter(prefix="/api/messages", tags=["messages"])


def _user_brief(user: User):
    p = user.profile
    return {
        "id": user.id,
        "username": user.username,
        "profile": {
            "first_name": p.first_name if p else "",
            "last_name": p.last_name if p else "",
            "avatar_url": p.avatar_url if p else None,
        } if p else None
    }


@router.get("/conversations")
def get_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    memberships = db.query(ConversationMember).filter(ConversationMember.user_id == current_user.id).all()
    conv_ids = [m.conversation_id for m in memberships]

    result = []
    for conv_id in conv_ids:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        members = db.query(ConversationMember).options(
            joinedload(ConversationMember.user).joinedload(User.profile)
        ).filter(ConversationMember.conversation_id == conv_id).all()

        last_msg = db.query(Message).filter(
            Message.conversation_id == conv_id,
            Message.is_deleted == False
        ).order_by(Message.created_at.desc()).first()

        unread_count = db.query(Message).filter(
            Message.conversation_id == conv_id,
            Message.sender_id != current_user.id,
            Message.is_deleted == False
        ).filter(
            ~Message.id.in_(
                db.query(MessageRead.message_id).filter(MessageRead.user_id == current_user.id)
            )
        ).count()

        last_msg_data = None
        if last_msg:
            sender = last_msg.sender
            last_msg_data = {
                "id": last_msg.id,
                "content": last_msg.content,
                "created_at": last_msg.created_at,
                "sender_id": last_msg.sender_id,
                "sender": _user_brief(sender) if sender else None,
                "is_read": False,
                "conversation_id": conv_id,
                "is_deleted": last_msg.is_deleted,
                "attachment_url": last_msg.attachment_url,
                "attachment_type": last_msg.attachment_type,
            }

        result.append({
            "id": conv.id,
            "created_at": conv.created_at,
            "members": [_user_brief(m.user) for m in members if m.user_id != current_user.id],
            "last_message": last_msg_data,
            "unread_count": unread_count,
        })

    result.sort(key=lambda x: x["last_message"]["created_at"] if x["last_message"] else x["created_at"], reverse=True)
    return result


@router.post("/conversations")
def create_or_get_conversation(recipient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if recipient_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    recipient = db.query(User).filter(User.id == recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="User not found")

    my_convs = {m.conversation_id for m in db.query(ConversationMember).filter(ConversationMember.user_id == current_user.id).all()}
    their_convs = {m.conversation_id for m in db.query(ConversationMember).filter(ConversationMember.user_id == recipient_id).all()}
    shared = my_convs & their_convs

    if shared:
        conv_id = list(shared)[0]
        return {"conversation_id": conv_id}

    conv = Conversation()
    db.add(conv)
    db.flush()

    db.add(ConversationMember(conversation_id=conv.id, user_id=current_user.id))
    db.add(ConversationMember(conversation_id=conv.id, user_id=recipient_id))
    db.commit()

    return {"conversation_id": conv.id}


@router.get("/conversations/{conv_id}")
def get_messages(conv_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(ConversationMember).filter(
        ConversationMember.conversation_id == conv_id,
        ConversationMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    messages = db.query(Message).options(
        joinedload(Message.sender).joinedload(User.profile),
        joinedload(Message.reads)
    ).filter(
        Message.conversation_id == conv_id
    ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for m in reversed(messages):
        is_read = any(r.user_id != m.sender_id for r in m.reads) if m.reads else False
        result.append({
            "id": m.id,
            "conversation_id": m.conversation_id,
            "sender_id": m.sender_id,
            "content": m.content,
            "attachment_url": m.attachment_url,
            "attachment_type": m.attachment_type,
            "is_deleted": m.is_deleted,
            "created_at": m.created_at,
            "sender": _user_brief(m.sender) if m.sender else None,
            "is_read": is_read,
        })

    unread_ids = [m["id"] for m in result if not m["is_read"] and m["sender_id"] != current_user.id]
    for msg_id in unread_ids:
        existing = db.query(MessageRead).filter(MessageRead.message_id == msg_id, MessageRead.user_id == current_user.id).first()
        if not existing:
            db.add(MessageRead(message_id=msg_id, user_id=current_user.id))
    if unread_ids:
        db.commit()

    return result


@router.post("/conversations/{conv_id}/send")
async def send_message(
    conv_id: int,
    content: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(ConversationMember).filter(
        ConversationMember.conversation_id == conv_id,
        ConversationMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    attachment_url = None
    attachment_type = None
    if attachment and attachment.filename:
        attachment_url = await save_upload(attachment, "documents")
        attachment_type = "image" if attachment.content_type and "image" in attachment.content_type else "file"

    msg = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=content,
        attachment_url=attachment_url,
        attachment_type=attachment_type,
    )
    db.add(msg)

    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if conv:
        from sqlalchemy.sql import func
        conv.updated_at = func.now()

    db.commit()
    db.refresh(msg)

    p = current_user.profile
    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "sender_id": msg.sender_id,
        "content": msg.content,
        "attachment_url": msg.attachment_url,
        "attachment_type": msg.attachment_type,
        "is_deleted": msg.is_deleted,
        "created_at": msg.created_at,
        "sender": _user_brief(current_user),
        "is_read": False,
    }


@router.delete("/messages/{message_id}")
def delete_message(message_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    msg = db.query(Message).filter(Message.id == message_id, Message.sender_id == current_user.id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Not found")
    msg.is_deleted = True
    db.commit()
    return {"message": "Deleted"}
