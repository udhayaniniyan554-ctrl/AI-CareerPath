import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Activity, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  Layers, 
  Database, 
  ShieldCheck, 
  Code2, 
  Sparkles, 
  Clock, 
  Terminal,
  Bot,
  Zap,
  ChevronRight,
  X
} from 'lucide-react';

export default function AgentVisualizerPage() {
  const [activities, setActivities] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [lastPipelineRun, setLastPipelineRun] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [orbitAngle, setOrbitAngle] = useState(0);

  // Subtle rotation for orbital agent visualization
  useEffect(() => {
    const timer = setInterval(() => {
      setOrbitAngle(prev => (prev + 0.2) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const [logs, ov] = await Promise.all([
        api.agents.getActivity(50),
        api.agents.getOverview()
      ]);
      setActivities(logs || []);
      setOverview(ov);
    } catch (err) {
      console.error("Agents visualizer error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleTriggerPipeline = async () => {
    try {
      setPipelineRunning(true);
      const res = await api.agents.runPipeline();
      setLastPipelineRun(res);
      await fetchActivities();
    } catch (err) {
      alert("Error triggering pipeline: " + err.message);
    } finally {
      setPipelineRunning(false);
    }
  };

  const agentsList = [
    { id: "skill_analysis", name: "Skill Analysis Agent", role: "Quantify Proficiencies", icon: Sparkles, posIndex: 0 },
    { id: "career_matching", name: "Career Matching Agent", role: "Industry Benchmarking", icon: Layers, posIndex: 1 },
    { id: "roadmap", name: "Roadmap Agent", role: "Personalized Sequencing", icon: Code2, posIndex: 2 },
    { id: "recommendation", name: "Recommendation Agent", role: "Curated Learning Assets", icon: Database, posIndex: 3 },
    { id: "mentor", name: "AI Mentor Agent", role: "Real-time Guidance", icon: Bot, posIndex: 4 },
    { id: "progress_tracking", name: "Progress Tracking Agent", role: "Adaptive Closed Loop", icon: Activity, posIndex: 5 },
  ];

  if (loading && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#A1A1AA]">Connecting to ORBIT AI Orchestrator...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* 1. Header & Live Runner */}
      <div className="p-6 rounded-2xl border border-[#292929] bg-[#101010] shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-black font-bold">
              ORBIT Orchestrator
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              6 Specialized Agents Online
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-display">
            Multi-Agent Orbital Architecture
          </h1>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            PromptWars X RTC Hackathon Core Workflow. Watch the 6 specialized AI agents synchronize profile skills, benchmark requirements, synthesize adaptive roadmaps, and adjust learning tracks in real time.
          </p>
        </div>

        <button
          onClick={handleTriggerPipeline}
          disabled={pipelineRunning}
          className="px-6 py-3.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 shrink-0"
        >
          <Play className={`w-4 h-4 fill-black ${pipelineRunning ? 'animate-spin' : ''}`} />
          <span>{pipelineRunning ? 'Orchestrating Workflow...' : 'Execute Full Multi-Agent Pipeline'}</span>
        </button>
      </div>

      {/* 2. Interactive Orbital Agent System (Section 15) */}
      <div className="relative h-[480px] rounded-3xl bg-[#080808] border border-[#222222] overflow-hidden flex items-center justify-center select-none shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#141414] via-[#080808] to-[#040404] pointer-events-none" />

        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>ORBIT AGENT CLUSTER</span>
          <span>•</span>
          <span className="text-white">Click any agent to inspect</span>
        </div>

        {/* SVG Orbital Canvas */}
        <svg width="560" height="420" viewBox="-280 -210 560 420" className="overflow-visible relative z-10">
          <defs>
            <radialGradient id="orchestratorGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Ambient Core Glow */}
          <circle cx="0" cy="0" r="90" fill="url(#orchestratorGlow)" />

          {/* Orbital Ellipse Track */}
          <ellipse cx="0" cy="0" rx="200" ry="140" fill="none" stroke="#252525" strokeWidth="1" strokeDasharray="4 6" />
          <ellipse cx="0" cy="0" rx="200" ry="140" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.08" />

          {/* Animated Connecting Spokes & Agent Nodes */}
          {agentsList.map((agent, idx) => {
            const angleDeg = (360 / 6) * idx + orbitAngle;
            const angleRad = angleDeg * (Math.PI / 180);
            const x = Math.cos(angleRad) * 200;
            const y = Math.sin(angleRad) * 140;
            const isSelected = selectedAgent?.id === agent.id;

            return (
              <g key={agent.id}>
                {/* Spoke line */}
                <line
                  x1="0"
                  y1="0"
                  x2={x}
                  y2={y}
                  stroke="#292929"
                  strokeWidth={isSelected ? "1.5" : "0.75"}
                  strokeDasharray="2 4"
                  opacity={isSelected ? 1 : 0.4}
                />

                {/* Agent Node */}
                <g 
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setSelectedAgent(agent)}
                >
                  {isSelected && (
                    <circle cx="0" cy="0" r="22" fill="none" stroke="#FFFFFF" strokeWidth="1" className="animate-ping" />
                  )}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? "16" : "13"}
                    fill={isSelected ? "#FFFFFF" : "#121212"}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? "2" : "1"}
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={isSelected ? "#000000" : "#FFFFFF"}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="Space Grotesk, sans-serif"
                  >
                    0{idx + 1}
                  </text>

                  {/* Label */}
                  <text
                    x="0"
                    y="24"
                    textAnchor="middle"
                    fill={isSelected ? "#FFFFFF" : "#A1A1AA"}
                    fontSize="10"
                    fontWeight={isSelected ? "700" : "500"}
                    fontFamily="Space Grotesk, sans-serif"
                    className="pointer-events-none select-none drop-shadow"
                  >
                    {agent.name.replace(" Agent", "")}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Central Sun Node: ORBIT AI ORCHESTRATOR */}
          <g transform="translate(0, 0)" className="cursor-pointer" onClick={() => setSelectedAgent(null)}>
            <circle cx="0" cy="0" r="40" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.2" className="animate-pulse" />
            <circle cx="0" cy="0" r="32" fill="#FFFFFF" stroke="#050505" strokeWidth="2" className="shadow-glow" />
            <text x="0" y="-3" textAnchor="middle" fill="#000000" fontSize="8" fontFamily="Space Grotesk, sans-serif" fontWeight="900">
              ORBIT AI
            </text>
            <text x="0" y="8" textAnchor="middle" fill="#000000" fontSize="7" fontFamily="Space Grotesk, sans-serif" fontWeight="700">
              ORCHESTRATOR
            </text>
          </g>
        </svg>

        {/* Selected Agent Inspector Drawer */}
        {selectedAgent && (
          <div className="absolute top-4 right-4 bottom-4 w-80 bg-[#121212]/95 border border-[#292929] backdrop-blur-md p-5 rounded-2xl z-30 flex flex-col justify-between shadow-2xl animate-fadeIn text-xs">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex justify-between items-start pb-2 border-b border-[#222222]">
                <div>
                  <span className="text-[10px] font-mono text-white px-2 py-0.5 rounded bg-[#202020]">
                    Agent 0{selectedAgent.posIndex + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{selectedAgent.name}</h4>
                </div>
                <button onClick={() => setSelectedAgent(null)} className="text-[#A1A1AA] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#181818] border border-[#262626] space-y-1">
                <span className="text-[10px] font-mono text-[#71717A] uppercase block">Specialization</span>
                <span className="text-white font-medium">{selectedAgent.role}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#181818] border border-[#262626] space-y-1">
                <span className="text-[10px] font-mono text-[#71717A] uppercase block">Execution Mode</span>
                <span className="text-emerald-400 font-mono font-semibold">Autonomous JSON Exchange</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#71717A] uppercase block">Recent Log Output</span>
                {activities.filter(a => a.agent_name.toLowerCase().includes(selectedAgent.name.toLowerCase().split(' ')[0])).slice(0, 2).map((log, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#0C0C0C] border border-[#222222] space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-white font-semibold">{log.task_name}</span>
                      <span className="text-[#71717A]">{log.latency_ms}ms</span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] line-clamp-2">{log.output_summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleTriggerPipeline}
              className="w-full py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#E0E0E0] transition-colors"
            >
              Trigger Agent Recalibration
            </button>
          </div>
        )}
      </div>

      {/* 3. Active Pipeline Live Steps Execution (if freshly triggered) */}
      {lastPipelineRun && (
        <div className="p-6 rounded-2xl border border-white bg-[#101010] space-y-4 animate-fadeIn shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA] font-bold block">
                Execution Complete
              </span>
              <h3 className="font-bold text-sm text-white">
                Pipeline Synchronized in {lastPipelineRun.total_latency_ms}ms
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
              Track: {lastPipelineRun.target_career}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lastPipelineRun.pipeline_steps?.map((step) => (
              <div key={step.step_order} className="p-4 rounded-xl border border-[#262626] bg-[#151515] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-black">
                    Step {step.step_order}
                  </span>
                  <span className="text-[9px] font-mono text-[#A1A1AA]">{step.latency_ms}ms</span>
                </div>
                <h4 className="text-xs font-bold text-white">{step.agent}</h4>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">{step.task}</p>
                <div className="pt-2 border-t border-[#222222] text-[10px] text-[#888888] space-y-1">
                  <div><strong>In:</strong> {step.input_received}</div>
                  <div><strong>Out:</strong> {step.output_produced}</div>
                  <div className="text-white font-semibold">→ Handoff: {step.handoff_to}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Chronological Agent Activity Log Stream */}
      <div className="p-6 rounded-2xl border border-[#292929] bg-[#101010] shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-white" />
            <h3 className="font-bold text-sm text-white">Persistent Agent Execution Audit Stream</h3>
          </div>
          <button 
            onClick={fetchActivities}
            className="text-xs text-[#A1A1AA] hover:text-white font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Stream
          </button>
        </div>

        <div className="divide-y divide-[#1F1F1F] max-h-96 overflow-y-auto">
          {activities.map((act) => (
            <div key={act.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white text-black">
                    {act.agent_name}
                  </span>
                  <span className="font-bold text-white">{act.task_name}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                    act.status === 'REVISED' 
                      ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {act.status}
                  </span>
                </div>
                <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
                  {act.output_summary}
                </p>
                {act.input_summary && (
                  <span className="text-[10px] text-[#71717A] font-mono block">
                    Context: {act.input_summary}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-mono text-[#71717A]">
                  {act.latency_ms}ms
                </span>
                {act.details_json && (
                  <button
                    onClick={() => setSelectedLog(act)}
                    className="px-2.5 py-1 rounded border border-[#333333] hover:border-white text-[10px] font-mono font-semibold text-white bg-[#181818]"
                  >
                    View JSON
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-[#292929] shadow-2xl animate-fadeIn text-[#F5F5F5]">
            <div className="p-4 border-b border-[#222222] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{selectedLog.agent_name} - {selectedLog.task_name}</h4>
                <span className="text-[10px] font-mono text-[#A1A1AA]">Latency: {selectedLog.latency_ms}ms</span>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-xs text-[#A1A1AA] hover:text-white font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-[#080808] text-white font-mono text-xs rounded-b-2xl">
              <pre className="text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(selectedLog.details || JSON.parse(selectedLog.details_json || '{}'), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
