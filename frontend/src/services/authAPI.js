import { API_BASE_URL, getAuthHeaders, handleResponse } from './apiUtils';

const authAPI = {
  register: async (registerData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(registerData)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token, newPassword })
    });
    return handleResponse(response);
  },

  completeOAuthProfile: async (email, profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/complete-oauth-profile?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  verifyEmail: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default authAPI;
