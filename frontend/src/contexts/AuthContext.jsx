import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../services/adminApi.js';
import { onUnauthorized, setCsrfToken } from '../services/http.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({ admin: null, status: 'idle' });
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  const apply = useCallback((payload) => {
    setCsrfToken(payload?.csrfToken ?? null);
    setState({ admin: payload?.admin ?? null, status: payload ? 'authenticated' : 'anonymous' });
  }, []);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      apply(await authApi.me());
    } catch {
      apply(null);
    }
  }, [apply]);

  useEffect(() => {
    if (isAdminArea && state.status === 'idle') refresh();
  }, [isAdminArea, state.status, refresh]);

  useEffect(() => {
    onUnauthorized(() => {
      apply(null);
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        navigate('/admin/login', { replace: true, state: { expired: true } });
      }
    });
  }, [apply, navigate]);

  const login = useCallback(async (credentials) => apply(await authApi.login(credentials)), [apply]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      apply(null);
      navigate('/admin/login', { replace: true });
    }
  }, [apply, navigate]);

  const value = useMemo(() => ({ ...state, login, logout, refresh }), [state, login, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
