import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
import models  # ensure all models are registered
from config import settings

# Import all routers
from routers import auth, admissions, students, attendance, grades, fees, hostel, documents, certificates, timetable, analytics, admin, parents, grievances, assets, examinations, transport, library, notifications, chatbot


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    print(f"STARTED: {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"DOCS: http://localhost:{settings.PORT}/docs")
    yield
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Campus ERP System — Python FastAPI Backend (SIH 2024)",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (uploaded documents) ────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── API Routers ───────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth.router,         prefix=PREFIX)
app.include_router(admissions.router,   prefix=PREFIX)
app.include_router(students.router,     prefix=PREFIX)
app.include_router(admin.router,        prefix=PREFIX)
app.include_router(parents.router,      prefix=PREFIX)
app.include_router(attendance.router,   prefix=PREFIX)
app.include_router(grades.router,       prefix=PREFIX)
app.include_router(fees.router,         prefix=PREFIX)
app.include_router(hostel.router,       prefix=PREFIX)
app.include_router(documents.router,    prefix=PREFIX)
app.include_router(certificates.router, prefix=PREFIX)
app.include_router(timetable.router,    prefix=PREFIX)
app.include_router(analytics.router,    prefix=PREFIX)
app.include_router(grievances.router,   prefix=PREFIX)
app.include_router(assets.router,       prefix=PREFIX)
app.include_router(examinations.router, prefix=PREFIX)
app.include_router(transport.router,    prefix=PREFIX)
app.include_router(library.router,      prefix=PREFIX)
app.include_router(notifications.router,prefix=PREFIX)
app.include_router(chatbot.router,      prefix=PREFIX)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/", tags=["System"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
        "health": "/health"
    }
