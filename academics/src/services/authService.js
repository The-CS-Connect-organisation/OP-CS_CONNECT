import { apiRequest } from './apiClient';
import { setAuthToken } from '../utils/apiClient';
import { KEYS, getFromStorage, setToStorage, removeFromStorage } from '../data/schema';
import { localUsersRepo } from './localRepo';
import { seedIfNeeded } from './localRepo';

const clean = (v) => String(v ?? '').trim();

const setSession = ({ user, token }) => {
  if (!user || !user.id || !user.role) return;
  if (token) {
    setAuthToken(token);
    setToStorage(KEYS.AUTH_TOKEN, token);
  }
  const cleanUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    ...user
  };
  setToStorage(KEYS.CURRENT_USER, cleanUser);
};

export const authService = {
  getCurrentUser() {
    return getFromStorage(KEYS.CURRENT_USER, null);
  },

  async login(email, password) {
    const cleanEmail = clean(email).toLowerCase();
    const cleanPassword = clean(password);

    // Try backend first
    try {
      const payload = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      if (!payload?.user) return { success: false, error: payload?.message || 'Invalid email or password' };
      const enriched = payload.enriched || {};
      const fullUser = { ...payload.user, ...enriched };
      setSession({ user: fullUser, token: payload.token });
      return { success: true, user: fullUser };
    } catch (err) {
      // Fallback to local demo login
      console.warn('Backend unavailable, trying local demo login:', err.message);
      seedIfNeeded();
      const users = localUsersRepo.list();
      const user = users.find(u => u.email?.toLowerCase() === cleanEmail);
      if (!user) return { success: false, error: 'User not found. Try: student@schoolsync.edu' };
      if (user.password !== cleanPassword) return { success: false, error: 'Invalid password. Try: student123' };
      setSession({ user, token: 'demo-token' });
      return { success: true, user };
    }
  },

  async signup(data) {
    const cleanData = {
      name: clean(data?.name),
      email: clean(data?.email).toLowerCase(),
      password: clean(data?.password),
      role: data?.role,
    };
    if (!cleanData.name || !cleanData.email || !cleanData.password || !cleanData.role) {
      return { success: false, error: 'Name, email, password, and role are required' };
    }
    try {
      const payload = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(cleanData),
      });
      if (!payload?.user) return { success: false, error: payload?.message || 'Signup failed' };
      setSession({ user: payload.user, token: payload.token });
      return { success: true, user: payload.user };
    } catch (err) {
      return { success: false, error: 'Backend unavailable. Signup requires server connection.' };
    }
  },

  logout() {
    setAuthToken(null);
    removeFromStorage(KEYS.CURRENT_USER);
    removeFromStorage(KEYS.AUTH_TOKEN);
  },
};
