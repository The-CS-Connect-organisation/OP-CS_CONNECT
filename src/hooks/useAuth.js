import { useState, useCallback, useEffect } from 'react';
import { KEYS, getFromStorage, setToStorage } from '../data/schema';
import { initializeApp } from '../data/seedData';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();                    // ← This is fine
    const currentUser = getFromStorage(KEYS.CURRENT_USER);
    if (currentUser) setUser(currentUser);
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const users = getFromStorage(KEYS.USERS, []);
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userWithoutPassword } = found;
      setUser(userWithoutPassword);
      setToStorage(KEYS.CURRENT_USER, userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const signup = useCallback((data) => {
    const users = getFromStorage(KEYS.USERS, []);
    if (users.find(u => u.email === data.email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      ...data,
      id: `${data.role}-${Date.now()}`,
      avatar: data.role === 'student' ? '👦' : data.role === 'teacher' ? '👨‍🏫' : '👩‍💼',
      joined: new Date().toISOString().split('T')[0],
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
    localStorage.removeItem(KEYS.CURRENT_USER);
  }, []);

  return { user, loading, login, signup, logout, isAuthenticated: !!user };
};