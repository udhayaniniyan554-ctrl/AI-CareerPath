import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import RoadmapPage from './pages/RoadmapPage';
import CollegeMappingPage from './pages/CollegeMappingPage';
import SkillUniversePage from './pages/SkillUniversePage';
import AssessmentsPage from './pages/AssessmentsPage';
import MentorPage from './pages/MentorPage';
import ResourcesPage from './pages/ResourcesPage';
import AgentVisualizerPage from './pages/AgentVisualizerPage';
import AdminPage from './pages/AdminPage';
import { api } from './api';

export default function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [careerGoal, setCareerGoal] = useState('Full Stack Developer');
  const [readinessScore, setReadinessScore] = useState(72);

  // If user logs in, default to dashboard if on landing
  useEffect(() => {
    if (user && activePage === 'landing') {
      setActivePage('dashboard');
    }
    if (!user && activePage !== 'landing') {
      setActivePage('landing');
    }
  }, [user]);

  // Fetch quick metrics for sidebar
  useEffect(() => {
    if (user) {
      api.dashboard.getSummary()
        .then(res => {
          if (res?.selected_career_goal) setCareerGoal(res.selected_career_goal);
          if (res?.career_readiness_percentage !== undefined) setReadinessScore(res.career_readiness_percentage);
        })
        .catch(() => {});
    }
  }, [user, activePage]);

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setActivePage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
          Booting ORBIT AI OS...
        </span>
      </div>
    );
  }

  const isAuthView = !!user && activePage !== 'landing';

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* Top Navbar */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onOpenAuth={handleOpenAuth} 
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex">
        
        {/* Dark Sidebar (Only when logged in on authenticated views) */}
        {isAuthView && (
          <Sidebar 
            activePage={activePage} 
            setActivePage={setActivePage} 
            careerGoal={careerGoal}
            readinessScore={readinessScore}
          />
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden bg-[#050505]">
          {activePage === 'landing' && (
            <LandingPage 
              onRegistrationSuccess={handleAuthSuccess}
              onGetStarted={() => user ? setActivePage('dashboard') : handleOpenAuth('register')}
              onExploreCareers={() => user ? setActivePage('dashboard') : handleOpenAuth('login')}
            />
          )}

          {/* Protected Navigation Guard */}
          {!user && activePage !== 'landing' && (
            <div className="max-w-md mx-auto my-24 p-8 rounded-2xl bg-[#101010] border border-[#27272A] text-center space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white text-black font-extrabold flex items-center justify-center mx-auto text-sm">!</div>
              <h3 className="text-base font-bold text-white">Protected Platform Section</h3>
              <p className="text-xs text-[#A1A1AA]">Please sign in with your student credentials to view your personalized roadmap and career universe.</p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E0E0E0] transition-colors shadow-sm"
              >
                Sign In to Access
              </button>
            </div>
          )}

          {activePage === 'dashboard' && user && <DashboardPage setActivePage={setActivePage} />}
          {activePage === 'profile' && user && <ProfilePage setActivePage={setActivePage} />}
          {activePage === 'skill-universe' && user && <SkillUniversePage setActivePage={setActivePage} />}
          {activePage === 'college-mapping' && user && <CollegeMappingPage setActivePage={setActivePage} />}
          {activePage === 'roadmap' && user && <RoadmapPage setActivePage={setActivePage} />}
          {activePage === 'assessments' && user && <AssessmentsPage setActivePage={setActivePage} />}
          {activePage === 'mentor' && user && <MentorPage setActivePage={setActivePage} />}
          {activePage === 'resources' && user && <ResourcesPage setActivePage={setActivePage} />}
          {activePage === 'agents' && user && <AgentVisualizerPage />}
          {activePage === 'admin' && user && <AdminPage setActivePage={setActivePage} />}
        </main>

      </div>

      {/* Login & Register Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />

    </div>
  );
}
