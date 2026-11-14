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
  AlertCircle 
} from 'lucide-react';

export default function ProfilePage({ setActivePage }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // New skill form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Beginner');

  // Input states for comma-separated or dynamic fields
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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.profile.get();
      setProfile(res.profile);
      setSkills(res.skills || []);

      setEducation(res.profile.education || '');
      setCollege(res.profile.college || '');
      setDepartment(res.profile.department || '');
      setCurrentYear(res.profile.current_year || '3rd Year');
      setTargetCareer(res.profile.target_career || 'Full Stack Developer');
      setExperienceLevel(res.profile.experience_level || 'Beginner');
      setBio(res.profile.bio || '');

      setCertificationsText((res.profile.certifications || []).join('\n'));
      setProjectsText((res.profile.projects || []).join('\n'));
      setCareerInterestsText((res.profile.career_interests || []).join(', '));
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
      await fetchProfile();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await api.profile.addSkill(newSkillName.trim(), newSkillProficiency);
      setNewSkillName('');
      await fetchProfile();
    } catch (err) {
      alert("Error adding skill: " + err.message);
    }
  };

  const handleDeleteSkill = async (skillName) => {
    try {
      await api.profile.deleteSkill(skillName);
      await fetchProfile();
    } catch (err) {
      alert("Error removing skill: " + err.message);
    }
  };

  const handleParseDocument = async (e) => {
    e.preventDefault();
    if (!docText.trim()) return;
    try {
      setParsingDoc(true);
      setDocSuccess(null);
      const res = await api.documents.parseText(docType, `${docType}_upload.txt`, docText);
      setDocSuccess(res.message);
      setDocText('');
      await fetchProfile();
    } catch (err) {
      alert("Document parsing failed: " + err.message);
    } finally {
      setParsingDoc(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#A1A1AA]">Loading Student Profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* Page Title */}
      <div className="pb-6 border-b border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Student Profile & Competencies
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Maintain your educational background, verified skill inventory, and target career aspiration.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800' 
            : 'bg-red-950/60 text-red-200 border-red-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        
        {/* Section 1: Career Goal & Target Track (Triggers Agent Recalculation) */}
        <div className="p-6 rounded-2xl border border-white bg-[#101010] shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#262626]">
            <Sparkles className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Primary Career Objective
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white mb-1.5">
                Target Career Track
              </label>
              <select
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#292929] text-xs font-medium focus:border-white focus:outline-none bg-[#141414] text-white"
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <span className="text-[10px] text-[#71717A] mt-1 block">
                Changing target automatically recalculates skill gaps across 6 AI agents.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1.5">
                Self-Assessed Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#292929] text-xs font-medium focus:border-white focus:outline-none bg-[#141414] text-white"
              >
                <option value="Beginner">Beginner (Foundations & Syntax)</option>
                <option value="Intermediate">Intermediate (Projects & Frameworks)</option>
                <option value="Advanced">Advanced (Production & Architecture)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Education & Academic Details */}
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#262626]">
            <GraduationCap className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Academic & Institutional Background
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Department / Specialization
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Degree / Qualification
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Bachelor of Science in Computer Science"
                className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Current Academic Year
              </label>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="Final Year">Final Year</option>
                <option value="Recent Graduate">Recent Graduate</option>
                <option value="Working Professional">Working Professional</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2.5: Resume & Syllabus Document Parser */}
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] space-y-4 shadow-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Smart Document & Resume Parser
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              Instant Skill Extraction
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Upload or paste your resume, syllabus, or course transcript. ORBIT AI automatically identifies and verifies technical skills to populate your profile.
          </p>

          {docSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs">
              ✓ {docSuccess}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="docType"
                  value="resume"
                  checked={docType === 'resume'}
                  onChange={() => setDocType('resume')}
                  className="accent-white"
                />
                <span>Resume / CV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="docType"
                  value="syllabus"
                  checked={docType === 'syllabus'}
                  onChange={() => setDocType('syllabus')}
                  className="accent-white"
                />
                <span>College Syllabus</span>
              </label>
            </div>

            <textarea
              rows={3}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Paste text from your Resume PDF or College Syllabus..."
              className="w-full p-3 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white placeholder-[#71717A] focus:border-white focus:outline-none font-mono"
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

        {/* Section 3: Technical Skills Inventory */}
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-white" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Technical Skills & Verified Badges
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#A1A1AA]">
              {skills.length} Competencies Listed
            </span>
          </div>

          {/* Existing Skills Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((s) => (
              <div 
                key={s.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#292929] bg-[#151515] text-xs font-medium text-white"
              >
                <span>{s.skill_name}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                  s.verified ? 'bg-white text-black' : 'bg-[#222222] text-[#A1A1AA]'
                }`}>
                  {s.verified ? '✓ Verified' : s.proficiency}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(s.skill_name)}
                  className="text-[#71717A] hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Skill Form */}
          <div className="pt-4 border-t border-[#222222] flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add skill (e.g. React, TypeScript, Docker)..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
            />
            <select
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>
        </div>

        {/* Section 4: Projects, Certifications & Bio */}
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222222]">
            <FolderGit2 className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Portfolio, Certifications & Bio
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Completed Projects (One per line)
              </label>
              <textarea
                rows={3}
                value={projectsText}
                onChange={(e) => setProjectsText(e.target.value)}
                placeholder="E-Commerce REST API with Python & SQLite&#10;Portfolio Single Page App with React & Tailwind"
                className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Certifications & Badges (One per line)
              </label>
              <textarea
                rows={2}
                value={certificationsText}
                onChange={(e) => setCertificationsText(e.target.value)}
                placeholder="Google IT Automation with Python&#10;CS50 Introduction to Computer Science"
                className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Professional Bio & Career Goals
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell AI Mentor about your engineering aspirations..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Ecosystem...' : 'Save & Recalibrate Platform'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
