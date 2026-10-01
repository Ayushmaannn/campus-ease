import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaWallet, FaBook, FaChartLine, FaEnvelope } from "react-icons/fa";

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  const [studentStats, setStudentStats] = useState({
    attendance: "-",
    feeDue: "-",
    examsTaken: "-",
    progressScore: "-",
  });

  const [upcomingEvents, setUpcomingEvents] = useState([
    { date: "2025-09-14", event: "Math Assignment Submission" },
    { date: "2025-09-16", event: "Physics Lab Exam" },
    { date: "2025-09-18", event: "Fee Due Reminder" },
  ]);

  const [recentMessages, setRecentMessages] = useState([
    { date: "2025-09-12", from: "Math Teacher", message: "Homework feedback uploaded." },
    { date: "2025-09-10", from: "Principal", message: "School maintenance on Friday." },
  ]);

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = { "Authorization": `Bearer ${token}` };
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        
        const childrenRes = await fetch(`${apiUrl}/parent/children`, { headers });
        if (!childrenRes.ok) return;
        const childrenData = await childrenRes.json();
        setChildren(childrenData);
        
        if (childrenData.length > 0) {
          const childId = childrenData[0].id;
          setSelectedChild(childrenData[0]);
          
          // Fetch attendance
          const attRes = await fetch(`${apiUrl}/parent/child/${childId}/attendance`, { headers });
          const attData = attRes.ok ? await attRes.json() : [];
          
          // Fetch fees
          const feeRes = await fetch(`${apiUrl}/parent/child/${childId}/fees`, { headers });
          const feeData = feeRes.ok ? await feeRes.json() : [];
          
          // Fetch results
          const resRes = await fetch(`${apiUrl}/parent/child/${childId}/results`, { headers });
          const resData = resRes.ok ? await resRes.json() : [];
          
          // Calculate stats
          const present = attData.filter(a => a.status === 'present').length;
          const attPct = attData.length > 0 ? Math.round((present / attData.length) * 100) : 0;
          
          const totalFee = feeData.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0);
          
          let score = 0;
          if (resData.length > 0) {
             const totalMarks = resData.reduce((sum, r) => sum + r.marks, 0);
             const maxMarks = resData.reduce((sum, r) => sum + r.max_marks, 0);
             score = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;
          }

          setStudentStats({
            attendance: `${attPct}%`,
            feeDue: `₹${totalFee}`,
            examsTaken: resData.length,
            progressScore: `${score}%`,
          });
        }
      } catch (err) {
        console.error("Failed to fetch parent data", err);
      }
    };
    fetchParentData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#003566]">
            Welcome, Parent of {selectedChild ? selectedChild.full_name : 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2">Here’s the latest academic overview of your child.</p>
        </div>
        {children.length > 1 && (
          <select 
            className="p-2 border rounded shadow-sm outline-none"
            onChange={(e) => {
              const child = children.find(c => c.id === e.target.value);
              if (child) setSelectedChild(child);
              // In a real app, this would re-trigger the fetches
            }}
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.full_name}</option>
            ))}
          </select>
        )}
      </header>

      {/* Stats Inline */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 text-gray-700">
        <div className="flex items-center gap-3 border-b-2 border-blue-600 pb-2">
          <FaCalendarAlt className="text-blue-600" size={24} />
          <div>
            <p className="font-semibold">Attendance</p>
            <p className="text-lg">{studentStats.attendance}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b-2 border-yellow-500 pb-2">
          <FaWallet className="text-yellow-500" size={24} />
          <div>
            <p className="font-semibold">Fee Due</p>
            <p className="text-lg">{studentStats.feeDue}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b-2 border-pink-500 pb-2">
          <FaBook className="text-pink-500" size={24} />
          <div>
            <p className="font-semibold">Exams Taken</p>
            <p className="text-lg">{studentStats.examsTaken}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b-2 border-indigo-500 pb-2">
          <FaChartLine className="text-indigo-500" size={24} />
          <div>
            <p className="font-semibold">Progress Score</p>
            <p className="text-lg">{studentStats.progressScore}</p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#003566] mb-4">Upcoming Events</h2>
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-[#003566] text-white">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Event</th>
            </tr>
          </thead>
          <tbody>
            {upcomingEvents.map((event, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="p-3">{event.date}</td>
                <td className="p-3">{event.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Recent Messages */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#003566] mb-4">Recent Messages</h2>
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">From</th>
              <th className="p-3 text-left">Message</th>
            </tr>
          </thead>
          <tbody>
            {recentMessages.map((msg, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="p-3">{msg.date}</td>
                <td className="p-3">{msg.from}</td>
                <td className="p-3">{msg.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 mt-12">
        &copy; 2025 University ERP System. All Rights Reserved.
      </footer>
    </div>
  );
};

export default ParentDashboard;
