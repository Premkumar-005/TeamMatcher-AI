import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, GitCompare, CheckCircle2, Sparkles, RefreshCw, Lightbulb, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import ScoreGauge from '../components/ui/ScoreGauge';
import SkillTag from '../components/ui/SkillTag';
import Button from '../components/ui/Button';

export default function ResumeAnalysisPage() {
  const { user } = useApp();
  const navigate = useNavigate();

  const extractedCategories = [
    {
      title: 'Languages',
      skills: [
        { name: 'Java', confidence: '98%' },
        { name: 'Python', confidence: '90%' },
        { name: 'JavaScript', confidence: '95%' },
        { name: 'SQL', confidence: '88%' }
      ]
    },
    {
      title: 'Frameworks & Libraries',
      skills: [
        { name: 'React', confidence: '96%' },
        { name: 'Node.js', confidence: '91%' },
        { name: 'Express.js', confidence: '89%' },
        { name: 'Spring Boot', confidence: '85%' },
        { name: 'Tailwind CSS', confidence: '94%' }
      ]
    },
    {
      title: 'Databases & Storage',
      skills: [
        { name: 'MongoDB', confidence: '90%' },
        { name: 'PostgreSQL', confidence: '87%' },
        { name: 'Redis', confidence: '82%' }
      ]
    },
    {
      title: 'Tools & DevOps',
      skills: [
        { name: 'Git', confidence: '95%' },
        { name: 'Docker', confidence: '84%' },
        { name: 'Postman', confidence: '92%' },
        { name: 'Vite', confidence: '90%' }
      ]
    }
  ];

  const suggestedUpdates = [
    'Add TensorFlow or PyTorch to your skills to boost AI project match from 83% to 98%.',
    'Include Docker deployment details in project descriptions for higher backend score.',
    'Link your GitHub repository for TeamMatcher Platform to verify code contribution metrics.'
  ];

  return (
    <DashboardLayout title="Resume Analysis Results">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-medium mb-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Parsing Complete</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Resume Extraction & Score
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Extracted skills with confidence tags, experience level analysis, and suggested profile updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/resume-upload')}
            icon={RefreshCw}
          >
            Re-upload
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/skill-gap')}
            icon={GitCompare}
            iconPosition="right"
          >
            Run Skill Gap Analysis
          </Button>
        </div>
      </div>

      {/* Metrics & Gauges Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resume Score Radial Gauge */}
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
          <ScoreGauge
            score={user.resumeScore}
            size={130}
            strokeWidth={8}
            label="Resume Quality Score"
            sublabel="Benchmark"
            color="#10B981"
          />
          <p className="text-xs text-[#71717A] max-w-xs">
            Extracted 20+ verified technical keywords and proven delivery metrics.
          </p>
        </div>

        {/* Profile Strength */}
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-[#71717A] uppercase tracking-wider mb-2">
              <span>Profile Strength</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">92%</div>
            <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
              High density of verified full-stack frameworks, database schemas, and clean architectural experience.
            </p>
          </div>

          <div className="pt-3 border-t border-[#1C1C1F]">
            <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> High Candidate Readiness
            </span>
          </div>
        </div>

        {/* Experience & Level */}
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider block mb-2">
              Assessed Level
            </span>
            <div className="text-2xl font-bold text-white">{user.experienceLevel}</div>
            <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
              Proven full-stack production delivery, multi-tier database schemas, and microservices architecture.
            </p>
          </div>

          <div className="pt-3 border-t border-[#1C1C1F]">
            <span className="text-xs text-[#71717A] font-mono">Role: Full Stack Lead</span>
          </div>
        </div>
      </div>

      {/* AI-Suggested Profile Updates */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-xl space-y-3">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
          <span>Recommended Profile Updates</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suggestedUpdates.map((suggestion, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#121214] border border-[#1F1F23] text-xs text-[#A1A1AA] leading-relaxed flex items-start gap-2.5">
              <span className="w-4 h-4 rounded bg-indigo-500/15 text-indigo-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Skills List */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Extracted Technical Competencies</span>
          </h3>
          <span className="text-xs text-[#71717A]">Confidence Ratings Included</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {extractedCategories.map((cat) => (
            <div key={cat.title} className="p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-2.5">
              <h4 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">{cat.title}</h4>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((skill) => (
                  <SkillTag
                    key={skill.name}
                    name={skill.name}
                    variant="ai"
                    level={skill.confidence}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Projects */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-[#1C1C1F] pb-3">
          Extracted Projects & Portfolio
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white">Cloud Cost Optimizer</h4>
              <span className="text-[10px] text-emerald-400 font-mono">100% Parsed</span>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Built automated AWS cost analytics dashboard using React & Node.js microservices.
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              <SkillTag name="React" variant="neutral" size="sm" />
              <SkillTag name="Node.js" variant="neutral" size="sm" />
              <SkillTag name="AWS" variant="neutral" size="sm" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white">TeamMatcher AI Platform</h4>
              <span className="text-[10px] text-emerald-400 font-mono">100% Parsed</span>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Architected intelligent teammate matching frontend, skill gap analyzer, and workspace tools.
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              <SkillTag name="React" variant="neutral" size="sm" />
              <SkillTag name="Vite" variant="neutral" size="sm" />
              <SkillTag name="Tailwind CSS" variant="neutral" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
