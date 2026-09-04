import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  FolderGit2,
  Send,
  Users2,
  Briefcase,
  GitCompare,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  PlusCircle,
  Inbox
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ mobileOpen = false, onMobileClose = null }) {
  const [collapsed, setCollapsed] = useState(false);
  const { notifications, myApplications, receivedRequests, user, logoutUser } = useApp();
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const isOwner = user?.role === 'OWNER';

  const pendingAppsCount = isOwner
    ? receivedRequests.filter((r) => r.status === 'pending' || r.status === 'PENDING').length
    : myApplications.filter((a) => a.status === 'PENDING' || a.status === 'pending').length;

  const handleSignOut = () => {
    logoutUser();
    navigate('/login');
  };

  const navItems = isOwner
    ? [
        { label: 'Owner Overview', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Projects & Requirements', icon: FolderGit2, path: '/projects', highlight: true },
        { label: 'Review Applicants', icon: Inbox, path: '/requests', count: pendingAppsCount },
        { label: 'Managed Teams', icon: Users2, path: '/teams' },
        { label: 'Team Workspace', icon: Briefcase, path: '/team-workspace' },
        { label: 'Notifications', icon: Bell, path: '/notifications', count: unreadNotifs },
        { label: 'Settings', icon: Settings, path: '/settings' }
      ]
    : [
        { label: 'Worker Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Projects Directory', icon: FolderGit2, path: '/projects', highlight: true },
        { label: 'My Applications', icon: Send, path: '/requests', count: pendingAppsCount },
        { label: 'My Teams', icon: Users2, path: '/teams' },
        { label: 'Team Workspace', icon: Briefcase, path: '/team-workspace' },
        { label: 'Resume & Analysis', icon: FileText, path: '/resume-upload' },
        { label: 'Skill Gap & Learning', icon: GitCompare, path: '/skill-gap' },
        { label: 'Profile', icon: User, path: '/profile' },
        { label: 'Notifications', icon: Bell, path: '/notifications', count: unreadNotifs },
        { label: 'Settings', icon: Settings, path: '/settings' }
      ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col border-r border-[#1C1C1F] bg-[#09090B] transition-all duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-16' : 'md:w-60'}`}
      >
        {/* Collapse Toggle Button (Desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-6 z-50 h-5 w-5 items-center justify-center rounded-full border border-[#27272A] bg-[#111111] text-[#9CA3AF] hover:text-white hover:border-[#3F3F46] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-[#1C1C1F]">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0" onClick={onMobileClose}>
            <div className="w-7 h-7 rounded-lg bg-[#141414] border border-[#27272A] flex items-center justify-center text-white shrink-0">
              <Users2 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-semibold text-sm tracking-tight text-white block truncate">
                  TeamMatcher
                </span>
                <span className="text-[10px] text-indigo-400 font-mono block -mt-0.5">
                  {isOwner ? 'OWNER PORTAL' : 'WORKER PORTAL'}
                </span>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#141414]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav Menu */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#141414] text-white font-semibold'
                      : 'text-[#9CA3AF] hover:text-[#E4E4E7] hover:bg-[#101012]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-indigo-400'
                            : item.highlight
                            ? 'text-indigo-400/90'
                            : 'text-[#71717A] group-hover:text-[#A1A1AA]'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.count > 0 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        {item.count}
                      </span>
                    )}

                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-indigo-500" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="p-2.5 border-t border-[#1C1C1F]">
          <div
            className={`flex items-center gap-2.5 p-1.5 rounded-lg bg-[#111111] border border-[#1F1F23] ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-7 h-7 rounded-md object-cover ring-1 ring-[#27272A] shrink-0"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#1A1A1E] text-indigo-300 border border-[#27272A]">
                  {user.role || 'WORKER'}
                </span>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleSignOut}
                className="text-[#71717A] hover:text-rose-400 transition-colors p-1 rounded hover:bg-[#18181B]"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
