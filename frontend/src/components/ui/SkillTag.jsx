import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export default function SkillTag({
  name,
  skill = null,
  variant = 'neutral', // 'matched' | 'missing' | 'neutral' | 'ai'
  level = null,
  onRemove = null,
  size = 'md'
}) {
  const displayName = name || skill || '';

  const getStyles = () => {
    switch (variant) {
      case 'matched':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
      case 'missing':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/25';
      case 'ai':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25';
      case 'neutral':
      default:
        return 'bg-[#111113] text-[#D4D4D8] border-[#27272A] hover:border-[#3F3F46]';
    }
  };

  const getIcon = () => {
    if (variant === 'matched') return <Check className="w-3 h-3 text-emerald-400 shrink-0" />;
    if (variant === 'missing') return <X className="w-3 h-3 text-rose-400 shrink-0" />;
    if (variant === 'ai') return <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />;
    return null;
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[11px] rounded-md' 
    : 'px-2.5 py-1 text-xs rounded-lg font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 border transition-colors ${getStyles()} ${sizeClasses}`}
    >
      {getIcon()}
      <span>{displayName}</span>
      {level && (
        <span className="ml-0.5 px-1 py-0.2 rounded text-[10px] font-mono text-[#A1A1AA] bg-[#1A1A1E]">
          {level}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 text-[#71717A] hover:text-rose-400 transition-colors focus:outline-none"
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

