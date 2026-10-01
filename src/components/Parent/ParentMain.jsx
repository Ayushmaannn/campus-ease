import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ParentSidebar from "./Sidebar";

const ParentMain = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <ParentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-64 ml-0" : "md:ml-20 ml-0"}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default ParentMain;
