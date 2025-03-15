from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, auth
from .database import engine, get_db
from typing import List, Dict, Any
from datetime import datetime
import uuid

# Import our RAG module
from . import rag

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth endpoints
@app.post("/api/auth/register", response_model=schemas.UserResponse)
async def register(
    user: schemas.UserCreate,
    response: Response,
    db: Session = Depends(get_db)
):
    # Check if email already exists
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    db_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        username=user.username,
        region=user.region,
        hashed_password=models.User.hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create and set access token cookie
    access_token = auth.create_access_token(
        data={"sub": db_user.id, "email": db_user.email}
    )
    auth.set_auth_cookie(response, access_token)
    
    return db_user

@app.post("/api/auth/login")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    # Set the cookie
    auth.set_auth_cookie(response, access_token)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "region": user.region
        }
    }

@app.post("/api/auth/logout")
async def logout(response: Response):
    auth.clear_auth_cookie(response)
    return {"message": "Successfully logged out"}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
async def get_current_user_info(
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user

# Protected chat endpoints
@app.get("/api/chat-sessions", response_model=List[schemas.ChatSession])
async def get_chat_sessions(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(models.ChatSession).filter(
        models.ChatSession.user_id == current_user.id
    ).order_by(models.ChatSession.updated_at.desc()).all()
    
    return [{
        "id": session.id,
        "title": session.title,
        "userId": session.user_id,
        "lastMessage": session.last_message or "",
        "createdAt": session.created_at,
        "updatedAt": session.updated_at
    } for session in sessions]

@app.get("/api/messages", response_model=List[schemas.Message])
async def get_messages(
    chat_session_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verify the chat session belongs to the current user
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == chat_session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    messages = db.query(models.Message).filter(
        models.Message.chat_session_id == chat_session_id
    ).order_by(models.Message.timestamp.asc()).all()
    
    return [{
        "id": message.id,
        "content": message.content,
        "sender": message.sender,
        "timestamp": message.timestamp,
        "chatSessionId": message.chat_session_id
    } for message in messages]

@app.post("/api/chat-sessions", response_model=schemas.ChatSession)
async def create_chat_session(
    session: schemas.ChatSessionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verify the user is creating a session for themselves
    if session.userId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create chat session for another user"
        )
    
    db_session = models.ChatSession(
        id=session.id,
        title=session.title,
        user_id=session.userId,
        last_message=session.lastMessage
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    return {
        "id": db_session.id,
        "title": db_session.title,
        "userId": db_session.user_id,
        "lastMessage": db_session.last_message or "",
        "createdAt": db_session.created_at,
        "updatedAt": db_session.updated_at
    }

@app.post("/api/messages", response_model=schemas.Message)
async def create_message(
    message: schemas.MessageCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verify the chat session belongs to the current user
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == message.chatSessionId,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    db_message = models.Message(
        id=message.id,
        content=message.content,
        sender=message.sender,
        chat_session_id=message.chatSessionId,
        timestamp=message.timestamp
    )
    db.add(db_message)
    
    # Update the chat session's last message and updated_at
    session.last_message = message.content
    session.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_message)
    
    # If the message is from the user, generate an AI response using RAG
    if message.sender == "user":
        try:
            # Get conversation history for this session
            conversation_history = []
            history_messages = db.query(models.Message).filter(
                models.Message.chat_session_id == message.chatSessionId
            ).order_by(models.Message.timestamp.asc()).all()
            
            for msg in history_messages:
                conversation_history.append({
                    "role": msg.sender,
                    "content": msg.content
                })
            
            # Process the query with our RAG system
            rag_response = rag.process_query(
                user_query=message.content,
                user_region=current_user.region,
                conversation_history=conversation_history
            )
            
            # Create AI response message
            ai_message_id = str(uuid.uuid4())
            ai_message = models.Message(
                id=ai_message_id,
                content=rag_response["response"],
                sender="assistant",
                chat_session_id=message.chatSessionId,
                timestamp=datetime.utcnow()
            )
            db.add(ai_message)
            
            # Update session again with AI's message
            session.last_message = rag_response["response"]
            session.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(ai_message)
            
            # Also return the AI message in the response
            return {
                "id": db_message.id,
                "content": db_message.content,
                "sender": db_message.sender,
                "timestamp": db_message.timestamp,
                "chatSessionId": db_message.chat_session_id,
                "aiResponse": {
                    "id": ai_message.id,
                    "content": ai_message.content,
                    "sender": ai_message.sender,
                    "timestamp": ai_message.timestamp,
                    "chatSessionId": ai_message.chat_session_id,
                    "metadata": {
                        "confidence": rag_response["confidence"],
                        "response_type": rag_response["response_type"],
                        "sources": rag_response["sources"]
                    }
                }
            }
        except Exception as e:
            # If RAG fails, don't stop the user's message from being saved
            print(f"Error generating AI response: {str(e)}")
            pass
    
    return {
        "id": db_message.id,
        "content": db_message.content,
        "sender": db_message.sender,
        "timestamp": db_message.timestamp,
        "chatSessionId": db_message.chat_session_id
    }

@app.patch("/api/chat-sessions/{session_id}")
async def update_chat_session_title(
    session_id: str,
    title: dict,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    session.title = title["title"]
    session.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "success"}

@app.delete("/api/chat-sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    db.delete(session)
    db.commit()
    return {"status": "success"}

# Add a direct RAG API endpoint for testing
@app.post("/api/rag-query")
async def rag_query(
    query: schemas.RAGQuery,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get conversation history if a chat session is provided
        conversation_history = []
        
        if query.chatSessionId:
            # First verify this session belongs to the user
            session = db.query(models.ChatSession).filter(
                models.ChatSession.id == query.chatSessionId,
                models.ChatSession.user_id == current_user.id
            ).first()
            
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Chat session not found"
                )
            
            # Get conversation history
            history_messages = db.query(models.Message).filter(
                models.Message.chat_session_id == query.chatSessionId
            ).order_by(models.Message.timestamp.asc()).all()
            
            for msg in history_messages:
                conversation_history.append({
                    "role": msg.sender,
                    "content": msg.content
                })
        
        # Process the query
        rag_response = rag.process_query(
            user_query=query.query,
            user_region=current_user.region,
            conversation_history=conversation_history
        )
        
        return {
            "response": rag_response["response"],
            "metadata": {
                "originalQuery": rag_response["original_query"],
                "refinedQuery": rag_response["refined_query"],
                "confidence": rag_response["confidence"],
                "responseType": rag_response["response_type"],
                "sources": rag_response["sources"]
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing RAG query: {str(e)}"
        ) 