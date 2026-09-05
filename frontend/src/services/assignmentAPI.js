import { API_BASE_URL, getAuthHeaders, handleResponse, buildQueryString } from './apiUtils';

const assignmentAPI = {
  getAllAssignments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/assignment/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getEnrouteAssignments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/assignment/enroute`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCompletedAssignments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/assignment/completed`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAssignmentsByStatus: async (status) => {
    const queryString = buildQueryString({ status });
    const response = await fetch(`${API_BASE_URL}/api/assignment/by-status${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  reassignAssignment: async (assignmentId, newVehicleId) => {
    const queryString = buildQueryString({ assignmentId, newVehicleId });
    const response = await fetch(`${API_BASE_URL}/api/assignment/reassign${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateAssignmentStatus: async (assignmentId, status) => {
    const queryString = buildQueryString({ assignmentId, status });
    const response = await fetch(`${API_BASE_URL}/api/assignment/update-status${queryString}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAssignment: async (assignmentData) => {
    const response = await fetch(`${API_BASE_URL}/api/assignment/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData)
    });
    return handleResponse(response);
  }
};

export default assignmentAPI;
