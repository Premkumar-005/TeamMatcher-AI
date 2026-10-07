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
  Clock,
  AlertCircle
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
import api from '../services/api';

export default function DashboardPage() {
  const { user, projects, teams, myApplications, projectApplications = [], setSelectedProject, addToast } = useApp();
  const navigate = useNavigate();
  const [openingResume, setOpeningResume] = React.useState(false);

  const isOwner = user?.role === 'OWNER';

  // 1. Gather all real skills from either extractedSkills or user.skills
  const extractedCategories = user.extractedSkills || {};
  const hasExtractedCategories =
    (extractedCategories.languages?.length || 0) +
    (extractedCategories.frameworks?.length || 0) +
    (extractedCategories.databases?.length || 0) +
    (extractedCategories.tools?.length || 0) +
    (extractedCategories.softSkills?.length || 0) > 0;

  const realSkillsList = [];
  const seenSkillNames = new Set();

  if (hasExtractedCategories) {
    const addCat = (arr, category) => {
      (arr || []).forEach((item) => {
        const name = typeof item === 'string' ? item.trim() : item?.name;
        if (name && !seenSkillNames.has(name.toLowerCase())) {
          seenSkillNames.add(name.toLowerCase());
          const matchedProfileSkill = (user.skills || []).find(
            (s) => (s.name || s).toLowerCase() === name.toLowerCase()
          );
          const prof = matchedProfileSkill?.proficiency || matchedProfileSkill?.level || 80;
          realSkillsList.push({
            name,
            proficiency: prof,
            category
          });
        }
      });
    };
    addCat(extractedCategories.languages, 'Languages');
    addCat(extractedCategories.frameworks, 'Frameworks');
    addCat(extractedCategories.databases, 'Databases');
    addCat(extractedCategories.tools, 'Tools');
    addCat(extractedCategories.softSkills, 'Soft Skills');
  }

  if (realSkillsList.length === 0 && Array.isArray(user.skills)) {
    user.skills.forEach((s) => {
      const name = typeof s === 'string' ? s.trim() : s?.name;
      if (name && !seenSkillNames.has(name.toLowerCase())) {
        seenSkillNames.add(name.toLowerCase());
        realSkillsList.push({
          name,
          proficiency: typeof s.proficiency === 'number' ? s.proficiency : typeof s.level === 'number' ? s.level : 80,
          category: s.category || 'Core'
        });
      }
    });
  }

  // Radar chart data based strictly on real worker skills (max 6 for radar polygon)
  const radarData = realSkillsList.slice(0, 6).map((s) => {
    let score = 80;
    if (typeof s.proficiency === 'number') {
      score = s.proficiency;
    } else if (typeof s.level === 'number') {
      score = s.level;
    } else if (typeof s.level === 'string') {
      const lvl = s.level.toUpperCase();
      if (lvl === 'EXPERT') score = 95;
      else if (lvl === 'ADVANCED') score = 80;
      else if (lvl === 'INTERMEDIATE') score = 65;
      else score = 50;
    }
    return {
      subject: s.name,
      A: score,
      fullMark: 100
    };
  });

  // Resume status checks based strictly on real MongoDB data
  const isResumeUploaded = Boolean(user.resume && user.resume.trim());
  const isTextExtracted = Boolean(user.resumeRawText && user.resumeRawText.trim().length > 0);
  const isSkillsIdentified = realSkillsList.length > 0;
  const isAnalyzing = user.resumeStatus === 'ANALYZING';
  const hasAnalysisError = user.resumeStatus === 'ANALYSIS_FAILED';
  const isProcessingComplete = isResumeUploaded && isTextExtracted && isSkillsIdentified && !hasAnalysisError && !isAnalyzing;
  const isSkillsFromResume = Boolean(isResumeUploaded && (hasExtractedCategories || (isTextExtracted && isSkillsIdentified)));

  const resumeFileName = user.resume ? user.resume.split('/').pop() : null;
  const uploadDate = user.updatedAt || user.createdAt;
  const uploadDateFormatted = uploadDate
    ? new Date(uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const handleOpenResume = async () => {
    if (!user?.resume) {
      if (addToast) {
        addToast('Resume Unavailable', 'Resume file is currently unavailable.', 'error');
      }
      return;
    }

    try {
      setOpeningResume(true);
      await api.viewResume(resumeFileName || 'resume');
    } catch (err) {
      console.error('Failed to view resume:', err);
      if (addToast) {
        addToast(
          'Resume Unavailable',
          err.message || 'Resume file is currently unavailable.',
          'error'
        );
      }
    } finally {
      setOpeningResume(false);
    }
  };

  // Filter projects created by this owner using real ownerId and logged-in user id
  const ownerProjects = projects.filter((project) => {
    const projectOwnerId = (
      (typeof project.ownerId === 'string' ? project.ownerId : null) ||
      project.ownerId?._id ||
      project.ownerId?.id ||
      (typeof project.owner === 'string' ? project.owner : null) ||
      project.owner?._id ||
      project.owner?.id
    )?.toString();

    const loggedInUserId = (user?.id || user?._id)?.toString();

    return Boolean(projectOwnerId && loggedInUserId && (project.ownerId === user?.id || projectOwnerId === loggedInUserId));
  });

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
            value={`${ownerProjects.length}`}
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
            value={`${projectApplications.length} Active`}
            subtitle="Candidates waiting for review"
            icon={Inbox}
            onClick={() => navigate('/requests')}
          />
          <MetricCard
            title="Sprint Workspace"
            value="Ready"
            subtitle="Sprint tasks & collaborative chat"
            icon={Briefcase}
            onClick={() => navigate('/team-workspace')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Profile Completion"
            value={`${user.profileCompletion !== undefined ? user.profileCompletion : 0}%`}
            subtitle="Skills & background score"
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
            {(isOwner ? ownerProjects : projects).slice(0, 4).map((project) => (
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
            {isOwner ? (
              <>
                <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Project Management Quick Links</span>
                </h3>

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
                      Manage sprint tasks, shared documents, and real-time team messages.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Technical Proficiency Radar</span>
                  </h3>
                  {isSkillsFromResume && radarData.length > 0 && (
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      AI-extracted skills from your uploaded resume
                    </p>
                  )}
                </div>

                {/* Radar Chart */}
                <div className="h-52 w-full flex items-center justify-center">
                  {radarData.length > 0 ? (
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
                  ) : (
                    <div className="text-center p-4 text-xs text-[#71717A]">
                      No technical skills recorded yet. Add skills in your profile or upload a resume to view your proficiency radar.
                    </div>
                  )}
                </div>

                {/* Resume Status Section */}
                <div className="p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#71717A]">Resume Status</span>
                    {isProcessingComplete ? (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Analyzed &amp; Ready
                      </span>
                    ) : isAnalyzing ? (
                      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        Processing Analysis...
                      </span>
                    ) : hasAnalysisError ? (
                      <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        Analysis Failed
                      </span>
                    ) : isResumeUploaded ? (
                      <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-full">
                        Uploaded
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-zinc-400 bg-zinc-800/40 border border-zinc-700/40 px-2.5 py-0.5 rounded-full">
                        Not Uploaded
                      </span>
                    )}
                  </div>

                  {isProcessingComplete ? (
                    <>
                      <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                        Your resume has been successfully uploaded and analyzed. Skills are ready to be used for project matching and skill gap analysis.
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1C1C1F]">
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">Resume Uploaded</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">Text Extracted</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">Skills Identified</span>
                        </div>
                      </div>
                    </>
                  ) : hasAnalysisError ? (
                    <p className="text-[11px] text-rose-400/90 leading-relaxed">
                      {user.resumeAnalysisError || 'Resume text could not be analyzed.'}
                    </p>
                  ) : !isResumeUploaded ? (
                    <p className="text-[11px] text-[#71717A] leading-relaxed">
                      Upload your resume to extract skills automatically for project matching and skill gap analysis.
                    </p>
                  ) : null}
                </div>

                {/* Resume File Information */}
                {resumeFileName && (
                  <div
                    onClick={handleOpenResume}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenResume();
                      }
                    }}
                    title="Click to view uploaded resume"
                    className="p-3 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] hover:border-indigo-500/50 hover:bg-[#121216] transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-xs group select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-semibold tracking-wider text-[#71717A] group-hover:text-indigo-400 transition-colors">
                          Resume
                        </div>
                        <p className="text-white font-medium truncate" title={resumeFileName}>
                          {resumeFileName}
                        </p>
                      </div>
                    </div>
                    {uploadDateFormatted && (
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-[#71717A]">Uploaded</div>
                        <span className="text-[11px] text-zinc-300 font-mono">
                          {uploadDateFormatted}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Top Skills Identified Section */}
                <div className="pt-3 border-t border-[#1C1C1F] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Top Skills Identified</span>
                    {realSkillsList.length > 0 && (
                      <span className="text-[10px] text-indigo-400 font-mono">
                        {realSkillsList.length} {realSkillsList.length === 1 ? 'skill' : 'skills'}
                      </span>
                    )}
                  </div>

                  {realSkillsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {realSkillsList.map((skill, idx) => (
                        <span
                          key={skill.name || idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0E0E10] text-[#D4D4D8] border border-[#1C1C1F] font-medium flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span>{skill.name}</span>
                          {typeof skill.proficiency === 'number' && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {skill.proficiency}%
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#71717A] py-1 text-center">
                      No skills identified from resume yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
