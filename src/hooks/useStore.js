import { useState, useCallback, useEffect } from 'react';
import { KEYS, getFromStorage, setToStorage } from '../data/schema';

export const useStore = (key, defaultValue = []) => {
  const [data, setData] = useState(() => getFromStorage(key, defaultValue));

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