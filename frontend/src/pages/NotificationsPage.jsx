import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Sparkles, FolderGit2, Users2, Check, Inbox } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    acceptTeamInviteAction,
    teams,
    user
  } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [acceptingId, setAcceptingId] = useState(null);

  const currentUserId = (user?._id || user?.id)?.toString();

  const isUserInTeamForProject = (projectId, teamId) => {
    if (!teams || teams.length === 0) return false;
    const targetTeam = teams.find((t) => {
      const tId = (t._id || t.id)?.toString();
      const pId = (t.project?._id || t.project?.id || t.project)?.toString();
      return (teamId && tId === teamId.toString()) || (projectId && pId === projectId.toString());
    });
    if (!targetTeam) return false;
    const isOwner = (targetTeam.owner?._id || targetTeam.owner?.id || targetTeam.owner)?.toString() === currentUserId;
    const isMem = (targetTeam.members || []).some(
      (m) => (m.user?._id || m.user?.id || m.user)?.toString() === currentUserId
    );
    return isOwner || isMem;
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter((n) => {
        if (filter === 'team') {
          return (
            n.type === 'team' ||
            n.rawType === 'TEAM_INVITATION' ||
            n.rawType === 'TEAM_JOINED' ||
            n.rawType === 'TASK_STARTED' ||
            n.rawType === 'TASK_COMPLETED' ||
            n.rawType === 'FILE_SHARED' ||
            (n.rawType === 'APPLICATION_ACCEPTED' && (n.link === '/teams' || n.link === '/team-workspace'))
          );
        }
        if (filter === 'project') {
          return (
            n.type === 'project' ||
            ['APPLICATION_RECEIVED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'PROJECT_CLOSED'].includes(n.rawType)
          );
        }
        if (filter === 'ai') {
          return n.type === 'ai' || ['AI_UPDATE', 'RESUME_PARSED'].includes(n.rawType);
        }
        if (filter === 'system') {
          return n.type === 'system' || n.rawType === 'SYSTEM_UPDATE';
        }
        return n.type === filter;
      });

  const handleNotificationClick = (item) => {
    if (!item.read) {
      markNotificationAsRead(item.id);
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleAcceptInvite = async (item) => {
    setAcceptingId(item.id);
    const targetProjectId = (item.relatedProject?._id || item.relatedProject)?.toString();
    const targetTeamId = (item.relatedEntity?._id || item.relatedEntity)?.toString();

    const matchedTeam = teams.find((t) => {
      const tId = (t._id || t.id)?.toString();
      const pId = (t.project?._id || t.project?.id || t.project)?.toString();
      return (targetTeamId && tId === targetTeamId) || (targetProjectId && pId === targetProjectId);
    });

    const teamIdToUse = targetTeamId || matchedTeam?._id || matchedTeam?.id;
    if (teamIdToUse) {
      await acceptTeamInviteAction(teamIdToUse, item.id);
    } else {
      await markNotificationAsRead(item.id);
      navigate(item.link || '/team-workspace');
    }
    setAcceptingId(null);
  };

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
          {filteredNotifications.map((item) => {
            const isInvite =
              item.rawType === 'TEAM_INVITATION' ||
              (item.type === 'team' && (item.link === '/teams' || item.link === '/team-workspace'));
            const projId = (item.relatedProject?._id || item.relatedProject)?.toString();
            const entityId = (item.relatedEntity?._id || item.relatedEntity)?.toString();
            const alreadyJoined = isInvite && isUserInTeamForProject(projId, entityId);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  item.read
                    ? 'bg-[#0B0B0B] border-[#1C1C1F] text-[#71717A]'
                    : 'bg-[#0E0E10] border-[#222226] text-white shadow-sm'
                } ${item.link ? 'cursor-pointer hover:border-[#333338]' : ''}`}
                onClick={() => handleNotificationClick(item)}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-[#141414] border border-[#222226] flex items-center justify-center shrink-0 mt-0.5">
                    {item.type === 'team' && <Users2 className="w-4 h-4 text-indigo-400" />}
                    {item.type === 'project' && <FolderGit2 className="w-4 h-4 text-indigo-400" />}
                    {item.type === 'ai' && <Sparkles className="w-4 h-4 text-indigo-400" />}
                    {item.type === 'system' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                    <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-[#71717A] font-mono mt-1.5 block">{item.time}</span>
                  </div>
                </div>

                {isInvite && !alreadyJoined ? (
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={acceptingId === item.id}
                      onClick={() => handleAcceptInvite(item)}
                      icon={Check}
                    >
                      Accept Invite
                    </Button>
                    {!item.read && (
                      <button
                        onClick={() => markNotificationAsRead(item.id)}
                        className="text-xs text-[#71717A] hover:text-[#D4D4D8] font-medium"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ) : isInvite && alreadyJoined ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Joined
                    </span>
                    {!item.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(item.id);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ) : (
                  !item.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(item.id);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium shrink-0"
                    >
                      Mark Read
                    </button>
                  )
                )}
              </div>
            );
          })}
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
