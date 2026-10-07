import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Eye,
  RefreshCw,
  ShieldCheck
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
import FileUploadZone from '../components/ui/FileUploadZone';
import Button from '../components/ui/Button';
import api from '../services/api';

function formatFileSize(bytes) {
  if (!bytes || typeof bytes !== 'number') return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResumeUploadPage() {
  const { user, setUser, uploadWorkerResume, addToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [viewingResume, setViewingResume] = useState(false);
  const [resumeDetails, setResumeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Allow ?replace=true to start with replace mode open
  const [isReplacing, setIsReplacing] = useState(() => searchParams.get('replace') === 'true');

  // Sync real resume details from backend on mount
  const fetchResumeData = async () => {
    try {
      setLoadingDetails(true);
      const res = await api.getResumeDetails();
      if (res.success && res.data) {
        setResumeDetails(res.data);
        if (setUser) {
          setUser((prev) => ({
            ...prev,
            resume: res.data.resume || prev.resume,
            resumeStatus: res.data.resumeStatus || prev.resumeStatus,
            resumeAnalysisError: res.data.resumeAnalysisError || '',
            resumeScore: res.data.resumeScore || 0,
            extractedSkills: res.data.extractedSkills || prev.extractedSkills
          }));
        }
      }
    } catch (err) {
      // Fall back silently to context user data
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchResumeData();
  }, []);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setUploadSuccess(false);
  };

  const handleUploadResume = async () => {
    if (!file) return;
    setUploading(true);
    const res = await uploadWorkerResume(file);
    setUploading(false);
    if (res?.success) {
      setUploadSuccess(true);
      setIsReplacing(false);
      setFile(null);
      await fetchResumeData();
    }
  };

  // Resolve current real resume information
  const currentResumePath = resumeDetails?.resume || user?.resume;
  const isResumeUploaded = Boolean(currentResumePath && currentResumePath.trim());
  const resumeFileName = isResumeUploaded ? currentResumePath.split('/').pop() : null;

  // Real skills extraction from real backend data
  const extractedCategories = resumeDetails?.extractedSkills || user?.extractedSkills || {};
  const hasExtractedCategories =
    (extractedCategories.languages?.length || 0) +
    (extractedCategories.frameworks?.length || 0) +
    (extractedCategories.databases?.length || 0) +
    (extractedCategories.tools?.length || 0) +
    (extractedCategories.softSkills?.length || 0) > 0;

  const realSkillsList = useMemo(() => {
    const list = [];
    const seenSkillNames = new Set();

    if (hasExtractedCategories) {
      const addCat = (arr, category) => {
        (arr || []).forEach((item) => {
          const name = typeof item === 'string' ? item.trim() : item?.name;
          if (name && !seenSkillNames.has(name.toLowerCase())) {
            seenSkillNames.add(name.toLowerCase());
            const matchedProfileSkill = (user?.skills || []).find(
              (s) => (s.name || s).toLowerCase() === name.toLowerCase()
            );
            const prof = matchedProfileSkill?.proficiency || matchedProfileSkill?.level || 80;
            list.push({
              name,
              proficiency: prof,
              category
            });
          }
        });
      };

      addCat(extractedCategories.languages, 'Languages');
      addCat(extractedCategories.frameworks, 'Frameworks & Libraries');
      addCat(extractedCategories.databases, 'Databases & Storage');
      addCat(extractedCategories.tools, 'Tools & DevOps');
      addCat(extractedCategories.softSkills, 'Soft Skills');
    } else if (Array.isArray(user?.skills) && user.skills.length > 0) {
      user.skills.forEach((s) => {
        const name = typeof s === 'string' ? s.trim() : s?.name;
        if (name && !seenSkillNames.has(name.toLowerCase())) {
          seenSkillNames.add(name.toLowerCase());
          const prof = typeof s === 'object' && s.proficiency !== undefined ? s.proficiency : s.level || 80;
          list.push({
            name,
            proficiency: prof,
            category: s.category || 'General'
          });
        }
      });
    }

    return list;
  }, [extractedCategories, hasExtractedCategories, user?.skills]);

  // Radar chart data using real skills
  const radarData = useMemo(() => {
    return realSkillsList.slice(0, 7).map((s) => {
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
  }, [realSkillsList]);

  // Real status indicators
  const currentStatus = resumeDetails?.resumeStatus || user?.resumeStatus || 'NOT_UPLOADED';
  const hasRawText = Boolean(resumeDetails?.hasRawText || (user?.resumeRawText && user.resumeRawText.trim().length > 0));
  const isTextExtracted = hasRawText;
  const isSkillsIdentified = realSkillsList.length > 0;
  const isAnalyzing = currentStatus === 'ANALYZING';
  const hasAnalysisError = currentStatus === 'ANALYSIS_FAILED';
  const isProcessingComplete =
    isResumeUploaded && isTextExtracted && isSkillsIdentified && !hasAnalysisError && !isAnalyzing;

  // Real upload date
  const uploadDate = resumeDetails?.uploadedAt || user?.updatedAt || user?.createdAt;
  const uploadDateFormatted = uploadDate
    ? new Date(uploadDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  // Real file size
  const formattedSize = formatFileSize(resumeDetails?.fileSize);

  // View resume handler using existing secure API
  const handleViewResume = async () => {
    if (!currentResumePath) {
      if (addToast) {
        addToast('Resume Unavailable', 'Resume file is currently unavailable.', 'error');
      }
      return;
    }

    try {
      setViewingResume(true);
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
      setViewingResume(false);
    }
  };

  // =========================================================================
  // CASE 1: NO EXISTING RESUME
  // =========================================================================
  if (!isResumeUploaded) {
    return (
      <DashboardLayout title="Resume Upload & Parsing" maxWidth="max-w-4xl">
        {/* Header Banner */}
        <div className="text-center space-y-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Worker Resume Storage Pipeline</span>
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Upload Your Resume
          </h2>
          <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-lg mx-auto leading-relaxed">
            Upload your resume in PDF, DOCX, DOC, TXT, or RTF format. Your file is securely stored and the text is extracted for future Hugging Face AI skill analysis.
          </p>
        </div>

        {/* Upload Box Card */}
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl space-y-6">
          <FileUploadZone onFileSelect={handleFileSelect} />

          {file && !uploadSuccess && (
            <div className="flex items-center justify-between pt-4 border-t border-[#1C1C1F]">
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-xs text-[#71717A] hover:text-[#A1A1AA] transition-colors"
              >
                Clear File Selection
              </button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleUploadResume}
                disabled={uploading}
                icon={Upload}
                iconPosition="right"
              >
                {uploading ? 'Uploading...' : 'Upload & Save Resume'}
              </Button>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Resume Stored Successfully
                  </h4>
                  <p className="text-[11px] text-[#A1A1AA]">
                    Your resume has been uploaded and processed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#9CA3AF] pt-2">
          <div className="p-4 rounded-xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-1.5">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <span className="text-indigo-400 font-mono">1.</span> Safe Storage
            </h4>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Multer handles multi-format document storage and file verification with 10MB limits.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-1.5">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <span className="text-indigo-400 font-mono">2.</span> Deterministic Match
            </h4>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Current project compatibility scores are calculated deterministically from your skills.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-1.5">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <span className="text-indigo-400 font-mono">3.</span> Hugging Face AI Extraction
            </h4>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Pretrained Hugging Face NLP model parses real resume text into categorized competencies.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =========================================================================
  // CASE 2: EXISTING REAL RESUME
  // =========================================================================
  return (
    <DashboardLayout title="Resume & Analysis" maxWidth="max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isProcessingComplete ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Analyzed &amp; Ready</span>
              </span>
            ) : isAnalyzing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs font-medium">
                <Clock className="w-3 h-3 animate-spin" />
                <span>Processing Analysis...</span>
              </span>
            ) : hasAnalysisError ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25 text-xs font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>Analysis Issue</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-xs font-medium">
                <FileText className="w-3 h-3" />
                <span>Uploaded</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Resume &amp; Analysis
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Your uploaded resume and AI analysis results.
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-2">
        {/* SECTION 1 — YOUR RESUME */}
        <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
              Your Resume
            </span>
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
            ) : (
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-full">
                Uploaded
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white truncate" title={resumeFileName}>
                  {resumeFileName}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#71717A]">
                  {uploadDateFormatted && (
                    <span>Uploaded: <span className="text-zinc-300 font-mono">{uploadDateFormatted}</span></span>
                  )}
                  {formattedSize && (
                    <>
                      <span>•</span>
                      <span>Size: <span className="text-zinc-300 font-mono">{formattedSize}</span></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleViewResume}
                disabled={viewingResume}
                icon={Eye}
              >
                {viewingResume ? 'Opening...' : 'View Resume'}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsReplacing(!isReplacing)}
                icon={RefreshCw}
              >
                {isReplacing ? 'Hide Upload' : 'Replace Resume'}
              </Button>
            </div>
          </div>
        </div>

        {/* REPLACE RESUME INTERFACE (Toggled when Worker clicks [Replace Resume]) */}
        {isReplacing && (
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Upload Replacement Resume</span>
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Select a new resume file (PDF, DOCX, DOC, TXT, or RTF up to 10MB) to replace your current resume.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsReplacing(false);
                  setFile(null);
                }}
                className="text-xs text-[#71717A] hover:text-white px-2.5 py-1 rounded-lg border border-[#1C1C1F] hover:bg-[#18181B] transition-colors"
              >
                Cancel
              </button>
            </div>

            <FileUploadZone onFileSelect={handleFileSelect} />

            {file && (
              <div className="flex items-center justify-between pt-3 border-t border-[#1C1C1F]">
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs text-[#71717A] hover:text-[#A1A1AA] transition-colors"
                >
                  Clear Selection
                </button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleUploadResume}
                  disabled={uploading}
                  icon={Upload}
                  iconPosition="right"
                >
                  {uploading ? 'Uploading & Analyzing...' : 'Upload & Update Resume'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 2-COLUMN GRID: SECTION 2 (RADAR) & SECTION 3 (STATUS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SECTION 2 — TECHNICAL PROFICIENCY RADAR */}
          <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Technical Proficiency Radar</span>
              </h3>
              <p className="text-[11px] text-[#71717A] mt-0.5">
                AI-extracted skills from your uploaded resume
              </p>
            </div>

            <div className="h-64 w-full flex items-center justify-center my-2">
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#222226" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
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

            <div className="text-[11px] text-[#71717A] border-t border-[#1C1C1F] pt-2.5 flex items-center justify-between">
              <span>Skill Coverage</span>
              <span className="font-mono text-zinc-300">{realSkillsList.length} Technical Competencies</span>
            </div>
          </div>

          {/* SECTION 3 — RESUME STATUS */}
          <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Resume Status</span>
                </h3>
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
                ) : (
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-full">
                    Uploaded
                  </span>
                )}
              </div>

              {isProcessingComplete ? (
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Your resume has been successfully uploaded and analyzed. Skills are ready to be used for project matching and skill gap analysis.
                </p>
              ) : isAnalyzing ? (
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  Your resume text is currently being analyzed by Hugging Face AI. Extracted competencies will be available shortly.
                </p>
              ) : hasAnalysisError ? (
                <p className="text-xs text-rose-400/90 leading-relaxed">
                  {user?.resumeAnalysisError || 'Resume text could not be analyzed.'}
                </p>
              ) : (
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Your resume has been uploaded. Text extraction and skill identification are available for project matching.
                </p>
              )}
            </div>

            {/* Real Status Checklist */}
            <div className="space-y-2 pt-3 border-t border-[#1C1C1F]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  {isResumeUploaded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span>Resume Uploaded</span>
                </span>
                <span className={isResumeUploaded ? 'text-emerald-400 font-mono text-[11px]' : 'text-zinc-500 text-[11px]'}>
                  {isResumeUploaded ? 'Complete' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  {isTextExtracted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span>Text Extracted</span>
                </span>
                <span className={isTextExtracted ? 'text-emerald-400 font-mono text-[11px]' : 'text-zinc-500 text-[11px]'}>
                  {isTextExtracted ? `${resumeDetails?.rawTextWordCount || 'Extracted'} words` : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  {isSkillsIdentified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span>Skills Identified</span>
                </span>
                <span className={isSkillsIdentified ? 'text-emerald-400 font-mono text-[11px]' : 'text-zinc-500 text-[11px]'}>
                  {isSkillsIdentified ? `${realSkillsList.length} skills found` : 'Pending'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#71717A] border-t border-[#1C1C1F] pt-2.5 flex items-center justify-between">
              <span>Extraction Engine</span>
              <span className="text-zinc-400">Hugging Face Pretrained NLP</span>
            </div>
          </div>
        </div>

        {/* SECTION 4 — TOP SKILLS IDENTIFIED */}
        <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white">
              Top Skills Identified
            </h3>
            {realSkillsList.length > 0 && (
              <span className="text-[11px] text-indigo-400 font-mono">
                {realSkillsList.length} {realSkillsList.length === 1 ? 'skill' : 'skills'}
              </span>
            )}
          </div>

          {realSkillsList.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {realSkillsList.map((skill, idx) => (
                <span
                  key={skill.name || idx}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#0E0E10] text-[#D4D4D8] border border-[#1C1C1F] font-medium flex items-center gap-2"
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
            <p className="text-xs text-[#71717A] py-2 text-center">
              No skills identified from resume yet.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
