import { API_BASE_URL, authenticatedRequest } from './apiUtils';

const automationAPI = {
  isEnabled: async () => {
    return await authenticatedRequest('GET', `${API_BASE_URL}/api/dispatch-automation/enabled`);
  },

  setAutomation: async (isEnabled) => {
    return await authenticatedRequest('POST', `${API_BASE_URL}/api/dispatch-automation/enabled?enabled=${encodeURIComponent(isEnabled)}`);
  }
};

export default automationAPI;