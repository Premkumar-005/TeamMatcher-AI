import React, { useState } from 'react';
import { Search, Bell, Check, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title = 'Dashboard', onToggleMobileMenu = null }) {
  const { notifications, markAllNotificationsAsRead, user } = useApp();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#1C1C1F] bg-[#050505]/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Title & Mobile Trigger */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#141414] border border-[#27272A]"
            aria-label="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <h1 className="text-sm font-semibold text-white tracking-tight">
          {title}
        </h1>
      </div>

      {/* Center / Search Bar */}
      <div className="hidden md:block w-72 lg:w-96">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search projects, skills, teammates..."
            className="w-full pl-8 pr-4 py-1.5 rounded-lg saas-input text-xs"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-1.5 rounded-lg border border-[#222226] bg-[#0B0B0B] text-[#9CA3AF] hover:text-white hover:border-[#333338] transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#050505]" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#222226] bg-[#0E0E10] p-3.5 shadow-2xl z-50 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-2 mb-2.5">
                <h3 className="text-xs font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifMenu(false);
                      navigate('/notifications');
                    }}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      n.read
                        ? 'bg-[#09090B] border-[#1C1C1F] text-[#71717A]'
                        : 'bg-[#121216] border-[#2B2B33] text-[#D4D4D8] hover:border-[#3F3F46]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-white text-xs">{n.title}</span>
                      <span className="text-[10px] text-[#71717A]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] leading-relaxed line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowNotifMenu(false);
                  navigate('/notifications');
                }}
                className="w-full mt-2.5 pt-2 text-center text-xs text-indigo-400 hover:text-indigo-300 font-medium border-t border-[#1C1C1F]"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 cursor-pointer pl-1.5 border-l border-[#1C1C1F]"
          title="View Profile"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#27272A] hover:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>
    </header>
  );
}


