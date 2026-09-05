import { API_BASE_URL, getAuthHeaders, handleResponse } from './apiUtils';

const userAPI = {
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/user/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminUser: async (adminData) => {
    const response = await fetch(`${API_BASE_URL}/api/user/create-admin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData)
    });
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default userAPI;
