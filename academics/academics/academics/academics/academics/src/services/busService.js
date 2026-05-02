import { getDataMode, DATA_MODES } from '../config/dataMode';
import { apiRequest } from './apiClient';

export const busService = {
  async listBuses(filters = {}) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.routeId) queryParams.append('routeId', filters.routeId);
      if (filters.driverId) queryParams.append('driverId', filters.driverId);
      
      const query = queryParams.toString();
      const payload = await apiRequest(`/bus/buses${query ? `?${query}` : ''}`, { method: 'GET' });
      return payload?.items ?? payload?.buses ?? [];
    }
    return [];
  },

  async getBus(busId) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/bus/buses/${busId}`, { method: 'GET' });
      return payload?.bus;
    }
    return null;
  },

  async listRoutes(filters = {}) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      
      const query = queryParams.toString();
      const payload = await apiRequest(`/bus/routes${query ? `?${query}` : ''}`, { method: 'GET' });
      return payload?.items ?? payload?.routes ?? [];
    }
    return [];
  },

  async getRoute(routeId) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/bus/routes/${routeId}`, { method: 'GET' });
      return payload?.route;
    }
    return null;
  },

  async getActiveBusesOnRoute(routeId) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/bus/routes/${routeId}/active-buses`, { method: 'GET' });
      return payload?.buses ?? [];
    }
    return [];
  },

  async getBusLocationHistory(busId, filters = {}) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const query = queryParams.toString();
      const payload = await apiRequest(`/bus/buses/${busId}/location-history${query ? `?${query}` : ''}`, { method: 'GET' });
      return payload;
    }
    return null;
  },

  async updateBusLocation(busId, location) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/bus/buses/${busId}/location`, {
        method: 'PATCH',
        body: JSON.stringify(location),
      });
      return payload?.bus;
    }
    return null;
  },
};
