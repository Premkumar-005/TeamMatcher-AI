import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users2, Briefcase, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function MyTeamsPage() {
  const { activeTeam } = useApp();
  const navigate = useNavigate();

  const teams = activeTeam ? [activeTeam] : [];

  return (
    <DashboardLayout title="My Formed Teams">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            My Active Teams
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Teams you have formed or joined. Click any team to enter its shared collaborative sprint workspace.
          </p>
        </div>

        <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 w-fit">
          {teams.length} Active Team
        </span>
      </div>

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-[#0B0B0B] border border-[#1C1C1F] hover:border-[#2E2E33] transition-all p-6 rounded-2xl space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Title & Score */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {team.project}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">
                      {team.name}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>{team.overallScore}% Synergy</span>
                    </div>
                    <span className="text-[10px] text-[#71717A] mt-1 font-medium">100% Skill Coverage</span>
                  </div>
                </div>

                {/* Member Avatars */}
                <div>
                  <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider mb-2">
                    Team Composition ({team.members.length} Members)
                  </p>
                  <div className="flex items-center gap-2">
                    {team.members.map((member) => (
                      <img
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#27272A] hover:ring-indigo-400 transition-all"
                        title={`${member.name} (${member.role})`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer & Action */}
              <div className="pt-4 border-t border-[#1C1C1F] flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Sprint
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/team-workspace')}
                  icon={Briefcase}
                >
                  Open Workspace
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users2}
          title="No Active Teams Formed"
          description="You haven't formed or joined any active project teams yet."
          actionLabel="Find Teammates"
          actionLink="/team-recommendations"
        />
      )}
    </DashboardLayout>
  );
}
