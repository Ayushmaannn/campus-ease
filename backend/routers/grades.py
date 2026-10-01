import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Grade, Student, User
from schemas import GradeCreateRequest, GradeOut
from dependencies import get_current_user, require_faculty

router = APIRouter(prefix="/grades", tags=["Grades"])


def calculate_grade(marks: float, max_marks: float) -> str:
    pct = (marks / max_marks) * 100
    if pct >= 90: return "O"
    if pct >= 80: return "A+"
    if pct >= 70: return "A"
    if pct >= 60: return "B+"
    if pct >= 50: return "B"
    if pct >= 40: return "C"
    return "F"


@router.post("/", response_model=GradeOut, status_code=201)
def create_grade(
    payload: GradeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    grade_letter = calculate_grade(payload.marks, payload.max_marks)
    grade = Grade(
        student_id=payload.student_id,
        subject_id=payload.subject_id,
        exam_type=payload.exam_type,
        marks=payload.marks,
        max_marks=payload.max_marks,
        grade=grade_letter,
        semester=payload.semester
    )
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


@router.put("/{grade_id}", response_model=GradeOut)
def update_grade(
    grade_id: uuid.UUID,
    payload: GradeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    grade.marks = payload.marks
    grade.max_marks = payload.max_marks
    grade.grade = calculate_grade(payload.marks, payload.max_marks)
    grade.exam_type = payload.exam_type
    grade.semester = payload.semester
    db.commit()
    db.refresh(grade)
    return grade


@router.get("/student/{student_id}", response_model=List[GradeOut])
def get_student_grades(
    student_id: uuid.UUID,
    semester: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Grade).filter(Grade.student_id == student_id)
    if semester:
        query = query.filter(Grade.semester == semester)
    return query.all()


@router.get("/result/{student_id}")
def get_result(
    student_id: uuid.UUID,
    semester: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return semester result with SGPA calculation."""
    grades = db.query(Grade).filter(
        Grade.student_id == student_id,
        Grade.semester == semester
    ).all()

    if not grades:
        return {"semester": semester, "grades": [], "sgpa": 0.0}

    grade_points = {"O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "F": 0}
    total_points = sum(grade_points.get(g.grade, 0) for g in grades)
    sgpa = total_points / len(grades) if grades else 0.0

    return {
        "semester": semester,
        "grades": [
            {
                "id": str(g.id),
                "subject_id": str(g.subject_id),
                "exam_type": g.exam_type,
                "marks": g.marks,
                "max_marks": g.max_marks,
                "grade": g.grade
            }
            for g in grades
        ],
        "sgpa": round(sgpa, 2)
    }
