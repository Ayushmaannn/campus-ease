import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "./Sidebar";
import NotificationBell from "../Shared/NotificationBell";
import { useAuth } from "../../context/AuthContext";
import { FaBars } from "react-icons/fa";

const Studentmainlogin = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Sidebar */}
      <StudentSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content */}
      <div
        className={`flex-1 min-h-screen min-w-0 transition-all duration-300 ${
          isOpen ? "md:ml-64 ml-0" : "md:ml-20 ml-0"
        }`}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-[#003566] to-[#002244] shadow-md px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-xl focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              <FaBars />
            </button>
            <span className="text-white font-bold text-sm sm:text-base flex items-center gap-1.5">
              <span>🎓</span> QuickCampus ERP
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2 text-sm text-white/90">
              <div className="w-8 h-8 bg-[#ffc300] rounded-full flex items-center justify-center text-[#003566] font-bold text-xs shadow-sm">
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <span className="hidden sm:inline font-medium">{user?.name || 'Student'}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-3 sm:p-6 w-full max-w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Studentmainlogin;
