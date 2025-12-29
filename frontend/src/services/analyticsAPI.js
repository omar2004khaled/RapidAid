import { authenticatedRequest } from './apiUtils';

const ANALYTICS_URL = 'http://localhost:8080/api/analytics';

const getPerformanceMetrics = async () => {
    return await authenticatedRequest('GET', `${ANALYTICS_URL}/performance-metrics`);
};

const getResponseTimeTrend = async (days = 30) => {
    return await authenticatedRequest('GET', `${ANALYTICS_URL}/response-time-trend?days=${days}`);
};

const getTopPerformingUnits = async (limit = 5) => {
    return await authenticatedRequest('GET', `${ANALYTICS_URL}/top-units?limit=${limit}`);
};

export default {
    getPerformanceMetrics,
    getResponseTimeTrend,
    getTopPerformingUnits,
};
