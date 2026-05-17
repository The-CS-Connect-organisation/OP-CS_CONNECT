export const DATA_MODES = { REMOTE_API: 'REMOTE_API', LOCAL_DEMO: 'LOCAL_DEMO' };
export const DATA_MODE = import.meta.env.VITE_DATA_MODE || DATA_MODES.REMOTE_API;
export const getDataMode = () => DATA_MODE;
