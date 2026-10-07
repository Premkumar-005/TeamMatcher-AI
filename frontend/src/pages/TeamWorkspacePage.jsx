import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import {
  MessageSquare,
  FileText,
  Kanban,
  Send,
  Plus,
  Download,
  Users2,
  Layout,
  Upload,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import Button from '../components/ui/Button';

export default function TeamWorkspacePage() {
  const {
    user,
    teams = [],
    activeTeam,
    workspaceData,
    loadWorkspaceForProject,
    addTask,
    moveTask,
    assignTask,
    addChatMessage,
    uploadWorkspaceFile,
    downloadWorkspaceFile,
    assignTeamLeader
  } = useApp();
  const { projectId: projectIdRouteParam } = useParams();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const projectIdParam = searchParams.get('projectId') || projectIdRouteParam;
  const lastLoadedIdRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    return tabParam && ['overview', 'tasks', 'files', 'chat', 'members'].includes(tabParam)
      ? tabParam
      : 'overview';
  });

  // Load workspace specifically for the given projectId once per ID
  useEffect(() => {
    const targetId = projectIdParam || (teams[0]?.project?._id || teams[0]?.project?.id || teams[0]?.project || teams[0]?._id);
    if (targetId && targetId !== lastLoadedIdRef.current) {
      lastLoadedIdRef.current = targetId;
      setLoading(true);
      Promise.resolve(loadWorkspaceForProject(targetId)).finally(() => {
        setLoading(false);
      });
    }
  }, [projectIdParam, teams, loadWorkspaceForProject]);

  useEffect(() => {
    if (tabParam && ['overview', 'tasks', 'files', 'chat', 'members'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [chatInput, setChatInput] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addChatMessage(chatInput);
    setChatInput('');
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, newTaskAssignee || null);
    setNewTaskTitle('');
    setNewTaskAssignee('');
  };

  const handleFileUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    await uploadWorkspaceFile(selectedFile);
    setUploading(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = async (file) => {
    const fileId = file._id || file.id;
    if (!fileId) return;
    await downloadWorkspaceFile(fileId, file.name);
  };

  const acceptedMembers = activeTeam?.members || [];
  const assignableWorkers = activeTeam?.workerMembers || [];
  
  const currentUserId = (user?._id || user?.id)?.toString();
  const ownerId = (activeTeam?.owner?._id || activeTeam?.owner?.id || (typeof activeTeam?.owner === 'string' ? activeTeam.owner : null))?.toString();
  const isOwner = user?.role === 'OWNER' || Boolean(currentUserId && ownerId && currentUserId === ownerId);

  // Leader is strictly populated from activeTeam.leader in MongoDB
  const leaderObj = activeTeam?.leader;
  const leaderId = (leaderObj?._id || leaderObj?.id || (typeof leaderObj === 'string' ? leaderObj : null))?.toString();
  const isLeader = Boolean(currentUserId && leaderId && currentUserId === leaderId);

  let leaderName = null;
  if (leaderObj && typeof leaderObj === 'object' && leaderObj?.name) {
    leaderName = leaderObj.name;
  } else if (leaderId) {
    const matched = acceptedMembers.find((m) => (m.id || m._id)?.toString() === leaderId);
    if (matched) leaderName = matched.name;
  }

  // Filter tasks: Workers only see tasks assigned to their real user ID.
  const allTasks = workspaceData?.tasks || [];
  const filesList = workspaceData?.files || [];
  const messagesList = workspaceData?.messages || [];

  const visibleTasks = allTasks.filter((t) => {
    if (isOwner || isLeader) return true;
    const taskAssigneeId = (
      t.assignee?._id ||
      t.assignee?.id ||
      (typeof t.assignee === 'string' ? t.assignee : null) ||
      t.assignedTo?._id ||
      t.assignedTo?.id ||
      (typeof t.assignedTo === 'string' ? t.assignedTo : null)
    )?.toString();
    return taskAssigneeId === currentUserId;
  });

  const tasksDoneCount = visibleTasks.filter((t) => t.status === 'Done').length;
  const projectProgress = visibleTasks.length > 0 ? Math.round((tasksDoneCount / visibleTasks.length) * 100) : 0;
  const coverageScore = activeTeam?.skillCoverage?.percentage !== undefined
    ? activeTeam.skillCoverage.percentage
    : (activeTeam?.overallScore !== undefined ? activeTeam.overallScore : 0);

  // Can user create tasks?
  // - If team has a leader: ONLY the Team Leader creates tasks!
  // - If team does not have a leader yet: Owner can create tasks (fallback)
  // - Normal workers cannot create tasks
  const canCreateTask = isLeader || (!leaderId && isOwner);

  const getSenderDisplayName = (msg) => {
    const msgSenderId = (
      msg.senderId?._id ||
      msg.senderId?.id ||
      (typeof msg.senderId === 'string' ? msg.senderId : null) ||
      msg.sender?._id ||
      msg.sender?.id ||
      (typeof msg.sender === 'string' && msg.sender.length === 24 ? msg.sender : null)
    )?.toString();

    let name =
      (typeof msg.sender === 'object' && msg.sender?.name) ||
      (typeof msg.senderId === 'object' && msg.senderId?.name) ||
      msg.senderName;

    if (!name || name === 'User') {
      if (msgSenderId && activeTeam) {
        if (ownerId && ownerId === msgSenderId) {
          name = activeTeam.owner?.name;
        }
        if (!name && Array.isArray(activeTeam.members)) {
          const found = activeTeam.members.find(
            (m) => (m.user?._id || m.user?.id || m.user || m._id || m.id)?.toString() === msgSenderId
          );
          if (found) name = found.user?.name || found.name;
        }
      }
    }

    if (!name && typeof msg.sender === 'string' && msg.sender.trim() && msg.sender.length !== 24) {
      name = msg.sender;
    }

    if (!name) name = 'User';
    const cleanName = name.replace(/\s*\(You\)$/i, '').trim();

    const isMe = Boolean(
      currentUserId &&
      msgSenderId &&
      currentUserId === msgSenderId
    );

    return isMe ? `${cleanName} (You)` : cleanName;
  };

  if (loading && !activeTeam) {
    return (
      <DashboardLayout title="Team Workspace">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#71717A]">Loading team workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!activeTeam && !loading) {
    return (
      <DashboardLayout title="Team Workspace">
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-8 rounded-2xl text-center space-y-3">
          <Users2 className="w-10 h-10 text-[#71717A] mx-auto" />
          <h3 className="text-base font-semibold text-white">No Team Workspace Selected</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            Select an accepted project application or active team to enter its collaborative sprint workspace.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Team Workspace">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {activeTeam?.project || 'Project'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
            {activeTeam?.name || 'Team'} Workspace
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {leaderName ? (
            <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Leader: {leaderName} {isLeader && '(You)'}
            </span>
          ) : (
            <span className="text-xs text-zinc-400 bg-zinc-800/40 border border-zinc-700/40 px-2.5 py-1 rounded-full font-medium">
              No Team Leader assigned
            </span>
          )}
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full font-medium">
            ● {acceptedMembers.length} {acceptedMembers.length === 1 ? 'Member' : 'Members'} Active
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1C1C1F] pb-3">
        {[
          { id: 'overview', label: 'Overview', icon: Layout },
          { id: 'tasks', label: 'Tasks', icon: Kanban, count: visibleTasks.length },
          { id: 'files', label: 'Shared Files', icon: FileText, count: filesList.length },
          { id: 'chat', label: 'Team Chat', icon: MessageSquare, count: messagesList.length },
          { id: 'members', label: 'Team Members', icon: Users2, count: acceptedMembers.length }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#141414] text-white border border-[#27272A]'
                  : 'text-[#71717A] hover:text-[#D4D4D8] hover:bg-[#0E0E10]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#1C1C20] text-[#A1A1AA] font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Progress Summary Card */}
          <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Project Sprint Progress</h3>
                <p className="text-xs text-[#71717A]">
                  {tasksDoneCount} of {visibleTasks.length} sprint tasks completed
                </p>
              </div>
              <span className="text-2xl font-bold text-emerald-400">{projectProgress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#141414] h-2 rounded-full overflow-hidden border border-[#222226]">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${projectProgress}%` }}
              />
            </div>
          </div>

          {/* Team Composition Summary */}
          <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-[#1C1C1F] pb-3 flex items-center justify-between">
              <span>Team Roster</span>
              <span className="text-xs font-medium text-emerald-400">{coverageScore}% Skill Coverage</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {acceptedMembers.map((member) => (
                <div key={member.id || member._id} className="p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#27272A] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{member.name}</h4>
                      <p className="text-[10px] text-indigo-400 truncate">{member.role}</p>
                    </div>
                  </div>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* ── Task creation form (visible ONLY to Team Leader, or Owner if no leader assigned yet) ── */}
          {canCreateTask ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-300 font-medium flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  {isLeader ? 'You are Team Leader — Create & assign sprint tasks' : 'Owner Task Management (Assign a Team Leader in Team Members to delegate)'}
                </span>
              </div>
              <form onSubmit={handleCreateTask} className="flex flex-wrap gap-2 max-w-xl">
                <input
                  type="text"
                  placeholder="New task title (e.g. Implement OAuth Flow)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 saas-input text-xs min-w-[200px]"
                />
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="px-2 py-1.5 saas-input text-xs bg-[#0E0E10] text-[#D4D4D8] border border-[#27272A] rounded-lg"
                >
                  <option value="">Assign Team Member...</option>
                  {assignableWorkers.map((m) => {
                    const mId = m.id || m._id;
                    const isWorkerLeader = mId?.toString() === leaderId;
                    return (
                      <option key={mId} value={mId}>
                        {m.name} {isWorkerLeader ? '(Team Leader)' : ''}
                      </option>
                    );
                  })}
                </select>
                <Button type="submit" variant="primary" size="sm" icon={Plus}>
                  Add Task
                </Button>
              </form>
            </div>
          ) : (
            <div className="p-3 bg-[#0E0E10] border border-[#1C1C1F] rounded-xl flex items-center justify-between text-xs text-[#A1A1AA]">
              <span className="flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                {leaderName
                  ? `Sprint tasks are created and assigned by Team Leader (${leaderName}).`
                  : 'Tasks are managed by the project team. Normal members can update status on tasks assigned to them.'}
              </span>
            </div>
          )}

          {/* ── Kanban columns ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['To Do', 'In Progress', 'Done'].map((status) => {
              const colTasks = visibleTasks.filter((t) => t.status === status);
              return (
                <div key={status} className="bg-[#0B0B0B] border border-[#1C1C1F] p-4 rounded-xl flex flex-col justify-between min-h-[340px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-2.5 mb-3">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Done' ? 'bg-emerald-400' : status === 'In Progress' ? 'bg-amber-400' : 'bg-[#71717A]'}`} />
                        {status}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#161618] text-[#A1A1AA]">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {colTasks.map((t) => {
                        const taskId = t._id || t.id;

                        // Resolve assignee name and ID from the populated object or raw ID
                        let assigneeName = 'Unassigned';
                        let assigneeId = '';

                        if (t.assignee) {
                          if (typeof t.assignee === 'object' && t.assignee !== null) {
                            assigneeName = t.assignee.name || 'Unassigned';
                            assigneeId = t.assignee._id || t.assignee.id || '';
                          } else if (typeof t.assignee === 'string') {
                            // Try to resolve from workerMembers list
                            const matched = assignableWorkers.find(
                              (m) => (m.id || m._id) === t.assignee
                            );
                            if (matched) {
                              assigneeName = matched.name;
                              assigneeId = matched.id || matched._id;
                            } else {
                              assigneeId = t.assignee;
                            }
                          }
                        }

                        // Worker can only act on tasks assigned specifically to them
                        const isAssignedToMe =
                          assigneeId &&
                          (assigneeId === currentUserId ||
                            assigneeId === user?._id ||
                            assigneeId === user?.id);

                        const canActOnTask = isAssignedToMe; // Only the assigned worker can start or complete their own task

                        return (
                          <div key={taskId} className="p-3 rounded-lg bg-[#0E0E10] border border-[#1C1C1F] space-y-2 text-xs">
                            <p className="font-medium text-white">{t.title}</p>

                            <div className="flex items-center justify-between text-[11px] pt-1">
                              {/* Always show plain assignee text — no dropdown on the card */}
                              <span className="text-indigo-400 font-medium">
                                Assignee: {assigneeName}
                              </span>

                              {/* Task status action buttons */}
                              <div className="flex items-center gap-1.5">
                                {canActOnTask && status === 'To Do' && (
                                  <button
                                    onClick={() => moveTask(taskId, 'In Progress')}
                                    className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-medium transition-colors cursor-pointer"
                                  >
                                    Start Task →
                                  </button>
                                )}

                                {canActOnTask && status === 'In Progress' && (
                                  <button
                                    onClick={() => moveTask(taskId, 'Done')}
                                    className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-medium transition-colors cursor-pointer"
                                  >
                                    Complete Task ✓
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SHARED FILES */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          {/* ── Upload row ── */}
          <form
            onSubmit={handleFileUploadSubmit}
            className="bg-[#0B0B0B] border border-[#1C1C1F] p-4 rounded-xl flex flex-wrap items-center gap-3 max-w-xl"
          >
            {/* Hidden real file input */}
            <input
              ref={fileInputRef}
              id="workspace-file-input"
              type="file"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
            />
            {/* Styled trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[#0E0E10] border border-[#27272A] text-xs text-[#D4D4D8] hover:border-indigo-500/50 hover:text-indigo-300 transition-colors flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              Choose File
            </button>
            {/* Selected file name preview */}
            <span className="text-xs text-[#71717A] flex-1 truncate min-w-0">
              {selectedFile ? selectedFile.name : 'No file chosen'}
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Upload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Share File'}
            </Button>
          </form>

          {/* ── Files list ── */}
          <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-white border-b border-[#1C1C1F] pb-2.5">Shared Documents</h3>
            <div className="space-y-2">
              {filesList.length === 0 && (
                <p className="text-xs text-[#71717A] py-4 text-center">No files shared yet. Upload the first file above.</p>
              )}
              {filesList.map((f) => {
                // Resolve uploader name from populated object or fallback
                const uploaderName =
                  typeof f.uploadedBy === 'object' && f.uploadedBy?.name
                    ? f.uploadedBy.name
                    : (f.author || 'Team Member');

                // Resolve upload date
                const uploadDate = f.uploadedAt
                  ? new Date(f.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : (f.date || 'Recently');

                return (
                  <div
                    key={f._id || f.id || f.name}
                    className="p-3 rounded-lg bg-[#0E0E10] border border-[#1C1C1F] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-white truncate">{f.name}</h4>
                        <p className="text-[11px] text-[#71717A]">
                          {f.size} &bull; Shared by {uploaderName} &bull; {uploadDate}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(f)}
                      type="button"
                      className="ml-3 shrink-0 px-2.5 py-1 rounded-md bg-[#141414] hover:bg-[#18181B] text-xs font-medium text-[#D4D4D8] flex items-center gap-1.5 border border-[#27272A] transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEAM CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-2xl flex flex-col h-[480px]">
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {messagesList.length === 0 && (
              <p className="text-xs text-[#71717A] py-8 text-center">No messages in team chat yet. Send the first message below.</p>
            )}
            {messagesList.map((msg) => (
              <div key={msg.id} className="p-3 rounded-lg bg-[#0E0E10] border border-[#1C1C1F] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span>{getSenderDisplayName(msg)}</span>
                    <span className="text-[10px] text-indigo-400 font-normal px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {msg.role || 'Team Member'}
                    </span>
                  </span>
                  <span className="text-[10px] text-[#71717A] font-mono">{msg.time}</span>
                </div>
                <p className="text-[#D4D4D8] leading-relaxed pt-0.5">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="pt-3 border-t border-[#1C1C1F] flex gap-2">
            <input
              type="text"
              placeholder="Send message to team chat..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 saas-input text-xs"
            />
            <Button type="submit" variant="primary" size="md" icon={Send}>
              Send
            </Button>
          </form>
        </div>
      )}

      {/* TAB 5: TEAM MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1C1C1F] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Team Roster & Roles
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                {isOwner
                  ? 'Manage your team members and assign ONE accepted worker as Team Leader.'
                  : 'View accepted team members and the designated Team Leader.'}
              </p>
            </div>
            {leaderName ? (
              <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-medium flex items-center gap-1.5 w-fit">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Team Leader: {leaderName}
              </span>
            ) : (
              <span className="text-xs text-zinc-400 bg-zinc-800/40 border border-zinc-700/40 px-3 py-1 rounded-full font-medium w-fit">
                No Team Leader assigned yet
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Real Project Owner Card */}
            {activeTeam?.owner && (
              <div className="p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeTeam.owner.avatar}
                      alt={activeTeam.owner.name}
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-[#27272A] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">{activeTeam.owner.name}</h4>
                        <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.2 rounded-full font-semibold">
                          Project Owner
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-400 font-medium">Project Owner</p>
                      <span className="inline-block text-[10px] text-zinc-400 font-mono mt-0.5">
                        Status: Owner
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Real Accepted Team Members */}
            {acceptedMembers.map((member) => {
              const memberId = (member.id || member._id)?.toString();
              const isThisLeader = Boolean((leaderId && memberId === leaderId) || member.role === 'Team Leader');

              return (
                <div key={member.id || member._id || member.name} className="p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-[#27272A] shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white">{member.name}</h4>
                          {isThisLeader && (
                            <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded-full font-semibold flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5 text-amber-400" />
                              Team Leader
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-indigo-400 font-medium">
                          {isThisLeader ? 'Team Leader' : member.role}
                        </p>
                        <span className="inline-block text-[10px] text-emerald-400 font-mono mt-0.5">
                          Status: {member.status || 'Accepted'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Owner Action: Assign as Team Leader (only for accepted workers, not owner) */}
                  {isOwner && (
                    <div className="pt-2 border-t border-[#1C1C1F] flex items-center justify-end">
                      {isThisLeader ? (
                        <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1.5 py-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/20">
                          <Crown className="w-3.5 h-3.5 text-amber-400" /> Current Team Leader
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => assignTeamLeader(activeTeam?._id, memberId)}
                          className="text-[11px] px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Crown className="w-3 h-3 text-amber-300" />
                          {leaderId ? 'Change to Team Leader' : 'Assign as Team Leader'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
