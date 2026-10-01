import uuid
import enum
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum, ForeignKey,
    Float, Integer, Numeric, Date, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base


# ─── ENUMS ────────────────────────────────────────────────────────────────────

class RoleEnum(str, enum.Enum):
    student = "student"
    faculty = "faculty"
    admin = "admin"
    parent = "parent"


class ApplicationStatusEnum(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"


class FeeTypeEnum(str, enum.Enum):
    academic = "academic"
    hostel = "hostel"
    transport = "transport"


class AttendanceMethodEnum(str, enum.Enum):
    qr = "qr"
    face = "face"
    geo = "geo"
    manual = "manual"


class AttendanceStatusEnum(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"


class ExamTypeEnum(str, enum.Enum):
    internal = "internal"
    external = "external"
    assignment = "assignment"


class DocTypeEnum(str, enum.Enum):
    aadhar = "aadhar"
    class10 = "class10"
    class12 = "class12"
    photo = "photo"
    income = "income"
    tc = "tc"


class DocSourceEnum(str, enum.Enum):
    upload = "upload"
    digilocker = "digilocker"


# ─── USER ─────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="user", uselist=False)
    faculty = relationship("Faculty", back_populates="user", uselist=False)
    parent = relationship("Parent", back_populates="user", uselist=False)
    documents = relationship("Document", back_populates="owner")


# ─── DEPARTMENT ───────────────────────────────────────────────────────────────

class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    code = Column(String(20), unique=True, nullable=False)

    courses = relationship("Course", back_populates="department")
    faculty_members = relationship("Faculty", back_populates="department")


# ─── COURSE ───────────────────────────────────────────────────────────────────

class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    duration_years = Column(Integer, nullable=False, default=4)
    annual_fee = Column(Numeric(12, 2), nullable=False)
    total_seats = Column(Integer, nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)

    department = relationship("Department", back_populates="courses")
    students = relationship("Student", back_populates="course")
    subjects = relationship("Subject", back_populates="course")
    admission_applications = relationship("AdmissionApplication", back_populates="course")


# ─── SUBJECT ──────────────────────────────────────────────────────────────────

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    credits = Column(Integer, default=3)
    semester = Column(Integer, nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)

    course = relationship("Course", back_populates="subjects")
    attendance_records = relationship("AttendanceRecord", back_populates="subject")
    grades = relationship("Grade", back_populates="subject")
    timetable_entries = relationship("TimetableEntry", back_populates="subject")


# ─── STUDENT ──────────────────────────────────────────────────────────────────

class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    roll_number = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    dob = Column(Date, nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(5), nullable=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    semester = Column(Integer, default=1)
    cgpa = Column(Float, default=0.0)
    admission_id = Column(UUID(as_uuid=True), ForeignKey("admission_applications.id"), nullable=True)
    hostel_allocated = Column(Boolean, default=False)
    transport_opted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="student")
    course = relationship("Course", back_populates="students")
    admission = relationship("AdmissionApplication", back_populates="student", foreign_keys=[admission_id])
    attendance_records = relationship("AttendanceRecord", back_populates="student")
    grades = relationship("Grade", back_populates="student")
    fee_records = relationship("FeeRecord", back_populates="student")
    hostel_allocation = relationship("HostelAllocation", back_populates="student", uselist=False)
    submissions = relationship("AssignmentSubmission", back_populates="student")
    certificates = relationship("BlockchainCertificate", back_populates="student")
    parent_links = relationship("ParentStudentLink", back_populates="student")


# ─── ADMISSION APPLICATION ────────────────────────────────────────────────────

class AdmissionApplication(Base):
    __tablename__ = "admission_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(String(20), unique=True, nullable=False)  # ADM123456
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    dob = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    father_name = Column(String(200), nullable=True)
    mother_name = Column(String(200), nullable=True)
    category = Column(String(50), nullable=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    status = Column(Enum(ApplicationStatusEnum), default=ApplicationStatusEnum.draft)
    application_fee_paid = Column(Boolean, default=False)
    digilocker_connected = Column(Boolean, default=False)
    submitted_at = Column(DateTime, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    generated_username = Column(String(100), nullable=True)
    generated_password = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="admission_applications")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    student = relationship("Student", back_populates="admission", foreign_keys=[Student.admission_id])


# ─── FACULTY ──────────────────────────────────────────────────────────────────

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    qualification = Column(String(200), nullable=True)
    designation = Column(String(100), nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    joining_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="faculty")
    department = relationship("Department", back_populates="faculty_members")
    attendance_records = relationship("AttendanceRecord", back_populates="faculty")
    grades = relationship("Grade", back_populates="faculty")
    assignments = relationship("Assignment", back_populates="faculty")
    timetable_entries = relationship("TimetableEntry", back_populates="faculty")


# ─── PARENT ───────────────────────────────────────────────────────────────────

class Parent(Base):
    __tablename__ = "parents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=True)
    occupation = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="parent")
    student_links = relationship("ParentStudentLink", back_populates="parent")


class ParentStudentLink(Base):
    __tablename__ = "parent_student_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("parents.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    relation = Column(String(50), default="parent")

    parent = relationship("Parent", back_populates="student_links")
    student = relationship("Student", back_populates="parent_links")


# ─── ATTENDANCE ───────────────────────────────────────────────────────────────

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("faculty.id"), nullable=True)
    date = Column(Date, nullable=False)
    method = Column(Enum(AttendanceMethodEnum), default=AttendanceMethodEnum.manual)
    status = Column(Enum(AttendanceStatusEnum), default=AttendanceStatusEnum.present)
    marked_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="attendance_records")
    subject = relationship("Subject", back_populates="attendance_records")
    faculty = relationship("Faculty", back_populates="attendance_records")


