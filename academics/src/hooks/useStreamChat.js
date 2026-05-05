import { useState, useEffect, useCallback, useRef } from 'react';
import { getStreamClient, createUserToken } from '../lib/streamClient';

/**
 * Sanitize user ID for GetStream (must be alphanumeric / underscore / dash).
 */
const sanitizeId = (id) =>
  String(id || 'anon')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 64);

/**
 * Hook to connect the current user to GetStream Chat.
 *
 * Returns { client, isConnected, error, disconnect }
 */
export const useStreamChat = (user) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [activeClient, setActiveClient] = useState(() => getStreamClient());
  const connectedRef = useRef(false);
  const connectingRef = useRef(false);

  const connect = useCallback(async () => {
    if (!user?.id || !user?.name) return;
    if (connectedRef.current || connectingRef.current) return;

    connectingRef.current = true;
    const userId = sanitizeId(user.id);

    try {
      const token = await createUserToken(userId);
      const currentClient = getStreamClient();
      setActiveClient(currentClient);

      // If already connected as this user, skip connectUser
      if (currentClient.userID === userId) {
        connectedRef.current = true;
        setIsConnected(true);
        setError(null);
        return;
      }

      // Disconnect any previous user first
      if (currentClient.userID && currentClient.userID !== userId) {
        try { await currentClient.disconnectUser(); } catch {}
      }

      await currentClient.connectUser(
        { id: userId, name: user.name, role: user.role || 'user' },
        token
      );

      connectedRef.current = true;
      setIsConnected(true);
      setError(null);
      console.log('[GetStream] Connected as', userId);
    } catch (err) {
      // "Already connected" is not a real error — treat as success
      if (err?.message?.includes('already') || err?.code === 4) {
        connectedRef.current = true;
        setIsConnected(true);
        setError(null);
        return;
      }
      console.error('[GetStream] Connect failed:', err);
      setError(err?.message || 'Failed to connect to chat');
      setIsConnected(false);
    } finally {
      connectingRef.current = false;
    }
  }, [user?.id, user?.name, user?.role]);

  const disconnect = useCallback(async () => {
    if (!connectedRef.current) return;
    try {
      const currentClient = getStreamClient();
      await currentClient.disconnectUser();
    } catch {
      // ignore
    }
    connectedRef.current = false;
    connectingRef.current = false;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { client: activeClient, isConnected, error, disconnect };
};

export { sanitizeId };
