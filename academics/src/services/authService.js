import { apiRequest } from './apiClient';
import { getDataMode, DATA_MODES } from '../config/dataMode';
import { setAuthToken } from '../utils/apiClient';
import { KEYS, getFromStorage, setToStorage, removeFromStorage } from '../data/schema';
import { localUsersRepo, localAuditRepo } from './localRepo';

const clean = (v) => String(v ?? '').trim();

const setSession = ({ user, token }) => {
  if (token) {
    setAuthToken(token);
    setToStorage(KEYS.AUTH_TOKEN, token);
  }
  setToStorage(KEYS.CURRENT_USER, user);
};

export const authService = {
  getCurrentUser() {
    return getFromStorage(KEYS.CURRENT_USER, null);
  },

  async login(email, password) {
    const cleanEmail = clean(email).toLowerCase();
    const cleanPassword = clean(password);

    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      if (!payload?.user) return { success: false, error: 'Invalid server response' };
      setSession({ user: payload.user, token: payload.token });
      localAuditRepo.append({ actorEmail: cleanEmail, action: 'auth.login', mode: 'REMOTE_API' });
      return { success: true, user: payload.user };
    }

    // LOCAL_DEMO
    const found = localUsersRepo.findByEmail(cleanEmail);
    if (!found || found.password !== cleanPassword) return { success: false, error: 'Invalid email or password' };
    if (found.isActive === false) return { success: false, error: 'Account is disabled. Please contact admin.' };
    const { password: _pw, ...userWithoutPassword } = found;
    setSession({ user: userWithoutPassword, token: null });
    localAuditRepo.append({ actorEmail: cleanEmail, action: 'auth.login', mode: 'LOCAL_DEMO' });
    return { success: true, user: userWithoutPassword };
  },

  async signup(data) {
    const cleanData = {
      name: clean(data?.name),
      email: clean(data?.email).toLowerCase(),
      password: clean(data?.password),
      role: data?.role,
    };

    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(cleanData),
      });
      if (!payload?.user) return { success: false, error: 'Invalid server response' };
      setSession({ user: payload.user, token: payload.token });
      localAuditRepo.append({ actorEmail: cleanData.email, action: 'auth.signup', mode: 'REMOTE_API' });
      return { success: true, user: payload.user };
    }

    const users = localUsersRepo.list();
    if (users.find((u) => String(u.email).toLowerCase() === cleanData.email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      ...cleanData,
      id: `${cleanData.role}-${Date.now()}`,
      avatar: cleanData.role === 'student' ? '👦' : cleanData.role === 'teacher' ? '👨‍🏫' : cleanData.role === 'parent' ? '🧑' : '👩‍💼',
      joined: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    setToStorage(KEYS.USERS, [...users, newUser]);
    const { password: _pw, ...userWithoutPassword } = newUser;
    setSession({ user: userWithoutPassword, token: null });
    localAuditRepo.append({ actorEmail: cleanData.email, action: 'auth.signup', mode: 'LOCAL_DEMO' });
    return { success: true, user: userWithoutPassword };
  },

  logout() {
    setAuthToken(null);
    removeFromStorage(KEYS.CURRENT_USER);
    removeFromStorage(KEYS.AUTH_TOKEN);
  },
};

