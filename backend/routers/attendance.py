import uuid
from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from models import AttendanceRecord, Student, Subject, AttendanceStatusEnum, AttendanceMethodEnum, User, Faculty
from schemas import MarkAttendanceRequest, AttendanceOut, AttendanceSummary
from dependencies import get_current_user, require_faculty
import qrcode
import io
import base64
import hashlib
import json
import time

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/mark", response_model=AttendanceOut, status_code=201)
def mark_attendance(
    payload: MarkAttendanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()

    # Check for duplicate
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == payload.student_id,
        AttendanceRecord.subject_id == payload.subject_id,
        AttendanceRecord.date == payload.date
    ).first()
    if existing:
        existing.status = payload.status
        db.commit()
        db.refresh(existing)
        return existing

    record = AttendanceRecord(
        student_id=payload.student_id,
        subject_id=payload.subject_id,
        faculty_id=faculty.id if faculty else None,
        date=payload.date,
        status=payload.status,
        method=payload.method
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/qr")
def generate_qr(
    subject_id: uuid.UUID,
    current_user: User = Depends(require_faculty)
):
    """Generate a QR code for a class session (valid for 10 minutes)."""
    token_data = {
        "subject_id": str(subject_id),
        "faculty_id": str(current_user.id),
        "timestamp": time.time(),
        "expires": time.time() + 600  # 10 minutes
    }
    token_str = json.dumps(token_data)
    qr_hash = hashlib.sha256(token_str.encode()).hexdigest()[:16]

    # Generate QR image
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_hash)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode()

    return {
        "qr_hash": qr_hash,
        "qr_image": f"data:image/png;base64,{img_base64}",
        "subject_id": str(subject_id),
        "expires_in": "10 minutes"
    }


@router.get("/student/{student_id}", response_model=List[AttendanceOut])
def get_student_attendance(
    student_id: uuid.UUID,
    subject_id: uuid.UUID = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == student_id)
    if subject_id:
        query = query.filter(AttendanceRecord.subject_id == subject_id)
    return query.order_by(AttendanceRecord.date.desc()).all()


@router.get("/summary/{student_id}", response_model=List[AttendanceSummary])
def get_attendance_summary(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return per-subject attendance percentage for a student."""
    records = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == student_id
    ).all()

    summary = {}
    for r in records:
        sid = str(r.subject_id)
        if sid not in summary:
            subject = db.query(Subject).filter(Subject.id == r.subject_id).first()
            summary[sid] = {
                "subject_id": r.subject_id,
                "subject_name": subject.name if subject else "Unknown",
                "total": 0, "present": 0, "absent": 0
            }
        summary[sid]["total"] += 1
        if r.status == AttendanceStatusEnum.present:
            summary[sid]["present"] += 1
        else:
            summary[sid]["absent"] += 1

    result = []
    for sid, data in summary.items():
        pct = (data["present"] / data["total"] * 100) if data["total"] > 0 else 0
        result.append(AttendanceSummary(
            subject_id=data["subject_id"],
            subject_name=data["subject_name"],
            total_classes=data["total"],
            present=data["present"],
            absent=data["absent"],
            percentage=round(pct, 2)
        ))
    return result
