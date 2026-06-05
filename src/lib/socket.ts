import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://op-csconnect-backend-production.up.railway.app/api';
const SOCKET_URL = API_BASE.replace('/api', '');

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
