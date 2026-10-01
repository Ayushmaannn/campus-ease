import json
import logging
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
import httpx
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

class ChatMessage(BaseModel):
    sender: str  # "user" or "bot"
    text: str

class ChatQuery(BaseModel):
    query: str
    role: str = "student"  # student, faculty, admin, parent
    history: Optional[List[ChatMessage]] = None
    context: Optional[dict] = None

class DocumentAction(BaseModel):
    title: str
    url: str
    type: str = "pdf"  # pdf, link, receipt
    description: Optional[str] = None

class ChatResponse(BaseModel):
    text: str
    documents: List[DocumentAction] = []
    source: str = "gemini"


# ─────────────────────────────────────────────────────────────────
# ROLE-SPECIFIC SYSTEM PROMPTS — each role gets its own bot persona
# ─────────────────────────────────────────────────────────────────
ROLE_PERSONAS = {
    "student": {
        "bot_name": "AcadBot",
        "tagline": "Student Academic Copilot",
        "tone": "friendly, encouraging, and academic",
    },
    "faculty": {
        "bot_name": "FacultyAI",
        "tagline": "Faculty Intelligence Assistant",
        "tone": "professional, precise, and collegial",
    },
    "admin": {
        "bot_name": "CampusOps",
        "tagline": "Campus Operations Intelligence",
        "tone": "executive, data-driven, and authoritative",
    },
    "parent": {
        "bot_name": "GuardianBot",
        "tagline": "Parent & Guardian AI Portal",
        "tone": "warm, reassuring, and parent-centric",
    },
    "guest": {
        "bot_name": "CampusGuide",
        "tagline": "University Virtual Guide",
        "tone": "welcoming, informative, and approachable",
    },
}

SYSTEM_PROMPT = """You are {bot_name} — {tagline} — for the QuickCampus College ERP System.
Your tone is {tone}.
You are assisting a user logged in with the role: {role}.

Knowledge Base:
1. STUDENT PORTAL:
   - Attendance: Overall attendance is tracked daily. 75% minimum is mandatory.
   - Academics & Timetable: Lecture schedule, exams, semester calendar.
   - Examination & Grades: SGPA, CGPA, semester marksheets, internal assessments (30 marks) and external exams (70 marks). DigiLocker-verified certificates.
   - Fees & Dues: Semester academic fee, hostel fee, transport pass, online UPI/card payment, downloadable instant payment receipts.
   - Facilities: Hostel allotment, room & bed management, library book issue/return, bus route GPS live tracking, grievance redressal system.

2. FACULTY PORTAL:
   - Classes, weekly timetable, attendance marking, student grade entry, predictive performance analytics for struggling students.
   - Leaves (casual, earned), September salary payslip, syllabus planning.

3. ADMIN PORTAL:
   - University Admissions (review applications, approve/reject).
   - Finance & Accounts (total fee collections, pending defaulters, revenue overview).
   - Hostel Management (room/bed occupancy and allocation).
   - Asset Management (lab equipment, IT assets, depreciation tracking).
   - Campus IoT & Sustainability (power usage, water consumption, carbon footprint, HVAC status).
   - Transport fleet & Library inventory management.
   - Access control & RBAC permissions.

4. PARENT PORTAL:
   - Child's real-time attendance percentage, subject-wise breakdown, absence log.
   - Examination results, SGPA/CGPA cards, marksheet download.
   - Fee payment portal, pending semester dues, receipt download.
   - Hostel status & warden contact.
   - Academic progress trends, mentor feedback notes, parent-teacher meeting (PTM) booking.

Response Guidelines:
- Format your response in clean, engaging Markdown with bullet points, bold key terms, and helpful emojis.
- Be concise, accurate, empathetic, and professional.
- When the query is related to documents, reports, receipts, certificates, schedules, or payments, ALWAYS include relevant document links in the "documents" array.
- Document URLs can link to internal portal routes (e.g. "/student/academic-fee", "/student/result", "/student/attendance", "/parent/results", "/parent/payments", "/admin/finance", "/admin/admissions") or document preview URLs (e.g. "#/documents/marksheet", "#/documents/attendance_report", "#/documents/fee_receipt", "#/documents/bonafide_certificate").
- Valid document types: 'pdf', 'receipt', 'link'.

You MUST reply with ONLY a valid JSON object matching this schema:
{{
  "text": "Your markdown answer string here...",
  "documents": [
    {{
      "title": "Title of Document or Action",
      "url": "url_or_route_path",
      "type": "pdf" | "receipt" | "link",
      "description": "Short description"
    }}
  ]
}}
"""

