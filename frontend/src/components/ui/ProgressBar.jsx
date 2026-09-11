import React from 'react';

export default function ProgressBar({ value = 0, max = 100, color = 'bg-indigo-500', height = 'h-1.5', showLabel = false }) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex justify-between text-xs text-[#71717A] font-mono">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-[#141414] ${height} rounded-full overflow-hidden border border-[#222226]`}>
        <div
          className={`${color} h-full rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

