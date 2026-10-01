import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Student, Grade, AttendanceRecord, FeeRecord, User, ParentStudentLink, Parent
from dependencies import get_current_user, require_parent

router = APIRouter(prefix="/parent", tags=["Parent"])


def get_linked_students(parent_user: User, db: Session) -> List[Student]:
    parent = db.query(Parent).filter(Parent.user_id == parent_user.id).first()
    if not parent:
        return []
    links = db.query(ParentStudentLink).filter(ParentStudentLink.parent_id == parent.id).all()
    return [link.student for link in links]


@router.get("/children")
def get_children(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent)
):
    students = get_linked_students(current_user, db)
    return [
        {
            "id": str(s.id),
            "roll_number": s.roll_number,
            "full_name": s.full_name,
            "semester": s.semester,
            "cgpa": s.cgpa,
            "course": s.course.name if s.course else None
        }
        for s in students
    ]


@router.get("/child/{student_id}/attendance")
def child_attendance(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent)
):
    records = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == student_id
    ).order_by(AttendanceRecord.date.desc()).limit(30).all()

    return [
        {
            "date": r.date.isoformat(),
            "subject_id": str(r.subject_id),
            "status": r.status,
            "method": r.method
        }
        for r in records
    ]


@router.get("/child/{student_id}/results")
def child_results(
    student_id: uuid.UUID,
    semester: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent)
):
    query = db.query(Grade).filter(Grade.student_id == student_id)
    if semester:
        query = query.filter(Grade.semester == semester)
    grades = query.all()

    return [
        {
            "subject_id": str(g.subject_id),
            "marks": g.marks,
            "max_marks": g.max_marks,
            "grade": g.grade,
            "exam_type": g.exam_type,
            "semester": g.semester
        }
        for g in grades
    ]


@router.get("/child/{student_id}/fees")
def child_fees(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent)
):
    fees = db.query(FeeRecord).filter(FeeRecord.student_id == student_id).all()
    return [
        {
            "id": str(f.id),
            "fee_type": f.fee_type,
            "amount": float(f.amount),
            "paid": f.paid,
            "due_date": f.due_date.isoformat() if f.due_date else None,
            "paid_at": f.paid_at.isoformat() if f.paid_at else None
        }
        for f in fees
    ]
