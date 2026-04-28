import { useState, useCallback, useEffect } from 'react';
import { KEYS, getFromStorage } from '../data/schema';
import { initializeApp } from '../data/seedData';
import { disconnectSocket } from '../utils/socketClient';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();

    const currentUser = getFromStorage(KEYS.CURRENT_USER);
    if (currentUser) setUser(currentUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    if (res?.success) setUser(res.user);
    return res;
  }, []);

  const signup = useCallback(async (data) => {
    const res = await authService.signup(data);
    if (res?.success) setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    disconnectSocket();
    authService.logout();
  }, []);

  return { user, loading, login, signup, logout, isAuthenticated: !!user };
};
