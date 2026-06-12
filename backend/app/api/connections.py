from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.social import Connection, ConnectionStatus, Follower, Notification, NotificationType

router = APIRouter(prefix="/api/connections", tags=["connections"])


def _user_brief(user: User):
    p = user.profile
    return {
        "id": user.id,
        "username": user.username,
        "profile": {
            "first_name": p.first_name if p else "",
            "last_name": p.last_name if p else "",
            "headline": p.headline if p else None,
            "avatar_url": p.avatar_url if p else None,
            "location": p.location if p else None,
        } if p else None
    }


@router.post("/request/{user_id}")
def send_request(user_id: int, message: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot connect with yourself")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(Connection).filter(
        ((Connection.requester_id == current_user.id) & (Connection.addressee_id == user_id)) |
        ((Connection.requester_id == user_id) & (Connection.addressee_id == current_user.id))
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Connection already exists")

    conn = Connection(requester_id=current_user.id, addressee_id=user_id, message=message)
    db.add(conn)

    notif = Notification(
        recipient_id=user_id,
        actor_id=current_user.id,
        type=NotificationType.connection_request,
        entity_id=current_user.id,
        entity_type="user",
        message="sent you a connection request",
    )
    db.add(notif)
    db.commit()
    return {"message": "Request sent", "connection_id": conn.id}


@router.post("/{connection_id}/accept")
def accept_request(connection_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conn = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.addressee_id == current_user.id,
        Connection.status == ConnectionStatus.pending
    ).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Request not found")

    conn.status = ConnectionStatus.accepted

    notif = Notification(
        recipient_id=conn.requester_id,
        actor_id=current_user.id,
        type=NotificationType.connection_accepted,
        entity_id=current_user.id,
        entity_type="user",
        message="accepted your connection request",
    )
    db.add(notif)
    db.commit()
    return {"message": "Accepted"}


@router.post("/{connection_id}/reject")
def reject_request(connection_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conn = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.addressee_id == current_user.id,
    ).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Not found")
    conn.status = ConnectionStatus.rejected
    db.commit()
    return {"message": "Rejected"}


@router.delete("/{connection_id}")
def remove_connection(connection_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conn = db.query(Connection).filter(
        Connection.id == connection_id,
        (Connection.requester_id == current_user.id) | (Connection.addressee_id == current_user.id)
    ).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(conn)
    db.commit()
    return {"message": "Removed"}


@router.get("/pending/incoming")
def get_incoming_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conns = db.query(Connection).options(
        joinedload(Connection.requester).joinedload(User.profile)
    ).filter(
        Connection.addressee_id == current_user.id,
        Connection.status == ConnectionStatus.pending
    ).all()
    return [{"id": c.id, "requester": _user_brief(c.requester), "message": c.message, "created_at": c.created_at} for c in conns]


@router.get("/pending/sent")
def get_sent_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conns = db.query(Connection).options(
        joinedload(Connection.addressee).joinedload(User.profile)
    ).filter(
        Connection.requester_id == current_user.id,
        Connection.status == ConnectionStatus.pending
    ).all()
    return [{"id": c.id, "addressee": _user_brief(c.addressee), "message": c.message, "created_at": c.created_at} for c in conns]


@router.get("/my")
def get_my_connections(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conns = db.query(Connection).filter(
        ((Connection.requester_id == current_user.id) | (Connection.addressee_id == current_user.id)) &
        (Connection.status == ConnectionStatus.accepted)
    ).all()
    result = []
    for c in conns:
        other_id = c.addressee_id if c.requester_id == current_user.id else c.requester_id
        other = db.query(User).options(joinedload(User.profile)).filter(User.id == other_id).first()
        if other:
            result.append({"connection_id": c.id, "user": _user_brief(other), "connected_at": c.updated_at or c.created_at})
    return result


@router.get("/suggestions")
def get_suggestions(limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    connected_ids = set()
    connections = db.query(Connection).filter(
        (Connection.requester_id == current_user.id) | (Connection.addressee_id == current_user.id)
    ).all()
    for c in connections:
        connected_ids.add(c.requester_id)
        connected_ids.add(c.addressee_id)
    connected_ids.add(current_user.id)

    users = db.query(User).options(joinedload(User.profile)).filter(
        ~User.id.in_(connected_ids)
    ).limit(limit).all()

    return [_user_brief(u) for u in users if u.profile]


# Followers
@router.post("/follow/{user_id}")
def follow_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    existing = db.query(Follower).filter(Follower.follower_id == current_user.id, Follower.following_id == user_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"following": False}

    follow = Follower(follower_id=current_user.id, following_id=user_id)
    db.add(follow)
    db.commit()
    return {"following": True}


@router.get("/followers/{user_id}")
def get_followers(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    followers = db.query(Follower).filter(Follower.following_id == user_id).all()
    result = []
    for f in followers:
        user = db.query(User).options(joinedload(User.profile)).filter(User.id == f.follower_id).first()
        if user:
            result.append(_user_brief(user))
    return result


@router.get("/following/{user_id}")
def get_following(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    following = db.query(Follower).filter(Follower.follower_id == user_id).all()
    result = []
    for f in following:
        user = db.query(User).options(joinedload(User.profile)).filter(User.id == f.following_id).first()
        if user:
            result.append(_user_brief(user))
    return result
