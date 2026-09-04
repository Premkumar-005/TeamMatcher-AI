import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  X,
  FileText,
  GitCompare,
  Users2,
  Award,
  Target,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/ui/Button';

export default function LandingPage() {
  const navigate = useNavigate();

  const metrics = [
    { value: '10K+', label: 'Developer Profiles' },
    { value: '2.5K+', label: 'Teams Formed' },
    { value: '94%', label: 'Average Compatibility Fit' }
  ];

  const steps = [
    { num: '01', title: 'Create your profile', desc: 'Set up your developer profile with your core technical interests, roles, and experience level.' },
    { num: '02', title: 'Upload your resume', desc: 'Drag and drop your PDF resume to automatically extract skills, projects, and certifications.' },
    { num: '03', title: 'Analyze your skills', desc: 'Evaluate your technical competencies against live project requirements and detect skill gaps.' },
    { num: '04', title: 'Find ideal teammates', desc: 'Get recommended teammates whose complementary skills fill your exact project gaps.' }
  ];

  const features = [
    {
      icon: FileText,
      title: 'AI Resume Parsing',
      desc: 'Automatically extract verified skills, project history, experience duration, education, and certifications with confidence scores.'
    },
    {
      icon: GitCompare,
      title: 'Skill Gap Analysis',
      desc: 'Compare your current skill levels head-to-head with target project requirements to identify missing tech stack items and readiness.'
    },
    {
      icon: Users2,
      title: 'Smart Team Matching',
      desc: 'Match with developers having complementary skill sets (Frontend + Backend + AI/ML + UI/UX) to construct balanced engineering teams.'
    },
    {
      icon: Award,
      title: 'Compatibility Scoring',
      desc: 'Algorithmic synergy scoring derived from skills, hands-on experience, shared technical interests, and project domain demands.'
    },
    {
      icon: Target,
      title: 'Project Readiness Index',
      desc: 'Calculates an accurate preparedness metric showing how ready you and your potential team are to execute a specific software project.'
    },
    {
      icon: Briefcase,
      title: 'Team Workspace & Kanban',
      desc: 'Integrated collaboration tools including sprint Kanban boards, instant team chat, and shared project documents.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] selection:bg-indigo-600 selection:text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden border-b border-[#1C1C1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Subtle Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-[#27272A] text-xs font-medium text-[#D4D4D8] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Intelligent Team Formation Platform</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.08] mb-6">
            Build Better Teams.<br />
            <span className="text-[#9CA3AF]">Match Smarter.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#9CA3AF] max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            Find the right teammates based on skills, experience, interests, and project requirements — not random selection.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-16">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Find Your Team
            </Button>

            <a href="#how-it-works">
              <Button variant="secondary" size="lg">
                See How It Works
              </Button>
            </a>
          </div>

          {/* REAL PRODUCT PREVIEW MOCKUP */}
          <div className="max-w-4xl mx-auto bg-[#09090B] border border-[#222226] rounded-2xl p-4 sm:p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#27272A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27272A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27272A]" />
                <span className="text-xs text-[#71717A] font-mono ml-2">teammatcher.ai / synergy-engine</span>
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                High Synergy Match
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. YOUR PROFILE */}
              <div className="p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-3">
                <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider block">YOUR PROFILE</span>
                <div className="space-y-2">
                  <div className="text-xs text-white font-medium flex items-center justify-between">
                    <span>React</span>
                    <span className="text-[#71717A] font-mono">82%</span>
                  </div>
                  <div className="text-xs text-white font-medium flex items-center justify-between">
                    <span>Node.js</span>
                    <span className="text-[#71717A] font-mono">76%</span>
                  </div>
                  <div className="text-xs text-white font-medium flex items-center justify-between">
                    <span>MongoDB</span>
                    <span className="text-[#71717A] font-mono">72%</span>
                  </div>
                  <div className="text-xs text-white font-medium flex items-center justify-between">
                    <span>Python</span>
                    <span className="text-[#71717A] font-mono">65%</span>
                  </div>
                </div>
              </div>

              {/* 2. PROJECT REQUIREMENTS */}
              <div className="p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] space-y-3">
                <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider block">AI ATTENDANCE SYSTEM</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#D4D4D8]">
                    <span>React</span>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between text-[#D4D4D8]">
                    <span>Node.js</span>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between text-[#D4D4D8]">
                    <span>MongoDB</span>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between text-[#71717A]">
                    <span>Machine Learning</span>
                    <span className="text-rose-400 text-[11px] font-medium">Missing</span>
                  </div>
                </div>
              </div>

              {/* 3. TEAM COVERAGE & RECOMMENDED */}
              <div className="p-4 rounded-xl bg-[#0E0E10] border border-[#1C1C1F] flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider block">PROJECT READINESS</span>
                  <div className="text-2xl font-bold text-white mt-1">85%</div>
                </div>

                <div className="pt-2.5 border-t border-[#1C1C1F]">
                  <span className="text-[9px] text-[#71717A] uppercase block font-semibold">Recommended Teammate</span>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <p className="text-xs font-semibold text-white">Arun Kumar</p>
                      <p className="text-[10px] text-[#71717A]">Python • ML • Backend</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">96% match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* METRICS SECTION */}
      <section className="py-14 border-b border-[#1C1C1F] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {metrics.map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{m.value}</div>
                <div className="text-xs text-[#71717A] font-medium">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 sm:py-24 border-b border-[#1C1C1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Simple Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How TeamMatcher Works</h2>
            <p className="text-[#9CA3AF] text-xs sm:text-sm">Four straightforward steps to turn individual technical profiles into complete, high-performing teams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step) => (
              <div key={step.num} className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block">
                    {step.num}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 sm:py-24 border-b border-[#1C1C1F] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Built for Builders</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Platform Capabilities</h2>
            <p className="text-[#9CA3AF] text-xs sm:text-sm">Designed with precision for software engineers, student hackathons, and product creators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-xl space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#27272A] flex items-center justify-center text-indigo-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{feat.title}</h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW / TEAMS SECTION */}
      <section id="teams" className="py-20 sm:py-24 border-b border-[#1C1C1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Product Experience</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Interactive Dashboard Preview</h2>
            <p className="text-[#9CA3AF] text-xs sm:text-sm">Manage team recommendations, resume scoring, skill gaps, and workspace sprints in one place.</p>
          </div>

          {/* DASHBOARD PREVIEW UI */}
          <div className="bg-[#09090B] border border-[#1C1C1F] rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex h-[460px]">
              
              {/* Mock Sidebar */}
              <div className="hidden lg:flex w-52 bg-[#0B0B0B] border-r border-[#1C1C1F] p-3.5 flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-semibold text-xs text-white px-2">TeamMatcher</div>
                  <div className="space-y-0.5">
                    {[
                      { label: 'Overview', active: true, icon: LayoutDashboard },
                      { label: 'Resume', active: false, icon: FileText },
                      { label: 'Skills', active: false, icon: BarChart3 },
                      { label: 'Projects', active: false, icon: Layers },
                      { label: 'Find Teammates', active: false, icon: Users2 },
                      { label: 'Workspace', active: false, icon: Briefcase }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                            item.active ? 'bg-[#141414] text-white' : 'text-[#71717A]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-[#71717A]" />
                          <span>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#111111] text-[11px] text-[#A1A1AA]">
                  Logesh (You)
                </div>
              </div>

              {/* Mock Main Dashboard View */}
              <div className="flex-1 bg-[#050505] p-5 sm:p-6 overflow-y-auto space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-white">Good evening, Logesh.</h3>
                  <p className="text-xs text-[#71717A] mt-0.5">Here's your current team-building overview.</p>
                </div>

                {/* Dashboard Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-1">
                    <span className="text-[10px] text-[#71717A] font-medium uppercase">Resume Score</span>
                    <div className="text-xl font-bold text-white">88/100</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-1">
                    <span className="text-[10px] text-[#71717A] font-medium uppercase">Skill Coverage</span>
                    <div className="text-xl font-bold text-white">84%</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-1">
                    <span className="text-[10px] text-[#71717A] font-medium uppercase">Project Readiness</span>
                    <div className="text-xl font-bold text-white">92%</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0B0B0B] border border-[#1C1C1F] space-y-1">
                    <span className="text-[10px] text-[#71717A] font-medium uppercase">Team Compatibility</span>
                    <div className="text-xl font-bold text-indigo-400">95%</div>
                  </div>
                </div>

                {/* Recommended Teammates Section */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">Recommended Teammates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#0B0B0B] border border-[#1C1C1F] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">Arun Kumar</p>
                        <p className="text-[#71717A] text-[11px]">Backend + ML</p>
                      </div>
                      <span className="font-medium text-emerald-400 text-xs">96% match</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B0B0B] border border-[#1C1C1F] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">Kavin Raj</p>
                        <p className="text-[#71717A] text-[11px]">Java + Spring Boot</p>
                      </div>
                      <span className="font-medium text-emerald-400 text-xs">91% match</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-[#050505] text-xs text-[#71717A] border-t border-[#1C1C1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#111111] border border-[#27272A] flex items-center justify-center text-white font-semibold text-[10px]">
              T
            </div>
            <span className="font-semibold text-white">TeamMatcher</span>
            <span>— Intelligent team-building platform</span>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <span>© 2026 TeamMatcher</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

