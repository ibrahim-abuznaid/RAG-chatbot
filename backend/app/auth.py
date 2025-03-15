from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
from fastapi.security import APIKeyCookie

# Change these values in production and store them securely
SECRET_KEY = "your-secret-key-for-jwt"  # In production, use a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

COOKIE_NAME = "access_token"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)
cookie_scheme = APIKeyCookie(name=COOKIE_NAME, auto_error=False)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/"
    )

def verify_token(token: str) -> schemas.TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        if user_id is None or email is None:
            raise credentials_exception
        return schemas.TokenData(user_id=user_id, email=email)
    except JWTError:
        raise credentials_exception

async def get_token_from_cookie_or_header(
    cookie_token: str = Depends(cookie_scheme),
    header_token: str = Depends(oauth2_scheme),
) -> str:
    if cookie_token is not None:
        return cookie_token
    if header_token is not None:
        return header_token
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def get_current_user(
    token: str = Depends(get_token_from_cookie_or_header),
    db: Session = Depends(get_db)
) -> models.User:
    token_data = verify_token(token)
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not user.verify_password(password):
        return None
    return user 