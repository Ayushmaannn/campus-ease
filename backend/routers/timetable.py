import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import TimetableEntry, AcademicEvent, Student, Faculty, Subject, User
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/timetable", tags=["Timetable"])


@router.get("/student/{student_id}")
def student_timetable(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    entries = db.query(TimetableEntry).filter(
        TimetableEntry.semester == student.semester
    ).all()

    return [
        {
            "id": str(e.id),
            "subject": e.subject.name if e.subject else "Unknown",
            "subject_code": e.subject.code if e.subject else "",
            "faculty": e.faculty.full_name if e.faculty else "TBA",
            "day": e.day_of_week,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "room": e.room
        }
        for e in entries
    ]


@router.get("/faculty/{faculty_id}")
def faculty_timetable(
    faculty_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(TimetableEntry).filter(
        TimetableEntry.faculty_id == faculty_id
    ).all()

    return [
        {
            "id": str(e.id),
            "subject": e.subject.name if e.subject else "Unknown",
            "day": e.day_of_week,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "room": e.room,
            "semester": e.semester
        }
        for e in entries
    ]


@router.get("/academic-calendar")
def academic_calendar(
    academic_year: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AcademicEvent)
    if academic_year:
        query = query.filter(AcademicEvent.academic_year == academic_year)
    events = query.order_by(AcademicEvent.event_date).all()

    return [
        {
            "id": str(e.id),
            "title": e.title,
            "description": e.description,
            "date": e.event_date.isoformat(),
            "type": e.event_type,
            "academic_year": e.academic_year
        }
        for e in events
    ]


@router.post("/academic-calendar", status_code=201)
def create_event(
    title: str,
    event_date: str,
    event_type: str = "holiday",
    description: str = None,
    academic_year: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    from datetime import date
    event = AcademicEvent(
        title=title,
        description=description,
        event_date=date.fromisoformat(event_date),
        event_type=event_type,
        academic_year=academic_year
    )
    db.add(event)
    db.commit()
    return {"message": "Event created", "id": str(event.id)}
