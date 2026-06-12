from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PostMediaOut(BaseModel):
    id: int
    media_type: Optional[str] = None
    url: Optional[str] = None

    class Config:
        from_attributes = True


class AuthorBrief(BaseModel):
    id: int
    username: str
    profile: Optional[dict] = None

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class CommentOut(BaseModel):
    id: int
    post_id: int
    author_id: int
    parent_id: Optional[int] = None
    content: str
    created_at: datetime
    author: Optional[AuthorBrief] = None
    replies: List["CommentOut"] = []

    class Config:
        from_attributes = True


CommentOut.model_rebuild()


class PostCreate(BaseModel):
    content: str
    visibility: str = "public"
    repost_of_id: Optional[int] = None


class PostOut(BaseModel):
    id: int
    author_id: int
    content: str
    visibility: str
    repost_of_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    author: Optional[AuthorBrief] = None
    media: List[PostMediaOut] = []
    like_count: int = 0
    comment_count: int = 0
    repost_count: int = 0
    user_reaction: Optional[str] = None
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True


class NotificationOut(BaseModel):
    id: int
    recipient_id: int
    actor_id: Optional[int] = None
    type: str
    entity_id: Optional[int] = None
    entity_type: Optional[str] = None
    message: Optional[str] = None
    is_read: bool
    created_at: datetime
    actor: Optional[AuthorBrief] = None

    class Config:
        from_attributes = True


class ConnectionOut(BaseModel):
    id: int
    requester_id: int
    addressee_id: int
    status: str
    message: Optional[str] = None
    created_at: datetime
    requester: Optional[AuthorBrief] = None
    addressee: Optional[AuthorBrief] = None

    class Config:
        from_attributes = True


class ReactionCreate(BaseModel):
    reaction: str = "like"
