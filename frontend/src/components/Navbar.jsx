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
  Sparkles,
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
    <header className="sticky top-0 z-50 bg-[#070712]/90 backdrop-blur-xl border-b border-[#1E213A] transition-all text-[#F1F5F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Future Branding */}
          <div 
            onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold transition-all group-hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-display">
                  ORBIT AI
                </span>
                <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.2 rounded bg-gradient-to-r from-blue-900/50 to-violet-900/50 border border-violet-500/40 text-violet-300 font-bold">
                  FUTURE OS
                </span>
              </div>
              <span className="block text-[10px] text-[#818CF8] font-mono tracking-wider">
                CAREER INTELLIGENCE
              </span>
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-[0_0_15px_rgba(139,92,246,0.35)]' 
                        : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-6 text-xs text-[#94A3B8] font-medium">
              <button 
                onClick={() => scrollToSection('hero')}
                className="hover:text-white transition-colors"
              >
                Intelligence Engine
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-white transition-colors"
              >
                Workflow
              </button>
              <button 
                onClick={() => scrollToSection('college-mapping')}
                className="hover:text-white transition-colors"
              >
                Curriculum Bridge
              </button>
              <button 
                onClick={() => scrollToSection('ai-agents')}
                className="hover:text-white transition-colors"
              >
                6 AI Agents
              </button>
              <button 
                onClick={() => scrollToSection('ai-mentor')}
                className="hover:text-white transition-colors"
              >
                AI Mentor
              </button>
            </div>
          )}

          {/* User Account / Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                {/* Account Info Pill with Actual Registered Email */}
                <div 
                  onClick={() => handleNavClick('profile')}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none group ${
                    activePage === 'profile'
                      ? 'border-violet-500/80 bg-gradient-to-r from-blue-950/40 to-violet-950/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                      : 'border-[#222544] bg-[#0E1022] text-[#E2E8F0] hover:border-violet-500/50 hover:bg-[#141732]'
                  }`}
                  title={`Account: ${user.email} (Click to manage profile)`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate max-w-[120px]">
                        {user.full_name || 'My Account'}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-violet-950/60 border border-violet-800/50 text-violet-300 font-semibold">
                        {user.role || 'Student'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#94A3B8] truncate max-w-[180px]" title={user.email}>
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Clear Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#222544] bg-[#0E1022] hover:bg-red-950/30 hover:border-red-500/60 text-[#94A3B8] hover:text-red-300 text-xs font-semibold transition-all group"
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
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => scrollToSection('onboard-form-section')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                >
                  Initialize Path
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[#222544] bg-[#0E1022] text-xs font-mono text-[#CBD5E1]"
                title={user.email}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-500 to-violet-500 text-white flex items-center justify-center text-[11px] font-bold">
                  {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[100px] truncate text-[11px] font-medium">{user.email}</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[#222544] bg-[#0E1022] text-white hover:bg-[#151833]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1E213A] bg-[#0A0B18] px-4 pt-3 pb-5 space-y-3 shadow-2xl">
          {user ? (
            <>
              {/* Mobile Profile & Email Box with Sign Out */}
              <div className="p-3.5 rounded-2xl bg-[#0F1126] border border-[#222544] flex items-center justify-between gap-2">
                <div 
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-500 text-white flex items-center justify-center text-sm font-extrabold shrink-0">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate max-w-[140px]">{user.full_name}</span>
                      <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-violet-950/60 border border-violet-800/40 text-violet-300">{user.role || 'Student'}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#94A3B8] truncate max-w-[170px]" title={user.email}>{user.email}</span>
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-900/50 bg-red-950/30 text-xs font-semibold text-red-300 hover:bg-red-950/50 hover:border-red-600 transition-colors shrink-0"
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
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold' 
                          : 'text-[#94A3B8] hover:bg-white/[0.04]'
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
                className="w-full py-2.5 text-center text-xs font-medium border border-[#222544] rounded-xl hover:bg-[#151833] text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleNavClick('landing'); }}
                className="w-full py-2.5 text-center text-xs font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl shadow-lg"
              >
                Initialize Your Profile
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
