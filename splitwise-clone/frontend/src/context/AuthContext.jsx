import React, { createContext, useState, useEffect } from 'react';
import client, { setAccessToken } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedRefresh = localStorage.getItem('refresh_token');
        if (!storedRefresh) throw new Error('No refresh token');

        const res = await client.post('/auth/refresh/', { refresh: storedRefresh }, { _retry: true });
        const token = res.data.access;
        const newRefresh = res.data.refresh;
        
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
        localStorage.setItem('access_token', token);

        setTokenState(token);
        setAccessToken(token);
        
        const userRes = await client.get('/auth/me/');
        setUser(userRes.data);
      } catch (err) {
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token');
        setUser(null);
        setTokenState(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();

    const handleTokenRefresh = (e) => setTokenState(e.detail);
    const handleAuthFail = () => {
      setUser(null);
      setTokenState(null);
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh);
    window.addEventListener('authFailed', handleAuthFail);
    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
      window.removeEventListener('authFailed', handleAuthFail);
    };
  }, []);

  const login = async (email, password) => {
    const res = await client.post('/auth/login/', { email, password });
    const token = res.data.access;
    const refresh = res.data.refresh;
    
    if (refresh) localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('access_token', token);

    setTokenState(token);
    setAccessToken(token);
    
    const userRes = await client.get('/auth/me/');
    setUser(userRes.data);
  };

  const register = async (username, email, password) => {
    await client.post('/auth/register/', { username, email, password });
    await login(email, password);
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await client.post('/auth/logout/', { refresh });
    } catch(e) {}
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
    setUser(null);
    setTokenState(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
