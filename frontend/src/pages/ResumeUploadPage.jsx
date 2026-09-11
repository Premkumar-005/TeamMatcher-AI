import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, FileText, CheckCircle2, ShieldCheck, Upload, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import FileUploadZone from '../components/ui/FileUploadZone';
import Button from '../components/ui/Button';

export default function ResumeUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { user, uploadWorkerResume, addToast } = useApp();
  const navigate = useNavigate();

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
    }
  };

  return (
    <DashboardLayout title="Resume Upload & Parsing" maxWidth="max-w-4xl">
      {/* Header Banner */}
      <div className="text-center space-y-2 mb-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Worker Resume Storage Pipeline</span>
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Upload Your PDF Resume
        </h2>
        <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-lg mx-auto leading-relaxed">
          Upload your resume PDF to complete your technical profile. Your file will be securely stored in the backend and ready for future Hugging Face AI skill extraction.
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
              {uploading ? 'Uploading PDF...' : 'Upload & Save Resume'}
            </Button>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-white">Resume Stored Successfully (Status: UPLOADED)</h4>
                <p className="text-[11px] text-[#A1A1AA]">
                  Your PDF is securely stored on the backend server. Hugging Face AI skill extraction will be enabled in future updates.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/projects')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Explore Projects
            </Button>
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
            Multer handles PDF storage and file verification with 10MB limits.
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
            <span className="text-indigo-400 font-mono">3.</span> Future AI Integration
          </h4>
          <p className="text-[11px] text-[#71717A] leading-relaxed">
            Hugging Face NER & Sentence Transformers can be plugged into the existing service boundaries.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
