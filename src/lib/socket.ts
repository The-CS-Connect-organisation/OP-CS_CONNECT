import { io, Socket } from 'socket.io-client';

// The Socket.IO server runs on the same backend host as the REST API.
// Derive it from VITE_API_BASE (stripping the trailing "/api") so live bus
// tracking connects to the backend instead of the frontend's own origin.
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  'https://eduvault-backend-production-6a1b.up.railway.app/api';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socket.on('connect', () => {});
    socket.on('connect_error', (err) => console.error('[Socket] error:', err.message));
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
