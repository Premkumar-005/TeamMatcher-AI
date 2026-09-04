import React from 'react';
import Card from './Card';
import Button from './Button';
import SkillBadge from './SkillBadge';
import { Eye, UserPlus, Check } from 'lucide-react';

export default function UserCard({
  user,
  onViewProfile,
  onSendRequest,
  isRequestSent = false
}) {
  return (
    <Card className="flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-lg object-cover ring-1 ring-[#27272A] shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
              <p className="text-xs text-indigo-400 truncate">{user.role}</p>
              <p className="text-[11px] text-[#71717A] truncate">{user.experience}</p>
            </div>
          </div>

          <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-semibold shrink-0">
            {user.compatibility}% Match
          </div>
        </div>

        {/* Reason Box */}
        <p className="text-xs text-[#A1A1AA] bg-[#121214] p-2.5 rounded-lg border border-[#1F1F23] leading-relaxed">
          <span className="font-medium text-white">Match Reason:</span> "{user.matchReason}"
        </p>

        {/* Skills */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-medium text-[#71717A] uppercase tracking-wider block">Key Skills</span>
          <div className="flex flex-wrap gap-1.5">
            {user.skills.map((sk) => (
              <SkillBadge key={sk} name={sk} />
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[#1C1C1F] flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewProfile && onViewProfile(user)}
          icon={Eye}
        >
          View Profile
        </Button>
        <Button
          variant={isRequestSent ? 'secondary' : 'primary'}
          size="sm"
          disabled={isRequestSent}
          onClick={() => onSendRequest && onSendRequest(user)}
          icon={isRequestSent ? Check : UserPlus}
        >
          {isRequestSent ? 'Sent' : 'Send Request'}
        </Button>
      </div>
    </Card>
  );
}

