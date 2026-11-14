import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Building2, 
  Calendar, 
  Code2, 
  Briefcase, 
  Save, 
  Plus, 
  X, 
  Award, 
  FolderGit2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Edit3,
  Trash2,
  Search,
  Check,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sliders,
  Clock,
  Layers,
  Target
} from 'lucide-react';

export default function ProfilePage({ setActivePage }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Manual skill entry state
  const [skillInput, setSkillInput] = useState('');
  const [skillPct, setSkillPct] = useState(75);
  const [skillCategory, setSkillCategory] = useState('Technical');
  const [addingSkill, setAddingSkill] = useState(false);

  // Search existing skills filter
  const [searchSkillsQuery, setSearchSkillsQuery] = useState('');

  // Catalog search & autocomplete helper (optional suggestions)
  const [catalogSuggestions, setCatalogSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Inline skill editing state (editing BOTH name and percentage)
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editSkillName, setEditSkillName] = useState('');
  const [editPctValue, setEditPctValue] = useState(50);
  const [editCategory, setEditCategory] = useState('Technical');
  const [savingEdit, setSavingEdit] = useState(false);

  // Authentic AI Skill Analysis
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Profile fields
  const [education, setEducation] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [currentYear, setCurrentYear] = useState('3rd Year');
  const [targetCareer, setTargetCareer] = useState('Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [bio, setBio] = useState('');
  const [certificationsText, setCertificationsText] = useState('');
  const [projectsText, setProjectsText] = useState('');
  const [careerInterestsText, setCareerInterestsText] = useState('');

  // Resume Document text parser
  const [docText, setDocText] = useState('');
  const [docType, setDocType] = useState('resume');
  const [parsingDoc, setParsingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState(null);

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

  const popularSkills = [
    { name: "Python", category: "Programming Languages" },
    { name: "Java", category: "Programming Languages" },
    { name: "JavaScript", category: "Programming Languages" },
    { name: "Communication", category: "Soft Skills" },
    { name: "Problem Solving", category: "Soft Skills" },
    { name: "React.js", category: "Frontend" },
    { name: "SQL", category: "Database" },
    { name: "Node.js", category: "Backend" },
    { name: "Docker", category: "DevOps" },
    { name: "Git", category: "DevOps" }
  ];

  const fetchProfileAndSkills = async () => {
    try {
      setLoading(true);
      const [profileRes, userSkillsRes] = await Promise.all([
        api.profile.get(),
        api.skills.getUserSkills()
      ]);

      setProfile(profileRes.profile);
      setSkills(userSkillsRes || profileRes.skills || []);

      setEducation(profileRes.profile.education || '');
      setCollege(profileRes.profile.college || '');
      setDepartment(profileRes.profile.department || '');
      setCurrentYear(profileRes.profile.current_year || '3rd Year');
      setTargetCareer(profileRes.profile.target_career || 'Full Stack Developer');
      setExperienceLevel(profileRes.profile.experience_level || 'Beginner');
      setBio(profileRes.profile.bio || '');

      setCertificationsText((profileRes.profile.certifications || []).join('\n'));
      setProjectsText((profileRes.profile.projects || []).join('\n'));
      setCareerInterestsText((profileRes.profile.career_interests || []).join(', '));

      // Fetch authentic skill analysis
      fetchAnalysis();
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const res = await api.skills.getAnalysis();
      setAnalysis(res);
    } catch (err) {
      console.error("Skill analysis fetch error:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    fetchProfileAndSkills();
  }, []);

  // Autocomplete skill catalog search helper
  useEffect(() => {
    if (!skillInput.trim()) {
      setCatalogSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.skills.getCatalog(skillInput.trim(), '', 6);
        setCatalogSuggestions(res || []);
      } catch {
        setCatalogSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [skillInput]);

  const handleSelectSuggestion = (item) => {
    setSkillInput(item.name);
    if (item.category) setSkillCategory(item.category);
    setShowSuggestions(false);
  };

  // Add custom or catalog skill manually
  const handleAddSkill = async (e) => {
    if (e) e.preventDefault();
    const cleanName = skillInput.trim();
    if (!cleanName) return;

    // Check duplicate skill for same user
    const existing = skills.find(s => s.skill_name?.trim().toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      setStatusMessage({
        type: 'error',
        text: `Duplicate Skill: '${existing.skill_name}' is already in your skills profile (currently at ${existing.proficiency_percentage ?? existing.score ?? 50}%). Edit its name or percentage below instead.`
      });
      return;
    }

    try {
      setAddingSkill(true);
      setStatusMessage(null);
      await api.skills.addSkill(cleanName, Number(skillPct), skillCategory);
      setSkillInput('');
      setSkillPct(75);
      setShowSuggestions(false);
      
      // Reload saved skills from backend
      const updatedSkills = await api.skills.getUserSkills();
      setSkills(updatedSkills);
      await fetchAnalysis();
      
      setStatusMessage({
        type: 'success',
        text: `Skill '${cleanName}' saved successfully with ${skillPct}% proficiency.`
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || "Failed to add skill." });
    } finally {
      setAddingSkill(false);
    }
  };

  const handleStartEdit = (skill) => {
    setEditingSkillId(skill.id);
    setEditSkillName(skill.skill_name);
    setEditPctValue(skill.proficiency_percentage ?? skill.score ?? 50);
    setEditCategory(skill.category || 'Technical');
  };

  const handleSaveEdit = async (skillId, originalSkillName) => {
    const cleanName = editSkillName.trim();
    if (!cleanName) {
      alert("Skill name cannot be empty.");
      return;
    }

    // Check duplicate if renaming
    if (cleanName.toLowerCase() !== originalSkillName.toLowerCase()) {
      const duplicate = skills.find(s => s.id !== skillId && s.skill_name?.trim().toLowerCase() === cleanName.toLowerCase());
      if (duplicate) {
        alert(`A skill named '${cleanName}' already exists in your profile. Duplicate skills are not allowed.`);
        return;
      }
    }

    try {
      setSavingEdit(true);
      await api.skills.updateSkill(skillId, {
        skill_name: cleanName,
        proficiency_percentage: Number(editPctValue),
        category: editCategory
      });
      setEditingSkillId(null);
      
      // Reload saved skills from backend
      const updatedSkills = await api.skills.getUserSkills();
      setSkills(updatedSkills);
      await fetchAnalysis();

      setStatusMessage({
        type: 'success',
        text: `Skill updated successfully to '${cleanName}' with ${editPctValue}% proficiency.`
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: "Failed to update skill: " + err.message });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Are you sure you want to delete '${skillName}' from your skill profile?`)) {
      return;
    }
    try {
      await api.skills.deleteSkill(skillId);
      const updatedSkills = await api.skills.getUserSkills();
      setSkills(updatedSkills);
      await fetchAnalysis();
      setStatusMessage({
        type: 'success',
        text: `Skill '${skillName}' was deleted successfully.`
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: "Error deleting skill: " + err.message });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage(null);

      const certs = certificationsText.split('\n').map(s => s.trim()).filter(Boolean);
      const projs = projectsText.split('\n').map(s => s.trim()).filter(Boolean);
      const interests = careerInterestsText.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        education,
        college,
        department,
        current_year: currentYear,
        target_career: targetCareer,
        experience_level: experienceLevel,
        bio,
        certifications: certs,
        projects: projs,
        career_interests: interests,
        technical_skills: skills.map(s => s.skill_name)
      };

      const res = await api.profile.update(payload);
      setStatusMessage({
        type: 'success',
        text: res.target_career_recalculated 
          ? "Profile saved! Target career changed; multi-agent pipeline recalibrated automatically."
          : "Profile details updated successfully."
      });
      await fetchProfileAndSkills();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleParseDocument = async () => {
    if (!docText.trim()) return;
    try {
      setParsingDoc(true);
      setDocSuccess(null);
      const res = await api.documents.parseText(
        docType,
        `${docType}_manual_upload.txt`,
        docText,
        { college, department }
      );
      setDocSuccess(`Parsed ${res.skills_extracted?.length || 0} skills from ${docType}.`);
      setDocText('');
      await fetchProfileAndSkills();
    } catch (err) {
      alert("Document parsing error: " + err.message);
    } finally {
      setParsingDoc(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-2 border-futureViolet border-t-transparent rounded-full animate-spin shadow-future-glow" />
        <span className="text-xs font-mono uppercase tracking-widest text-futureBlue">
          Loading Your Personal Career Profile...
        </span>
      </div>
    );
  }

  // Calculate user's average proficiency percentage
  const avgProficiency = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + (s.proficiency_percentage ?? s.score ?? 50), 0) / skills.length)
    : 0;

  // Filter skills by search query
  const filteredSkills = skills.filter(s => {
    if (!searchSkillsQuery.trim()) return true;
    const q = searchSkillsQuery.trim().toLowerCase();
    return (
      s.skill_name.toLowerCase().includes(q) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* Top Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-futureBlue to-futureViolet text-white flex items-center justify-center font-black text-2xl shadow-future-glow shrink-0">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white font-display">
                {user?.full_name || 'Student Profile'}
              </h1>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-futureViolet/20 text-futureViolet border border-futureViolet/40 font-bold">
                {user?.role || 'Student'}
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400 flex items-center gap-2 mt-1" title={user?.email}>
              <Mail className="w-3.5 h-3.5 text-futureBlue" />
              <span>{user?.email}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-300 font-medium">User ID: #{user?.id}</span>
            </p>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-2.5">
          <div className="px-4 py-2 rounded-xl bg-[#0D0F22]/90 border border-white/10 text-right backdrop-blur-xl">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Saved Skills</span>
            <span className="text-sm font-bold text-white font-mono">{skills.length} Competencies</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#0D0F22]/90 border border-white/10 text-right backdrop-blur-xl">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Avg Proficiency</span>
            <span className="text-sm font-bold text-futureBlue font-mono">{avgProficiency}%</span>
          </div>
          <button
            onClick={() => setActivePage('dashboard')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-bold hover:shadow-future-glow transition-all shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      {/* Global Status Alert Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' 
            : 'bg-red-950/60 border-red-500/50 text-red-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setStatusMessage(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: MANUAL USER SKILLS ENTRY & MANAGEMENT (CORE REQUIREMENT)         */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl border border-futureViolet/30 bg-[#0D0F22]/90 shadow-future-card space-y-6 relative overflow-hidden backdrop-blur-xl">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-futureViolet/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-futureViolet/20 text-futureViolet border border-futureViolet/40 font-black">
                CORE SYSTEM
              </span>
              <h2 className="text-base font-extrabold text-white tracking-tight font-display">
                My Skills – Custom Manual Skill Entry & Database Management
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Manually write ANY technical or soft skill with custom 0–100% proficiency. Saved directly to your isolated database profile.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchProfileAndSkills}
              className="p-2 rounded-xl bg-[#141738] border border-white/10 text-gray-400 hover:text-white transition-colors"
              title="Refresh My Skills"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-futureViolet/20 border border-futureViolet/40 text-white">
              {skills.length} Saved in DB
            </span>
          </div>
        </div>

        {/* 1. MANUAL SKILL ENTRY FORM */}
        <form onSubmit={handleAddSkill} className="p-5 rounded-2xl bg-[#141738]/60 border border-white/10 space-y-4">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-futureViolet" />
              <span>Manual Skill Entry</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400 normal-case">
              Enter any skill name (e.g. Python, Java, Communication, Problem Solving, React.js)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 relative">
            
            {/* Input: "Enter your skill" */}
            <div className="md:col-span-5 relative">
              <label className="block text-[11px] font-mono uppercase text-gray-300 mb-1 font-semibold">
                Enter your skill *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Enter your skill (e.g. Python, Java, Communication, React.js)"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#0A0B1A] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none transition-colors font-medium"
                />
                <Code2 className="w-3.5 h-3.5 text-futureBlue absolute left-2.5 top-3" />
              </div>

              {/* Optional Autocomplete Dropdown */}
              {showSuggestions && catalogSuggestions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-[#0D0F22] border border-futureViolet/40 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                  {catalogSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#1A1D40] flex items-center justify-between transition-colors border-b border-white/5 last:border-none"
                    >
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0A0B1A] text-futureViolet border border-futureViolet/30">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Selector */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono uppercase text-gray-300 mb-1 font-semibold">
                Category
              </label>
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0B1A] border border-white/10 text-xs text-white focus:border-futureViolet focus:outline-none transition-colors"
              >
                <option value="Programming Languages">Programming Languages</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="Cloud">Cloud</option>
                <option value="AI / Machine Learning">AI / Machine Learning</option>
                <option value="Data Science">Data Science</option>
                <option value="Security">Security</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Tools">Tools</option>
                <option value="Technical">Technical</option>
              </select>
            </div>

            {/* Proficiency Percentage Input (0–100) */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono uppercase text-gray-300 font-semibold">
                  Proficiency (0–100) *
                </label>
                <span className="text-[10px] font-mono font-bold text-futureBlue">
                  {skillPct}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={skillPct}
                onChange={(e) => setSkillPct(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0B1A] border border-white/10 text-xs text-white font-mono focus:border-futureViolet focus:outline-none"
              />
            </div>

            {/* Add Skill Button */}
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={addingSkill || !skillInput.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-bold hover:shadow-future-glow transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{addingSkill ? "Saving..." : "Add Skill"}</span>
              </button>
            </div>

          </div>

          {/* Interactive Range Slider */}
          <div className="pt-2 flex items-center gap-4">
            <span className="text-[10px] font-mono text-gray-400 w-12 shrink-0">0% (Novice)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={skillPct}
              onChange={(e) => setSkillPct(Number(e.target.value))}
              className="w-full accent-futureViolet cursor-pointer h-1.5 bg-[#1A1D36] rounded-lg"
            />
            <span className="text-[10px] font-mono text-gray-400 w-14 shrink-0 text-right">100% (Expert)</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
              skillPct >= 80 
                ? 'bg-futureViolet/30 text-futureViolet border border-futureViolet/50' 
                : skillPct >= 45 
                  ? 'bg-futureBlue/30 text-futureBlue border border-futureBlue/50' 
                  : 'bg-gray-800 text-gray-400'
            }`}>
              {skillPct >= 80 ? 'Advanced' : skillPct >= 45 ? 'Intermediate' : 'Beginner'}
            </span>
          </div>

          {/* Quick Click-to-Fill Example Chips */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1.5">
              Quick Examples (Click to auto-fill input):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularSkills.map((ps) => {
                const alreadyHas = skills.some(s => s.skill_name?.toLowerCase() === ps.name.toLowerCase());
                return (
                  <button
                    key={ps.name}
                    type="button"
                    onClick={() => {
                      setSkillInput(ps.name);
                      setSkillCategory(ps.category);
                    }}
                    className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                      alreadyHas 
                        ? 'border-white/5 bg-[#0A0B1A] text-gray-500' 
                        : 'border-white/10 bg-[#141738] text-gray-300 hover:border-futureViolet hover:text-white'
                    }`}
                  >
                    <span>{ps.name}</span>
                    {alreadyHas && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

        </form>

        {/* ========================================================= */}
        {/* 2. SEARCH & DISPLAY USER'S SAVED SKILLS IN DATABASE       */}
        {/* ========================================================= */}
        <div className="space-y-4 pt-2">
          
          {/* Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                Saved Skills Inventory ({skills.length})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DB Synchronized
              </span>
            </div>

            {/* Search Input for Existing Skills */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchSkillsQuery}
                onChange={(e) => setSearchSkillsQuery(e.target.value)}
                placeholder="Search existing skills..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              {searchSkillsQuery && (
                <button
                  type="button"
                  onClick={() => setSearchSkillsQuery('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {skills.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#141738]/40 border border-dashed border-white/10 text-center space-y-2">
              <Sliders className="w-8 h-8 text-gray-500 mx-auto" />
              <h4 className="text-xs font-bold text-white">No skills added yet</h4>
              <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                Enter your skills above with their proficiency percentages to initialize your personal career path and orbital visualization.
              </p>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#141738]/30 border border-white/10 text-center text-xs text-gray-400">
              No saved skills match "{searchSkillsQuery}". <button onClick={() => setSearchSkillsQuery('')} className="text-futureBlue underline ml-1">Clear search</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredSkills.map((s) => {
                const pct = s.proficiency_percentage ?? s.score ?? 50;
                const isEditing = editingSkillId === s.id;

                return (
                  <div 
                    key={s.id}
                    className="p-4 rounded-2xl bg-[#141738]/60 border border-white/10 hover:border-futureViolet/40 transition-all space-y-3"
                  >
                    {/* View Mode */}
                    {!isEditing ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white truncate max-w-[160px]">
                                {s.skill_name}
                              </h4>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#0A0B1A] text-futureBlue border border-futureBlue/30">
                                {s.category || 'Technical'}
                              </span>
                              <span className="text-[9px] font-mono text-gray-500">#{s.id}</span>
                            </div>
                            <span className={`text-[10px] font-mono mt-0.5 inline-block ${
                              s.verified ? 'text-emerald-400 font-semibold' : 'text-gray-400'
                            }`}>
                              {s.verified ? '✓ Verified by Assessment' : s.proficiency || 'Self-Reported'}
                            </span>
                          </div>

                          {/* Proficiency Badge & Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-mono font-black text-white px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-futureBlue/30 to-futureViolet/30 border border-futureViolet/40 shadow-sm">
                              {pct}%
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(s)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1D40] transition-colors"
                              title="Edit Skill Name and Proficiency"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(s.id, s.skill_name)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                              title="Delete Skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Individual Proficiency Progress Bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-[#1A1D36] h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct >= 80 
                                  ? 'bg-gradient-to-r from-futureBlue to-futureViolet shadow-future-glow' 
                                  : pct >= 45 
                                    ? 'bg-futureBlue' 
                                    : 'bg-gray-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                            />
                          </div>
                        </div>

                        {/* Record Timestamp Footer */}
                        <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 pt-1 border-t border-white/5">
                          <span>User ID: #{s.user_id}</span>
                          <span>Updated: {s.updated_at ? s.updated_at.split('T')[0] : 'Today'}</span>
                        </div>
                      </>
                    ) : (
                      /* Edit Mode: Edit Skill Name & Percentage */
                      <div className="space-y-3 p-1 animate-fadeIn">
                        <div className="text-[11px] font-mono uppercase text-futureViolet font-bold flex items-center justify-between">
                          <span>Editing Skill #{s.id}</span>
                          <span className="text-[10px] text-gray-400">Database Record Update</span>
                        </div>

                        {/* Edit Skill Name Input */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-gray-300 mb-1">
                            Edit Skill Name
                          </label>
                          <input
                            type="text"
                            value={editSkillName}
                            onChange={(e) => setEditSkillName(e.target.value)}
                            placeholder="Skill name"
                            className="w-full px-3 py-1.5 rounded-xl bg-[#0A0B1A] border border-futureViolet/40 text-xs text-white focus:outline-none"
                          />
                        </div>

                        {/* Edit Category */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-gray-300 mb-1">
                            Edit Category
                          </label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-[#0A0B1A] border border-white/10 text-xs text-white focus:outline-none"
                          >
                            <option value="Programming Languages">Programming Languages</option>
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="Database">Database</option>
                            <option value="DevOps">DevOps</option>
                            <option value="Cloud">Cloud</option>
                            <option value="AI / Machine Learning">AI / Machine Learning</option>
                            <option value="Soft Skills">Soft Skills</option>
                            <option value="Technical">Technical</option>
                          </select>
                        </div>

                        {/* Edit Percentage Slider & Number */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-mono uppercase text-gray-300">
                              Edit Proficiency Percentage
                            </label>
                            <span className="text-xs font-mono font-bold text-futureBlue">
                              {editPctValue}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={editPctValue}
                              onChange={(e) => setEditPctValue(Number(e.target.value))}
                              className="flex-1 accent-futureViolet h-1.5 bg-[#1A1D36] rounded cursor-pointer"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editPctValue}
                              onChange={(e) => setEditPctValue(Math.max(0, Math.min(100, Number(e.target.value))))}
                              className="w-16 px-2 py-1 rounded-lg bg-[#0A0B1A] border border-white/10 text-xs text-white font-mono text-center"
                            />
                          </div>
                        </div>

                        {/* Save Changes and Cancel Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => setEditingSkillId(null)}
                            className="px-3 py-1.5 rounded-xl border border-white/10 text-gray-400 text-xs hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(s.id, s.skill_name)}
                            disabled={savingEdit || !editSkillName.trim()}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white font-bold text-xs hover:shadow-future-glow transition-all flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingEdit ? "Updating DB..." : "Save Changes"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* AUTHENTIC AI CAREER ANALYSIS CONNECTED TO SAVED SKILLS    */}
        {/* ========================================================= */}
        {analysis && (
          <div className="mt-6 p-5 rounded-2xl bg-[#141738]/50 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-futureViolet animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Telemetry Breakdown for {analysis.target_career}
                </h3>
              </div>
              <span className="text-xs font-mono text-futureBlue font-semibold">
                {analysis.career_readiness_percentage ?? analysis.readiness_score ?? 0}% Alignment
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Matched Skills */}
              <div className="p-3.5 rounded-xl bg-[#0D0F22]/90 border border-emerald-500/30 space-y-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                  ✓ Matched Competencies ({analysis.matched_skills_count ?? 0})
                </span>
                <div className="space-y-1">
                  {(analysis.matched_skills || []).length > 0 ? (
                    analysis.matched_skills.slice(0, 4).map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-white font-medium">{s.skill_name}</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400">{s.score}%</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-gray-500">No matching skills yet</span>
                  )}
                </div>
              </div>

              {/* Missing Core Skills */}
              <div className="p-3.5 rounded-xl bg-[#0D0F22]/90 border border-futureViolet/30 space-y-2">
                <span className="text-[10px] font-mono uppercase text-futureViolet font-bold block flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-futureViolet" /> Missing ({analysis.missing_skills_count ?? 0})
                </span>
                <div className="flex flex-wrap gap-1">
                  {(analysis.missing_skills || []).length > 0 ? (
                    analysis.missing_skills.slice(0, 5).map((sk, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0A0B1A] text-futureViolet border border-futureViolet/40">
                        + {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-emerald-400">All target skills registered!</span>
                  )}
                </div>
              </div>

              {/* All Saved Competencies */}
              <div className="p-3.5 rounded-xl bg-[#0D0F22]/90 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase text-gray-300 font-bold block">
                  Total Saved Profile Skills
                </span>
                <div className="text-2xl font-black text-white font-mono">
                  {skills.length}
                </div>
                <span className="text-[10px] text-gray-400 block">
                  Average competency: {avgProficiency}%
                </span>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* SECTION: ACADEMIC PROFILE, TARGET CAREER & RESUME PARSER  */}
      {/* ========================================================= */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Target Career & Education Track */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#0D0F22]/80 shadow-future-card space-y-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Briefcase className="w-4 h-4 text-futureBlue" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Target Career Track & Academic Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Target Career Track
              </label>
              <select
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white focus:border-futureViolet focus:outline-none"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <span className="text-[10px] text-gray-500 mt-1 block">
                Changing target recalculates skill gaps across 6 AI agents.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Self-Reported Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white focus:border-futureViolet focus:outline-none"
              >
                <option value="Beginner">Beginner (Foundations & Concepts)</option>
                <option value="Intermediate">Intermediate (Project Implementation)</option>
                <option value="Advanced">Advanced (Production-Grade Systems)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="Enter your college or university"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Department / Major
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Academic Year
              </label>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white focus:border-futureViolet focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Postgraduate / Alumni</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Degree / Qualification
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. Bachelor of Technology (B.Tech)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-futureViolet focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Resume & Syllabus Document Parser */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#0D0F22]/80 shadow-future-card space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-futureViolet" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                AI Skill Extraction (Resume & Syllabus)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDocType('resume')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  docType === 'resume' ? 'bg-gradient-to-r from-futureBlue to-futureViolet text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Resume
              </button>
              <button
                type="button"
                onClick={() => setDocType('syllabus')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  docType === 'syllabus' ? 'bg-gradient-to-r from-futureBlue to-futureViolet text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                College Syllabus
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Upload or paste your resume or syllabus text. The AI Document Parser extracts technical competencies directly into your profile.
          </p>

          {docSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{docSuccess}</span>
            </div>
          )}

          <div className="space-y-3">
            <textarea
              rows={4}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder={`Paste your ${docType} contents here (e.g. project descriptions, coursework, syllabus modules)...`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white placeholder-gray-500 font-mono focus:border-futureViolet focus:outline-none"
            />
            <button
              type="button"
              onClick={handleParseDocument}
              disabled={parsingDoc || !docText.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-bold hover:shadow-future-glow transition-all disabled:opacity-50"
            >
              {parsingDoc ? 'Extracting Skills with AI...' : `Parse & Import ${docType === 'resume' ? 'Resume' : 'Syllabus'}`}
            </button>
          </div>
        </div>

        {/* Portfolio, Certifications & Bio */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#0D0F22]/80 shadow-future-card space-y-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <FolderGit2 className="w-4 h-4 text-futureBlue" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Portfolio Projects, Certifications & Bio
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Notable Projects (One per line)
              </label>
              <textarea
                rows={3}
                value={projectsText}
                onChange={(e) => setProjectsText(e.target.value)}
                placeholder="E-Commerce API built with FastAPI & PostgreSQL&#10;Full-stack Realtime Chat App using React & WebSockets"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white font-mono focus:border-futureViolet focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Certifications & Courses (One per line)
              </label>
              <textarea
                rows={2}
                value={certificationsText}
                onChange={(e) => setCertificationsText(e.target.value)}
                placeholder="AWS Certified Cloud Practitioner&#10;Meta React Specialization"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white font-mono focus:border-futureViolet focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Professional Bio & Career Aspirations
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your learning journey and career ambitions..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141738] border border-white/10 text-xs text-white focus:border-futureViolet focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-futureBlue to-futureViolet text-white text-xs font-bold hover:shadow-future-glow transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{saving ? 'Saving Profile Details...' : 'Save Academic & Career Profile'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}