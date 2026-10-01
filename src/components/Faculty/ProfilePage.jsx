import React, { useState } from "react";
import { FaUser, FaEnvelope, FaBuilding, FaIdBadge, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaCheck, FaTimes } from "react-icons/fa";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: "alex_smith",
    email: "alex.smith@university.edu",
    department: "Computer Science",
    role: "Faculty Member",
    phone: "+1 234 567 890",
    address: "123 Main Street, City, Country",
    joiningDate: "01-Jan-2020",
    status: "Active"
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });

  const profileDataConfig = [
    { key: "username", icon: <FaUser />, label: "Username" },
    { key: "email", icon: <FaEnvelope />, label: "Email" },
    { key: "department", icon: <FaBuilding />, label: "Department" },
    { key: "role", icon: <FaIdBadge />, label: "Role" },
    { key: "phone", icon: <FaPhone />, label: "Phone" },
    { key: "address", icon: <FaMapMarkerAlt />, label: "Address" },
    { key: "joiningDate", icon: <FaCalendarAlt />, label: "Joining Date" },
    { key: "status", icon: <FaIdBadge />, label: "Status" },
  ];

  return (
    <div className="flex-1 p-8 bg-gray-100 min-h-screen flex justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8">
        {/* Header with photo and basic info */}
        <div className="flex items-center space-x-6 border-b border-gray-200 pb-6">
          <img
            src="https://i.pravatar.cc/150?img=32"
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-[#003566]"
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Alex Smith</h2>
            <p className="text-gray-500 mt-1 text-lg">{profile.role} - {profile.department}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileDataConfig.map((item, index) => (
            <div
              key={index}
              className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-[#003566] text-xl">{item.icon}</div>
              <div className="ml-3 flex-1">
                <p className="text-gray-500 text-sm">{item.label}</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfile[item.key]}
                    onChange={(e) => setTempProfile({ ...tempProfile, [item.key]: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded px-2 py-1 text-gray-900 focus:outline-none focus:border-[#003566]"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{profile[item.key]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Profile Button */}
        <div className="mt-8 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setProfile(tempProfile);
                  setIsEditing(false);
                }}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-md"
              >
                <FaCheck /> Save
              </button>
              <button
                onClick={() => {
                  setTempProfile(profile);
                  setIsEditing(false);
                }}
                className="flex items-center gap-2 bg-gray-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-600 transition-colors shadow-md"
              >
                <FaTimes /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#003566] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#ffc300] hover:text-black transition-colors shadow-md"
            >
              Edit Profile
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
