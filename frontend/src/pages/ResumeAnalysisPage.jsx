import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  GitCompare,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  FolderGit2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import ScoreGauge from '../components/ui/ScoreGauge';
import SkillTag from '../components/ui/SkillTag';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function ResumeAnalysisPage() {
  const { user, setUser, analyzeWorkerResume, projects, selectedProject, setSelectedProject, addToast } = useApp();
  const navigate = useNavigate();

  const [analyzing, setAnalyzing] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Sync fresh resume details on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLatestDetails = async () => {
      try {
        setLoadingDetails(true);
        const res = await api.getResumeDetails();
        if (isMounted && res.success && res.data) {
          setUser((prev) => ({
            ...prev,
            resume: res.data.resume || prev.resume,
            resumeStatus: res.data.resumeStatus || prev.resumeStatus,
            resumeAnalysisError: res.data.resumeAnalysisError || '',
            resumeScore: res.data.resumeScore || 0,
            extractedSkills: res.data.extractedSkills || prev.extractedSkills
          }));
        }
      } catch (err) {
        // Fall back silently to context user
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    fetchLatestDetails();
    return () => {
      isMounted = false;
    };
  }, [setUser]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    await analyzeWorkerResume();
    setAnalyzing(false);
  };

  const extracted = user.extractedSkills || {};
  const categories = [
    { key: 'languages', title: 'Languages', skills: extracted.languages || [] },
    { key: 'frameworks', title: 'Frameworks & Libraries', skills: extracted.frameworks || [] },
    { key: 'databases', title: 'Databases & Storage', skills: extracted.databases || [] },
    { key: 'tools', title: 'Tools & DevOps', skills: extracted.tools || [] },
    { key: 'softSkills', title: 'Soft Skills', skills: extracted.softSkills || [] }
  ];

  const totalExtractedCount = categories.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0);

  // Combine extracted resume skills for skill gap matching
  const allResumeSkills = [
    ...(extracted.languages || []),
    ...(extracted.frameworks || []),
    ...(extracted.databases || []),
    ...(extracted.tools || []),
    ...(extracted.softSkills || [])
  ];

  // Target project for skill gap
  const activeTargetProject = selectedProject || (projects && projects.length > 0 ? projects[0] : null);
  const rawProjectSkills = activeTargetProject?.requiredSkills || [];
  const projectRequiredSkills = rawProjectSkills.map((s) => (typeof s === 'string' ? s : s.name));

  // Deterministic resume-based skill gap
  const resumeSkillSet = new Set(allResumeSkills.map((s) => s.trim().toLowerCase()));
  const matchedSkills = [];
  const missingSkills = [];

  projectRequiredSkills.forEach((reqSkill) => {
    if (resumeSkillSet.has(reqSkill.trim().toLowerCase())) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const targetProjectMatchPct =
    projectRequiredSkills.length > 0
      ? Math.round((matchedSkills.length / projectRequiredSkills.length) * 100)
      : null;

  return (
    <DashboardLayout title="Resume Analysis Results">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {user.resumeStatus === 'ANALYZED' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Hugging Face AI Analysis Complete</span>
              </span>
            )}
            {user.resumeStatus === 'UPLOADED' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-xs font-medium">
                <FileText className="w-3 h-3" />
                <span>Resume Uploaded (Ready for AI Extraction)</span>
              </span>
            )}
            {user.resumeStatus === 'ANALYSIS_FAILED' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25 text-xs font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>Analysis Issue</span>
              </span>
            )}
            {user.resumeStatus === 'NOT_UPLOADED' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1C1C1F] text-[#9CA3AF] text-xs font-medium">
                <span>No Resume Uploaded</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Resume Extraction & Analysis
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Real skills extracted via pretrained Hugging Face NLP model, verified against your uploaded resume.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {user.resume && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRunAnalysis}
              disabled={analyzing}
              icon={RefreshCw}
              className={analyzing ? 'animate-pulse' : ''}
            >
              {analyzing ? 'Extracting with Hugging Face...' : 'Run Hugging Face Extraction'}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/resume-upload')}
            icon={FileText}
          >
            Re-upload
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/skill-gap')}
            icon={GitCompare}
            iconPosition="right"
          >
            Skill Gap Page
          </Button>
        </div>
      </div>

      {/* Meaningful Error Notification Banner if extraction failed */}
      {user.resumeStatus === 'ANALYSIS_FAILED' && user.resumeAnalysisError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Extraction Status: </span>
              <span className="text-[#F87171]">{user.resumeAnalysisError}</span>
              <p className="text-[11px] text-[#A1A1AA] mt-1">
                Your uploaded resume is preserved safely. Check backend/.env for your HUGGINGFACE_API_KEY and click "Run Hugging Face Extraction" to retry.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunAnalysis}
            disabled={analyzing}
            icon={RefreshCw}
            className="shrink-0"
          >
            Retry Extraction
          </Button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resume Score / Extracted Count */}
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
          {totalExtractedCount > 0 ? (
            <>
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 flex flex-col items-center justify-center bg-emerald-500/5">
                <span className="text-2xl font-bold text-white">{totalExtractedCount}</span>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">Skills</span>
              </div>
              <span className="text-xs font-semibold text-white">Extracted Competencies</span>
              <p className="text-xs text-[#71717A] max-w-xs">
                Parsed from your uploaded resume across {categories.filter((c) => c.skills.length > 0).length} technical categories.
              </p>
            </>
          ) : (
            <div className="py-4 space-y-2">
              <span className="text-xs text-[#71717A] block font-mono">Resume Score</span>
              <div className="text-sm font-medium text-[#9CA3AF]">
                Not enough data to calculate proficiency
              </div>
              <p className="text-xs text-[#52525B]">
                Upload and run Hugging Face analysis to evaluate your resume metrics.
              </p>
            </div>
          )}
        </div>

        {/* Profile Strength */}
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-[#71717A] uppercase tracking-wider mb-2">
              <span>Profile Completion</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {user.profileCompletion ? `${user.profileCompletion}%` : 'Not enough data to calculate proficiency'}
            </div>
            <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
              Based on uploaded resume, bio, education, verified competencies, and project portfolio.
            </p>
          </div>

          <div className="pt-3 border-t border-[#1C1C1F]">
            <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Status: {user.resumeStatus || 'NOT_UPLOADED'}
            </span>
          </div>
        </div>

        {/* Experience & Level */}
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider block mb-2">
              Profile Level
            </span>
            <div className="text-2xl font-bold text-white">{user.experienceLevel || 'Intermediate'}</div>
            <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
              {user.experienceYears ? `${user.experienceYears} year(s) recorded experience.` : 'Self-declared candidate experience tier.'}
            </p>
          </div>

          <div className="pt-3 border-t border-[#1C1C1F]">
            <span className="text-xs text-[#71717A] font-mono">
              Worker: {user.name || 'Current User'}
            </span>
          </div>
        </div>
      </div>

      {/* Extracted Skills List from Real MongoDB data */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Extracted Technical Competencies (Hugging Face NLP)</span>
          </h3>
          <span className="text-xs text-[#71717A]">
            {totalExtractedCount > 0 ? `${totalExtractedCount} Verified Skills` : 'No skills extracted yet'}
          </span>
        </div>

        {totalExtractedCount === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-3">
            <FileText className="w-8 h-8 text-[#52525B] mx-auto" />
            <h4 className="text-sm font-semibold text-white">No Skills Extracted Yet</h4>
            <p className="text-xs text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
              {user.resume
                ? 'Your resume is uploaded. Click "Run Hugging Face Extraction" above to send the resume text to Hugging Face and automatically extract your skills.'
                : 'Upload your resume in PDF, DOCX, TXT, or RTF format to automatically extract your skills using Hugging Face AI.'}
            </p>
            {user.resume ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunAnalysis}
                disabled={analyzing}
                icon={Sparkles}
              >
                {analyzing ? 'Extracting with Hugging Face...' : 'Extract Skills with Hugging Face'}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/resume-upload')}
                icon={FileText}
              >
                Upload Resume
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              if (!cat.skills || cat.skills.length === 0) return null;
              return (
                <div key={cat.title} className="p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">
                      {cat.title}
                    </h4>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {cat.skills.length} detected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((skillName) => (
                      <SkillTag
                        key={skillName}
                        name={skillName}
                        variant="ai"
                        level="Resume Verified"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project-Specific Skill Gap Analysis using Real Extracted Skills */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C1F] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-indigo-400" />
              <span>Project-Specific Skill Gap Analysis</span>
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Calculated dynamically from real extracted resume skills vs project requirements.
            </p>
          </div>

          {projects && projects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#71717A] font-medium shrink-0">Project:</span>
              <select
                value={activeTargetProject ? (activeTargetProject._id || activeTargetProject.id) : ''}
                onChange={(e) => {
                  const p = projects.find((x) => (x._id || x.id) === e.target.value);
                  if (p) setSelectedProject(p);
                }}
                className="saas-input px-3 py-1 text-xs"
              >
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id} className="bg-[#0B0B0B]">
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeTargetProject ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] gap-3">
              <div>
                <span className="text-xs text-[#71717A] uppercase font-semibold block">Target Project</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{activeTargetProject.title}</h4>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Category: {activeTargetProject.category || 'General'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#71717A] uppercase font-semibold block">Resume Match</span>
                <span className="text-xl font-bold text-emerald-400">
                  {targetProjectMatchPct !== null ? `${targetProjectMatchPct}%` : 'Not evaluated'}
                </span>
                <span className="text-[11px] text-[#A1A1AA] block">
                  {matchedSkills.length} of {projectRequiredSkills.length} required skills matched
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Matched Skills */}
              <div className="p-4 rounded-xl bg-[#0E0E10] border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-[#1C1C1F]">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({matchedSkills.length})
                  </span>
                  <span className="text-[10px] text-[#71717A]">Found in Resume</span>
                </div>
                {matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#71717A] pt-1">
                    No matching skills found for this project in extracted resume data.
                  </p>
                )}
              </div>

              {/* Missing Skills */}
              <div className="p-4 rounded-xl bg-[#0E0E10] border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-[#1C1C1F]">
                  <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Missing Skills ({missingSkills.length})
                  </span>
                  <span className="text-[10px] text-[#71717A]">Skill Gaps</span>
                </div>
                {missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {missingSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-medium"
                      >
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 pt-1">
                    All required skills for this project are covered by your resume!
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-[#71717A]">
            No projects available to compare against. Create or browse projects in the Project Directory.
          </div>
        )}
      </div>

      {/* Real Candidate Projects from MongoDB profile */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-[#1C1C1F] pb-3 flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-indigo-400" />
          <span>Profile Projects & Portfolio</span>
        </h3>

        {user.projects && user.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white">{proj.name || 'Untitled Project'}</h4>
                  {proj.role && (
                    <span className="text-[10px] text-indigo-400 font-mono">{proj.role}</span>
                  )}
                </div>
                {Array.isArray(proj.tech) && proj.tech.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.tech.map((t, tIdx) => (
                      <SkillTag key={tIdx} name={t} variant="neutral" size="sm" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-[#0E0E10] border border-[#1C1C1F] text-xs text-[#71717A] space-y-1">
            <p className="text-white font-medium">No profile projects listed</p>
            <p>You can add specific portfolio projects under Profile Settings.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
