import { useState, useCallback, useEffect, useRef } from 'react';
import { getFromStorage, setToStorage, STORAGE_EVENT } from '../data/schema';

export const useStore = (key, defaultValue = []) => {
  const defaultRef = useRef(defaultValue);
  useEffect(() => {
    defaultRef.current = defaultValue;
  }, [defaultValue]);

  const normalizeStored = (stored, fallback) => {
    // If storage contains a different type than expected, fall back to defaultValue.
    if (Array.isArray(fallback)) {
      if (Array.isArray(stored)) return stored;
      if (stored && typeof stored === 'object') return [stored];
      return fallback;
    }
    if (fallback && typeof fallback === 'object') {
      return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : fallback;
    }
    return stored ?? fallback;
  };

  const [data, setData] = useState(() => normalizeStored(getFromStorage(key, defaultValue), defaultValue));
  const ignoreNextWriteRef = useRef(false);

  // Sync across components (same tab) when any `setToStorage/removeFromStorage` happens.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onStorageChange = (e) => {
      const changedKey = e?.detail?.key;
      if (changedKey !== key) return;

      const next = normalizeStored(getFromStorage(key, defaultRef.current), defaultRef.current);
      // Prevent the "write effect" below from re-writing storage and re-triggering the event loop.
      ignoreNextWriteRef.current = true;
      setData(next);
    };

    window.addEventListener(STORAGE_EVENT, onStorageChange);
    return () => window.removeEventListener(STORAGE_EVENT, onStorageChange);
  }, [key]);

  useEffect(() => {
    if (ignoreNextWriteRef.current) {
      ignoreNextWriteRef.current = false;
      return;
    }
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