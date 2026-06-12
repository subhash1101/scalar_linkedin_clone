from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageCreate(BaseModel):
    content: Optional[str] = None
    recipient_id: Optional[int] = None
    conversation_id: Optional[int] = None


class SenderBrief(BaseModel):
    id: int
    username: str
    profile: Optional[dict] = None

    class Config:
        from_attributes = True


class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None
    is_deleted: bool
    created_at: datetime
    sender: Optional[SenderBrief] = None
    is_read: bool = False

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: int
    created_at: datetime
    members: List[SenderBrief] = []
    last_message: Optional[MessageOut] = None
    unread_count: int = 0

    class Config:
        from_attributes = True
