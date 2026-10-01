import uuid
import random
import string
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import FeeRecord, Student, FeeTypeEnum, User
from schemas import FeeRecordOut, PayFeeRequest
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/fees", tags=["Fees"])


def generate_payment_ref() -> str:
    return "PAY" + "".join(random.choices(string.ascii_uppercase + string.digits, k=10))


@router.get("/student/{student_id}", response_model=List[FeeRecordOut])
def get_student_fees(
    student_id: uuid.UUID,
    fee_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FeeRecord).filter(FeeRecord.student_id == student_id)
    if fee_type:
        query = query.filter(FeeRecord.fee_type == fee_type)
    return query.order_by(FeeRecord.created_at.desc()).all()


@router.post("/pay")
def pay_fee(
    payload: PayFeeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mock payment — flips paid=True and generates a payment reference."""
    fee = db.query(FeeRecord).filter(FeeRecord.id == payload.fee_record_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")
    if fee.paid:
        raise HTTPException(status_code=400, detail="Fee already paid")

    fee.paid = True
    fee.paid_at = datetime.utcnow()
    fee.payment_ref = generate_payment_ref()
    db.commit()
    db.refresh(fee)

    return {
        "message": "Payment successful",
        "payment_ref": fee.payment_ref,
        "amount": float(fee.amount),
        "paid_at": fee.paid_at.isoformat()
    }


@router.get("/history/{student_id}")
def get_payment_history(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    paid_fees = db.query(FeeRecord).filter(
        FeeRecord.student_id == student_id,
        FeeRecord.paid == True
    ).order_by(FeeRecord.paid_at.desc()).all()

    return [
        {
            "id": str(f.id),
            "fee_type": f.fee_type,
            "amount": float(f.amount),
            "payment_ref": f.payment_ref,
            "paid_at": f.paid_at.isoformat() if f.paid_at else None,
            "description": f.description,
            "semester": f.semester
        }
        for f in paid_fees
    ]


@router.post("/create", status_code=201)
def create_fee_record(
    student_id: uuid.UUID,
    fee_type: str,
    amount: float,
    semester: int = None,
    description: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: create a fee record for a student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    fee = FeeRecord(
        student_id=student_id,
        fee_type=fee_type,
        amount=amount,
        semester=semester,
        description=description
    )
    db.add(fee)
    db.commit()
    db.refresh(fee)
    return {"message": "Fee record created", "id": str(fee.id)}
