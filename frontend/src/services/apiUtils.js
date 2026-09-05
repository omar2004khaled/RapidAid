/**
 * RapidAid API Utilities
 */

export const API_BASE_URL = 'http://localhost:8080';

/**
 * Returns authentication headers including Bearer token if present
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
 * Standard response handler for fetch requests
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
    const message = data.message || data.error || `HTTP error ${response.status}`;
    throw new Error(message);
  }

  return data;
};

/**
 * Builds query string from parameter map
 */
export const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Authenticated request wrapper
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
