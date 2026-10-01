# Smart Campus ERP — Backend

## 🚀 Quick Start

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install dependencies (already done if you ran pip install)
pip install -r requirements.txt

# 3. Seed the database (creates tables + demo accounts)
python seed.py

# 4. Start the API server
uvicorn main:app --reload --port 8000
```

API runs at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

## 🔑 Demo Credentials

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Faculty | faculty  | faculty123  |
| Student | student  | student123  |
| Parent  | parent   | parent123   |

## 📂 File Structure

```
backend/
├── main.py           # FastAPI app entry + CORS
├── config.py         # Settings (DB, JWT, Redis)
├── database.py       # SQLAlchemy engine
├── models.py         # All ORM models
├── schemas.py        # All Pydantic schemas
├── dependencies.py   # JWT auth + role guards
├── seed.py           # DB seeder
├── requirements.txt
└── routers/
    ├── auth.py
    ├── admissions.py
    ├── students.py
    ├── admin.py
    ├── parents.py
    ├── attendance.py
    ├── grades.py
    ├── fees.py
    ├── hostel.py
    ├── documents.py
    ├── certificates.py
    ├── timetable.py
    └── analytics.py
```

## 🌐 API Base URL

All endpoints are prefixed with `/api/v1/`

## 🔗 Connecting the Frontend

Update your React `.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

For Render deployment, set:
```
VITE_API_URL=https://your-app.onrender.com/api/v1
```
