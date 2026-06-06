import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setReady(true);
  }, []);

  function persist(token, u, session) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    if (session) localStorage.setItem('session', JSON.stringify(session));
    else localStorage.removeItem('session');
    setUser(u);
    return u;
  }

  async function login(payload) {
    const { token, user: u, session } = await api.login(payload);
    return persist(token, u, session);
  }

  async function register(payload) {
    const { token, user: u } = await api.register(payload);
    return persist(token, u, null);
  }

  async function logout() {
    // Close the research session (time-on-task) before clearing local state.
    try {
      const session = JSON.parse(localStorage.getItem('session') || 'null');
      if (session?.id) await api.endSession(session.id);
      else await api.logout();
    } catch {
      /* best effort */
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
