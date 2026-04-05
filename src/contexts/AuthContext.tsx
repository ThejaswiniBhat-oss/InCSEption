import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Role } from '../types/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  firstLogin: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  clearFirstLogin: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, token: null, isAuthenticated: false, firstLogin: false,
  login: () => {}, logout: () => {}, setRole: () => {}, clearFirstLogin: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('tg-user') ?? 'null'); } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tg-token'));
  const [firstLogin, setFirstLogin] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('tg-user', JSON.stringify(user));
    else localStorage.removeItem('tg-user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('tg-token', token);
    else localStorage.removeItem('tg-token');
  }, [token]);

  const login = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    setFirstLogin(true);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setFirstLogin(false);
  };

  const setRole = (role: Role) => {
    setUser(u => u ? { ...u, role } : u);
  };

  const clearFirstLogin = () => setFirstLogin(false);

  return (
    <AuthContext.Provider value={{
      user, token,
      isAuthenticated: !!user && !!token,
      firstLogin, login, logout, setRole, clearFirstLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
