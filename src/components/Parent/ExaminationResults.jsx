import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaAward, FaDownload, FaCheckCircle, FaFilePdf,
  FaCalendarAlt, FaUserGraduate, FaStar, FaShieldAlt
} from "react-icons/fa";

const ExaminationResults = () => {
  const [selectedSemester, setSelectedSemester] = useState(5);

  const semestersData = {
    5: {
      sgpa: 8.9,
      cgpa: 8.7,
      credits: 24,
      status: "Passed - First Class with Distinction",
      examSession: "Autumn 2026",
      subjects: [
        { code: "CS501", name: "Data Structures & Algorithms", credits: 4, internal: 28, endTerm: 64, total: 92, grade: "O", points: 10 },
        { code: "CS502", name: "Computer Networks & Protocols", credits: 4, internal: 27, endTerm: 61, total: 88, grade: "A+", points: 9 },
        { code: "CS503", name: "Database Management Systems", credits: 4, internal: 26, endTerm: 58, total: 84, grade: "A+", points: 9 },
        { code: "CS504", name: "Operating Systems Architecture", credits: 4, internal: 25, endTerm: 55, total: 80, grade: "A", points: 8 },
        { code: "PHY201", name: "Applied Physics 201", credits: 4, internal: 24, endTerm: 52, total: 76, grade: "A", points: 8 },
        { code: "CS505P", name: "Networks & OS Laboratory", credits: 4, internal: 29, endTerm: 68, total: 97, grade: "O", points: 10 },
      ]
    },
    4: {
      sgpa: 8.6,
      cgpa: 8.65,
      credits: 22,
      status: "Passed - First Class with Distinction",
      examSession: "Spring 2026",
      subjects: [
        { code: "CS401", name: "Design & Analysis of Algorithms", credits: 4, internal: 27, endTerm: 58, total: 85, grade: "A+", points: 9 },
        { code: "CS402", name: "Theory of Computation", credits: 4, internal: 24, endTerm: 52, total: 76, grade: "A", points: 8 },
        { code: "CS403", name: "Microprocessors & Microcontrollers", credits: 4, internal: 25, endTerm: 56, total: 81, grade: "A", points: 8 },
        { code: "MATH401", name: "Discrete Mathematical Structures", credits: 4, internal: 28, endTerm: 60, total: 88, grade: "A+", points: 9 },
        { code: "CS405P", name: "Algorithms Laboratory", credits: 6, internal: 29, endTerm: 65, total: 94, grade: "O", points: 10 },
      ]
    },
    3: {
      sgpa: 8.7,
      cgpa: 8.68,
      credits: 22,
      status: "Passed - First Class with Distinction",
      examSession: "Autumn 2025",
      subjects: [
        { code: "CS301", name: "Object Oriented Programming (Java)", credits: 4, internal: 28, endTerm: 62, total: 90, grade: "O", points: 10 },
        { code: "CS302", name: "Digital Logic & Computer Design", credits: 4, internal: 26, endTerm: 57, total: 83, grade: "A+", points: 9 },
        { code: "CS303", name: "Data Structures Basics", credits: 4, internal: 27, endTerm: 59, total: 86, grade: "A+", points: 9 },
        { code: "MATH301", name: "Probability & Statistics", credits: 4, internal: 25, endTerm: 53, total: 78, grade: "A", points: 8 },
        { code: "CS305P", name: "OOP Lab", credits: 6, internal: 29, endTerm: 64, total: 93, grade: "O", points: 10 },
      ]
    },
    2: {
      sgpa: 8.5,
      cgpa: 8.66,
      credits: 20,
      status: "Passed - First Class",
      examSession: "Spring 2025",
      subjects: [
        { code: "ENG201", name: "Engineering Mathematics II", credits: 4, internal: 24, endTerm: 54, total: 78, grade: "A", points: 8 },
        { code: "ENG202", name: "Basic Electrical Engineering", credits: 4, internal: 26, endTerm: 56, total: 82, grade: "A", points: 8 },
        { code: "ENG203", name: "Programming for Problem Solving", credits: 4, internal: 29, endTerm: 66, total: 95, grade: "O", points: 10 },
        { code: "ENG204", name: "Engineering Chemistry", credits: 4, internal: 25, endTerm: 55, total: 80, grade: "A", points: 8 },
        { code: "ENG205P", name: "Programming Lab", credits: 4, internal: 28, endTerm: 62, total: 90, grade: "O", points: 10 },
      ]
    },
    1: {
      sgpa: 8.8,
      cgpa: 8.8,
      credits: 20,
      status: "Passed - First Class with Distinction",
      examSession: "Autumn 2024",
      subjects: [
        { code: "ENG101", name: "Engineering Mathematics I", credits: 4, internal: 27, endTerm: 61, total: 88, grade: "A+", points: 9 },
        { code: "ENG102", name: "Engineering Physics", credits: 4, internal: 26, endTerm: 58, total: 84, grade: "A+", points: 9 },
        { code: "ENG103", name: "Basic Electronics", credits: 4, internal: 25, endTerm: 57, total: 82, grade: "A", points: 8 },
        { code: "ENG104", name: "Professional Communication", credits: 4, internal: 28, endTerm: 63, total: 91, grade: "O", points: 10 },
        { code: "ENG105P", name: "Physics & Electronics Lab", credits: 4, internal: 29, endTerm: 65, total: 94, grade: "O", points: 10 },
      ]
    }
  };

  const currentData = semestersData[selectedSemester] || semestersData[5];

  const handleDownloadMarksheet = () => {
    const content = `QUICKCAMPUS UNIVERSITY - GRADE MARKSHEET\n` +
      `Student: Ayushman Sharma | Roll No: 2024CS108 | Semester: ${selectedSemester}\n` +
      `Session: ${currentData.examSession} | SGPA: ${currentData.sgpa} | CGPA: ${currentData.cgpa}\n` +
      `Result: ${currentData.status}\n\n` +
      `SUBJECTS:\n` +
      currentData.subjects.map(s => `${s.code} - ${s.name} | Total: ${s.total}/100 | Grade: ${s.grade} (${s.points} pts)`).join('\n') +
      `\n\nBlockchain Hash: 0x8a92c019fe8274d1a04918e9f28148b11c\nDigiLocker Verified Institutional Marksheet.`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Semester_${selectedSemester}_Marksheet_2024CS108.txt`;
    a.click();
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#003566]">Examination Results & Marksheet</h1>
          <p className="text-gray-600 mt-1">
            Certified semester performance, subject grades, and DigiLocker blockchain credentials.
          </p>
        </div>
        <button
          onClick={handleDownloadMarksheet}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#003566] hover:bg-[#00284d] text-white rounded-xl text-sm font-semibold shadow-md transition"
        >
          <FaDownload /> Download Marksheet (PDF)
        </button>
      </div>

      {/* Ward Info & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <FaUserGraduate />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase">Student</p>
            <h3 className="font-bold text-gray-800 text-sm">Ayushman Sharma</h3>
            <p className="text-xs text-gray-500">Roll: 2024CS108</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase">Semester SGPA</p>
            <h3 className="text-2xl font-extrabold text-[#003566]">{currentData.sgpa} <span className="text-xs text-gray-400 font-normal">/ 10.0</span></h3>
            <p className="text-xs text-emerald-600 font-semibold">Distinction Grade</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FaStar />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase">Cumulative CGPA</p>
            <h3 className="text-2xl font-extrabold text-indigo-600">{currentData.cgpa} <span className="text-xs text-gray-400 font-normal">/ 10.0</span></h3>
            <p className="text-xs text-indigo-500 font-semibold">Department Top 5%</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FaAward />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase">Credits Cleared</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{currentData.credits} / {currentData.credits}</h3>
            <p className="text-xs text-emerald-600 font-semibold">100% Cleared</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FaCheckCircle />
          </div>
        </div>
      </div>

      {/* Semester Selector Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[5, 4, 3, 2, 1].map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-xs ${
              selectedSemester === sem
                ? "bg-[#003566] text-white shadow-md scale-102"
                : "bg-white text-gray-700 hover:bg-slate-100 border border-gray-200"
            }`}
          >
            Semester {sem} {sem === 5 ? "(Latest)" : ""}
          </button>
        ))}
      </div>

      {/* Official Marksheet Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Official University Transcript</span>
            <h3 className="font-extrabold text-gray-800 text-lg">
              Semester {selectedSemester} Grade Sheet • {currentData.examSession}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
            <FaShieldAlt className="text-emerald-500" /> DigiLocker Verified
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 text-gray-600 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="p-4">Subject Code & Name</th>
                <th className="p-4 text-center">Credits</th>
                <th className="p-4 text-center">Internal (30)</th>
                <th className="p-4 text-center">End Term (70)</th>
                <th className="p-4 text-center">Total (100)</th>
                <th className="p-4 text-center">Grade</th>
                <th className="p-4 text-center">Grade Point</th>
                <th className="p-4 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.subjects.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{sub.name}</div>
                    <div className="text-xs text-gray-400">{sub.code}</div>
                  </td>
                  <td className="p-4 text-center font-medium">{sub.credits}</td>
                  <td className="p-4 text-center">{sub.internal}</td>
                  <td className="p-4 text-center">{sub.endTerm}</td>
                  <td className="p-4 text-center font-bold text-gray-900">{sub.total}</td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {sub.grade}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-indigo-900">{sub.points}</td>
                  <td className="p-4 text-center text-emerald-600 font-semibold">Pass</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary in Marksheet */}
        <div className="p-5 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <p className="font-semibold text-gray-700">Grading Scale: O (10) Outstanding, A+ (9) Excellent, A (8) Very Good, B+ (7) Good</p>
            <p className="text-gray-400 mt-0.5">Blockchain Verification Hash: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px]">0x8a92...e14f</code></p>
          </div>
          <div className="text-right">
            <span className="text-gray-500 font-medium">Result Status: </span>
            <span className="font-extrabold text-emerald-700 text-sm">{currentData.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExaminationResults;