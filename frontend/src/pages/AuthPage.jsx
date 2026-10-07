import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Users2,
  Code,
  GraduationCap,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Building2,
  Check,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const SKILL_OPTIONS = [
  'React', 'Node.js', 'Python', 'Java', 'TypeScript',
  'MongoDB', 'PostgreSQL', 'Machine Learning', 'TensorFlow',
  'FastAPI', 'Docker', 'Tailwind CSS', 'Figma', 'GraphQL'
];

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser, registerUser, addToast, theme, toggleTheme } = useApp();
  const isLight = theme === 'light';

  const isRegisterInitial = location.pathname === '/register';
  const [mode, setMode] = useState(isRegisterInitial ? 'register' : 'login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('WORKER'); // 'OWNER' | 'WORKER'
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    title: '',
    selectedSkills: [],
    bio: '',
    institution: '',
    degree: '',
    experienceLevel: 'Intermediate',
    github: '',
    linkedin: '',
    portfolio: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      addToast('Missing Credentials', 'Please provide both email and password.', 'error');
      return;
    }
    setLoading(true);
    const res = await loginUser({ email: formData.email, password: formData.password });
    setLoading(false);
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      addToast('Email Required', 'Please enter your email address to reset password.', 'error');
      return;
    }
    addToast('Password Reset', `Instructions sent to ${formData.email}`, 'info');
  };

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.selectedSkills.includes(skill);
      return {
        ...prev,
        selectedSkills: exists
          ? prev.selectedSkills.filter((s) => s !== skill)
          : [...prev.selectedSkills, skill]
      };
    });
  };

  const handleStep1Next = () => {
    if (!formData.name.trim()) {
      addToast('Name Required', 'Please enter your full name.', 'error');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      addToast('Valid Email Required', 'Please enter a valid email address.', 'error');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      addToast('Password Too Short', 'Password must be at least 6 characters.', 'error');
      return;
    }
    setStep(2);
  };

  const handleRegisterFinish = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Name Required', 'Please enter your full name.', 'error');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      addToast('Valid Email Required', 'Please enter a valid email address.', 'error');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      addToast('Password Too Short', 'Password must be at least 6 characters.', 'error');
      return;
    }

    if (selectedRole === 'WORKER') {
      if (!formData.confirmPassword) {
        addToast('Confirm Password Required', 'Please confirm your password.', 'error');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        addToast('Password Mismatch', 'Password and Confirm Password do not match.', 'error');
        return;
      }
    }

    setLoading(true);
    const res = await registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: selectedRole,
      title: formData.title,
      company: formData.company,
      bio: formData.bio,
      college: formData.institution,
      institution: formData.institution,
      degree: formData.degree,
      selectedSkills: selectedRole === 'WORKER' ? [] : formData.selectedSkills,
      experienceLevel: formData.experienceLevel,
      github: formData.github,
      linkedin: formData.linkedin,
      portfolio: formData.portfolio
    });
    setLoading(false);
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  const handleQuickDemoLoginWorker = async () => {
    setLoading(true);
    const res = await loginUser({
      email: 'logeshsubramanian12@gmail.com',
      password: 'password123'
    });
    setLoading(false);
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  const handleQuickDemoLoginOwner = async () => {
    setLoading(true);
    const res = await loginUser({
      email: 'owner.alex@teammatcher.ai',
      password: 'password123'
    });
    setLoading(false);
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  const totalSteps = selectedRole === 'OWNER' ? 2 : 1;

  return (
    <div className={`min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden font-sans transition-colors duration-200 ${
      isLight
        ? 'bg-[#F8FAFC] text-[#0F172A] selection:bg-blue-600 selection:text-white'
        : 'bg-[#050507] text-[#F5F5F5] selection:bg-zinc-700 selection:text-white'
    }`}>
      
      {/* ================================================== */}
      {/* LEFT SIDE — BRANDING PANEL (~50% width on Desktop) */}
      {/* ================================================== */}
      <div className={`hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 xl:p-14 overflow-hidden select-none transition-colors duration-200 ${
        isLight
          ? 'bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] border-r border-[#E2E8F0]'
          : 'bg-[#030304] border-r border-zinc-800/60'
      }`}>
        
        {/* Background Graphics */}
        {isLight ? (
          /* Bright, clean, professional light theme background graphics */
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/70 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl" />
            <svg className="absolute -left-20 top-10 w-[120%] h-[120%] opacity-20" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="450" r="420" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="200" cy="450" r="300" stroke="#93C5FD" strokeWidth="1" />
            </svg>
            <svg className="absolute bottom-0 left-0 w-full h-[35%] opacity-40 z-0" viewBox="0 0 1200 500" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0 350 C300 280, 600 420, 1200 260 L1200 500 L0 500 Z" fill="#E2E8F0" />
              <path d="M0 400 C400 320, 800 450, 1200 340 L1200 500 L0 500 Z" fill="#CBD5E1" />
            </svg>
          </div>
        ) : (
          /* Atmospheric Background Graphics for Dark Mode */
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[12%] left-[25%] w-1 h-1 bg-white rounded-full opacity-60 animate-pulse" />
            <div className="absolute top-[28%] left-[75%] w-1.5 h-1.5 bg-white rounded-full opacity-40" />
            <div className="absolute top-[45%] left-[55%] w-1 h-1 bg-zinc-300 rounded-full opacity-70" />
            <div className="absolute top-[18%] left-[82%] w-1 h-1 bg-white rounded-full opacity-50" />
            <div className="absolute top-[65%] left-[18%] w-1.5 h-1.5 bg-zinc-400 rounded-full opacity-30" />
            <div className="absolute top-[35%] left-[38%] w-0.5 h-0.5 bg-white rounded-full opacity-80" />
            <div className="absolute top-[52%] left-[88%] w-1 h-1 bg-white rounded-full opacity-40" />
            <div className="absolute top-[78%] left-[45%] w-1 h-1 bg-zinc-400 rounded-full opacity-50" />

            <svg className="absolute -left-32 top-0 w-[140%] h-[140%] opacity-25" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="450" r="420" stroke="url(#horizon-glow)" strokeWidth="1.5" />
              <circle cx="200" cy="450" r="419" fill="url(#planet-grad)" />
              <defs>
                <linearGradient id="horizon-glow" x1="0" y1="0" x2="1000" y2="1000" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" stopOpacity="0.8" />
                  <stop offset="0.5" stopColor="#888888" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#000000" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="planet-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 450) scale(420)">
                  <stop stopColor="#18181B" stopOpacity="0.6" />
                  <stop offset="0.7" stopColor="#09090B" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#030304" stopOpacity="1" />
                </radialGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#030304] via-black/80 to-transparent z-0" />
            <svg className="absolute bottom-0 left-0 w-full h-[45%] opacity-40 z-0" viewBox="0 0 1200 500" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0 350 C300 280, 600 420, 1200 260 L1200 500 L0 500 Z" fill="url(#wave1)" />
              <path d="M0 400 C400 320, 800 450, 1200 340 L1200 500 L0 500 Z" fill="url(#wave2)" />
              <defs>
                <linearGradient id="wave1" x1="0" y1="0" x2="0" y2="500" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#27272A" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#050507" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="wave2" x1="0" y1="0" x2="0" y2="500" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#18181B" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#030304" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-105 ${
              isLight
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/10 border border-white/20 text-white'
            }`}>
              <Users2 className="w-5 h-5" />
            </div>
            <span className={`font-bold text-xl tracking-tight ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
              TeamMatcher
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mb-6">
          <h1 className={`text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4 ${
            isLight ? 'text-[#0F172A]' : 'text-white'
          }`}>
            Build Better<br />Teams With AI.
          </h1>
          
          <p className={`text-base leading-relaxed mb-8 font-normal ${
            isLight ? 'text-[#475569]' : 'text-zinc-400'
          }`}>
            AI-powered team matching that connects project owners with the right skilled workers.
          </p>

          <div className="space-y-3.5">
            {[
              'AI-powered team matching',
              'Skill-based recommendations',
              'RAG-powered intelligent retrieval'
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isLight
                    ? 'bg-blue-50 border border-blue-200 text-blue-600'
                    : 'bg-white/10 border border-white/20 text-white'
                }`}>
                  <Check className="w-3 h-3" />
                </div>
                <span className={`text-sm font-medium ${isLight ? 'text-[#1E293B]' : 'text-zinc-200'}`}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`relative z-10 text-xs font-mono tracking-wider uppercase ${
          isLight ? 'text-[#64748B]' : 'text-zinc-600'
        }`}>
          Enterprise AI Platform &bull; v2.4
        </div>
      </div>

      {/* ================================================== */}
      {/* RIGHT SIDE — LOGIN PANEL (~50% width on Desktop)   */}
      {/* ================================================== */}
      <div className={`w-full lg:w-1/2 min-h-screen flex flex-col justify-between items-center p-6 sm:p-10 lg:p-14 relative transition-colors duration-200 ${
        isLight ? 'bg-white' : 'bg-[#050507]'
      }`}>
        
        {/* Mobile top bar */}
        <div className="w-full max-w-[520px] flex items-center justify-between mb-4 pt-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isLight ? 'bg-blue-600 text-white' : 'bg-white/10 border border-white/20 text-white'
            }`}>
              <Users2 className="w-4 h-4" />
            </div>
            <span className={`font-bold text-lg ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>TeamMatcher</span>
          </Link>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'border-[#222226] bg-[#0B0B0B] text-[#9CA3AF] hover:text-white'
            }`}
            title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            aria-label="Toggle theme"
          >
            {isLight ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        <div className="hidden lg:block h-2" />

        <div className="w-full max-w-[500px] my-auto">
          
          <div className="mb-7">
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-2 ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}>
              {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className={`text-sm font-normal ${
              isLight ? 'text-[#64748B]' : 'text-zinc-400'
            }`}>
              {mode === 'login' 
                ? 'Sign in to continue to TeamMatcher AI.' 
                : 'Join TeamMatcher AI to connect and build teams.'}
            </p>
          </div>

          <div className={`flex border-b mb-7 text-sm font-medium ${
            isLight ? 'border-[#E2E8F0]' : 'border-zinc-800'
          }`}>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStep(1);
              }}
              className={`flex-1 py-3 text-center relative transition-colors cursor-pointer ${
                mode === 'login'
                  ? isLight ? 'text-[#2563EB] font-semibold' : 'text-white font-semibold'
                  : isLight ? 'text-[#64748B] hover:text-[#0F172A]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign In
              {mode === 'login' && (
                <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full ${
                  isLight ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                }`} />
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setStep(1);
              }}
              className={`flex-1 py-3 text-center relative transition-colors cursor-pointer ${
                mode === 'register'
                  ? isLight ? 'text-[#2563EB] font-semibold' : 'text-white font-semibold'
                  : isLight ? 'text-[#64748B] hover:text-[#0F172A]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Create Account
              {mode === 'register' && (
                <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full ${
                  isLight ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                }`} />
              )}
            </button>
          </div>

          {/* 1. SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className={`absolute left-4 w-5 h-5 pointer-events-none ${isLight ? 'text-[#94A3B8]' : 'text-zinc-500'}`} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full h-[52px] rounded-xl pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-1 ${
                      isLight
                        ? 'bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-blue-600 focus:ring-blue-600 shadow-sm'
                        : 'bg-[#0E0E11] border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400 focus:ring-zinc-400'
                    }`}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-sm font-medium ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className={`text-xs transition-colors cursor-pointer ${
                      isLight ? 'text-blue-600 hover:text-blue-700' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className={`absolute left-4 w-5 h-5 pointer-events-none ${isLight ? 'text-[#94A3B8]' : 'text-zinc-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full h-[52px] rounded-xl pl-12 pr-12 text-sm transition-all focus:outline-none focus:ring-1 ${
                      isLight
                        ? 'bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-blue-600 focus:ring-blue-600 shadow-sm'
                        : 'bg-[#0E0E11] border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400 focus:ring-zinc-400'
                    }`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 transition-colors cursor-pointer ${
                      isLight ? 'text-[#94A3B8] hover:text-[#0F172A]' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Sign In Primary Button */}
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary-auth w-full h-[52px] font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 ${
                  isLight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-[0.99]'
                    : 'bg-white hover:bg-zinc-200 text-black shadow-lg'
                }`}
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <div className="space-y-4">
              
              {step === 1 && (
                <div className="space-y-2 mb-4">
                  <label className={`block text-xs font-semibold ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('WORKER');
                        setStep(1);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'WORKER'
                          ? isLight
                            ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-600'
                            : 'bg-[#18181C] border-zinc-400 ring-1 ring-zinc-400'
                          : isLight
                            ? 'bg-white border-[#E2E8F0] hover:border-slate-300'
                            : 'bg-[#0E0E11] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <Briefcase className={`w-4 h-4 mb-2 ${
                        selectedRole === 'WORKER'
                          ? isLight ? 'text-blue-600' : 'text-white'
                          : isLight ? 'text-slate-400' : 'text-zinc-500'
                      }`} />
                      <div className={`text-xs font-semibold ${
                        selectedRole === 'WORKER' && isLight ? 'text-blue-950' : isLight ? 'text-[#1E293B]' : 'text-white'
                      }`}>Technical Worker</div>
                      <div className={`text-[11px] mt-0.5 ${isLight ? 'text-[#64748B]' : 'text-zinc-400'}`}>Find projects & join teams</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('OWNER');
                        setStep(1);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'OWNER'
                          ? isLight
                            ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-600'
                            : 'bg-[#18181C] border-zinc-400 ring-1 ring-zinc-400'
                          : isLight
                            ? 'bg-white border-[#E2E8F0] hover:border-slate-300'
                            : 'bg-[#0E0E11] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <Building2 className={`w-4 h-4 mb-2 ${
                        selectedRole === 'OWNER'
                          ? isLight ? 'text-blue-600' : 'text-white'
                          : isLight ? 'text-slate-400' : 'text-zinc-500'
                      }`} />
                      <div className={`text-xs font-semibold ${
                        selectedRole === 'OWNER' && isLight ? 'text-blue-950' : isLight ? 'text-[#1E293B]' : 'text-white'
                      }`}>Project Owner</div>
                      <div className={`text-[11px] mt-0.5 ${isLight ? 'text-[#64748B]' : 'text-zinc-400'}`}>Post projects & form teams</div>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className={`flex items-center justify-between text-xs font-medium ${isLight ? 'text-[#64748B]' : 'text-zinc-400'}`}>
                  <span className="flex items-center gap-1.5">
                    <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-zinc-300'}`} />
                    Step {step} of {totalSteps}
                  </span>
                  <span className={`font-mono ${isLight ? 'text-[#64748B]' : 'text-zinc-500'}`}>{Math.round((step / totalSteps) * 100)}%</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden border ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0E0E11] border-zinc-800'
                }`}>
                  <div
                    className={`h-full transition-all duration-300 ${isLight ? 'bg-blue-600' : 'bg-white'}`}
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-3 pt-1">
                  {/* 1. Full Name */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>Full Name</label>
                    <div className="relative flex items-center">
                      <User className={`absolute left-3.5 w-4 h-4 ${isLight ? 'text-[#94A3B8]' : 'text-zinc-500'}`} />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full h-[46px] rounded-xl pl-10 pr-4 text-xs transition-all focus:outline-none focus:ring-1 ${
                          isLight
                            ? 'bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-blue-600 focus:ring-blue-600'
                            : 'bg-[#0E0E11] border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400'
                        }`}
                        placeholder={selectedRole === 'WORKER' ? 'Enter your full name' : 'e.g. Logesh Subramanian'}
                      />
                    </div>
                  </div>

                  {/* 2. Email Address */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className={`absolute left-3.5 w-4 h-4 ${isLight ? 'text-[#94A3B8]' : 'text-zinc-500'}`} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full h-[46px] rounded-xl pl-10 pr-4 text-xs transition-all focus:outline-none focus:ring-1 ${
                          isLight
                            ? 'bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-blue-600 focus:ring-blue-600'
                            : 'bg-[#0E0E11] border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400'
                        }`}
                        placeholder={selectedRole === 'WORKER' ? 'Enter your email address' : 'name@example.com'}
                      />
                    </div>
                  </div>

                  {/* 3. Conditional Fields */}
                  {selectedRole === 'WORKER' ? (
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>Professional Title</label>
                      <div className="relative flex items-center">
                        <Code className={`absolute left-3.5 w-4 h-4 ${isLight ? 'text-[#94A3B8]' : 'text-zinc-500'}`} />
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className={`w-full h-[46px] rounded-xl pl-10 pr-4 text-xs transition-all focus:outline-none focus:ring-1 ${
                            isLight
                              ? 'bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-blue-600 focus:ring-blue-600'
                              : 'bg-[#0E0E11] border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400'
                          }`}
                          placeholder="e.g. Full Stack Developer, ML Engineer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>Company Name</label>
                      <div className="relative flex items-center">
                        <Building2 className={`absolute left-3.5 w-4 h-4 ${isLight ? 'text-[#94A3B8]' : 'text-zinc-500'}`} />
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className={`w-full h-[46px] rounded-xl pl-10 pr-4 text-xs transition-all focus:outline-none focus:ring-1 ${
                            isLight
                              ? 'bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-blue-600 focus:ring-blue-600'
                              : 'bg-[#0E0E11] border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400'
                          }`}
                          placeholder="Acme Corp or Stealth Startup"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. Password */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>Password</label>
                    <div className="relative flex items-center">
                      <Lock className={`absolute left-3.5 w-4 h-4 ${isLight ? 'text-[#94A3B8]' : 'text-zinc-500'}`} />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full h-[46px] rounded-xl pl-10 pr-4 text-xs transition-all focus:outline-none focus:ring-1 ${
                          isLight
                            ? 'bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-blue-600 focus:ring-blue-600'
                            : 'bg-[#0E0E11] border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400'
                        }`}
                        placeholder={selectedRole === 'WORKER' ? 'Enter your password' : '••••••••••••'}
                      />
                    </div>
                  </div>

                  {/* 5. Confirm Password (Worker Only) */}
                  {selectedRole === 'WORKER' && (
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>Confirm Password</label>
                      <div className="relative flex items-center">
                        <Lock className={`absolute left-3.5 w-4 h-4 ${isLight ? 'text-[#94A3B8]' : 'text-zinc-500'}`} />
                        <input
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className={`w-full h-[46px] rounded-xl pl-10 pr-4 text-xs transition-all focus:outline-none focus:ring-1 ${
                            isLight
                              ? 'bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-blue-600 focus:ring-blue-600'
                              : 'bg-[#0E0E11] border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400'
                          }`}
                          placeholder="Confirm your password"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {selectedRole === 'OWNER' ? (
                    <button
                      type="button"
                      onClick={handleStep1Next}
                      className={`btn-primary-auth w-full h-[48px] mt-3 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                        isLight
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                          : 'bg-white hover:bg-zinc-200 text-black shadow-lg'
                      }`}
                    >
                      <span>Next: Company Scope</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegisterFinish}
                      disabled={loading}
                      className={`btn-primary-auth w-full h-[48px] mt-3 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 ${
                        isLight
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                          : 'bg-white hover:bg-zinc-200 text-black shadow-lg'
                      }`}
                    >
                      <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {selectedRole === 'OWNER' && step === 2 && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>Company / Project Bio</label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className={`w-full rounded-xl p-3 text-xs transition-all resize-none focus:outline-none focus:ring-1 ${
                        isLight
                          ? 'bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-blue-600 focus:ring-blue-600'
                          : 'bg-[#0E0E11] border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400'
                      }`}
                      placeholder="Describe your project goals..."
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-[#334155]' : 'text-zinc-300'}`}>Website or LinkedIn</label>
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className={`w-full h-[46px] rounded-xl px-3 text-xs transition-all focus:outline-none focus:ring-1 ${
                        isLight
                          ? 'bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-blue-600 focus:ring-blue-600'
                          : 'bg-[#0E0E11] border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400'
                      }`}
                      placeholder="https://yourcompany.com"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className={`flex-1 h-[46px] border font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 border-[#CBD5E1] text-slate-700'
                          : 'bg-[#0E0E11] hover:bg-[#18181C] border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleRegisterFinish}
                      disabled={loading}
                      className={`btn-primary-auth flex-1 h-[46px] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                        isLight
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                          : 'bg-white hover:bg-zinc-200 text-black shadow-lg'
                      }`}
                    >
                      <span>{loading ? 'Creating...' : 'Complete Registration'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          <div className="relative flex py-6 items-center">
            <div className={`flex-grow border-t ${isLight ? 'border-[#E2E8F0]' : 'border-zinc-800'}`}></div>
            <span className={`flex-shrink mx-4 text-xs font-medium tracking-widest uppercase ${
              isLight ? 'text-[#94A3B8]' : 'text-zinc-500'
            }`}>
              OR
            </span>
            <div className={`flex-grow border-t ${isLight ? 'border-[#E2E8F0]' : 'border-zinc-800'}`}></div>
          </div>

          <div>
            <div className="text-center mb-3">
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-[#475569]' : 'text-zinc-400'
              }`}>
                Quick Demo Access
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleQuickDemoLoginWorker}
                disabled={loading}
                className={`btn-demo-auth h-[50px] flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border border-[#CBD5E1] hover:border-blue-300 text-[#1E293B] hover:text-blue-600 shadow-sm'
                    : 'bg-[#0E0E11] hover:bg-[#18181C] border border-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white'
                }`}
              >
                <User className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-zinc-400'}`} />
                <span>Demo Worker</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoLoginOwner}
                disabled={loading}
                className={`btn-demo-auth h-[50px] flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border border-[#CBD5E1] hover:border-blue-300 text-[#1E293B] hover:text-blue-600 shadow-sm'
                    : 'bg-[#0E0E11] hover:bg-[#18181C] border border-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white'
                }`}
              >
                <Briefcase className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-zinc-400'}`} />
                <span>Demo Owner</span>
              </button>
            </div>
          </div>

          <div className={`flex items-center justify-center gap-2 mt-8 text-xs font-normal ${
            isLight ? 'text-[#64748B]' : 'text-zinc-500'
          }`}>
            <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-zinc-500'}`} />
            <span>Secure access &bull; TeamMatcher AI</span>
          </div>

        </div>

        <div className="hidden lg:block h-2" />

      </div>
    </div>
  );
}
