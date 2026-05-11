/**
 * Stream Chat Service
 * Real-time 1-on-1 messaging with optional call support via Stream Chat
 * API Key: n9v8bfwy45pn (from .env.example)
 */

import { StreamChat } from 'stream-chat';

// API key from environment
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY || 'n9v8bfwy45pn';

// Singleton client instance
let streamClient = null;

/**
 * Initialize Stream Chat client for current user
 * @param {string} userId
 * @param {string} userName
 * @param {string} [avatarUrl]
 * @returns {StreamChat}
 */
export const initStreamClient = (userId, userName, avatarUrl) => {
  if (!streamClient) {
    streamClient = StreamChat.getInstance(STREAM_API_KEY);
  }

  const token = ''; // For production, get token from your backend

  streamClient.connectUser(
    {
      id: userId,
      name: userName,
      avatar: avatarUrl || '',
    },
    token
  ).catch(err => {
    console.warn('[StreamChat] Could not connect user — using mock mode:', err.message);
  });

  return streamClient;
};

/**
 * Get or create the Stream Chat client (singleton)
 * @returns {StreamChat|null}
 */
export const getStreamClient = () => {
  if (!streamClient || !streamClient.user) {
    return null;
  }
  return streamClient;
};

/**
 * Disconnect the Stream Chat client
 */
export const disconnectStreamClient = async () => {
  if (streamClient) {
    await streamClient.disconnectUser();
    streamClient = null;
  }
};

/**
 * Check if Stream Chat is configured and connected
 * @returns {boolean}
 */
export const isStreamChatAvailable = () => {
  return !!(streamClient && streamClient.user);
};

/**
 * Create a Stream Chat channel for 1-on-1 conversation
 * @param {string} currentUserId
 * @param {string} otherUserId
 * @param {string} otherUserName
 * @returns {Channel|null}
 */
export const createDirectChannel = async (currentUserId, otherUserId, otherUserName) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const channel = client.channel('messaging', {
      members: [currentUserId, otherUserId],
      name: otherUserName,
    });
    await channel.watch();
    return channel;
  } catch (error) {
    console.error('[StreamChat] Failed to create channel:', error);
    return null;
  }
};

/**
 * Create a group channel for class/announcements
 * @param {string} currentUserId
 * @param {string[]} memberIds
 * @param {string} groupName
 * @returns {Channel|null}
 */
export const createGroupChannel = async (currentUserId, memberIds, groupName) => {
  const client = getStreamClient();
  if (!client) return null;

  try {
    const channel = client.channel('messaging', {
      members: memberIds,
      name: groupName,
    });
    await channel.watch();
    return channel;
  } catch (error) {
    console.error('[StreamChat] Failed to create group channel:', error);
    return null;
  }
};

/**
 * Send a message via Stream Chat channel
 * @param {Channel} channel
 * @param {string} text
 * @returns {Message|null}
 */
export const sendStreamMessage = async (channel, text) => {
  if (!channel) return null;

  try {
    const message = await channel.sendMessage({ text });
    return message;
  } catch (error) {
    console.error('[StreamChat] Failed to send message:', error);
    return null;
  }
};

/**
 * Subscribe to new messages on a channel
 * @param {Channel} channel
 * @param {function} onNewMessage
 * @returns {function} unsubscribe
 */
export const subscribeToChannelMessages = (channel, onNewMessage) => {
  if (!channel) return () => {};

  const unsubscribe = channel.on('message.new', (event) => {
    onNewMessage(event.message);
  });

  return () => {
    if (typeof unsubscribe === 'function') unsubscribe();
    else if (unsubscribe?.unsubscribe) unsubscribe.unsubscribe();
  };
};

/**
 * Subscribe to typing events on a channel
 * @param {Channel} channel
 * @param {function} onTyping - receives { user, isTyping }
 * @returns {function} unsubscribe
 */
export const subscribeToTyping = (channel, onTyping) => {
  if (!channel) return () => {};

  const unsubStart = channel.on('typing.start', (event) => {
    onTyping({ user: event.user, isTyping: true });
  });
  const unsubStop = channel.on('typing.stop', (event) => {
    onTyping({ user: event.user, isTyping: false });
  });

  return () => {
    if (typeof unsubStart === 'function') unsubStart();
    if (typeof unsubStop === 'function') unsubStop();
    if (unsubStart?.unsubscribe) unsubStart.unsubscribe();
    if (unsubStop?.unsubscribe) unsubStop.unsubscribe();
  };
};

/**
 * Start a call (voice or video) via Stream Video
 * Returns a modal message if Stream is not available
 * @param {'audio'|'video'} callType
 * @param {Channel} channel
 * @returns {Promise<{available: boolean, message?: string}>}
 */
export const startStreamCall = async (callType = 'video', channel) => {
  const client = getStreamClient();

  if (!client) {
    return {
      available: false,
      message: 'Call feature requires Stream Chat setup. Configure VITE_STREAM_API_KEY in .env.local to enable calls.',
    };
  }

  try {
    // Stream Video integration would go here
    // For now, return info about availability
    const call = await client.call(callType === 'audio' ? 'audio' : 'video', {});
    await call.join({ create: true });
    return { available: true, call };
  } catch (error) {
    console.warn('[StreamChat] Call not available:', error.message);
    return {
      available: false,
      message: 'Stream Video calls are not configured. Please set up Stream Video credentials in your Stream dashboard.',
    };
  }
};

export default {
  initStreamClient,
  getStreamClient,
  disconnectStreamClient,
  isStreamChatAvailable,
  createDirectChannel,
  createGroupChannel,
  sendStreamMessage,
  subscribeToChannelMessages,
  subscribeToTyping,
  startStreamCall,
};
