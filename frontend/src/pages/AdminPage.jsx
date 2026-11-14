import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  Compass, 
  Activity, 
  BookOpen, 
  RefreshCw, 
  Briefcase, 
  Search,
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';

export default function AdminPage({ setActivePage }) {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [careerRoles, setCareerRoles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchUser, setSearchUser] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [st, uList, rList, lList] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.admin.getCareerRoles(),
        api.admin.getLogs()
      ]);
      setStats(st);
      setUsers(uList || []);
      setCareerRoles(rList || []);
      setLogs(lList || []);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl border border-red-900 bg-red-950/40 text-red-200 text-center space-y-4">
        <ShieldCheck className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-[#A1A1AA]">
          The Admin Command Center is reserved for platform administrators. Log in with an admin credential to manage users and roles.
        </p>
        <button
          onClick={() => setActivePage('dashboard')}
          className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-semibold hover:bg-[#E0E0E0]"
        >
          Return to Student Dashboard
        </button>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#A1A1AA]">Loading Admin Analytics & Permissions...</span>
      </div>
    );
  }

  const { overview, career_distribution } = stats || {};

  const filteredUsers = users.filter(u => 
    searchUser === '' ||
    u.full_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.target_career?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* 1. Header */}
      <div className="pb-6 border-b border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-mono uppercase font-bold">
              Restricted Console
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">RBAC Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-display">
            Platform Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Manage student records, industry career profiles, skill benchmarks, and inspect multi-agent orchestration logs.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-1.5 rounded-xl border border-[#292929] hover:border-white text-xs font-medium text-white bg-[#101010] transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 2. Top Analytics Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Students", value: overview?.total_students || 0, icon: Users },
          { label: "Assessments Taken", value: overview?.total_assessments_taken || 0, icon: Award },
          { label: "Avg Score", value: `${overview?.avg_assessment_score || 0}%`, icon: Sparkles },
          { label: "Active Roadmaps", value: overview?.active_roadmaps || 0, icon: Compass },
          { label: "Agent Invocations", value: overview?.total_agent_orchestrations || 0, icon: Activity },
          { label: "Avg Agent Latency", value: `${overview?.avg_agent_latency_ms || 0}ms`, icon: Clock },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="p-4 rounded-xl border border-[#262626] bg-[#101010] shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#71717A] uppercase font-semibold">{stat.label}</span>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-xl font-bold font-mono text-white">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
        {[
          { id: 'overview', label: 'Career Analytics', count: career_distribution?.length },
          { id: 'users', label: 'Student Accounts', count: users.length },
          { id: 'roles', label: 'Career Benchmarks', count: careerRoles.length },
          { id: 'logs', label: 'Agent Audit Stream', count: logs.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-black shadow-sm font-bold'
                : 'text-[#A1A1AA] hover:bg-[#151515] hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              activeTab === tab.id ? 'bg-black text-white' : 'bg-[#202020] text-[#A1A1AA]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 4. Tab Views */}
      {activeTab === 'overview' && (
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-white">Student Career Distribution</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {career_distribution?.map((cd, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#262626] bg-[#151515] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{cd.target_career || "Unassigned"}</span>
                  <span className="text-[10px] text-[#71717A] font-mono">Enrolled Students</span>
                </div>
                <span className="text-xl font-bold font-mono text-white">{cd.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white">Registered Users ({users.length})</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#141414] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222] text-[#71717A] font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5">User</th>
                  <th>Role</th>
                  <th>Target Career</th>
                  <th>College</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#141414] transition-colors">
                    <td className="py-3">
                      <div className="font-semibold text-white">{u.full_name}</div>
                      <div className="text-[10px] text-[#71717A] font-mono">{u.email}</div>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        u.role === 'admin' ? 'bg-white text-black font-bold' : 'bg-[#1C1C1C] text-[#A1A1AA]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-white font-medium">{u.target_career || "—"}</td>
                    <td className="text-[#A1A1AA]">{u.college || "—"}</td>
                    <td className="text-[10px] text-[#71717A] font-mono">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-white">Configured Career Tracks & Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careerRoles.map((role) => (
              <div key={role.id} className="p-4 rounded-xl border border-[#262626] bg-[#151515] space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white">{role.title}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                    {role.demand_level} Demand
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] line-clamp-2">{role.description}</p>
                <div className="pt-2 border-t border-[#222222] text-[10px] text-[#71717A] font-mono">
                  Salary: {role.salary_range}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-white">Global Multi-Agent Orchestration Logs</h3>
          <div className="divide-y divide-[#1A1A1A] max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-black">
                      {log.agent_name}
                    </span>
                    <span className="font-semibold text-white">{log.task_name}</span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] line-clamp-1">{log.output_summary}</p>
                </div>
                <span className="text-[10px] font-mono text-[#71717A]">{log.latency_ms}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
