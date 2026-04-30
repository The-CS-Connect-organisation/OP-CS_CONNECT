import { getFromStorage, setToStorage } from '../data/schema';

export const DATA_MODES = {
  LOCAL_DEMO: 'LOCAL_DEMO',
  REMOTE_API: 'REMOTE_API',
};

const STORAGE_KEY = 'sms_data_mode';

export const getDataMode = () => {
  const fromStorage = getFromStorage(STORAGE_KEY, null);
  if (fromStorage === DATA_MODES.LOCAL_DEMO || fromStorage === DATA_MODES.REMOTE_API) return fromStorage;

  // Always use REMOTE_API (Firebase) for production
  return DATA_MODES.REMOTE_API;
};

export const setDataMode = (mode) => {
  if (mode !== DATA_MODES.LOCAL_DEMO && mode !== DATA_MODES.REMOTE_API) return false;
  setToStorage(STORAGE_KEY, mode);
  return true;
};

