import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import (
    User, Student, Faculty, Parent, AdmissionApplication,
    Course, FeeRecord, AttendanceRecord, RoleEnum
)
from dependencies import get_current_user, require_admin, hash_password

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return {
        "students": db.query(Student).count(),
        "faculty": db.query(Faculty).count(),
        "courses": db.query(Course).count(),
        "pending_admissions": db.query(AdmissionApplication).filter(
            AdmissionApplication.status == "submitted"
        ).count(),
    }


@router.get("/users")
def list_users(
    role: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.all()
    return [
        {"id": str(u.id), "username": u.username, "email": u.email, "role": u.role, "is_active": u.is_active}
        for u in users
    ]


@router.post("/users/create-faculty", status_code=201)
def create_faculty_account(
    full_name: str,
    username: str,
    email: str,
    password: str,
    employee_id: str,
    designation: str = "Lecturer",
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role=RoleEnum.faculty,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    new_faculty = Faculty(
        user_id=new_user.id,
        full_name=full_name,
        employee_id=employee_id,
        designation=designation
    )
    db.add(new_faculty)
    db.commit()
    return {"message": "Faculty account created", "username": username}


@router.patch("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}", "is_active": user.is_active}
