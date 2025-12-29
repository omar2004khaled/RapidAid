import { API_BASE_URL, getAuthHeaders, handleResponse, buildQueryString } from './apiUtils';

/**
 * Incident API
 * Handles incident management operations
 * Backend Controller: IncidentController (/api/incident)
 */
const incidentAPI = {
  /**
   * Get accepted incidents ordered
   * GET /api/incident/accepted-incidents
   * @returns {Promise<Array>} List of accepted incidents
   */
  getAcceptedIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/incident/accepted-incidents`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Get reported incidents
   * GET /api/incident/reported-incidents
   * @returns {Promise<Array>} List of reported incidents
   */
  getReportedIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/incident/reported-incidents`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Get all incidents
   * GET /api/incident/all-incidents
   * @returns {Promise<Array>} List of all incidents
   */
  getAllIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/incident/all-incidents`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Get resolved incidents
   * GET /api/incident/resolved-incidents
   * @returns {Promise<Array>} List of resolved incidents
   */
  getResolvedIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/incident/resolved-incidents`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Create new incident
   * POST /api/incident/create-incident
   * @param {Object} incidentData - Incident data
   * @param {string} incidentData.description - Incident description
   * @param {string} incidentData.location - Incident location
   * @param {string} incidentData.incidentType - Type of incident
   * @param {number} incidentData.latitude - Latitude coordinate
   * @param {number} incidentData.longitude - Longitude coordinate
   * @returns {Promise<Object>} Created incident response
   */
  createIncident: async (incidentData) => {
    const response = await fetch(`${API_BASE_URL}/api/incident/create-incident`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(incidentData)
    });
    return handleResponse(response);
  },

  /**
   * Get incident by ID
   * GET /api/incident/{id}
   * @param {number} id - Incident ID
   * @returns {Promise<Object>} Incident details
   */
  getIncidentById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/incident/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Update incident priority
   * PUT /api/incident/update-priority
   * @param {number} incidentId - Incident ID
   * @param {number} priority - New priority level
   * @returns {Promise<Object>} Updated incident
   */
  updatePriority: async (incidentId, priority) => {
    const queryString = buildQueryString({ incidentId, priority });
    const response = await fetch(`${API_BASE_URL}/api/incident/update-priority${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Update incident to accepted status
   * PUT /api/incident/update-to-accepted
   * @param {number} incidentId - Incident ID
   * @returns {Promise<Object>} Updated incident
   */
  updateToAccepted: async (incidentId) => {
    const queryString = buildQueryString({ incidentId });
    const response = await fetch(`${API_BASE_URL}/api/incident/update-to-accepted${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Update incident to resolved status
   * PUT /api/incident/update-to-resolved
   * @param {number} incidentId - Incident ID
   * @returns {Promise<Object>} Updated incident
   */
  updateToResolved: async (incidentId) => {
    const queryString = buildQueryString({ incidentId });
    const response = await fetch(`${API_BASE_URL}/api/incident/update-to-resolved${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Update incident status
   * PUT /api/incident/update-status/{id}
   * @param {number} id - Incident ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated incident
   */
  updateStatus: async (id, status) => {
    const queryString = buildQueryString({ status });
    const response = await fetch(`${API_BASE_URL}/api/incident/update-status/${id}${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Cancel incident
   * PUT /api/incident/cancel/{id}
   * @param {number} id - Incident ID to cancel
   * @returns {Promise<Object>} Cancelled incident
   */
  cancelIncident: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/incident/cancel/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Report public incident (no auth required)
   * POST /api/public/incident/report
   * @param {Object} incidentData - Incident data
   * @returns {Promise<Object>} Created incident
   */
  reportPublicIncident: async (incidentData) => {
    const response = await fetch(`${API_BASE_URL}/api/public/incident/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify(incidentData)
    });
    return handleResponse(response);
  },

  /**
   * Delete incident
   * DELETE /api/incident/delete/{id}
   * @param {number} id - Incident ID to delete
   * @returns {Promise<void>}
   */
  deleteIncident: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/incident/delete/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  }
};

export default incidentAPI;
