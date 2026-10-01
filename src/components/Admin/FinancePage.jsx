import React, { useState } from "react";
import {
  FaDollarSign, FaCheckCircle, FaTimesCircle, FaDownload,
  FaSearch, FaFilter, FaMoneyBillWave, FaPlus, FaTimes,
  FaBell, FaReceipt
} from "react-icons/fa";

const FinancePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCourse, setFilterCourse] = useState("All");
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [reminderSent, setReminderSent] = useState(null);

  const [students, setStudents] = useState([
    { id: "STU-01", name: "John Doe", course: "Computer Engineering", feeStatus: "Paid", amount: 50000, paidDate: "10-Aug-2026", paymentMode: "Online UPI" },
    { id: "STU-02", name: "Jane Smith", course: "Mechanical Engineering", feeStatus: "Pending", amount: 45000, paidDate: "-", paymentMode: "-" },
    { id: "STU-03", name: "Alex Johnson", course: "Electrical Engineering", feeStatus: "Paid", amount: 48000, paidDate: "15-Aug-2026", paymentMode: "Net Banking" },
    { id: "STU-04", name: "Mary Williams", course: "Civil Engineering", feeStatus: "Pending", amount: 47000, paidDate: "-", paymentMode: "-" },
    { id: "STU-05", name: "Michael Brown", course: "Computer Engineering", feeStatus: "Paid", amount: 50000, paidDate: "05-Aug-2026", paymentMode: "Debit Card" },
    { id: "STU-06", name: "Emily Davis", course: "Mechanical Engineering", feeStatus: "Pending", amount: 45000, paidDate: "-", paymentMode: "-" },
    { id: "STU-07", name: "David Wilson", course: "Electrical Engineering", feeStatus: "Paid", amount: 48000, paidDate: "18-Aug-2026", paymentMode: "Online UPI" },
    { id: "STU-08", name: "Sarah Miller", course: "Civil Engineering", feeStatus: "Paid", amount: 47000, paidDate: "12-Aug-2026", paymentMode: "Cheque" },
  ]);

  // Modal State
  const [newStudentName, setNewStudentName] = useState("");
  const [newCourse, setNewCourse] = useState("Computer Engineering");
  const [newAmount, setNewAmount] = useState("50000");
  const [newMode, setNewMode] = useState("Online UPI");

  const totalCollected = students
    .filter(s => s.feeStatus === "Paid")
    .reduce((sum, s) => sum + s.amount, 0);

  const totalPending = students
    .filter(s => s.feeStatus === "Pending")
    .reduce((sum, s) => sum + s.amount, 0);

  const handleToggleStatus = (id) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.feeStatus === "Paid" ? "Pending" : "Paid";
        return {
          ...s,
          feeStatus: nextStatus,
          paidDate: nextStatus === "Paid" ? new Date().toLocaleDateString('en-GB') : "-",
          paymentMode: nextStatus === "Paid" ? "Counter / Cash" : "-"
        };
      }
      return s;
    }));
  };

  const handleSendReminder = (name) => {
    setReminderSent(name);
    setTimeout(() => setReminderSent(null), 2500);
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!newStudentName) return;

    const newRecord = {
      id: `STU-${String(students.length + 1).padStart(2, "0")}`,
      name: newStudentName,
      course: newCourse,
      feeStatus: "Paid",
      amount: Number(newAmount),
      paidDate: new Date().toLocaleDateString('en-GB'),
      paymentMode: newMode,
    };

    setStudents(prev => [newRecord, ...prev]);
    setShowCollectModal(false);
    setNewStudentName("");
  };

  const handleExportReport = () => {
    const csv = "data:text/csv;charset=utf-8," +
      ["Student ID,Name,Course,Amount,Status,Paid Date,Payment Mode"]
        .concat(students.map(s => `${s.id},${s.name},${s.course},₹${s.amount},${s.feeStatus},${s.paidDate},${s.paymentMode}`))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Finance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || s.feeStatus === filterStatus;
    const matchesCourse = filterCourse === "All" || s.course === filterCourse;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#003566]">Financial Accounting & Fee Dues</h1>
          <p className="text-gray-600 mt-1">
            Audit tuition fee collections, pending student arrears, payment modes, and ledger reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCollectModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
          >
            <FaPlus /> Record Counter Payment
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#003566] hover:bg-[#00284d] text-white rounded-xl text-sm font-semibold shadow-md transition"
          >
            <FaDownload /> Export Report (CSV)
          </button>
        </div>
      </div>

      {/* Reminder notification toast */}
      {reminderSent && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <FaBell /> Payment reminder notification sent to parent of <strong>{reminderSent}</strong> via SMS and Email.
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Fee Collected</h2>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">Recovery rate: 71.4%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FaCheckCircle />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Pending Dues</h2>
            <p className="text-3xl font-extrabold text-rose-600 mt-1">₹{totalPending.toLocaleString('en-IN')}</p>
            <p className="text-xs text-rose-500 font-semibold mt-1">3 Student Defaulters</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
            <FaMoneyBillWave />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Enrolled Candidates</h2>
            <p className="text-3xl font-extrabold text-[#003566] mt-1">{students.length}</p>
            <p className="text-xs text-gray-400 mt-1">Active Accounts</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <FaReceipt />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by student name, ID, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="All">All Fee Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
        </div>
      </div>

      {/* Fee Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-slate-50 text-gray-600 uppercase text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-left">Program</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Payment Mode</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {student.name}
                    <span className="block text-[11px] text-gray-400 font-normal">{student.id}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.course}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">₹{student.amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      student.feeStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {student.feeStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{student.paymentMode}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{student.paidDate}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(student.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          student.feeStatus === "Paid"
                            ? "bg-slate-100 text-gray-600 hover:bg-slate-200"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        }`}
                      >
                        {student.feeStatus === "Paid" ? "Mark Pending" : "Collect Fee"}
                      </button>

                      {student.feeStatus === "Pending" && (
                        <button
                          onClick={() => handleSendReminder(student.name)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-lg text-xs font-semibold transition"
                          title="Send reminder to parent"
                        >
                          <FaBell size={10} className="inline mr-1" /> Remind
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

      {/* Record Payment Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCollectModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={16} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Record Counter Payment</h3>
            <p className="text-xs text-gray-500 mb-4">Add direct cash, cheque, or POS card payment to ledger.</p>

            <form onSubmit={handleAddPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Patel"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Department</label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option>Computer Engineering</option>
                  <option>Mechanical Engineering</option>
                  <option>Electrical Engineering</option>
                  <option>Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Amount Paid (INR)</label>
                <input
                  type="number"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Payment Method</label>
                <select
                  value={newMode}
                  onChange={(e) => setNewMode(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option>Counter Cash</option>
                  <option>Demand Draft / Cheque</option>
                  <option>POS Debit/Credit Card</option>
                  <option>Direct Bank NEFT</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