# ─── GRADE ────────────────────────────────────────────────────────────────────

class Grade(Base):
    __tablename__ = "grades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("faculty.id"), nullable=True)
    exam_type = Column(Enum(ExamTypeEnum), default=ExamTypeEnum.internal)
    marks = Column(Float, nullable=False)
    max_marks = Column(Float, nullable=False, default=100.0)
    grade = Column(String(5), nullable=True)
    semester = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="grades")
    subject = relationship("Subject", back_populates="grades")
    faculty = relationship("Faculty", back_populates="grades")


# ─── ASSIGNMENT ───────────────────────────────────────────────────────────────

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("faculty.id"), nullable=False)
    due_date = Column(DateTime, nullable=True)
    max_marks = Column(Float, default=10.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    faculty = relationship("Faculty", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    file_path = Column(String(500), nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    marks_obtained = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("Student", back_populates="submissions")


# ─── FEE ──────────────────────────────────────────────────────────────────────

class FeeRecord(Base):
    __tablename__ = "fee_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    fee_type = Column(Enum(FeeTypeEnum), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    due_date = Column(Date, nullable=True)
    paid = Column(Boolean, default=False)
    payment_ref = Column(String(100), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    semester = Column(Integer, nullable=True)
    description = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="fee_records")


# ─── HOSTEL ───────────────────────────────────────────────────────────────────

class HostelRoom(Base):
    __tablename__ = "hostel_rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_number = Column(String(20), unique=True, nullable=False)
    floor = Column(Integer, default=1)
    capacity = Column(Integer, default=2)
    occupied = Column(Integer, default=0)
    room_type = Column(String(50), default="double")  # single, double, triple
    monthly_fee = Column(Numeric(10, 2), default=5000.00)
    block = Column(String(20), nullable=True)

    allocations = relationship("HostelAllocation", back_populates="room")


class HostelAllocation(Base):
    __tablename__ = "hostel_allocations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), unique=True, nullable=False)
    room_id = Column(UUID(as_uuid=True), ForeignKey("hostel_rooms.id"), nullable=False)
    allocated_at = Column(DateTime, default=datetime.utcnow)
    vacated_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    student = relationship("Student", back_populates="hostel_allocation")
    room = relationship("HostelRoom", back_populates="allocations")


# ─── DOCUMENT ─────────────────────────────────────────────────────────────────

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    doc_type = Column(Enum(DocTypeEnum), nullable=False)
    source = Column(Enum(DocSourceEnum), default=DocSourceEnum.upload)
    file_path = Column(String(500), nullable=True)
    original_filename = Column(String(300), nullable=True)
    verified = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="documents")


# ─── BLOCKCHAIN CERTIFICATE ───────────────────────────────────────────────────

class BlockchainCertificate(Base):
    __tablename__ = "blockchain_certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    cert_type = Column(String(100), nullable=False)  # Degree, Provisional, etc.
    issued_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    qr_hash = Column(String(255), unique=True, nullable=False)
    qr_image_path = Column(String(500), nullable=True)
    issued_at = Column(DateTime, default=datetime.utcnow)
    is_valid = Column(Boolean, default=True)

    student = relationship("Student", back_populates="certificates")


# ─── TIMETABLE ────────────────────────────────────────────────────────────────

class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("faculty.id"), nullable=True)
    day_of_week = Column(String(15), nullable=False)  # Monday, Tuesday...
    start_time = Column(String(10), nullable=False)   # "09:00"
    end_time = Column(String(10), nullable=False)     # "10:00"
    room = Column(String(50), nullable=True)
    semester = Column(Integer, nullable=False)

    subject = relationship("Subject", back_populates="timetable_entries")
    faculty = relationship("Faculty", back_populates="timetable_entries")


# ─── ACADEMIC CALENDAR EVENT ─────────────────────────────────────────────────

class AcademicEvent(Base):
    __tablename__ = "academic_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(Date, nullable=False)
    event_type = Column(String(50), default="holiday")  # holiday, exam, event
    academic_year = Column(String(20), nullable=True)


# ─── GRIEVANCE ────────────────────────────────────────────────────────────────

class GrievanceStatusEnum(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class GrievanceCategoryEnum(str, enum.Enum):
    academic = "academic"
    hostel = "hostel"
    fee = "fee"
    transport = "transport"
    library = "library"
    administration = "administration"
    other = "other"


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(GrievanceCategoryEnum), nullable=False)
    status = Column(Enum(GrievanceStatusEnum), default=GrievanceStatusEnum.open)
    priority = Column(String(20), default="medium")  # low | medium | high
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    response = Column(Text, nullable=True)
    responded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", backref="grievances")
    assignee = relationship("User", foreign_keys=[assigned_to])
    responder = relationship("User", foreign_keys=[responded_by])


# ─── ASSET MANAGEMENT ────────────────────────────────────────────────────────

class AssetStatusEnum(str, enum.Enum):
    available = "available"
    in_use = "in_use"
    maintenance = "maintenance"
    disposed = "disposed"


class Asset(Base):
    __tablename__ = "assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(300), nullable=False)
    asset_tag = Column(String(100), unique=True, nullable=False)
    category = Column(String(100), nullable=False)  # computer|projector|furniture|lab|other
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)     # Room / Department
    status = Column(Enum(AssetStatusEnum), default=AssetStatusEnum.available)
    purchase_date = Column(Date, nullable=True)
    purchase_cost = Column(Numeric(12, 2), nullable=True)
    vendor = Column(String(200), nullable=True)
    warranty_until = Column(Date, nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    last_maintenance = Column(Date, nullable=True)
    next_maintenance = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    assignee = relationship("User", foreign_keys=[assigned_to])


# ─── EXAMINATION ──────────────────────────────────────────────────────────────

class ExamStatusEnum(str, enum.Enum):
    scheduled = "scheduled"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


class Examination(Base):
    __tablename__ = "examinations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    exam_type = Column(Enum(ExamTypeEnum), nullable=False)
    semester = Column(Integer, nullable=False)
    exam_date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=False)  # "09:00"
    end_time = Column(String(10), nullable=False)    # "12:00"
    venue = Column(String(200), nullable=True)
    total_marks = Column(Float, default=100.0)
    status = Column(Enum(ExamStatusEnum), default=ExamStatusEnum.scheduled)
    instructions = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", backref="examinations")
    creator = relationship("User", foreign_keys=[created_by])
    hall_tickets = relationship("HallTicket", back_populates="examination")


