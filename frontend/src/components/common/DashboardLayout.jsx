import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ title = 'Dashboard', children, maxWidth = 'max-w-7xl' }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#050505] text-[#F5F5F5] overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Responsive Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar
          title={title}
          onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className={`p-4 sm:p-6 lg:p-8 ${maxWidth} mx-auto w-full space-y-6`}>
          {children}
        </main>
      </div>
    </div>
  );
}
