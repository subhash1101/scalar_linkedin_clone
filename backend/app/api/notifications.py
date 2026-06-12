from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.social import Notification

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def _notif_brief(n: Notification):
    actor = None
    if n.actor:
        p = n.actor.profile
        actor = {
            "id": n.actor.id,
            "username": n.actor.username,
            "profile": {
                "first_name": p.first_name if p else "",
                "last_name": p.last_name if p else "",
                "avatar_url": p.avatar_url if p else None,
            } if p else None
        }
    return {
        "id": n.id,
        "type": n.type.value,
        "entity_id": n.entity_id,
        "entity_type": n.entity_type,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at,
        "actor": actor,
    }


@router.get("")
def get_notifications(
    skip: int = 0,
    limit: int = 30,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Notification).options(
        joinedload(Notification.actor).joinedload(User.profile)
    ).filter(Notification.recipient_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    unread_count = db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False
    ).count()

    return {
        "notifications": [_notif_brief(n) for n in notifications],
        "unread_count": unread_count,
        "total": query.count()
    }


@router.post("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = db.query(Notification).filter(Notification.id == notif_id, Notification.recipient_id == current_user.id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Marked as read"}


@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}


@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"count": count}
