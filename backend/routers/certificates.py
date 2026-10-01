import uuid
import hashlib
import os
import io
import base64
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import BlockchainCertificate, Student, User
from schemas import CertificateGenerateRequest, CertificateOut
from dependencies import get_current_user, require_admin
from config import settings
import qrcode

router = APIRouter(prefix="/certificates", tags=["Certificates"])


def generate_qr_hash(student_id: str, cert_type: str) -> str:
    raw = f"{student_id}:{cert_type}:{datetime.utcnow().isoformat()}"
    return hashlib.sha256(raw.encode()).hexdigest()


@router.post("/generate", response_model=CertificateOut, status_code=201)
def generate_certificate(
    payload: CertificateGenerateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    qr_hash = generate_qr_hash(str(payload.student_id), payload.cert_type)

    # Save QR image
    qr_dir = os.path.join(settings.UPLOAD_DIR, "certificates")
    os.makedirs(qr_dir, exist_ok=True)
    qr_path = os.path.join(qr_dir, f"{qr_hash}.png")

    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(f"/api/v1/certificates/verify/{qr_hash}")
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(qr_path)

    cert = BlockchainCertificate(
        student_id=payload.student_id,
        cert_type=payload.cert_type,
        issued_by=admin.id,
        qr_hash=qr_hash,
        qr_image_path=qr_path
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.get("/verify/{qr_hash}")
def verify_certificate(qr_hash: str, db: Session = Depends(get_db)):
    """Public endpoint — scan QR to verify certificate authenticity."""
    cert = db.query(BlockchainCertificate).filter(
        BlockchainCertificate.qr_hash == qr_hash
    ).first()
    if not cert:
        return {"valid": False, "message": "Certificate not found or invalid"}

    student = db.query(Student).filter(Student.id == cert.student_id).first()
    return {
        "valid": cert.is_valid,
        "cert_type": cert.cert_type,
        "student_name": student.full_name if student else "Unknown",
        "roll_number": student.roll_number if student else "Unknown",
        "issued_at": cert.issued_at.isoformat(),
        "qr_hash": qr_hash
    }


@router.get("/student/{student_id}", response_model=List[CertificateOut])
def get_student_certificates(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(BlockchainCertificate).filter(
        BlockchainCertificate.student_id == student_id
    ).all()
