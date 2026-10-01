"""
Seed script — creates the default admin, faculty, student, and parent accounts
plus demo courses, subjects, hostel rooms, and fee records.

Run once after creating the DB:
    cd backend
    python seed.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
import models  # registers all tables with Base
from models import (
    User, Student, Faculty, Parent, Course, Subject, Department,
    FeeRecord, HostelRoom, AcademicEvent, RoleEnum,
    FeeTypeEnum, AdmissionApplication, ApplicationStatusEnum,
    ParentStudentLink
)
from dependencies import hash_password
import uuid
from datetime import date, timedelta


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Department ────────────────────────────────────────────────────────
        dept = db.query(Department).filter(Department.code == "CSE").first()
        if not dept:
            dept = Department(name="Computer Science & Engineering", code="CSE")
            db.add(dept)
            db.flush()
            print("✅ Department created")

        # ── Courses ───────────────────────────────────────────────────────────
        courses_data = [
            ("Computer Science Engineering", "CSE101", 4, 250000, 120),
            ("Electronics & Communication",  "ECE101", 4, 230000, 90),
            ("Mechanical Engineering",        "ME101",  4, 220000, 100),
            ("Civil Engineering",             "CE101",  4, 210000, 80),
            ("MBA",                           "MBA101", 2, 350000, 60),
            ("MCA",                           "MCA101", 3, 180000, 40),
        ]
        courses = {}
        for name, code, dur, fee, seats in courses_data:
            c = db.query(Course).filter(Course.code == code).first()
            if not c:
                c = Course(name=name, code=code, duration_years=dur,
                           annual_fee=fee, total_seats=seats, department_id=dept.id)
                db.add(c)
                db.flush()
            courses[code] = c
        print("✅ Courses seeded")

        # ── Subjects ──────────────────────────────────────────────────────────
        cse_course = courses["CSE101"]
        subjects_data = [
            ("Data Structures",          "CS201", 4, 1),
            ("Object Oriented Programming", "CS202", 3, 1),
            ("Mathematics I",            "MA101", 4, 1),
            ("Physics",                  "PH101", 3, 1),
            ("Database Management",      "CS301", 4, 2),
            ("Operating Systems",        "CS302", 4, 2),
            ("Computer Networks",        "CS401", 4, 3),
            ("Software Engineering",     "CS402", 3, 3),
        ]
        subjects = {}
        for name, code, credits, sem in subjects_data:
            s = db.query(Subject).filter(Subject.code == code).first()
            if not s:
                s = Subject(name=name, code=code, credits=credits,
                            semester=sem, course_id=cse_course.id)
                db.add(s)
                db.flush()
            subjects[code] = s
        print("✅ Subjects seeded")

        # ── Admin User ────────────────────────────────────────────────────────
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@campus.edu",
                password_hash=hash_password("admin123"),
                role=RoleEnum.admin,
                is_active=True
            )
            db.add(admin_user)
            db.flush()
            print("✅ Admin user created  →  admin / admin123")

        # ── Faculty User ──────────────────────────────────────────────────────
        faculty_user = db.query(User).filter(User.username == "faculty").first()
        if not faculty_user:
            faculty_user = User(
                username="faculty",
                email="faculty@campus.edu",
                password_hash=hash_password("faculty123"),
                role=RoleEnum.faculty,
                is_active=True
            )
            db.add(faculty_user)
            db.flush()

            faculty_profile = Faculty(
                user_id=faculty_user.id,
                full_name="Dr. John Smith",
                employee_id="FAC001",
                phone="9876543210",
                qualification="Ph.D. Computer Science",
                designation="Associate Professor",
                department_id=dept.id
            )
            db.add(faculty_profile)
            db.flush()
            print("✅ Faculty user created  →  faculty / faculty123")
        else:
            faculty_profile = db.query(Faculty).filter(Faculty.user_id == faculty_user.id).first()

        # ── Student User ──────────────────────────────────────────────────────
        student_user = db.query(User).filter(User.username == "student").first()
        if not student_user:
            student_user = User(
                username="student",
                email="student@campus.edu",
                password_hash=hash_password("student123"),
                role=RoleEnum.student,
                is_active=True
            )
            db.add(student_user)
            db.flush()

            student_profile = Student(
                user_id=student_user.id,
                roll_number="STU20250001",
                full_name="Rahul Sharma",
                dob=date(2004, 5, 15),
                phone="9123456789",
                address="12, MG Road, Pune, Maharashtra",
                gender="Male",
                blood_group="B+",
                course_id=cse_course.id,
                semester=3,
                cgpa=8.4,
                hostel_allocated=False
            )
            db.add(student_profile)
            db.flush()

            # Fee records
            for fee_type, amount, desc in [
                (FeeTypeEnum.academic,  125000, "Semester 3 Academic Fee"),
                (FeeTypeEnum.hostel,    30000,  "Semester 3 Hostel Fee"),
                (FeeTypeEnum.transport, 8000,   "Semester 3 Transport Fee"),
            ]:
                fee = FeeRecord(
                    student_id=student_profile.id,
                    fee_type=fee_type,
                    amount=amount,
                    due_date=date.today() + timedelta(days=30),
                    paid=False,
                    semester=3,
                    description=desc
                )
                db.add(fee)
            print("✅ Student user created  →  student / student123")
        else:
            student_profile = db.query(Student).filter(Student.user_id == student_user.id).first()

        # ── Parent User ───────────────────────────────────────────────────────
        parent_user = db.query(User).filter(User.username == "parent").first()
        if not parent_user:
            parent_user = User(
                username="parent",
                email="parent@campus.edu",
                password_hash=hash_password("parent123"),
                role=RoleEnum.parent,
                is_active=True
            )
            db.add(parent_user)
            db.flush()

            parent_profile = Parent(
                user_id=parent_user.id,
                full_name="Mr. Suresh Sharma",
                phone="9876500001",
                occupation="Business"
            )
            db.add(parent_profile)
            db.flush()

            if student_profile:
                link = ParentStudentLink(
                    parent_id=parent_profile.id,
                    student_id=student_profile.id,
                    relation="father"
                )
                db.add(link)
            print("✅ Parent user created  →  parent / parent123")

        # ── Hostel Rooms ──────────────────────────────────────────────────────
        if db.query(HostelRoom).count() == 0:
            for i in range(1, 21):
                room = HostelRoom(
                    room_number=f"A-{i:03d}",
                    floor=(i - 1) // 5 + 1,
                    capacity=2,
                    occupied=0,
                    room_type="double",
                    monthly_fee=5000,
                    block="A"
                )
                db.add(room)
            print("✅ 20 Hostel rooms created")

        # ── Academic Events ───────────────────────────────────────────────────
        if db.query(AcademicEvent).count() == 0:
            events = [
                ("Semester Start",       date(2025, 7, 1),   "event",   "2025-26"),
                ("Independence Day",     date(2025, 8, 15),  "holiday", "2025-26"),
                ("Mid-Semester Exams",   date(2025, 9, 15),  "exam",    "2025-26"),
                ("Diwali Break",         date(2025, 10, 20), "holiday", "2025-26"),
                ("End Semester Exams",   date(2025, 11, 25), "exam",    "2025-26"),
                ("Winter Break",         date(2025, 12, 15), "holiday", "2025-26"),
            ]
            for title, edate, etype, year in events:
                db.add(AcademicEvent(title=title, event_date=edate, event_type=etype, academic_year=year))
            print("✅ Academic calendar events seeded")

        # ── Transport Routes ──────────────────────────────────────────────────
        from models import TransportRoute, BusSchedule
        if db.query(TransportRoute).count() == 0:
            routes_data = [
                ("City Center Route", "R01", "Bus Stand", "Campus", '["Bus Stand","Market Square","Railway Station","College Gate","Campus"]', 12.5, 1500, "Ravi Kumar", "9876543210", "KA-01-AB-1234", 45),
                ("North Route",       "R02", "North City", "Campus", '["North City","Vijay Nagar","Ring Road","Campus"]',                      18.0, 1800, "Suresh Yadav","9765432109", "KA-01-CD-5678", 40),
                ("East Route",        "R03", "East Side",  "Campus", '["East Side","IT Park","Outer Ring Road","Campus"]',                     22.0, 2000, "Mohan Das",  "9654321098", "KA-01-EF-9012", 50),
            ]
            for rname, rnum, origin, dest, stops, dist, fee, dname, dphone, vnum, cap in routes_data:
                route = TransportRoute(route_name=rname, route_number=rnum, origin=origin,
                    destination=dest, stops=stops, distance_km=dist, monthly_fee=fee,
                    driver_name=dname, driver_phone=dphone, vehicle_number=vnum, vehicle_capacity=cap)
                db.add(route)
                db.flush()
                # Add schedules
                for direction, dep, arr in [("to_college","07:30","08:15"), ("from_college","17:00","17:45")]:
                    db.add(BusSchedule(route_id=route.id, day_of_week="All",
                        departure_time=dep, arrival_time=arr, direction=direction))
            print("✅ Transport routes seeded")

        # ── Library Books ─────────────────────────────────────────────────────
        from models import Book
        if db.query(Book).count() == 0:
            books_data = [
                ("Introduction to Algorithms", "Thomas H. Cormen",  "9780262033848", "MIT Press",     "4th", 2022, "CS",      5),
                ("Database System Concepts",   "Abraham Silberschatz","9780078022159","McGraw-Hill",   "7th", 2019, "CS",      4),
                ("Operating System Concepts",  "Abraham Silberschatz","9781119320913","Wiley",         "10th",2018, "CS",      3),
                ("Computer Networks",          "Andrew S. Tanenbaum", "9780132126953","Pearson",       "5th", 2010, "CS",      4),
                ("Engineering Mathematics",    "B.S. Grewal",         "9788174091955","Khanna Pub",    "44th",2020, "General", 6),
                ("Signals and Systems",        "Alan V. Oppenheim",   "9780138147570","Pearson",       "2nd", 2015, "ECE",     3),
                ("Financial Management",       "I.M. Pandey",         "9788174464620","Vikas Pub",     "12th",2021, "MBA",     4),
                ("Python Programming",         "Mark Lutz",           "9781491946824","O'Reilly",      "5th", 2013, "CS",      5),
                ("Discrete Mathematics",       "Kenneth H. Rosen",    "9780073383095","McGraw-Hill",   "8th", 2019, "CS",      3),
                ("Fluid Mechanics",            "Frank M. White",      "9780073398273","McGraw-Hill",   "8th", 2016, "General", 2),
            ]
            for title, author, isbn, pub, edition, year, cat, copies in books_data:
                b = Book(title=title, author=author, isbn=isbn, publisher=pub, edition=edition,
                         year=year, category=cat, total_copies=copies, available_copies=copies,
                         shelf_location=f"{cat[0]}-{str(isbn)[-3:]}")
                db.add(b)
            print("✅ Library books seeded")

        # ── Assets ────────────────────────────────────────────────────────────
        from models import Asset
        if db.query(Asset).count() == 0:
            from datetime import date
            assets_data = [
                ("Dell Laptop",       "ASSET-001", "computer",  "CSE Lab",       date(2023,1,15), 65000,  "Dell India",     date(2026,1,15)),
                ("Epson Projector",   "ASSET-002", "projector", "Seminar Hall",  date(2022,6,10), 45000,  "Epson India",    date(2025,6,10)),
                ("HP LaserJet",       "ASSET-003", "computer",  "Admin Office",  date(2023,3,20), 25000,  "HP India",       date(2026,3,20)),
                ("Lab Bench",         "ASSET-004", "furniture", "ECE Lab",       date(2021,8,5),  12000,  "FurnitureCo",    None),
                ("Oscilloscope",      "ASSET-005", "lab",       "ECE Lab",       date(2022,11,1), 80000,  "Tektronix",      date(2025,11,1)),
                ("Whiteboard 6ft",    "ASSET-006", "furniture", "Room 101",      date(2020,4,12), 8000,   "BoardsCo",       None),
                ("Air Conditioner",   "ASSET-007", "other",     "Faculty Room",  date(2023,5,25), 35000,  "Voltas",         date(2028,5,25)),
                ("Server Rack",       "ASSET-008", "computer",  "Server Room",   date(2022,1,1),  250000, "Dell EMC",       date(2027,1,1)),
            ]
            for name, tag, cat, loc, pdate, cost, vendor, warranty in assets_data:
                db.add(Asset(name=name, asset_tag=tag, category=cat, location=loc,
                             purchase_date=pdate, purchase_cost=cost, vendor=vendor, warranty_until=warranty))
            print("✅ Assets seeded")

        # ── Welcome Notifications ──────────────────────────────────────────────
        from models import Notification, NotificationTypeEnum
        student_user = db.query(User).filter(User.username == "student").first()
        if student_user and db.query(Notification).filter(Notification.user_id == student_user.id).count() == 0:
            notifs = [
                ("Welcome to QuickCampus ERP", "Your student portal is ready. Explore timetable, attendance, and fees.", NotificationTypeEnum.general),
                ("Fee Due Reminder", "Your Semester 1 academic fee of ₹1,25,000 is due on 31st October 2026.", NotificationTypeEnum.fee_due),
                ("Attendance Alert", "Your attendance in Data Structures has dropped below 75%. Please attend classes.", NotificationTypeEnum.attendance_low),
            ]
            for title, message, ntype in notifs:
                db.add(Notification(user_id=student_user.id, title=title, message=message, notif_type=ntype))
            print("✅ Welcome notifications seeded")

        db.commit()
        print("\n🎉 Database seeded successfully!")
        print("\n📋 Demo credentials:")
        print("  Admin   →  admin   / admin123")
        print("  Faculty →  faculty / faculty123")
        print("  Student →  student / student123")
        print("  Parent  →  parent  / parent123")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()

