import { StreamChat } from 'stream-chat';
import { request } from '../utils/apiClient';

const API_KEY = 'n9v8bfwy45pn';
const API_SECRET = '49kgqfqqfv8kfegqfu4zffrtbxxj5st7by5em83yprxzatk3feguh24zphab35mh';

let clientInstance = null;

export const getStreamClient = () => {
  if (!clientInstance) {
    clientInstance = StreamChat.getInstance(API_KEY);
  }
  return clientInstance;
};

const base64url = (input) => {
  const str = typeof input === 'string' ? input : new TextDecoder().decode(input);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const createUserToken = async (userId) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { user_id: userId };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(API_SECRET);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(signingInput)
  );

  const signature = base64url(
    String.fromCharCode(...new Uint8Array(signatureBuffer))
  );

  return `${signingInput}.${signature}`;
};

/**
 * Pre-provision a user in GetStream before attempting to create a channel with them.
 * Creates a TEMPORARY client instance just for the upsert so it doesn't interfere with
 * the main chat client connection.
 */
export const ensureUserExists = async (userId, name, role) => {
  // Use a completely separate client instance so we don't disconnect the main one
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
