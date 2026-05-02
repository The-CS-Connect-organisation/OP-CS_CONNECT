import { getDataMode, DATA_MODES } from '../config/dataMode';
import { apiRequest } from './apiClient';
import { KEYS, getFromStorage, setToStorage } from '../data/schema';
import { localAuditRepo } from './localRepo';

const nowIso = () => new Date().toISOString();

const readLocal = () => getFromStorage(KEYS.NOTIFICATIONS, []);
const writeLocal = (items) => setToStorage(KEYS.NOTIFICATIONS, items);

export const notificationsService = {
  async listForUser(userId) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/notifications?userId=${encodeURIComponent(userId)}`, { method: 'GET' });
      return payload?.notifications ?? payload ?? [];
    }
    const all = readLocal();
    return all.filter((n) => n.userId === userId);
  },

  async emit({ userId, message, type = 'info', meta = {}, actor } = {}) {
    if (!userId || !message) return null;

    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify({ userId, message, type, meta }),
      });
      localAuditRepo.append({ actorId: actor?.id, actorEmail: actor?.email, action: 'notifications.emit', mode: 'REMOTE_API' });
      return payload?.notification ?? payload;
    }

    const next = [
      { id: `ntf-${Date.now()}`, userId, message, type, meta, read: false, createdAt: nowIso() },
      ...readLocal(),
    ].slice(0, 500);
    writeLocal(next);
    localAuditRepo.append({ actorId: actor?.id, actorEmail: actor?.email, action: 'notifications.emit', mode: 'LOCAL_DEMO' });
    return next[0];
  },

  async markRead({ notificationId, userId }) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/notifications/${notificationId}/read`, { method: 'POST' });
      return payload?.notification ?? payload;
    }
    const all = readLocal();
    const next = all.map((n) => (n.id === notificationId && n.userId === userId ? { ...n, read: true, readAt: nowIso() } : n));
    writeLocal(next);
    return next.find((n) => n.id === notificationId) ?? null;
  },
};

