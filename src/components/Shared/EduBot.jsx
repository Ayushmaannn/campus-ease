import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot, FaPaperPlane, FaTimes, FaMicrophone, FaVolumeUp,
  FaUser, FaSpinner, FaFilePdf, FaLink, FaReceipt, FaExpand,
  FaCompress, FaTrash, FaDownload, FaChevronDown, FaChevronUp,
  FaCheckCircle, FaPrint, FaExternalLinkAlt,
  FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaUserFriends,
  FaBrain, FaChartLine, FaShieldAlt, FaHeartbeat
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ─────────────────────────────────────────────────────────────────
//  ROLE PERSONA CONFIG
//  Each role gets its own: name, tagline, icon, colors, badge, bg
// ─────────────────────────────────────────────────────────────────
const ROLE_PERSONA = {
  student: {
    botName: 'AcadBot',
    tagline: 'Student Academic Copilot',
    badge: 'Gemini 2.5',
    badgeColor: 'bg-sky-400/20 text-sky-200 border-sky-400/30',
    // Floating button gradient
    fabGradient: 'from-sky-500 via-blue-600 to-indigo-700',
    // Header gradient
    headerGradient: 'from-sky-600 via-blue-700 to-indigo-800',
    // Accent color for user bubble & highlights
    userBubble: 'from-sky-500 to-blue-600',
    // Bot avatar gradient
    botAvatar: 'from-sky-500 to-blue-600',
    // Icon emoji shown in header
    Icon: FaUserGraduate,
    iconColor: 'text-yellow-300',
    // Status dot color
    statusDot: 'bg-emerald-400',
    // Quick action chip style
    chipStyle: 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100 hover:border-sky-400',
    // Heading color inside messages
    headingColor: 'text-blue-900',
    bulletColor: 'text-blue-500',
    // Placeholder text
    placeholder: 'Ask AcadBot anything (attendance, marksheet, fees)...',
    footerText: 'AcadBot • Student AI • Powered by Google Gemini 2.5',
  },
  faculty: {
    botName: 'FacultyAI',
    tagline: 'Faculty Intelligence Assistant',
    badge: 'Gemini 2.5',
    badgeColor: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
    fabGradient: 'from-emerald-500 via-teal-600 to-green-700',
    headerGradient: 'from-emerald-600 via-teal-700 to-green-800',
    userBubble: 'from-emerald-500 to-teal-600',
    botAvatar: 'from-emerald-500 to-teal-600',
    Icon: FaChalkboardTeacher,
    iconColor: 'text-yellow-200',
    statusDot: 'bg-lime-400',
    chipStyle: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400',
    headingColor: 'text-emerald-900',
    bulletColor: 'text-emerald-600',
    placeholder: 'Ask FacultyAI about timetable, payslip, leaves, analytics...',
    footerText: 'FacultyAI • Faculty AI • Powered by Google Gemini 2.5',
  },
  admin: {
    botName: 'CampusOps',
    tagline: 'Campus Operations Intelligence',
    badge: 'Gemini 2.5',
    badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
    fabGradient: 'from-amber-500 via-orange-600 to-red-700',
    headerGradient: 'from-amber-600 via-orange-700 to-red-800',
    userBubble: 'from-amber-500 to-orange-600',
    botAvatar: 'from-amber-500 to-orange-600',
    Icon: FaUserShield,
    iconColor: 'text-yellow-200',
    statusDot: 'bg-amber-400',
    chipStyle: 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 hover:border-amber-400',
    headingColor: 'text-amber-900',
    bulletColor: 'text-amber-600',
    placeholder: 'Ask CampusOps about admissions, finance, IoT, hostel...',
    footerText: 'CampusOps • Admin AI • Powered by Google Gemini 2.5',
  },
  parent: {
    botName: 'GuardianBot',
    tagline: 'Parent & Guardian AI Portal',
    badge: 'Gemini 2.5',
    badgeColor: 'bg-rose-400/20 text-rose-200 border-rose-400/30',
    fabGradient: 'from-rose-500 via-pink-600 to-fuchsia-700',
    headerGradient: 'from-rose-600 via-pink-700 to-fuchsia-800',
    userBubble: 'from-rose-500 to-pink-600',
    botAvatar: 'from-rose-500 to-pink-600',
    Icon: FaHeartbeat,
    iconColor: 'text-pink-100',
    statusDot: 'bg-rose-400',
    chipStyle: 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100 hover:border-rose-400',
    headingColor: 'text-rose-900',
    bulletColor: 'text-rose-500',
    placeholder: "Ask GuardianBot about your child's grades, fees, attendance...",
    footerText: 'GuardianBot • Parent AI • Powered by Google Gemini 2.5',
  },
  // Fallback for unauthenticated / guest
  guest: {
    botName: 'CampusGuide',
    tagline: 'University Virtual Guide',
    badge: 'AI Powered',
    badgeColor: 'bg-purple-400/20 text-purple-200 border-purple-400/30',
    fabGradient: 'from-purple-500 via-violet-600 to-indigo-700',
    headerGradient: 'from-purple-600 via-violet-700 to-indigo-800',
    userBubble: 'from-purple-500 to-violet-600',
    botAvatar: 'from-purple-500 to-violet-600',
    Icon: FaRobot,
    iconColor: 'text-yellow-300',
    statusDot: 'bg-purple-400',
    chipStyle: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100 hover:border-purple-400',
    headingColor: 'text-purple-900',
    bulletColor: 'text-purple-500',
    placeholder: 'Ask about admissions, courses, campus life...',
    footerText: 'CampusGuide • AI • Powered by Google Gemini 2.5',
  },
};

