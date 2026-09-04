import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, Users2 } from 'lucide-react';
import Button from '../ui/Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthOrApp = location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/login') || 
                      location.pathname.startsWith('/register');

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-xl border-b border-[#1C1C1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Wordmark & Icon */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#27272A] flex items-center justify-center text-white group-hover:border-[#3F3F46] transition-colors">
            <Users2 className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-semibold text-base tracking-tight text-white">
            TeamMatcher
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9CA3AF]">
          <a href="#product" className="hover:text-white transition-colors">Product</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#teams" className="hover:text-white transition-colors">Teams</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!isAuthOrApp ? (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors"
              >
                Login
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Dashboard
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#111111] border border-transparent hover:border-[#27272A] transition-all"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0B0B] border-b border-[#1C1C1F] px-4 py-5 space-y-3">
          <a
            href="#product"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#D4D4D8] hover:text-white py-1.5"
          >
            Product
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#D4D4D8] hover:text-white py-1.5"
          >
            How It Works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#D4D4D8] hover:text-white py-1.5"
          >
            Features
          </a>
          <a
            href="#teams"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#D4D4D8] hover:text-white py-1.5"
          >
            Teams
          </a>
          <div className="pt-3 border-t border-[#1C1C1F] flex flex-col gap-2.5">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-sm font-medium text-[#D4D4D8] py-2 border border-[#27272A] rounded-lg hover:bg-[#141414] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-sm font-semibold bg-white text-black py-2 rounded-lg hover:bg-[#E4E4E7] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

