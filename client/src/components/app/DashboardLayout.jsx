import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import ChatBot from "./ChatBot.jsx";
import VoiceAssistant from "../VoiceAssistant.jsx";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  return (
    <div className="h-screen flex flex-col bg-[#0B0F19] text-white">
      {/* Top Navbar */}
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
        {/* Floating assistants */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <ChatBot />
          <VoiceAssistant />
        </div>
      </div>
    </div>
  );
}
