from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.deps import get_db
from datetime import datetime
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.user import UserLogin
from app.core.security import hash_password
from app.core.security import verify_password
from app.core.jwt import create_access_token
from app.models.organization import Organization
from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.core.jwt import (
    create_access_token,
    create_refresh_token
)
from app.core.jwt import verify_token, create_access_token
router = APIRouter()

@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    # Check existing email
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        return {
            "error": "Email already exists"
        }

    # Create organization first
    new_org = Organization(
        name=user.organization_name,
        email=user.email,
        phone=user.phone
    )

    db.add(new_org)
    db.commit()
    db.refresh(new_org)

    # Hash password
    hashed = hash_password(user.password)

    # Create admin user
    new_user = User(
        email=user.email,
        password_hash=hashed,
        full_name=user.full_name,
        phone=user.phone,
        license_number=user.license_number,
        organization_id=new_org.organization_id,
        role="admin",
        status="active"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Organization and admin created successfully",
        "organization_id": new_org.organization_id,
        "user_id": new_user.user_id
    }

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        return {"error": "User not found"}

    if not verify_password(
        user.password,
        db_user.password_hash
    ):
        return {"error": "Invalid password"}

    # Track login event
    db_user.last_login = datetime.utcnow()
    db.commit()

    access_token = create_access_token({
        "sub": db_user.email,
        "role": db_user.role
    })

    refresh_token = create_refresh_token({
        "sub": db_user.email
    })

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
def refresh_token(refresh_token: str):
    
    payload = verify_token(refresh_token)

    if not payload:
        return {
            "error": "Invalid refresh token"
        }

    new_access_token = create_access_token({
        "sub": payload["sub"]
    })

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
def logout():
    return {
        "message": "Logged out successfully"
    }