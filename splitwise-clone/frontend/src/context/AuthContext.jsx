import React, { createContext, useState, useEffect } from 'react';
import { setAccessToken } from '../api/client';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`, {}, { withCredentials: true });
        const token = res.data.access;
        setTokenState(token);
        setAccessToken(token);
        
        const userRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login/`, { email, password }, { withCredentials: true });
    const token = res.data.access;
    setTokenState(token);
    setAccessToken(token);
    
    const userRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUser(userRes.data);
  };

  const register = async (username, email, password) => {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register/`, { username, email, password }, { withCredentials: true });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/logout/`, {}, { withCredentials: true });
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
