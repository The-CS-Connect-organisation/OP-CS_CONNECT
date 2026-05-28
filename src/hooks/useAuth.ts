import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, User } from '../lib/store';
import { api } from '../lib/api';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signup: (data: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout, setLoading } = useAuthStore();
  const [loading, setLoadingState] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('eduvault-user-id');
    if (userId && !user) {
      api.getMe()
        .then((data) => {
          if (data?.user) {
            storeLogin(data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('eduvault-user-id');
        })
        .finally(() => {
          setLoading(false);
          setLoadingState(false);
        });
    } else {
      setLoading(false);
      setLoadingState(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.login(email, password);
      if (data?.user) {
        storeLogin(data.user);
        navigate(`/${data.user.role}/dashboard`);
        return { success: true, user: data.user };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [navigate, storeLogin]);

  const signup = useCallback(async (data: any) => {
    try {
      setError(null);
      setLoading(true);
      const result = await api.signup(data);
      if (result?.user) {
        storeLogin(result.user);
        navigate(`/${result.user.role}/dashboard`);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.message || 'Signup failed' };
    } catch (err: any) {
      const message = err.message || 'An unexpected error occurred during signup.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [navigate, storeLogin]);

  const logout = useCallback(() => {
    storeLogout();
    navigate('/login');
  }, [navigate, storeLogout]);

  return { user, loading, error, login, signup, logout, isAuthenticated };
};