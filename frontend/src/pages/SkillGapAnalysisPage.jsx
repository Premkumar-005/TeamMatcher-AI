import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, ExternalLink, BookOpen, Clock, Users, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import ScoreGauge from '../components/ui/ScoreGauge';
import Button from '../components/ui/Button';

export default function SkillGapAnalysisPage() {
  const { selectedProject, user, projects, setSelectedProject } = useApp();
  const navigate = useNavigate();

  // Map user skill levels
  const userSkillMap = {};
  (user.skills || []).forEach((s) => {
    userSkillMap[s.name.toLowerCase()] = s.proficiency !== undefined ? s.proficiency : s.level || 80;
  });

  const projectSkills = selectedProject ? selectedProject.requiredSkills : ['React', 'Node.js', 'MongoDB', 'Python', 'Machine Learning'];

  const matchedSkills = [];
  const missingSkills = [];

  projectSkills.forEach((sk) => {
    const key = sk.toLowerCase();
    if (userSkillMap[key] !== undefined) {
      matchedSkills.push({ name: sk, level: userSkillMap[key] });
    } else {
      missingSkills.push({ name: sk });
    }
  });

  const projectMatch = Math.round((matchedSkills.length / projectSkills.length) * 100);

  const learningRoadmap = [
    {
      skill: 'Machine Learning',
      title: 'Google ML Crash Course with TensorFlow',
      provider: 'Google AI Education',
      duration: '1 Week (15 Hours)',
      link: 'https://developers.google.com/machine-learning/crash-course'
    },
    {
      skill: 'Python & FastAPI',
      title: 'Kaggle Python & Data Science Specialization',
      provider: 'Kaggle Learn',
      duration: '4 Days (8 Hours)',
      link: 'https://www.kaggle.com/learn'
    },
    {
      skill: 'Docker & DevOps',
      title: 'Docker & Kubernetes Fundamentals',
      provider: 'Coursera / DeepLearning.AI',
      duration: '1.5 Weeks (12 Hours)',
      link: 'https://www.coursera.org'
    }
  ];

  return (
    <DashboardLayout title="Skill Gap & Learning">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium mb-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Gap Detection</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Skill Gap & Learning Roadmap
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Target Project: <span className="text-indigo-400 font-medium">{selectedProject ? selectedProject.title : 'AI Attendance System'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71717A] font-medium shrink-0">Target Project:</span>
          <select
            value={selectedProject ? selectedProject.id : projects[0].id}
            onChange={(e) => {
              const p = projects.find((x) => x.id === e.target.value);
              if (p) setSelectedProject(p);
            }}
            className="saas-input px-3 py-1.5 text-xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0B0B0B]">
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Match Banner & Recommendation */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <ScoreGauge
            score={projectMatch}
            size={110}
            strokeWidth={8}
            label=""
            sublabel="Match"
            color={projectMatch >= 75 ? '#10B981' : '#6366F1'}
          />

          <div className="space-y-1 text-left">
            <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider block">
              Project Match Score
            </span>
            <div className="text-2xl font-bold text-white">{projectMatch}%</div>
            <p className="text-xs text-[#9CA3AF]">
              You possess <span className="text-emerald-400 font-medium">{matchedSkills.length}</span> of {projectSkills.length} required technology stack competencies.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] text-xs space-y-2.5 max-w-sm w-full">
          <span className="font-semibold text-white block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Recommendation:
          </span>
          <p className="text-[#9CA3AF] leading-relaxed">
            {missingSkills.length > 0
              ? `Bridge missing skills (${missingSkills.map((m) => m.name).join(', ')}) with recommended courses or invite a complementary teammate.`
              : 'You have achieved 100% skill coverage for this project!'}
          </p>
          {missingSkills.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              className="w-full mt-1"
              onClick={() => navigate('/team-recommendations')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Find Teammates for Missing Gaps
            </Button>
          )}
        </div>
      </div>

      {/* Skills Available vs Missing Breakdown */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-[#1C1C1F] pb-3">
          Head-to-Head Skill Requirements
        </h3>

        <div className="space-y-2">
          {matchedSkills.map((sk) => (
            <div
              key={sk.name}
              className="p-3 rounded-lg bg-[#0E0E10] border border-emerald-500/20 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="font-semibold text-white">{sk.name}</span>
                  <span className="ml-2 text-[10px] text-emerald-400 font-medium uppercase">Verified in Profile</span>
                </div>
              </div>
              <span className="text-xs font-mono text-[#A1A1AA]">Proficiency: {sk.level}%</span>
            </div>
          ))}

          {missingSkills.map((sk) => (
            <div
              key={sk.name}
              className="p-3 rounded-lg bg-[#0E0E10] border border-rose-500/20 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="font-semibold text-white">{sk.name}</span>
                  <span className="ml-2 text-[10px] text-rose-400 font-medium uppercase">Missing Gap</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/team-recommendations')}
                className="text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-md border border-rose-500/25 transition-colors"
              >
                Find Teammate →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Path & Courses Section */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-xl space-y-4">
        <div className="border-b border-[#1C1C1F] pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Suggested Learning Resources</span>
          </h3>
          <p className="text-xs text-[#71717A]">Curated courses to bridge your missing project tech gaps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {learningRoadmap.map((course) => (
            <div
              key={course.title}
              className="p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {course.skill}
                  </span>
                  <span className="text-[10px] text-[#71717A] font-medium">{course.provider}</span>
                </div>
                <h4 className="text-xs font-semibold text-white leading-snug">{course.title}</h4>
                <p className="text-[11px] text-[#71717A] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#71717A]" /> {course.duration}
                </p>
              </div>

              <a
                href={course.link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 rounded-lg bg-[#141414] hover:bg-[#18181B] text-xs font-medium text-[#D4D4D8] hover:text-white flex items-center justify-center gap-1.5 transition-colors border border-[#222226]"
              >
                <span>Start Course</span>
                <ExternalLink className="w-3 h-3 text-[#71717A]" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
