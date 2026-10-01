# 🏗️ Smart Campus ERP — Python Backend Design

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **FastAPI** | Async, automatic OpenAPI docs, Pydantic validation |
| Database | **PostgreSQL** | Relational data, strong ACID guarantees |
| ORM | **SQLAlchemy 2.0** | Async sessions, migrations via Alembic |
| Auth | **JWT (python-jose) + bcrypt** | Stateless, role-based tokens |
| File Storage | **Local / AWS S3 (boto3)** | Document uploads (Aadhar, marksheets, etc.) |
| Cache | **Redis** | Session cache, rate limiting, OTP TTL |
| Task Queue | **Celery + Redis** | Email notifications, async workflows |
| Email | **FastAPI-Mail / SMTP** | Admission confirmations, OTP delivery |
| QR Codes | **qrcode (PyPI)** | Attendance QR, blockchain certificate QR |

---

## 📁 Project Structure

```
backend/
├── main.py                  # FastAPI app entry point
├── config.py                # Settings (env vars via pydantic-settings)
├── database.py              # Async SQLAlchemy engine + session
├── dependencies.py          # get_db, get_current_user, role guards
│
├── models/                  # SQLAlchemy ORM models
│   ├── user.py              # User, Role
│   ├── student.py           # Student, AdmissionApplication
│   ├── faculty.py           # Faculty, Department
│   ├── parent.py            # Parent, ParentStudentLink
│   ├── course.py            # Course, Subject, Timetable
│   ├── attendance.py        # AttendanceRecord
│   ├── grade.py             # Grade, Assignment, Submission
│   ├── fee.py               # FeeRecord, PaymentTransaction
│   ├── hostel.py            # HostelRoom, HostelAllocation
│   ├── document.py          # Document (uploads + DigiLocker refs)
│   └── certificate.py       # BlockchainCertificate
│
├── schemas/                 # Pydantic request/response models
│   ├── auth.py
│   ├── student.py
│   ├── faculty.py
│   ├── admission.py
│   ├── attendance.py
│   ├── grade.py
│   ├── fee.py
│   └── document.py
│
├── routers/                 # API route handlers (one file per domain)
│   ├── auth.py              # POST /auth/login, /auth/refresh, /auth/logout
│   ├── admin.py             # Admin dashboard, user management
│   ├── students.py          # Student CRUD, profile
│   ├── faculty.py           # Faculty CRUD, profile
│   ├── parents.py           # Parent portal
│   ├── admissions.py        # Apply, upload docs, approve/reject
│   ├── attendance.py        # Mark, fetch, QR generation
│   ├── grades.py            # Grade entry, results
│   ├── fees.py              # Fee records, payment initiation
│   ├── hostel.py            # Room allocation, hostel status
│   ├── documents.py         # Upload, fetch, DigiLocker mock
│   ├── certificates.py      # Blockchain cert generation + QR verify
│   ├── timetable.py         # Timetable + academic calendar
│   └── analytics.py         # AI/predictive analytics endpoints
│
├── services/                # Business logic (separate from routes)
│   ├── auth_service.py
│   ├── admission_service.py
│   ├── attendance_service.py
│   ├── fee_service.py
│   ├── certificate_service.py
│   └── email_service.py
│
├── tasks/                   # Celery async tasks
│   ├── email_tasks.py       # Send admission confirmation emails
│   └── qr_tasks.py          # Generate QR codes for attendance
│
├── alembic/                 # DB migrations
│   └── versions/
│
├── tests/
│   ├── test_auth.py
│   ├── test_admissions.py
│   └── test_fees.py
│
├── .env                     # Environment secrets (never committed)
├── requirements.txt
└── docker-compose.yml       # PostgreSQL + Redis + App
```

---

## 🗄️ Database Schema (Key Tables)

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| username | VARCHAR UNIQUE | |
| email | VARCHAR UNIQUE | |
| password_hash | VARCHAR | bcrypt |
| role | ENUM | `student`, `faculty`, `admin`, `parent` |
| is_active | BOOL | |
| created_at | TIMESTAMP | |

### `students`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | FK → users | |
| roll_number | VARCHAR UNIQUE | Auto-generated on approval |
| full_name | VARCHAR | |
| dob | DATE | |
| phone | VARCHAR | |
| address | TEXT | |
| course_id | FK → courses | |
| semester | INT | |
| cgpa | FLOAT | |
| admission_id | FK → admission_applications | |

### `admission_applications`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| application_id | VARCHAR | e.g. ADM123456 |
| full_name | VARCHAR | |
| email | VARCHAR | |
| phone | VARCHAR | |
| dob | DATE | |
| course_id | FK | |
| status | ENUM | `draft`, `submitted`, `approved`, `rejected` |
| application_fee_paid | BOOL | |
| digilocker_connected | BOOL | |
| submitted_at | TIMESTAMP | |
| reviewed_by | FK → users (admin) | |
| generated_username | VARCHAR | Set on approval |
| generated_password | VARCHAR | Set on approval |

### `courses`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR | |
| code | VARCHAR UNIQUE | |
| duration_years | INT | |
| annual_fee | NUMERIC | |
| total_seats | INT | |
| department_id | FK | |

### `attendance_records`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| student_id | FK | |
| subject_id | FK | |
| faculty_id | FK | |
| date | DATE | |
| method | ENUM | `qr`, `face`, `geo`, `manual` |
| status | ENUM | `present`, `absent`, `late` |
| marked_at | TIMESTAMP | |

