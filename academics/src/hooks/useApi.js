import { useState, useEffect, useCallback } from 'react';
import { request } from '../utils/apiClient';

/**
 * Generic hook for fetching data from the backend API.
 * Replaces useStore for server-side data.
 */
export const useApi = (path, options = {}) => {
  const { defaultValue = null, deps = [], skip = false } = options;
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (skip || !path) return;
    setLoading(true);
    setError(null);
    try {
      const res = await request(path);
      setData(res?.data ?? res ?? defaultValue);
    } catch (e) {
      setError(e.message);
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [path, skip, ...(deps || [])]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, setData };
};