DOCUMENT_SUGGESTIONS = {
    "student": {
        "attendance": DocumentAction(title="Official Attendance Report (PDF)", url="#/documents/attendance_report", type="pdf", description="Detailed 89% semester attendance record"),
        "marksheet": DocumentAction(title="Semester 5 Digital Marksheet", url="/student/result", type="pdf", description="DigiLocker verified SGPA 8.9 marksheet"),
        "grade": DocumentAction(title="Semester 5 Digital Marksheet", url="/student/result", type="pdf", description="DigiLocker verified SGPA 8.9 marksheet"),
        "result": DocumentAction(title="Semester Exam Results", url="/student/result", type="link", description="Comprehensive examination scorecard"),
        "fee": DocumentAction(title="Fee Payment Portal", url="/student/academic-fee", type="link", description="Pay pending semester academic fee"),
        "receipt": DocumentAction(title="Last Semester Fee Receipt", url="#/documents/fee_receipt", type="receipt", description="Official university payment receipt"),
        "syllabus": DocumentAction(title="Curriculum & Syllabus PDF", url="#/documents/syllabus", type="pdf", description="Current academic year syllabus"),
        "timetable": DocumentAction(title="Weekly Class Timetable", url="/student/timetable", type="link", description="Your personalized weekly lecture timetable"),
        "hostel": DocumentAction(title="Hostel Allotment Letter", url="/student/hostel-fee", type="pdf", description="Room B-204 allotment confirmation"),
        "transport": DocumentAction(title="Campus Bus Pass & Routes", url="/student/transport", type="link", description="Route 4 GPS tracking & digital pass"),
        "certificate": DocumentAction(title="Bonafide Certificate (QR Verified)", url="#/documents/bonafide_certificate", type="pdf", description="Digitally signed institutional bonafide"),
        "library": DocumentAction(title="Library Card & Borrowed Books", url="/student/library", type="link", description="2 issued books, return by Oct 15"),
    },
    "faculty": {
        "timetable": DocumentAction(title="Faculty Class Schedule", url="#/faculty/timetable", type="link", description="Assigned lecture slots & labs"),
        "schedule": DocumentAction(title="Faculty Class Schedule", url="#/faculty/timetable", type="link", description="Assigned lecture slots & labs"),
        "payslip": DocumentAction(title="September 2026 Salary Payslip (PDF)", url="#/documents/payslip_sep26", type="pdf", description="Official monthly payroll statement"),
        "salary": DocumentAction(title="September 2026 Salary Payslip (PDF)", url="#/documents/payslip_sep26", type="pdf", description="Official monthly payroll statement"),
        "leave": DocumentAction(title="Leave Application Form", url="#/documents/leave_form", type="pdf", description="Casual/Earned leave requisition form"),
        "analytics": DocumentAction(title="Student Predictive Analytics", url="/faculty/analytics", type="link", description="Risk matrix & exam projections"),
    },
    "admin": {
        "finance": DocumentAction(title="University Financial Summary Q3", url="/admin/finance", type="pdf", description="Fee collection & outstanding analysis"),
        "report": DocumentAction(title="Executive Analytics Report", url="/admin/dashboard", type="pdf", description="Enrollment & performance KPIs"),
        "admission": DocumentAction(title="Admissions Management Portal", url="/admin/admissions", type="link", description="Approve/reject candidate applications"),
        "hostel": DocumentAction(title="Hostel Occupancy Audit", url="/admin/hostel", type="link", description="Bed availability and room allocations"),
        "policy": DocumentAction(title="Institutional HR & Academic Policy 2026", url="#/documents/hr_policy", type="pdf", description="Governing code of conduct & rules"),
        "defaulter": DocumentAction(title="Attendance Defaulters List", url="#/documents/attendance_defaulters", type="pdf", description="Students below 75% attendance threshold"),
        "iot": DocumentAction(title="Campus IoT Energy & Water Dashboard", url="/admin/iot", type="link", description="Live smart sensors & telemetry"),
    },
    "parent": {
        "attendance": DocumentAction(title="Child Attendance Report (PDF)", url="/parent/attendance", type="pdf", description="Monthly attendance percentages & absentees"),
        "result": DocumentAction(title="Official Examination Results", url="/parent/results", type="pdf", description="Child's SGPA 8.7 marksheet & grades"),
        "grade": DocumentAction(title="Official Examination Results", url="/parent/results", type="pdf", description="Child's SGPA 8.7 marksheet & grades"),
        "marksheet": DocumentAction(title="Official Examination Results", url="/parent/results", type="pdf", description="Child's SGPA 8.7 marksheet & grades"),
        "fee": DocumentAction(title="Online Fee Payment Portal", url="/parent/payments", type="link", description="Pay pending semester installments"),
        "receipt": DocumentAction(title="Previous Fee Receipt", url="#/documents/parent_receipt", type="receipt", description="Tax invoice & payment confirmation"),
        "progress": DocumentAction(title="Holistic Student Progress Report", url="/parent/progress", type="pdf", description="CGPA trend, mentor feedback, strengths"),
        "hostel": DocumentAction(title="Child Hostel Allocation Details", url="/parent/hostel", type="link", description="Greenwood Hostel Room B-203"),
        "ptm": DocumentAction(title="Book Parent-Teacher Meeting (PTM)", url="/parent/progress", type="link", description="Schedule meeting with academic mentor"),
    }
}