class HallTicket(Base):
    __tablename__ = "hall_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    examination_id = Column(UUID(as_uuid=True), ForeignKey("examinations.id"), nullable=False)
    seat_number = Column(String(20), nullable=True)
    hall_number = Column(String(50), nullable=True)
    issued_at = Column(DateTime, default=datetime.utcnow)
    is_valid = Column(Boolean, default=True)

    student = relationship("Student", backref="hall_tickets")
    examination = relationship("Examination", back_populates="hall_tickets")


# ─── TRANSPORT ────────────────────────────────────────────────────────────────

class TransportRoute(Base):
    __tablename__ = "transport_routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_name = Column(String(200), nullable=False)
    route_number = Column(String(20), unique=True, nullable=False)
    origin = Column(String(200), nullable=False)
    destination = Column(String(200), nullable=False)
    stops = Column(Text, nullable=True)            # JSON list of stops
    distance_km = Column(Float, nullable=True)
    monthly_fee = Column(Numeric(10, 2), default=1500.00)
    driver_name = Column(String(200), nullable=True)
    driver_phone = Column(String(20), nullable=True)
    vehicle_number = Column(String(50), nullable=True)
    vehicle_capacity = Column(Integer, default=40)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    schedules = relationship("BusSchedule", back_populates="route")
    student_passes = relationship("BusPass", back_populates="route")


