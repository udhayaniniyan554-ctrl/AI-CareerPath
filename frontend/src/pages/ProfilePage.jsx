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
  Sliders
} from 'lucide-react';

export default function ProfilePage({ setActivePage }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // New skill addition state
  const [skillInput, setSkillInput] = useState('');
  const [skillPct, setSkillPct] = useState(70);
  const [skillCategory, setSkillCategory] = useState('Technical');
  const [addingSkill, setAddingSkill] = useState(false);

  // Catalog search & autocomplete
  const [catalogSuggestions, setCatalogSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Inline skill editing state: { [skillId]: editedPct }
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editPctValue, setEditPctValue] = useState(50);
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
    { name: "TypeScript", category: "Programming Languages" },
    { name: "SQL", category: "Database" },
    { name: "React", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Docker", category: "DevOps" },
    { name: "Git", category: "DevOps" },
    { name: "C++", category: "Programming Languages" },
    { name: "HTML5", category: "Frontend" },
    { name: "CSS3", category: "Frontend" }
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

  // Autocomplete skill catalog search
  useEffect(() => {
    if (!skillInput.trim()) {
      setCatalogSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.skills.getCatalog(skillInput.trim(), '', 8);
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

  const handleAddSkill = async (e) => {
    if (e) e.preventDefault();
    const cleanName = skillInput.trim();
    if (!cleanName) return;

    try {
      setAddingSkill(true);
      setStatusMessage(null);
      await api.skills.addSkill(cleanName, Number(skillPct), skillCategory);
      setSkillInput('');
      setSkillPct(70);
      setShowSuggestions(false);
      
      // Refresh skills list & analysis
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
    setEditPctValue(skill.proficiency_percentage ?? skill.score ?? 50);
  };

  const handleSaveEdit = async (skillId, skillName) => {
    try {
      setSavingEdit(true);
      await api.skills.updateSkill(skillId, Number(editPctValue));
      setEditingSkillId(null);
      
      const updatedSkills = await api.skills.getUserSkills();
      setSkills(updatedSkills);
      await fetchAnalysis();

      setStatusMessage({
        type: 'success',
        text: `Proficiency for '${skillName}' updated to ${editPctValue}%.`
      });
    } catch (err) {
      alert("Failed to update proficiency: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Are you sure you want to remove '${skillName}' from your skill profile?`)) {
      return;
    }
    try {
      await api.skills.deleteSkill(skillId);
      const updatedSkills = await api.skills.getUserSkills();
      setSkills(updatedSkills);
      await fetchAnalysis();
      setStatusMessage({
        type: 'success',
        text: `Skill '${skillName}' removed.`
      });
    } catch (err) {
      alert("Error removing skill: " + err.message);
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
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
          Loading Your Personal Career Profile...
        </span>
      </div>
    );
  }

  // Calculate user's average proficiency percentage
  const avgProficiency = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + (s.proficiency_percentage ?? s.score ?? 50), 0) / skills.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* Top Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#292929]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center font-black text-2xl shadow-glow shrink-0">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white font-display">
                {user?.full_name || 'Student Profile'}
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-black font-bold">
                {user?.role || 'Student'}
              </span>
            </div>
            <p className="text-xs font-mono text-[#A1A1AA] flex items-center gap-1.5 mt-0.5" title={user?.email}>
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
              <span className="text-[#555]">•</span>
              <span className="text-white font-medium">User ID: #{user?.id}</span>
            </p>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-[#111111] border border-[#27272A] text-right">
            <span className="text-[10px] font-mono text-[#71717A] uppercase block">Saved Skills</span>
            <span className="text-sm font-bold text-white font-mono">{skills.length} Competencies</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#111111] border border-[#27272A] text-right">
            <span className="text-[10px] font-mono text-[#71717A] uppercase block">Avg Proficiency</span>
            <span className="text-sm font-bold text-white font-mono">{avgProficiency}%</span>
          </div>
          <button
            onClick={() => setActivePage('dashboard')}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      {/* Global Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' 
            : 'bg-red-950/40 border-red-800 text-red-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: USER-SPECIFIC TECHNICAL SKILLS MANAGEMENT (PRIMARY REQUIREMENT)  */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl border border-white/20 bg-[#0C0C0C] shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#222222] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-black font-black">
                CORE SYSTEM
              </span>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                User-Specific Technical Skills & Proficiency Engine
              </h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Every skill and percentage is saved strictly to your unique account ID. Search industry skills or add custom competencies with precise 0–100% proficiencies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchProfileAndSkills}
              className="p-2 rounded-xl bg-[#161616] border border-[#2B2B2B] text-[#A1A1AA] hover:text-white transition-colors"
              title="Refresh My Skills"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white">
              {skills.length} Skills Configured
            </span>
          </div>
        </div>

        {/* Add Skill Form with Autocomplete & Percentage Slider */}
        <form onSubmit={handleAddSkill} className="p-5 rounded-2xl bg-[#121212] border border-[#27272A] space-y-4">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add or Update Technical Skill</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 relative">
            
            {/* Skill Name with Autocomplete */}
            <div className="md:col-span-5 relative">
              <label className="block text-[11px] font-mono uppercase text-[#A1A1AA] mb-1">
                Skill Name (Search Catalog)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="e.g. Python, Java, SQL, React, Docker..."
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#181818] border border-[#303030] text-xs text-white placeholder-[#666] focus:border-white focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-3" />
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && catalogSuggestions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                  {catalogSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#252525] flex items-center justify-between transition-colors border-b border-[#242424] last:border-none"
                    >
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101010] text-[#A1A1AA] border border-[#2E2E33]">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Selector */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono uppercase text-[#A1A1AA] mb-1">
                Category
              </label>
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#303030] text-xs text-white focus:border-white focus:outline-none"
              >
                <option value="Programming Languages">Programming Languages</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="Cloud">Cloud</option>
                <option value="AI/ML">AI / Machine Learning</option>
                <option value="Data Science">Data Science</option>
                <option value="Security">Security</option>
                <option value="Engineering Foundations">Engineering Foundations</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Technical">Technical</option>
              </select>
            </div>

            {/* Proficiency Input & Level */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono uppercase text-[#A1A1AA]">
                  Proficiency %
                </label>
                <span className="text-[10px] font-mono font-bold text-white">
                  {skillPct}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={skillPct}
                onChange={(e) => setSkillPct(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#303030] text-xs text-white font-mono focus:border-white focus:outline-none"
              />
            </div>

            {/* Add Button */}
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={addingSkill || !skillInput.trim()}
                className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{addingSkill ? "Saving..." : "Save Skill"}</span>
              </button>
            </div>

          </div>

          {/* Range Slider for Intuitive Control */}
          <div className="pt-2 flex items-center gap-4">
            <span className="text-[10px] font-mono text-[#71717A] w-12 shrink-0">0% (Novice)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={skillPct}
              onChange={(e) => setSkillPct(Number(e.target.value))}
              className="w-full accent-white cursor-pointer h-1.5 bg-[#252525] rounded-lg"
            />
            <span className="text-[10px] font-mono text-[#71717A] w-14 shrink-0 text-right">100% (Expert)</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
              skillPct >= 80 ? 'bg-white text-black' : skillPct >= 45 ? 'bg-[#222224] text-white border border-[#38383D]' : 'bg-[#181818] text-[#888]'
            }`}>
              {skillPct >= 80 ? 'Advanced' : skillPct >= 45 ? 'Intermediate' : 'Beginner'}
            </span>
          </div>

          {/* Quick-Add Chips */}
          <div className="pt-2 border-t border-[#1F1F23]">
            <span className="text-[10px] font-mono uppercase text-[#71717A] block mb-1.5">
              Popular Industry Competencies (Click to auto-fill):
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
                        ? 'border-[#222] bg-[#101010] text-[#555]' 
                        : 'border-[#2D2D32] bg-[#161618] text-[#D4D4D8] hover:border-white hover:text-white'
                    }`}
                  >
                    <span>{ps.name}</span>
                    {alreadyHas && <Check className="w-2.5 h-2.5 text-[#555]" />}
                  </button>
                );
              })}
            </div>
          </div>

        </form>

        {/* ========================================================= */}
        {/* DISPLAY: SAVED USER SKILLS WITH VISUAL PROGRESS BARS & EDIT */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Your Active Skill Inventory ({skills.length})
            </span>
            <span className="text-[10px] font-mono text-[#71717A]">
              Click pencil to edit percentage • Trash to remove
            </span>
          </div>

          {skills.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#121212] border border-dashed border-[#2C2C30] text-center space-y-2">
              <Sliders className="w-8 h-8 text-[#555] mx-auto" />
              <h4 className="text-xs font-bold text-white">No skills added yet</h4>
              <p className="text-[11px] text-[#A1A1AA] max-w-sm mx-auto">
                Add skills with your actual proficiency percentages above to personalize your AI roadmap and orbital universe coordinates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skills.map((s) => {
                const pct = s.proficiency_percentage ?? s.score ?? 50;
                const isEditing = editingSkillId === s.id;

                return (
                  <div 
                    key={s.id}
                    className="p-4 rounded-2xl bg-[#121212] border border-[#242428] hover:border-[#383840] transition-all space-y-3"
                  >
                    {/* Top Row: Name, Category, Percentage Badge */}
                    <div className="flex items-center justify-between">
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate max-w-[150px]">
                            {s.skill_name}
                          </h4>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#1C1C1F] text-[#A1A1AA] border border-[#2D2D35]">
                            {s.category || 'Technical'}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono mt-0.5 inline-block ${
                          s.verified ? 'text-emerald-400 font-semibold' : 'text-[#71717A]'
                        }`}>
                          {s.verified ? '✓ Verified by Assessment' : s.proficiency || 'Self-Reported'}
                        </span>
                      </div>

                      {/* Percentage Badge & Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-mono font-black text-white px-2 py-0.5 rounded-lg bg-white/10 border border-white/20">
                          {pct}%
                        </span>
                        <button
                          type="button"
                          onClick={() => isEditing ? setEditingSkillId(null) : handleStartEdit(s)}
                          className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#1E1E22] transition-colors"
                          title="Edit Percentage"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(s.id, s.skill_name)}
                          className="p-1.5 rounded-lg text-[#71717A] hover:text-red-400 hover:bg-red-950/20 transition-colors"
                          title="Delete Skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-[#1F1F24] h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 80 
                              ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' 
                              : pct >= 50 
                                ? 'bg-[#CCCCCC]' 
                                : 'bg-[#777777]'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                        />
                      </div>
                    </div>

                    {/* Inline Edit Form when Active */}
                    {isEditing && (
                      <div className="pt-2 border-t border-[#222228] flex items-center gap-2 animate-fadeIn">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={editPctValue}
                          onChange={(e) => setEditPctValue(Number(e.target.value))}
                          className="flex-1 accent-white h-1.5 bg-[#252528] rounded cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-white w-9 text-right">
                          {editPctValue}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(s.id, s.skill_name)}
                          disabled={savingEdit}
                          className="px-2.5 py-1 rounded-lg bg-white text-black font-bold text-[10px] hover:bg-[#DDD] transition-colors"
                        >
                          {savingEdit ? "..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSkillId(null)}
                          className="px-2 py-1 rounded-lg border border-[#333] text-[#A1A1AA] text-[10px] hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* AUTHENTIC AI CAREER ANALYSIS CONNECTED TO ACTUAL SAVED SKILLS */}
        {/* ========================================================= */}
        {analysis && (
          <div className="mt-6 p-5 rounded-2xl bg-[#111114] border border-[#292930] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#222226]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Live AI Competency Breakdown for {analysis.target_career}
                </h3>
              </div>
              <span className="text-xs font-mono text-white font-semibold">
                {analysis.readiness_score}% Target Alignment
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Strong Skills */}
              <div className="p-3.5 rounded-xl bg-[#151518] border border-[#24242A] space-y-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                  ✓ Strong Skills (70%+)
                </span>
                <div className="space-y-1">
                  {analysis.strong_skills?.length > 0 ? (
                    analysis.strong_skills.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-white font-medium">{s.skill_name}</span>
                        <span className="text-[10px] font-mono font-bold text-white">{s.proficiency_percentage}%</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#71717A]">No 70%+ skills yet</span>
                  )}
                </div>
              </div>

              {/* Needs Improvement */}
              <div className="p-3.5 rounded-xl bg-[#151518] border border-[#24242A] space-y-2">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Needs Improvement (&lt;60%)
                </span>
                <div className="space-y-1">
                  {analysis.needs_improvement?.length > 0 ? (
                    analysis.needs_improvement.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-white font-medium">{s.skill_name}</span>
                        <span className="text-[10px] font-mono font-bold text-amber-300">{s.proficiency_percentage}%</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#71717A]">All skills above 60%</span>
                  )}
                </div>
              </div>

              {/* Missing Core Skills */}
              <div className="p-3.5 rounded-xl bg-[#151518] border border-[#24242A] space-y-2">
                <span className="text-[10px] font-mono uppercase text-red-400 font-bold block flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Missing for {analysis.target_career}
                </span>
                <div className="flex flex-wrap gap-1">
                  {analysis.missing_skills?.length > 0 ? (
                    analysis.missing_skills.slice(0, 4).map((sk, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101010] text-red-200 border border-red-900/40">
                        + {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-emerald-400">All core competencies covered!</span>
                  )}
                </div>
              </div>

            </div>

            {/* Recommended Project to Bridge Gap */}
            {analysis.recommended_projects?.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#141418] border border-[#282830] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#A1A1AA] font-bold block">
                    Recommended Milestone Project:
                  </span>
                  <h4 className="text-xs font-bold text-white">
                    {analysis.recommended_projects[0].title}
                  </h4>
                  <p className="text-[11px] text-[#A1A1AA] max-w-xl">
                    {analysis.recommended_projects[0].description}
                  </p>
                </div>
                <button
                  onClick={() => setActivePage('roadmap')}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E0E0E0] transition-colors shrink-0"
                >
                  View in Roadmap
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* SECTION: ACADEMIC PROFILE, TARGET CAREER & RESUME PARSER  */}
      {/* ========================================================= */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Target Career & Education Track */}
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222222]">
            <Briefcase className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Target Career Track & Academic Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">
                Target Career Track
              </label>
              <select
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <span className="text-[10px] text-[#71717A] mt-1 block">
                Changing target recalculates skill gaps across 6 AI agents.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">
                Self-Reported Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              >
                <option value="Beginner">Beginner (Foundations & Concepts)</option>
                <option value="Intermediate">Intermediate (Project Implementation)</option>
                <option value="Advanced">Advanced (Production-Grade Systems)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Apex Institute of Technology"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">
                Department / Major
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">
                Academic Year
              </label>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Postgraduate / Alumni</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">
                Degree / Qualification
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Resume & Syllabus Document Parser */}
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                AI Skill Extraction (Resume & Syllabus)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDocType('resume')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  docType === 'resume' ? 'bg-white text-black font-semibold' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Resume
              </button>
              <button
                type="button"
                onClick={() => setDocType('syllabus')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  docType === 'syllabus' ? 'bg-white text-black font-semibold' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                College Syllabus
              </button>
            </div>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Upload or paste your resume or syllabus text. The AI Document Parser extracts verified technical competencies directly into your profile.
          </p>

          {docSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white placeholder-[#555] font-mono focus:border-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleParseDocument}
              disabled={parsingDoc || !docText.trim()}
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors disabled:opacity-50"
            >
              {parsingDoc ? 'Extracting Skills with AI...' : `Parse & Import ${docType === 'resume' ? 'Resume' : 'Syllabus'}`}
            </button>
          </div>
        </div>

        {/* Portfolio, Certifications & Bio */}
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222222]">
            <FolderGit2 className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Portfolio Projects, Certifications & Bio
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Notable Projects (One per line)
              </label>
              <textarea
                rows={3}
                value={projectsText}
                onChange={(e) => setProjectsText(e.target.value)}
                placeholder="E-Commerce API built with FastAPI & PostgreSQL&#10;Full-stack Realtime Chat App using React & WebSockets"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white font-mono focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Certifications & Courses (One per line)
              </label>
              <textarea
                rows={2}
                value={certificationsText}
                onChange={(e) => setCertificationsText(e.target.value)}
                placeholder="AWS Certified Cloud Practitioner&#10;Meta React Specialization"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white font-mono focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Professional Bio & Career Aspirations
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your learning journey and career ambitions..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E0E0E0] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-black" />
            <span>{saving ? 'Saving Profile Details...' : 'Save Academic & Career Profile'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
