import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Compass, 
  CheckCircle2, 
  Circle, 
  Award, 
  Code2, 
  BookOpen, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Target
} from 'lucide-react';

export default function RoadmapPage({ setActivePage }) {
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedStages, setExpandedStages] = useState({});

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.roadmap.get();
      setRoadmapData(res);

      // Auto-expand the first incomplete stage
      const firstIncomplete = res.tasks?.find(t => !t.is_completed);
      if (firstIncomplete) {
        setExpandedStages({ [firstIncomplete.id]: true });
      } else if (res.tasks?.[0]) {
        setExpandedStages({ [res.tasks[0].id]: true });
      }
    } catch (err) {
      console.error("Roadmap fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      setActionLoading(true);
      await api.roadmap.toggleTask(taskId, !currentStatus);
      await fetchRoadmap();
    } catch (err) {
      alert("Error updating task: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleExpand = (taskId) => {
    setExpandedStages(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleRegenerateRoadmap = async () => {
    try {
      setActionLoading(true);
      await api.agents.runPipeline(roadmapData?.roadmap?.career_goal, true);
      await fetchRoadmap();
    } catch (err) {
      alert("Failed to regenerate roadmap: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !roadmapData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#A1A1AA]">Synthesizing Adaptive Roadmap...</span>
      </div>
    );
  }

  const { roadmap, tasks, completed_count, total_count } = roadmapData || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* 1. Header Banner */}
      <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-black font-bold">
              Adaptive Curriculum
            </span>
            <span className="text-xs font-mono text-[#A1A1AA]">
              Track: {roadmap?.career_goal}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-display">
            {roadmap?.title || `Personalized Roadmap: ${roadmap?.career_goal}`}
          </h1>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            {roadmap?.summary || "Sequential stages dynamically tailored to resolve your skill gaps and prepare you for hiring standards."}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {roadmap?.completion_percentage || 0}%
            </span>
            <span className="text-xs font-mono text-[#A1A1AA]">
              ({completed_count}/{total_count} Completed)
            </span>
          </div>

          <div className="w-48 bg-[#202020] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-700 shadow-glow"
              style={{ width: `${roadmap?.completion_percentage || 0}%` }}
            />
          </div>

          <button
            onClick={handleRegenerateRoadmap}
            disabled={actionLoading}
            className="px-3.5 py-1.5 rounded-xl border border-[#292929] hover:border-white text-[11px] font-semibold text-white bg-[#151515] hover:bg-[#202020] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate with AI Agents</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Stages Timeline */}
      <div className="space-y-4">
        {tasks?.map((task, idx) => {
          const isExpanded = !!expandedStages[task.id];
          const isRemedial = task.stage_title.toLowerCase().includes('remediation') || task.stage_order === 99;

          return (
            <div 
              key={task.id}
              className={`rounded-2xl border transition-all ${
                isRemedial 
                  ? 'border-amber-500/80 bg-[#1A150A] shadow-subtle'
                  : task.is_completed 
                    ? 'border-[#222222] bg-[#0E0E0E]' 
                    : 'border-[#333333] bg-[#121212] shadow-premium hover:border-white'
              }`}
            >
              {/* Stage Header Accordion Row */}
              <div 
                className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                onClick={() => toggleExpand(task.id)}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTask(task.id, task.is_completed);
                    }}
                    disabled={actionLoading}
                    className="mt-0.5 sm:mt-0 focus:outline-none"
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-white hover:opacity-80" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#555555] hover:text-white" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        isRemedial 
                          ? 'bg-amber-400 text-black' 
                          : 'bg-[#202020] text-white border border-[#333333]'
                      }`}>
                        {task.stage_title}
                      </span>
                      {isRemedial && (
                        <span className="text-[10px] text-amber-300 font-mono font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Adaptive Agent Intervention
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm sm:text-base font-bold mt-1 ${
                      task.is_completed ? 'text-[#71717A] line-through' : 'text-white'
                    }`}>
                      {task.task_title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold hidden sm:inline-block ${
                    task.is_completed ? 'bg-white text-black' : 'bg-[#202020] text-[#A1A1AA]'
                  }`}>
                    {task.is_completed ? 'COMPLETED' : 'IN PROGRESS'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#A1A1AA]" /> : <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />}
                </div>
              </div>

              {/* Stage Collapsible Detail Panel */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-[#222222] space-y-5 text-xs text-[#A1A1AA] animate-fadeIn">
                  
                  {/* Description */}
                  <p className="text-xs leading-relaxed text-[#D4D4D8]">
                    {task.description}
                  </p>

                  {/* Learning Objectives */}
                  {task.learning_objectives?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" /> Target Competencies
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {task.learning_objectives.map((obj, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-[#181818] border border-[#262626] text-[11px] flex items-start gap-2 text-[#D4D4D8]">
                            <span className="text-white font-bold">•</span>
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practical Exercises */}
                  {task.practical_exercises?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5" /> Practical Hands-On Exercises
                      </h4>
                      <div className="space-y-1.5">
                        {task.practical_exercises.map((ex, i) => (
                          <div key={i} className="p-3 rounded-xl bg-[#0C0C0C] border border-[#222222] text-[11px] font-mono text-[#EAEAEA] flex items-center justify-between">
                            <span>› {ex}</span>
                            <span className="text-[10px] text-[#71717A]">Project Spec</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Row */}
                  <div className="pt-3 border-t border-[#222222] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleTask(task.id, task.is_completed)}
                        disabled={actionLoading}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          task.is_completed 
                            ? 'bg-[#1C1C1C] text-[#A1A1AA] hover:text-white' 
                            : 'bg-white text-black hover:bg-[#E0E0E0]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{task.is_completed ? 'Mark Incomplete' : 'Complete Milestone'}</span>
                      </button>

                      <button
                        onClick={() => setActivePage('assessments')}
                        className="px-3.5 py-2 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white text-xs font-medium hover:bg-[#222222] transition-colors flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Test Mastery</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setActivePage('mentor')}
                      className="text-xs text-[#A1A1AA] hover:text-white font-mono flex items-center gap-1"
                    >
                      <span>Ask AI Mentor about this stage</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
