import React from 'react';
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
  User, 
  ChevronRight, 
  Sparkles, 
  Zap, 
  GraduationCap,
  Target
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, careerGoal = 'Full Stack Developer', readinessScore = 75 }) {
  const { user, logout, isAdmin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: Layers, badge: null },
    { id: 'profile', label: 'My Skills & Profile', icon: User, badge: 'Core' },
    { id: 'skill-universe', label: 'Skill Universe', icon: Target, badge: 'Orbit' },
    { id: 'college-mapping', label: 'Curriculum Bridge', icon: GraduationCap, badge: 'Matrix' },
    { id: 'roadmap', label: 'Adaptive Roadmap', icon: Compass, badge: 'AI Live' },
    { id: 'resources', label: 'Knowledge Base', icon: BookOpen, badge: null },
    { id: 'mentor', label: 'AI Mentor Studio', icon: Bot, badge: 'Neural' },
    { id: 'assessments', label: 'Assessment Center', icon: Award, badge: null },
    { id: 'agents', label: 'Agent Center', icon: Activity, badge: '6 Active' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Command', icon: ShieldCheck, badge: 'Secured' }] : []),
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-[#080916] text-[#F1F5F9] border-r border-[#1B1E36] min-h-screen sticky top-0 z-40 select-none">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-[#181B30]">
        <div 
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center font-black transition-transform group-hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.35)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white font-display">ORBIT AI</span>
              <span className="text-[9px] font-mono tracking-wider px-1 py-0.2 rounded bg-gradient-to-r from-blue-900/50 to-violet-900/50 border border-violet-500/30 text-violet-300 font-bold">3.0</span>
            </div>
            <span className="text-[10px] text-[#818CF8] font-mono tracking-wider block">FUTURE INTELLIGENCE</span>
          </div>
        </div>

        {/* Current Active Goal Banner */}
        <div className="mt-4 p-2.5 rounded-xl bg-[#0D0F22] border border-[#1E2240] flex items-center justify-between shadow-inner">
          <div className="overflow-hidden">
            <span className="text-[9px] font-mono uppercase text-[#818CF8] block font-semibold">Target Track</span>
            <span className="text-xs font-semibold text-white truncate block">{careerGoal}</span>
          </div>
          <button 
            onClick={() => setActivePage('profile')}
            className="text-[10px] text-[#A5B4FC] hover:text-white underline font-mono"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">
          Platform Systems
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#151833] text-[#A5B4FC] border border-[#232852]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Readiness KPI Box with Glowing Bar */}
      <div className="px-4 py-3 mx-3 mb-4 rounded-xl bg-[#0D0F22] border border-[#1E2240] shadow-inner">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#94A3B8] font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Career Readiness
          </span>
          <span className="text-xs font-mono font-bold text-white">{readinessScore}%</span>
        </div>
        <div className="w-full bg-[#181B34] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 h-full transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            style={{ width: `${Math.min(100, Math.max(5, readinessScore))}%` }}
          />
        </div>
        <span className="text-[9px] text-[#818CF8] mt-2 block font-mono">
          Calibrated across 6 AI Agents
        </span>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#181B30] flex items-center justify-between bg-[#070814]">
        <div 
          onClick={() => setActivePage('profile')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity overflow-hidden"
          title={`Signed in as: ${user?.email}`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(139,92,246,0.3)] shrink-0">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden text-left">
            <div className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.full_name || 'My Account'}</div>
            <div className="text-[10px] text-[#94A3B8] font-mono truncate max-w-[120px]" title={user?.email}>{user?.email}</div>
          </div>
        </div>

        <button 
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-[#94A3B8] hover:text-red-300 hover:bg-red-950/20 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </aside>
  );
}
