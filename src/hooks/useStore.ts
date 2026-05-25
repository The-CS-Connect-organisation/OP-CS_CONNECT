import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_PREFIX = 'eduvault-store-';
const STORAGE_EVENT = 'eduvault-storage-change';

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored === null) return defaultValue;
    const parsed = JSON.parse(stored);
    return parsed ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(
      new CustomEvent(STORAGE_EVENT, { detail: { key, timestamp: Date.now() } })
    );
  } catch (e) {
    console.error('Failed to write to storage:', e);
  }
}

function normalizeStored<T>(stored: any, fallback: T): T {
  if (Array.isArray(fallback)) {
    if (Array.isArray(stored)) return stored as T;
    if (stored && typeof stored === 'object') return [stored] as unknown as T;
    return fallback;
  }
  if (fallback && typeof fallback === 'object') {
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : fallback;
  }
  return stored ?? fallback;
}

export function useStore<T>(key: string, defaultValue: T) {
  const defaultRef = useRef(defaultValue);
  useEffect(() => {
    defaultRef.current = defaultValue;
  }, [defaultValue]);

  const [data, setData] = useState<T>(() =>
    normalizeStored(getFromStorage(key, defaultValue), defaultValue)
  );
  const ignoreNextWriteRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onStorageChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key !== key) return;

      const next = normalizeStored(
        getFromStorage(key, defaultRef.current),
        defaultRef.current
      );
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

  const add = useCallback(
    (item: any) => {
      setData((prev: any) => {
        if (Array.isArray(prev)) return [...prev, item];
        return { ...prev, ...item };
      });
    },
    []
  );

  const update = useCallback((id: string, updates: Partial<any>) => {
    setData((prev: any) => {
      if (Array.isArray(prev)) {
        return prev.map((item: any) =>
          item.id === id ? { ...item, ...updates } : item
        );
      }
      return prev;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setData((prev: any) => {
      if (Array.isArray(prev)) return prev.filter((item: any) => item.id !== id);
      return prev;
    });
  }, []);

  const setAll = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return { data, setData: setAll, add, update, remove };
}
