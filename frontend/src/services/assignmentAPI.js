import { API_BASE_URL, getAuthHeaders, handleResponse, buildQueryString } from './apiUtils';

/**
 * Assignment API
 * Handles assignment operations for incident-vehicle assignments
 * Backend Controller: AssignmentController (/api/assignment)
 */
const assignmentAPI = {
  /**
   * Get all assignments
   * GET /api/assignment/all
   * @returns {Promise<Array>} List of all assignments
   */
  getAllAssignments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/assignment/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Get enroute assignments
   * GET /api/assignment/enroute
   * @returns {Promise<Array>} List of enroute assignments
   */
  getEnrouteAssignments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/assignment/enroute`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Get completed assignments
   * GET /api/assignment/completed
   * @returns {Promise<Array>} List of completed assignments
   */
  getCompletedAssignments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/assignment/completed`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Get assignments by status
   * GET /api/assignment/by-status
   * @param {string} status - Assignment status (ASSIGNED, ENROUTE, ARRIVED, COMPLETED, CANCELLED)
   * @returns {Promise<Array>} List of assignments with specified status
   */
  getAssignmentsByStatus: async (status) => {
    const queryString = buildQueryString({ status });
    const response = await fetch(`${API_BASE_URL}/api/assignment/by-status${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Reassign assignment to new vehicle
   * PUT /api/assignment/reassign
   * @param {number} assignmentId - Assignment ID
   * @param {number} newVehicleId - New vehicle ID
   * @returns {Promise<Object>} Reassigned assignment
   */
  reassignAssignment: async (assignmentId, newVehicleId) => {
    const queryString = buildQueryString({ assignmentId, newVehicleId });
    const response = await fetch(`${API_BASE_URL}/api/assignment/reassign${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Update assignment status
   * PUT /api/assignment/update-status
   * @param {number} assignmentId - Assignment ID
   * @param {string} status - New status (ASSIGNED, ENROUTE, ARRIVED, COMPLETED, CANCELLED)
   * @returns {Promise<Object>} Updated assignment
   */
  updateAssignmentStatus: async (assignmentId, status) => {
    const queryString = buildQueryString({ assignmentId, status });
    const response = await fetch(`${API_BASE_URL}/api/assignment/update-status${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Create new assignment
   * POST /api/assignment/assign
   * @param {Object} assignmentData - Assignment data
   * @param {number} assignmentData.incidentId - Incident ID
   * @param {number} assignmentData.vehicleId - Vehicle ID
   * @returns {Promise<Object>} Created assignment
   */
  createAssignment: async (assignmentData) => {
    const response = await fetch(`${API_BASE_URL}/api/assignment/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(assignmentData)
    });
    return handleResponse(response);
  }
};

export default assignmentAPI;
