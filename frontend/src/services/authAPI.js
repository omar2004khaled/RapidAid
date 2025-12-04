import { API_BASE_URL, getAuthHeaders, handleResponse } from './apiUtils';

/**
 * Authentication API
 * Handles user authentication operations including registration, login, password reset, and OAuth
 * Backend Controller: AuthController (/auth)
 */
const authAPI = {
  /**
   * Register a new user
   * POST /auth/register
   * @param {Object} registerData - Registration data
   * @param {string} registerData.email - User email
   * @param {string} registerData.password - User password
   * @param {string} registerData.fullName - User full name
   * @param {string} registerData.role - User role (ADMINISTRATOR)
   * @returns {Promise<Object>} Registration response
   */
  register: async (registerData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(registerData)
    });
    return handleResponse(response);
  },

  /**
   * Login user
   * POST /auth/login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Auth response with token, role, and email
   */
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  /**
   * Request password reset
   * POST /auth/forgot-password
   * @param {string} email - User email
   * @returns {Promise<Object>} Response message
   */
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  /**
   * Reset password using token
   * POST /auth/reset-password
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response message
   */
  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify({ token, newPassword })
    });
    return handleResponse(response);
  },

  /**
   * Complete OAuth profile
   * POST /auth/complete-oauth-profile
   * @param {string} email - User email
   * @param {Object} profileData - Profile completion data
   * @param {string} profileData.role - User role
   * @returns {Promise<Object>} Auth response with token
   */
  completeOAuthProfile: async (email, profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/complete-oauth-profile?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  /**
   * Verify email using token
   * GET /auth/verify
   * @param {string} token - Email verification token
   * @returns {Promise<string>} Verification result message
   */
  verifyEmail: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  }
};

export default authAPI;