// ─────────────────────────────────────────────────────────────────
//  QUICK ACTION CHIPS — role-specific
// ─────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = {
  student: [
    { label: '📋 My Attendance', query: 'What is my current attendance percentage and subject-wise breakdown?' },
    { label: '📄 Semester Marksheet', query: 'Can you show me my semester marksheet and SGPA?' },
    { label: '💰 Fee Status & Receipt', query: 'Show my pending fee status and last payment receipt' },
    { label: '📝 Upcoming Exams', query: 'When are my upcoming semester examinations?' },
    { label: '🗓 Today\'s Timetable', query: 'Show my class schedule for today' },
    { label: '📜 Bonafide Certificate', query: 'Generate my bonafide certificate for scholarship' },
    { label: '🚌 Bus Route & Pass', query: 'Show my campus bus route and digital transport pass' },
    { label: '📚 Library Books', query: 'What library books do I have issued and when are they due?' },
  ],
  faculty: [
    { label: '🗓 Class Schedule', query: 'Show my class schedule and lab sessions for this week' },
    { label: '🏖 Leave Balance', query: 'How many casual, earned, and medical leaves do I have remaining?' },
    { label: '💵 Monthly Payslip', query: 'Show my latest salary payslip for September 2026' },
    { label: '📊 Student Analytics', query: 'Show predictive analytics for at-risk students in my class' },
    { label: '📋 Grade Deadlines', query: 'Show pending grade entry deadlines and default student list' },
    { label: '🎓 Attendance Report', query: 'Generate attendance report for my class section A' },
  ],
  admin: [
    { label: '🎓 Admissions Status', query: 'How many pending student admissions require review today?' },
    { label: '💰 Fee Collection Report', query: 'Show university fee collection, revenue, and defaulters report' },
    { label: '🏠 Hostel Occupancy', query: 'What is the current hostel room and bed occupancy status?' },
    { label: '⚡ IoT & Energy', query: 'Show campus IoT energy, water consumption, and sustainability metrics' },
    { label: '📋 Defaulter List', query: 'Generate attendance defaulters list below 75% threshold' },
    { label: '📄 Policy Documents', query: 'Show university HR and institutional policies for 2026' },
    { label: '📊 Financial Summary', query: 'Show Q3 2026 financial audit report and revenue analysis' },
  ],
  parent: [
    { label: '📊 Child\'s Progress', query: "Show my child's academic progress report, CGPA, and semester trend" },
    { label: '📋 Attendance Record', query: "What is my child's overall and subject-wise attendance?" },
    { label: '💰 Pending Fees', query: "What fees are pending for my child and what is the due date?" },
    { label: '📝 Exam Results', query: "Show my child's latest semester examination results and grades" },
    { label: '🏠 Hostel Welfare', query: "Show my child's hostel room number and warden contact" },
    { label: '🤝 Book PTM', query: "How do I book a parent-teacher meeting with the faculty mentor?" },
  ],
  guest: [
    { label: '🎓 Available Programs', query: 'What B.Tech and M.Tech programs are offered?' },
    { label: '📝 Admission Process', query: 'How can I apply for online admission?' },
    { label: '🏫 Campus Facilities', query: 'Tell me about hostel, library, and lab facilities' },
    { label: '💰 Fee Structure', query: 'What is the fee structure for B.Tech programs?' },
  ],
};

