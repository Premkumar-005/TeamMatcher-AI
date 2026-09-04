import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, Check, Briefcase, Users2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function TeamFormationPage() {
  const { activeTeam } = useApp();
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Team Formation">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Your Formed Team</h2>
          <p className="text-xs text-[#9CA3AF]">
            Target Project: <span className="text-white font-medium">{activeTeam.project}</span>
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/team-workspace')}
          icon={ArrowRight}
          iconPosition="right"
        >
          Open Workspace
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="space-y-1.5">
          <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider block">Team Coverage</span>
          <div className="text-3xl font-bold text-emerald-400">{activeTeam.coverage}%</div>
          <p className="text-xs text-[#71717A] flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Complete Tech Stack Coverage
          </p>
        </Card>

        <Card className="space-y-1.5">
          <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider block">Synergy Score</span>
          <div className="text-3xl font-bold text-white">{activeTeam.overallScore}%</div>
          <p className="text-xs text-[#71717A]">Derived from skills & experience synergy</p>
        </Card>

        <Card className="space-y-1.5">
          <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider block">Project Readiness</span>
          <div className="text-3xl font-bold text-indigo-400">{activeTeam.successPrediction}%</div>
          <p className="text-xs text-[#71717A]">Predicted project completion rate</p>
        </Card>
      </div>

      {/* Your Team Roster */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-3">
          <h3 className="text-sm font-semibold text-white">Team Members ({activeTeam.members.length})</h3>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            All Confirmed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeTeam.members.map((member) => (
            <div
              key={member.name}
              className="p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-9 h-9 rounded-lg object-cover ring-1 ring-[#27272A] shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{member.name}</h4>
                  <p className="text-[11px] text-indigo-400 truncate">{member.role}</p>
                </div>
              </div>

              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#141414] text-[#D4D4D8] border border-[#222226] shrink-0">
                {member.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
