import { API_BASE_URL, getAuthHeaders, handleResponse, buildQueryString } from './apiUtils';

/**
 * Vehicle API
 * Handles vehicle management operations
 * Backend Controller: VehicleController (/api/vehicle)
 */
const vehicleAPI = {
  /**
   * Get vehicle by ID
   * GET /api/vehicle/{id}
   * @param {number} id - Vehicle ID
   * @returns {Promise<Object>} Vehicle details
   */
  getVehicleById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/vehicle/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Update vehicle status
   * PUT /api/vehicle/update-status
   * @param {number} vehicleId - Vehicle ID
   * @param {string} status - New status (AVAILABLE, BUSY, MAINTENANCE, OUT_OF_SERVICE)
   * @returns {Promise<Object>} Updated vehicle
   */
  updateStatus: async (vehicleId, status) => {
    const queryString = buildQueryString({ vehicleId, status });
    const response = await fetch(`${API_BASE_URL}/api/vehicle/update-status${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Get vehicles by status
   * GET /api/vehicle/by-status
   * @param {string} status - Vehicle status (AVAILABLE, BUSY, MAINTENANCE, OUT_OF_SERVICE)
   * @returns {Promise<Array>} List of vehicles with specified status
   */
  getVehiclesByStatus: async (status) => {
    const queryString = buildQueryString({ status });
    const response = await fetch(`${API_BASE_URL}/api/vehicle/by-status${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Create new vehicle
   * POST /api/vehicle/create
   * @param {Object} vehicleData - Vehicle data
   * @returns {Promise<Object>} Created vehicle
   */
  createVehicle: async (vehicleData) => {
    const response = await fetch(`${API_BASE_URL}/api/vehicle/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(vehicleData)
    });
    return handleResponse(response);
  },

  /**
   * Update vehicle location
   * PUT /api/vehicle/{vehicleId}/location
   * @param {number} vehicleId - Vehicle ID
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<string>} Update confirmation message
   */
  updateLocation: async (vehicleId, latitude, longitude) => {
    const queryString = buildQueryString({ latitude, longitude });
    const response = await fetch(`${API_BASE_URL}/api/vehicle/${vehicleId}/location${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  }
};

export default vehicleAPI;
