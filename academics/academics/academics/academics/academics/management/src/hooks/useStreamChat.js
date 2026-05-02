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
  const connectedRef = useRef(false);
  const connectingRef = useRef(false);
  const client = getStreamClient();

  const connect = useCallback(async () => {
    if (!user?.id || !user?.name) return;
    if (connectedRef.current || connectingRef.current) return;

    connectingRef.current = true;
    const userId = sanitizeId(user.id);

    try {
      // Generate JWT signed with the app secret (browser Web Crypto)
      const token = await createUserToken(userId);

      await client.connectUser(
        {
          id: userId,
          name: user.name,
          role: user.role || 'user',
        },
        token
      );

      connectedRef.current = true;
      setIsConnected(true);
      setError(null);
      console.log('[GetStream] Connected as', userId);
    } catch (err) {
      console.error('[GetStream] Connect failed:', err);
      setError(err?.message || 'Failed to connect to chat');
      setIsConnected(false);
    } finally {
      connectingRef.current = false;
    }
  }, [user?.id, user?.name, user?.role, client]);

  const disconnect = useCallback(async () => {
    if (!connectedRef.current) return;
    try {
      await client.disconnectUser();
    } catch {
      // ignore
    }
    connectedRef.current = false;
    connectingRef.current = false;
    setIsConnected(false);
  }, [client]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { client, isConnected, error, disconnect };
};

export { sanitizeId };
