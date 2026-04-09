import { io } from 'socket.io-client';
import { getFromStorage } from '../data/schema';
import { KEYS } from '../data/schema';
const getSocketOrigin = () => {
  const base = import.meta.env.VITE_API_BASE_URL || 'https://op-cs-connect-backend-1.onrender.com/api';
  try {
    return new URL(base).origin;
  } catch {
    return 'https://op-cs-connect-backend-1.onrender.com';
  }
};

let socketInstance = null;
let lastToken = null;

/**
 * Authenticated Socket.IO client (matches backend JWT middleware).
 */
export const getSocket = () => {
  if (typeof window === 'undefined') return null;
  const token = getFromStorage(KEYS.AUTH_TOKEN);
  if (!token) return null;
  if (socketInstance && lastToken === token) {
    return socketInstance;
  }
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  lastToken = token;
  socketInstance = io(getSocketOrigin(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  return socketInstance;
};

export const disconnectSocket = () => {
  lastToken = null;
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const isMongoId = (id) => typeof id === 'string' && /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(id);
