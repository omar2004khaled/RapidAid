import { API_BASE_URL, getAuthHeaders, handleResponse, buildQueryString } from './apiUtils';

const vehicleAPI = {
  getVehicleById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/vehicle/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getVehiclesByStatus: async (status) => {
    const queryString = buildQueryString({ status });
    const response = await fetch(`${API_BASE_URL}/api/vehicle/by-status${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAllVehicles: async () => {
    const response = await fetch(`${API_BASE_URL}/api/vehicle/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createVehicle: async (vehicleData) => {
    const response = await fetch(`${API_BASE_URL}/api/vehicle/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicleData)
    });
    return handleResponse(response);
  },

  updateStatus: async (vehicleId, status) => {
    const queryString = buildQueryString({ vehicleId, status });
    const response = await fetch(`${API_BASE_URL}/api/vehicle/update-status${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default vehicleAPI;