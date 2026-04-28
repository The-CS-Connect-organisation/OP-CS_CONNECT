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

    // Handle autofill from landing page
    const raw = sessionStorage.getItem('schoolsync_autofill');
    if (raw) {
      try {
        const { email, password, portal } = JSON.parse(raw);
        if (portal === 'management') {
          sessionStorage.removeItem('schoolsync_autofill');
          const token = getFromStorage(KEYS.AUTH_TOKEN);
          if (token) setAuthToken(token);
          request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          }).then((payload) => {
            if (payload?.user) {
              if (payload.token) { setAuthToken(payload.token); setToStorage(KEYS.AUTH_TOKEN, payload.token); }
              setUser(payload.user);
              setToStorage(KEYS.CURRENT_USER, payload.user);
              window.location.replace(`/OP-CS_CONNECT/management/#/${payload.user.role}/dashboard`);
            } else {
              setLoading(false);
            }
          }).catch(() => setLoading(false));
          return;
        }
      } catch {
        sessionStorage.removeItem('schoolsync_autofill');
      }
    }

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
      if (!shouldAllowLocalFallback() && err?.status && err.status < 500) {
        return { success: false, error: err.message || 'Invalid email or password' };
      }
    }

    const users = getFromStorage(KEYS.USERS, []);
    const found = users.find(u => u.email === cleanEmail && u.password === cleanPassword);
    if (found) {
      if (found.isActive === false) {
        return { success: false, error: 'Account is disabled. Please contact admin.' };
      }
      const { password: _, ...userWithoutPassword } = found;
      setUser(userWithoutPassword);
      setToStorage(KEYS.CURRENT_USER, userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, error: 'Invalid email or password' };
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
    } catch {
      // Fallback
    }

    const users = getFromStorage(KEYS.USERS, []);
    if (users.find(u => u.email === cleanData.email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      ...cleanData,
      id: `${cleanData.role}-${Date.now()}`,
      avatar: cleanData.role === 'student' ? '👦' : cleanData.role === 'teacher' ? '👨‍🏫' : '👩‍💼',
      joined: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    users.push(newUser);
    setToStorage(KEYS.USERS, users);
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setToStorage(KEYS.CURRENT_USER, userWithoutPassword);
    return { success: true, user: userWithoutPassword };
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
