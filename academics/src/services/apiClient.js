import { request } from '../utils/apiClient';

/**
 * Thin wrapper so domain services can call the API consistently.
 */
export const apiRequest = async (path, options = {}) => {
  return request(path, options);
};
