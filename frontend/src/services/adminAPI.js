import { API_BASE_URL, getAuthHeaders, handleResponse } from './apiUtils';

/**
 * Admin API
 * Handles administrative operations (requires ADMINISTRATOR role)
 * Backend Controller: AdminController (/admin)
 */
const adminAPI = {
  /**
   * Get all users
   * GET /admin/users
   * @returns {Promise<Array>} List of all users
   */
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Get system statistics
   * GET /admin/stats
   * @returns {Promise<string>} System statistics
   */
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  /**
   * Create new admin user
   * POST /admin/create
   * @param {Object} adminData - Admin user data
   * @param {string} adminData.name - Admin name
   * @param {string} adminData.email - Admin email
   * @param {string} adminData.password - Admin password (8-20 chars, with uppercase, lowercase, number, special char)
   * @returns {Promise<Object>} Created admin user with success message
   */
  createAdmin: async (adminData) => {
    const response = await fetch(`${API_BASE_URL}/admin/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(adminData)
    });
    return handleResponse(response);
  },

  /**
   * Get user by ID
   * GET /admin/users/{userId}
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User details
   */
  getUserById: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  }
};

export default adminAPI;
