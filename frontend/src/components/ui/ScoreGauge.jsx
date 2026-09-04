import React from 'react';

export default function ScoreGauge({
  score = 85,
  size = 120,
  strokeWidth = 8,
  label = 'Score',
  color = '#6366F1',
  sublabel = ''
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine dynamic color if not passed explicitly
  const getDynamicColor = () => {
    if (color !== '#6366F1') return color;
    if (score >= 85) return '#10B981'; // Emerald
    if (score >= 70) return '#6366F1'; // Indigo
    if (score >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Rose
  };

  const ringColor = getDynamicColor();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg] transform">
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1C1C20"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold tracking-tight text-white">
            {score}%
          </span>
          {sublabel && <span className="text-[9px] uppercase font-semibold text-[#71717A]">{sublabel}</span>}
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-medium text-[#A1A1AA]">{label}</span>}
    </div>
  );
}

