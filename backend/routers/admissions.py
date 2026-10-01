import uuid
import random
import string
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import (
    AdmissionApplication, ApplicationStatusEnum, Course,
    User, Student, RoleEnum
)
from schemas import AdmissionApplyRequest, AdmissionOut, AdmissionApproveRequest
from dependencies import get_current_user, require_admin, hash_password

router = APIRouter(prefix="/admissions", tags=["Admissions"])


def generate_application_id() -> str:
    return "ADM" + "".join(random.choices(string.digits, k=6))


def generate_credentials(full_name: str) -> tuple[str, str]:
    """Generate username and temporary password for approved student."""
    name_part = full_name.split()[0].lower()[:6]
    num_part = "".join(random.choices(string.digits, k=4))
    username = f"{name_part}{num_part}"
    password = "".join(random.choices(string.ascii_letters + string.digits, k=10))
    return username, password


@router.post("/apply", response_model=AdmissionOut, status_code=201)
def apply_for_admission(
    payload: AdmissionApplyRequest,
    db: Session = Depends(get_db)
):
    """Submit a new admission application (public endpoint)."""
    # Validate course
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    application = AdmissionApplication(
        application_id=generate_application_id(),
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        dob=payload.dob,
        gender=payload.gender,
        address=payload.address,
        father_name=payload.father_name,
        mother_name=payload.mother_name,
        category=payload.category,
        course_id=payload.course_id,
        status=ApplicationStatusEnum.submitted,
        submitted_at=datetime.utcnow()
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/", response_model=List[AdmissionOut])
def list_applications(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: list all admission applications."""
    query = db.query(AdmissionApplication).options(joinedload(AdmissionApplication.course))
    if status_filter:
        query = query.filter(AdmissionApplication.status == status_filter)
    return query.order_by(AdmissionApplication.created_at.desc()).all()


@router.get("/{app_id}", response_model=AdmissionOut)
def get_application(
    app_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(AdmissionApplication).options(
        joinedload(AdmissionApplication.course)
    ).filter(AdmissionApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.post("/{app_id}/approve")
def approve_application(
    app_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: approve application and auto-create student user account."""
    app = db.query(AdmissionApplication).filter(AdmissionApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.status == ApplicationStatusEnum.approved:
        raise HTTPException(status_code=400, detail="Already approved")

    # Generate credentials
    username, password = generate_credentials(app.full_name)

    # Create user account
    new_user = User(
        username=username,
        email=app.email,
        password_hash=hash_password(password),
        role=RoleEnum.student,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Generate roll number
    roll_number = f"STU{datetime.utcnow().year}{random.randint(1000, 9999)}"

    # Create student profile
    student = Student(
        user_id=new_user.id,
        roll_number=roll_number,
        full_name=app.full_name,
        dob=app.dob,
        phone=app.phone,
        address=app.address,
        gender=app.gender,
        course_id=app.course_id,
        semester=1,
        admission_id=app.id
    )
    db.add(student)

    # Update application
    app.status = ApplicationStatusEnum.approved
    app.reviewed_by = admin.id
    app.reviewed_at = datetime.utcnow()
    app.generated_username = username
    app.generated_password = password  # In production: send via email, don't store plain

    db.commit()
    return {
        "message": "Application approved",
        "student_credentials": {
            "username": username,
            "password": password,
            "roll_number": roll_number
        }
    }


@router.post("/{app_id}/reject")
def reject_application(
    app_id: uuid.UUID,
    payload: AdmissionApproveRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: reject application."""
    app = db.query(AdmissionApplication).filter(AdmissionApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = ApplicationStatusEnum.rejected
    app.reviewed_by = admin.id
    app.reviewed_at = datetime.utcnow()
    app.rejection_reason = payload.rejection_reason
    db.commit()
    return {"message": "Application rejected"}


@router.post("/{app_id}/pay")
def mark_fee_paid(
    app_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Mock: mark application fee as paid."""
    app = db.query(AdmissionApplication).filter(AdmissionApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.application_fee_paid = True
    db.commit()
    return {"message": "Application fee marked as paid", "application_id": app.application_id}