class BusSchedule(Base):
    __tablename__ = "bus_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id = Column(UUID(as_uuid=True), ForeignKey("transport_routes.id"), nullable=False)
    day_of_week = Column(String(15), nullable=False)   # Monday | All
    departure_time = Column(String(10), nullable=False)  # "07:30"
    arrival_time = Column(String(10), nullable=False)   # "08:15"
    direction = Column(String(20), default="to_college")  # to_college | from_college

    route = relationship("TransportRoute", back_populates="schedules")


class BusPass(Base):
    __tablename__ = "bus_passes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    route_id = Column(UUID(as_uuid=True), ForeignKey("transport_routes.id"), nullable=False)
    pass_number = Column(String(50), unique=True, nullable=False)
    valid_from = Column(Date, nullable=False)
    valid_until = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    issued_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", backref="bus_passes")
    route = relationship("TransportRoute", back_populates="student_passes")


# ─── LIBRARY ──────────────────────────────────────────────────────────────────

class BookStatusEnum(str, enum.Enum):
    available = "available"
    issued = "issued"
    reserved = "reserved"
    lost = "lost"


class Book(Base):
    __tablename__ = "books"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(400), nullable=False)
    author = Column(String(300), nullable=False)
    isbn = Column(String(20), unique=True, nullable=True)
    publisher = Column(String(300), nullable=True)
    edition = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True)
    category = Column(String(100), nullable=True)  # CS|ECE|MBA|General|Reference
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)
    shelf_location = Column(String(50), nullable=True)
    status = Column(Enum(BookStatusEnum), default=BookStatusEnum.available)
    created_at = Column(DateTime, default=datetime.utcnow)

    issues = relationship("BookIssue", back_populates="book")


class BookIssue(Base):
    __tablename__ = "book_issues"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    issued_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    issued_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(Date, nullable=False)
    returned_at = Column(DateTime, nullable=True)
    fine_amount = Column(Numeric(8, 2), default=0.00)
    fine_paid = Column(Boolean, default=False)
    is_returned = Column(Boolean, default=False)

    book = relationship("Book", back_populates="issues")
    student = relationship("Student", backref="book_issues")
    librarian = relationship("User", foreign_keys=[issued_by])


# ─── NOTIFICATION ────────────────────────────────────────────────────────────

class NotificationTypeEnum(str, enum.Enum):
    fee_due = "fee_due"
    attendance_low = "attendance_low"
    result_published = "result_published"
    grievance_update = "grievance_update"
    admission = "admission"
    exam_scheduled = "exam_scheduled"
    library = "library"
    general = "general"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    notif_type = Column(Enum(NotificationTypeEnum), default=NotificationTypeEnum.general)
    is_read = Column(Boolean, default=False)
    action_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="notifications")
