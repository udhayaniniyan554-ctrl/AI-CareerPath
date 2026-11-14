import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Layers, 
  Award, 
  Bot, 
  BookOpen, 
  Activity, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  User,
  Zap,
  GraduationCap,
  Target
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenAuth }) {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers, authRequired: true },
    { id: 'skill-universe', label: 'Skill Universe', icon: Target, authRequired: true },
    { id: 'roadmap', label: 'Roadmap', icon: Compass, authRequired: true },
    { id: 'college-mapping', label: 'College Mapping', icon: GraduationCap, authRequired: true },
    { id: 'assessments', label: 'Assessments', icon: Award, authRequired: true },
    { id: 'mentor', label: 'AI Mentor', icon: Bot, authRequired: true },
    { id: 'resources', label: 'Library', icon: BookOpen, authRequired: true },
    { id: 'agents', label: 'Agent Center', icon: Activity, authRequired: true },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck, authRequired: true }] : [])
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    logout();
    setActivePage('landing');
    setMobileMenuOpen(false);
    if (onOpenAuth) {
      onOpenAuth('login');
    }
  };

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (activePage !== 'landing') {
      setActivePage('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050505] border-b border-[#292929] transition-all text-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div 
            onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black font-extrabold transition-transform group-hover:scale-105 shadow-glow">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-display">ORBIT AI</span>
                <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.2 rounded bg-[#181818] border border-[#333333] text-white font-semibold">3.0</span>
              </div>
              <span className="block text-[10px] text-[#A1A1AA] font-mono tracking-wide">CAREER UNIVERSE OS</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activePage === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-white text-black font-semibold shadow-sm' 
                        : 'text-[#A1A1AA] hover:text-white hover:bg-[#151515]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-6 text-xs text-[#A1A1AA] font-medium">
              <button 
                onClick={() => scrollToSection('hero')}
                className="hover:text-white transition-colors"
              >
                Platform
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-white transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('college-mapping')}
                className="hover:text-white transition-colors"
              >
                College Bridge
              </button>
              <button 
                onClick={() => scrollToSection('ai-agents')}
                className="hover:text-white transition-colors"
              >
                AI Agents
              </button>
              <button 
                onClick={() => scrollToSection('ai-mentor')}
                className="hover:text-white transition-colors"
              >
                AI Mentor
              </button>
            </div>
          )}

          {/* User Profile / Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                {/* Account Info Pill with Actual Registered Email */}
                <div 
                  onClick={() => handleNavClick('profile')}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none group ${
                    activePage === 'profile'
                      ? 'border-white bg-[#151515] text-white shadow-sm'
                      : 'border-[#27272A] bg-[#101010] text-[#D4D4D8] hover:border-[#52525B] hover:bg-[#161616]'
                  }`}
                  title={`Account: ${user.email} (Click to manage profile)`}
                >
                  <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center text-xs font-bold shrink-0">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white group-hover:text-white transition-colors truncate max-w-[120px]">
                        {user.full_name || 'My Account'}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#202024] border border-[#2E2E33] text-[#A1A1AA] font-semibold">
                        {user.role || 'Student'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#A1A1AA] truncate max-w-[190px]" title={user.email}>
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Clear Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#27272A] bg-[#101010] hover:bg-red-950/30 hover:border-red-600/60 text-[#A1A1AA] hover:text-red-300 text-xs font-semibold transition-all group"
                  title="Sign Out of Session"
                >
                  <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white hover:bg-[#151515] transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => scrollToSection('onboard-form-section')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-[#E0E0E0] transition-all shadow-sm"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[#27272A] bg-[#101010] text-xs font-mono text-[#D4D4D8]"
                title={user.email}
              >
                <div className="w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center text-[11px] font-bold">
                  {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[100px] truncate text-[11px] font-medium">{user.email}</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[#292929] bg-[#101010] text-white hover:bg-[#151515]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#292929] bg-[#0A0A0A] px-4 pt-3 pb-5 space-y-3 shadow-2xl">
          {user ? (
            <>
              {/* Mobile Profile & Email Box with Sign Out */}
              <div className="p-3.5 rounded-2xl bg-[#121212] border border-[#262626] flex items-center justify-between gap-2">
                <div 
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center text-sm font-extrabold shrink-0">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate max-w-[140px]">{user.full_name}</span>
                      <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-[#1F1F23] border border-[#2E2E33] text-[#A1A1AA]">{user.role || 'Student'}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#A1A1AA] truncate max-w-[170px]" title={user.email}>{user.email}</span>
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-900/40 bg-red-950/20 text-xs font-semibold text-red-300 hover:bg-red-950/50 hover:border-red-600 transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
              <div className="space-y-1 pt-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activePage === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                        isActive ? 'bg-white text-black font-bold' : 'text-[#A1A1AA] hover:bg-[#151515]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                className="w-full py-2.5 text-center text-xs font-medium border border-[#292929] rounded-xl hover:bg-[#151515] text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleNavClick('landing'); }}
                className="w-full py-2.5 text-center text-xs font-bold bg-white text-black rounded-xl hover:bg-[#E0E0E0]"
              >
                Start Onboarding Form
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