### `fee_records`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| student_id | FK | |
| fee_type | ENUM | `academic`, `hostel`, `transport` |
| amount | NUMERIC | |
| due_date | DATE | |
| paid | BOOL | |
| payment_ref | VARCHAR | |
| paid_at | TIMESTAMP | |

### `grades`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| student_id | FK | |
| subject_id | FK | |
| faculty_id | FK | |
| exam_type | ENUM | `internal`, `external`, `assignment` |
| marks | FLOAT | |
| max_marks | FLOAT | |
| grade | VARCHAR | |
| semester | INT | |

### `documents`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| owner_id | FK → users | |
| doc_type | ENUM | `aadhar`, `class10`, `class12`, `photo`, `income`, `tc` |
| source | ENUM | `upload`, `digilocker` |
| file_path | VARCHAR | S3 key or local path |
| verified | BOOL | |
| uploaded_at | TIMESTAMP | |

---

## 🔐 Authentication Flow

```
POST /auth/login
  Body: { username, password, role }
  → Verify password hash
  → Check role matches
  → Return: { access_token (15min), refresh_token (7d), user_info }

POST /auth/refresh
  → Validate refresh token
  → Return new access_token

POST /auth/logout
  → Blacklist refresh token in Redis
```

All protected routes use `Authorization: Bearer <access_token>` header.

Role guards via FastAPI `Depends`:
- `require_admin` — only admin role
- `require_faculty` — admin or faculty
- `require_student` — student only
- `require_parent` — parent only

---

## 🌐 API Endpoints Summary

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Admissions
- `POST /api/v1/admissions/apply` — Submit new application
- `GET  /api/v1/admissions/` — Admin: list all applications
- `GET  /api/v1/admissions/{id}` — Get single application
- `POST /api/v1/admissions/{id}/approve` — Admin: approve + auto-create user
- `POST /api/v1/admissions/{id}/reject` — Admin: reject
- `POST /api/v1/admissions/{id}/pay` — Mark application fee paid

### Students
- `GET  /api/v1/students/me` — Own profile
- `GET  /api/v1/students/` — Admin/Faculty: list students
- `GET  /api/v1/students/{id}` — Lookup
- `PUT  /api/v1/students/me` — Update profile

### Faculty
- `GET  /api/v1/faculty/me`
- `GET  /api/v1/faculty/`
- `GET  /api/v1/faculty/{id}`

### Attendance
- `POST /api/v1/attendance/mark` — Faculty marks attendance
- `GET  /api/v1/attendance/qr` — Generate QR token for session
- `POST /api/v1/attendance/qr/verify` — Student scans QR
- `GET  /api/v1/attendance/student/{id}` — Attendance records
- `GET  /api/v1/attendance/summary/{student_id}` — % per subject

### Grades & Results
- `POST /api/v1/grades/` — Faculty enter grade
- `PUT  /api/v1/grades/{id}` — Update grade
- `GET  /api/v1/grades/student/{id}` — Get all grades for student
- `GET  /api/v1/grades/result/{student_id}?semester=3` — Semester result

### Assignments
- `POST /api/v1/assignments/` — Faculty creates assignment
- `GET  /api/v1/assignments/` — List (filtered by course/faculty)
- `POST /api/v1/assignments/{id}/submit` — Student submits

### Fees
- `GET  /api/v1/fees/student/{id}` — All fee records
- `POST /api/v1/fees/pay` — Initiate payment
- `GET  /api/v1/fees/history/{student_id}` — Payment history

### Hostel
- `GET  /api/v1/hostel/rooms` — List rooms (admin)
- `POST /api/v1/hostel/allocate` — Allocate room to student
- `GET  /api/v1/hostel/student/{id}` — Student hostel status

### Documents
- `POST /api/v1/documents/upload` — Upload file
- `GET  /api/v1/documents/` — List own documents
- `POST /api/v1/documents/digilocker/connect` — Simulate DigiLocker fetch
- `GET  /api/v1/documents/{id}/download` — Download file

### Certificates
- `POST /api/v1/certificates/generate` — Admin generates certificate
- `GET  /api/v1/certificates/verify/{qr_hash}` — Public verify via QR

### Timetable
- `GET  /api/v1/timetable/student/{id}` — Student timetable
- `GET  /api/v1/timetable/faculty/{id}` — Faculty timetable
- `GET  /api/v1/timetable/academic-calendar` — College calendar

### Analytics (AI stubs)
- `GET  /api/v1/analytics/student/{id}/performance` — CGPA trend
- `GET  /api/v1/analytics/student/{id}/risk` — Risk assessment
- `GET  /api/v1/analytics/admin/overview` — Admin dashboard KPIs
- `GET  /api/v1/analytics/faculty/{id}/class` — Class performance

### Parent
- `GET  /api/v1/parent/children` — Linked students
- `GET  /api/v1/parent/child/{student_id}/attendance`
- `GET  /api/v1/parent/child/{student_id}/results`
- `GET  /api/v1/parent/child/{student_id}/fees`

---

## ⚡ Quick Start

```bash
pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary \
            python-jose[cryptography] passlib[bcrypt] python-multipart \
            pydantic-settings fastapi-mail redis celery qrcode

uvicorn main:app --reload --port 8000
```

Frontend calls `http://localhost:8000/api/v1/...`
