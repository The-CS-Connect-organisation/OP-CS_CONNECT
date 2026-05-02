/**
 * Driver Login Authentication Test
 * 
 * This test verifies that driver users can successfully authenticate
 * with the correct credentials (driver@schoolsync.edu / driver123, etc.)
 */

import { authService } from '../authService';
import { initializeApp } from '../../data/seedData';
import { getFromStorage, KEYS } from '../../data/schema';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Driver Login Authentication', () => {
  beforeEach(() => {
    localStorage.clear();
    initializeApp();
  });

  describe('Bug Condition: Driver Login Fails on Unfixed Code', () => {
    test('driver@schoolsync.edu should authenticate with driver123', async () => {
      const result = await authService.login('driver@schoolsync.edu', 'driver123');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('driver@schoolsync.edu');
      expect(result.user.role).toBe('driver');
      expect(result.user.password).toBeUndefined(); // Password should not be returned
    });

    test('driver2@schoolsync.edu should authenticate with driver123', async () => {
      const result = await authService.login('driver2@schoolsync.edu', 'driver123');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('driver2@schoolsync.edu');
      expect(result.user.role).toBe('driver');
    });

    test('driver3@schoolsync.edu should authenticate with driver123', async () => {
      const result = await authService.login('driver3@schoolsync.edu', 'driver123');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('driver3@schoolsync.edu');
      expect(result.user.role).toBe('driver');
    });

    test('driver users should be in localStorage after initialization', () => {
      const users = getFromStorage(KEYS.USERS, []);
      const drivers = users.filter(u => u.role === 'driver');
      expect(drivers.length).toBe(3);
      expect(drivers.map(d => d.email)).toContain('driver@schoolsync.edu');
      expect(drivers.map(d => d.email)).toContain('driver2@schoolsync.edu');
      expect(drivers.map(d => d.email)).toContain('driver3@schoolsync.edu');
    });
  });

  describe('Preservation: Non-Driver Authentication Behavior Unchanged', () => {
    test('student login should still work', async () => {
      const result = await authService.login('alex@schoolsync.edu', 'student123');
      expect(result.success).toBe(true);
      expect(result.user.role).toBe('student');
    });

    test('teacher login should still work', async () => {
      const result = await authService.login('james@schoolsync.edu', 'teacher123');
      expect(result.success).toBe(true);
      expect(result.user.role).toBe('teacher');
    });

    test('admin login should still work', async () => {
      const result = await authService.login('admin@schoolsync.edu', 'admin123');
      expect(result.success).toBe(true);
      expect(result.user.role).toBe('admin');
    });

    test('parent login should still work', async () => {
      const result = await authService.login('parent@schoolsync.edu', 'parent123');
      expect(result.success).toBe(true);
      expect(result.user.role).toBe('parent');
    });

    test('invalid credentials should return error', async () => {
      const result = await authService.login('alex@schoolsync.edu', 'wrongpassword');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    test('non-existent email should return error', async () => {
      const result = await authService.login('nonexistent@schoolsync.edu', 'password123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });
  });
});
