import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Grievance, Student, User, GrievanceStatusEnum, Notification, NotificationTypeEnum
from schemas import GrievanceCreate, GrievanceUpdate, GrievanceOut
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/grievances", tags=["Grievances"])


def _send_notification(db: Session, user_id, title: str, message: str, ntype=NotificationTypeEnum.grievance_update):
    notif = Notification(user_id=user_id, title=title, message=message, notif_type=ntype)
    db.add(notif)


@router.post("/", response_model=GrievanceOut)
def submit_grievance(
    payload: GrievanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Student submits a grievance."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    grievance = Grievance(
        student_id=student.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        priority=payload.priority or "medium"
    )
    db.add(grievance)
    db.flush()

    # Notify admins — find all admin users
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        _send_notification(db, admin.id,
            f"New Grievance: {payload.title}",
            f"Student {student.full_name} submitted a {payload.category} grievance (Priority: {payload.priority})")

    db.commit()
    db.refresh(grievance)
    return grievance


@router.get("/my", response_model=List[GrievanceOut])
def my_grievances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all grievances submitted by current student."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return db.query(Grievance).filter(Grievance.student_id == student.id)\
               .order_by(Grievance.created_at.desc()).all()


@router.get("/all", response_model=List[GrievanceOut])
def all_grievances(
    status: str = None,
    category: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: get all grievances with optional filters."""
    query = db.query(Grievance)
    if status:
        query = query.filter(Grievance.status == status)
    if category:
        query = query.filter(Grievance.category == category)
    return query.order_by(Grievance.created_at.desc()).all()


@router.get("/{grievance_id}", response_model=GrievanceOut)
def get_grievance(
    grievance_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    g = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return g


@router.patch("/{grievance_id}", response_model=GrievanceOut)
def update_grievance(
    grievance_id: uuid.UUID,
    payload: GrievanceUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: update grievance status / add response."""
    g = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")

    if payload.status:
        g.status = payload.status
        if payload.status == GrievanceStatusEnum.resolved:
            g.resolved_at = datetime.utcnow()
    if payload.response:
        g.response = payload.response
        g.responded_by = admin.id
    if payload.assigned_to:
        g.assigned_to = payload.assigned_to

    g.updated_at = datetime.utcnow()

    # Notify student
    student_user = g.student.user if g.student else None
    if student_user:
        _send_notification(db, student_user.id,
            f"Grievance Update: {g.title}",
            f"Your grievance status changed to '{g.status}'" + (f". Response: {g.response}" if g.response else ""))

    db.commit()
    db.refresh(g)
    return g


@router.get("/stats/summary")
def grievance_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin dashboard grievance KPIs."""
    total = db.query(Grievance).count()
    open_count = db.query(Grievance).filter(Grievance.status == "open").count()
    in_progress = db.query(Grievance).filter(Grievance.status == "in_progress").count()
    resolved = db.query(Grievance).filter(Grievance.status == "resolved").count()

    by_category = {}
    for g in db.query(Grievance).all():
        cat = str(g.category)
        by_category[cat] = by_category.get(cat, 0) + 1

    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "resolved": resolved,
        "by_category": by_category
    }
