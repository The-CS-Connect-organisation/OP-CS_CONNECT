// Centralized API Configuration
// All API URLs should be defined here and imported from other files

const DEFAULT_API_URL = 'https://op-csconnect-backend-production.up.railway.app';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${DEFAULT_API_URL}/api`;
export const API_URL_NO_API = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL_NO_API;

// For backwards compatibility
export const getApiBaseUrl = () => API_BASE_URL;
export const getSocketUrl = () => SOCKET_URL;