def get_fallback_response(query: str, role: str) -> ChatResponse:
    q = query.lower()
    docs: List[DocumentAction] = []
    persona = ROLE_PERSONAS.get(role, ROLE_PERSONAS["guest"])
    bot_name = persona["bot_name"]
    
    # Check document suggestions
    role_suggestions = DOCUMENT_SUGGESTIONS.get(role, DOCUMENT_SUGGESTIONS["student"])
    for keyword, doc in role_suggestions.items():
        if keyword in q:
            if doc not in docs:
                docs.append(doc)

    if role == "student":
        if "attendance" in q:
            text = (
                "### 📊 Attendance Summary\n"
                "- **Overall Attendance:** **89%** (Safe & Eligible for Finals)\n"
                "- **Physics 201:** 72% ⚠️ *(Need 2 more classes to cross 75%)*\n"
                "- **Data Structures:** 94% ✅\n"
                "- **Computer Networks:** 91% ✅\n\n"
                "I've attached your official signed Attendance Report below."
            )
        elif "fee" in q or "pay" in q:
            text = (
                "### 💳 Fee Status Overview\n"
                "- **Tuition Fee (Semester 5):** ₹50,000 *(Due: Feb 15, 2027)*\n"
                "- **Hostel & Mess Fee:** Paid ✅ (Receipt #RCP-2026-8912)\n"
                "- **Late Fee Applicable After:** Feb 20, 2027\n\n"
                "Click below to navigate to the secure payment gateway or download your receipt."
            )
        elif "grade" in q or "result" in q or "marksheet" in q:
            text = (
                "### 🎓 Semester 5 Examination Results\n"
                "- **SGPA:** **8.9 / 10.0**\n"
                "- **Cumulative CGPA:** **8.7**\n"
                "- **Credits Earned:** 24 / 24\n"
                "- **Status:** First Class with Distinction 🌟\n"
                "- **Verification:** DigiLocker & Blockchain Hash verified."
            )
        elif "exam" in q:
            text = (
                "### 📝 Upcoming Examination Schedule\n"
                "1. **Data Structures & Algorithms:** Jan 15, 2027 (10:00 AM - 1:00 PM, Hall 3)\n"
                "2. **Database Management Systems:** Jan 18, 2027 (10:00 AM - 1:00 PM, Hall 3)\n"
                "3. **Computer Networks:** Jan 22, 2027 (10:00 AM - 1:00 PM, Hall 2)\n"
                "4. **Operating Systems:** Jan 26, 2027 (10:00 AM - 1:00 PM, Hall 4)"
            )
        elif "timetable" in q or "schedule" in q or "class" in q:
            text = (
                "### 🗓 Class Timetable (Today)\n"
                "- **09:00 AM - 10:00 AM:** Algorithms (Room 302)\n"
                "- **10:15 AM - 11:15 AM:** Computer Networks (Room 201)\n"
                "- **11:30 AM - 01:00 PM:** Networks Lab (Lab B, Floor 2)\n"
                "- **02:00 PM - 03:00 PM:** Discrete Mathematics (Room 304)"
            )
        elif "hostel" in q:
            text = (
                "### 🏠 Hostel Allocation\n"
                "- **Hostel:** Sunrise Boys Hostel\n"
                "- **Room:** B-204 (Double Occupancy)\n"
                "- **Warden:** Prof. S. Sharma (`+91-98765-43210`)\n"
                "- **Mess Timings:** Breakfast 7:30 AM - 9:00 AM | Dinner 7:30 PM - 9:30 PM"
            )
        elif "transport" in q or "bus" in q:
            text = (
                "### 🚌 Campus Transport & Route Info\n"
                "- **Assigned Route:** Route #4 (South City Express)\n"
                "- **Bus Number:** KA-04-ER-9821\n"
                "- **Pickup Point:** Silk Board Junction (07:45 AM)\n"
                "- **Driver Contact:** Ramesh K. (`+91-98450-11223`)"
            )
        else:
            text = (
                f"Hello! I am **{bot_name}** 🎓 — your AI Student Copilot.\n\n"
                "I can assist you with:\n"
                "- 📋 **Attendance & Marksheets**\n"
                "- 💰 **Fee Dues & Payment Receipts**\n"
                "- 🗓 **Class Timetable & Exam Dates**\n"
                "- 📄 **DigiLocker & Bonafide Certificates**\n"
                "- 🚌 **Campus Buses & Library Books**\n\n"
                "How can I help you today?"
            )

    elif role == "faculty":
        if "timetable" in q or "schedule" in q or "class" in q:
            text = (
                "### 👨‍🏫 Faculty Timetable (Today)\n"
                "- **11:00 AM - 12:00 PM:** Computer Networks (Section A, Room 201)\n"
                "- **02:00 PM - 04:00 PM:** Advanced Networks Lab (Section B, Lab 3)\n"
                "- **04:15 PM - 05:00 PM:** Department Academic Committee Meeting"
            )
        elif "leave" in q:
            text = (
                "### 🏖 Leave Balance Overview\n"
                "- **Casual Leaves (CL):** 4 remaining\n"
                "- **Earned Leaves (EL):** 12 remaining\n"
                "- **Medical Leaves (ML):** 8 remaining\n\n"
                "The leave requisition document is linked below."
            )
        elif "salary" in q or "payslip" in q:
            text = (
                "### 💵 Payroll & Salary Status\n"
                "- **Month:** September 2026\n"
                "- **Gross Pay:** ₹1,12,000 | **Net Credited:** ₹98,400\n"
                "- **Credit Date:** Sep 30, 2026 (HDFC Bank)\n\n"
                "Download your tax-itemized payslip below."
            )
        else:
            text = (
                f"Hello Professor! I am **{bot_name}** 🍃 — your Faculty Intelligence Assistant.\n\n"
                "I can help you review student attendance, post grades, check your teaching schedule, submit leave requests, and view predictive student performance analytics."
            )

    elif role == "admin":
        if "admission" in q:
            text = (
                "### 🎓 Admissions Overview 2026-27\n"
                "- **Total Applications Received:** 1,240\n"
                "- **Approved:** 820 | **Pending Verification:** 48\n"
                "- **Seats Filled:** 91.5% across B.Tech and M.Tech departments."
            )
        elif "finance" in q or "revenue" in q or "fee" in q:
            text = (
                "### 💰 University Financial Summary\n"
                "- **Total Fee Collected:** ₹12.45 Crore\n"
                "- **Outstanding Fee Dues:** ₹2.18 Crore\n"
                "- **Current Semester Recovery Rate:** 85.1%\n\n"
                "Access the comprehensive finance dashboard and defaulter registry below."
            )
        else:
            text = (
                f"Hello Administrator! I am **{bot_name}** 🔶 — your Campus Operations Intelligence.\n\n"
                "I can generate real-time institutional reports, monitor campus IoT energy & water metrics, audit fee collections, and manage admissions."
            )

    elif role == "parent":
        if "attendance" in q:
            text = (
                "### 📋 Child's Attendance Record\n"
                "- **Overall Attendance:** **89%**\n"
                "- **Classes Attended:** 178 / 200\n"
                "- **Status:** Excellent ✅ *(No attendance default warning)*\n\n"
                "You can inspect daily subject-wise attendance logs and download reports below."
            )
        elif "result" in q or "grade" in q or "marks" in q or "progress" in q:
            text = (
                "### 🏆 Child Academic Progress Report\n"
                "- **Current Semester SGPA:** **8.9**\n"
                "- **Cumulative CGPA:** **8.7**\n"
                "- **Class Rank:** Top 5%\n"
                "- **Faculty Mentor Note:** *\"Demonstrates exceptional grasp in systems programming and active lab participation.\"*"
            )
        elif "fee" in q or "pay" in q:
            text = (
                "### 💳 Student Fee Details\n"
                "- **Semester 5 Fee:** ₹50,000 *(Due: Feb 15, 2027)*\n"
                "- **Hostel & Amenities:** Paid in full ✅\n\n"
                "You can settle upcoming dues directly via Netbanking, UPI, or Credit Card."
            )
        else:
            text = (
                f"Hello! I am **{bot_name}** 💗 — your Parent Portal AI.\n\n"
                "I am here to keep you updated with your child's academic grades, daily attendance, fee dues, hostel welfare, and mentor notes."
            )
    else:
        text = f"Hello! I am **{bot_name}** 🌐 — your university virtual guide. How may I assist you today?"

    return ChatResponse(text=text, documents=docs, source="local_ai")


