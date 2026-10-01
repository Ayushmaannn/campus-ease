import React, { useState } from "react";
import {
  FaCheckCircle, FaTimesCircle, FaSearch, FaFilter,
  FaDownload, FaUserPlus, FaEye, FaTimes, FaGraduationCap
} from "react-icons/fa";

const AdmissionsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);

  const [applications, setApplications] = useState([
    { id: "APP-101", name: "John Doe", email: "john.doe@example.com", course: "Computer Engineering", score: "94.5%", status: "Pending", appliedDate: "28 Sep 2026", category: "General" },
    { id: "APP-102", name: "Jane Smith", email: "jane.smith@example.com", course: "Mechanical Engineering", score: "89.2%", status: "Approved", appliedDate: "25 Sep 2026", category: "OBC" },
    { id: "APP-103", name: "Alex Johnson", email: "alex.j@example.com", course: "Electrical Engineering", score: "72.4%", status: "Rejected", appliedDate: "20 Sep 2026", category: "General" },
    { id: "APP-104", name: "Mary Williams", email: "mary.w@example.com", course: "Civil Engineering", score: "88.1%", status: "Pending", appliedDate: "29 Sep 2026", category: "SC/ST" },
    { id: "APP-105", name: "Michael Brown", email: "m.brown@example.com", course: "Computer Engineering", score: "96.0%", status: "Approved", appliedDate: "22 Sep 2026", category: "General" },
    { id: "APP-106", name: "Emily Davis", email: "emily.d@example.com", course: "Mechanical Engineering", score: "85.7%", status: "Pending", appliedDate: "27 Sep 2026", category: "EWS" },
    { id: "APP-107", name: "David Wilson", email: "david.w@example.com", course: "Electrical Engineering", score: "91.3%", status: "Approved", appliedDate: "24 Sep 2026", category: "General" },
    { id: "APP-108", name: "Sarah Miller", email: "sarah.m@example.com", course: "Civil Engineering", score: "69.8%", status: "Rejected", appliedDate: "18 Sep 2026", category: "General" },
    { id: "APP-109", name: "Daniel Anderson", email: "daniel.a@example.com", course: "Computer Engineering", score: "92.4%", status: "Pending", appliedDate: "30 Sep 2026", category: "General" },
    { id: "APP-110", name: "Laura Thomas", email: "laura.t@example.com", course: "Mechanical Engineering", score: "88.9%", status: "Approved", appliedDate: "23 Sep 2026", category: "OBC" },
    { id: "APP-111", name: "James Jackson", email: "james.j@example.com", course: "Electrical Engineering", score: "84.2%", status: "Pending", appliedDate: "29 Sep 2026", category: "General" },
    { id: "APP-112", name: "Olivia White", email: "olivia.w@example.com", course: "Civil Engineering", score: "90.5%", status: "Approved", appliedDate: "21 Sep 2026", category: "General" },
  ]);

  const handleUpdateStatus = (id, newStatus) => {
    setApplications(prev => prev.map(app => (app.id === id ? { ...app, status: newStatus } : app)));
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp(prev => ({ ...prev, status: newStatus }));
    }
  };

  const filtered = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const matchesCourse = courseFilter === "All" || app.course === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const totalPending = applications.filter(a => a.status === "Pending").length;
  const totalApproved = applications.filter(a => a.status === "Approved").length;
  const totalRejected = applications.filter(a => a.status === "Rejected").length;

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["ID,Name,Email,Course,Entrance Score,Status,Applied Date,Category"]
        .concat(applications.map(a => `${a.id},${a.name},${a.email},${a.course},${a.score},${a.status},${a.appliedDate},${a.category}`))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Admissions_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#003566]">Admissions Management</h1>
          <p className="text-gray-600 mt-1">
            Evaluate, verify, and approve candidate applications for Academic Session 2026-27.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold shadow-xs transition"
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-xs uppercase font-bold text-gray-400">Total Applicants</span>
          <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{applications.length}</h3>
          <p className="text-xs text-gray-500 mt-1">Central Merit List</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-xs uppercase font-bold text-amber-500">Pending Review</span>
          <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{totalPending}</h3>
          <p className="text-xs text-amber-600 font-semibold mt-1">Requires Action</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-xs uppercase font-bold text-emerald-500">Approved Seats</span>
          <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{totalApproved}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Enrolled & Confirmed</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-xs uppercase font-bold text-rose-500">Rejected</span>
          <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{totalRejected}</h3>
          <p className="text-xs text-gray-500 mt-1">Did not meet cutoff</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search candidate by name, application ID, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="All">All Programs</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 text-gray-600 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="p-4">App ID & Name</th>
                <th className="p-4">Program Applied</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4 text-center">Applied On</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{app.name}</div>
                    <div className="text-xs text-gray-400">{app.id} • {app.email}</div>
                  </td>
                  <td className="p-4 font-medium text-gray-700">{app.course}</td>
                  <td className="p-4 text-center font-bold text-indigo-700">{app.score}</td>
                  <td className="p-4 text-center text-xs text-gray-500">{app.appliedDate}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      app.status === "Approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : app.status === "Rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="View details"
                      >
                        <FaEye size={13} />
                      </button>

                      {app.status === "Pending" ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.id, "Approved")}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, "Rejected")}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(app.id, "Pending")}
                          className="px-2.5 py-1 text-xs text-gray-400 hover:text-gray-600 border rounded-lg transition"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={16} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Application Dossier</h3>
            <p className="text-xs text-gray-400 mb-4">{selectedApp.id}</p>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border mb-6">
              <div className="flex justify-between"><span className="text-gray-500 font-semibold">Candidate:</span> <span className="font-bold text-gray-800">{selectedApp.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-semibold">Email:</span> <span>{selectedApp.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-semibold">Program:</span> <span className="font-semibold text-indigo-700">{selectedApp.course}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-semibold">Entrance Cutoff Score:</span> <span className="font-bold text-emerald-600">{selectedApp.score}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-semibold">Reservation Category:</span> <span>{selectedApp.category}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-semibold">Application Date:</span> <span>{selectedApp.appliedDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-semibold">Current State:</span> <span className="font-bold">{selectedApp.status}</span></div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { handleUpdateStatus(selectedApp.id, "Rejected"); setSelectedApp(null); }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition"
              >
                Reject Application
              </button>
              <button
                onClick={() => { handleUpdateStatus(selectedApp.id, "Approved"); setSelectedApp(null); }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-xs"
              >
                Approve & Allocate Seat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionsPage;
