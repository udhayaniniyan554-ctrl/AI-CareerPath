import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, authStorage } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authStorage.getUser());
  const [token, setToken] = useState(authStorage.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = authStorage.getToken();
      if (storedToken) {
        try {
          const me = await api.auth.getMe();
          setUser(me);
          authStorage.setUser(me);
        } catch (err) {
          console.error("Auth check failed:", err);
          authStorage.clear();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password, role = 'student') => {
    const res = await api.auth.register(name, email, password, role);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const onboard = async (onboardingData) => {
    const res = await api.auth.onboard(onboardingData);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    api.auth.logout();
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, onboard, logout, isAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
