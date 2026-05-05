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
    console.log('🔐 Login attempt:', cleanEmail, 'dataMode:', getDataMode());

    if (getDataMode() === DATA_MODES.REMOTE_API) {
      console.log('🔐 Using REMOTE_API mode');
      try {
        const payload = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        });
        if (!payload?.user) return { success: false, error: 'Invalid server response' };
        setSession({ user: payload.user, token: payload.token });
        localAuditRepo.append({ actorEmail: cleanEmail, action: 'auth.login', mode: 'REMOTE_API' });
        return { success: true, user: payload.user };
      } catch (err) {
        console.error('🔐 Login error:', err.message);
        // Return the error message from the backend (e.g., "Invalid email or password")
        return { success: false, error: err.message || 'Login failed. Please try again.' };
      }
    }

    // LOCAL_DEMO
    console.log('🔐 Using LOCAL_DEMO mode');
    const found = localUsersRepo.findByEmail(cleanEmail);
    console.log('🔐 User found:', found?.name || 'NOT FOUND');
    console.log('🔐 Password check - entered:', cleanPassword, 'stored:', found?.password);
    if (!found || found.password !== cleanPassword) {
      console.log('🔐 Password mismatch or user not found');
      return { success: false, error: 'Invalid email or password' };
    }
    if (found.isActive === false) return { success: false, error: 'Account is disabled. Please contact admin.' };
    const { password: _pw, ...userWithoutPassword } = found;
    
    // Store all users in localStorage for parent-child relationships
    const allUsers = localUsersRepo.list();
    setToStorage('allUsers', allUsers);
    
    // Generate a dummy JWT token for local development (format: header.payload.signature)
    const dummyToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' + 
                       btoa(JSON.stringify({ sub: found.id, email: cleanEmail, role: found.role })) + 
                       '.' + 'dummy_signature';
    setSession({ user: userWithoutPassword, token: dummyToken });
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

    // Validate required fields
    if (!cleanData.name || !cleanData.email || !cleanData.password || !cleanData.role) {
      return { success: false, error: 'Name, email, password, and role are required' };
    }

    if (getDataMode() === DATA_MODES.REMOTE_API) {
      try {
        const payload = await apiRequest('/auth/signup', {
          method: 'POST',
          body: JSON.stringify(cleanData),
        });
        if (!payload?.user) return { success: false, error: 'Invalid server response' };
        setSession({ user: payload.user, token: payload.token });
        localAuditRepo.append({ actorEmail: cleanData.email, action: 'auth.signup', mode: 'REMOTE_API' });
        return { success: true, user: payload.user };
      } catch (err) {
        console.error('🔐 Signup error:', err.message);
        return { success: false, error: err.message || 'Signup failed. Please try again.' };
      }
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
    // Generate a dummy JWT token for local development
    const dummyToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' + 
                       btoa(JSON.stringify({ sub: newUser.id, email: cleanData.email, role: newUser.role })) + 
                       '.' + 'dummy_signature';
    setSession({ user: userWithoutPassword, token: dummyToken });
    localAuditRepo.append({ actorEmail: cleanData.email, action: 'auth.signup', mode: 'LOCAL_DEMO' });
    return { success: true, user: userWithoutPassword };
  },

  logout() {
    setAuthToken(null);
    removeFromStorage(KEYS.CURRENT_USER);
    removeFromStorage(KEYS.AUTH_TOKEN);
  },
};

