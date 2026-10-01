import React, { useState } from "react";
import {
  FaUserCog, FaUserShield, FaCheckCircle, FaTimes,
  FaEdit, FaSave, FaLock, FaKey, FaHistory, FaShieldAlt
} from "react-icons/fa";

const ProfilePage = () => {
  const [adminProfile, setAdminProfile] = useState({
    name: "Dr. Rajeshwar Rao",
    email: "admin.rajeshwar@quickcampus.edu",
    phone: "+91 98112 34567",
    designation: "Chief Administrative Officer & Registrar",
    department: "Executive Administration",
    joiningDate: "15-Jun-2018",
    accessLevel: "Super Administrator (Level 1)",
    twoFactorEnabled: true,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(adminProfile.name);
  const [editEmail, setEditEmail] = useState(adminProfile.email);
  const [editPhone, setEditPhone] = useState(adminProfile.phone);
  const [editDesignation, setEditDesignation] = useState(adminProfile.designation);

  // Role permissions
  const [permissions, setPermissions] = useState({
    admissionsApproval: true,
    financeAccess: true,
    hostelAllocation: true,
    assetManagement: true,
    grievanceRedressal: true,
    campusIoTAccess: true,
    userRoleAssignment: false,
    systemAuditLogs: true,
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setAdminProfile(prev => ({
      ...prev,
      name: editName,
      email: editEmail,
      phone: editPhone,
      designation: editDesignation
    }));
    setShowEditModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const auditLogs = [
    { action: "Approved B.Tech admissions batch #14", timestamp: "Today, 10:15 AM", ip: "192.168.1.45" },
    { action: "Updated semester fee tariff in Finance module", timestamp: "Yesterday, 04:30 PM", ip: "192.168.1.45" },
    { action: "Issued digital marksheet blockchain batch", timestamp: "29 Sep 2026, 02:10 PM", ip: "192.168.1.45" },
    { action: "Resolved hostel room allocation grievance #GR-891", timestamp: "28 Sep 2026, 11:20 AM", ip: "192.168.1.45" },
  ];

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#003566]">Admin Profile & Security Controls</h1>
        <p className="text-gray-600 mt-1">
          Manage system identity, administrative access policies, security tokens, and institutional audit trail.
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <FaCheckCircle className="text-emerald-500 text-sm" /> Profile settings updated and propagated across active ERP sessions.
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Admin Profile Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#003566] text-white flex items-center justify-center text-2xl font-bold shadow-md">
                RR
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {adminProfile.accessLevel}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-1">{adminProfile.name}</h2>
                <p className="text-xs text-gray-500">{adminProfile.designation}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t pt-4">
              <div><span className="text-gray-400 font-medium">Email Address:</span> <span className="font-semibold text-gray-800 block">{adminProfile.email}</span></div>
              <div><span className="text-gray-400 font-medium">Contact Phone:</span> <span className="font-semibold text-gray-800 block">{adminProfile.phone}</span></div>
              <div><span className="text-gray-400 font-medium">Department:</span> <span className="font-semibold text-gray-800 block">{adminProfile.department}</span></div>
              <div><span className="text-gray-400 font-medium">Member Since:</span> <span className="font-semibold text-gray-800 block">{adminProfile.joiningDate}</span></div>
            </div>
          </div>

          <div className="pt-6 border-t mt-4 flex items-center justify-between">
            <button
              onClick={() => {
                setEditName(adminProfile.name);
                setEditEmail(adminProfile.email);
                setEditPhone(adminProfile.phone);
                setEditDesignation(adminProfile.designation);
                setShowEditModal(true);
              }}
              className="px-4 py-2 bg-[#003566] text-white rounded-xl text-xs font-semibold hover:bg-[#00284d] transition flex items-center gap-2"
            >
              <FaEdit /> Edit Profile
            </button>
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
              <FaCheckCircle /> 2FA Active
            </span>
          </div>
        </div>

        {/* Role & Permissions Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg">
                <FaUserShield />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Role-Based Access Control (RBAC)</h3>
                <p className="text-xs text-gray-400">Granted system privileges</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Review and toggle administrative module permissions for university operations.
            </p>

            <div className="space-y-2 text-xs">
              {Object.entries(permissions).slice(0, 5).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-gray-100">
                  <span className="capitalize text-gray-700 font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${val ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                    {val ? 'Enabled' : 'Restricted'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t mt-4">
            <button
              onClick={() => setShowRoleModal(true)}
              className="w-full py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <FaKey /> Configure All Permissions
            </button>
          </div>
        </div>

        {/* Security & Completion Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <FaShieldAlt />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Identity Security Score</h3>
                <p className="text-xs text-emerald-600 font-semibold">95% System Hardened</p>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 w-[95%]" />
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                <span>Multi-factor authentication (TOTP/SMS) verified</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                <span>Hardware security token registered</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                <span>Administrative session timeout: 30 minutes</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t mt-4">
            <button
              onClick={() => alert("Password reset token generated and sent to " + adminProfile.email)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <FaLock /> Rotate Password & Tokens
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <FaHistory className="text-indigo-600" /> Recent Administrative Audit Log
          </h3>
          <span className="text-xs text-gray-400">Security Audit Certified</span>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-semibold text-gray-800">{log.action}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Origin IP: {log.ip}</p>
              </div>
              <span className="text-gray-500 text-xs">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes size={16} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Edit Admin Profile</h3>
            <p className="text-xs text-gray-500 mb-4">Modify personal identity and contact coordinates.</p>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003566] text-white rounded-xl font-semibold hover:bg-[#00284d] transition shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setShowRoleModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes size={16} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Configure Administrative Privileges</h3>
            <p className="text-xs text-gray-500 mb-4">Toggle role grants for campus ERP governance.</p>

            <div className="space-y-3 text-xs mb-6">
              {Object.entries(permissions).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-slate-50">
                  <div>
                    <p className="font-bold text-gray-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-[11px] text-gray-400">Read, write and audit permissions for this subsystem.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePermission(key)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${val ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${val ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-5 py-2 bg-[#003566] text-white rounded-xl text-xs font-semibold hover:bg-[#00284d]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
