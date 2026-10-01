import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine, FaTrophy, FaComments, FaCalendarCheck,
  FaCheckCircle, FaStar, FaDownload, FaTimes, FaUserTie,
  FaLightbulb, FaMedal
} from "react-icons/fa";

const StudentProgress = () => {
  const [showPtmModal, setShowPtmModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState("Dr. A. Verma (Mentor)");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("10:00 AM - 10:30 AM");
  const [meetingReason, setMeetingReason] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const semesterTrend = [
    { sem: "Sem 1", sgpa: 8.8, cgpa: 8.80, status: "Excellent" },
    { sem: "Sem 2", sgpa: 8.5, cgpa: 8.66, status: "Very Good" },
    { sem: "Sem 3", sgpa: 8.7, cgpa: 8.68, status: "Very Good" },
    { sem: "Sem 4", sgpa: 8.6, cgpa: 8.65, status: "Very Good" },
    { sem: "Sem 5", sgpa: 8.9, cgpa: 8.70, status: "Outstanding" },
  ];

  const competencies = [
    { skill: "Data Structures & Algorithms", level: 92, badge: "Advanced" },
    { skill: "Computer Networks & Security", level: 88, badge: "Proficient" },
    { skill: "Database Management & SQL", level: 85, badge: "Proficient" },
    { skill: "Full-Stack Web Development", level: 95, badge: "Expert" },
    { skill: "Machine Learning Foundations", level: 78, badge: "Intermediate" },
  ];

  const mentorReviews = [
    {
      author: "Dr. A. Verma",
      role: "Faculty Academic Mentor",
      date: "Sep 28, 2026",
      rating: 5,
      comment: "Ayushman exhibits phenomenal problem-solving ability in systems and algorithms. His consistent class presence and active contributions to lab sessions make him one of the standout students of this batch."
    },
    {
      author: "Prof. R. Sen",
      role: "Course Coordinator (Networks)",
      date: "Aug 15, 2026",
      rating: 4.8,
      comment: "High analytical acumen. Successfully delivered the socket programming capstone ahead of the deadline. Keep maintaining this level of rigor for the upcoming campus placements."
    },
    {
      author: "Dr. K. Iyer",
      role: "HOD Computer Science",
      date: "Jul 10, 2026",
      rating: 5,
      comment: "Nominated for the Dean's Academic Merit List for maintaining above 8.5 CGPA consistently across all 5 semesters."
    }
  ];

  const handlePtmSubmit = (e) => {
    e.preventDefault();
    if (!meetingDate) return;
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
      setShowPtmModal(false);
      setMeetingDate("");
      setMeetingReason("");
    }, 2500);
  };

  const handleDownloadProgress = () => {
    const report = `QUICKCAMPUS UNIVERSITY - HOLISTIC STUDENT PROGRESS REPORT\n` +
      `Student: Ayushman Sharma | Roll: 2024CS108 | Department: B.Tech CSE\n` +
      `Current CGPA: 8.70 / 10.0 | Standing: Top 5% of Batch\n\n` +
      `SEMESTER PROGRESSION:\n` +
      semesterTrend.map(s => `${s.sem}: SGPA ${s.sgpa} | CGPA ${s.cgpa} (${s.status})`).join('\n') +
      `\n\nMENTOR EVALUATION:\n` +
      mentorReviews.map(r => `${r.author} (${r.role}): "${r.comment}"`).join('\n\n');

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Progress_Report_2024CS108.txt`;
    a.click();
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#003566]">Student Academic Progress</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive holistic growth tracking, skill competencies, and faculty mentor evaluations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPtmModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
          >
            <FaCalendarCheck /> Book Parent-Teacher Meeting
          </button>
          <button
            onClick={handleDownloadProgress}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#003566] hover:bg-[#00284d] text-white rounded-xl text-sm font-semibold shadow-md transition"
          >
            <FaDownload /> Download Progress Report
          </button>
        </div>
      </div>

      {/* CGPA Progression Over Semesters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-indigo-600" /> Academic Trajectory (Semesters 1 - 5)
            </h3>
            <p className="text-xs text-gray-500">Consistent upward trend with current semester at an all-time peak SGPA 8.9</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            Current CGPA: 8.70 / 10.0
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {semesterTrend.map((sem, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-center transition-all ${
                idx === 4
                  ? "bg-indigo-50/70 border-indigo-300 shadow-sm scale-102"
                  : "bg-slate-50 border-gray-200 hover:bg-white"
              }`}
            >
              <p className="text-xs font-bold text-gray-500 uppercase">{sem.sem}</p>
              <h4 className="text-2xl font-black text-[#003566] my-1">{sem.sgpa}</h4>
              <p className="text-[11px] text-gray-500">CGPA: {sem.cgpa}</p>
              <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-white border border-gray-200 text-gray-700">
                {sem.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Competencies & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Core Subject Competencies */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaLightbulb className="text-amber-500" /> Subject Mastery & Competencies
          </h3>
          <div className="space-y-4">
            {competencies.map((comp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-800">{comp.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">{comp.level}%</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-gray-600 rounded text-[10px]">
                      {comp.badge}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    style={{ width: `${comp.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accolades & Badges */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" /> Honors & Special Recognition
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <FaMedal className="text-amber-500 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-xs text-amber-900">Dean’s Honor Roll List</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">Awarded for ranking in top 5th percentile of the computer science cohort.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                <FaTrophy className="text-blue-500 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-xs text-blue-900">Smart India Hackathon Finalist</h4>
                  <p className="text-[11px] text-blue-800 mt-0.5">Represented the institute at national level for ERP & AI innovations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <FaCheckCircle className="text-emerald-500 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-xs text-emerald-900">AWS Certified Cloud Practitioner</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">Completed external industry accreditation via university credit waiver.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t text-xs text-gray-500 text-center">
            All certifications verified via institutional DigiLocker wallet.
          </div>
        </div>
      </div>

      {/* Faculty Mentor Feedback & Remarks */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaComments className="text-indigo-600" /> Faculty Mentor Feedback & Counseling Notes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentorReviews.map((rev, idx) => (
            <div key={idx} className="p-5 bg-slate-50 border border-gray-100 rounded-xl flex flex-col justify-between hover:shadow-sm transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      <FaUserTie />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{rev.author}</h4>
                      <p className="text-[10px] text-gray-500">{rev.role}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic leading-relaxed pt-2">
                  "{rev.comment}"
                </p>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 text-right">{rev.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Book PTM Modal */}
      <AnimatePresence>
        {showPtmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowPtmModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={16} />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-1">Book Parent-Teacher Meeting (PTM)</h3>
              <p className="text-xs text-gray-500 mb-4">
                Schedule a 1-on-1 virtual or in-person session with your ward's faculty mentor.
              </p>

              {bookingConfirmed ? (
                <div className="p-6 text-center text-emerald-600 space-y-2">
                  <FaCheckCircle size={40} className="mx-auto" />
                  <p className="font-bold text-sm">Meeting Confirmed!</p>
                  <p className="text-xs text-gray-600">
                    Your appointment with <strong>{selectedFaculty}</strong> on <strong>{meetingDate}</strong> at <strong>{meetingTime}</strong> has been booked. Meeting link sent to your registered email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePtmSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Select Faculty / Mentor</label>
                    <select
                      value={selectedFaculty}
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                      className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option>Dr. A. Verma (Faculty Mentor)</option>
                      <option>Prof. R. Sen (Computer Networks)</option>
                      <option>Dr. K. Iyer (HOD Computer Science)</option>
                      <option>Dr. M. Roy (Applied Physics)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Preferred Time Slot</label>
                    <select
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option>10:00 AM - 10:30 AM (Online Google Meet)</option>
                      <option>11:30 AM - 12:00 PM (In-Person Office)</option>
                      <option>03:00 PM - 03:30 PM (Online Google Meet)</option>
                      <option>04:30 PM - 05:00 PM (In-Person Office)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Discussion Agenda (Optional)</label>
                    <textarea
                      rows={2}
                      value={meetingReason}
                      onChange={(e) => setMeetingReason(e.target.value)}
                      placeholder="e.g. Physics attendance improvement, placement preparation..."
                      className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPtmModal(false)}
                      className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                    >
                      Confirm Appointment
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

export default StudentProgress;