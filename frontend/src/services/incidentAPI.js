import { API_BASE_URL, getAuthHeaders, handleResponse, buildQueryString } from './apiUtils';

const incidentAPI = {
  getAcceptedIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/incident/accepted-incidents`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getReportedIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/incident/reported-incidents`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAllIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/incident/all-incidents`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getResolvedIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/api/incident/resolved-incidents`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createIncident: async (incidentData) => {
    const response = await fetch(`${API_BASE_URL}/api/incident/create-incident`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(incidentData)
    });
    return handleResponse(response);
  },

  getIncidentById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/incident/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updatePriority: async (incidentId, priority) => {
    const queryString = buildQueryString({ incidentId, priority });
    const response = await fetch(`${API_BASE_URL}/api/incident/update-priority${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateToAccepted: async (incidentId) => {
    const queryString = buildQueryString({ incidentId });
    const response = await fetch(`${API_BASE_URL}/api/incident/update-to-accepted${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateToResolved: async (incidentId) => {
    const queryString = buildQueryString({ incidentId });
    const response = await fetch(`${API_BASE_URL}/api/incident/update-to-resolved${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateStatus: async (id, status) => {
    const queryString = buildQueryString({ status });
    const response = await fetch(`${API_BASE_URL}/api/incident/update-status/${id}${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  cancelIncident: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/incident/cancel/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  reportPublicIncident: async (incidentData) => {
    const response = await fetch(`${API_BASE_URL}/api/public/incident/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(incidentData)
    });
    return handleResponse(response);
  },

  deleteIncident: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/incident/delete/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default incidentAPI;
