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

  // Real User Registration & Onboarding Form State (NO DEMO DATA)
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

  // Resume text parsing in onboarding
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
    e.preventDefault();
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
    e.preventDefault();
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
    e.preventDefault();
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
      "Docker", "AWS", "Git", "FastAPI", "Django", "Flask", "C++", "Java"
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
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans selection:bg-white selection:text-black">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Deep Black with Signature Orbital Universe)   */}
      {/* ============================================================== */}
      <section id="hero" className="relative pt-12 pb-24 overflow-hidden border-b border-[#202020]">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Hero Headline & Editorial Subtitle */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121212] border border-[#292929] text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>ORBIT AI • PromptWars X RTC Hackathon 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] font-display">
              YOUR FUTURE IS NOT A GUESS.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E0E0E0] to-[#71717A]">
                IT'S A PATH.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto font-light leading-relaxed">
              Discover your skills. Identify your gaps. Connect your college education with industry demands. Let autonomous AI agents guide your next move.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button 
                onClick={scrollToOnboarding}
                className="px-8 py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-[#E0E0E0] transition-all transform hover:-translate-y-0.5 shadow-glow flex items-center gap-2"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={scrollToOnboarding}
                className="px-8 py-3.5 rounded-xl bg-[#121212] border border-[#292929] text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#A1A1AA]" />
                <span>Explore Your Career</span>
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
      {/* 2. THE SKILL GAP PROBLEM (Editorial Pure White)                 */}
      {/* ============================================================== */}
      <section id="problem" className="py-24 bg-[#FFFFFF] text-[#111111] border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777] font-bold">
              01 // The Core Problem
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111111] font-display tracking-tight leading-tight">
              Why Traditional Learning Platforms Fail Students.
            </h2>
            <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
              Universities teach academic theory from static syllabi. Online platforms recommend identical video catalogs to everyone regardless of existing knowledge or target job requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#F9F9F9] border border-[#E8E8E8] space-y-4 hover:border-black transition-all">
              <span className="text-2xl font-black font-mono text-[#111111]">01</span>
              <h3 className="text-xl font-bold text-[#111111] font-display">No Individual Skill Context</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Platforms recommend beginner courses even when you have already mastered the fundamentals, wasting hundreds of hours on redundant lectures.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F9F9F9] border border-[#E8E8E8] space-y-4 hover:border-black transition-all">
              <span className="text-2xl font-black font-mono text-[#111111]">02</span>
              <h3 className="text-xl font-bold text-[#111111] font-display">The Academic Disconnect</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Students graduate having passed Database Management and Networks, yet lack practical experience with production tools like Docker, Redis, and CI/CD.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F9F9F9] border border-[#E8E8E8] space-y-4 hover:border-black transition-all">
              <span className="text-2xl font-black font-mono text-[#111111]">03</span>
              <h3 className="text-xl font-bold text-[#111111] font-display">No Autonomous Feedback Loop</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                When students struggle on technical assessments or change career ambitions, static course playlists cannot adapt, causing high dropout rates.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 3. MEET ORBIT AI & THE 3 CORE QUESTIONS (Editorial Soft White) */}
      {/* ============================================================== */}
      <section id="how-it-works" className="py-24 bg-[#F7F7F7] text-[#111111] border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777] font-bold">
              02 // The Solution
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111111] font-display tracking-tight">
              Three Questions ORBIT AI Solves For You.
            </h2>
            <p className="text-sm sm:text-base text-[#666666]">
              A continuous, closed-loop career navigation intelligence engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-8 rounded-3xl bg-white border border-[#E0E0E0] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-[#777777] uppercase font-bold block mb-1">Question 1</span>
                <h3 className="text-2xl font-extrabold text-[#111111] font-display">"What skills do I have?"</h3>
                <p className="text-xs text-[#666666] leading-relaxed mt-3">
                  ORBIT AI parses your technical history, academic courses, and diagnostic quizzes to isolate demonstrated proficiencies from assumptions.
                </p>
              </div>
              <div className="pt-4 border-t border-[#F0F0F0] text-xs font-mono text-black font-semibold flex items-center gap-1">
                <span>Skill Analysis Agent</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#E0E0E0] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold mb-6">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-[#777777] uppercase font-bold block mb-1">Question 2</span>
                <h3 className="text-2xl font-extrabold text-[#111111] font-display">"What skills am I missing?"</h3>
                <p className="text-xs text-[#666666] leading-relaxed mt-3">
                  Our Career Matching Agent evaluates your profile against real employer requirements, calculating precise percentage gaps and missing priorities.
                </p>
              </div>
              <div className="pt-4 border-t border-[#F0F0F0] text-xs font-mono text-black font-semibold flex items-center gap-1">
                <span>Career Matching Agent</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#E0E0E0] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold mb-6">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-[#777777] uppercase font-bold block mb-1">Question 3</span>
                <h3 className="text-2xl font-extrabold text-[#111111] font-display">"What should I learn next?"</h3>
                <p className="text-xs text-[#666666] leading-relaxed mt-3">
                  The Learning Roadmap Agent synthesizes your missing skills into sequenced, milestone-driven stages with exercises, documentation, and quizzes.
                </p>
              </div>
              <div className="pt-4 border-t border-[#F0F0F0] text-xs font-mono text-black font-semibold flex items-center gap-1">
                <span>Adaptive Roadmap Agent</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 4. SKILL INTELLIGENCE (Deep Black)                             */}
      {/* ============================================================== */}
      <section id="skill-intelligence" className="py-24 bg-[#101010] text-[#F5F5F5] border-b border-[#292929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-bold">
                03 // Skill Intelligence
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
                Objective Skill Evaluation, Not Guesses.
              </h2>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                ORBIT AI does not assume proficiency from buzzwords. Every technical skill is mapped through diagnostic assessments, project repositories, and college curriculum coverage.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { title: "Beginner", desc: "Core syntax, theoretical principles, simple scripts" },
                  { title: "Intermediate", desc: "Production APIs, relational databases, unit testing" },
                  { title: "Advanced", desc: "System architecture, distributed scalability, performance optimization" },
                ].map((lvl, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#161616] border border-[#262626] flex items-start gap-4">
                    <span className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{lvl.title}</h4>
                      <p className="text-xs text-[#A1A1AA]">{lvl.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar / Matrix Mock Preview */}
            <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-6 shadow-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-[#202020]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#71717A] block">Target Career Matrix</span>
                  <span className="text-sm font-bold text-white">Full Stack Developer Baseline</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white text-black text-xs font-mono font-bold">
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
                      <span className="text-[#D4D4D8]">{s.skill}</span>
                      <span className={s.pct < 50 ? 'text-amber-400' : 'text-emerald-400'}>{s.status} ({s.pct}%)</span>
                    </div>
                    <div className="w-full bg-[#202020] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${s.pct < 50 ? 'bg-amber-400' : 'bg-white'}`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] text-[11px] text-[#A1A1AA] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white shrink-0" />
                <span>ORBIT AI automatically prioritizes Docker and System Architecture in your personalized roadmap.</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 5. COLLEGE-TO-INDUSTRY MAPPING (Editorial Pure White)           */}
      {/* ============================================================== */}
      <section id="college-mapping" className="py-24 bg-[#FFFFFF] text-[#111111] border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777] font-bold">
              04 // Academic Bridge Engine
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111111] font-display tracking-tight leading-tight">
              Connect Your College Subjects with Industry Requirements.
            </h2>
            <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
              We extract subjects directly from your university curriculum or uploaded syllabus, isolating where college ends and industry preparation begins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-[#F9F9F9] border border-[#E8E8E8] space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="text-lg font-bold text-[#111111] font-display">Covered by College</h3>
              </div>
              <p className="text-xs text-[#666666]">
                Foundational theory natively taught in your degree:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Data Structures', 'Algorithms', 'SQL Fundamentals', 'Operating Systems', 'Networking'].map((t, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-white text-[#111111] border border-[#DCDCDC]">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#F9F9F9] border border-[#E8E8E8] space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <h3 className="text-lg font-bold text-[#111111] font-display">Partially Covered</h3>
              </div>
              <p className="text-xs text-[#666666]">
                Theoretical exposure in lab sessions without production depth:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Web Technology (HTML/CSS)', 'Software Engineering (Agile)', 'Basic Java / Python'].map((t, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-white text-[#111111] border border-[#DCDCDC]">
                    ~ {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-black text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <h3 className="text-lg font-bold text-white font-display">Industry Skills Not Covered</h3>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Critical employer requirements absent from college curricula:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Docker Containers', 'REST / GraphQL APIs', 'React State Management', 'CI/CD Pipelines', 'System Architecture'].map((t, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-[#202020] text-white border border-[#444444]">
                    ! {t}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 6. MULTI-AGENT AI ARCHITECTURE (Editorial Soft White)           */}
      {/* ============================================================== */}
      <section id="ai-agents" className="py-24 bg-[#F7F7F7] text-[#111111] border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777] font-bold">
              05 // Multi-Agent AI System
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111111] font-display tracking-tight">
              Six Specialized AI Agents Collaborating.
            </h2>
            <p className="text-sm sm:text-base text-[#666666]">
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
              <div key={idx} className="p-6 rounded-3xl bg-white border border-[#E0E0E0] shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-[#777777]">{agent.num}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-white font-semibold">Active</span>
                </div>
                <h3 className="text-lg font-bold text-[#111111] font-display">{agent.name}</h3>
                <span className="text-xs font-mono text-black font-semibold block">{agent.role}</span>
                <p className="text-xs text-[#666666] leading-relaxed">{agent.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 7. AI MENTOR CONVERSATIONAL WORKSPACE (Deep Black)             */}
      {/* ============================================================== */}
      <section id="ai-mentor" className="py-24 bg-[#0A0A0A] text-[#F5F5F5] border-b border-[#292929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-bold">
              06 // Conversational Workspace
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
              An AI Mentor That Knows Your Full Academic Context.
            </h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Unlike ordinary chatbots, ORBIT AI Mentor has real-time access to your enrolled college subjects, verified skills, and roadmap stages.
            </p>
          </div>

          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#121212] border border-[#292929] shadow-2xl space-y-6">
            {/* Sample Chat Message 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xs shrink-0">
                You
              </div>
              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-[#303030] text-xs text-[#E0E0E0] max-w-xl">
                "How does my college Operating Systems subject help me become a Full Stack Developer?"
              </div>
            </div>

            {/* Sample Chat Message 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-black border border-white text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] text-xs text-[#D4D4D8] leading-relaxed space-y-2 max-w-2xl">
                <p>
                  Your college OS course covers <strong>threads, processes, virtual memory, and I/O scheduling</strong>. In production Full Stack Development:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#A1A1AA]">
                  <li><strong>Node.js Event Loop</strong> is built directly upon libuv's non-blocking I/O multiplexing.</li>
                  <li><strong>Docker Containers</strong> leverage Linux kernel cgroups and namespaces taught in OS theory.</li>
                </ul>
                <p className="text-[#F5F5F5] font-semibold">
                  Recommended Next Action: Complete the <em>Node.js Async Architecture</em> practical exercise in Stage 3 of your roadmap.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#222222] flex flex-wrap gap-2 text-xs">
              <span className="text-[#71717A] self-center">Starter Queries:</span>
              {['"What skills do I have?"', '"What am I missing for my career?"', '"What should I learn next?"'].map((q, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-[#1A1A1A] text-[#A1A1AA] border border-[#262626]">
                  {q}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 8. REAL USER REGISTRATION & ONBOARDING (Editorial White & Dark) */}
      {/* ============================================================== */}
      <section id="onboard-form-section" className="py-24 bg-[#FFFFFF] text-[#111111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777] font-bold">
              07 // Real User Registration & Profile
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111111] font-display tracking-tight">
              Begin Your ORBIT AI CareerPath.
            </h2>
            <p className="text-sm text-[#555555]">
              No demo profiles. Enter your actual academic and technical background to generate your authentic AI Career Universe.
            </p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E0E0E0] rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">
            
            {/* Step Indicator */}
            <div className="flex items-center justify-between pb-6 border-b border-[#E8E8E8]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all ${
                    activeStep === 1 
                      ? 'bg-black text-white' 
                      : 'bg-white border border-[#CCCCCC] text-[#777777]'
                  }`}
                >
                  01
                </button>
                <div>
                  <span className="text-xs font-bold text-[#111111] block">Identity & College</span>
                  <span className="text-[10px] text-[#777777] font-mono">Personal & Academic Setup</span>
                </div>
              </div>

              <div className="w-12 h-px bg-[#CCCCCC]" />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all ${
                    activeStep === 2 
                      ? 'bg-black text-white' 
                      : 'bg-white border border-[#CCCCCC] text-[#777777]'
                  }`}
                >
                  02
                </button>
                <div>
                  <span className="text-xs font-bold text-[#111111] block">Skills & Career Goal</span>
                  <span className="text-[10px] text-[#777777] font-mono">Competencies & Target</span>
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* STEP 1: PERSONAL & ACADEMIC */}
              {activeStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Maya Patel"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D5D5] text-xs text-[#111111] focus:border-black focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="maya.patel@university.edu"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D5D5] text-xs text-[#111111] focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1.5">Password *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D5D5] text-xs text-[#111111] focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">College / Institution *</label>
                      <input
                        type="text"
                        required
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. National Institute of Tech"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D5D5] text-xs text-[#111111] focus:border-black focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">Department / Branch *</label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Computer Science & Engineering"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D5D5] text-xs text-[#111111] focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">Degree Program</label>
                      <select
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D5D5] text-xs text-[#111111] focus:border-black focus:outline-none"
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
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">Academic Year</label>
                      <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D5D5] text-xs text-[#111111] focus:border-black focus:outline-none"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Recent Graduate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">Current Semester</label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D5D5] text-xs text-[#111111] focus:border-black focus:outline-none"
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
                      className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-[#222222] transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <span>Continue to Skills & Target Career</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SKILLS, CAREER GOAL & RESUME EXTRACT */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Target Career Goal */}
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1.5">Target Career Goal *</label>
                    <select
                      value={targetCareer}
                      onChange={(e) => setTargetCareer(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D5D5] text-xs text-[#111111] focus:border-black focus:outline-none font-semibold"
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Resume Text Parser Option */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E0E0E0] space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-black" />
                        <span className="text-xs font-bold text-[#111111]">Optional: Paste Resume / Skills Text</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowResumePaste(!showResumePaste)}
                        className="text-xs text-black font-semibold underline"
                      >
                        {showResumePaste ? 'Hide' : 'Auto-Extract Skills'}
                      </button>
                    </div>

                    {showResumePaste && (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={3}
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          placeholder="Paste snippets from your resume or LinkedIn skills section..."
                          className="w-full p-2.5 rounded-xl bg-[#F9F9F9] border border-[#CCCCCC] text-xs text-[#111111] focus:border-black focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={parseQuickResume}
                          className="px-4 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-[#222222]"
                        >
                          Extract Detected Skills
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Technical Skills Tag Adder */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-[#111111]">Current Technical Skills * (Type & Add)</label>
                      <span className="text-[11px] font-mono text-[#777777]">{skillsList.length} skills added</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(e); }}
                        placeholder="e.g. Python, SQL, React, Git, Docker"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#D5D5D5] text-xs text-[#111111] focus:border-black focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-[#222222] transition-colors"
                      >
                        Add Skill
                      </button>
                    </div>

                    {/* Tag Cloud */}
                    <div className="flex flex-wrap gap-1.5 mt-3 min-h-[40px] p-2.5 rounded-xl bg-white border border-[#E0E0E0]">
                      {skillsList.map((skill) => (
                        <span 
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F0F0F0] text-black text-xs font-medium border border-[#D0D0D0]"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-[#777777] hover:text-black"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {skillsList.length === 0 && (
                        <span className="text-xs text-[#888888] italic self-center">
                          No skills added yet. Type a skill above and press Enter.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex justify-between items-center border-t border-[#E8E8E8]">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="px-4 py-2 rounded-xl border border-[#CCCCCC] text-xs font-semibold text-[#555555] hover:text-black hover:border-black transition-colors"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-[#222222] transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
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
      {/* 9. FOOTER (Deep Black)                                         */}
      {/* ============================================================== */}
      <footer className="py-16 bg-[#050505] text-[#A1A1AA] border-t border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#1A1A1A]">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black">
                  <Zap className="w-4 h-4 text-black" />
                </div>
                <span className="font-extrabold text-white text-base font-display">ORBIT AI</span>
              </div>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Autonomous AI-Powered Personalized Learning & Career Universe OS.
              </p>
              <span className="text-[11px] font-mono text-[#555555] block">
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
              <ul className="space-y-1.5 text-xs font-mono text-[#71717A]">
                <li>Python 3.14 FastAPI</li>
                <li>React 18 + Vite</li>
                <li>SQLite WAL Architecture</li>
                <li>Tailwind CSS + Recharts</li>
                <li>JWT HS256 RBAC</li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717A] gap-4">
            <span>© 2026 ORBIT AI – AI CareerPath. Built for PromptWars X RTC Hackathon.</span>
            <div className="flex gap-4">
              <span>Zero Mock Profiles</span>
              <span>•</span>
              <span>100% Real User Driven</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
