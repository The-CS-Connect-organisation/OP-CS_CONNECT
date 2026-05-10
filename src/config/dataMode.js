import { setToStorage } from '../data/schema';

export const DATA_MODES = {
  LOCAL_DEMO: 'LOCAL_DEMO',
  REMOTE_API: 'REMOTE_API',
};

const STORAGE_KEY = 'sms_data_mode';

export const getDataMode = () => {
  // Always use REMOTE_API - no local demo fallback
  // This ensures all data comes from the Firebase API
  return DATA_MODES.REMOTE_API;
};

export const setDataMode = (mode) => {
  if (mode !== DATA_MODES.LOCAL_DEMO && mode !== DATA_MODES.REMOTE_API) return false;
  setToStorage(STORAGE_KEY, mode);
  return true;
};

