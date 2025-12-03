const API_BASE_URL = 'http://localhost:8080';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { message: text };
  }
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  verifyEmail: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  resendVerification: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify({ token, newPassword })
    });
    return handleResponse(response);
  }
};

// Admin API
export const adminAPI = {
  // User Management
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  createAdmin: async (adminData) => {
    const response = await fetch(`${API_BASE_URL}/admin/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(adminData)
    });
    return handleResponse(response);
  },

  promoteToAdmin: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/promote/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  demoteAdmin: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/demote/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  // Incident Management
  getIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/incidents`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  updateIncidentStatus: async (incidentId, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/incidents/${incidentId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  assignIncident: async (incidentId, unitId) => {
    const response = await fetch(`${API_BASE_URL}/admin/incidents/${incidentId}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify({ unitId })
    });
    return handleResponse(response);
  },

  // Emergency Units Management
  getUnits: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/units`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  createUnit: async (unitData) => {
    const response = await fetch(`${API_BASE_URL}/admin/units`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(unitData)
    });
    return handleResponse(response);
  },

  deleteUnit: async (unitId) => {
    const response = await fetch(`${API_BASE_URL}/admin/units/${unitId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  updateUnit: async (unitId, unitData) => {
    const response = await fetch(`${API_BASE_URL}/admin/units/${unitId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(unitData)
    });
    return handleResponse(response);
  }
};

// Reporter API (for reporting incidents)
export const reporterAPI = {
  reportIncident: async (incidentData) => {
    return incidentAPI.createIncident(incidentData);
  },

  getMyIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/reporter/incidents`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  }
};

// Responder API (for emergency units)
export const responderAPI = {
  updateLocation: async (unitId, location) => {
    const response = await fetch(`${API_BASE_URL}/responder/units/${unitId}/location`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(location)
    });
    return handleResponse(response);
  },

  updateIncidentStatus: async (incidentId, status) => {
    const response = await fetch(`${API_BASE_URL}/responder/incidents/${incidentId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  getAssignedIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/responder/incidents/assigned`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  resolveIncident: async (incidentId) => {
    const response = await fetch(`${API_BASE_URL}/responder/incidents/${incidentId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  }
};

// Emergency/Incident API (public reporting)
export const emergencyAPI = {
  reportEmergency: async (emergencyData) => {
    const response = await fetch(`${API_BASE_URL}/emergency/report`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(emergencyData)
    });
    return handleResponse(response);
  },

  getEmergencies: async () => {
    const response = await fetch(`${API_BASE_URL}/emergency/list`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  getEmergencyById: async (emergencyId) => {
    const response = await fetch(`${API_BASE_URL}/emergency/${emergencyId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  }
};

// Incident API
export const incidentAPI = {
  getReportedIncidents: async (page = 0, size = 10) => {
    const response = await fetch(`${API_BASE_URL}/incident/get-reported?page=${page}&size=${size}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  createIncident: async (incidentData) => {
    const response = await fetch(`${API_BASE_URL}/incident/create-incident`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(incidentData)
    });
    return handleResponse(response);
  },

  getIncidentById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/incident/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  updatePriority: async (incidentId, priority) => {
    const response = await fetch(`${API_BASE_URL}/incident/update-priority?incidentId=${incidentId}&priority=${priority}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  updateStatus: async (incidentId, status) => {
    const response = await fetch(`${API_BASE_URL}/incident/update-status?incidentId=${incidentId}&status=${status}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  cancelIncident: async (id) => {
    const response = await fetch(`${API_BASE_URL}/incident/cancel/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  }
};

// Dispatcher API
export const dispatcherAPI = {
  getActiveIncidents: async () => {
    const response = await fetch(`${API_BASE_URL}/dispatcher/incidents/active`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  getAvailableUnits: async () => {
    const response = await fetch(`${API_BASE_URL}/dispatcher/units/available`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse(response);
  },

  assignUnit: async (incidentId, unitId) => {
    const response = await fetch(`${API_BASE_URL}/dispatcher/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify({ incidentId, unitId })
    });
    return handleResponse(response);
  },

  dispatchIncident: async (incidentId, dispatchData) => {
    const response = await fetch(`${API_BASE_URL}/dispatcher/incidents/${incidentId}/dispatch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      mode: 'cors',
      body: JSON.stringify(dispatchData)
    });
    return handleResponse(response);
  }
};

export default {
  authAPI,
  adminAPI,
  reporterAPI,
  responderAPI,
  emergencyAPI,
  incidentAPI,
  dispatcherAPI
};