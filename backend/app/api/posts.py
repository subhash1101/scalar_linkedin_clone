from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.social import Post, PostMedia, PostLike, Comment, Repost, Notification, NotificationType, ReactionType, Connection, ConnectionStatus, Follower
from app.schemas.social import PostCreate, PostOut, CommentCreate, CommentOut, ReactionCreate
from app.utils.files import save_upload
import sqlalchemy as sa

router = APIRouter(prefix="/api/posts", tags=["posts"])


def _build_post_out(post: Post, current_user_id: int, db: Session) -> dict:
    like_count = len(post.likes)
    comment_count = len([c for c in post.comments if c.parent_id is None])
    repost_count = len(post.reposts)
    user_like = next((l for l in post.likes if l.user_id == current_user_id), None)
    user_reaction = user_like.reaction.value if user_like else None

    author_data = None
    if post.author:
        p = post.author.profile
        author_data = {
            "id": post.author.id,
            "username": post.author.username,
            "profile": {
                "first_name": p.first_name if p else "",
                "last_name": p.last_name if p else "",
                "headline": p.headline if p else None,
                "avatar_url": p.avatar_url if p else None,
            } if p else None
        }

    top_comments = []
    for c in sorted(post.comments, key=lambda x: x.created_at):
        if c.parent_id is None:
            author_p = c.author.profile if c.author else None
            top_comments.append({
                "id": c.id,
                "post_id": c.post_id,
                "author_id": c.author_id,
                "parent_id": c.parent_id,
                "content": c.content,
                "created_at": c.created_at,
                "author": {
                    "id": c.author.id,
                    "username": c.author.username,
                    "profile": {
                        "first_name": author_p.first_name if author_p else "",
                        "last_name": author_p.last_name if author_p else "",
                        "avatar_url": author_p.avatar_url if author_p else None,
                    } if author_p else None
                } if c.author else None,
                "replies": []
            })

    return {
        "id": post.id,
        "author_id": post.author_id,
        "content": post.content,
        "visibility": post.visibility,
        "repost_of_id": post.repost_of_id,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "author": author_data,
        "media": [{"id": m.id, "media_type": m.media_type, "url": m.url} for m in post.media],
        "like_count": like_count,
        "comment_count": comment_count,
        "repost_count": repost_count,
        "user_reaction": user_reaction,
        "comments": top_comments,
    }


