import React, { useState } from "react";
import { FaSave, FaEdit } from "react-icons/fa";

const GradeEntryPage = ({ facultySubject = "OOP" }) => {
  // Sample students and grades data
  const [grades, setGrades] = useState([
    { id: 1, student: "John Doe", rollNo: "CSE-2023-01", branch: "CSE", semester: "3rd", assignment: "Lab 1", grade: "", status: "Pending" },
    { id: 2, student: "Jane Smith", rollNo: "CSE-2023-02", branch: "CSE", semester: "3rd", assignment: "Lab 2", grade: "A", status: "Completed" },
    { id: 3, student: "Mark Lee", rollNo: "CSE-2023-03", branch: "CSE", semester: "3rd", assignment: "Theory Assignment", grade: "", status: "Pending" },
  ]);

  const [newEntry, setNewEntry] = useState({ student: "", rollNo: "", branch: "CSE", semester: "3rd", assignment: "", grade: "" });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const studentSuggestions = [
    { name: "John Doe", roll: "CSE-2023-01", branch: "CSE", semester: "3rd" },
    { name: "Jane Smith", roll: "CSE-2023-02", branch: "CSE", semester: "3rd" },
    { name: "Mark Lee", roll: "CSE-2023-03", branch: "CSE", semester: "3rd" },
    { name: "Rahul Kumar", roll: "CSE-2023-04", branch: "CSE", semester: "3rd" },
    { name: "Priya Sharma", roll: "CSE-2023-05", branch: "CSE", semester: "3rd" },
    { name: "Amit Patel", roll: "CSE-2023-06", branch: "CSE", semester: "3rd" }
  ];

  const filteredSuggestions = studentSuggestions.filter(s => 
    s.name.toLowerCase().includes(newEntry.student.toLowerCase()) || 
    s.roll.toLowerCase().includes(newEntry.student.toLowerCase())
  );

  // Add new grade entry
  const addGradeEntry = () => {
    if (newEntry.student && newEntry.rollNo && newEntry.assignment && newEntry.grade) {
      setGrades([...grades, { ...newEntry, id: Date.now(), status: "Completed" }]);
      setNewEntry({ student: "", rollNo: "", branch: "CSE", semester: "3rd", assignment: "", grade: "" });
    }
  };

  // Update grade
  const updateGrade = (id, newGrade) => {
    setGrades(grades.map(g => g.id === id ? { ...g, grade: newGrade, status: newGrade ? "Completed" : "Pending" } : g));
  };

  // Filter grades based on faculty subject (optional, if assignments have subject)
  const facultyGrades = grades;

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen">
      {/* Header / Stats */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{facultySubject} Grade Entry</h2>
          <p className="text-gray-600 mt-1">Input and update grades for {facultySubject} assignments and exams</p>
        </div>

        <div className="flex gap-6">
          <div className="bg-white rounded-lg shadow p-4 text-center min-w-[140px]">
            <p className="text-gray-500">Pending Entries</p>
            <p className="text-xl font-bold text-[#ffc300]">{facultyGrades.filter(g => g.status === "Pending").length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center min-w-[140px]">
            <p className="text-gray-500">Last Updated</p>
            <p className="text-xl font-bold text-[#003566]">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Grade Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-4xl">
        <h3 className="text-lg font-semibold mb-4">Enter New Grade</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Student Name / Roll No"
              value={newEntry.student}
              onChange={(e) => {
                setNewEntry({ ...newEntry, student: e.target.value });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="p-3 border rounded-lg outline-none w-full"
            />
            {showSuggestions && newEntry.student && filteredSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                {filteredSuggestions.map((s, i) => (
                  <li 
                    key={i}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex justify-between"
                    onClick={() => {
                      setNewEntry({ ...newEntry, student: s.name, rollNo: s.roll, branch: s.branch, semester: s.semester });
                      setShowSuggestions(false);
                    }}
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-gray-500 text-xs">{s.roll}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            type="text"
            placeholder="Roll No"
            value={newEntry.rollNo}
            onChange={(e) => setNewEntry({ ...newEntry, rollNo: e.target.value })}
            className="p-3 border rounded-lg outline-none w-full"
          />
          <select
            value={newEntry.branch}
            onChange={(e) => setNewEntry({ ...newEntry, branch: e.target.value })}
            className="p-3 border rounded-lg w-full"
          >
            <option value="CSE">CSE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Electrical">Electrical</option>
          </select>
          <select
            value={newEntry.semester}
            onChange={(e) => setNewEntry({ ...newEntry, semester: e.target.value })}
            className="p-3 border rounded-lg w-full"
          >
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
            <option value="3rd">3rd</option>
            <option value="4th">4th</option>
            <option value="5th">5th</option>
            <option value="6th">6th</option>
            <option value="7th">7th</option>
            <option value="8th">8th</option>
          </select>
          <select
            value={newEntry.assignment}
            onChange={(e) => setNewEntry({ ...newEntry, assignment: e.target.value })}
            className="p-3 border rounded-lg w-full outline-none bg-white"
          >
            <option value="" disabled>Select Assessment</option>
            <option value="Lab 1">Lab 1</option>
            <option value="Lab 2">Lab 2</option>
            <option value="Lab 3">Lab 3</option>
            <option value="Theory Assignment 1">Theory Assignment 1</option>
            <option value="Theory Assignment 2">Theory Assignment 2</option>
            <option value="Mid-Term Exam">Mid-Term Exam</option>
            <option value="End-Term Exam">End-Term Exam</option>
          </select>
          <select
            value={newEntry.grade}
            onChange={(e) => setNewEntry({ ...newEntry, grade: e.target.value })}
            className="p-3 border rounded-lg w-full outline-none bg-white"
          >
            <option value="" disabled>Select Grade</option>
            <option value="O">O (Outstanding)</option>
            <option value="A+">A+ (Excellent)</option>
            <option value="A">A (Very Good)</option>
            <option value="B+">B+ (Good)</option>
            <option value="B">B (Above Average)</option>
            <option value="C">C (Average)</option>
            <option value="F">F (Fail)</option>
          </select>
        </div>
        <button
          onClick={addGradeEntry}
          className="mt-4 bg-[#003566] text-white px-6 py-2 rounded-lg hover:bg-[#ffc300] hover:text-black transition-colors flex items-center gap-2"
        >
          <FaSave /> Save Grade
        </button>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-6xl">
        <h3 className="text-lg font-semibold mb-4">{facultySubject} Grade Entries</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Student</th>
                <th className="py-2 px-4 border-b">Roll No</th>
                <th className="py-2 px-4 border-b">Branch</th>
                <th className="py-2 px-4 border-b">Semester</th>
                <th className="py-2 px-4 border-b">Assignment / Exam</th>
                <th className="py-2 px-4 border-b">Grade</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyGrades.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-4 border-b">{entry.student}</td>
                  <td className="py-2 px-4 border-b text-gray-500">{entry.rollNo}</td>
                  <td className="py-2 px-4 border-b">{entry.branch}</td>
                  <td className="py-2 px-4 border-b">{entry.semester}</td>
                  <td className="py-2 px-4 border-b">{entry.assignment}</td>
                  <td className="py-2 px-4 border-b">
                    <select
                      value={entry.grade}
                      onChange={(e) => updateGrade(entry.id, e.target.value)}
                      className="p-1 border rounded w-20 outline-none bg-white"
                    >
                      <option value="" disabled>-</option>
                      <option value="O">O</option>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="F">F</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 border-b">{entry.status}</td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                  </td>
                </tr>
              ))}
              {facultyGrades.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No grade entries for {facultySubject}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradeEntryPage;
