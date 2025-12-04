import { API_BASE_URL, getAuthHeaders, handleResponse } from './apiUtils';

/**
 * User API
 * Handles user management operations
 * Backend Controller: UserController (/api/user)
 */
const userAPI = {
  /**
   * Get all users
   * GET /api/user/all
   * @returns {Promise<Array>} List of all users
   */
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/user/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Create admin user
   * POST /api/user/create-admin
   * @param {Object} adminData - Admin user data
   * @param {string} adminData.username - Admin username
   * @param {string} adminData.fullName - Admin full name
   * @param {string} adminData.email - Admin email
   * @param {string} adminData.password - Admin password
   * @param {string} adminData.phone - Admin phone number
   * @returns {Promise<Object>} Created admin user
   */
  createAdminUser: async (adminData) => {
    const response = await fetch(`${API_BASE_URL}/api/user/create-admin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(adminData)
    });
    return handleResponse(response);
  },

  /**
   * Delete user by ID
   * DELETE /api/user/{id}
   * @param {number} userId - User ID to delete
   * @returns {Promise<string>} Deletion confirmation message
   */
  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  }
};

export default userAPI;
