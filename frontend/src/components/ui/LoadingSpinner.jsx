import React from 'react';

export default function LoadingSpinner({ size = 'md', label }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4">
      <div className={`${sizes[size]} rounded-full border-[#27272A] border-t-indigo-500 animate-spin`} />
      {label && <p className="text-xs text-[#71717A] font-mono">{label}</p>}
    </div>
  );
}

