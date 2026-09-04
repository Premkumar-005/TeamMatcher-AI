import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ShieldCheck,
  ArrowLeft,
  Send,
  Building2,
  Clock,
  DollarSign,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import ScoreGauge from '../components/ui/ScoreGauge';
import SkillTag from '../components/ui/SkillTag';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { projects, user, applyToProjectAction } = useApp();
  const navigate = useNavigate();

  const [project, setProject] = useState(() => projects.find((p) => p.id === id || p._id === id) || projects[0]);
  const [matchData, setMatchData] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverMessage, setCoverMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const isOwner = user?.role === 'OWNER';
  const isProjectOwner = isOwner && (project.owner?._id === user._id || project.owner === user._id);

  // Fetch project details & live match from backend
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.getProjectById(id);
        if (res.success && res.data?.project) {
          const p = res.data.project;
          setProject({
            ...p,
            id: p._id,
            requiredSkills: (p.requiredSkills || []).map((s) => (typeof s === 'string' ? s : s.name))
          });

          if (p.userApplication) {
            setHasApplied(true);
          }
        }
      } catch (e) {
        // Fallback to local project
      }

      if (user?.role === 'WORKER') {
        try {
          const matchRes = await api.getProjectMatch(id);
          if (matchRes.success && matchRes.data) {
            setMatchData(matchRes.data);
          }
        } catch (e) {
          // Fallback match calculation
        }
      }
    };

    fetchDetails();
  }, [id, user?.role]);

  // Fallback match calculations if matchData is not loaded yet
  const userSkillNames = (user.skills || []).map((s) => (typeof s === 'string' ? s : s.name).toLowerCase());
  const projectSkillNames = (project.requiredSkills || []).map((s) => (typeof s === 'string' ? s : s.name));

  const availableSkills = projectSkillNames.filter((s) =>
    userSkillNames.includes(s.toLowerCase())
  );

  const missingSkills = projectSkillNames.filter(
    (s) => !userSkillNames.includes(s.toLowerCase())
  );

  const matchScore = matchData
    ? matchData.matchPercentage
    : projectSkillNames.length > 0
    ? Math.round((availableSkills.length / projectSkillNames.length) * 100)
    : 80;

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplying(true);
    const res = await applyToProjectAction(project.id || project._id, coverMessage);
    setApplying(false);
    if (res?.success) {
      setHasApplied(true);
      setShowApplyModal(false);
    }
  };

  return (
    <DashboardLayout title={`Project — ${project.title}`}>
      {/* Back Navigation & Category */}
      <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-4">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects Directory</span>
        </button>

        <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
          {project.category}
        </span>
      </div>

      {/* Project Title & Overview Banner */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs text-[#9CA3AF] max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5">
            {isProjectOwner ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/requests?projectId=${project.id || project._id}`)}
                icon={Users}
              >
                Review Applicants
              </Button>
            ) : isOwner ? (
              <span className="text-xs text-[#71717A] italic">Project Owner View</span>
            ) : hasApplied ? (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Application Submitted
              </span>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowApplyModal(true)}
                icon={Send}
              >
                Apply to Project
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#1C1C1F] text-xs text-[#71717A] font-medium">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Target Team Size: <strong className="text-[#D4D4D8]">{project.teamSize || 4} Members</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Duration: <strong className="text-[#D4D4D8]">{project.duration || 6} {project.durationUnit || 'weeks'}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Work Mode: <strong className="text-[#D4D4D8]">{project.workMode || 'Remote'}</strong>
          </span>
        </div>
      </div>

      {/* Scores & Compatibility Row (for Workers) */}
      {!isOwner && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#A1A1AA]">Skill Compatibility</span>
              <p className="text-2xl font-bold text-white">{matchScore}%</p>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                matchScore >= 75
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {matchData?.qualificationStatus || (matchScore >= 75 ? 'QUALIFIED' : 'PARTIAL')}
              </span>
            </div>
            <ScoreGauge score={matchScore} size={80} strokeWidth={7} />
          </div>

          <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#A1A1AA]">Matched Skills</span>
              <p className="text-2xl font-bold text-emerald-400">
                {matchData?.matchingSkills?.length !== undefined ? matchData.matchingSkills.length : availableSkills.length}
              </p>
              <p className="text-[11px] text-[#71717A]">Skills meeting required level</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {(matchData?.matchingSkills || availableSkills).map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#A1A1AA]">Missing / Gap Skills</span>
              <p className="text-2xl font-bold text-amber-400">
                {matchData?.missingSkills?.length !== undefined ? matchData.missingSkills.length : missingSkills.length}
              </p>
              <p className="text-[11px] text-[#71717A]">Can be filled by complementary teammates</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {(matchData?.missingSkills || missingSkills).map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  ○ {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Required Tech Stack Section */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Required Tech Stack & Competencies</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {projectSkillNames.map((skill) => (
            <SkillTag key={skill} name={skill} />
          ))}
        </div>
      </div>

      {/* WORKER APPLICATION MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0B0B] border border-[#1C1C1F] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Apply to {project.title}</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-[#71717A] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] text-xs space-y-1">
                <div className="text-indigo-400 font-semibold">Your Compatibility Score: {matchScore}%</div>
                <p className="text-[#71717A]">
                  Your profile and technical skills will be sent to the Project Owner for review.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Cover Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={coverMessage}
                  onChange={(e) => setCoverMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs saas-input resize-none"
                  placeholder="Explain why you're a great fit and what parts of the tech stack you'll own..."
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1"
                  disabled={applying}
                  icon={CheckCircle2}
                >
                  {applying ? 'Submitting...' : 'Send Application'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
