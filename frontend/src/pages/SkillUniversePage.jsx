import React, { useState, useEffect } from 'react';
import OrbitalSkillUniverse from '../components/OrbitalSkillUniverse';
import { api } from '../api';
import { Sparkles, Layers, Target, Compass, RefreshCw, AlertCircle } from 'lucide-react';

export default function SkillUniversePage({ setActivePage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getSummary();
      setData(res);
      setError(null);
    } catch (err) {
      console.error("Skill Universe loading error:", err);
      setError(err.message || "Failed to load skill universe data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-3">
        <div className="w-9 h-9 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
          Calibrating ORBIT Gravitational Coordinates...
        </span>
      </div>
    );
  }

  const {
    user,
    selected_career_goal,
    career_readiness_percentage,
    skills_overview,
    missing_skills
  } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#292929]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-black font-bold">
              Signature Visualizer
            </span>
            <span className="text-xs font-mono text-[#A1A1AA]">
              Radial Competency Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mt-1">
            Orbital Skill Universe
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Target Career: <strong className="text-white font-semibold">{selected_career_goal}</strong> • {career_readiness_percentage}% Overall Alignment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-[#121212] border border-[#292929] text-xs font-semibold text-white hover:bg-[#1A1A1A] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalibrate Orbit</span>
          </button>
          <button
            onClick={() => setActivePage('roadmap')}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Bridge Gaps in Roadmap</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Orbital Skill Universe */}
      <div className="space-y-4">
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

      {/* Legend & Analytical Insights Below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#262626] space-y-2">
          <span className="text-[10px] font-mono text-[#71717A] uppercase font-bold">Core Orbits</span>
          <h3 className="text-sm font-bold text-white">Concentric Skill Taxonomy</h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Orbit 1 houses foundational languages, Orbit 2 holds specialized frameworks, Orbit 3 covers production tooling, and Orbit 4 maps career requirements.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#121212] border border-[#262626] space-y-2">
          <span className="text-[10px] font-mono text-[#71717A] uppercase font-bold">Diagnostic Validation</span>
          <h3 className="text-sm font-bold text-white">Real-Time State Mapping</h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Clicking any node reveals whether a skill is verified through quizzes, introduced in your college syllabus, or missing from industry benchmarks.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#121212] border border-[#262626] space-y-2">
          <span className="text-[10px] font-mono text-[#71717A] uppercase font-bold">Closed-Loop Adaptation</span>
          <h3 className="text-sm font-bold text-white">Dynamic Gravitational Shift</h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            As you complete roadmap milestones and pass skill assessments, orbital states instantly transition from missing gaps to verified competencies.
          </p>
        </div>
      </div>

    </div>
  );
}