// ─────────────────────────────────────────────────────────────────
//  WELCOME MESSAGES — role & bot name specific
// ─────────────────────────────────────────────────────────────────
const WELCOME_MESSAGES = {
  student: "Hi! I'm **AcadBot** 🎓 — your personal Student AI Copilot, powered by Google Gemini.\n\nI can check your **attendance**, fetch your **digital marksheets**, show **fee receipts**, provide **DigiLocker certificates**, track your **library books**, and answer any academic question instantly.\n\nWhat do you need today?",
  faculty: "Welcome, Professor! I'm **FacultyAI** 🍃 — your dedicated Teaching & Research Assistant, powered by Google Gemini.\n\nI can pull up your **class timetables**, generate **salary payslips**, track **leave balances**, review **predictive student analytics**, and manage your **grade submissions**.\n\nHow may I assist you today?",
  admin: "Greetings, Administrator! I'm **CampusOps** 🔶 — your AI-driven Campus Operations Intelligence, powered by Google Gemini.\n\nI can audit **admissions**, compile **financial summaries**, inspect **hostel occupancy**, monitor **campus IoT telemetry**, generate **policy documents**, and produce **analytics reports**.\n\nWhat operation would you like to initiate?",
  parent: "Welcome! I'm **GuardianBot** 💗 — your dedicated Parent Portal AI, powered by Google Gemini.\n\nI can share your child's **daily attendance**, **examination grades**, **fee payment dues**, **hostel welfare status**, and help you **schedule parent-teacher meetings**.\n\nWhat would you like to know about your child today?",
  guest: "Welcome to **CampusEase University**! I'm **CampusGuide** 🌐 — your AI admission and campus guide.\n\nAsk me anything about **available programs**, **admission eligibility**, **fee structure**, **campus facilities**, or **scholarship opportunities**!",
};

// ─────────────────────────────────────────────────────────────────
//  DOC TYPE ICONS
// ─────────────────────────────────────────────────────────────────
const DOC_ICON = {
  pdf: <FaFilePdf className="text-red-500" />,
  link: <FaLink className="text-blue-500" />,
  receipt: <FaReceipt className="text-emerald-500" />,
};

