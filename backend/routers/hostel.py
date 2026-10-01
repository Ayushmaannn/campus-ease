import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import HostelRoom, HostelAllocation, Student, User
from schemas import HostelRoomOut, AllocateHostelRequest
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/hostel", tags=["Hostel"])


@router.get("/rooms", response_model=List[HostelRoomOut])
def list_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(HostelRoom).all()


@router.post("/allocate", status_code=201)
def allocate_room(
    payload: AllocateHostelRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    room = db.query(HostelRoom).filter(HostelRoom.id == payload.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if room.occupied >= room.capacity:
        raise HTTPException(status_code=400, detail="Room is at full capacity")

    existing = db.query(HostelAllocation).filter(
        HostelAllocation.student_id == payload.student_id,
        HostelAllocation.is_active == True
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already has an active hostel allocation")

    allocation = HostelAllocation(
        student_id=payload.student_id,
        room_id=payload.room_id
    )
    room.occupied += 1
    student.hostel_allocated = True
    db.add(allocation)
    db.commit()
    return {"message": "Hostel room allocated", "room_number": room.room_number}


@router.get("/student/{student_id}")
def get_student_hostel(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allocation = db.query(HostelAllocation).filter(
        HostelAllocation.student_id == student_id,
        HostelAllocation.is_active == True
    ).first()

    if not allocation:
        return {"allocated": False}

    room = allocation.room
    return {
        "allocated": True,
        "room_number": room.room_number,
        "floor": room.floor,
        "block": room.block,
        "room_type": room.room_type,
        "monthly_fee": float(room.monthly_fee),
        "allocated_at": allocation.allocated_at.isoformat()
    }
