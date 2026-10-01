import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Asset, User
from schemas import AssetCreate, AssetUpdate, AssetOut
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.post("/", response_model=AssetOut)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: register a new asset."""
    existing = db.query(Asset).filter(Asset.asset_tag == payload.asset_tag).first()
    if existing:
        raise HTTPException(status_code=400, detail="Asset tag already exists")

    asset = Asset(**payload.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.get("/", response_model=List[AssetOut])
def list_assets(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all assets with optional filters."""
    query = db.query(Asset)
    if category:
        query = query.filter(Asset.category == category)
    if status:
        query = query.filter(Asset.status == status)
    if search:
        query = query.filter(Asset.name.ilike(f"%{search}%") | Asset.asset_tag.ilike(f"%{search}%"))
    return query.order_by(Asset.created_at.desc()).all()


@router.get("/stats")
def asset_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Asset inventory summary."""
    total = db.query(Asset).count()
    available = db.query(Asset).filter(Asset.status == "available").count()
    in_use = db.query(Asset).filter(Asset.status == "in_use").count()
    maintenance = db.query(Asset).filter(Asset.status == "maintenance").count()
    disposed = db.query(Asset).filter(Asset.status == "disposed").count()

    by_category = {}
    for a in db.query(Asset).all():
        by_category[a.category] = by_category.get(a.category, 0) + 1

    return {
        "total": total,
        "available": available,
        "in_use": in_use,
        "maintenance": maintenance,
        "disposed": disposed,
        "by_category": by_category
    }


@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(
    asset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.patch("/{asset_id}", response_model=AssetOut)
def update_asset(
    asset_id: uuid.UUID,
    payload: AssetUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: update asset status, location, or assignment."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(asset, key, value)

    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/{asset_id}")
def delete_asset(
    asset_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted"}
