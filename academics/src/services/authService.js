import { apiRequest } from './apiClient';
import { setAuthToken } from '../utils/apiClient';
import { KEYS, getFromStorage, setToStorage, removeFromStorage } from '../data/schema';

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

    const payload = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    });
    if (!payload?.user) return { success: false, error: payload?.message || 'Invalid email or password' };
    setSession({ user: payload.user, token: payload.token });
    return { success: true, user: payload.user };
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
    const payload = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
    if (!payload?.user) return { success: false, error: payload?.message || 'Signup failed' };
    setSession({ user: payload.user, token: payload.token });
    return { success: true, user: payload.user };
  },

  logout() {
    setAuthToken(null);
    removeFromStorage(KEYS.CURRENT_USER);
    removeFromStorage(KEYS.AUTH_TOKEN);
  },
};