// ─────────────────────────────────────────────────────────────────
//  LOCAL FALLBACK RESPONSES (when backend unreachable)
// ─────────────────────────────────────────────────────────────────
const getLocalResponse = (q, role) => {
  const lower = q.toLowerCase();
  if (lower.includes('attendance')) {
    if (role === 'parent') return "### 📋 Child Attendance\n- **Overall Attendance:** **89%** (Safe)\n- **Physics 201:** 72% ⚠️ *(2 more classes needed)*\n- **Status:** Eligible for Semester 5 Exams";
    if (role === 'faculty') return "### 📋 Class Attendance Summary\n- **Section A (CS Networks):** 91% average\n- **Section B (CS Networks):** 87% average\n- **3 Students** flagged below 75% threshold";
    if (role === 'admin') return "### 📊 University Attendance Overview\n- **Overall Campus Average:** 88%\n- **Defaulters (below 75%):** 23 students\n- **Department-wise report attached below**";
    return "### 📊 My Attendance\n- **Overall:** **89%** (Safe ✅)\n- **Physics 201:** 72% ⚠️ Need 2 more classes\n- **All others:** Above 85%";
  }
  if (lower.includes('fee') || lower.includes('payment') || lower.includes('receipt')) {
    if (role === 'parent') return "### 💳 Child's Fee Status\n- **Sem 6 Tuition:** ₹40,000 *(Due Feb 15, 2027)*\n- **Last Paid:** ₹65,000 on 12-Aug-2026 ✅\n- **Payment receipt attached below**";
    if (role === 'admin') return "### 💰 University Fee Collection\n- **Total Collected:** ₹12.45 Crore\n- **Outstanding Dues:** ₹2.18 Crore\n- **Recovery Rate:** 85.1%";
    return "### 💳 Fee Status\n- **Tuition Fee:** ₹50,000 *(Due Feb 15, 2027)*\n- **Last Paid:** ₹48,000 via UPI (Aug 12, 2026) ✅\n- **Receipt and payment link attached below**";
  }
  if (lower.includes('grade') || lower.includes('result') || lower.includes('marksheet') || lower.includes('progress')) {
    if (role === 'parent') return "### 🏆 Child Academic Performance\n- **Semester 5 SGPA:** **8.9 / 10.0**\n- **Cumulative CGPA:** **8.7**\n- **Class Rank:** Top 5% 🌟\n- **Mentor Note:** Exceptional lab performance";
    if (role === 'faculty') return "### 📊 Student Grade Analytics\n- **Class Avg SGPA:** 7.8\n- **Top Performer:** Ayushman S. (SGPA 8.9)\n- **Below 6.0 SGPA (At Risk):** 4 students flagged";
    return "### 🎓 Semester 5 Results\n- **SGPA:** **8.9 / 10.0**\n- **CGPA:** **8.7** (Department Top 5% 🌟)\n- **Credits Cleared:** 24/24\n- **DigiLocker Verified** ✅";
  }
  if (lower.includes('payslip') || lower.includes('salary')) {
    return "### 💵 Faculty Salary — September 2026\n- **Gross Salary:** ₹1,12,000\n- **Net Credited:** ₹98,400\n- **Credit Date:** Sep 30, 2026 (HDFC Bank)\n- **Payslip attached below**";
  }
  if (lower.includes('leave')) {
    return "### 🏖 Leave Balance\n- **Casual Leaves (CL):** 4 remaining\n- **Earned Leaves (EL):** 12 remaining\n- **Medical Leaves (ML):** 8 remaining";
  }
  if (lower.includes('timetable') || lower.includes('schedule') || lower.includes('class')) {
    if (role === 'faculty') return "### 🗓 Faculty Schedule (Today)\n- **11:00 AM:** Computer Networks — Section A (Room 201)\n- **02:00 PM:** Networks Lab — Section B (Lab 3)\n- **04:15 PM:** Dept Academic Committee Meeting";
    return "### 🗓 My Timetable (Today)\n- **09:00 AM:** Data Structures (Room 302)\n- **11:15 AM:** Computer Networks (Room 201)\n- **02:00 PM:** Networks Lab (Lab B)";
  }
  if (lower.includes('hostel')) {
    if (role === 'parent') return "### 🏠 Child Hostel Details\n- **Hostel:** Greenwood Hostel\n- **Room:** B-203 (Double Occupancy)\n- **Warden:** Mr. S. Sharma (+91-98765-43210)\n- **Fee Status:** Paid ✅";
    return "### 🏠 Hostel Allocation\n- **Hostel:** Sunrise Boys Hostel\n- **Room:** B-204\n- **Warden Contact:** +91-98765-43210\n- **Mess Timings:** 7:30 AM & 7:30 PM";
  }
  return `I'm here to help you as a **${role}**. Could you be a bit more specific? You can also use the quick action chips below for common queries.`;
};