@router.post("/query", response_model=ChatResponse)
async def handle_query(query_data: ChatQuery, authorization: Optional[str] = Header(None)):
    query = query_data.query.strip()
    role = (query_data.role or "student").lower()

    if not query:
        return ChatResponse(
            text="Please type your question or select one of the quick actions below! 🤖",
            documents=[],
            source="system"
        )

    # Prepare Gemini API request
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.warning("No GEMINI_API_KEY set; falling back to local assistant.")
        return get_fallback_response(query, role)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    # Build conversation context with role-specific persona
    persona = ROLE_PERSONAS.get(role, ROLE_PERSONAS["guest"])
    user_prompt = SYSTEM_PROMPT.format(
        bot_name=persona["bot_name"],
        tagline=persona["tagline"],
        tone=persona["tone"],
        role=role,
    ) + f"\n\nUser Query: {query}"
    contents = []

    # Include recent conversation history if provided
    if query_data.history:
        for msg in query_data.history[-4:]:  # last 4 turns
            role_turn = "user" if msg.sender == "user" else "model"
            contents.append({"role": role_turn, "parts": [{"text": msg.text}]})

    contents.append({"role": "user", "parts": [{"text": user_prompt}]})

    payload = {
        "contents": contents,
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.4,
            "maxOutputTokens": 1024
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidate_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                
                # Parse JSON output from Gemini
                try:
                    parsed = json.loads(candidate_text)
                    response_text = parsed.get("text", "")
                    docs_raw = parsed.get("documents", [])
                    documents: List[DocumentAction] = []
                    
                    for d in docs_raw:
                        if isinstance(d, dict) and "title" in d and "url" in d:
                            documents.append(DocumentAction(
                                title=d["title"],
                                url=d["url"],
                                type=d.get("type", "pdf"),
                                description=d.get("description")
                            ))
                    
                    # Complement with standard role suggestions if query specifically asked for docs
                    q_lower = query.lower()
                    role_suggestions = DOCUMENT_SUGGESTIONS.get(role, DOCUMENT_SUGGESTIONS["student"])
                    for keyword, doc in role_suggestions.items():
                        if keyword in q_lower and not any(doc.title.lower() in existing.title.lower() for existing in documents):
                            documents.append(doc)

                    return ChatResponse(
                        text=response_text or candidate_text,
                        documents=documents,
                        source="gemini"
                    )

                except json.JSONDecodeError:
                    # Clean markdown code fences if model returned ```json ... ```
                    cleaned = re.sub(r"^```json\s*", "", candidate_text.strip(), flags=re.MULTILINE)
                    cleaned = re.sub(r"```$", "", cleaned.strip(), flags=re.MULTILINE).strip()
                    try:
                        parsed = json.loads(cleaned)
                        return ChatResponse(
                            text=parsed.get("text", candidate_text),
                            documents=[DocumentAction(**d) for d in parsed.get("documents", []) if "title" in d],
                            source="gemini"
                        )
                    except Exception:
                        # Return cleaned text with smart matching
                        fallback = get_fallback_response(query, role)
                        return ChatResponse(
                            text=cleaned or candidate_text,
                            documents=fallback.documents,
                            source="gemini"
                        )

            else:
                logger.error(f"Gemini API returned status {resp.status_code}: {resp.text}")
                return get_fallback_response(query, role)

    except Exception as exc:
        logger.error(f"Error querying Gemini API: {exc}")
        return get_fallback_response(query, role)
