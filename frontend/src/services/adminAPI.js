import { API_BASE_URL, getAuthHeaders, handleResponse } from './apiUtils';

const adminAPI = {
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdmin: async (adminData) => {
    const response = await fetch(`${API_BASE_URL}/admin/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData)
    });
    return handleResponse(response);
  },

  getUserById: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getPendingUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/pending-users`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  approveUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/approve-user/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  rejectUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/reject-user/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  demoteAdmin: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/demote/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default adminAPI;
