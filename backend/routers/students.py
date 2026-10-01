import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Student, User
from schemas import StudentOut, StudentUpdate
from dependencies import get_current_user, require_admin, require_faculty

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/me", response_model=StudentOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).options(
        joinedload(Student.course)
    ).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


@router.put("/me", response_model=StudentOut)
def update_my_profile(
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    for field, value in payload.dict(exclude_none=True).items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    return student


@router.get("/", response_model=List[StudentOut])
def list_students(
    course_id: uuid.UUID = None,
    semester: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    query = db.query(Student).options(joinedload(Student.course))
    if course_id:
        query = query.filter(Student.course_id == course_id)
    if semester:
        query = query.filter(Student.semester == semester)
    return query.all()


@router.get("/{student_id}", response_model=StudentOut)
def get_student(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).options(
        joinedload(Student.course)
    ).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
