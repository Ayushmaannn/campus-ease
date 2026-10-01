import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Student, Grade, AttendanceRecord, FeeRecord, AdmissionApplication, Faculty, User, AttendanceStatusEnum
from dependencies import get_current_user, require_admin, require_faculty

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/student/{student_id}/performance")
def student_performance(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return semester-wise CGPA trend and attendance data."""
    grades_by_semester = {}
    grades = db.query(Grade).filter(Grade.student_id == student_id).all()

    grade_points = {"O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "F": 0}

    for g in grades:
        sem = g.semester
        if sem not in grades_by_semester:
            grades_by_semester[sem] = []
        grades_by_semester[sem].append(grade_points.get(g.grade, 0))

    trend = []
    for sem in sorted(grades_by_semester.keys()):
        pts = grades_by_semester[sem]
        sgpa = sum(pts) / len(pts) if pts else 0.0

        # Attendance for that semester (approximate by date range)
        att = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == student_id
        ).all()
        total = len(att)
        present = sum(1 for a in att if a.status == AttendanceStatusEnum.present)
        att_pct = (present / total * 100) if total > 0 else 0.0

        trend.append({
            "semester": sem,
            "sgpa": round(sgpa, 2),
            "attendance_pct": round(att_pct, 2)
        })

    return {"student_id": str(student_id), "trend": trend}


@router.get("/student/{student_id}/risk")
def student_risk(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Simple rule-based risk assessment using attendance + grades."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Attendance %
    att = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == student_id).all()
    total = len(att)
    present = sum(1 for a in att if a.status == AttendanceStatusEnum.present)
    att_pct = (present / total * 100) if total > 0 else 75.0

    # CGPA
    cgpa = student.cgpa or 0.0

    # Unpaid fees
    unpaid = db.query(FeeRecord).filter(
        FeeRecord.student_id == student_id,
        FeeRecord.paid == False
    ).count()

    risk_score = 0.0
    factors = []

    if att_pct < 60:
        risk_score += 40
        factors.append(f"Very low attendance ({att_pct:.1f}%)")
    elif att_pct < 75:
        risk_score += 20
        factors.append(f"Low attendance ({att_pct:.1f}%)")

    if cgpa < 5.0:
        risk_score += 40
        factors.append(f"Low CGPA ({cgpa:.1f})")
    elif cgpa < 7.0:
        risk_score += 15
        factors.append(f"Below average CGPA ({cgpa:.1f})")

    if unpaid > 2:
        risk_score += 20
        factors.append(f"{unpaid} unpaid fee records")

    risk_level = "low" if risk_score < 30 else "medium" if risk_score < 60 else "high"

    return {
        "student_id": str(student_id),
        "student_name": student.full_name,
        "risk_level": risk_level,
        "risk_score": round(risk_score, 2),
        "factors": factors,
        "attendance_pct": round(att_pct, 2),
        "cgpa": cgpa
    }


@router.get("/admin/overview")
def admin_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin dashboard KPIs."""
    total_students = db.query(Student).count()
    total_faculty = db.query(Faculty).count()
    pending_admissions = db.query(AdmissionApplication).filter(
        AdmissionApplication.status == "submitted"
    ).count()

    total_revenue = db.query(func.sum(FeeRecord.amount)).filter(
        FeeRecord.paid == True
    ).scalar() or 0.0

    att_records = db.query(AttendanceRecord).all()
    total_att = len(att_records)
    present_att = sum(1 for a in att_records if a.status == AttendanceStatusEnum.present)
    att_avg = (present_att / total_att * 100) if total_att > 0 else 0.0

    return {
        "total_students": total_students,
        "total_faculty": total_faculty,
        "pending_admissions": pending_admissions,
        "total_revenue": float(total_revenue),
        "attendance_avg": round(att_avg, 2)
    }


@router.get("/faculty/{faculty_id}/class")
def class_performance(
    faculty_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """Faculty: aggregate class performance per subject."""
    grades = db.query(Grade).filter(Grade.faculty_id == faculty_id).all()

    by_subject = {}
    for g in grades:
        sid = str(g.subject_id)
        if sid not in by_subject:
            by_subject[sid] = {"marks": [], "subject_id": sid}
        by_subject[sid]["marks"].append(g.marks / g.max_marks * 100)

    result = []
    for sid, data in by_subject.items():
        marks = data["marks"]
        result.append({
            "subject_id": sid,
            "avg_score": round(sum(marks) / len(marks), 2),
            "max_score": round(max(marks), 2),
            "min_score": round(min(marks), 2),
            "pass_rate": round(sum(1 for m in marks if m >= 40) / len(marks) * 100, 2),
            "student_count": len(marks)
        })

    return result
