import React, { useState, useEffect } from 'react';
import { api } from '../api';
import OrbitalSkillUniverse from '../components/OrbitalSkillUniverse';
import { 
  Compass, 
  Award, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Activity, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  ChevronRight,
  TrendingUp,
  Layers,
  CheckSquare,
  Square,
  Bot
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function DashboardPage({ setActivePage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getSummary();
      setData(res);
      setError(null);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      setActionLoading(true);
      await api.roadmap.toggleTask(taskId, !currentStatus);
      await fetchDashboardData();
    } catch (err) {
      alert("Error toggling task: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunPipeline = async () => {
    try {
      setActionLoading(true);
      await api.agents.runPipeline(data?.selected_career_goal, true);
      await fetchDashboardData();
    } catch (err) {
      alert("Pipeline rerun error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
          Synchronizing Multi-Agent State...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 rounded-2xl border border-red-900 bg-red-950/40 text-red-200 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-red-400">
          <AlertCircle className="w-5 h-5" /> Failed to load Dashboard
        </div>
        <p className="text-xs">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-white text-black rounded-lg text-xs font-semibold hover:bg-[#E0E0E0]"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    user,
    selected_career_goal,
    current_skill_level,
    skill_gap_percentage,
    career_readiness_percentage,
    learning_progress,
    skills_overview,
    missing_skills,
    pending_tasks,
    recommended_next_step,
    recent_assessments,
    recent_activities
  } = data;

  // Prepare chart data for skills
  const chartData = (skills_overview || []).slice(0, 6).map(s => ({
    name: s.skill_name,
    score: s.score || 50,
    verified: s.verified
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* 1. Header & Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Learner'}
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="System Online" />
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 font-sans">
            Target Career Track: <strong className="text-white font-semibold">{selected_career_goal}</strong> ({current_skill_level} Track)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunPipeline}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl border border-[#292929] hover:border-white text-xs font-semibold text-white bg-[#101010] hover:bg-[#181818] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
            <span>Recalibrate Agents</span>
          </button>
          <button
            onClick={() => setActivePage('assessments')}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Take Assessment</span>
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Career Readiness */}
        <div className="p-5 rounded-2xl border border-[#262626] bg-[#101010] shadow-premium space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">Career Readiness</span>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{career_readiness_percentage}%</span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">Calibrated</span>
          </div>
          <div className="w-full bg-[#202020] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-700 shadow-glow"
              style={{ width: `${career_readiness_percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-[#71717A]">Benchmarked against real {selected_career_goal} requirements</p>
        </div>

        {/* Skill Gap */}
        <div className="p-5 rounded-2xl border border-[#262626] bg-[#101010] shadow-premium space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">Skill Gap Index</span>
            <Layers className="w-4 h-4 text-[#A1A1AA]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{skill_gap_percentage}%</span>
            <span className="text-[10px] text-[#A1A1AA] font-mono">To Bridge</span>
          </div>
          <div className="w-full bg-[#202020] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#666666] h-full rounded-full transition-all duration-700"
              style={{ width: `${skill_gap_percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-[#71717A]">
            {missing_skills?.length || 0} critical skills identified for mastery
          </p>
        </div>

        {/* Roadmap Progress */}
        <div className="p-5 rounded-2xl border border-[#262626] bg-[#101010] shadow-premium space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">Curriculum Velocity</span>
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{learning_progress?.completion_percentage || 0}%</span>
            <span className="text-[10px] text-[#A1A1AA] font-mono">
              {learning_progress?.completed_tasks || 0}/{learning_progress?.total_tasks || 0} Tasks
            </span>
          </div>
          <div className="w-full bg-[#202020] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-700"
              style={{ width: `${learning_progress?.completion_percentage || 0}%` }}
            />
          </div>
          <p className="text-[10px] text-[#71717A]">
            Active Track: {learning_progress?.active_roadmap_title || "Custom Track"}
          </p>
        </div>

        {/* Assessment Mastery */}
        <div className="p-5 rounded-2xl border border-[#262626] bg-[#101010] shadow-premium space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">Verified Badges</span>
            <Award className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {skills_overview?.filter(s => s.verified)?.length || 0}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">Validated</span>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {skills_overview?.filter(s => s.verified).slice(0, 3).map((s, idx) => (
              <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C1C1C] text-white border border-[#303030] font-semibold">
                ✓ {s.skill_name}
              </span>
            ))}
            {(!skills_overview || skills_overview.filter(s => s.verified).length === 0) && (
              <span className="text-[10px] text-[#71717A]">Take quizzes to earn badges</span>
            )}
          </div>
          <p className="text-[10px] text-[#71717A]">Evaluated via diagnostic tests</p>
        </div>

      </div>

      {/* 3. Signature Feature: Interactive Orbital Skill Universe */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-black font-bold">
              Signature Visualizer
            </span>
            <h2 className="text-base font-bold text-white font-display">
              Interactive Orbital Skill Universe
            </h2>
          </div>
          <button
            onClick={() => setActivePage('skill-universe')}
            className="text-xs font-mono text-[#D4D4D8] hover:text-white hover:underline flex items-center gap-1"
          >
            <span>Full Universe Screen</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <OrbitalSkillUniverse
          userProfile={{
            full_name: user?.full_name,
            targetCareer: selected_career_goal,
            department: user?.department,
            college: user?.college,
            readinessScore: career_readiness_percentage
          }}
          targetCareer={selected_career_goal}
          skills={skills_overview || []}
          missingSkills={missing_skills || []}
          onSelectAction={(actionPage) => setActivePage(actionPage)}
        />
      </div>

      {/* 4. Recommended Next Step Banner */}
      {recommended_next_step && (
        <div className="p-6 rounded-2xl border border-white bg-[#101010] shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-mono uppercase font-bold">
                🎯 Priority Milestone
              </span>
              <span className="text-xs font-mono text-[#A1A1AA]">
                {recommended_next_step.stage_title}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white font-display">
              {recommended_next_step.task_title}
            </h2>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              {recommended_next_step.description}
            </p>
            {recommended_next_step.learning_objectives?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {recommended_next_step.learning_objectives.slice(0, 2).map((obj, i) => (
                  <span key={i} className="text-[10px] text-[#D4D4D8] bg-[#181818] px-2 py-0.5 rounded border border-[#292929]">
                    • {obj}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => handleToggleTask(recommended_next_step.id, recommended_next_step.is_completed)}
              disabled={actionLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#333333] hover:border-white text-xs font-semibold text-white bg-[#181818] hover:bg-[#222222] transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mark Completed</span>
            </button>
            <button
              onClick={() => setActivePage('roadmap')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Open Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Two-Column Layout: Skill Competency Chart vs Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Skill Competency Visualizer */}
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <div>
              <h3 className="font-bold text-sm text-white">Evaluated Skill Competency</h3>
              <span className="text-[11px] text-[#A1A1AA]">Proficiency scores calibrated by Skill Analysis Agent</span>
            </div>
            <button 
              onClick={() => setActivePage('profile')}
              className="text-xs text-[#A1A1AA] hover:text-white font-medium underline"
            >
              Manage Skills
            </button>
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#A1A1AA', fontSize: 11 }} 
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: '#71717A', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 75 ? '#FFFFFF' : '#666666'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#71717A]">
              No skills reported yet. Add skills in your profile to view visual analytics.
            </div>
          )}

          {/* User-Specific Skill Progress Bars */}
          {(skills_overview || []).length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-[#222222]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                <span>Saved Competencies ({skills_overview.length})</span>
                <span>User Input / Assessment</span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {skills_overview.map((s) => {
                  const pct = s.proficiency_percentage ?? s.score ?? 50;
                  return (
                    <div key={s.id || s.skill_name} className="p-2.5 rounded-xl bg-[#141416] border border-[#242428] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{s.skill_name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#101010] text-[#A1A1AA] border border-[#2B2B2B]">
                            {s.category || 'Technical'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white text-xs">{pct}%</span>
                      </div>
                      <div className="w-full bg-[#202024] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 80 ? 'bg-white' : pct >= 50 ? 'bg-[#CCCCCC]' : 'bg-[#777777]'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Missing Skills Warning */}
          {missing_skills?.length > 0 && (
            <div className="p-3 rounded-xl bg-[#151515] border border-[#262626]">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA] font-bold block mb-1.5">
                Priority Missing Competencies for {selected_career_goal}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {missing_skills.slice(0, 5).map((sk, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A0A0A] text-white border border-[#333333]">
                    + {sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Pending Learning Tasks & Checklist */}
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <div>
              <h3 className="font-bold text-sm text-white">Upcoming Roadmap Tasks</h3>
              <span className="text-[11px] text-[#A1A1AA]">Directly integrated with Progress Tracking Agent</span>
            </div>
            <button 
              onClick={() => setActivePage('roadmap')}
              className="text-xs text-[#A1A1AA] hover:text-white font-medium underline"
            >
              View Full Track
            </button>
          </div>

          <div className="space-y-3">
            {pending_tasks?.length > 0 ? (
              pending_tasks.map((task) => (
                <div 
                  key={task.id}
                  className="p-3.5 rounded-xl border border-[#262626] hover:border-white transition-all bg-[#151515] flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#71717A] block uppercase font-semibold">
                      {task.stage_title}
                    </span>
                    <h4 className="text-xs font-semibold text-white">
                      {task.task_title}
                    </h4>
                    <p className="text-[11px] text-[#A1A1AA] line-clamp-1">
                      {task.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleTask(task.id, task.is_completed)}
                    disabled={actionLoading}
                    className="p-1 rounded text-[#71717A] hover:text-white transition-colors"
                    title="Mark task done"
                  >
                    {task.is_completed ? (
                      <CheckSquare className="w-5 h-5 text-white" />
                    ) : (
                      <Square className="w-5 h-5 text-[#555555]" />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[#71717A]">
                All active roadmap tasks completed! Run agent recalibration to unlock next stage.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 6. Live Multi-Agent Collaboration Trace */}
      <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-white" />
            <h3 className="font-bold text-sm text-white">Recent Autonomous Agent Collaborations</h3>
          </div>
          <button 
            onClick={() => setActivePage('agents')}
            className="text-xs text-[#A1A1AA] hover:text-white font-medium underline flex items-center gap-1"
          >
            <span>Inspect Agent Architecture</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(recent_activities || []).slice(0, 3).map((act) => (
            <div key={act.id} className="p-3.5 rounded-xl border border-[#262626] bg-[#151515] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-black">
                  {act.agent_name}
                </span>
                <span className="text-[9px] font-mono text-[#71717A]">{act.latency_ms}ms</span>
              </div>
              <h5 className="text-xs font-semibold text-white">{act.task_name}</h5>
              <p className="text-[11px] text-[#A1A1AA] line-clamp-2">{act.output_summary}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
