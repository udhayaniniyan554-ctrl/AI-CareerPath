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
  Bot,
  Zap,
  Target,
  Plus
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
        <div className="w-10 h-10 border-2 border-futureViolet border-t-transparent rounded-full animate-spin shadow-future-glow" />
        <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
          Synchronizing Multi-Agent Telemetry...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 rounded-2xl border border-red-500/40 bg-red-950/40 text-red-200 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-red-400">
          <AlertCircle className="w-5 h-5" /> Failed to load Dashboard
        </div>
        <p className="text-xs">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-gradient-to-r from-futureBlue to-futureViolet text-white rounded-lg text-xs font-semibold hover:shadow-future-glow"
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
  const chartData = (skills_overview || []).slice(0, 7).map(s => ({
    name: s.skill_name,
    score: s.proficiency_percentage ?? s.score ?? 50,
    verified: s.verified
  }));

  const hasSkills = (skills_overview || []).length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* 1. Header & Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-futureBlue to-futureViolet">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Learner'}</span>
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-future-glow animate-pulse" title="Telemetry Live" />
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 font-sans flex items-center gap-2 flex-wrap">
            <span>Target Career Track:</span>
            <strong className="text-white font-semibold px-2 py-0.5 rounded-md bg-[#141738] border border-futureViolet/30 text-xs">
              {selected_career_goal}
            </strong>
            <span className="text-gray-500">•</span>
            <span className="text-xs text-futureBlue font-mono">{current_skill_level} Track</span>
            {user?.email && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-400 font-mono">{user.email}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunPipeline}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl border border-futureViolet/40 hover:border-futureViolet text-xs font-semibold text-white bg-[#0D0F22]/80 hover:bg-[#151838] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 backdrop-blur-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-futureViolet ${actionLoading ? 'animate-spin' : ''}`} />
            <span>Recalibrate Agents</span>
          </button>
          <button
            onClick={() => setActivePage('assessments')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-bold hover:shadow-future-glow transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Take Assessment</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Future Intelligence KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Career Readiness */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0D0F22]/80 shadow-future-card space-y-3 backdrop-blur-xl hover:border-futureBlue/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-futureBlue font-semibold">Career Readiness</span>
            <Sparkles className="w-4 h-4 text-futureBlue" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{career_readiness_percentage}%</span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">Calibrated</span>
          </div>
          <div className="w-full bg-[#1A1D36] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-futureBlue to-futureViolet h-full rounded-full transition-all duration-700 shadow-future-glow"
              style={{ width: `${career_readiness_percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400">Benchmarked against real {selected_career_goal} requirements</p>
        </div>

        {/* Skill Gap */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0D0F22]/80 shadow-future-card space-y-3 backdrop-blur-xl hover:border-futureViolet/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-futureViolet font-semibold">Skill Gap Index</span>
            <Layers className="w-4 h-4 text-futureViolet" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{skill_gap_percentage}%</span>
            <span className="text-[10px] text-amber-400 font-mono">To Bridge</span>
          </div>
          <div className="w-full bg-[#1A1D36] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-pink-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${skill_gap_percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400">
            {missing_skills?.length || 0} critical skills prioritized for mastery
          </p>
        </div>

        {/* Roadmap Progress */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0D0F22]/80 shadow-future-card space-y-3 backdrop-blur-xl hover:border-pink-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-pink-400 font-semibold">Curriculum Velocity</span>
            <Compass className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{learning_progress?.completion_percentage || 0}%</span>
            <span className="text-[10px] text-gray-400 font-mono">
              {learning_progress?.completed_tasks || 0}/{learning_progress?.total_tasks || 0} Tasks
            </span>
          </div>
          <div className="w-full bg-[#1A1D36] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-futureViolet h-full rounded-full transition-all duration-700 shadow-future-glow"
              style={{ width: `${learning_progress?.completion_percentage || 0}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400">
            Active Track: {learning_progress?.active_roadmap_title || "Dynamic Track"}
          </p>
        </div>

        {/* Assessment Mastery */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0D0F22]/80 shadow-future-card space-y-3 backdrop-blur-xl hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">Verified Badges</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {skills_overview?.filter(s => s.verified)?.length || 0}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">Validated</span>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {skills_overview?.filter(s => s.verified).slice(0, 3).map((s, idx) => (
              <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#141738] text-emerald-300 border border-emerald-500/30 font-semibold">
                ✓ {s.skill_name}
              </span>
            ))}
            {(!skills_overview || skills_overview.filter(s => s.verified).length === 0) && (
              <span className="text-[10px] text-gray-500">Take quizzes to earn verified badges</span>
            )}
          </div>
          <p className="text-[10px] text-gray-400">Diagnostic quizzes & evaluations</p>
        </div>

      </div>

      {/* 3. Signature Feature: Interactive Orbital Skill Universe */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-futureViolet/20 text-futureViolet border border-futureViolet/40 font-bold">
              Signature Visualizer
            </span>
            <h2 className="text-base font-bold text-white font-display">
              Interactive Orbital Skill Universe
            </h2>
          </div>
          <button
            onClick={() => setActivePage('skill-universe')}
            className="text-xs font-mono text-futureBlue hover:text-white hover:underline flex items-center gap-1 transition-colors"
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

      {/* 4. Priority Milestone / Recommended Next Step */}
      {recommended_next_step && (
        <div className="p-6 rounded-2xl border border-futureViolet/30 bg-[#0D0F22]/90 shadow-future-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-futureViolet text-white text-[10px] font-mono uppercase font-bold shadow-future-glow">
                🎯 Priority Milestone
              </span>
              <span className="text-xs font-mono text-gray-400">
                {recommended_next_step.stage_title}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white font-display">
              {recommended_next_step.task_title}
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              {recommended_next_step.description}
            </p>
            {recommended_next_step.learning_objectives?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {recommended_next_step.learning_objectives.slice(0, 2).map((obj, i) => (
                  <span key={i} className="text-[10px] text-gray-300 bg-[#141738] px-2 py-0.5 rounded-md border border-white/10">
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/20 hover:border-white text-xs font-semibold text-white bg-[#141738] hover:bg-[#1c214e] transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mark Completed</span>
            </button>
            <button
              onClick={() => setActivePage('roadmap')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-bold hover:shadow-future-glow transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Open Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Two-Column Layout: Skill Competency Chart vs Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Skill Competency Visualizer & User Competencies */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#0D0F22]/80 shadow-future-card space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-sm text-white">Evaluated Skill Competency</h3>
              <span className="text-[11px] text-gray-400">Authenticated user proficiencies calibrated by Skill Analysis Agent</span>
            </div>
            <button 
              onClick={() => setActivePage('profile')}
              className="text-xs text-futureBlue hover:text-white font-medium underline transition-colors"
            >
              My Skills Engine
            </button>
          </div>

          {hasSkills ? (
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
                    contentStyle={{ backgroundColor: '#0D0F22', color: '#fff', borderRadius: '12px', fontSize: '11px', border: '1px solid #3B82F6' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.score >= 75 ? '#8B5CF6' : entry.score >= 50 ? '#3B82F6' : '#64748B'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-futureViolet/10 border border-futureViolet/30 text-futureViolet flex items-center justify-center mx-auto">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No skills added yet</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                You haven't registered any technical competencies. Add your skills in the Skills Engine to generate real-time orbital telemetry.
              </p>
              <button
                onClick={() => setActivePage('profile')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-bold hover:shadow-future-glow transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skills in Profile</span>
              </button>
            </div>
          )}

          {/* User-Specific Skill Progress Bars */}
          {hasSkills && (
            <div className="space-y-2.5 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>Saved Competencies ({skills_overview.length})</span>
                <span>User Input / Assessment</span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {skills_overview.map((s) => {
                  const pct = s.proficiency_percentage ?? s.score ?? 50;
                  return (
                    <div key={s.id || s.skill_name} className="p-2.5 rounded-xl bg-[#141738]/60 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{s.skill_name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0A0B1A] text-futureBlue border border-futureBlue/30">
                            {s.category || 'Technical'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white text-xs">{pct}%</span>
                      </div>
                      <div className="w-full bg-[#1A1D36] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 75 ? 'bg-gradient-to-r from-futureBlue to-futureViolet shadow-future-glow' : pct >= 45 ? 'bg-futureBlue' : 'bg-gray-500'
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

          {/* Missing Skills Indicator */}
          {missing_skills?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#141738]/40 border border-futureViolet/30">
              <span className="text-[10px] font-mono uppercase text-futureViolet font-bold block mb-1.5">
                Priority Missing Competencies for {selected_career_goal}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {missing_skills.slice(0, 6).map((sk, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0D0F22] text-gray-200 border border-futureViolet/40">
                    + {sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Pending Learning Tasks & Checklist */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#0D0F22]/80 shadow-future-card space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-sm text-white">Upcoming Roadmap Tasks</h3>
              <span className="text-[11px] text-gray-400">Directly synchronized with Progress Tracking Agent</span>
            </div>
            <button 
              onClick={() => setActivePage('roadmap')}
              className="text-xs text-futureBlue hover:text-white font-medium underline transition-colors"
            >
              View Full Track
            </button>
          </div>

          <div className="space-y-3">
            {pending_tasks?.length > 0 ? (
              pending_tasks.map((task) => (
                <div 
                  key={task.id}
                  className="p-3.5 rounded-xl border border-white/10 hover:border-futureViolet/50 transition-all bg-[#141738]/50 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-futureViolet block uppercase font-semibold">
                      {task.stage_title}
                    </span>
                    <h4 className="text-xs font-semibold text-white">
                      {task.task_title}
                    </h4>
                    <p className="text-[11px] text-gray-400 line-clamp-1">
                      {task.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleTask(task.id, task.is_completed)}
                    disabled={actionLoading}
                    className="p-1 rounded text-gray-400 hover:text-white transition-colors"
                    title="Toggle task completion"
                  >
                    {task.is_completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">All Active Tasks Completed</h4>
                <p className="text-xs text-gray-400">
                  Run agent recalibration to unlock next milestone modules.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 6. Live Multi-Agent Collaboration Trace */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#0D0F22]/80 shadow-future-card space-y-4 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-futureBlue animate-pulse" />
            <h3 className="font-bold text-sm text-white">Recent Autonomous Agent Collaborations</h3>
          </div>
          <button 
            onClick={() => setActivePage('agents')}
            className="text-xs text-futureBlue hover:text-white font-medium underline flex items-center gap-1 transition-colors"
          >
            <span>Inspect Agent Architecture</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(recent_activities || []).slice(0, 3).map((act) => (
            <div key={act.id} className="p-3.5 rounded-xl border border-white/10 bg-[#141738]/50 space-y-2 hover:border-futureViolet/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-futureViolet/20 text-futureViolet border border-futureViolet/30">
                  {act.agent_name}
                </span>
                <span className="text-[9px] font-mono text-gray-400">{act.latency_ms}ms</span>
              </div>
              <h5 className="text-xs font-semibold text-white">{act.task_name}</h5>
              <p className="text-[11px] text-gray-400 line-clamp-2">{act.output_summary}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}