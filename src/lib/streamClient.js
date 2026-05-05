import { StreamChat } from 'stream-chat';
import { request } from '../utils/apiClient';

// API key is fetched from the backend token endpoint to stay in sync.
// Fallback matches the backend default so dev works without a token call.
const FALLBACK_API_KEY = 'h8334x6zj8ze';

let clientInstance = null;
let resolvedApiKey = FALLBACK_API_KEY;

export const getStreamClient = () => {
  if (!clientInstance) {
    clientInstance = StreamChat.getInstance(resolvedApiKey);
  }
  return clientInstance;
};

/**
 * Fetch a signed Stream token from the backend.
 * Also captures the real API key so the client is always in sync with the backend.
 */
export const createUserToken = async (userId) => {
  const payload = await request(`/school/stream-token?userId=${encodeURIComponent(userId)}`);
  if (!payload?.token) {
    throw new Error('Failed to get Stream Chat token from backend');
  }
  // If the backend returns the key, re-initialise the client with it
  if (payload.apiKey && payload.apiKey !== resolvedApiKey) {
    resolvedApiKey = payload.apiKey;
    clientInstance = null; // force re-init with correct key
  }
  return payload.token;
};

/**
 * Pre-provision a user in GetStream before attempting to create a channel with them.
 */
export const ensureUserExists = async (userId, name, role) => {
  const token = await createUserToken(userId);
  const tempClient = new StreamChat(resolvedApiKey);
  try {
    await tempClient.connectUser(
      { id: userId, name: name || 'User', role: role || 'user' },
      token
    );
  } catch (err) {
    console.error(`[GetStream] Failed to provision user ${userId}:`, err);
  } finally {
    try { await tempClient.disconnectUser(); } catch { /* ignore */ }
  }
};

export const getDevToken = (userId) => getStreamClient().devToken(userId);

export { resolvedApiKey as API_KEY };
