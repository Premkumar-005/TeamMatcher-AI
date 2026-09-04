import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function FileUploadZone({ onFileSelect, acceptedFormats = '.pdf,.docx' }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = (file) => {
    setError('');
    if (!file) return;

    const validExtensions = ['pdf', 'docx', 'doc'];
    const fileExt = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setError('Invalid file format. Please upload a PDF or DOCX document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10 MB limit.');
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/5'
            : selectedFile
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-[#27272A] bg-[#09090B] hover:border-[#3F3F46] hover:bg-[#0E0E10]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-3 text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-1.5">
              <span>{selectedFile.name}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </h4>
            <p className="text-xs text-[#71717A] mb-4 font-mono">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              icon={RefreshCw}
            >
              Choose Another File
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#27272A] flex items-center justify-center mb-3.5 text-[#A1A1AA]">
              <Upload className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">
              Drag and drop your resume here
            </h4>
            <p className="text-xs text-[#71717A] max-w-sm mb-4 leading-relaxed">
              Supports PDF and DOCX (up to 10 MB). The AI engine parses skills, experience, and project matches.
            </p>
            <Button variant="primary" size="sm">
              Browse Document
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

