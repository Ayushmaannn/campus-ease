import uuid
import json
import random
import string
from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import TransportRoute, BusSchedule, BusPass, Student, User
from schemas import TransportRouteCreate, TransportRouteOut, BusPassOut
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/transport", tags=["Transport"])


def _gen_pass_number():
    return "BP" + "".join(random.choices(string.digits, k=8))


@router.post("/routes", response_model=TransportRouteOut)
def create_route(
    payload: TransportRouteCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    existing = db.query(TransportRoute).filter(TransportRoute.route_number == payload.route_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Route number already exists")

    route = TransportRoute(**payload.model_dump())
    db.add(route)
    db.commit()
    db.refresh(route)
    return route


@router.get("/routes", response_model=List[TransportRouteOut])
def list_routes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(TransportRoute).filter(TransportRoute.is_active == True).all()


@router.get("/routes/{route_id}", response_model=TransportRouteOut)
def get_route(
    route_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    route = db.query(TransportRoute).filter(TransportRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route


@router.get("/routes/{route_id}/schedule")
def route_schedule(
    route_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    route = db.query(TransportRoute).filter(TransportRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    schedules = db.query(BusSchedule).filter(BusSchedule.route_id == route_id).all()
    return {
        "route": {
            "id": str(route.id),
            "route_name": route.route_name,
            "route_number": route.route_number,
            "origin": route.origin,
            "destination": route.destination,
            "stops": json.loads(route.stops) if route.stops else [],
            "vehicle_number": route.vehicle_number,
            "driver_name": route.driver_name,
            "driver_phone": route.driver_phone
        },
        "schedules": [
            {
                "day": s.day_of_week,
                "departure": s.departure_time,
                "arrival": s.arrival_time,
                "direction": s.direction
            } for s in schedules
        ]
    }


@router.post("/passes/issue")
def issue_bus_pass(
    student_id: uuid.UUID,
    route_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: issue a bus pass to a student for a specific route."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    route = db.query(TransportRoute).filter(TransportRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    today = date.today()
    bus_pass = BusPass(
        student_id=student_id,
        route_id=route_id,
        pass_number=_gen_pass_number(),
        valid_from=today,
        valid_until=date(today.year, today.month + 6 if today.month <= 6 else today.month - 6,
                         today.day) if today.month <= 6 else date(today.year + 1, today.month - 6, today.day)
    )
    db.add(bus_pass)
    db.commit()
    db.refresh(bus_pass)
    return {"message": "Bus pass issued", "pass_number": bus_pass.pass_number}


@router.get("/passes/my", response_model=List[BusPassOut])
def my_bus_pass(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Student: get their bus pass(es)."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return db.query(BusPass).filter(
        BusPass.student_id == student.id,
        BusPass.is_active == True
    ).all()


@router.get("/stats")
def transport_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    total_routes = db.query(TransportRoute).count()
    active_routes = db.query(TransportRoute).filter(TransportRoute.is_active == True).count()
    total_passes = db.query(BusPass).filter(BusPass.is_active == True).count()
    return {
        "total_routes": total_routes,
        "active_routes": active_routes,
        "total_active_passes": total_passes
    }


@router.patch("/routes/{route_id}")
def update_route(
    route_id: uuid.UUID,
    driver_name: Optional[str] = None,
    driver_phone: Optional[str] = None,
    vehicle_number: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    route = db.query(TransportRoute).filter(TransportRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    if driver_name is not None:
        route.driver_name = driver_name
    if driver_phone is not None:
        route.driver_phone = driver_phone
    if vehicle_number is not None:
        route.vehicle_number = vehicle_number
    if is_active is not None:
        route.is_active = is_active
    db.commit()
    return {"message": "Route updated"}
