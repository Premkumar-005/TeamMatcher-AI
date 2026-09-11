import React from 'react';
import { UserCheck, Sparkles, Globe, Code2, Check } from 'lucide-react';
import SkillTag from './SkillTag';

export default function TeammateCard({ candidate, onSendRequest, isRequested = false }) {
  const {
    id,
    name,
    role,
    avatar,
    compatibility,
    skills = [],
    experience,
    matchReason,
    github,
    linkedin
  } = candidate;

  return (
    <div className="bg-[#0B0B0B] border border-[#1C1C1F] hover:border-[#2E2E33] transition-all rounded-xl p-5 flex flex-col justify-between h-full group">
      <div>
        {/* Header: Avatar, Name, Compatibility */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={avatar}
              alt={name}
              className="w-11 h-11 rounded-lg object-cover ring-1 ring-[#27272A] shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-semibold text-white text-sm leading-snug group-hover:text-indigo-400 transition-colors truncate">
                {name}
              </h4>
              <p className="text-xs text-[#9CA3AF] truncate">{role}</p>
              {experience && (
                <span className="text-[11px] text-[#71717A] mt-0.5 block truncate">
                  {experience}
                </span>
              )}
            </div>
          </div>

          {/* Compatibility Score Badge */}
          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
            <Sparkles className="w-3 h-3" />
            <span>{compatibility}% Match</span>
          </div>
        </div>

        {/* Match Reason Highlight */}
        {matchReason && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-[#121215] border border-[#1F1F24] text-xs text-[#A1A1AA] leading-relaxed flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{matchReason}</span>
          </div>
        )}

        {/* Skills Tag List */}
        <div className="mb-3">
          <p className="text-[10px] font-medium text-[#71717A] uppercase tracking-wider mb-2">
            Key Competencies
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, idx) => (
              <SkillTag key={idx} name={skill} variant="neutral" size="sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="pt-3 border-t border-[#1C1C1F] flex items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-1.5">
          {github && (
            <a
              href={`https://github.com/${github}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#141414] transition-colors"
              title="GitHub Profile"
            >
              <Code2 className="w-3.5 h-3.5" />
            </a>
          )}
          {linkedin && (
            <a
              href={`https://linkedin.com/in/${linkedin}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#141414] transition-colors"
              title="LinkedIn Profile"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <button
          onClick={() => onSendRequest && onSendRequest(candidate)}
          disabled={isRequested}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isRequested
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 cursor-default'
              : 'bg-white text-black hover:bg-[#E4E4E7] font-semibold active:scale-[0.98]'
          }`}
        >
          {isRequested ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Invite Sent</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Send Request</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

