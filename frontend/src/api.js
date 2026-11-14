const API_BASE_URL = '/api';

export const authStorage = {
  getToken: () => localStorage.getItem('ai_careerpath_token'),
  setToken: (token) => localStorage.setItem('ai_careerpath_token', token),
  removeToken: () => localStorage.removeItem('ai_careerpath_token'),
  getUser: () => {
    try {
      const u = localStorage.getItem('ai_careerpath_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('ai_careerpath_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('ai_careerpath_user'),
  clear: () => {
    localStorage.removeItem('ai_careerpath_token');
    localStorage.removeItem('ai_careerpath_user');
  }
};

async function apiRequest(endpoint, options = {}) {
  const token = authStorage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    authStorage.clear();
    // Only redirect if not already on login or landing
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.detail) || (typeof data === 'string' ? data : 'API Request failed');
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      authStorage.setToken(res.access_token);
      authStorage.setUser(res.user);
      return res;
    },
    register: async (full_name, email, password, role = 'student') => {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ full_name, email, password, role }),
      });
      authStorage.setToken(res.access_token);
      authStorage.setUser(res.user);
      return res;
    },
    onboard: async (onboardingData) => {
      const res = await apiRequest('/auth/onboard', {
        method: 'POST',
        body: JSON.stringify(onboardingData),
      });
      authStorage.setToken(res.access_token);
      authStorage.setUser(res.user);
      return res;
    },
    getMe: () => apiRequest('/auth/me'),
    logout: () => {
      authStorage.clear();
    }
  },

  profile: {
    get: () => apiRequest('/profile'),
    update: (data) => apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    addSkill: (skill_name, proficiency = 'Beginner') => apiRequest('/profile/skills', {
      method: 'POST',
      body: JSON.stringify({ skill_name, proficiency }),
    }),
    deleteSkill: (skill_name) => apiRequest(`/profile/skills/${encodeURIComponent(skill_name)}`, {
      method: 'DELETE',
    }),
  },

  dashboard: {
    getSummary: () => apiRequest('/dashboard'),
  },

  agents: {
    runPipeline: (target_career = null, force_regenerate = false) => apiRequest('/agents/pipeline/run', {
      method: 'POST',
      body: JSON.stringify({ target_career, force_regenerate }),
    }),
    getActivity: (limit = 50) => apiRequest(`/agents/activity?limit=${limit}`),
    getOverview: () => apiRequest('/agents/overview'),
  },

  roadmap: {
    get: () => apiRequest('/roadmap'),
    toggleTask: (taskId, isCompleted) => apiRequest(`/roadmap/tasks/${taskId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ is_completed: isCompleted }),
    }),
  },

  assessments: {
    list: () => apiRequest('/assessments'),
    get: (id) => apiRequest(`/assessments/${id}`),
    submit: (id, answers) => apiRequest(`/assessments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ assessment_id: id, answers }),
    }),
    getHistory: () => apiRequest('/assessments/history/all'),
  },

  mentor: {
    chat: (message, context_topic = '') => apiRequest('/mentor/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context_topic }),
    }),
    getHistory: () => apiRequest('/mentor/history'),
  },

  resources: {
    list: () => apiRequest('/resources'),
    toggleSave: (id) => apiRequest(`/resources/${id}/save`, { method: 'POST' }),
    getSaved: () => apiRequest('/resources/saved'),
  },

  curriculum: {
    getMapping: () => apiRequest('/curriculum/mapping'),
    addSubject: (data) => apiRequest('/curriculum/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    deleteSubject: (id) => apiRequest(`/curriculum/subjects/${id}`, {
      method: 'DELETE',
    }),
    parseSyllabus: (syllabus_text, semester = 'Semester 5') => apiRequest('/curriculum/parse-syllabus', {
      method: 'POST',
      body: JSON.stringify({ syllabus_text, semester }),
    }),
  },

  documents: {
    list: () => apiRequest('/documents'),
    parseText: (doc_type, file_name, file_content_text, metadata = {}) => apiRequest('/documents/parse-text', {
      method: 'POST',
      body: JSON.stringify({ doc_type, file_name, file_content_text, metadata }),
    }),
    delete: (id) => apiRequest(`/documents/${id}`, {
      method: 'DELETE',
    }),
  },

  admin: {
    getStats: () => apiRequest('/admin/stats'),
    getUsers: () => apiRequest('/admin/users'),
    getCareerRoles: () => apiRequest('/admin/career-roles'),
    getLogs: () => apiRequest('/admin/logs'),
  }
};
