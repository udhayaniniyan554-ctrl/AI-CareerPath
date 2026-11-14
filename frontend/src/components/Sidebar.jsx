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
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, careerGoal = 'Full Stack Developer', readinessScore = 75 }) {
  const { user, logout, isAdmin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: Layers, badge: null },
    { id: 'profile', label: 'My Profile', icon: User, badge: null },
    { id: 'skill-universe', label: 'Skill Universe', icon: Sparkles, badge: 'Orbit' },
    { id: 'college-mapping', label: 'College Mapping', icon: GraduationCap, badge: 'Core' },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Compass, badge: 'Live' },
    { id: 'resources', label: 'Courses & Library', icon: BookOpen, badge: null },
    { id: 'mentor', label: 'AI Mentor', icon: Bot, badge: 'AI' },
    { id: 'assessments', label: 'Assessments', icon: Award, badge: null },
    { id: 'agents', label: 'Agent Center', icon: Activity, badge: '6 Active' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Command', icon: ShieldCheck, badge: 'Secured' }] : []),
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-[#050505] text-[#F5F5F5] border-r border-[#292929] min-h-screen sticky top-0 z-40 select-none">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-[#222222]">
        <div 
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black transition-transform group-hover:scale-105 shadow-glow">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white font-display">ORBIT AI</span>
              <span className="text-[9px] font-mono tracking-wider px-1 py-0.2 rounded bg-[#181818] border border-[#333333] text-white font-semibold">3.0</span>
            </div>
            <span className="text-[10px] text-[#A1A1AA] font-mono tracking-wider block">CAREER UNIVERSE OS</span>
          </div>
        </div>

        {/* Current Active Goal Banner */}
        <div className="mt-4 p-2.5 rounded-xl bg-[#101010] border border-[#262626] flex items-center justify-between">
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono uppercase text-[#71717A] block font-semibold">Target Career</span>
            <span className="text-xs font-semibold text-white truncate block">{careerGoal}</span>
          </div>
          <button 
            onClick={() => setActivePage('profile')}
            className="text-[10px] text-[#A1A1AA] hover:text-white underline font-mono"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-semibold">
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
                  ? 'bg-white text-black font-semibold shadow-md' 
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#121212]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#888888]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                  isActive ? 'bg-black text-white' : 'bg-[#1C1C1C] text-[#D4D4D8]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Readiness KPI Box */}
      <div className="px-4 py-3 mx-3 mb-4 rounded-xl bg-[#101010] border border-[#222222]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#A1A1AA] font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-white" /> Career Readiness
          </span>
          <span className="text-xs font-mono font-bold text-white">{readinessScore}%</span>
        </div>
        <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-white h-full transition-all duration-700 ease-out rounded-full"
            style={{ width: `${Math.min(100, Math.max(5, readinessScore))}%` }}
          />
        </div>
        <span className="text-[10px] text-[#71717A] mt-2 block font-mono">
          Calibrated across 6 AI Agents
        </span>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#222222] flex items-center justify-between">
        <div 
          onClick={() => setActivePage('profile')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
          title={`Signed in as: ${user?.email}`}
        >
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden text-left">
            <div className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.full_name}</div>
            <div className="text-[10px] text-[#A1A1AA] font-mono truncate max-w-[120px]" title={user?.email}>{user?.email}</div>
          </div>
        </div>

        <button 
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-[#71717A] hover:text-red-300 hover:bg-red-950/20 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </aside>
  );
}
