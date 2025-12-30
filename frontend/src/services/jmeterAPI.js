import { API_BASE_URL, authenticatedRequest } from './apiUtils';

const jmeterAPI = {
  createJmeterIncidents: async (numberOfIncidents) => {
    return authenticatedRequest('POST', `${API_BASE_URL}/api/simulation/incidents?count=${encodeURIComponent(numberOfIncidents)}`);
  },
    createJmeterVehicles: async (numberOfVehicles) => {
    return authenticatedRequest('POST', `${API_BASE_URL}/api/simulation/vehicles?count=${encodeURIComponent(numberOfVehicles)}`);
},
};

export default jmeterAPI;