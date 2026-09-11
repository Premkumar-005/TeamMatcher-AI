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
  Check
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
  const { loginUser, registerUser, addToast } = useApp();

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
    <div className="min-h-screen w-full bg-[#050507] text-[#F5F5F5] flex flex-col lg:flex-row overflow-x-hidden font-sans selection:bg-zinc-700 selection:text-white">
      
      {/* ================================================== */}
      {/* LEFT SIDE — BRANDING PANEL (~50% width on Desktop) */}
      {/* ================================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#030304] border-r border-zinc-800/60 flex-col justify-between p-10 xl:p-14 overflow-hidden select-none">
        
        {/* Grayscale Atmospheric Background Graphics */}
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

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-105">
              <Users2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              TeamMatcher
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mb-6">
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-4">
            Build Better<br />Teams With AI.
          </h1>
          
          <p className="text-zinc-400 text-base leading-relaxed mb-8 font-normal">
            AI-powered team matching that connects project owners with the right skilled workers.
          </p>

          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-200">
                AI-powered team matching
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-200">
                Skill-based recommendations
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-200">
                RAG-powered intelligent retrieval
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-600 font-mono tracking-wider uppercase">
          Enterprise AI Platform &bull; v2.4
        </div>
      </div>

      {/* ================================================== */}
      {/* RIGHT SIDE — LOGIN PANEL (~50% width on Desktop)   */}
      {/* ================================================== */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between items-center p-6 sm:p-10 lg:p-14 relative bg-[#050507]">
        
        <div className="lg:hidden w-full max-w-[520px] flex items-center justify-between mb-6 pt-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <Users2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">TeamMatcher</span>
          </Link>
        </div>

        <div className="hidden lg:block h-2" />

        <div className="w-full max-w-[500px] my-auto">
          
          <div className="mb-7">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
              {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-sm text-zinc-400 font-normal">
              {mode === 'login' 
                ? 'Sign in to continue to TeamMatcher AI.' 
                : 'Join TeamMatcher AI to connect and build teams.'}
            </p>
          </div>

          <div className="flex border-b border-zinc-800 mb-7 text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStep(1);
              }}
              className={`flex-1 py-3 text-center relative transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'text-white font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign In
              {mode === 'login' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
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
                  ? 'text-white font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Create Account
              {mode === 'register' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          </div>

          {/* 1. SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-[52px] bg-[#0E0E11] border border-zinc-800 rounded-xl pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-[52px] bg-[#0E0E11] border border-zinc-800 rounded-xl pl-12 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-zinc-500 hover:text-zinc-200 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] mt-2 bg-white hover:bg-zinc-200 text-black font-semibold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <span>{loading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <div className="space-y-4">
              
              {step === 1 && (
                <div className="space-y-2 mb-4">
                  <label className="block text-xs font-semibold text-zinc-300">Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('WORKER');
                        setStep(1);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'WORKER'
                          ? 'bg-[#18181C] border-zinc-400 ring-1 ring-zinc-400'
                          : 'bg-[#0E0E11] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <Briefcase className={`w-4 h-4 mb-2 ${selectedRole === 'WORKER' ? 'text-white' : 'text-zinc-500'}`} />
                      <div className="text-xs font-semibold text-white">Technical Worker</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Find projects & join teams</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('OWNER');
                        setStep(1);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'OWNER'
                          ? 'bg-[#18181C] border-zinc-400 ring-1 ring-zinc-400'
                          : 'bg-[#0E0E11] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <Building2 className={`w-4 h-4 mb-2 ${selectedRole === 'OWNER' ? 'text-white' : 'text-zinc-500'}`} />
                      <div className="text-xs font-semibold text-white">Project Owner</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Post projects & form teams</div>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                    Step {step} of {totalSteps}
                  </span>
                  <span className="text-zinc-500 font-mono">{Math.round((step / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-[#0E0E11] h-1.5 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="bg-white h-full transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-3 pt-1">
                  {/* 1. Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-[46px] bg-[#0E0E11] border border-zinc-800 rounded-xl pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-all"
                        placeholder={selectedRole === 'WORKER' ? 'Enter your full name' : 'e.g. Logesh Subramanian'}
                      />
                    </div>
                  </div>

                  {/* 2. Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-[46px] bg-[#0E0E11] border border-zinc-800 rounded-xl pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-all"
                        placeholder={selectedRole === 'WORKER' ? 'Enter your email address' : 'name@example.com'}
                      />
                    </div>
                  </div>

                  {/* 3. Professional Title / Company */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      {selectedRole === 'OWNER' ? 'Company / Organization' : 'Professional Title'}
                    </label>
                    {selectedRole === 'WORKER' ? (
                      <div>
                        <div className="relative flex items-center">
                          <Briefcase className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full h-[46px] bg-[#0E0E11] border border-zinc-800 rounded-xl pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-all"
                            placeholder="Enter your professional title"
                          />
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1">Example: Full Stack Developer</p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full h-[46px] bg-[#0E0E11] border border-zinc-800 rounded-xl px-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-all"
                        placeholder="e.g. CloudScale AI Labs"
                      />
                    )}
                  </div>

                  {/* 4. Password */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full h-[46px] bg-[#0E0E11] border border-zinc-800 rounded-xl pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-all"
                        placeholder={selectedRole === 'WORKER' ? 'Enter your password' : '••••••••'}
                      />
                    </div>
                  </div>

                  {/* 5. Confirm Password (Worker Only) */}
                  {selectedRole === 'WORKER' && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirm Password</label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                        <input
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full h-[46px] bg-[#0E0E11] border border-zinc-800 rounded-xl pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-all"
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
                      className="w-full h-[48px] mt-3 bg-white hover:bg-zinc-200 text-black font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <span>Next: Company Scope</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegisterFinish}
                      disabled={loading}
                      className="w-full h-[48px] mt-3 bg-white hover:bg-zinc-200 text-black font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
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
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Company / Project Bio</label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-[#0E0E11] border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-all resize-none"
                      placeholder="Describe your project goals..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Website or LinkedIn</label>
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full h-[46px] bg-[#0E0E11] border border-zinc-800 rounded-xl px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-all"
                      placeholder="https://yourcompany.com"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 h-[46px] bg-[#0E0E11] hover:bg-[#18181C] border border-zinc-800 text-zinc-300 font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleRegisterFinish}
                      disabled={loading}
                      className="flex-1 h-[46px] bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-xs text-zinc-500 font-medium tracking-widest uppercase">
              OR
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <div>
            <div className="text-center mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Quick Demo Access
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleQuickDemoLoginWorker}
                disabled={loading}
                className="h-[50px] flex items-center justify-center gap-2 bg-[#0E0E11] hover:bg-[#18181C] border border-zinc-800 hover:border-zinc-600 rounded-xl text-sm font-medium text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <User className="w-4 h-4 text-zinc-400" />
                <span>Demo Worker</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoLoginOwner}
                disabled={loading}
                className="h-[50px] flex items-center justify-center gap-2 bg-[#0E0E11] hover:bg-[#18181C] border border-zinc-800 hover:border-zinc-600 rounded-xl text-sm font-medium text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <Briefcase className="w-4 h-4 text-zinc-400" />
                <span>Demo Owner</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-zinc-500 font-normal">
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <span>Secure access &bull; TeamMatcher AI</span>
          </div>

        </div>

        <div className="hidden lg:block h-2" />

      </div>
    </div>
  );
}
