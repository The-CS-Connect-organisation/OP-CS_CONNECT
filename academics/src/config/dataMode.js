export const DATA_MODES = { LOCAL_DEMO: 'LOCAL_DEMO', REMOTE_API: 'REMOTE_API' };

export const getDataMode = () => {
  // Allow URL param override for local development: ?mode=LOCAL_DEMO
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'LOCAL_DEMO') return DATA_MODES.LOCAL_DEMO;
    if (mode === 'REMOTE_API') return DATA_MODES.REMOTE_API;
  }
  return DATA_MODES.REMOTE_API;
};

export const setDataMode = () => true;