// API base URL from environment (for GitHub Pages deployment, .env values work at build time)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://op-csconnect-backend-production.up.railway.app/api';

// Keep-alive ping every 10 minutes to prevent cold starts
if (typeof window !== 'undefined') {
  const ping = () => fetch(`${API_BASE_URL}/health`, { method: 'GET' }).catch(() => {});
  ping(); // ping on load
  setInterval(ping, 10 * 60 * 1000); // ping every 10 min
}

// Initialize authToken from localStorage if available
let authToken = null;
if (typeof window !== 'undefined') {
  const tokenJson = localStorage.getItem('sms_auth_token');
  if (tokenJson) {
    try {
      // Parse if it's JSON (stored by setToStorage), otherwise use as-is
      authToken = typeof tokenJson === 'string' && tokenJson.startsWith('"') 
        ? JSON.parse(tokenJson) 
        : tokenJson;
    } catch (e) {
      console.warn('Error parsing auth token:', e);
      authToken = null;
    }
  }
}

export class ApiClientError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const buildUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const setAuthToken = (token) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('sms_auth_token', token);
    } else {
      localStorage.removeItem('sms_auth_token');
    }
  }
};

export const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  
  let response;
  try {
    response = await fetch(buildUrl(path), {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
      ...options,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  let payload = null;
  try {
    const text = await response.text();
    payload = text ? JSON.parse(text) : null;
  } catch (parseError) {
    // If response is not JSON, create a generic payload
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `HTTP ${response.status}: Request failed`;
    throw new ApiClientError(message, response.status, payload?.details ?? null);
  }

  return payload;
};
