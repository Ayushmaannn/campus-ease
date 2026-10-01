import uuid
from datetime import date, timedelta, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Book, BookIssue, Student, User, Notification, NotificationTypeEnum, BookStatusEnum
from schemas import BookCreate, BookOut, BookIssueRequest, BookIssueOut
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/library", tags=["Library"])

FINE_PER_DAY = 5.0   # ₹5 per day overdue


def _notify(db, user_id, title, message):
    db.add(Notification(user_id=user_id, title=title, message=message, notif_type=NotificationTypeEnum.library))


@router.post("/books", response_model=BookOut)
def add_book(
    payload: BookCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: add a new book to catalog."""
    if payload.isbn:
        existing = db.query(Book).filter(Book.isbn == payload.isbn).first()
        if existing:
            # Just increase copies
            existing.total_copies += payload.total_copies
            existing.available_copies += payload.total_copies
            db.commit()
            db.refresh(existing)
            return existing

    book = Book(**payload.model_dump())
    book.available_copies = payload.total_copies
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.get("/books", response_model=List[BookOut])
def list_books(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    available_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search the book catalog."""
    query = db.query(Book)
    if search:
        query = query.filter(
            Book.title.ilike(f"%{search}%") |
            Book.author.ilike(f"%{search}%") |
            Book.isbn.ilike(f"%{search}%")
        )
    if category:
        query = query.filter(Book.category == category)
    if available_only:
        query = query.filter(Book.available_copies > 0)
    return query.order_by(Book.title).all()


@router.get("/books/{book_id}", response_model=BookOut)
def get_book(
    book_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/issue")
def issue_book(
    payload: BookIssueRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin/Librarian: issue a book to a student."""
    book = db.query(Book).filter(Book.id == payload.book_id).first()
    if not book or book.available_copies < 1:
        raise HTTPException(status_code=400, detail="Book not available")

    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if already has this book
    existing = db.query(BookIssue).filter(
        BookIssue.book_id == payload.book_id,
        BookIssue.student_id == payload.student_id,
        BookIssue.is_returned == False
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already has this book issued")

    issue = BookIssue(
        book_id=payload.book_id,
        student_id=payload.student_id,
        issued_by=admin.id,
        due_date=payload.due_date
    )
    db.add(issue)
    book.available_copies -= 1
    if book.available_copies == 0:
        book.status = BookStatusEnum.issued

    _notify(db, student.user_id,
        f"Book Issued: {book.title}",
        f"You have borrowed '{book.title}' by {book.author}. Return by {payload.due_date}. Fine: ₹{FINE_PER_DAY}/day after due date.")

    db.commit()
    return {"message": "Book issued successfully", "due_date": str(payload.due_date)}


@router.post("/return/{issue_id}")
def return_book(
    issue_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin/Librarian: process a book return."""
    issue = db.query(BookIssue).filter(BookIssue.id == issue_id).first()
    if not issue or issue.is_returned:
        raise HTTPException(status_code=404, detail="Issue record not found or already returned")

    now = datetime.utcnow()
    issue.returned_at = now
    issue.is_returned = True

    # Calculate fine
    today = date.today()
    if today > issue.due_date:
        overdue_days = (today - issue.due_date).days
        issue.fine_amount = overdue_days * FINE_PER_DAY

    book = issue.book
    book.available_copies += 1
    if book.available_copies > 0:
        book.status = BookStatusEnum.available

    _notify(db, issue.student.user_id,
        f"Book Returned: {book.title}",
        f"You have returned '{book.title}'. " +
        (f"Fine of ₹{issue.fine_amount} is due." if issue.fine_amount > 0 else "No fine. Thank you!"))

    db.commit()
    return {
        "message": "Book returned",
        "fine_amount": float(issue.fine_amount),
        "fine_paid": issue.fine_paid
    }


@router.get("/my-issues")
def my_book_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Student: get all their borrowed books."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    issues = db.query(BookIssue).filter(
        BookIssue.student_id == student.id
    ).order_by(BookIssue.issued_at.desc()).all()

    result = []
    for i in issues:
        today = date.today()
        overdue_days = max(0, (today - i.due_date).days) if not i.is_returned else 0
        result.append({
            "issue_id": str(i.id),
            "book": {"id": str(i.book.id), "title": i.book.title, "author": i.book.author},
            "issued_at": i.issued_at.isoformat(),
            "due_date": str(i.due_date),
            "returned_at": i.returned_at.isoformat() if i.returned_at else None,
            "is_returned": i.is_returned,
            "overdue_days": overdue_days,
            "fine_amount": float(i.fine_amount),
            "fine_paid": i.fine_paid
        })
    return result


@router.get("/all-issues")
def all_issues(
    returned: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin: list all book issues."""
    query = db.query(BookIssue)
    if returned is not None:
        query = query.filter(BookIssue.is_returned == returned)
    issues = query.order_by(BookIssue.issued_at.desc()).all()
    return [{
        "issue_id": str(i.id),
        "student_name": i.student.full_name,
        "roll_number": i.student.roll_number,
        "book_title": i.book.title,
        "issued_at": i.issued_at.isoformat(),
        "due_date": str(i.due_date),
        "is_returned": i.is_returned,
        "fine_amount": float(i.fine_amount)
    } for i in issues]


@router.get("/stats")
def library_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    total_books = db.query(Book).count()
    available = db.query(Book).filter(Book.available_copies > 0).count()
    issued_count = db.query(BookIssue).filter(BookIssue.is_returned == False).count()
    overdue_count = db.query(BookIssue).filter(
        BookIssue.is_returned == False,
        BookIssue.due_date < date.today()
    ).count()
    return {
        "total_books": total_books,
        "available": available,
        "currently_issued": issued_count,
        "overdue": overdue_count
    }
