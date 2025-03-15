from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
from passlib.hash import bcrypt

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    region = Column(String, nullable=False)  # For region-specific document access
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

    def verify_password(self, password: str) -> bool:
        return bcrypt.verify(password, self.hashed_password)

    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hash(password)

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    last_message = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    messages = relationship("Message", back_populates="chat_session", cascade="all, delete-orphan")
    user = relationship("User", back_populates="chat_sessions")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True)
    content = Column(String, nullable=False)
    sender = Column(String, nullable=False)  # 'user' or 'assistant'
    timestamp = Column(DateTime, server_default=func.now())
    chat_session_id = Column(String, ForeignKey("chat_sessions.id", ondelete="CASCADE"))

    chat_session = relationship("ChatSession", back_populates="messages") 