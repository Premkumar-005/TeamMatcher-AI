import React, { useState } from 'react';
import { Bell, CheckCircle2, Sparkles, FolderGit2, Users2, Check, Inbox } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter);

  return (
    <DashboardLayout title="Notifications Feed" maxWidth="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <span>Notifications Center</span>
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Alerts for teammate invitations, resume analysis scores, and project matching updates.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={markAllNotificationsAsRead}
          icon={Check}
        >
          Mark All Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1C1C1F] pb-3 text-xs">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'team', label: 'Team Invites' },
          { id: 'project', label: 'Projects' },
          { id: 'ai', label: 'AI Updates' },
          { id: 'system', label: 'System' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === t.id
                ? 'bg-[#141414] text-white border border-[#27272A]'
                : 'text-[#71717A] hover:text-[#D4D4D8] hover:bg-[#0E0E10]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-2.5">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                item.read
                  ? 'bg-[#0B0B0B] border-[#1C1C1F] text-[#71717A]'
                  : 'bg-[#0E0E10] border-[#222226] text-white shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#141414] border border-[#222226] flex items-center justify-center shrink-0 mt-0.5">
                  {item.type === 'team' && <Users2 className="w-4 h-4 text-indigo-400" />}
                  {item.type === 'project' && <FolderGit2 className="w-4 h-4 text-indigo-400" />}
                  {item.type === 'ai' && <Sparkles className="w-4 h-4 text-indigo-400" />}
                  {item.type === 'system' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                  <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-[#71717A] font-mono mt-1.5 block">{item.time}</span>
                </div>
              </div>

              {!item.read && (
                <button
                  onClick={() => markNotificationAsRead(item.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No Notifications"
          description="No notification alerts match your selected category filter."
        />
      )}
    </DashboardLayout>
  );
}
