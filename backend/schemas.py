import uuid
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator


# ─── AUTH SCHEMAS ─────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str  # student | faculty | admin | parent


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshRequest(BaseModel):
    refresh_token: str


# ─── USER SCHEMAS ─────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: uuid.UUID
    username: str
    email: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── COURSE SCHEMAS ───────────────────────────────────────────────────────────

class CourseOut(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    duration_years: int
    annual_fee: float
    total_seats: int

    class Config:
        from_attributes = True


# ─── ADMISSION SCHEMAS ────────────────────────────────────────────────────────

class AdmissionApplyRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    dob: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    category: Optional[str] = None
    course_id: uuid.UUID


class AdmissionOut(BaseModel):
    id: uuid.UUID
    application_id: str
    full_name: str
    email: str
    phone: str
    status: str
    application_fee_paid: bool
    digilocker_connected: bool
    submitted_at: Optional[datetime]
    created_at: datetime
    course: Optional[CourseOut] = None

    class Config:
        from_attributes = True


class AdmissionApproveRequest(BaseModel):
    rejection_reason: Optional[str] = None


# ─── STUDENT SCHEMAS ──────────────────────────────────────────────────────────

class StudentOut(BaseModel):
    id: uuid.UUID
    roll_number: str
    full_name: str
    dob: Optional[date]
    phone: Optional[str]
    address: Optional[str]
    gender: Optional[str]
    semester: int
    cgpa: float
    hostel_allocated: bool
    transport_opted: bool
    course: Optional[CourseOut] = None

    class Config:
        from_attributes = True


class StudentUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None


# ─── FACULTY SCHEMAS ──────────────────────────────────────────────────────────

class FacultyOut(BaseModel):
    id: uuid.UUID
    full_name: str
    employee_id: str
    phone: Optional[str]
    qualification: Optional[str]
    designation: Optional[str]

    class Config:
        from_attributes = True


# ─── ATTENDANCE SCHEMAS ───────────────────────────────────────────────────────

class MarkAttendanceRequest(BaseModel):
    student_id: uuid.UUID
    subject_id: uuid.UUID
    date: date
    status: str  # present | absent | late
    method: str = "manual"


class AttendanceOut(BaseModel):
    id: uuid.UUID
    date: date
    status: str
    method: str
    marked_at: datetime

    class Config:
        from_attributes = True


class AttendanceSummary(BaseModel):
    subject_id: uuid.UUID
    subject_name: str
    total_classes: int
    present: int
    absent: int
    percentage: float


# ─── GRADE SCHEMAS ────────────────────────────────────────────────────────────

class GradeCreateRequest(BaseModel):
    student_id: uuid.UUID
    subject_id: uuid.UUID
    exam_type: str  # internal | external | assignment
    marks: float
    max_marks: float = 100.0
    semester: int


class GradeOut(BaseModel):
    id: uuid.UUID
    marks: float
    max_marks: float
    grade: Optional[str]
    exam_type: str
    semester: int

    class Config:
        from_attributes = True


# ─── ASSIGNMENT SCHEMAS ───────────────────────────────────────────────────────

class AssignmentCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    subject_id: uuid.UUID
    due_date: Optional[datetime] = None
    max_marks: float = 10.0


class AssignmentOut(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    max_marks: float
    created_at: datetime

    class Config:
        from_attributes = True


# ─── FEE SCHEMAS ──────────────────────────────────────────────────────────────

class FeeRecordOut(BaseModel):
    id: uuid.UUID
    fee_type: str
    amount: float
    due_date: Optional[date]
    paid: bool
    payment_ref: Optional[str]
    paid_at: Optional[datetime]
    semester: Optional[int]
    description: Optional[str]

    class Config:
        from_attributes = True


class PayFeeRequest(BaseModel):
    fee_record_id: uuid.UUID


# ─── HOSTEL SCHEMAS ───────────────────────────────────────────────────────────

class HostelRoomOut(BaseModel):
    id: uuid.UUID
    room_number: str
    floor: int
    capacity: int
    occupied: int
    room_type: str
    monthly_fee: float
    block: Optional[str]

    class Config:
        from_attributes = True


class AllocateHostelRequest(BaseModel):
    student_id: uuid.UUID
    room_id: uuid.UUID


# ─── DOCUMENT SCHEMAS ─────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: uuid.UUID
    doc_type: str
    source: str
    original_filename: Optional[str]
    verified: bool
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ─── CERTIFICATE SCHEMAS ──────────────────────────────────────────────────────

class CertificateGenerateRequest(BaseModel):
    student_id: uuid.UUID
    cert_type: str  # Degree, Provisional, Transcript


class CertificateOut(BaseModel):
    id: uuid.UUID
    cert_type: str
    qr_hash: str
    issued_at: datetime
    is_valid: bool

    class Config:
        from_attributes = True


# ─── ANALYTICS SCHEMAS ────────────────────────────────────────────────────────

class PerformanceTrend(BaseModel):
    semester: int
    cgpa: float
    attendance_pct: float


class RiskAssessment(BaseModel):
    student_id: uuid.UUID
    risk_level: str   # low | medium | high
    risk_score: float
    factors: List[str]


class AdminOverview(BaseModel):
    total_students: int
    total_faculty: int
    pending_admissions: int
    total_revenue: float
    attendance_avg: float


# ─── GRIEVANCE SCHEMAS ────────────────────────────────────────────────────────

class GrievanceCreate(BaseModel):
    title: str
    description: str
    category: str   # academic|hostel|fee|transport|library|administration|other
    priority: Optional[str] = "medium"


class GrievanceUpdate(BaseModel):
    status: Optional[str] = None
    response: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None


class GrievanceOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    category: str
    status: str
    priority: str
    response: Optional[str]
    resolved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── ASSET SCHEMAS ────────────────────────────────────────────────────────────

class AssetCreate(BaseModel):
    name: str
    asset_tag: str
    category: str
    description: Optional[str] = None
    location: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_cost: Optional[float] = None
    vendor: Optional[str] = None
    warranty_until: Optional[date] = None


class AssetUpdate(BaseModel):
    status: Optional[str] = None
    location: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None


class AssetOut(BaseModel):
    id: uuid.UUID
    name: str
    asset_tag: str
    category: str
    description: Optional[str]
    location: Optional[str]
    status: str
    purchase_date: Optional[date]
    purchase_cost: Optional[float]
    vendor: Optional[str]
    warranty_until: Optional[date]
    last_maintenance: Optional[date]
    next_maintenance: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── EXAMINATION SCHEMAS ──────────────────────────────────────────────────────

class ExaminationCreate(BaseModel):
    title: str
    subject_id: uuid.UUID
    exam_type: str          # internal | external | assignment
    semester: int
    exam_date: date
    start_time: str
    end_time: str
    venue: Optional[str] = None
    total_marks: float = 100.0
    instructions: Optional[str] = None


class ExaminationOut(BaseModel):
    id: uuid.UUID
    title: str
    exam_type: str
    semester: int
    exam_date: date
    start_time: str
    end_time: str
    venue: Optional[str]
    total_marks: float
    status: str
    instructions: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class HallTicketOut(BaseModel):
    id: uuid.UUID
    seat_number: Optional[str]
    hall_number: Optional[str]
    issued_at: datetime
    is_valid: bool

    class Config:
        from_attributes = True


# ─── TRANSPORT SCHEMAS ────────────────────────────────────────────────────────

class TransportRouteCreate(BaseModel):
    route_name: str
    route_number: str
    origin: str
    destination: str
    stops: Optional[str] = None
    distance_km: Optional[float] = None
    monthly_fee: float = 1500.0
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    vehicle_number: Optional[str] = None
    vehicle_capacity: int = 40


class TransportRouteOut(BaseModel):
    id: uuid.UUID
    route_name: str
    route_number: str
    origin: str
    destination: str
    stops: Optional[str]
    distance_km: Optional[float]
    monthly_fee: float
    driver_name: Optional[str]
    driver_phone: Optional[str]
    vehicle_number: Optional[str]
    vehicle_capacity: int
    is_active: bool

    class Config:
        from_attributes = True


class BusPassOut(BaseModel):
    id: uuid.UUID
    pass_number: str
    valid_from: date
    valid_until: date
    is_active: bool
    issued_at: datetime

    class Config:
        from_attributes = True


# ─── LIBRARY SCHEMAS ──────────────────────────────────────────────────────────

class BookCreate(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    publisher: Optional[str] = None
    edition: Optional[str] = None
    year: Optional[int] = None
    category: Optional[str] = None
    total_copies: int = 1
    shelf_location: Optional[str] = None


class BookOut(BaseModel):
    id: uuid.UUID
    title: str
    author: str
    isbn: Optional[str]
    publisher: Optional[str]
    edition: Optional[str]
    year: Optional[int]
    category: Optional[str]
    total_copies: int
    available_copies: int
    shelf_location: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class BookIssueRequest(BaseModel):
    book_id: uuid.UUID
    student_id: uuid.UUID
    due_date: date


class BookIssueOut(BaseModel):
    id: uuid.UUID
    issued_at: datetime
    due_date: date
    returned_at: Optional[datetime]
    fine_amount: float
    fine_paid: bool
    is_returned: bool

    class Config:
        from_attributes = True


# ─── NOTIFICATION SCHEMAS ─────────────────────────────────────────────────────

class NotificationCreate(BaseModel):
    user_id: uuid.UUID
    title: str
    message: str
    notif_type: str = "general"
    action_url: Optional[str] = None


class NotificationOut(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    notif_type: str
    is_read: bool
    action_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
