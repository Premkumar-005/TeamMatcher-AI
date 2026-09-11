import React from 'react';
import { Check, X } from 'lucide-react';

export default function SkillBadge({
  name,
  level,
  status, // 'matched' | 'missing' | 'neutral'
  className = ''
}) {
  let statusStyles = 'bg-[#111111] text-[#D4D4D8] border-[#27272A]';

  if (status === 'matched') {
    statusStyles = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
  } else if (status === 'missing') {
    statusStyles = 'bg-rose-500/10 text-rose-300 border-rose-500/25';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${statusStyles} ${className}`}>
      {status === 'matched' && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
      {status === 'missing' && <X className="w-3 h-3 text-rose-400 shrink-0" />}
      <span>{name}</span>
      {level !== undefined && <span className="text-[10px] text-[#71717A] font-mono">({level}%)</span>}
    </span>
  );
}

