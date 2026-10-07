import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, ArrowRight, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function AiInsightsPage() {
  const navigate = useNavigate();
  const { user, projects = [] } = useApp();

  const userSkillNames = (user.skills || [])
    .map((s) => (typeof s === 'string' ? s : s.name))
    .filter(Boolean);
  const primarySkillsStr = userSkillNames.slice(0, 3).join(', ') || 'General Technical Competencies';

  const profileScore = user.profileCompletion !== undefined ? user.profileCompletion : 0;
  const projectCount = projects.length;

  const insights = [
    {
      title: 'Technical Foundation',
      desc: userSkillNames.length > 0
        ? `Your verified skills in ${primarySkillsStr} provide a solid foundation for matching project sprint teams.`
        : 'Add your technical skills or upload a resume to generate specialized stack diagnostics.',
      priority: 'Profile Stack',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      icon: CheckCircle2,
      action: 'View Skill Breakdown',
      link: '/skill-proficiency'
    },
    {
      title: 'Skill Gap Diagnostics',
      desc: 'Evaluate active project requirements against your real competencies to identify exact missing tech gaps.',
      priority: 'Diagnostic',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
      icon: AlertCircle,
      action: 'View Skill Gaps',
      link: '/skill-gap'
    },
    {
      title: `Candidate Profile Strength: ${profileScore}%`,
      desc: profileScore >= 100
        ? 'Your profile is fully complete and optimized for team matching algorithms.'
        : `Your profile completion is currently at ${profileScore}%. Update remaining profile details to reach 100%.`,
      priority: 'Profile Readiness',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      icon: Award,
      action: 'Edit Profile',
      link: '/profile'
    },
    {
      title: `Project Opportunities: ${projectCount} Available`,
      desc: `Browse ${projectCount} live project listings in the catalog to check compatibility scores and apply.`,
      priority: 'Opportunity',
      badgeColor: 'bg-[#141414] text-[#D4D4D8] border-[#222226]',
      icon: TrendingUp,
      action: 'Browse Projects',
      link: '/projects'
    }
  ];

  return (
    <DashboardLayout title="AI Insights & Diagnostics" maxWidth="max-w-5xl">
      <div className="border-b border-[#1C1C1F] pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>AI Insights & Recommendations</span>
        </h2>
        <p className="text-xs text-[#9CA3AF]">
          Continuous technical diagnostics derived from project catalog benchmarks and candidate skill matrices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                    {item.priority}
                  </span>
                  <Icon className="w-4 h-4 text-[#71717A]" />
                </div>

                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-[#1C1C1F] flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(item.link)}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {item.action}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
