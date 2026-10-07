import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users2, Briefcase, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function MyTeamsPage() {
  const { teams = [] } = useApp();
  const navigate = useNavigate();

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
          {teams.length} Active {teams.length === 1 ? 'Team' : 'Teams'}
        </span>
      </div>

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {teams.map((team) => {
            const teamId = team._id || team.id;
            const projectId = team.project?._id || team.project?.id || team.project || teamId;
            const projectName = team.project?.name || team.project?.title || team.name || 'Project';
            const coverageScore = team.skillCoverage?.percentage !== undefined
              ? team.skillCoverage.percentage
              : (team.overallScore !== undefined ? team.overallScore : 0);

            // Real members list - deduplicated by real user._id
            const rawMembers = Array.isArray(team.members) ? team.members : [];
            const seenMemberIds = new Set();
            const memberList = [];
            for (const m of rawMembers) {
              const uId = (m.user?._id || m.user || m.id || m._id)?.toString();
              if (uId && !seenMemberIds.has(uId)) {
                seenMemberIds.add(uId);
                memberList.push({
                  id: uId,
                  _id: uId,
                  name: m.user?.name || m.name || 'Member',
                  role: m.role || 'Specialist',
                  avatar: m.user?.avatar || m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                });
              }
            }
            const ownerName = team.owner?.name || (typeof team.owner === 'object' && team.owner?.name ? team.owner.name : null);

            return (
              <div
                key={teamId}
                className="bg-[#0B0B0B] border border-[#1C1C1F] hover:border-[#2E2E33] transition-all p-6 rounded-2xl space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Title & Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {projectName}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2">
                        {team.name}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        <Sparkles className="w-3 h-3" />
                        <span>{coverageScore}% Synergy</span>
                      </div>
                      <span className="text-[10px] text-[#71717A] mt-1 font-medium">
                        {coverageScore}% Skill Coverage
                      </span>
                    </div>
                  </div>

                  {/* Member Avatars */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">
                        Team Members ({memberList.length} {memberList.length === 1 ? 'Member' : 'Members'})
                      </p>
                      {ownerName && (
                        <span className="text-[10px] text-zinc-400 font-medium">
                          Owner: <strong className="text-white">{ownerName}</strong>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {memberList.map((member) => (
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
                    onClick={() => navigate(`/team-workspace?projectId=${projectId}`)}
                    icon={Briefcase}
                  >
                    Open Workspace
                  </Button>
                </div>
              </div>
            );
          })}
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
