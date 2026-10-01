import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaCalendarAlt, FaDownload, FaFileMedical, FaTimes, FaFilter,
  FaUserGraduate, FaChartPie
} from "react-icons/fa";

const AttendanceRecord = () => {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const subjects = [
    { code: "CS501", name: "Data Structures & Algorithms", teacher: "Dr. A. Verma", held: 45, attended: 42, minRequired: 75 },
    { code: "CS502", name: "Computer Networks", teacher: "Prof. R. Sen", held: 42, attended: 39, minRequired: 75 },
    { code: "CS503", name: "Database Management Systems", teacher: "Dr. K. Iyer", held: 40, attended: 35, minRequired: 75 },
    { code: "CS504", name: "Operating Systems", teacher: "Prof. S. Nair", held: 38, attended: 34, minRequired: 75 },
    { code: "PHY201", name: "Applied Physics 201", teacher: "Dr. M. Roy", held: 35, attended: 26, minRequired: 75 },
  ];

  const recentLogs = [
    { date: "30 Sep 2026", time: "09:00 AM", subject: "Data Structures", status: "Present", teacher: "Dr. A. Verma" },
    { date: "30 Sep 2026", time: "11:15 AM", subject: "Computer Networks", status: "Present", teacher: "Prof. R. Sen" },
    { date: "29 Sep 2026", time: "10:15 AM", subject: "Database Systems", status: "Present", teacher: "Dr. K. Iyer" },
    { date: "29 Sep 2026", time: "02:00 PM", subject: "Applied Physics 201", status: "Absent", teacher: "Dr. M. Roy" },
    { date: "28 Sep 2026", time: "09:00 AM", subject: "Operating Systems", status: "Present", teacher: "Prof. S. Nair" },
    { date: "27 Sep 2026", time: "11:15 AM", subject: "Applied Physics 201", status: "Absent", teacher: "Dr. M. Roy" },
  ];

  const totalHeld = subjects.reduce((sum, s) => sum + s.held, 0);
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const overallPercentage = ((totalAttended / totalHeld) * 100).toFixed(1);

  const handleDownloadReport = () => {
    const reportText = `QUICKCAMPUS UNIVERSITY - ATTENDANCE RECORD\n` +
      `Student: Ayushman Sharma | Roll No: 2024CS108 | Semester: 5\n` +
      `Overall Attendance: ${overallPercentage}% (${totalAttended}/${totalHeld} classes)\n\n` +
      subjects.map(s => `${s.code} - ${s.name}: ${((s.attended / s.held) * 100).toFixed(1)}% (${s.attended}/${s.held})`).join('\n');
    
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_Report_2024CS108.txt`;
    a.click();
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason) return;
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveSubmitted(false);
      setShowLeaveModal(false);
      setLeaveReason("");
      setLeaveDate("");
    }, 2000);
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#003566]">Child's Attendance Record</h1>
          <p className="text-gray-600 mt-1">
            Real-time daily presence tracking and subject-wise attendance analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl text-sm font-semibold shadow-xs transition"
          >
            <FaFileMedical /> Submit Absence Note
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#003566] hover:bg-[#00284d] text-white rounded-xl text-sm font-semibold shadow-md transition"
          >
            <FaDownload /> Download Report (PDF)
          </button>
        </div>
      </div>

      {/* Child Summary Card & Metric Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Child Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
            <FaUserGraduate />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Ward Profile</span>
            <h2 className="text-xl font-bold text-gray-900">Ayushman Sharma</h2>
            <p className="text-xs text-gray-500">Roll: 2024CS108 • B.Tech CSE (Sem 5)</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Status: Regular & Active</p>
          </div>
        </div>

        {/* Overall Attendance Metric */}
        <div className="bg-gradient-to-br from-[#003566] to-[#00509d] text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-200 font-semibold">Overall Attendance</p>
            <h3 className="text-4xl font-extrabold mt-1">{overallPercentage}%</h3>
            <p className="text-xs text-blue-100 mt-1">
              {totalAttended} attended out of {totalHeld} total lectures
            </p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-emerald-400 flex items-center justify-center font-bold text-lg bg-emerald-500/20 text-emerald-200">
            ✓ Safe
          </div>
        </div>

        {/* Compliance Status Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">University Regulatory Rule</span>
            <h3 className="text-sm font-bold text-gray-800 mt-1">Minimum 75% Attendance Required</h3>
            <p className="text-xs text-gray-600 mt-1">
              Students falling below 75% are ineligible for semester end examinations.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
            <span>Eligible for upcoming Semester 5 Final Examinations</span>
          </div>
        </div>
      </div>

      {/* Warning Alert if any subject < 75% */}
      {subjects.some(s => (s.attended / s.held) * 100 < 75) && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <FaExclamationTriangle className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-amber-900">
            <p className="font-bold">Attention Required: Low Attendance Notice</p>
            <p className="mt-0.5 text-amber-800">
              <strong>Applied Physics 201 (PHY201)</strong> is currently at <strong>74.3%</strong>. Your child needs to attend the next <strong>2 consecutive classes</strong> to reach the mandated 75% cutoff.
            </p>
          </div>
        </div>
      )}

      {/* Subject-Wise Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <FaChartPie className="text-indigo-600" /> Subject-Wise Breakdown
          </h3>
          <span className="text-xs text-gray-500">Current Semester: Autumn 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 text-gray-600 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="p-4">Subject</th>
                <th className="p-4">Faculty In-charge</th>
                <th className="p-4 text-center">Classes Held</th>
                <th className="p-4 text-center">Attended</th>
                <th className="p-4 text-center">Absent</th>
                <th className="p-4 text-center">Percentage</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjects.map((s, idx) => {
                const pct = ((s.attended / s.held) * 100).toFixed(1);
                const isCritical = pct < 75;
                const isNormal = pct >= 75 && pct < 85;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.code}</div>
                    </td>
                    <td className="p-4 text-gray-600">{s.teacher}</td>
                    <td className="p-4 text-center font-medium">{s.held}</td>
                    <td className="p-4 text-center font-bold text-emerald-600">{s.attended}</td>
                    <td className="p-4 text-center font-bold text-rose-500">{s.held - s.attended}</td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className={`font-extrabold ${isCritical ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {pct}%
                        </span>
                        <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${isCritical ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isCritical
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : isNormal
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isCritical ? 'Warning' : isNormal ? 'Normal' : 'Excellent'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Attendance Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <FaCalendarAlt className="text-indigo-600" /> Recent Daily Attendance Logs
          </h3>
          <span className="text-xs text-gray-500">Last 6 Class Periods</span>
        </div>

        <div className="divide-y divide-gray-100">
          {recentLogs.map((log, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  log.status === "Present"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-rose-50 text-rose-600 border border-rose-200"
                }`}>
                  {log.status === "Present" ? <FaCheckCircle /> : <FaTimesCircle />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{log.subject}</h4>
                  <p className="text-xs text-gray-500">{log.teacher} • {log.time}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  log.status === "Present" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {log.status}
                </span>
                <p className="text-[11px] text-gray-400 mt-1">{log.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Absence / Leave Note Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowLeaveModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={16} />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-1">Submit Absence Note</h3>
              <p className="text-xs text-gray-500 mb-4">
                Inform college administration and faculty mentor about your ward's leave of absence.
              </p>

              {leaveSubmitted ? (
                <div className="p-6 text-center text-emerald-600 space-y-2">
                  <FaCheckCircle size={40} className="mx-auto" />
                  <p className="font-bold">Leave Note Submitted Successfully!</p>
                  <p className="text-xs text-gray-500">Your note has been routed to the Head of Department.</p>
                </div>
              ) : (
                <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Date of Absence</label>
                    <input
                      type="date"
                      required
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Reason for Absence</label>
                    <textarea
                      required
                      rows={3}
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      placeholder="e.g. Medical illness, doctor appointment, family emergency..."
                      className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLeaveModal(false)}
                      className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#003566] hover:bg-[#00284d] text-white rounded-xl font-semibold"
                    >
                      Submit Note
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceRecord;