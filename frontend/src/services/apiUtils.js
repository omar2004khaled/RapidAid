/**
 * API Utility Functions
 * Shared utilities for API calls
 */

export const API_BASE_URL = 'http://localhost:8080';

/**
 * Get authentication headers
 * @returns {Object} Headers object with auth token if available
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Handle API response
 * @param {Response} response - Fetch API response
 * @returns {Promise<Object>} Parsed response data
 * @throws {Error} If response is not ok
 */
export const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};

/**
 * Build query string from params object
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Make an authenticated API request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} [body] - Request body
 * @returns {Promise<Object>} Response data
 */
export const authenticatedRequest = async (method, url, body = null) => {
  const headers = getAuthHeaders();
  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  const response = await fetch(url, config);
  return handleResponse(response);
};