@router.get("/feed")
def get_feed(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    connected_ids = set()
    connections = db.query(Connection).filter(
        ((Connection.requester_id == current_user.id) | (Connection.addressee_id == current_user.id)) &
        (Connection.status == ConnectionStatus.accepted)
    ).all()
    for c in connections:
        connected_ids.add(c.requester_id if c.requester_id != current_user.id else c.addressee_id)

    following_ids = {f.following_id for f in db.query(Follower).filter(Follower.follower_id == current_user.id).all()}
    feed_ids = connected_ids | following_ids | {current_user.id}

    posts = db.query(Post).options(
        joinedload(Post.author).joinedload(User.profile),
        joinedload(Post.media),
        joinedload(Post.likes),
        joinedload(Post.comments).joinedload(Comment.author).joinedload(User.profile),
        joinedload(Post.reposts),
    ).filter(
        Post.author_id.in_(feed_ids)
    ).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

    return [_build_post_out(p, current_user.id, db) for p in posts]


@router.post("")
async def create_post(
    content: str = Form(...),
    visibility: str = Form("public"),
    repost_of_id: Optional[int] = Form(None),
    files: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = Post(author_id=current_user.id, content=content, visibility=visibility, repost_of_id=repost_of_id)
    db.add(post)
    db.flush()

    for f in files:
        if f.filename:
            url = await save_upload(f, "documents")
            media_type = "image" if f.content_type and "image" in f.content_type else "document"
            pm = PostMedia(post_id=post.id, media_type=media_type, url=url)
            db.add(pm)

    db.commit()
    db.refresh(post)

    post = db.query(Post).options(
        joinedload(Post.author).joinedload(User.profile),
        joinedload(Post.media),
        joinedload(Post.likes),
        joinedload(Post.comments),
        joinedload(Post.reposts),
    ).filter(Post.id == post.id).first()

    return _build_post_out(post, current_user.id, db)


@router.get("/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).options(
        joinedload(Post.author).joinedload(User.profile),
        joinedload(Post.media),
        joinedload(Post.likes),
        joinedload(Post.comments).joinedload(Comment.author).joinedload(User.profile),
        joinedload(Post.reposts),
    ).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return _build_post_out(post, current_user.id, db)


@router.delete("/{post_id}")
def delete_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Not found")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(post)
    db.commit()
    return {"message": "Deleted"}


@router.post("/{post_id}/like")
def toggle_like(post_id: int, data: ReactionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == current_user.id).first()
    if existing:
        if existing.reaction.value == data.reaction:
            db.delete(existing)
            db.commit()
            return {"liked": False, "reaction": None}
        else:
            existing.reaction = ReactionType(data.reaction)
            db.commit()
            return {"liked": True, "reaction": data.reaction}

    like = PostLike(post_id=post_id, user_id=current_user.id, reaction=ReactionType(data.reaction))
    db.add(like)

    if post.author_id != current_user.id:
        notif = Notification(
            recipient_id=post.author_id,
            actor_id=current_user.id,
            type=NotificationType.like,
            entity_id=post_id,
            entity_type="post",
            message=f"reacted to your post",
        )
        db.add(notif)

    db.commit()
    return {"liked": True, "reaction": data.reaction}


@router.get("/{post_id}/comments")
def get_comments(post_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    comments = db.query(Comment).options(
        joinedload(Comment.author).joinedload(User.profile),
        joinedload(Comment.replies).joinedload(Comment.author).joinedload(User.profile),
    ).filter(Comment.post_id == post_id, Comment.parent_id == None).order_by(Comment.created_at).all()

    def serialize(c: Comment):
        author_p = c.author.profile if c.author else None
        return {
            "id": c.id,
            "post_id": c.post_id,
            "author_id": c.author_id,
            "parent_id": c.parent_id,
            "content": c.content,
            "created_at": c.created_at,
            "author": {
                "id": c.author.id,
                "username": c.author.username,
                "profile": {
                    "first_name": author_p.first_name if author_p else "",
                    "last_name": author_p.last_name if author_p else "",
                    "avatar_url": author_p.avatar_url if author_p else None,
                } if author_p else None
            } if c.author else None,
            "replies": [serialize(r) for r in c.replies]
        }

    return [serialize(c) for c in comments]


@router.post("/{post_id}/comments")
def add_comment(post_id: int, data: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(post_id=post_id, author_id=current_user.id, content=data.content, parent_id=data.parent_id)
    db.add(comment)

    if post.author_id != current_user.id:
        notif = Notification(
            recipient_id=post.author_id,
            actor_id=current_user.id,
            type=NotificationType.comment,
            entity_id=post_id,
            entity_type="post",
            message="commented on your post",
        )
        db.add(notif)

    db.commit()
    db.refresh(comment)

    author_p = current_user.profile
    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "author_id": comment.author_id,
        "parent_id": comment.parent_id,
        "content": comment.content,
        "created_at": comment.created_at,
        "author": {
            "id": current_user.id,
            "username": current_user.username,
            "profile": {
                "first_name": author_p.first_name if author_p else "",
                "last_name": author_p.last_name if author_p else "",
                "avatar_url": author_p.avatar_url if author_p else None,
            } if author_p else None
        },
        "replies": []
    }


@router.delete("/{post_id}/comments/{comment_id}")
def delete_comment(post_id: int, comment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id, Comment.post_id == post_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Not found")
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(comment)
    db.commit()
    return {"message": "Deleted"}


@router.post("/{post_id}/repost")
def repost(post_id: int, comment: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Not found")

    existing = db.query(Repost).filter(Repost.post_id == post_id, Repost.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"reposted": False}

    repost_obj = Repost(post_id=post_id, user_id=current_user.id, comment=comment)
    db.add(repost_obj)
    db.commit()
    return {"reposted": True}


@router.get("/user/{user_id}")
def get_user_posts(user_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    posts = db.query(Post).options(
        joinedload(Post.author).joinedload(User.profile),
        joinedload(Post.media),
        joinedload(Post.likes),
        joinedload(Post.comments).joinedload(Comment.author).joinedload(User.profile),
        joinedload(Post.reposts),
    ).filter(Post.author_id == user_id).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return [_build_post_out(p, current_user.id, db) for p in posts]
