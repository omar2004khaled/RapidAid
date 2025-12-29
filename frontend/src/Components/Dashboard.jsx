import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import DispatcherPage from '../pages/DispatcherPage';
import adminAPI from '../services/adminAPI';
import incidentAPI from '../services/incidentAPI';
import vehicleAPI from '../services/vehicleAPI';
import assignmentAPI from '../services/assignmentAPI';
import websocketService from '../services/websocketService';
import '../css/DispatcherCss.css';
import MapPage from "../pages/MapPage";
import LocationPickerMap from './LocationPickerMap';
import Notification  from './Notification';


const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('incidents');
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [reporters, setReporters] = useState([]);
  const [newReporter, setNewReporter] = useState({ name: '', phone: '' });
  const [emergencyUnits, setEmergencyUnits] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [newUnit, setNewUnit] = useState({ type: 'AMBULANCE', count: 0, latitude: 30.0444, longitude: 31.2357 });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const incidentReportedSubscriptionRef = useRef(null);
  const incidentAcceptedSubscriptionRef = useRef(null);
  const vehicleSubscriptionRef = useRef(null);

  const fetchData = async () => {
    await Promise.all([
      fetchAdmins(),
      fetchIncidents(),
      fetchUnits(),
      fetchPendingUsers()
    ]);
  };

  useEffect(() => {
    fetchData();

    // Connect to WebSocket
    websocketService.connect(
      'http://localhost:8080/ws',
      () => {
        console.log('[Dashboard] Connected to WebSocket');

        const refreshIncidents = () => {
            console.log('[Dashboard] Incident update received, refreshing...');
            fetchIncidents();
        };

        // Subscribe to incident updates
        incidentReportedSubscriptionRef.current = websocketService.subscribe('/topic/incident/reported', refreshIncidents);
        incidentAcceptedSubscriptionRef.current = websocketService.subscribe('/topic/incident/accepted', refreshIncidents);

        // Subscribe to vehicle updates
        vehicleSubscriptionRef.current = websocketService.subscribe('/topic/vehicle/available', (data) => {
          console.log('[Dashboard] Vehicle update received:', data);
          processUnits(data);
        });
      },
      (error) => {
        console.error('[Dashboard] WebSocket connection error:', error);
      }
    );

    // Cleanup on unmount
    return () => {
      if (incidentReportedSubscriptionRef.current) websocketService.unsubscribe(incidentReportedSubscriptionRef.current);
      if (incidentAcceptedSubscriptionRef.current) websocketService.unsubscribe(incidentAcceptedSubscriptionRef.current);
      if (vehicleSubscriptionRef.current) websocketService.unsubscribe(vehicleSubscriptionRef.current);
      websocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      const userData = parseJwt(token);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUserInfo(userData);
      }
    } else {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);
      } else if (storedToken) {
        const userData = parseJwt(storedToken);
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          setUserInfo(userData);
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const fetchAdmins = async () => {
    try {
      const users = await adminAPI.getAllUsers();
      setAdmins(users.filter(user => user.role === 'ADMINISTRATOR'));
    } catch (error) {
      console.error('Error fetching admins:', error);

      // If authentication is required or token is invalid/expired, clear stored auth and redirect
      const msg = (error && error.message) ? error.message : '';
      if (msg.includes('Full authentication') || msg.includes('401') || msg.includes('403') || msg.toLowerCase().includes('access denied')) {
        console.warn('[Dashboard] Authentication required - clearing auth state and redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login', { state: { message: 'Session expired or not authorized. Please log in.' } });
      }
    }
  };

  const processIncidents = (data) => {
    const incidentsList = data.content || data;
    setIncidents(Array.isArray(incidentsList) ? incidentsList : []);
  };

  const fetchIncidents = async () => {
    try {
      const response = await incidentAPI.getAllIncidents();
      processIncidents(response);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]); // Set empty array on error
    }
  };

  const processUnits = (availableVehicles) => {
    const units = availableVehicles.map(vehicle => ({
      id: vehicle.vehicleId,
      type: vehicle.vehicleType || vehicle.type || 'Unknown',
      count: 1,
      location: vehicle.stationName || 'Unknown',
      status: vehicle.status || 'Active'
    }));
    setEmergencyUnits(units);
  };

  const fetchUnits = async () => {
    try {
      const availableVehicles = await vehicleAPI.getVehiclesByStatus('AVAILABLE');
      processUnits(availableVehicles);
      setAvailableVehicles(availableVehicles);
    } catch (error) {
      console.error('Error fetching units:', error);
      setEmergencyUnits([]);
      setAvailableVehicles([]);
    }
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  const addAdmin = async () => {
    // Frontend validation
    if (!newAdmin.name || newAdmin.name.trim().length < 2) {
      alert('Name must be at least 2 characters long');
      return;
    }

    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!newAdmin.email || !emailRegex.test(newAdmin.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Password validation
    if (!newAdmin.password || newAdmin.password.length < 8 || newAdmin.password.length > 20) {
      alert('Password must be between 8-20 characters long');
      return;
    }
    if (!/[A-Z]/.test(newAdmin.password)) {
      alert('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(newAdmin.password)) {
      alert('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(newAdmin.password)) {
      alert('Password must contain at least one number');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':.,<>?]/.test(newAdmin.password)) {
      alert('Password must contain at least one special character (!@#$%^&*)');
      return;
    }

    try {
      const response = await adminAPI.createAdmin({
        name: newAdmin.name.trim(),
        email: newAdmin.email.trim().toLowerCase(),
        password: newAdmin.password
      });
      alert('Admin created successfully!');
      setNewAdmin({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      alert(error.message || 'Failed to create admin');
    }
  };

  const removeAdmin = async (adminId) => {
    try {
      // TODO: Backend endpoint for demoting admin doesn't exist yet
      // For now, just show a message
      alert('Admin removal feature is not yet implemented in the backend');
      // await adminAPI.demoteAdmin(adminId);
      // fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  const addUnit = async () => {
    if (!newUnit.type || newUnit.count <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    try {
      for (let i = 0; i < newUnit.count; i++) {
        const vehicleData = {
            vehicleType: newUnit.type,
            registrationNumber: `UNIT-${Math.floor(Math.random() * 100000)}`,
            status: 'AVAILABLE',
            capacity: 4,
            lastLatitude: parseFloat(newUnit.latitude.toFixed(6)),
            lastLongitude: parseFloat(newUnit.longitude.toFixed(6))
        };

        const createdVehicle = await vehicleAPI.createVehicle(vehicleData);

        // Initialize vehicle location in Redis
        if (createdVehicle.vehicleId) {
          try {
            const redisResponse = await fetch(`http://localhost:8080/test/vehicle-location/update/${createdVehicle.vehicleId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `latitude=${vehicleData.lastLatitude}&longitude=${vehicleData.lastLongitude}`
            });

            if (redisResponse.ok) {
              console.log(`Vehicle ${createdVehicle.vehicleId} added to Redis successfully`);
            } else {
              console.error(`Failed to add vehicle ${createdVehicle.vehicleId} to Redis:`, await redisResponse.text());
            }
          } catch (redisError) {
            console.error(`Redis error for vehicle ${createdVehicle.vehicleId}:`, redisError);
          }
        }
      }

      alert('Units created successfully!');

      // Force initialize all vehicles in Redis after creation
      try {
        const response = await fetch('http://localhost:8080/test/vehicle-location/init-all-vehicles', {
          method: 'POST'
        });
        const result = await response.json();
        console.log('Redis initialization result:', result.message);
      } catch (error) {
        console.error('Failed to initialize vehicles in Redis:', error);
      }

      setNewUnit({ type: 'AMBULANCE', count: 0, latitude: 30.0444, longitude: 31.2357 });
      fetchUnits();
    } catch (error) {
      console.error('Error adding unit:', error);
      alert(error.message || 'Failed to create unit');
    }
  };

  const removeUnit = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/test/vehicle-location/delete/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (response.ok) {
        alert('Unit removed successfully!');
        fetchUnits();
      } else {
        alert('Failed to remove unit: ' + result.error);
      }
    } catch (error) {
      console.error('Error removing unit:', error);
      alert('Failed to remove unit');
    }
  };

  const updateIncidentStatus = async (id, status) => {
    try {
      await incidentAPI.updateStatus(id, status);
      // Force refresh incidents immediately
      await fetchIncidents();
    } catch (error) {
      console.error('Error updating incident status:', error);
      alert('Failed to update incident status: ' + error.message);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await adminAPI.getPendingUsers();
      setPendingUsers(response);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setPendingUsers([]);
    }
  };

  const approveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      alert('User approved successfully!');
      fetchPendingUsers();
      fetchAdmins(); // Refresh admin list to show newly approved user
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user: ' + error.message);
    }
  };

  const rejectUser = async (userId) => {
    try {
      await adminAPI.rejectUser(userId);
      alert('User rejected successfully!');
      fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user: ' + error.message);
    }
  };

  const getPriorityLabel = (level) => {
    if (level >= 4) return 'Critical';
    if (level >= 3) return 'High';
    if (level >= 2) return 'Medium';
    return 'Low';
  };

  const handleAssignVehicle = (incident) => {
    setSelectedIncident(incident);
    setShowAssignModal(true);
  };

  const assignVehicleToIncident = async (vehicleId) => {
    try {
      await assignmentAPI.createAssignment({
        incidentId: selectedIncident.incidentId,
        vehicleId: vehicleId,
        assignedByUserId: userInfo?.userId || 1
      });
      alert('Vehicle assigned successfully!');
      setShowAssignModal(false);
      setSelectedIncident(null);
      fetchIncidents();
      fetchUnits();
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      alert('Failed to assign vehicle: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center space-x-6">
              <Notification />
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() :
                     userInfo?.email ? userInfo.email.charAt(0).toUpperCase() :
                     userInfo?.sub ? userInfo.sub.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() :
                           userInfo?.email ? userInfo.email.charAt(0).toUpperCase() :
                           userInfo?.sub ? userInfo.sub.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{userInfo?.name || userInfo?.sub || 'User'}</p>
                          <p className="text-sm text-gray-600">{userInfo?.email || userInfo?.username || 'No email'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          localStorage.clear();
                          navigate('/login');
                        }}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <nav className="flex space-x-8">
            {['incidents', 'admins', 'pending', 'units'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'units' ? 'Emergency Units' : tab === 'pending' ? 'Pending Users' : tab === 'reporters' ? 'Reporters' : tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'incidents' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reported Incidents</h2>
            <div className="emergency-item-container">
              {incidents.map(incident => (
                <div key={incident.incidentId} className="emergency-item">
                  <div className="emergency-header">
                    <h3>{incident.incidentType}</h3>
                    <span className="emergency-state">{getPriorityLabel(incident.severityLevel)}</span>
                  </div>
                  <p>
                    <strong>Location:</strong> {incident.latitude && incident.longitude
                      ? `${incident.latitude}, ${incident.longitude}`
                      : 'Location not specified'}
                  </p>
                  <p><strong>Description:</strong> {incident.description || 'No description provided'}</p>
                  <p><strong>Reported:</strong> {new Date(incident.timeReported).toLocaleString()}</p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
                      <select
                        value={incident.lifeCycleStatus}
                        onChange={(e) => updateIncidentStatus(incident.incidentId, e.target.value)}
                        className={`border rounded px-3 py-1 text-sm ${
                          incident.lifeCycleStatus === 'RESOLVED' ? 'bg-green-50 border-green-300' :
                          incident.lifeCycleStatus === 'ASSIGNED' ? 'bg-blue-50 border-blue-300' :
                          incident.lifeCycleStatus === 'CANCELLED' ? 'bg-red-50 border-red-300' :
                          'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <option value="REPORTED">Reported</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    {incident.lifeCycleStatus === 'REPORTED' && (
                      <button
                        onClick={() => handleAssignVehicle(incident)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mr-2"
                      >
                        Assign Vehicle
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this incident?')) {
                          try {
                            await fetch(`http://localhost:8080/api/incident/delete/${incident.incidentId}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                            });
                            fetchIncidents();
                          } catch (error) {
                            alert('Failed to delete incident');
                          }
                        }
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {incidents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No incidents reported
              </div>
            )}
          <div className="mt-6">
            <MapPage />
          </div>
          </div>
        )

        }

        {/* {activeTab === 'dispatch' && <DispatcherPage />} */}

        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pending User Registrations</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingUsers.map(user => (
                    <tr key={user.userId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => approveUser(user.userId)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectUser(user.userId)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendingUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pending user registrations
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Management</h2>
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3">Add New Admin</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                <button onClick={addAdmin} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Add Admin
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map(admin => (
                    <tr key={admin.userId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.fullName || admin.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {admin.email !== 'admin@emergency.gov' && admin.email !== userInfo?.sub && (
                          <button
                            onClick={() => removeAdmin(admin.userId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        )}
                        {admin.email === userInfo?.sub && admin.email !== 'admin@emergency.gov' && (
                          <span className="text-gray-400 text-sm">Current User</span>
                        )}
                        {admin.email === 'admin@emergency.gov' && (
                        <span className="text-gray-400 text-sm">System Admin</span>
                      )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Emergency Units Management</h2>
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3">Add New Unit</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <select
                  value={newUnit.type}
                  onChange={(e) => setNewUnit({...newUnit, type: e.target.value})}
                  className="border rounded px-3 py-2"
                  required
                >
                  <option value="AMBULANCE">Ambulance</option>
                  <option value="FIRE_TRUCK">Fire Truck</option>
                  <option value="POLICE_CAR">Police Car</option>
                </select>
                <input
                  type="number"
                  placeholder="Count"
                  value={newUnit.count}
                  onChange={(e) => setNewUnit({...newUnit, count: parseInt(e.target.value) || 0})}
                  className="border rounded px-3 py-2"
                  min="1"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Pick Location
                </button>
                <div className="text-sm text-gray-600">
                  Selected: Lat: {newUnit.latitude.toFixed(6)}, Lng: {newUnit.longitude.toFixed(6)}
                </div>
                <button onClick={addUnit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Add Unit
                </button>
              </div>
              <div className="mt-2">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:8080/test/vehicle-location/init-all-vehicles', {
                        method: 'POST'
                      });
                      const result = await response.json();
                      alert(result.message);
                    } catch (error) {
                      alert('Failed to initialize vehicles in Redis');
                    }
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Load All Vehicles to Map
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emergencyUnits.map(unit => (
                    <tr key={unit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{unit.status || 'Active'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => removeUnit(unit.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Assign Vehicle to {selectedIncident.incidentType} Incident
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Location: {selectedIncident.address?.latitude && selectedIncident.address?.longitude
                ? `${selectedIncident.address.latitude}, ${selectedIncident.address.longitude}`
                : 'Location not specified'}
            </p>
            <div className="space-y-2 mb-4">
              <h4 className="font-medium">Available Vehicles:</h4>
              {(() => {
                // Filter vehicles by incident type
                const incidentType = selectedIncident.incidentType?.toLowerCase();
                let filteredVehicles = availableVehicles;

                if (incidentType?.includes('police')) {
                  filteredVehicles = availableVehicles.filter(v => v.vehicleType === 'POLICE_CAR');
                } else if (incidentType?.includes('fire')) {
                  filteredVehicles = availableVehicles.filter(v => v.vehicleType === 'FIRE_TRUCK');
                } else if (incidentType?.includes('medical') || incidentType?.includes('ambulance')) {
                  filteredVehicles = availableVehicles.filter(v => v.vehicleType === 'AMBULANCE');
                }

                return filteredVehicles.length === 0 ? (
                  <p className="text-gray-500">No suitable vehicles available for this incident type</p>
                ) : (
                  filteredVehicles.map(vehicle => (
                    <div key={vehicle.vehicleId} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">{vehicle.registrationNumber}</span>
                        <span className="text-sm text-gray-500 ml-2">({vehicle.vehicleType})</span>
                      </div>
                      <button
                        onClick={() => assignVehicleToIncident(vehicle.vehicleId)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Assign
                      </button>
                    </div>
                  ))
                );
              })()}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedIncident(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-4/5 h-4/5 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Pick Vehicle Location</h3>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="h-96 mb-4">
              <LocationPickerMap
                initialPosition={[newUnit.latitude, newUnit.longitude]}
                onLocationSelect={(lat, lng) => {
                  setNewUnit({...newUnit, latitude: lat, longitude: lng});
                  setShowLocationPicker(false);
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowLocationPicker(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;