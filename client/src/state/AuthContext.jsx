import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('user');

    if (!cached) {
      return null;
    }

    try {
      return JSON.parse(cached);
    } catch (_error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest('/auth/me')
      .then(({ user: freshUser }) => {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, payload) => {
    const data = await apiRequest(path, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login: (payload) => authenticate('/auth/login', payload),
      signup: (payload) => authenticate('/auth/signup', payload),
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
