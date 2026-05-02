import { request } from '../utils/apiClient';
import { getDataMode, DATA_MODES } from '../config/dataMode';

/**
 * Thin wrapper so domain services can call the API consistently.
 * If the app is in LOCAL_DEMO mode, API calls are blocked to avoid
 * mixing localStorage data with remote server responses.
 */
export const apiRequest = async (path, options = {}) => {
  if (getDataMode() === DATA_MODES.LOCAL_DEMO) {
    const err = new Error('Remote API disabled in LOCAL_DEMO mode');
    err.status = 0;
    throw err;
  }
  return request(path, options);
};

