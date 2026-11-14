import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  GraduationCap, 
  BookOpen, 
  ArrowRight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  FileText, 
  RefreshCw,
  Building2,
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function CollegeMappingPage({ setActivePage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState('');
  const [newSemester, setNewSemester] = useState('Semester 5');
  const [syllabusText, setSyllabusText] = useState('');
  const [showSyllabusInput, setShowSyllabusInput] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchMapping = async () => {
    try {
      setLoading(true);
      const res = await api.curriculum.getMapping();
      setData(res);
    } catch (err) {
      console.error("Failed to load college course mapping:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapping();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      setSubmitting(true);
      await api.curriculum.addSubject({
        subject_name: newSubject.trim(),
        semester: newSemester
      });
      setNewSubject('');
      await fetchMapping();
    } catch (err) {
      alert("Error adding subject: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await api.curriculum.deleteSubject(id);
      await fetchMapping();
    } catch (err) {
      alert("Error removing subject: " + err.message);
    }
  };

  const handleParseSyllabus = async (e) => {
    e.preventDefault();
    if (!syllabusText.trim()) return;
    try {
      setParsing(true);
      await api.curriculum.parseSyllabus(syllabusText, newSemester);
      setSyllabusText('');
      setShowSyllabusInput(false);
      await fetchMapping();
    } catch (err) {
      alert("Error parsing syllabus: " + err.message);
    } finally {
      setParsing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#A1A1AA]">Mapping College Subjects to Industry Skills...</span>
      </div>
    );
  }

  const { target_career, college, department, current_year, semester, coverage_percentage, subjects, categories, summary } = data || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* 1. Header Banner */}
      <div className="p-6 rounded-2xl border border-[#292929] bg-[#101010] shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-black font-bold">
              Curriculum Engine
            </span>
            <span className="text-xs font-mono text-[#A1A1AA]">
              {college || 'University'} • {department || 'Engineering'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            College Course to Industry Skill Mapping
          </h1>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            {summary}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">
              {coverage_percentage}%
            </span>
            <span className="text-xs font-mono text-[#A1A1AA]">
              Curriculum Alignment
            </span>
          </div>

          <div className="w-48 bg-[#202020] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-700"
              style={{ width: `${coverage_percentage}%` }}
            />
          </div>

          <button
            onClick={() => setActivePage('roadmap')}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Bridge Gaps with AI Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Three-Tier Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Category 1: Covered by College */}
        <div className="p-6 rounded-2xl border border-[#292929] bg-[#151515] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-white">Covered by College</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#202020] text-emerald-400 font-semibold">
              {categories?.covered_by_college?.length || 0} Skills
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA]">
            Skills natively addressed in standard university course syllabi.
          </p>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {categories?.covered_by_college?.map((sk, idx) => (
              <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-[#101010] text-[#E0E0E0] border border-[#262626]">
                ✓ {sk}
              </span>
            ))}
            {(!categories?.covered_by_college || categories.covered_by_college.length === 0) && (
              <span className="text-xs text-[#71717A]">No fully covered skills mapped.</span>
            )}
          </div>
        </div>

        {/* Category 2: Partially Covered */}
        <div className="p-6 rounded-2xl border border-[#292929] bg-[#151515] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-white">Partially Covered</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#202020] text-amber-400 font-semibold">
              {categories?.partially_covered?.length || 0} Skills
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA]">
            Theory is introduced in college, but practical production depth is missing.
          </p>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {categories?.partially_covered?.map((sk, idx) => (
              <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-[#101010] text-[#E0E0E0] border border-[#262626]">
                ~ {sk}
              </span>
            ))}
            {(!categories?.partially_covered || categories.partially_covered.length === 0) && (
              <span className="text-xs text-[#71717A]">None identified.</span>
            )}
          </div>
        </div>

        {/* Category 3: Additional Industry Skills Not Covered (THE GAP) */}
        <div className="p-6 rounded-2xl border-2 border-white bg-[#151515] space-y-4 shadow-glow">
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <h3 className="text-sm font-bold text-white">Industry Skills Not Covered</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-black font-bold">
              {categories?.industry_gap_not_covered?.length || 0} Gaps
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA]">
            Crucial employer requirements for <strong>{target_career}</strong> that are completely absent from college.
          </p>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {categories?.industry_gap_not_covered?.map((sk, idx) => (
              <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-black text-white border border-[#444444] font-semibold">
                ! {sk}
              </span>
            ))}
            {(!categories?.industry_gap_not_covered || categories.industry_gap_not_covered.length === 0) && (
              <span className="text-xs text-emerald-400">Zero missing gaps detected!</span>
            )}
          </div>
        </div>

      </div>

      {/* 3. Subject List & Curriculum Parser */}
      <div className="p-6 rounded-2xl border border-[#292929] bg-[#151515] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
          <div>
            <h3 className="text-base font-bold text-white">Enrolled College Subjects & Syllabus Topics</h3>
            <span className="text-xs text-[#A1A1AA]">
              Each subject is automatically evaluated against real industry skill requirements.
            </span>
          </div>

          <button
            onClick={() => setShowSyllabusInput(!showSyllabusInput)}
            className="px-3.5 py-1.5 rounded-xl border border-[#333333] hover:border-white text-xs font-medium text-white bg-[#101010] transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showSyllabusInput ? 'Close Parser' : 'Paste / Parse Syllabus PDF Text'}</span>
          </button>
        </div>

        {/* Syllabus Text Parser Drawer */}
        {showSyllabusInput && (
          <form onSubmit={handleParseSyllabus} className="p-5 rounded-xl border border-[#333333] bg-[#0A0A0A] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white font-semibold">
                Syllabus Topic Extractor
              </span>
              <span className="text-[10px] font-mono text-[#A1A1AA]">
                Paste course syllabus lines or exam modules
              </span>
            </div>
            <textarea
              rows={4}
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              placeholder="Module 1: Binary Search Trees and Graph Traversals&#10;Module 2: Relational Normalization & SQL Triggers&#10;Module 3: Asynchronous Web Client & RESTful Services"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#292929] bg-[#151515] text-white text-xs font-mono focus:border-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSyllabusInput(false)}
                className="px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={parsing || !syllabusText.trim()}
                className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors disabled:opacity-50"
              >
                {parsing ? 'Parsing Topics...' : 'Extract & Map to Skills'}
              </button>
            </div>
          </form>
        )}

        {/* Add Subject Inline Form */}
        <form onSubmit={handleAddSubject} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Add college subject (e.g. Distributed Systems, Cloud Computing)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#292929] bg-[#101010] text-xs text-white focus:border-white focus:outline-none"
          />
          <select
            value={newSemester}
            onChange={(e) => setNewSemester(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-[#292929] bg-[#101010] text-xs text-white focus:border-white focus:outline-none"
          >
            {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting || !newSubject.trim()}
            className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </form>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects?.map((sub) => (
            <div key={sub.id} className="p-4 rounded-xl border border-[#262626] bg-[#101010] flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202020] text-[#A1A1AA]">
                    {sub.semester || 'Semester'}
                  </span>
                  <h4 className="text-xs font-bold text-white">{sub.subject_name}</h4>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {sub.matched_skills?.map((sk, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteSubject(sub.id)}
                className="text-[#71717A] hover:text-red-400 p-1"
                title="Remove subject"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
