import { useState, useCallback, useEffect } from 'react';
import { KEYS, getFromStorage, setToStorage } from '../data/schema';

export const useStore = (key, defaultValue = []) => {
  const [data, setData] = useState(() => {
    const stored = getFromStorage(key, defaultValue);
    // If storage contains a different type than expected, fall back to defaultValue.
    if (Array.isArray(defaultValue)) {
      if (Array.isArray(stored)) return stored;
      if (stored && typeof stored === 'object') return [stored];
      return defaultValue;
    }
    if (defaultValue && typeof defaultValue === 'object') {
      return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : defaultValue;
    }
    return stored ?? defaultValue;
  });

  useEffect(() => {
    setToStorage(key, data);
  }, [data, key]);

  const add = useCallback((item) => {
    setData(prev => {
      const updated = Array.isArray(prev) ? [...prev, item] : { ...prev, ...item };
      return updated;
    });
  }, []);

  const update = useCallback((id, updates) => {
    setData(prev => {
      if (Array.isArray(prev)) {
        return prev.map(item => item.id === id ? { ...item, ...updates } : item);
      }
      return prev;
    });
  }, []);

  const remove = useCallback((id) => {
    setData(prev => {
      if (Array.isArray(prev)) return prev.filter(item => item.id !== id);
      return prev;
    });
  }, []);

  const setAll = useCallback((newData) => {
    setData(newData);
  }, []);

  return { data, setData: setAll, add, update, remove };
};