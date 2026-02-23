import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken, clearToken } from '../utils/api';
const Ctx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (getToken()) {
      api.getMe().then(d => setUser(d.user)).catch(() => clearToken()).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);
  const login = useCallback(async (email, password) => {
    const d = await api.login({ email, password });
    setToken(d.token); setUser(d.user); return d.user;
  }, []);
  const register = useCallback(async (email, password, displayName) => {
    const d = await api.register({ email, password, displayName });
    setToken(d.token); setUser(d.user); return d.user;
  }, []);
  const logout = useCallback(() => { clearToken(); setUser(null); }, []);
  const refresh = useCallback(async () => { try { const d = await api.getMe(); setUser(d.user); } catch {} }, []);
  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}
export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
