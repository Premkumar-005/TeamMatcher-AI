import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Inbox,
  Sparkles,
  Briefcase,
  Users2,
  AlertCircle,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function TeamRequestsPage() {
  const {
    user,
    projects,
    myApplications,
    acceptWorkerApplication,
    rejectWorkerApplication,
    refreshBackendData,
    addToast
  } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isOwner = user?.role === 'OWNER';
  const selectedProjectId = searchParams.get('projectId') || '';

  const [activeTab, setActiveTab] = useState(isOwner ? 'received' : 'sent');
  const [ownerApplications, setOwnerApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const currentUserId = (user?._id || user?.id)?.toString();

  const isProjectOwnedByCurrentUser = useCallback(
    (p) => {
      const pOwnerId = (
        p.owner?._id ||
        p.owner?.id ||
        (typeof p.owner === 'string' ? p.owner : null) ||
        p.ownerId?._id ||
        p.ownerId?.id ||
        (typeof p.ownerId === 'string' ? p.ownerId : null)
      )?.toString();
      return Boolean(pOwnerId && currentUserId && pOwnerId === currentUserId);
    },
    [currentUserId]
  );

  const ownerProjects = projects.filter(isProjectOwnedByCurrentUser);

  // Count ONLY real PENDING applications for the logged-in owner's projects
  const pendingReviewCount = ownerApplications.filter(
    (app) => app.status === 'PENDING'
  ).length;

  // Fetch applications for Owner's projects (filtered if selectedProjectId is present)
  const fetchOwnerApps = useCallback(async () => {
    if (!isOwner) return;
    setLoadingApps(true);
    try {
      if (selectedProjectId) {
        const p = projects.find(
          (proj) =>
            (proj.id || proj._id)?.toString() === selectedProjectId &&
            isProjectOwnedByCurrentUser(proj)
        );
        if (p) {
          const res = await api.getProjectApplications(selectedProjectId);
          if (res.success && Array.isArray(res.data)) {
            const withProject = res.data.map((app) => ({
              ...app,
              projectTitle: p?.title || app.project?.title || 'Selected Project',
              projectId: selectedProjectId
            }));
            setOwnerApplications(withProject);
          } else {
            setOwnerApplications([]);
          }
        } else {
          setOwnerApplications([]);
        }
      } else {
        const owned = projects.filter(isProjectOwnedByCurrentUser);
        let allApps = [];
        for (const p of owned) {
          const pId = (p.id || p._id)?.toString();
          if (!pId) continue;
          const res = await api.getProjectApplications(pId);
          if (res.success && Array.isArray(res.data)) {
            const withProject = res.data.map((app) => ({
              ...app,
              projectTitle: p.title,
              projectId: pId
            }));
            allApps = [...allApps, ...withProject];
          }
        }
        setOwnerApplications(allApps);
      }
    } catch (e) {
      console.warn('Could not fetch owner applications:', e.message);
    }
    setLoadingApps(false);
  }, [isOwner, selectedProjectId, projects, isProjectOwnedByCurrentUser]);

  useEffect(() => {
    fetchOwnerApps();
  }, [fetchOwnerApps]);

  const handleAccept = async (appId, role) => {
    const res = await acceptWorkerApplication(appId, role);
    if (res?.success) {
      await fetchOwnerApps();
    }
  };

  const handleReject = async (appId) => {
    const res = await rejectWorkerApplication(appId);
    if (res?.success) {
      await fetchOwnerApps();
    }
  };

  const handleWithdraw = async (appId) => {
    try {
      const res = await api.withdrawApplication(appId);
      if (res.success) {
        addToast('Application Withdrawn', 'Your application has been withdrawn.', 'info');
        refreshBackendData();
      }
    } catch (e) {
      addToast('Error', e.message || 'Failed to withdraw application', 'error');
    }
  };

  return (
    <DashboardLayout title={isOwner ? 'Review Applications' : 'My Applications'}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isOwner ? 'Worker Applications & Hiring Decisions' : 'Application Tracking & Status'}
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            {isOwner
              ? 'Review candidate applications for your published projects. Accepting a candidate automatically forms or expands your project sprint team.'
              : 'Track submitted applications across project leads. Once accepted, your team workspace becomes instantly available.'}
          </p>
        </div>

        {/* Project Selector Dropdown for Owner */}
        {isOwner && ownerProjects.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setSearchParams({ projectId: val });
                } else {
                  setSearchParams({});
                }
              }}
              className="px-3 py-1.5 saas-input text-xs bg-[#0B0B0B]"
            >
              <option value="">All My Projects</option>
              {ownerProjects.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0B0B0B] p-1 rounded-xl border border-[#1C1C1F] w-full sm:w-80">
        {isOwner ? (
          <button
            onClick={() => setActiveTab('received')}
            className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#141414] text-white flex items-center justify-center gap-2"
          >
            <Inbox className="w-3.5 h-3.5 text-indigo-400" />
            <span>Applications to Review</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-black font-bold">
              {pendingReviewCount}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('sent')}
            className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#141414] text-white flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            <span>My Submitted Applications</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#1A1A1E] text-[#A1A1AA] font-mono">
              {myApplications.length}
            </span>
          </button>
        )}
      </div>

      {/* OWNER: APPLICATIONS TO REVIEW */}
      {isOwner && (
        <div className="space-y-3">
          {ownerApplications.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {ownerApplications.map((app) => (
                <div
                  key={app._id || app.id}
                  className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={app.worker?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                      alt={app.worker?.name || 'Worker'}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-[#27272A] shrink-0"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white truncate">{app.worker?.name || 'Candidate'}</h3>
                        <span className="text-[11px] text-[#71717A]">({app.worker?.title || 'Engineer'})</span>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                          app.status === 'ACCEPTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <p className="text-xs text-indigo-400 font-medium">
                        Target Project: <strong>{app.projectTitle || 'Your Project'}</strong>
                      </p>

                      {app.coverMessage && (
                        <p className="text-xs text-[#9CA3AF] max-w-xl leading-relaxed italic bg-[#0E0E10] p-2 rounded-lg border border-[#1C1C1F]">
                          "{app.coverMessage}"
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(app.worker?.skills || []).map((s) => (
                          <span
                            key={typeof s === 'string' ? s : s.name}
                            className="text-[10px] px-2 py-0.5 rounded bg-[#141414] text-[#D4D4D8] border border-[#222226]"
                          >
                            {typeof s === 'string' ? s : s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {app.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleReject(app._id || app.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors"
                        >
                          Reject
                        </button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAccept(app._id || app.id, app.worker?.title)}
                          icon={CheckCircle2}
                        >
                          Accept Worker
                        </Button>
                      </>
                    ) : app.status === 'ACCEPTED' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/team-workspace')}
                        icon={Briefcase}
                      >
                        Open Team Workspace
                      </Button>
                    ) : (
                      <span className="text-xs text-[#71717A]">Decision Finalized</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No Worker Applications Pending"
              description={selectedProjectId ? "No applications found for this specific project." : "When workers apply to your projects, their applications and technical profiles will appear here for your review."}
              actionLabel="View My Projects"
              actionLink="/projects"
            />
          )}
        </div>
      )}

      {/* WORKER: MY SUBMITTED APPLICATIONS */}
      {!isOwner && (
        <div className="space-y-3">
          {myApplications.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {myApplications.map((app) => (
                <div
                  key={app._id || app.id}
                  className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">
                        {app.project?.title || 'Project Application'}
                      </h3>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                        app.status === 'ACCEPTED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                          : app.status === 'WITHDRAWN'
                          ? 'bg-[#1C1C20] text-[#71717A] border border-[#27272A]'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#9CA3AF]">
                      Category: <span className="text-white">{app.project?.category || 'Software'}</span> • Duration: {app.project?.duration || 4} {app.project?.durationUnit || 'weeks'}
                    </p>

                    {app.coverMessage && (
                      <p className="text-xs text-[#71717A] italic bg-[#0E0E10] p-2 rounded-lg border border-[#1C1C1F]">
                        "{app.coverMessage}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.status === 'ACCEPTED' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/team-workspace')}
                        icon={Briefcase}
                      >
                        Enter Workspace
                      </Button>
                    ) : app.status === 'PENDING' ? (
                      <button
                        onClick={() => handleWithdraw(app._id || app.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-white bg-[#141414] border border-[#27272A] transition-colors"
                      >
                        Withdraw Application
                      </button>
                    ) : (
                      <span className="text-xs text-[#71717A]">
                        {app.status === 'WITHDRAWN' ? 'Withdrawn' : 'Archived'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Send}
              title="No Active Applications"
              description="Explore the projects directory to check skill compatibility and submit applications to project owners."
              actionLabel="Explore Projects"
              actionLink="/projects"
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
