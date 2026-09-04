import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  UserCheck,
  FolderGit2,
  Users2,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Briefcase,
  Inbox,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import MetricCard from '../components/ui/MetricCard';
import ProjectCard from '../components/ui/ProjectCard';
import Button from '../components/ui/Button';

export default function DashboardPage() {
  const { user, projects, teams, myApplications, setSelectedProject } = useApp();
  const navigate = useNavigate();

  const isOwner = user?.role === 'OWNER';

  // Radar chart data based on worker skills
  const radarData = (user.skills || []).slice(0, 6).map((s) => ({
    subject: s.name,
    A: s.proficiency !== undefined ? s.proficiency : s.level || 80,
    fullMark: 100
  }));

  // Filter projects created by this owner if owner
  const ownerProjects = projects.filter(
    (p) => p.owner?._id === user._id || p.owner === user._id
  );

  return (
    <DashboardLayout title={isOwner ? 'Owner Dashboard' : 'Developer Overview'}>
      {/* 1. Greeting Banner */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{isOwner ? 'Project Owner Portal Active' : 'Developer Workspace Active'}</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Welcome back, {user.name}
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            {isOwner
              ? `Managing projects for ${user.company || 'your technical organization'}. Review applications and oversee your sprint teams below.`
              : `Your primary role is ${user.title || 'Technical Specialist'}. Explore open project opportunities and check your compatibility scores.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isOwner ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/requests')}
                icon={Inbox}
              >
                Review Applicants
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/projects')}
                icon={PlusCircle}
              >
                Post New Project
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/resume-upload')}
                icon={FileText}
              >
                Update Resume
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/projects')}
                icon={FolderGit2}
              >
                Browse Projects
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      {isOwner ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Projects Created"
            value={`${ownerProjects.length > 0 ? ownerProjects.length : projects.length}`}
            subtitle="Active project listings"
            icon={FolderGit2}
            onClick={() => navigate('/projects')}
          />
          <MetricCard
            title="Managed Teams"
            value={`${teams.length}`}
            subtitle="Sprint teams forming/active"
            icon={Users2}
            onClick={() => navigate('/teams')}
          />
          <MetricCard
            title="Talent Applications"
            value="3 Active"
            subtitle="Candidates waiting for review"
            icon={Inbox}
            onClick={() => navigate('/requests')}
          />
          <MetricCard
            title="Sprint Workspace"
            value="Ready"
            subtitle="Kanban & collaborative chat"
            icon={Briefcase}
            onClick={() => navigate('/team-workspace')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Profile Completion"
            value={`${user.profileCompletion || 85}%`}
            subtitle="Skills & background score"
            trend="+10% updated"
            icon={FileText}
            onClick={() => navigate('/profile')}
          />
          <MetricCard
            title="Open Opportunities"
            value={`${projects.length}`}
            subtitle="Projects matching your stack"
            icon={FolderGit2}
            onClick={() => navigate('/projects')}
          />
          <MetricCard
            title="Active Applications"
            value={`${myApplications.length}`}
            subtitle="Pending or accepted status"
            icon={Clock}
            onClick={() => navigate('/requests')}
          />
          <MetricCard
            title="Active Teams"
            value={`${teams.length}`}
            subtitle="Sprint teams joined"
            icon={Users2}
            onClick={() => navigate('/teams')}
          />
        </div>
      )}

      {/* 3. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Featured Project Opportunities / Managed Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>{isOwner ? 'Your Managed Projects' : 'Recommended Projects (Deterministic Match)'}</span>
            </h3>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={(p) => {
                  setSelectedProject(p);
                  navigate(`/projects/${p.id}`);
                }}
                userSkills={user.skills || []}
              />
            ))}
          </div>
        </div>

        {/* Right 1 Col: Skill Radar / Role Action Center */}
        <div className="space-y-4">
          <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isOwner ? 'Project Management Quick Links' : 'Technical Proficiency Radar'}</span>
            </h3>

            {isOwner ? (
              <div className="space-y-3 pt-1">
                <div
                  onClick={() => navigate('/projects')}
                  className="p-3 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] hover:border-indigo-500/40 transition-all cursor-pointer space-y-1"
                >
                  <div className="text-xs font-medium text-white flex items-center justify-between">
                    <span>Create & Publish Project</span>
                    <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="text-[11px] text-[#71717A]">
                    Define project duration, required tech stack, and team size.
                  </p>
                </div>

                <div
                  onClick={() => navigate('/requests')}
                  className="p-3 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] hover:border-indigo-500/40 transition-all cursor-pointer space-y-1"
                >
                  <div className="text-xs font-medium text-white flex items-center justify-between">
                    <span>Review Worker Applications</span>
                    <Inbox className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-[#71717A]">
                    Accept candidate applications to automatically form and populate teams.
                  </p>
                </div>

                <div
                  onClick={() => navigate('/team-workspace')}
                  className="p-3 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] hover:border-indigo-500/40 transition-all cursor-pointer space-y-1"
                >
                  <div className="text-xs font-medium text-white flex items-center justify-between">
                    <span>Enter Team Workspace</span>
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="text-[11px] text-[#71717A]">
                    Manage Kanban sprint tasks, shared documents, and real-time team messages.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#222226" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#A1A1AA', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#222226" />
                      <Radar
                        name="Skill Proficiency"
                        dataKey="A"
                        stroke="#6366F1"
                        fill="#6366F1"
                        fillOpacity={0.25}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-3 border-t border-[#1C1C1F] flex items-center justify-between text-xs">
                  <span className="text-[#71717A]">Resume Status:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {user.resumeStatus || 'UPLOADED'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
