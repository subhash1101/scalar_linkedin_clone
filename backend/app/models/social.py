from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class ConnectionStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class NotificationType(str, enum.Enum):
    like = "like"
    comment = "comment"
    mention = "mention"
    connection_request = "connection_request"
    connection_accepted = "connection_accepted"
    job_alert = "job_alert"
    profile_view = "profile_view"
    repost = "repost"
    endorsement = "endorsement"


class ReactionType(str, enum.Enum):
    like = "like"
    celebrate = "celebrate"
    support = "support"
    love = "love"
    insightful = "insightful"
    funny = "funny"


class Follower(Base):
    __tablename__ = "followers"

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    following_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Connection(Base):
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    addressee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ConnectionStatus), default=ConnectionStatus.pending)
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    requester = relationship("User", foreign_keys=[requester_id])
    addressee = relationship("User", foreign_keys=[addressee_id])


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    visibility = Column(String(50), default="public")
    repost_of_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    author = relationship("User", back_populates="posts")
    media = relationship("PostMedia", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    reposts = relationship("Repost", back_populates="post", cascade="all, delete-orphan")
    original = relationship("Post", remote_side="Post.id", foreign_keys=[repost_of_id])


class PostMedia(Base):
    __tablename__ = "post_media"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    media_type = Column(String(20))
    url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("Post", back_populates="media")


class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reaction = Column(Enum(ReactionType), default=ReactionType.like)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("Post", back_populates="likes")
    user = relationship("User", back_populates="post_likes")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")
    replies = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")
    parent = relationship("Comment", back_populates="replies", remote_side="Comment.id", foreign_keys=[parent_id])


class Repost(Base):
    __tablename__ = "reposts"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("Post", back_populates="reposts")
    user = relationship("User", back_populates="reposts")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(Enum(NotificationType), nullable=False)
    entity_id = Column(Integer)
    entity_type = Column(String(50))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="notifications")
    actor = relationship("User", foreign_keys=[actor_id])
