// API base URL from environment
import { API_BASE_URL } from '../config/api';

// API configuration constants
const API_TIMEOUT_MS = 60000; // 1 minute request timeout
const KEEPALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const KEEPALIVE_PING_INTERVAL_MS = 10 * 60 * 1000; // ping every 10 minutes
const API_MAX_RETRIES = 3;
const API_RETRY_DELAY_MS = 1000; // 1 second base delay

// Keep-alive ping to prevent cold starts
if (typeof window !== 'undefined') {
  const ping = () => fetch(`${API_BASE_URL}/health`, { method: 'GET' }).catch(() => {});
  ping(); // ping on load
  setInterval(ping, KEEPALIVE_PING_INTERVAL_MS);
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

export const request = async (path, options = {}, retryCount = 0) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

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
  } catch (error) {
    // Network error - retry if possible
    if (retryCount < API_MAX_RETRIES) {
      await new Promise(r => setTimeout(r, API_RETRY_DELAY_MS * (retryCount + 1)));
      return request(path, options, retryCount + 1);
    }
    throw new ApiClientError('Network error: ' + error.message, 0, null);
  } finally {
    clearTimeout(timeoutId);
  }

  // Retry on 5xx errors
  if (response.status >= 500 && retryCount < API_MAX_RETRIES) {
    await new Promise(r => setTimeout(r, API_RETRY_DELAY_MS * (retryCount + 1)));
    return request(path, options, retryCount + 1);
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
