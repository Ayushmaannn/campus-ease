import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaClock, FaSpinner,
  FaTicketAlt, FaBook, FaDownload, FaGraduationCap
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const token = () => localStorage.getItem('access_token');
const h = () => ({ Authorization: `Bearer ${token()}` });

const examTypeColor = {
  internal: 'bg-blue-100 text-blue-700',
  external: 'bg-purple-100 text-purple-700',
  assignment: 'bg-green-100 text-green-700',
};

const statusColor = {
  scheduled: 'bg-yellow-100 text-yellow-700',
  ongoing:   'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ExaminationPage() {
  const [tab, setTab] = useState('upcoming');
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [hallTickets, setHallTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [examRes, htRes] = await Promise.all([
        fetch(`${API}/examinations/upcoming`, { headers: h() }),
        fetch(`${API}/examinations/my-hall-ticket`, { headers: h() }),
      ]);
      if (examRes.ok) setUpcomingExams(await examRes.json());
      if (htRes.ok) setHallTickets(await htRes.json());
    } catch { /* silent */ }
    setLoading(false);
  };

  const printHallTicket = (ticket) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Hall Ticket</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 700px; margin: auto; }
        .header { text-align: center; border-bottom: 3px double #1e40af; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
        .badge { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 16px 0; }
        .row { display: flex; justify-content: space-between; margin: 8px 0; }
        .label { color: #6b7280; font-size: 13px; }
        .value { font-weight: 600; color: #111827; }
        .seat { font-size: 48px; font-weight: bold; color: #1e40af; text-align: center; padding: 20px; background: #eff6ff; border-radius: 12px; margin: 16px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        @media print { button { display: none; } }
      </style></head><body>
      <div class="header">
        <div class="logo">🎓 QuickCampus ERP</div>
        <div style="color:#6b7280;margin-top:6px;">Smart University Digital Campus</div>
        <h2 style="margin:12px 0 0;color:#1e40af;">EXAMINATION HALL TICKET</h2>
      </div>
      <div class="badge">
        <div class="row"><span class="label">Student Name</span><span class="value">${ticket.exam?.title || 'N/A'}</span></div>
        <div class="row"><span class="label">Exam Title</span><span class="value">${ticket.exam?.title}</span></div>
        <div class="row"><span class="label">Exam Type</span><span class="value">${ticket.exam?.exam_type?.toUpperCase()}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${ticket.exam?.exam_date}</span></div>
        <div class="row"><span class="label">Time</span><span class="value">${ticket.exam?.start_time} – ${ticket.exam?.end_time}</span></div>
        <div class="row"><span class="label">Venue</span><span class="value">${ticket.exam?.venue || 'TBA'}</span></div>
        <div class="row"><span class="label">Total Marks</span><span class="value">${ticket.exam?.total_marks}</span></div>
      </div>
      <div class="seat">
        <div style="font-size:14px;color:#6b7280;font-weight:normal;">Your Seat</div>
        ${ticket.hall_number} — Seat ${ticket.seat_number}
      </div>
      <div class="footer">
        <p>• Bring this hall ticket and a valid photo ID to the exam venue.</p>
        <p>• No electronic devices allowed in the exam hall.</p>
        <p>• Report 15 minutes before the exam starts.</p>
      </div>
      <button onclick="window.print()" style="margin-top:20px;padding:10px 24px;background:#1e40af;color:white;border:none;border-radius:8px;cursor:pointer;font-size:15px;">Print Hall Ticket</button>
      </body></html>
    `);
    win.document.close();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <FaSpinner className="animate-spin text-3xl text-indigo-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaGraduationCap className="text-indigo-600" /> Examinations
        </h1>
        <p className="text-gray-500 text-sm mt-1">View upcoming exams and download hall tickets</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'upcoming', label: 'Upcoming Exams', icon: <FaCalendarAlt /> },
          { key: 'tickets', label: 'My Hall Tickets', icon: <FaTicketAlt /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Upcoming Exams */}
      {tab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingExams.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming exams scheduled</p>
            </div>
          ) : upcomingExams.map((exam, i) => (
            <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${examTypeColor[exam.exam_type] || 'bg-gray-100'}`}>
                      {exam.exam_type}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[exam.status] || 'bg-gray-100'}`}>
                      {exam.status}
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                      Sem {exam.semester}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{exam.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <FaCalendarAlt className="text-indigo-500" />
                      {new Date(exam.exam_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaClock className="text-blue-500" />
                      {exam.start_time} – {exam.end_time}
                    </span>
                    {exam.venue && (
                      <span className="flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-red-500" />
                        {exam.venue}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-700">{exam.total_marks}</div>
                  <div className="text-xs text-gray-400">marks</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hall Tickets */}
      {tab === 'tickets' && (
        <div className="space-y-4">
          {hallTickets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <FaTicketAlt className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hall tickets issued yet</p>
            </div>
          ) : hallTickets.map((ticket, i) => (
            <motion.div key={ticket.hall_ticket_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{ticket.exam?.title}</h3>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-white rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-indigo-700">{ticket.seat_number}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Seat Number</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-blue-700">{ticket.hall_number}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Hall</div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><FaCalendarAlt className="text-indigo-500" /> {ticket.exam?.exam_date}</span>
                    <span className="flex items-center gap-1"><FaClock className="text-blue-500" /> {ticket.exam?.start_time}</span>
                    {ticket.exam?.venue && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-red-500" /> {ticket.exam?.venue}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {ticket.is_valid ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">✓ Valid</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">Invalidated</span>
                  )}
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => printHallTicket(ticket)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium shadow hover:bg-indigo-700 transition-colors">
                    <FaDownload /> Print
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