const getLocalDocs = (q, role) => {
  const lower = q.toLowerCase();
  if (lower.includes('attendance')) {
    return [{ title: 'Attendance Report (PDF)', url: '#/documents/attendance_report', type: 'pdf', description: 'Official semester attendance certificate' }];
  }
  if (lower.includes('marksheet') || lower.includes('grade') || lower.includes('result') || lower.includes('progress')) {
    return [{ title: 'Semester Marksheet (DigiLocker Verified)', url: role === 'parent' ? '/parent/results' : '/student/result', type: 'pdf', description: 'SGPA 8.9 — Blockchain certified' }];
  }
  if (lower.includes('fee') || lower.includes('receipt') || lower.includes('payment')) {
    return [
      { title: 'Fee Payment Portal', url: role === 'parent' ? '/parent/payments' : '/student/academic-fee', type: 'link', description: 'Pay securely via UPI, Card, or Net Banking' },
      { title: 'Last Payment Receipt', url: '#/documents/fee_receipt', type: 'receipt', description: 'Official tax invoice & confirmation' },
    ];
  }
  if (lower.includes('payslip') || lower.includes('salary')) {
    return [{ title: 'September 2026 Payslip (PDF)', url: '#/documents/payslip_sep26', type: 'pdf', description: 'Net: ₹98,400 | Gross: ₹1,12,000' }];
  }
  if (lower.includes('leave')) {
    return [{ title: 'Leave Application Form', url: '#/documents/leave_form', type: 'pdf', description: 'Casual / Earned / Medical leave requisition' }];
  }
  if (lower.includes('hostel')) {
    return [{ title: 'Hostel Allotment Letter', url: role === 'parent' ? '/parent/hostel' : '/student/hostel-fee', type: 'link', description: 'Room allocation and warden details' }];
  }
  return [];
};


// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function EduBot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = (user?.role || 'guest').toLowerCase();

  // Resolve persona — fallback to guest
  const persona = ROLE_PERSONA[role] || ROLE_PERSONA.guest;
  const { Icon } = persona;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [activeModalDoc, setActiveModalDoc] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Reset messages when role changes (e.g. user logs in as different role)
  useEffect(() => {
    setMessages([]);
    setShowQuickActions(true);
  }, [role]);

  // Initialize welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: WELCOME_MESSAGES[role] || WELCOME_MESSAGES.guest,
        sender: 'bot',
        timestamp: new Date(),
        documents: [],
      }]);
    }
  }, [isOpen, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text) => {
    const trimmed = (text || inputText).trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), text: trimmed, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setShowQuickActions(false);

    try {
      const token = localStorage.getItem('access_token');
      const recentHistory = messages.slice(-4).map(m => ({ sender: m.sender, text: m.text }));

      const res = await fetch(`${API}/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: trimmed, role, history: recentHistory }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: data.text,
          sender: 'bot',
          timestamp: new Date(),
          documents: data.documents || [],
          source: data.source || 'gemini',
        }]);
      } else {
        throw new Error('API error');
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: getLocalResponse(trimmed, role),
        sender: 'bot',
        timestamp: new Date(),
        documents: getLocalDocs(trimmed, role),
        source: 'local_fallback',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDocumentClick = (doc) => {
    if (doc.url && doc.url.startsWith('/') && !doc.url.startsWith('/#')) {
      navigate(doc.url);
      return;
    }
    setActiveModalDoc(doc);
  };

  const startVoiceRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice input not supported in this browser.');
    if (isListening) { recognitionRef.current?.stop(); return; }
    const r = new SR();
    r.lang = 'en-IN';
    r.continuous = false;
    r.interimResults = false;
    recognitionRef.current = r;
    setIsListening(true);
    r.start();
    r.onresult = (e) => { setInputText(e.results[0][0].transcript); setIsListening(false); };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`_~₹]/g, ' ').replace(/\n+/g, '. ');
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'en-IN'; u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-new',
      text: WELCOME_MESSAGES[role] || WELCOME_MESSAGES.guest,
      sender: 'bot',
      timestamp: new Date(),
      documents: [],
    }]);
    setShowQuickActions(true);
  };

  const renderText = (text, headingColor, bulletColor) =>
    text.split('\n').map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-1" />;
      if (line.startsWith('### ')) return <p key={idx} className={`font-bold mt-2 mb-1 ${headingColor}`}>{line.replace('### ', '')}</p>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={idx} className="font-bold text-gray-900 m-0">{line.replaceAll('**', '')}</p>;
      if (line.startsWith('- ')) return (
        <div key={idx} className="flex items-start gap-2 ml-1">
          <span className={`font-bold mt-0.5 ${bulletColor}`}>•</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      );
      return <p key={idx} className="m-0" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    });

  const quickActions = QUICK_ACTIONS[role] || QUICK_ACTIONS.guest;

  return (
    <>
      {/* ── Floating Action Button ── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br ${persona.fabGradient} text-white rounded-full shadow-2xl z-[9999] flex items-center justify-center border-2 border-white/30`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.92 }}
        title={`Open ${persona.botName} AI Assistant`}
      >
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><FaTimes size={22} /></motion.span>
            : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative flex items-center justify-center">
                <Icon size={26} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${persona.statusDot} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${persona.statusDot}`} />
                </span>
              </motion.div>
            )
          }
        </AnimatePresence>
      </motion.button>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`fixed z-[9998] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20 transition-all duration-300 ${
              isExpanded
                ? 'bottom-4 right-4 w-[650px] max-w-[94vw] h-[88vh]'
                : 'bottom-24 right-6 w-[390px] max-w-[92vw] h-[610px]'
            }`}
          >
            {/* ── Header ── */}
            <div className={`bg-gradient-to-r ${persona.headerGradient} text-white px-4 py-3.5 flex items-center gap-3 flex-shrink-0 shadow-md`}>
              <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                <Icon size={22} className={persona.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-wide">{persona.botName}</h3>
                  <span className={`px-1.5 py-0.5 text-[10px] border rounded-full font-semibold ${persona.badgeColor}`}>
                    {persona.badge}
                  </span>
                </div>
                <p className="text-xs text-white/70 truncate">{persona.tagline}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearChat} title="Clear chat" className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <FaTrash size={12} />
                </button>
                <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Collapse' : 'Expand'} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  {isExpanded ? <FaCompress size={13} /> : <FaExpand size={13} />}
                </button>
                <button onClick={() => setIsOpen(false)} title="Close" className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            {/* ── Message Stream ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm shadow-sm bg-gradient-to-br ${
                      msg.sender === 'user' ? persona.userBubble : persona.botAvatar
                    } text-white`}>
                      {msg.sender === 'user' ? <FaUser size={13} /> : <Icon size={13} />}
                    </div>

                    {/* Bubble */}
                    <div className="space-y-2 max-w-full">
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? `bg-gradient-to-r ${persona.userBubble} text-white rounded-tr-none`
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}>
                        <div className="prose prose-sm max-w-none text-inherit break-words space-y-1.5">
                          {renderText(msg.text, persona.headingColor, persona.bulletColor)}
                        </div>

                        {msg.sender === 'bot' && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                            <button onClick={() => speakText(msg.text)} className="hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer">
                              <FaVolumeUp size={11} /> Read aloud
                            </button>
                            {msg.source === 'gemini' && (
                              <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium">
                                <FaCheckCircle size={9} /> Gemini AI
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Document Attachments */}
                      {msg.documents && msg.documents.length > 0 && (
                        <div className="space-y-2 mt-2">
                          <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 px-1 uppercase tracking-wider">
                            <FaFilePdf size={10} className="text-red-500" /> Attached Documents & Actions
                          </p>
                          <div className="grid grid-cols-1 gap-1.5">
                            {msg.documents.map((doc, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleDocumentClick(doc)}
                                className="flex items-center justify-between p-2.5 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl cursor-pointer transition-all shadow-sm group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-white flex items-center justify-center flex-shrink-0 text-sm shadow-sm transition-colors">
                                    {DOC_ICON[doc.type] || DOC_ICON.pdf}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-semibold text-gray-800 group-hover:text-indigo-700 truncate">{doc.title}</h4>
                                    <p className="text-[10px] text-gray-500 truncate">
                                      {doc.description || (doc.url.startsWith('/') ? 'Navigate to portal page' : 'Click to view & download')}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 group-hover:text-indigo-600 pl-2">
                                  {doc.url.startsWith('/') ? <FaExternalLinkAlt size={11} /> : <FaDownload size={11} />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-gray-400 px-1">
                        {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${persona.botAvatar} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon size={14} className="text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <FaSpinner size={11} className="animate-spin text-gray-400" />
                        <span className="text-xs text-gray-500 mr-1">{persona.botName} is thinking</span>
                        {[0, 0.15, 0.3].map((d, i) => (
                          <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Action Chips ── */}
            <div className="border-t bg-white flex-shrink-0">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="w-full px-4 py-2 text-[11px] text-gray-500 hover:text-gray-700 flex items-center justify-between transition-colors font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${persona.fabGradient}`} />
                  Suggested Quick Prompts
                </span>
                {showQuickActions ? <FaChevronDown size={10} /> : <FaChevronUp size={10} />}
              </button>
              <AnimatePresence>
                {showQuickActions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {quickActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(action.query)}
                          className={`text-[11px] border rounded-full px-3 py-1 font-medium transition-all ${persona.chipStyle}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Input Bar ── */}
            <div className="border-t bg-white px-3 py-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={startVoiceRecognition}
                  className={`p-2.5 rounded-full flex-shrink-0 transition-all ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Voice input'}
                >
                  <FaMicrophone size={13} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={isListening ? '🎤 Listening...' : persona.placeholder}
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-slate-50"
                  disabled={isTyping}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputText.trim() || isTyping}
                  className={`p-2.5 bg-gradient-to-r ${persona.userBubble} text-white rounded-full flex-shrink-0 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm`}
                >
                  {isTyping ? <FaSpinner size={13} className="animate-spin" /> : <FaPaperPlane size={13} />}
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-2">{persona.footerText}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Document Viewer Modal ── */}
      {activeModalDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200"
          >
            <div className={`bg-gradient-to-r ${persona.headerGradient} text-white p-4 flex items-center justify-between flex-shrink-0`}>
              <div className="flex items-center gap-2">
                {DOC_ICON[activeModalDoc.type] || DOC_ICON.pdf}
                <h3 className="font-bold text-sm md:text-base truncate">{activeModalDoc.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const el = document.createElement('a');
                    const file = new Blob([`Official Document: ${activeModalDoc.title}\nInstitution: CampusEase University\nIssued by: ${persona.botName}\nVerified with Blockchain & DigiLocker`], { type: 'text/plain' });
                    el.href = URL.createObjectURL(file);
                    el.download = `${activeModalDoc.title.replace(/\s+/g, '_')}.txt`;
                    document.body.appendChild(el);
                    el.click();
                  }}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-xs rounded-lg flex items-center gap-1.5 transition font-medium"
                >
                  <FaDownload size={11} /> Download
                </button>
                <button onClick={() => setActiveModalDoc(null)} className="p-1.5 text-white/70 hover:text-white">
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100 flex-1">
              <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 text-gray-800 space-y-6 font-sans">
                <div className="text-center border-b pb-4">
                  <h1 className="text-xl font-bold tracking-wide text-indigo-900 uppercase">CampusEase University of Technology</h1>
                  <p className="text-xs text-gray-500">Autonomous Institution • Approved by AICTE • Accredited NAAC A++</p>
                  <div className="inline-block mt-3 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full text-xs font-semibold">
                    ✓ DigiLocker Verified • Blockchain Certified
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-extrabold text-gray-900 uppercase tracking-wider underline underline-offset-4">
                    {activeModalDoc.title}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">AY 2026-2027 • {new Date().toLocaleDateString('en-IN')}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
                  <p><strong>Generated by:</strong> {persona.botName} ({role} portal AI)</p>
                  <p><strong>Document type:</strong> {activeModalDoc.type.toUpperCase()}</p>
                  <p><strong>Description:</strong> {activeModalDoc.description || 'Official institutional document'}</p>
                  <p><strong>Issued to:</strong> {user?.name || 'Registered User'} | {user?.email || 'N/A'}</p>
                  <p><strong>Blockchain Hash:</strong> <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px]">0x8a92c019fe82...</code></p>
                </div>
                <div className="pt-4 border-t flex items-end justify-between text-xs">
                  <div className="w-16 h-16 border-2 border-dashed border-indigo-400 rounded-lg flex flex-col items-center justify-center bg-indigo-50 text-[10px] text-indigo-700 p-1">
                    <FaCheckCircle className="text-emerald-500 mb-1" size={16} />
                    QR Auth
                  </div>
                  <div className="text-right">
                    <p className="font-serif italic font-bold text-gray-800 text-sm">Dr. Ramesh Chandra</p>
                    <p className="text-[11px] text-gray-500">Controller of Examinations & Registrar</p>
                    <p className="text-[10px] text-gray-400">CampusEase University</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
