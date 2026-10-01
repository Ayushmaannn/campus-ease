import uuid
import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Document, DocTypeEnum, DocSourceEnum, User
from schemas import DocumentOut
from dependencies import get_current_user
from config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_document(
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, PDF allowed")

    # Validate doc_type
    try:
        DocTypeEnum(doc_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid doc_type: {doc_type}")

    # Save file
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)
    file_path = os.path.join(user_upload_dir, f"{doc_type}_{file.filename}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = Document(
        owner_id=current_user.id,
        doc_type=doc_type,
        source=DocSourceEnum.upload,
        file_path=file_path,
        original_filename=file.filename,
        verified=False
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/", response_model=List[DocumentOut])
def list_my_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Document).filter(Document.owner_id == current_user.id).all()


@router.post("/digilocker/connect")
def connect_digilocker(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Simulate DigiLocker fetch — creates placeholder verified document records."""
    mock_docs = ["aadhar", "class10", "class12"]
    created = []

    for doc_type in mock_docs:
        existing = db.query(Document).filter(
            Document.owner_id == current_user.id,
            Document.doc_type == doc_type,
            Document.source == DocSourceEnum.digilocker
        ).first()
        if not existing:
            doc = Document(
                owner_id=current_user.id,
                doc_type=doc_type,
                source=DocSourceEnum.digilocker,
                file_path=None,
                original_filename=f"{doc_type}_digilocker.pdf",
                verified=True
            )
            db.add(doc)
            created.append(doc_type)

    db.commit()
    return {"message": "DigiLocker connected", "documents_fetched": created}


@router.get("/{doc_id}/download")
def download_document(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.owner_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    if not doc.file_path or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(doc.file_path, filename=doc.original_filename)
