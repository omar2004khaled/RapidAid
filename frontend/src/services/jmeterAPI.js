import { API_BASE_URL, authenticatedRequest } from './apiUtils';

const jmeterAPI = {
  createJmeterIncidents: async (numberOfIncidents) => {
    return authenticatedRequest('POST', `${API_BASE_URL}/api/simulation/start?count=${encodeURIComponent(numberOfIncidents)}`);
  },
};

export default jmeterAPI;