import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import OrbitalSkillUniverse from '../components/OrbitalSkillUniverse';
import { 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Activity, 
  Bot, 
  Award, 
  Layers, 
  BookOpen, 
  ChevronRight, 
  GraduationCap, 
  Building2, 
  Code2, 
  Target, 
  Sparkles, 
  Plus, 
  X, 
  AlertCircle, 
  Lock, 
  Mail, 
  User,
  Zap,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Search,
  FileText
} from 'lucide-react';

export default function LandingPage({ onRegistrationSuccess, onGetStarted, onExploreCareers }) {
  const { onboard } = useAuth();

  // Real User Registration & Onboarding Form State (100% AUTHENTIC - ZERO DEMO DATA)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [education, setEducation] = useState('Bachelor of Technology (B.Tech)');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [currentYear, setCurrentYear] = useState('3rd Year');
  const [semester, setSemester] = useState('Semester 5');
  const [targetCareer, setTargetCareer] = useState('Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');

  // Interactive Technical Skills Tag Adder
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState([]);

  // Areas of Interest
  const [interestInput, setInterestInput] = useState('');
  const [interestsList, setInterestsList] = useState([]);

  // College Subjects for Course Mapping
  const [subjectInput, setSubjectInput] = useState('');
  const [subjectsList, setSubjectsList] = useState([]);

  // Form Submission Status
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  // Resume text parsing helper in onboarding
  const [showResumePaste, setShowResumePaste] = useState(false);
  const [resumeText, setResumeText] = useState('');

  const availableRoles = [
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Python Developer",
    "Java Developer",
    "Data Analyst",
    "AI/ML Engineer",
    "Cloud Engineer",
    "Cybersecurity Analyst",
    "Mobile App Developer"
  ];

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skillsList.includes(clean)) {
      setSkillsList([...skillsList, clean]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter(s => s !== skillToRemove));
  };

  const handleAddInterest = (e) => {
    if (e) e.preventDefault();
    const clean = interestInput.trim();
    if (clean && !interestsList.includes(clean)) {
      setInterestsList([...interestsList, clean]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setInterestsList(interestsList.filter(i => i !== interestToRemove));
  };

  const handleAddSubject = (e) => {
    if (e) e.preventDefault();
    const clean = subjectInput.trim();
    if (clean && !subjectsList.includes(clean)) {
      setSubjectsList([...subjectsList, clean]);
      setSubjectInput('');
    }
  };

  const handleRemoveSubject = (subToRemove) => {
    setSubjectsList(subjectsList.filter(s => s !== subToRemove));
  };

  const parseQuickResume = () => {
    if (!resumeText.trim()) return;
    const common = [
      "Python", "JavaScript", "TypeScript", "React", "Node.js", "Express",
      "SQL", "PostgreSQL", "MongoDB", "HTML", "CSS", "Tailwind CSS",
      "Docker", "AWS", "Git", "FastAPI", "Django", "Flask", "C++", "Java",
      "Kubernetes", "Linux", "REST APIs", "GraphQL", "Redux", "Pandas", "PyTorch"
    ];
    const textLower = resumeText.toLowerCase();
    const found = common.filter(c => textLower.includes(c.toLowerCase()));
    if (found.length > 0) {
      setSkillsList(Array.from(new Set([...skillsList, ...found])));
    }
    setShowResumePaste(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!fullName.trim()) {
      setFormError("Please enter your full name.");
      setActiveStep(1);
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError("Please provide a valid email address.");
      setActiveStep(1);
      return;
    }
    if (!password || password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      setActiveStep(1);
      return;
    }
    if (!college.trim()) {
      setFormError("Please specify your college or university institution.");
      setActiveStep(1);
      return;
    }
    if (!department.trim()) {
      setFormError("Please select or enter your academic department.");
      setActiveStep(1);
      return;
    }
    if (skillsList.length === 0) {
      setFormError("Please add at least one current technical skill.");
      setActiveStep(2);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        education: education.trim(),
        college: college.trim(),
        department: department.trim(),
        current_year: currentYear,
        semester: semester,
        technical_skills: skillsList,
        areas_of_interest: interestsList,
        target_career: targetCareer,
        experience_level: experienceLevel,
        college_subjects: subjectsList
      };

      await onboard(payload);
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
    } catch (err) {
      setFormError(err.message || "Submission failed. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToOnboarding = () => {
    const el = document.getElementById('onboard-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#06060C] text-[#F5F5F5] font-sans selection:bg-futureViolet selection:text-white cyber-mesh-bg">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Concept C: Future Intelligence Universe)      */}
      {/* ============================================================== */}
      <section id="hero" className="relative pt-16 pb-28 overflow-hidden border-b border-white/10">
        
        {/* Ambient Cosmic Radial Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-futureViolet/20 via-futureBlue/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-futureBlue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-futureViolet/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Hero Headline & Telemetry Pill */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0D0F22]/80 border border-futureViolet/30 text-xs font-mono tracking-wider text-futureViolet uppercase shadow-future-card backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-futureBlue animate-pulse shadow-future-glow" />
              <span className="text-white font-semibold">ORBIT AI</span>
              <span className="text-white/40">•</span>
              <span className="text-gray-300">PromptWars X RTC Hackathon 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] font-display">
              YOUR FUTURE IS NOT A GUESS.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-futureBlue to-futureViolet">
                IT'S AN ORBIT.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              Discover your competencies. Expose your skill gaps. Connect university coursework with real industry benchmarks. Let autonomous AI agents architect your exact career trajectory.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button 
                onClick={scrollToOnboarding}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white font-bold text-sm hover:shadow-future-glow transition-all transform hover:-translate-y-0.5 flex items-center gap-2 shadow-lg"
              >
                <span>Initialize Career Orbit</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={scrollToOnboarding}
                className="px-8 py-3.5 rounded-xl bg-[#0D0F22]/80 border border-white/20 text-white text-sm font-semibold hover:border-futureViolet/60 hover:bg-[#141738] transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <Compass className="w-4 h-4 text-futureBlue" />
                <span>Explore Interactive Universe</span>
              </button>
            </div>
          </div>

          {/* Signature Interactive Orbital Universe Visualization */}
          <div className="mt-14 max-w-5xl mx-auto">
            <OrbitalSkillUniverse 
              isHeroMode={true}
              targetCareer="Full Stack Developer"
              skills={['Python', 'SQL', 'HTML/CSS', 'Git']}
              missingSkills={['React', 'Node.js', 'Docker', 'System Architecture']}
              onSelectAction={scrollToOnboarding}
            />
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 2. THE SKILL GAP PROBLEM (Future Intelligence Glass Grid)      */}
      {/* ============================================================== */}
      <section id="problem" className="py-24 bg-[#090A15] text-[#F5F5F5] border-b border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-futureViolet font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-futureViolet" />
              01 // The Core Problem
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
              Why Traditional Learning Platforms Fail Students.
            </h2>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Universities teach academic theory from static syllabi. Online platforms recommend identical video catalogs to everyone regardless of existing knowledge or target job requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#0D0F22]/70 border border-white/10 space-y-4 hover:border-futureBlue/50 hover:shadow-future-card transition-all backdrop-blur-xl group">
              <div className="w-10 h-10 rounded-2xl bg-futureBlue/10 border border-futureBlue/30 text-futureBlue flex items-center justify-center font-black font-mono text-sm group-hover:scale-105 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-white font-display">No Individual Skill Context</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Platforms recommend beginner courses even when you have already mastered the fundamentals, wasting hundreds of hours on redundant lectures.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0D0F22]/70 border border-white/10 space-y-4 hover:border-futureViolet/50 hover:shadow-future-card transition-all backdrop-blur-xl group">
              <div className="w-10 h-10 rounded-2xl bg-futureViolet/10 border border-futureViolet/30 text-futureViolet flex items-center justify-center font-black font-mono text-sm group-hover:scale-105 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-white font-display">The Academic Disconnect</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Students graduate having passed Database Management and Networks, yet lack practical experience with production tools like Docker, Redis, and CI/CD pipelines.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0D0F22]/70 border border-white/10 space-y-4 hover:border-pink-500/50 hover:shadow-future-card transition-all backdrop-blur-xl group">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center font-black font-mono text-sm group-hover:scale-105 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-white font-display">No Autonomous Feedback Loop</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                When students struggle on technical assessments or change career ambitions, static course playlists cannot adapt, causing high abandonment rates.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 3. MEET ORBIT AI & THE 3 CORE QUESTIONS                        */}
      {/* ============================================================== */}
      <section id="how-it-works" className="py-24 bg-[#06060C] text-[#F5F5F5] border-b border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-futureBlue font-bold flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-futureBlue animate-pulse" />
              02 // The Solution
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              Three Questions ORBIT AI Solves For You.
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              A continuous, closed-loop career navigation intelligence engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-8 rounded-3xl bg-[#0D0F22]/80 border border-white/10 shadow-future-card space-y-4 flex flex-col justify-between hover:border-futureBlue/50 transition-all backdrop-blur-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-futureBlue/20 to-futureBlue/5 border border-futureBlue/40 text-futureBlue flex items-center justify-center font-bold mb-6 shadow-future-glow">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-futureBlue uppercase font-bold block mb-1">Question 1</span>
                <h3 className="text-2xl font-extrabold text-white font-display">"What skills do I have?"</h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-3">
                  ORBIT AI parses your technical history, academic courses, and diagnostic quizzes to isolate demonstrated proficiencies from unverified assumptions.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs font-mono text-gray-300 font-semibold flex items-center gap-1">
                <span className="text-futureBlue">Skill Analysis Agent</span>
                <ChevronRight className="w-3.5 h-3.5 text-futureBlue" />
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#0D0F22]/80 border border-white/10 shadow-future-card space-y-4 flex flex-col justify-between hover:border-futureViolet/50 transition-all backdrop-blur-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-futureViolet/20 to-futureViolet/5 border border-futureViolet/40 text-futureViolet flex items-center justify-center font-bold mb-6 shadow-future-glow">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-futureViolet uppercase font-bold block mb-1">Question 2</span>
                <h3 className="text-2xl font-extrabold text-white font-display">"What skills am I missing?"</h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-3">
                  Our Career Matching Agent evaluates your profile against real employer requirements, calculating precise percentage gaps and missing priorities.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs font-mono text-gray-300 font-semibold flex items-center gap-1">
                <span className="text-futureViolet">Career Matching Agent</span>
                <ChevronRight className="w-3.5 h-3.5 text-futureViolet" />
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#0D0F22]/80 border border-white/10 shadow-future-card space-y-4 flex flex-col justify-between hover:border-pink-500/50 transition-all backdrop-blur-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/40 text-pink-400 flex items-center justify-center font-bold mb-6 shadow-future-glow">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-pink-400 uppercase font-bold block mb-1">Question 3</span>
                <h3 className="text-2xl font-extrabold text-white font-display">"What should I learn next?"</h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-3">
                  The Learning Roadmap Agent synthesizes your missing skills into sequenced, milestone-driven stages with practical coding exercises and quizzes.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs font-mono text-gray-300 font-semibold flex items-center gap-1">
                <span className="text-pink-400">Adaptive Roadmap Agent</span>
                <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 4. SKILL INTELLIGENCE (Future Intelligence Metrics)            */}
      {/* ============================================================== */}
      <section id="skill-intelligence" className="py-24 bg-[#090A15] text-[#F5F5F5] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-futureViolet font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-futureViolet" />
                03 // Skill Intelligence
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
                Objective Skill Evaluation, Not Guesses.
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                ORBIT AI does not assume proficiency from buzzwords. Every technical skill is mapped through diagnostic assessments, project repositories, and college curriculum coverage.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { title: "Beginner (0% – 40%)", desc: "Core syntax, theoretical principles, simple scripts and baseline exercises" },
                  { title: "Intermediate (40% – 75%)", desc: "Production APIs, relational databases, unit testing and service integrations" },
                  { title: "Advanced (75% – 100%)", desc: "System architecture, distributed scalability, performance optimization and security" },
                ].map((lvl, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#0D0F22]/70 border border-white/10 flex items-start gap-4 hover:border-futureViolet/30 transition-all">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-futureBlue to-futureViolet text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-future-glow">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{lvl.title}</h4>
                      <p className="text-xs text-gray-400">{lvl.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar / Matrix Telemetry Preview */}
            <div className="p-8 rounded-3xl bg-[#0D0F22]/90 border border-white/10 space-y-6 shadow-future-card backdrop-blur-xl">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase text-futureBlue block">Target Career Matrix</span>
                  <span className="text-sm font-bold text-white">Full Stack Developer Baseline</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-mono font-bold shadow-future-glow">
                  85% Target
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { skill: "Frontend (React / JS)", pct: 80, status: "Verified" },
                  { skill: "Backend (Node.js / Python)", pct: 65, status: "Progressing" },
                  { skill: "Database (SQL / PostgreSQL)", pct: 85, status: "Verified" },
                  { skill: "DevOps & Cloud (Docker / CI/CD)", pct: 30, status: "Critical Gap" },
                  { skill: "System Architecture", pct: 40, status: "Gap" },
                ].map((s, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-200">{s.skill}</span>
                      <span className={s.pct < 50 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                        {s.status} ({s.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#1A1D36] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          s.pct < 50 ? 'bg-amber-400' : 'bg-gradient-to-r from-futureBlue to-futureViolet shadow-future-glow'
                        }`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#12142B] border border-futureViolet/30 text-[11px] text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-futureViolet shrink-0" />
                <span>ORBIT AI automatically prioritizes Docker and System Architecture in your personalized roadmap.</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 5. COLLEGE-TO-INDUSTRY MAPPING (Concept C Glass Panels)         */}
      {/* ============================================================== */}
      <section id="college-mapping" className="py-24 bg-[#06060C] text-[#F5F5F5] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-futureBlue font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-futureBlue" />
              04 // Academic Bridge Engine
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
              Connect Your College Subjects with Industry Requirements.
            </h2>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              We extract subjects directly from your university curriculum, identifying where college ends and industry preparation begins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-[#0D0F22]/70 border border-white/10 space-y-4 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-glow" />
                <h3 className="text-lg font-bold text-white font-display">Covered by College</h3>
              </div>
              <p className="text-xs text-gray-400">
                Foundational theory natively taught in your degree:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Data Structures', 'Algorithms', 'SQL Fundamentals', 'Operating Systems', 'Networking'].map((t, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#141738] text-gray-200 border border-emerald-500/30">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#0D0F22]/70 border border-white/10 space-y-4 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <h3 className="text-lg font-bold text-white font-display">Partially Covered</h3>
              </div>
              <p className="text-xs text-gray-400">
                Theoretical exposure in lab sessions without production depth:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Web Technology (HTML/CSS)', 'Software Engineering (Agile)', 'Basic Java / Python'].map((t, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#141738] text-gray-200 border border-amber-500/30">
                    ~ {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#0D0F22]/90 border border-futureViolet/40 space-y-4 shadow-future-card backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-futureViolet animate-pulse shadow-future-glow" />
                <h3 className="text-lg font-bold text-white font-display">Industry Skills Not Covered</h3>
              </div>
              <p className="text-xs text-gray-400">
                Critical employer requirements absent from college curricula:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Docker Containers', 'REST / GraphQL APIs', 'React State Management', 'CI/CD Pipelines', 'System Architecture'].map((t, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#1E1742] text-futureViolet border border-futureViolet/50">
                    ! {t}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 6. MULTI-AGENT AI ARCHITECTURE                                 */}
      {/* ============================================================== */}
      <section id="ai-agents" className="py-24 bg-[#090A15] text-[#F5F5F5] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-futureViolet font-bold flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-futureViolet" />
              05 // Multi-Agent AI System
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              Six Specialized AI Agents Collaborating.
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Not a single generic chatbot. ORBIT AI deploys an orchestration pipeline where specialized agents pass structured payloads to calculate your path.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: "01", name: "Skill Analysis Agent", role: "Quantify Proficiencies", desc: "Evaluates self-reported skills, projects, and diagnostic tests to assign verified proficiencies." },
              { num: "02", name: "Career Matching Agent", role: "Industry Benchmarking", desc: "Compares your skill inventory against employer requirements for 10+ high-demand tech roles." },
              { num: "03", name: "Roadmap Agent", role: "Personalized Sequencing", desc: "Synthesizes missing skills into practical, staged milestones with hands-on capstone projects." },
              { num: "04", name: "Recommendation Agent", role: "Curated Learning Assets", desc: "Recommends verified documentation, free tutorials, and practice repositories." },
              { num: "05", name: "AI Mentor Agent", role: "Real-time Guidance", desc: "Answers technical questions, clarifies college syllabus gaps, and explains architectural concepts." },
              { num: "06", name: "Progress Tracking Agent", role: "Adaptive Closed Loop", desc: "Monitors assessment scores and milestone completions, recalculating roadmaps dynamically." }
            ].map((agent, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-[#0D0F22]/70 border border-white/10 shadow-future-card space-y-3 hover:border-futureViolet/40 transition-all backdrop-blur-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-gray-400">{agent.num}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-futureViolet/20 text-futureViolet border border-futureViolet/40 font-semibold">Active Telemetry</span>
                </div>
                <h3 className="text-lg font-bold text-white font-display">{agent.name}</h3>
                <span className="text-xs font-mono text-futureBlue font-semibold block">{agent.role}</span>
                <p className="text-xs text-gray-400 leading-relaxed">{agent.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 7. AI MENTOR CONVERSATIONAL WORKSPACE                          */}
      {/* ============================================================== */}
      <section id="ai-mentor" className="py-24 bg-[#06060C] text-[#F5F5F5] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-futureBlue font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-futureBlue" />
              06 // Conversational Workspace
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
              An AI Mentor That Knows Your Full Academic Context.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Unlike ordinary chatbots, ORBIT AI Mentor has real-time access to your enrolled college subjects, verified skills, and roadmap stages.
            </p>
          </div>

          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#0D0F22]/90 border border-futureViolet/30 shadow-future-card space-y-6 backdrop-blur-xl">
            {/* Terminal Mock User Query */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-futureBlue to-futureViolet text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-future-glow">
                You
              </div>
              <div className="p-4 rounded-2xl bg-[#141738] border border-white/10 text-xs text-gray-200 max-w-xl">
                "How does my college Operating Systems subject help me become a Full Stack Developer?"
              </div>
            </div>

            {/* Terminal Mock Agent Response */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-[#1A1D40] border border-futureViolet/50 text-futureViolet flex items-center justify-center font-bold text-xs shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-[#090A18] border border-white/10 text-xs text-gray-300 leading-relaxed space-y-2 max-w-2xl">
                <p>
                  Your college OS course covers <strong>threads, processes, virtual memory, and I/O scheduling</strong>. In production Full Stack Development:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  <li><strong>Node.js Event Loop</strong> is built directly upon libuv's non-blocking I/O multiplexing.</li>
                  <li><strong>Docker Containers</strong> leverage Linux kernel cgroups and namespaces taught in OS theory.</li>
                </ul>
                <p className="text-futureBlue font-semibold">
                  Recommended Next Action: Complete the <em>Node.js Async Architecture</em> practical exercise in Stage 3 of your roadmap.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 text-xs">
              <span className="text-gray-400 self-center">Starter Queries:</span>
              {['"What skills do I have?"', '"What am I missing for my career?"', '"What should I learn next?"'].map((q, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-[#141738] text-gray-300 border border-white/10">
                  {q}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 8. REAL USER REGISTRATION & ONBOARDING (AUTHENTIC FIRST PAGE)  */}
      {/* ============================================================== */}
      <section id="onboard-form-section" className="py-24 bg-[#080914] text-[#F5F5F5] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-4 mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-futureViolet font-bold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-futureViolet animate-pulse shadow-future-glow" />
              07 // Real User Registration & Profile
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              Begin Your ORBIT AI CareerPath.
            </h2>
            <p className="text-sm text-gray-400">
              No demo profiles. Enter your actual academic and technical background to generate your authentic AI Career Universe.
            </p>
          </div>

          <div className="bg-[#0D0F22]/90 border border-futureViolet/30 rounded-3xl p-6 sm:p-10 shadow-future-card space-y-8 backdrop-blur-xl">
            
            {/* Step Progress Indicator */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center ${
                    activeStep === 1 
                      ? 'bg-gradient-to-r from-futureBlue to-futureViolet text-white shadow-future-glow' 
                      : 'bg-[#151838] border border-white/20 text-gray-400'
                  }`}
                >
                  01
                </button>
                <div>
                  <span className="text-xs font-bold text-white block">Identity & College</span>
                  <span className="text-[10px] text-gray-400 font-mono">Personal & Academic Setup</span>
                </div>
              </div>

              <div className="w-16 h-0.5 bg-gradient-to-r from-futureBlue/30 to-futureViolet/30 hidden sm:block" />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center ${
                    activeStep === 2 
                      ? 'bg-gradient-to-r from-futureBlue to-futureViolet text-white shadow-future-glow' 
                      : 'bg-[#151838] border border-white/20 text-gray-400'
                  }`}
                >
                  02
                </button>
                <div>
                  <span className="text-xs font-bold text-white block">Skills & Career Goal</span>
                  <span className="text-[10px] text-gray-400 font-mono">Competencies & Target</span>
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* STEP 1: PERSONAL & ACADEMIC INFORMATION */}
              {activeStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your personal or university email"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create secure password (minimum 6 characters)"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">College / Institution *</label>
                      <input
                        type="text"
                        required
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="Enter your college or university name"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Department / Branch *</label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science & Engineering"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Degree Program</label>
                      <select
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white focus:border-futureViolet focus:outline-none"
                      >
                        <option>Bachelor of Technology (B.Tech)</option>
                        <option>Bachelor of Engineering (B.E)</option>
                        <option>Bachelor of Computer Applications (BCA)</option>
                        <option>Master of Technology (M.Tech)</option>
                        <option>Master of Computer Applications (MCA)</option>
                        <option>B.Sc Computer Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Academic Year</label>
                      <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white focus:border-futureViolet focus:outline-none"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Recent Graduate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Current Semester</label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white focus:border-futureViolet focus:outline-none"
                      >
                        <option>Semester 1</option>
                        <option>Semester 2</option>
                        <option>Semester 3</option>
                        <option>Semester 4</option>
                        <option>Semester 5</option>
                        <option>Semester 6</option>
                        <option>Semester 7</option>
                        <option>Semester 8</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!fullName.trim() || !email.trim() || !college.trim()) {
                          setFormError("Please fill in your name, email, and college before proceeding.");
                          return;
                        }
                        setFormError(null);
                        setActiveStep(2);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-bold hover:shadow-future-glow transition-all flex items-center gap-2"
                    >
                      <span>Continue to Skills & Target Career</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SKILLS, TARGET CAREER & INTERESTS */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Target Career Goal */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Target Career Goal *</label>
                    <select
                      value={targetCareer}
                      onChange={(e) => setTargetCareer(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white focus:border-futureViolet focus:outline-none font-semibold"
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Resume Text Parser Option */}
                  <div className="p-4 rounded-2xl bg-[#141738]/60 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-futureViolet" />
                        <span className="text-xs font-bold text-white">Optional: Auto-Extract Skills from Resume</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowResumePaste(!showResumePaste)}
                        className="text-xs text-futureBlue hover:text-white font-semibold underline transition-colors"
                      >
                        {showResumePaste ? 'Hide' : 'Paste Resume Snippet'}
                      </button>
                    </div>

                    {showResumePaste && (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={3}
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          placeholder="Paste text snippets from your resume or skills summary..."
                          className="w-full p-2.5 rounded-xl bg-[#0B0D21] border border-white/10 text-xs text-white focus:border-futureViolet focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={parseQuickResume}
                          className="px-4 py-1.5 rounded-lg bg-futureViolet text-white text-xs font-semibold hover:bg-futureViolet/80 transition-colors"
                        >
                          Extract Detected Skills
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Technical Skills Tag Adder */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-gray-300">Current Technical Skills * (Type & Add)</label>
                      <span className="text-[11px] font-mono text-futureBlue">{skillsList.length} skills registered</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(e); }}
                        placeholder="Type a skill (e.g. Python, SQL, React, Git, Docker) and press Add"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-semibold hover:shadow-future-glow transition-all"
                      >
                        Add Skill
                      </button>
                    </div>

                    {/* Tag Cloud */}
                    <div className="flex flex-wrap gap-2 mt-3 min-h-[48px] p-3 rounded-xl bg-[#141738]/50 border border-white/10">
                      {skillsList.map((skill) => (
                        <span 
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-futureBlue/20 to-futureViolet/20 text-white text-xs font-medium border border-futureViolet/40 shadow-sm"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {skillsList.length === 0 && (
                        <span className="text-xs text-gray-400 italic self-center">
                          No skills added yet. Type a technical skill above and press Add.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Areas of Interest (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Areas of Interest (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddInterest(e); }}
                        placeholder="e.g. Distributed Systems, Neural Networks, Cloud Infrastructure"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddInterest}
                        className="px-4 py-2.5 rounded-xl bg-[#1C204A] border border-white/20 text-white text-xs font-semibold hover:bg-[#252A63]"
                      >
                        Add
                      </button>
                    </div>
                    {interestsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {interestsList.map(int => (
                          <span key={int} className="text-xs px-2.5 py-0.5 rounded-md bg-[#1C204A] text-gray-300 flex items-center gap-1">
                            {int}
                            <button type="button" onClick={() => handleRemoveInterest(int)}>
                              <X className="w-2.5 h-2.5 text-gray-400 hover:text-white" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex justify-between items-center border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-gray-300 hover:text-white hover:border-white transition-colors"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-bold hover:shadow-future-glow transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <span>{submitting ? 'Constructing Your ORBIT...' : 'Start Your AI CareerPath'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

            </form>

          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 9. FUTURISTIC FOOTER (Concept C)                               */}
      {/* ============================================================== */}
      <footer className="py-16 bg-[#040408] text-gray-400 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-futureBlue to-futureViolet text-white flex items-center justify-center font-black shadow-future-glow">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-white text-base font-display">ORBIT AI</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Autonomous AI-Powered Personalized Learning & Career Universe OS.
              </p>
              <span className="text-[11px] font-mono text-futureViolet block">
                PromptWars X RTC Hackathon 2026
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-white font-bold">Platform</h4>
              <ul className="space-y-1.5 text-xs">
                <li><button onClick={scrollToOnboarding} className="hover:text-white transition-colors">Skill Universe</button></li>
                <li><button onClick={scrollToOnboarding} className="hover:text-white transition-colors">Career Matching</button></li>
                <li><button onClick={scrollToOnboarding} className="hover:text-white transition-colors">College Mapping</button></li>
                <li><button onClick={scrollToOnboarding} className="hover:text-white transition-colors">Adaptive Roadmap</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-white font-bold">AI Agents</h4>
              <ul className="space-y-1.5 text-xs">
                <li>Skill Analysis Agent</li>
                <li>Career Matching Agent</li>
                <li>Learning Roadmap Agent</li>
                <li>Recommendation Agent</li>
                <li>AI Mentor Agent</li>
                <li>Progress Tracking Agent</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-white font-bold">Hackathon Stack</h4>
              <ul className="space-y-1.5 text-xs font-mono text-gray-400">
                <li>Python 3.14 FastAPI</li>
                <li>React 18 + Vite</li>
                <li>SQLite WAL Architecture</li>
                <li>Tailwind CSS + Recharts</li>
                <li>JWT HS256 RBAC</li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
            <span>© 2026 ORBIT AI – AI CareerPath. Built for PromptWars X RTC Hackathon.</span>
            <div className="flex gap-4">
              <span className="text-futureBlue">Zero Mock Profiles</span>
              <span>•</span>
              <span className="text-futureViolet">100% Real User Driven</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}