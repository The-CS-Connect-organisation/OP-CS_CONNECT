import { StreamChat } from 'stream-chat';
import { request } from '../utils/apiClient';

const API_KEY = 'n9v8bfwy45pn';

let clientInstance = null;

export const getStreamClient = () => {
  if (!clientInstance) {
    clientInstance = StreamChat.getInstance(API_KEY);
  }
  return clientInstance;
};

/**
 * Fetch a signed Stream token from the backend.
 * The backend generates production tokens using the Stream API secret.
 */
export const createUserToken = async (userId) => {
  const payload = await request('/school/stream-token', {
    method: 'GET',
    headers: {
      'X-User-ID': userId,
    },
  });
  if (!payload?.token) {
    throw new Error('Failed to get Stream Chat token from backend');
  }
  return payload.token;
};

/**
 * Pre-provision a user in GetStream before attempting to create a channel with them.
 */
export const ensureUserExists = async (userId, name, role) => {
  const tempClient = new StreamChat(API_KEY);
  const token = await createUserToken(userId);
  try {
    await tempClient.connectUser(
      { id: userId, name: name || 'User', role: role || 'user' },
      token
    );
  } catch (err) {
    console.error(`[GetStream] Failed to provision user ${userId}:`, err);
  } finally {
    try {
      await tempClient.disconnectUser();
    } catch {
      // ignore
    }
  }
};

export const getDevToken = (userId) => {
  const client = getStreamClient();
  return client.devToken(userId);
};

export { API_KEY };
