import { useState, useCallback, useEffect } from 'react';
import { KEYS, getFromStorage, removeFromStorage, setToStorage } from '../data/schema';
import { initializeApp } from '../data/seedData';
import { request, setAuthToken } from '../utils/apiClient';
import { disconnectSocket } from '../utils/socketClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const shouldAllowLocalFallback = () => {
    try {
      return import.meta?.env?.DEV === true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    initializeApp();

    const currentUser = getFromStorage(KEYS.CURRENT_USER);
    const token = getFromStorage(KEYS.AUTH_TOKEN);
    if (token) setAuthToken(token);
    if (currentUser) {
      const users = getFromStorage(KEYS.USERS, []);
      const fresh = users.find(u => u.id === currentUser.id);
      if (fresh?.isActive === false) {
        setUser(null);
      } else {
        setUser(currentUser);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    try {
      const payload = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      const userFromApi = payload?.user;
      const token = payload?.token;
      if (userFromApi) {
        if (token) {
          setAuthToken(token);
          setToStorage(KEYS.AUTH_TOKEN, token);
        }
        setUser(userFromApi);
        setToStorage(KEYS.CURRENT_USER, userFromApi);
        return { success: true, user: userFromApi };
      }
      return { success: false, error: 'Invalid server response' };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password' };
    }
  }, []);

  const signup = useCallback(async (data) => {
    const cleanData = {
      name: String(data?.name ?? '').trim(),
      email: String(data?.email ?? '').trim().toLowerCase(),
      password: String(data?.password ?? '').trim(),
      role: data?.role,
    };

    try {
      const payload = await request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(cleanData),
      });
      const userFromApi = payload?.user;
      const token = payload?.token;
      if (userFromApi) {
        if (token) {
          setAuthToken(token);
          setToStorage(KEYS.AUTH_TOKEN, token);
        }
        setUser(userFromApi);
        setToStorage(KEYS.CURRENT_USER, userFromApi);
        return { success: true, user: userFromApi };
      }
      return { success: false, error: 'Invalid server response' };
    } catch (err) {
      return { success: false, error: err.message || 'Email already registered' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    disconnectSocket();
    removeFromStorage(KEYS.CURRENT_USER);
    removeFromStorage(KEYS.AUTH_TOKEN);
    // Go back to landing page
    window.location.href = '/OP-CS_CONNECT/';
  }, []);

  return { user, loading, login, signup, logout, isAuthenticated: !!user };
};
