import React, { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import {
  FaUserGraduate,
  FaBook,
  FaCalendarAlt,
  FaFileAlt,
  FaMoneyBill,
  FaBell,
  FaChartLine,
  FaDownload,
  FaEdit,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTrophy,
  FaClock,
  FaGraduationCap,
  FaUsers,
  FaBookOpen,
  FaCalendarCheck,
  FaBrain,
  FaRobot,
  FaShieldAlt,
  FaVrCardboard,
  FaCamera,
  FaHeart,
  FaRocket
} from "react-icons/fa";
import AIAnalytics from '../Shared/AIAnalytics';
import BlockchainCertificates from '../Shared/BlockchainCertificates';
import VirtualCampusTour from '../Shared/VirtualCampusTour';
import SmartAttendance from './SmartAttendance';
import MentalHealthMonitor from '../Shared/MentalHealthMonitor';
import CareerGuidanceAI from './CareerGuidanceAI';
import EmergencyResponseSystem from '../Shared/EmergencyResponseSystem';
import DigiLockerVerification from './DigiLockerVerification';

const profileImage = "https://i.pravatar.cc/150?img=12";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = [
    { name: "Overview", icon: <FaChartLine /> },
    { name: "Academics", icon: <FaBook /> },
    { name: "Smart Attendance", icon: <FaCamera /> },
    { name: "AI Analytics", icon: <FaBrain /> },
    { name: "Mental Health", icon: <FaHeart /> },
    { name: "Career Guidance", icon: <FaRocket /> },
    { name: "Emergency", icon: <FaExclamationTriangle /> },
    { name: "Blockchain Certs", icon: <FaShieldAlt /> },
    { name: "Virtual Tour", icon: <FaVrCardboard /> },
    { name: "DigiLocker", icon: <FaShieldAlt /> },
    { name: "Exams", icon: <FaUserGraduate /> },
    { name: "Documents", icon: <FaFileAlt /> },
    { name: "Fees", icon: <FaMoneyBill /> },
  ];

  const academicData = {
    currentSemester: {
      subjects: [
        { name: 'Data Structures', grade: 'A', credits: 4, attendance: 92 },
        { name: 'Database Management', grade: 'A-', credits: 3, attendance: 88 },
        { name: 'Computer Networks', grade: 'B+', credits: 4, attendance: 85 },
        { name: 'Software Engineering', grade: 'A', credits: 3, attendance: 95 },
        { name: 'Operating Systems', grade: 'B+', credits: 4, attendance: 82 }
      ],
      cgpa: 8.7,
      sgpa: 8.9,
      totalCredits: 18
    },
    upcomingExams: [
      { subject: 'Data Structures', date: '2024-01-15', type: 'Mid-term' },
      { subject: 'Database Management', date: '2024-01-18', type: 'Assignment' },
      { subject: 'Computer Networks', date: '2024-01-22', type: 'Lab Exam' }
    ],
    recentGrades: [
      { subject: 'Mathematics III', grade: 'A', date: '2024-01-05' },
      { subject: 'Digital Electronics', grade: 'A-', date: '2024-01-03' }
    ]
  };

  const feeData = {
    totalFees: 125000,
    paidAmount: 75000,
    pendingAmount: 50000,
    dueDate: '2024-02-15',
    installments: [
      { name: 'First Installment', amount: 62500, status: 'Paid', date: '2023-08-15' },
      { name: 'Second Installment', amount: 62500, status: 'Pending', date: '2024-02-15' }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] p-2 sm:p-6 font-sans w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-[#003566]">Student Dashboard</h1>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#003566] to-[#00509e] rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col md:flex-row md:items-center md:space-x-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        {/* Profile Image */}
        <div className="flex justify-center md:block mb-4 md:mb-0">
          <img
            src={profileImage}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover"
          />
        </div>

        {/* Student Info */}
        <div className="flex-1 relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <h1 className="text-lg sm:text-2xl font-bold text-center md:text-left">{user?.name?.toUpperCase() || 'STUDENT NAME'}</h1>
            <span className="bg-green-500 text-white px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
              Active
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-xs sm:text-sm">
            <div className="bg-white/15 backdrop-blur-xs rounded-lg p-2.5 sm:p-3 border border-white/20">
              <p className="font-semibold text-yellow-300 text-[10px] sm:text-xs uppercase tracking-wide">Student ID</p>
              <p className="text-white font-medium mt-0.5 truncate">{user?.id || 'STU123456'}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-xs rounded-lg p-2.5 sm:p-3 border border-white/20">
              <p className="font-semibold text-yellow-300 text-[10px] sm:text-xs uppercase tracking-wide">Current CGPA</p>
              <p className="text-white text-base sm:text-lg font-bold mt-0.5">{academicData.currentSemester.cgpa}</p>
            </div>
            <div className="col-span-2 md:col-span-2 bg-white/15 backdrop-blur-xs rounded-lg p-2.5 sm:p-3 border border-white/20">
              <p className="font-semibold text-yellow-300 text-[10px] sm:text-xs uppercase tracking-wide">Course</p>
              <p className="text-white font-medium mt-0.5 line-clamp-1">
                {user?.course || 'B.Tech in Computer Science and Engineering'}
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-xs rounded-lg p-2.5 sm:p-3 border border-white/20">
              <p className="font-semibold text-yellow-300 text-[10px] sm:text-xs uppercase tracking-wide">Year</p>
              <p className="text-white font-medium mt-0.5">Third Year</p>
            </div>
            <div className="bg-white/15 backdrop-blur-xs rounded-lg p-2.5 sm:p-3 border border-white/20">
              <p className="font-semibold text-yellow-300 text-[10px] sm:text-xs uppercase tracking-wide">Semester</p>
              <p className="text-white font-medium mt-0.5">5</p>
            </div>
            <div className="bg-white/15 backdrop-blur-xs rounded-lg p-2.5 sm:p-3 border border-white/20">
              <p className="font-semibold text-yellow-300 text-[10px] sm:text-xs uppercase tracking-wide">Admission Cycle</p>
              <p className="text-white font-medium mt-0.5">2023</p>
            </div>
            <div className="bg-white/15 backdrop-blur-xs rounded-lg p-2.5 sm:p-3 border border-white/20">
              <p className="font-semibold text-yellow-300 text-[10px] sm:text-xs uppercase tracking-wide">ABC Id</p>
              <p className="text-white font-medium mt-0.5 truncate">582-883-872-294</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-[#003566] mb-4 border-b pb-2">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-gray-900">Email</p>
            <p>{user?.email || 'student@example.com'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Phone</p>
            <p>{user?.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Gender</p>
            <p>{user?.admissionData?.gender || 'Not specified'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Date of Birth</p>
            <p>{user?.admissionData?.dob || 'Not provided'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-semibold text-gray-900">Address</p>
            <p className="text-gray-600">
              {user?.admissionData?.address || 'Address not provided'}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Category</p>
            <p>{user?.admissionData?.category?.toUpperCase() || 'Not specified'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Admission Status</p>
            <p className="text-green-600 font-medium">Approved</p>
          </div>
          {user?.admissionData?.submittedAt && (
            <div>
              <p className="font-semibold text-gray-900">Admission Date</p>
              <p>{new Date(user.admissionData.submittedAt).toLocaleDateString()}</p>
            </div>
          )}
          {user?.admissionData?.id && (
            <div>
              <p className="font-semibold text-gray-900">Application ID</p>
              <p>{user.admissionData.id}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabbed Section */}
      <div className="bg-white rounded-2xl shadow-md p-3 sm:p-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-3 mb-6 pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === tab.name
                  ? "bg-[#ffc300] text-black shadow-md font-semibold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          {activeTab === "Overview" && (
            <div className="p-3 sm:p-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Current CGPA</p>
                      <p className="text-2xl font-bold text-[#003566]">{academicData.currentSemester.cgpa}</p>
                    </div>
                    <FaTrophy className="text-yellow-500 text-2xl" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Attendance</p>
                      <p className="text-2xl font-bold text-green-600">89%</p>
                    </div>
                    <FaCalendarCheck className="text-green-500 text-2xl" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Credits</p>
                      <p className="text-2xl font-bold text-blue-600">{academicData.currentSemester.totalCredits}</p>
                    </div>
                    <FaBookOpen className="text-blue-500 text-2xl" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Pending Fees</p>
                      <p className="text-2xl font-bold text-red-600">₹{feeData.pendingAmount.toLocaleString()}</p>
                    </div>
                    <FaMoneyBill className="text-red-500 text-2xl" />
                  </div>
                </div>
              </div>

              {/* Recent Activity & Upcoming Events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-[#003566] mb-4 flex items-center gap-2">
                    <FaClock className="text-blue-500" />
                    Upcoming Exams
                  </h3>
                  <div className="space-y-3">
                    {academicData.upcomingExams.map((exam, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{exam.subject}</p>
                          <p className="text-sm text-gray-600">{exam.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#003566]">{exam.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-[#003566] mb-4 flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    Recent Grades
                  </h3>
                  <div className="space-y-3">
                    {academicData.recentGrades.map((grade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{grade.subject}</p>
                          <p className="text-sm text-gray-600">{grade.date}</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                            {grade.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Academics" && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#003566] mb-4">Current Semester Subjects</h3>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg shadow-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {academicData.currentSemester.subjects.map((subject, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {subject.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.credits}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    subject.attendance >= 90 ? 'bg-green-500' :
                                    subject.attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${subject.attendance}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{subject.attendance}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Fees" && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-[#003566] mb-4">Fee Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Fees</span>
                      <span className="font-semibold">₹{feeData.totalFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paid Amount</span>
                      <span className="font-semibold text-green-600">₹{feeData.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending Amount</span>
                      <span className="font-semibold text-red-600">₹{feeData.pendingAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">Next Due Date</span>
                      <span className="font-semibold text-orange-600">{feeData.dueDate}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(feeData.paidAmount / feeData.totalFees) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {Math.round((feeData.paidAmount / feeData.totalFees) * 100)}% paid
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-[#003566] mb-4">Payment History</h3>
                  <div className="space-y-3">
                    {feeData.installments.map((installment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{installment.name}</p>
                          <p className="text-sm text-gray-600">{installment.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{installment.amount.toLocaleString()}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            installment.status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {installment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Smart Attendance" && (
            <div className="p-6">
              <SmartAttendance />
            </div>
          )}

          {activeTab === "AI Analytics" && (
            <div className="p-6">
              <AIAnalytics userRole="student" />
            </div>
          )}

          {activeTab === "Blockchain Certs" && (
            <div className="p-6">
              <BlockchainCertificates />
            </div>
          )}

          {activeTab === "Mental Health" && (
            <div className="p-6">
              <MentalHealthMonitor />
            </div>
          )}

          {activeTab === "Career Guidance" && (
            <div className="p-6">
              <CareerGuidanceAI />
            </div>
          )}

          {activeTab === "Emergency" && (
            <div className="p-6">
              <EmergencyResponseSystem />
            </div>
          )}

          {activeTab === "Virtual Tour" && (
            <div className="p-6">
              <VirtualCampusTour />
            </div>
          )}

          {activeTab === "DigiLocker" && (
            <div className="p-6">
              <DigiLockerVerification />
            </div>
          )}

          {(activeTab === "Exams" || activeTab === "Documents") && (
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl text-gray-300 mb-4">
                  {activeTab === "Exams" && <FaUserGraduate />}
                  {activeTab === "Documents" && <FaFileAlt />}
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">{activeTab} Module</h3>
                <p className="text-gray-500">This section is under development. Content will be available soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
