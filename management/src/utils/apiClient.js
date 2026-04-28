const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://op-cs-connect-backend-vym7.onrender.com/api';

// Initialize authToken from localStorage if available
let authToken = null;
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('sms_auth_token');
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
  return `${API_BASE_URL}${normalizedPath.toLowerCase()}`;
};

export const setAuthToken = (token) => {
  authToken = token;
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
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || 'Request failed';
    throw new ApiClientError(message, response.status, payload?.details ?? null);
  }

  return payload;
};
