import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Search, 
  Star, 
  Clock, 
  Sparkles, 
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function ResourcesPage({ setActivePage }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.resources.list();
      setResources(res || []);
    } catch (err) {
      console.error("Resources fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleToggleSave = async (id) => {
    try {
      setSavingId(id);
      await api.resources.toggleSave(id);
      await fetchResources();
    } catch (err) {
      alert("Error bookmarking resource: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesType = filterType === 'All' 
      ? true 
      : filterType === 'Saved' 
        ? r.is_saved 
        : r.resource_type.toLowerCase() === filterType.toLowerCase();

    const matchesSearch = searchQuery === '' || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.provider.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  if (loading && resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#A1A1AA]">Curating Verified Learning Resources...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* 1. Header Banner */}
      <div className="pb-6 border-b border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Verified Learning & Project Library
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Curated by Learning Recommendation Agent. Real documentation, industry courses, and hands-on portfolio projects.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill or provider..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141414] border border-[#292929] text-xs text-white placeholder-[#71717A] focus:border-white focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Documentation', 'Course', 'Tutorial', 'Saved'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterType === type
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'bg-[#141414] text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1C] border border-[#292929]'
            }`}
          >
            {type} {type === 'Saved' && `(${resources.filter(r => r.is_saved).length})`}
          </button>
        ))}
      </div>

      {/* 3. Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div 
            key={res.id}
            className="p-6 rounded-2xl border border-[#262626] hover:border-white transition-all bg-[#101010] flex flex-col justify-between shadow-subtle hover:shadow-cardHover group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">
                  {res.provider}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleSave(res.id)}
                  disabled={savingId === res.id}
                  className="text-[#71717A] hover:text-white transition-colors"
                  title={res.is_saved ? "Remove bookmark" : "Save resource"}
                >
                  {res.is_saved ? (
                    <BookmarkCheck className="w-4 h-4 text-white" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1C1C1C] text-white font-semibold">
                  {res.skill_name}
                </span>
                <span className="text-[10px] font-mono text-[#71717A]">
                  {res.resource_type}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-white mb-2 leading-snug">
                {res.title}
              </h3>

              <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed mb-4">
                {res.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-[#71717A] font-mono">
                {res.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#A1A1AA]" /> {res.duration}
                  </span>
                )}
                {res.is_free ? (
                  <span className="text-emerald-400 font-semibold">Free Access</span>
                ) : (
                  <span>Verified</span>
                )}
              </div>

              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Study</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
