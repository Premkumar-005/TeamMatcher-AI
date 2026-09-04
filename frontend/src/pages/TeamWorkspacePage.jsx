import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import Button from '../components/ui/Button';

export default function TeamWorkspacePage() {
  const { activeTeam, workspaceData, addTask, moveTask, addChatMessage, uploadWorkspaceFile } = useApp();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'files' | 'chat' | 'members'
  const [chatInput, setChatInput] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addChatMessage(chatInput);
    setChatInput('');
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle);
    setNewTaskTitle('');
  };

  const handleFileUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;
    uploadWorkspaceFile(uploadFileName.trim());
    setUploadFileName('');
  };

  const tasksDoneCount = workspaceData.tasks.filter((t) => t.status === 'Done').length;
  const projectProgress = Math.round((tasksDoneCount / (workspaceData.tasks.length || 1)) * 100);

  return (
    <DashboardLayout title="Team Workspace">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {activeTeam.project}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
            {activeTeam.name} Workspace
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full font-medium">
            ● {activeTeam.members.length} Members Active
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1C1C1F] pb-3">
        {[
          { id: 'overview', label: 'Overview', icon: Layout },
          { id: 'tasks', label: 'Kanban Tasks', icon: Kanban, count: workspaceData.tasks.length },
          { id: 'files', label: 'Shared Files', icon: FileText, count: workspaceData.files.length },
          { id: 'chat', label: 'Team Chat', icon: MessageSquare, count: workspaceData.messages.length },
          { id: 'members', label: 'Team Members', icon: Users2, count: activeTeam.members.length }
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
                  {tasksDoneCount} of {workspaceData.tasks.length} sprint tasks completed
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
              <span className="text-xs font-medium text-emerald-400">100% Skill Coverage</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeTeam.members.map((member) => (
                <div key={member.id} className="p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-2">
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

      {/* TAB 2: KANBAN TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateTask} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="New task title (e.g. Implement OAuth Flow)..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 saas-input text-xs"
            />
            <Button type="submit" variant="primary" size="sm" icon={Plus}>
              Add Task
            </Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['To Do', 'In Progress', 'Done'].map((status) => {
              const colTasks = workspaceData.tasks.filter((t) => t.status === status);
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
                      {colTasks.map((t) => (
                        <div key={t.id} className="p-3 rounded-lg bg-[#0E0E10] border border-[#1C1C1F] space-y-1.5 text-xs">
                          <p className="font-medium text-white">{t.title}</p>
                          <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-1">
                            <span className="text-indigo-400 font-medium">Assignee: {t.assignee}</span>
                            {status !== 'Done' && (
                              <button
                                onClick={() => moveTask(t.id, status === 'To Do' ? 'In Progress' : 'Done')}
                                className="text-xs text-[#A1A1AA] hover:text-white font-medium"
                              >
                                Move →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
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
          <form onSubmit={handleFileUploadSubmit} className="bg-[#0B0B0B] border border-[#1C1C1F] p-4 rounded-xl flex items-center gap-2.5 max-w-lg">
            <input
              type="text"
              placeholder="Share new file (e.g. system_architecture_v2.pdf)..."
              value={uploadFileName}
              onChange={(e) => setUploadFileName(e.target.value)}
              className="flex-1 px-3 py-1.5 saas-input text-xs"
            />
            <Button type="submit" variant="primary" size="sm" icon={Upload}>
              Share File
            </Button>
          </form>

          <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-white border-b border-[#1C1C1F] pb-2.5">Shared Documents</h3>
            <div className="space-y-2">
              {workspaceData.files.map((f) => (
                <div key={f.name} className="p-3 rounded-lg bg-[#0E0E10] border border-[#1C1C1F] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{f.name}</h4>
                      <p className="text-[11px] text-[#71717A]">{f.size} • Shared by {f.author} • {f.date}</p>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 rounded-md bg-[#141414] hover:bg-[#18181B] text-xs font-medium text-[#D4D4D8] flex items-center gap-1.5 border border-[#27272A]">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEAM CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-2xl flex flex-col h-[480px]">
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {workspaceData.messages.map((msg) => (
              <div key={msg.id} className="p-3 rounded-lg bg-[#0E0E10] border border-[#1C1C1F] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span>{msg.sender}</span>
                    <span className="text-[10px] text-indigo-400 font-normal px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {msg.role}
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
          <h3 className="text-sm font-semibold text-white border-b border-[#1C1C1F] pb-3">
            Team Roster & Roles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeTeam.members.map((member) => (
              <div key={member.id} className="p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-lg object-cover ring-1 ring-[#27272A] shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{member.name}</h4>
                    <p className="text-[11px] text-indigo-400 font-medium">{member.role}</p>
                    <span className="inline-block text-[10px] text-emerald-400 font-mono mt-0.5">
                      Status: {member.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
