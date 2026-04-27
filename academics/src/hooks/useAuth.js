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

    // Handle autofill from landing page
    const raw = sessionStorage.getItem('schoolsync_autofill');
    if (raw) {
      try {
        const { email, password, portal } = JSON.parse(raw);
        if (portal === 'academics') {
          sessionStorage.removeItem('schoolsync_autofill');
          authService.login(email, password).then((res) => {
            if (res?.success) {
              setUser(res.user);
              // Navigate to dashboard after successful autofill login
              window.location.replace(
                `/OP-CS_CONNECT/academics/#/${res.user.role}/dashboard`
              );
            } else {
              console.error('Autofill login failed:', res?.error);
              setLoading(false);
            }
          }).catch((err) => {
            console.error('Autofill login error:', err);
            setLoading(false);
          });
          return;
        }
      } catch {
        sessionStorage.removeItem('schoolsync_autofill');
      }
    }

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
