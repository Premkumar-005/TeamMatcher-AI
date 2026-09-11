import React from 'react';
import Card from './Card';

export default function TeamCard({ team }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{team.name}</h3>
          <p className="text-xs text-[#9CA3AF]">Target: {team.project}</p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
          All Confirmed
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="p-2 rounded-lg bg-[#121214] border border-[#1F1F23]">
          <span className="text-[10px] text-[#71717A] font-medium block uppercase">Team Score</span>
          <span className="text-base font-bold text-white">{team.overallScore}%</span>
        </div>
        <div className="p-2 rounded-lg bg-[#121214] border border-[#1F1F23]">
          <span className="text-[10px] text-[#71717A] font-medium block uppercase">Success Rate</span>
          <span className="text-base font-bold text-indigo-400">{team.successPrediction}%</span>
        </div>
        <div className="p-2 rounded-lg bg-[#121214] border border-[#1F1F23]">
          <span className="text-[10px] text-[#71717A] font-medium block uppercase">Coverage</span>
          <span className="text-base font-bold text-emerald-400">{team.coverage}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-medium text-[#71717A] uppercase tracking-wider block">Members Matrix</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {team.members.map((m) => (
            <div key={m.name} className="flex items-center justify-between p-2 rounded-lg bg-[#121214] border border-[#1F1F23] text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-md object-cover ring-1 ring-[#27272A] shrink-0" />
                <span className="font-medium text-white truncate">{m.name}</span>
              </div>
              <span className="text-[10px] text-[#71717A] truncate ml-2">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

