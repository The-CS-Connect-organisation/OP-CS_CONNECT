import { StreamChat } from 'stream-chat';
import { request } from '../utils/apiClient';

const FALLBACK_API_KEY = 'h8334x6zj8ze';

let clientInstance = null;
let resolvedApiKey = FALLBACK_API_KEY;

export const getStreamClient = () => {
  if (!clientInstance) {
    clientInstance = StreamChat.getInstance(resolvedApiKey);
  }
  return clientInstance;
};

export const createUserToken = async (userId) => {
  const payload = await request(`/school/stream-token?userId=${encodeURIComponent(userId)}`);
  if (!payload?.token) {
    throw new Error('Failed to get Stream Chat token from backend');
  }
  if (payload.apiKey && payload.apiKey !== resolvedApiKey) {
    resolvedApiKey = payload.apiKey;
    clientInstance = null;
  }
  return payload.token;
};

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
