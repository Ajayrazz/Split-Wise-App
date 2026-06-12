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
        const res = await client.post('/auth/refresh/', {}, { _retry: true });
        const token = res.data.access;
        setTokenState(token);
        setAccessToken(token);
        
        const userRes = await client.get('/auth/me/');
        setUser(userRes.data);
      } catch (err) {
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
      await client.post('/auth/logout/');
    } catch(e) {}
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
