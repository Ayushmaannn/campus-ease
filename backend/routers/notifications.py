import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Notification, User
from schemas import NotificationCreate, NotificationOut
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/my", response_model=List[NotificationOut])
def my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's notifications (latest 50)."""
    return db.query(Notification)\
             .filter(Notification.user_id == current_user.id)\
             .order_by(Notification.created_at.desc())\
             .limit(50).all()


@router.get("/my/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}


@router.patch("/{notif_id}/read")
def mark_read(
    notif_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@router.patch("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.post("/broadcast")
def broadcast_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: send a notification to a specific user."""
    notif = Notification(
        user_id=payload.user_id,
        title=payload.title,
        message=payload.message,
        notif_type=payload.notif_type,
        action_url=payload.action_url
    )
    db.add(notif)
    db.commit()
    return {"message": "Notification sent"}


@router.post("/broadcast-all")
def broadcast_all(
    title: str,
    message: str,
    role: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: broadcast to all users or a role."""
    query = db.query(User).filter(User.is_active == True)
    if role:
        query = query.filter(User.role == role)
    users = query.all()

    notifs = [
        Notification(user_id=u.id, title=title, message=message)
        for u in users
    ]
    db.bulk_save_objects(notifs)
    db.commit()
    return {"message": f"Broadcast sent to {len(notifs)} users"}


@router.delete("/{notif_id}")
def delete_notification(
    notif_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"message": "Deleted"}
