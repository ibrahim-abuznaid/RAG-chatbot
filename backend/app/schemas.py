from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional, Dict, Any

class UserBase(BaseModel):
    email: EmailStr
    username: str
    region: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: str
    email: str

# RAG components
class Source(BaseModel):
    page_number: int
    section: str
    content: str

class AIResponseMetadata(BaseModel):
    confidence: float
    response_type: str
    sources: List[Source] = []

# Message types
class MessageBase(BaseModel):
    content: str
    sender: str
    chatSessionId: str

class MessageCreate(MessageBase):
    id: str
    timestamp: datetime

class AIMessageResponse(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: datetime
    chatSessionId: str
    metadata: Optional[AIResponseMetadata] = None

class Message(MessageBase):
    id: str
    timestamp: datetime
    aiResponse: Optional[AIMessageResponse] = None

    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    title: str
    userId: str
    lastMessage: str = ""

class ChatSessionCreate(ChatSessionBase):
    id: str

class ChatSession(ChatSessionBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class ChatHistory(BaseModel):
    session: ChatSession
    messages: List[Message]

    class Config:
        from_attributes = True

# Add RAG query schema
class RAGQuery(BaseModel):
    query: str
    chatSessionId: Optional[str] = None

class RAGMetadata(BaseModel):
    originalQuery: str
    refinedQuery: str
    confidence: float
    responseType: str
    sources: List[Source]

class RAGResponse(BaseModel):
    response: str
    metadata: RAGMetadata 