import uuid
import random
import string
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Examination, HallTicket, Student, User, Subject, Notification, NotificationTypeEnum
from schemas import ExaminationCreate, ExaminationOut, HallTicketOut
from dependencies import get_current_user, require_admin, require_faculty

router = APIRouter(prefix="/examinations", tags=["Examinations"])


def _notify(db, user_id, title, message, ntype=NotificationTypeEnum.exam_scheduled):
    db.add(Notification(user_id=user_id, title=title, message=message, notif_type=ntype))


@router.post("/", response_model=ExaminationOut)
def create_examination(
    payload: ExaminationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin/Faculty: schedule an examination."""
    subject = db.query(Subject).filter(Subject.id == payload.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    exam = Examination(
        title=payload.title,
        subject_id=payload.subject_id,
        exam_type=payload.exam_type,
        semester=payload.semester,
        exam_date=payload.exam_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        venue=payload.venue,
        total_marks=payload.total_marks,
        instructions=payload.instructions,
        created_by=admin.id
    )
    db.add(exam)
    db.flush()

    # Auto-generate hall tickets for all students in that semester
    students = db.query(Student).filter(Student.semester == payload.semester).all()
    halls = ["A", "B", "C", "D"]
    for idx, student in enumerate(students):
        seat = f"{halls[idx % 4]}{(idx // 4) + 1:02d}"
        hall = f"Hall {halls[idx % 4]}"
        ht = HallTicket(
            student_id=student.id,
            examination_id=exam.id,
            seat_number=seat,
            hall_number=hall
        )
        db.add(ht)
        # Notify student
        _notify(db, student.user_id,
            f"Exam Scheduled: {payload.title}",
            f"Your exam is on {payload.exam_date} at {payload.start_time} in {hall}, Seat {seat}")

    db.commit()
    db.refresh(exam)
    return exam


@router.get("/", response_model=List[ExaminationOut])
def list_examinations(
    semester: Optional[int] = Query(None),
    exam_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Examination)
    if semester:
        query = query.filter(Examination.semester == semester)
    if exam_type:
        query = query.filter(Examination.exam_type == exam_type)
    return query.order_by(Examination.exam_date.asc()).all()


@router.get("/upcoming")
def upcoming_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exams scheduled from today onwards."""
    today = date.today()
    exams = db.query(Examination).filter(Examination.exam_date >= today)\
              .order_by(Examination.exam_date.asc()).limit(10).all()

    result = []
    for e in exams:
        result.append({
            "id": str(e.id),
            "title": e.title,
            "exam_type": str(e.exam_type),
            "semester": e.semester,
            "exam_date": str(e.exam_date),
            "start_time": e.start_time,
            "end_time": e.end_time,
            "venue": e.venue,
            "total_marks": e.total_marks,
            "status": str(e.status)
        })
    return result


@router.get("/my-hall-ticket")
def my_hall_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Student: get all their hall tickets with exam info."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    tickets = db.query(HallTicket).filter(HallTicket.student_id == student.id).all()

    result = []
    for t in tickets:
        exam = t.examination
        result.append({
            "hall_ticket_id": str(t.id),
            "seat_number": t.seat_number,
            "hall_number": t.hall_number,
            "is_valid": t.is_valid,
            "issued_at": t.issued_at.isoformat(),
            "exam": {
                "id": str(exam.id),
                "title": exam.title,
                "exam_type": str(exam.exam_type),
                "exam_date": str(exam.exam_date),
                "start_time": exam.start_time,
                "end_time": exam.end_time,
                "venue": exam.venue,
                "total_marks": exam.total_marks
            }
        })
    return result


@router.patch("/{exam_id}/status")
def update_exam_status(
    exam_id: uuid.UUID,
    status: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    exam = db.query(Examination).filter(Examination.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Examination not found")
    exam.status = status
    db.commit()
    return {"message": f"Exam status updated to {status}"}


@router.get("/{exam_id}/hall-tickets")
def exam_hall_tickets(
    exam_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: list all hall tickets for an exam."""
    tickets = db.query(HallTicket).filter(HallTicket.examination_id == exam_id).all()
    result = []
    for t in tickets:
        result.append({
            "hall_ticket_id": str(t.id),
            "student_name": t.student.full_name,
            "roll_number": t.student.roll_number,
            "seat_number": t.seat_number,
            "hall_number": t.hall_number,
            "is_valid": t.is_valid
        })
    return result
