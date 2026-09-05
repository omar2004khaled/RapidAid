import { API_BASE_URL, authenticatedRequest } from './apiUtils';

const analyticsAPI = {
  getPerformanceMetrics: async () => {
    return await authenticatedRequest('GET', `${API_BASE_URL}/api/analytics/performance-metrics`);
  },

  getResponseTimeTrend: async (days = 30) => {
    return await authenticatedRequest('GET', `${API_BASE_URL}/api/analytics/response-time-trend?days=${days}`);
  },

  getTopPerformingUnits: async (limit = 5) => {
    return await authenticatedRequest('GET', `${API_BASE_URL}/api/analytics/top-units?limit=${limit}`);
  }
};

export default analyticsAPI;
