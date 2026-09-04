import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const DEFAULT_MESSAGES = [
  'Extracting technical skills & competencies...',
  'Analyzing project experience and vector embeddings...',
  'Computing skill gap metrics & readiness scores...',
  'Matching complementary teammates across vector database...',
  'Finalizing compatibility recommendations...'
];

export default function AIProcessingState({
  title = 'AI Processing...',
  messages = DEFAULT_MESSAGES,
  onComplete = null,
  durationMs = 3500
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const stepInterval = durationMs / messages.length;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < messages.length - 1) return prev + 1;
        return prev;
      });
    }, stepInterval);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onComplete) setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, durationMs / 50);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [messages, durationMs, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#0B0B0B] border border-[#1C1C1F] rounded-xl my-4">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#27272A] flex items-center justify-center mb-4 text-indigo-400">
        <Sparkles className="w-5 h-5" />
      </div>

      <h3 className="text-base font-semibold text-white mb-2 tracking-tight flex items-center gap-2">
        <span>{title}</span>
        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
      </h3>

      {/* Rotating Status Text */}
      <div className="h-7 flex items-center justify-center mb-5">
        <p className="text-xs font-medium text-[#A1A1AA] transition-all duration-200 ease-in-out flex items-center gap-2 bg-[#121214] px-3.5 py-1 rounded-full border border-[#222226]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{messages[currentStep]}</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm bg-[#141414] h-1.5 rounded-full overflow-hidden border border-[#222226] mb-5">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Skeleton Preview Loader Cards */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-2 opacity-50">
        <div className="h-8 skeleton-loader rounded-lg" />
        <div className="h-8 skeleton-loader rounded-lg" />
        <div className="h-8 skeleton-loader rounded-lg" />
      </div>
    </div>
  );
}

