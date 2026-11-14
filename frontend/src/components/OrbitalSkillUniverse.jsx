import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Target, 
  Compass, 
  Layers, 
  Award, 
  BookOpen, 
  ChevronRight, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Activity,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Bot,
  GraduationCap
} from 'lucide-react';

export default function OrbitalSkillUniverse({ 
  userProfile = {}, 
  targetCareer = 'Full Stack Developer',
  skills = [],
  missingSkills = [],
  collegeSubjects = [],
  onSelectAction = null,
  isHeroMode = false
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'demonstrated', 'missing', 'college'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRotating, setIsRotating] = useState(!isHeroMode);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Auto rotation in hero or ambient mode
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.15) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isRotating]);

  // Build the orbital nodes dynamically from real user skills & target requirements
  const orbitalRings = useMemo(() => {
    // Standard requirements matrix for target career if not provided
    const targetRequirements = [
      { name: "JavaScript", ring: 1, type: "frontend", required: "Advanced" },
      { name: "Python", ring: 1, type: "backend", required: "Intermediate" },
      { name: "SQL", ring: 1, type: "database", required: "Intermediate" },
      { name: "HTML/CSS", ring: 1, type: "frontend", required: "Intermediate" },
      { name: "React", ring: 2, type: "frontend", required: "Advanced" },
      { name: "Node.js", ring: 2, type: "backend", required: "Advanced" },
      { name: "REST APIs", ring: 2, type: "backend", required: "Advanced" },
      { name: "Git", ring: 2, type: "devops", required: "Intermediate" },
      { name: "Docker", ring: 3, type: "devops", required: "Intermediate" },
      { name: "PostgreSQL", ring: 3, type: "database", required: "Intermediate" },
      { name: "System Architecture", ring: 3, type: "architecture", required: "Intermediate" },
      { name: "Tailwind CSS", ring: 3, type: "frontend", required: "Intermediate" },
      { name: "Agile Collaboration", ring: 4, type: "soft_skills", required: "Intermediate" },
      { name: "Code Review", ring: 4, type: "soft_skills", required: "Intermediate" },
      { name: "Problem Solving", ring: 4, type: "academic", required: "Advanced" },
      { name: "Database Design", ring: 4, type: "academic", required: "Advanced" },
    ];

    const getSkillString = (item) => {
      if (typeof item === 'string') return item.toLowerCase();
      if (item && typeof item === 'object') {
        return (item.skill_name || item.name || '').toLowerCase();
      }
      return '';
    };

    const demonstratedNames = new Set((skills || []).map(getSkillString).filter(Boolean));
    const missingNames = new Set((missingSkills || []).map(getSkillString).filter(Boolean));
    const collegeCovered = new Set(["sql", "problem solving", "database design", "algorithms", "networking"]);

    // Calculate positions on concentric rings (radii: 90, 160, 230, 300)
    const ringRadii = [90, 165, 240, 315];

    return ringRadii.map((radius, rIdx) => {
      const ringNodes = targetRequirements.filter(req => req.ring === (rIdx + 1));
      const count = ringNodes.length;

      const nodes = ringNodes.map((item, idx) => {
        const itemLower = item.name.toLowerCase();
        const isDemonstrated = demonstratedNames.has(itemLower);
        const isMissing = missingNames.has(itemLower) || (!isDemonstrated && !missingNames.size);
        const isCollege = collegeCovered.has(itemLower);

        let state = 'missing';
        if (isDemonstrated) state = 'demonstrated';
        else if (isCollege) state = 'college_covered';

        // Angular position with base offset
        const baseAngle = (360 / count) * idx;
        const currentAngle = (baseAngle + (rIdx % 2 === 0 ? rotationAngle : -rotationAngle * 0.8)) * (Math.PI / 180);
        const x = Math.cos(currentAngle) * radius;
        const y = Math.sin(currentAngle) * radius;

        return {
          ...item,
          id: `${item.name}-${rIdx}`,
          x,
          y,
          radius,
          state,
          isDemonstrated,
          isMissing,
          isCollege,
          proficiency: isDemonstrated ? 'Intermediate' : 'Not Demonstrated',
          required: item.required,
          assessment: isDemonstrated ? 'Passed (85%)' : 'Diagnostic Pending',
          collegeSubject: isCollege ? 'Data Structures & DBMS' : 'Industry Add-on',
          resourceRecommendation: `Mastering ${item.name} for Production`,
        };
      });

      return {
        ringIndex: rIdx + 1,
        radius,
        nodes,
      };
    });
  }, [skills, missingSkills, targetCareer, rotationAngle]);

  // All flattened nodes for search/filtering
  const allNodes = useMemo(() => {
    return orbitalRings.flatMap(r => r.nodes);
  }, [orbitalRings]);

  // Filtered nodes
  const visibleNodes = useMemo(() => {
    if (filterMode === 'all') return allNodes;
    if (filterMode === 'demonstrated') return allNodes.filter(n => n.state === 'demonstrated');
    if (filterMode === 'missing') return allNodes.filter(n => n.state === 'missing');
    if (filterMode === 'college') return allNodes.filter(n => n.isCollege);
    return allNodes;
  }, [allNodes, filterMode]);

  return (
    <div className={`relative w-full ${isHeroMode ? 'h-[500px] md:h-[620px]' : 'h-[650px] md:h-[720px]'} bg-[#050505] rounded-3xl border border-[#222222] overflow-hidden select-none flex items-center justify-center`}>
      
      {/* Background Starfield & Subtle Radar Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111111] via-[#050505] to-[#020202] pointer-events-none" />
      
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Orbit Universe Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101010]/90 border border-[#292929] text-xs font-mono text-[#D4D4D8] backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>ORBIT UNIVERSE</span>
          <span className="text-[#71717A]">•</span>
          <span className="text-[#A1A1AA]">{targetCareer}</span>
        </div>

        {!isHeroMode && (
          <div className="flex items-center gap-1 bg-[#101010]/80 border border-[#262626] rounded-xl p-1 backdrop-blur-md">
            {[
              { id: 'all', label: 'All Orbits' },
              { id: 'demonstrated', label: 'Verified Skills' },
              { id: 'missing', label: 'Missing Gaps' },
              { id: 'college', label: 'College Mapped' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                  filterMode === f.id
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom & Orbit Rotation Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-2 rounded-xl border transition-colors backdrop-blur-md ${
            isRotating 
              ? 'bg-white text-black border-white' 
              : 'bg-[#101010] text-[#A1A1AA] border-[#292929] hover:text-white'
          }`}
          title={isRotating ? 'Pause Orbit' : 'Resume Orbit'}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin-slow' : ''}`} />
        </button>

        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
          className="p-2 rounded-xl bg-[#101010]/80 border border-[#292929] text-[#A1A1AA] hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.75))}
          className="p-2 rounded-xl bg-[#101010]/80 border border-[#292929] text-[#A1A1AA] hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => { setZoomLevel(1); setRotationAngle(0); }}
          className="p-2 rounded-xl bg-[#101010]/80 border border-[#292929] text-[#A1A1AA] hover:text-white transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas for Concentric Orbits & Skill Nodes */}
      <div 
        className="relative flex items-center justify-center transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg 
          width="740" 
          height="740" 
          viewBox="-370 -370 740 740" 
          className="overflow-visible"
        >
          <defs>
            {/* Center Core Glow */}
            <radialGradient id="orbitCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Linear connection line gradients */}
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#292929" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Central Ambient Glow */}
          <circle cx="0" cy="0" r="120" fill="url(#orbitCoreGlow)" />

          {/* 1. Concentric Orbit Rings */}
          {orbitalRings.map((ring) => (
            <g key={ring.ringIndex}>
              {/* Outer faint track */}
              <circle
                cx="0"
                cy="0"
                r={ring.radius}
                fill="none"
                stroke="#222222"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
              {/* Subtle orbital path marker */}
              <circle
                cx="0"
                cy="0"
                r={ring.radius}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1"
                strokeOpacity="0.08"
              />
            </g>
          ))}

          {/* 2. Connected Spoke Lines to visible nodes */}
          {visibleNodes.map((node) => (
            <line
              key={`line-${node.id}`}
              x1="0"
              y1="0"
              x2={node.x}
              y2={node.y}
              stroke="#292929"
              strokeWidth="0.75"
              strokeDasharray="2 4"
              opacity={selectedNode?.id === node.id ? 0.9 : 0.3}
            />
          ))}

          {/* 3. Orbit Skill Nodes */}
          {visibleNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isDemonstrated = node.state === 'demonstrated';
            const isCollege = node.isCollege;

            // Visual Styling based on state
            let nodeFill = "#101010";
            let nodeStroke = "#333333";
            let textColor = "#D4D4D8";
            let glowFilter = "none";

            if (isDemonstrated) {
              nodeFill = "#FFFFFF";
              nodeStroke = "#FFFFFF";
              textColor = "#050505";
              glowFilter = "drop-shadow(0 0 8px rgba(255,255,255,0.6))";
            } else if (isSelected) {
              nodeFill = "#181818";
              nodeStroke = "#FFFFFF";
              textColor = "#FFFFFF";
              glowFilter = "drop-shadow(0 0 10px rgba(255,255,255,0.8))";
            } else if (node.state === 'missing') {
              nodeFill = "#0C0C0C";
              nodeStroke = "#444444";
              textColor = "#A1A1AA";
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedNode(node)}
                style={{ filter: glowFilter }}
              >
                {/* Node Outer Halo for Verified or Selected */}
                {(isDemonstrated || isSelected) && (
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? "22" : "18"}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    strokeOpacity={isSelected ? "0.8" : "0.3"}
                    className="animate-ping"
                    style={{ animationDuration: '3s' }}
                  />
                )}

                {/* Main Node Bubble */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? "16" : isDemonstrated ? "14" : "12"}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth={isSelected ? "2" : "1.5"}
                />

                {/* State Indicator Glyph */}
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={isDemonstrated ? "#000000" : isSelected ? "#FFFFFF" : "#71717A"}
                  fontSize={isSelected ? "11" : "9"}
                  fontWeight="bold"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {isDemonstrated ? "✓" : isCollege ? "~" : "!"}
                </text>

                {/* Node Label Floating Below */}
                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  fill={isSelected ? "#FFFFFF" : isDemonstrated ? "#F5F5F5" : "#888888"}
                  fontSize="10"
                  fontWeight={isSelected || isDemonstrated ? "700" : "500"}
                  fontFamily="Space Grotesk, sans-serif"
                  letterSpacing="0.2px"
                  className="pointer-events-none drop-shadow-md select-none"
                >
                  {node.name}
                </text>

                {/* Mini Badge for Missing Priority */}
                {node.state === 'missing' && (
                  <circle
                    cx="10"
                    cy="-10"
                    r="3.5"
                    fill="#FFFFFF"
                    stroke="#000000"
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}

          {/* 4. Central Sun Node: STUDENT PROFILE & ORBIT CORE */}
          <g 
            transform="translate(0, 0)" 
            className="cursor-pointer group"
            onClick={() => setSelectedNode({
              name: userProfile.full_name || "Active Learner",
              isCenter: true,
              targetCareer: targetCareer,
              department: userProfile.department || "Computer Science",
              college: userProfile.college || "University",
              readiness: userProfile.readinessScore || 78
            })}
          >
            {/* Center Outer Pulsing Rings */}
            <circle
              cx="0"
              cy="0"
              r="46"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1"
              strokeOpacity="0.2"
              className="animate-pulse"
            />
            <circle
              cx="0"
              cy="0"
              r="38"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="animate-spin-slow"
            />

            {/* Center Core Disc */}
            <circle
              cx="0"
              cy="0"
              r="32"
              fill="#FFFFFF"
              stroke="#050505"
              strokeWidth="2"
              className="group-hover:scale-105 transition-transform shadow-glow"
            />

            {/* Center Label */}
            <text
              x="0"
              y="-4"
              textAnchor="middle"
              fill="#000000"
              fontSize="9"
              fontFamily="Space Grotesk, sans-serif"
              fontWeight="900"
              letterSpacing="0.5px"
            >
              ORBIT
            </text>
            <text
              x="0"
              y="8"
              textAnchor="middle"
              fill="#000000"
              fontSize="8"
              fontFamily="Space Grotesk, sans-serif"
              fontWeight="700"
            >
              PROFILE
            </text>
          </g>
        </svg>
      </div>

      {/* 5. Bottom Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#A1A1AA] bg-[#0A0A0A]/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#222222]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <span className="text-[#F5F5F5]">Demonstrated Skill</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#181818] border border-[#555555]" />
            <span>Missing Industry Gap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#151515] border border-dashed border-[#888888]" />
            <span>College Curriculum</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#71717A]">Click any orbital node to inspect</span>
          <ChevronRight className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* 6. Interactive Node Inspection Drawer / Modal */}
      {selectedNode && (
        <div className="absolute inset-y-0 right-0 w-full sm:w-80 md:w-96 bg-[#0E0E0E]/95 border-l border-[#262626] backdrop-blur-xl p-6 z-30 flex flex-col justify-between shadow-2xl animate-fadeIn text-[#F5F5F5]">
          <div className="space-y-5 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#222222]">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-black font-bold">
                  {selectedNode.isCenter ? 'Center Orbit' : 'Skill Node'}
                </span>
                <h3 className="text-xl font-extrabold text-white font-display mt-1 tracking-tight">
                  {selectedNode.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#202020] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Center Profile View */}
            {selectedNode.isCenter ? (
              <div className="space-y-4">
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  You are at the gravitational center of the ORBIT Universe. All concentric rings represent employer competencies mapped around your profile.
                </p>

                <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#71717A]">Target Career</span>
                    <span className="text-white font-bold">{selectedNode.targetCareer}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#71717A]">Department</span>
                    <span className="text-white font-bold">{selectedNode.department}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#71717A]">Curriculum Alignment</span>
                    <span className="text-emerald-400 font-bold">{selectedNode.readiness}%</span>
                  </div>
                </div>

                {onSelectAction && (
                  <button
                    onClick={() => { setSelectedNode(null); onSelectAction('roadmap'); }}
                    className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Open Adaptive Roadmap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              /* Regular Skill Node Details */
              <div className="space-y-4 text-xs">
                {/* Status Pill */}
                <div className="p-3 rounded-xl bg-[#141414] border border-[#242424] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717A]">Skill Status</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                      selectedNode.isDemonstrated 
                        ? 'bg-white text-black' 
                        : selectedNode.isCollege 
                          ? 'bg-[#222222] text-amber-300' 
                          : 'bg-[#201010] text-red-300 border border-red-900/40'
                    }`}>
                      {selectedNode.isDemonstrated ? 'VERIFIED' : selectedNode.isCollege ? 'COLLEGE MAPPED' : 'MISSING GAP'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#71717A]">Current Proficiency</span>
                    <span className="font-semibold text-white">{selectedNode.proficiency}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#71717A]">Industry Requirement</span>
                    <span className="font-semibold text-white">{selectedNode.required}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#71717A]">Diagnostic Status</span>
                    <span className="text-[#D4D4D8]">{selectedNode.assessment}</span>
                  </div>
                </div>

                {/* College Subject Mapping */}
                <div className="p-3 rounded-xl bg-[#141414] border border-[#242424] space-y-1.5">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block font-semibold">
                    Academic Course Connection
                  </span>
                  <div className="flex items-center gap-1.5 text-white font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-white" />
                    <span>{selectedNode.collegeSubject}</span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA]">
                    {selectedNode.isCollege 
                      ? 'Taught in university core syllabus; needs industry depth.'
                      : 'Missing from standard college curriculum; acquired through ORBIT roadmap.'}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="p-3 rounded-xl bg-[#141414] border border-[#242424] space-y-1.5">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block font-semibold">
                    Recommended Learning Action
                  </span>
                  <div className="flex items-center gap-1.5 text-white font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                    <span>{selectedNode.resourceRecommendation}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      setSelectedNode(null);
                      if (onSelectAction) onSelectAction('assessments');
                    }}
                    className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Take Skill Diagnostic Quiz</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedNode(null);
                      if (onSelectAction) onSelectAction('mentor');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#181818] border border-[#303030] text-white text-xs font-semibold hover:bg-[#222222] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI Mentor About {selectedNode.name}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#222222] text-center">
            <span className="text-[10px] font-mono text-[#71717A]">
              ORBIT AI Engine • Radial Career Intelligence
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
