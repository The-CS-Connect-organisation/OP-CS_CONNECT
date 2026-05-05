import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KEYS, getFromStorage } from '../data/schema';
import { initializeApp } from '../data/seedData';
import { disconnectSocket } from '../utils/socketClient';
import { authService } from '../services/authService';

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      initializeApp();

      const currentUser = getFromStorage(KEYS.CURRENT_USER);
      if (currentUser) {
        // Validate that the user object has required fields
        if (!currentUser.id || !currentUser.role || !currentUser.email) {
          console.warn('Invalid user object in storage, clearing:', currentUser);
          setUser(null);
        } else {
          setUser(currentUser);
        }
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      if (!authService || typeof authService.login !== 'function') {
        throw new Error('Auth service not available');
      }
      const res = await authService.login(email, password);
      if (res?.success) {
        setUser(res.user);
        navigate(`/${res.user.role}/dashboard`);
      }
      return res;
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message };
    }
  }, [navigate]);

  const signup = useCallback(async (data) => {
    try {
      if (!authService || typeof authService.signup !== 'function') {
        throw new Error('Auth service not available');
      }
      const res = await authService.signup(data);
      if (res?.success) {
        setUser(res.user);
        navigate(`/${res.user.role}/dashboard`);
      }
      return res;
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: err.message };
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    disconnectSocket();
    if (authService && typeof authService.logout === 'function') {
      authService.logout();
    }
    navigate('/login');
  }, [navigate]);

  return { user, loading, login, signup, logout, isAuthenticated: !!user, error };
};
