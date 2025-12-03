import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DispatcherPage from '../pages/DispatcherPage';
import { adminAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('incidents');
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [reporters, setReporters] = useState([]);
  const [newReporter, setNewReporter] = useState({ name: '', phone: '' });
  const [emergencyUnits, setEmergencyUnits] = useState([
    { id: 1, type: 'Ambulance', count: 10, status: 'Active' },
    { id: 2, type: 'Fire Truck', count: 5, status: 'Active' },
    { id: 3, type: 'Police Car', count: 8, status: 'Active' }
  ]);
  const [incidents, setIncidents] = useState([
    { id: 1, type: 'Medical', location: '123 Main St', status: 'Pending', priority: 'High' },
    { id: 2, type: 'Fire', location: '456 Oak Ave', status: 'Dispatched', priority: 'Critical' },
    { id: 3, type: 'Crime', location: '789 Pine Rd', status: 'Resolved', priority: 'Medium' }
  ]);

  const [newUnit, setNewUnit] = useState({ type: '', count: 0, location: '' });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      const userData = parseJwt(token);
      console.log('Parsed JWT user data:', userData);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUserInfo(userData);
      }
    } else {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');
      console.log('Stored user:', storedUser);
      console.log('Stored token:', storedToken);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed stored user:', parsedUser);
        setUserInfo(parsedUser);
      } else if (storedToken) {
        const userData = parseJwt(storedToken);
        console.log('Parsed token user data:', userData);
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          setUserInfo(userData);
        }
      }
    }
    console.log('Final userInfo:', userInfo);
    fetchAdmins();
    fetchIncidents();
    fetchUnits();
    fetchReporters();
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
      const users = await adminAPI.getUsers();
      setAdmins(users.filter(user => user.role === 'ADMINISTRATOR'));
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchIncidents = async () => {
    try {
      const data = await adminAPI.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const data = await adminAPI.getUnits();
      setEmergencyUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchReporters = async () => {
    try {
      const data = await adminAPI.getReporters();
      setReporters(data);
    } catch (error) {
      console.error('Error fetching reporters:', error);
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
      await adminAPI.demoteAdmin(adminId);
      alert('Admin removed successfully!');
      fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  const addUnit = async () => {
    if (!newUnit.type || !newUnit.location || newUnit.count <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }
    
    try {
      await adminAPI.createUnit({
        type: newUnit.type.trim(),
        count: newUnit.count,
        location: newUnit.location.trim()
      });
      alert('Unit created successfully!');
      setNewUnit({ type: '', count: 0, location: '' });
      fetchUnits();
    } catch (error) {
      console.error('Error adding unit:', error);
      alert(error.message || 'Failed to create unit');
    }
  };

  const removeUnit = async (id) => {
    try {
      await adminAPI.deleteUnit(id);
      fetchUnits();
    } catch (error) {
      console.error('Error removing unit:', error);
    }
  };

  const updateIncidentStatus = async (id, status) => {
    try {
      await adminAPI.updateIncidentStatus(id, status);
      fetchIncidents();
    } catch (error) {
      console.error('Error updating incident status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
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
          <nav className="flex space-x-8">
            {['incidents', 'dispatch', 'admins', 'units'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'units' ? 'Emergency Units' : tab === 'reporters' ? 'Reporters' : tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'incidents' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reported Incidents</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incidents.map(incident => (
                    <tr key={incident.incidentId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{incident.incidentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{incident.incidentType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          incident.severityLevel >= 4 ? 'bg-red-100 text-red-800' :
                          incident.severityLevel >= 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>Level {incident.severityLevel}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          incident.lifeCycleStatus === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          incident.lifeCycleStatus === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                          incident.lifeCycleStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{incident.lifeCycleStatus}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(incident.timeReported).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select 
                          value={incident.lifeCycleStatus}
                          onChange={(e) => updateIncidentStatus(incident.incidentId, e.target.value)}
                          className="border rounded px-2 py-1 text-xs"
                        >
                          <option value="REPORTED">Reported</option>
                          <option value="ASSIGNED">Assigned</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dispatch' && <DispatcherPage />}

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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Unit Type (Ambulance, Fire Truck, etc.)"
                  value={newUnit.type}
                  onChange={(e) => setNewUnit({...newUnit, type: e.target.value})}
                  className="border rounded px-3 py-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Count"
                  value={newUnit.count}
                  onChange={(e) => setNewUnit({...newUnit, count: parseInt(e.target.value) || 0})}
                  className="border rounded px-3 py-2"
                  min="1"
                  required
                />
                <input
                  type="text"
                  placeholder="Location/Station"
                  value={newUnit.location}
                  onChange={(e) => setNewUnit({...newUnit, location: e.target.value})}
                  className="border rounded px-3 py-2"
                  required
                />
                <button onClick={addUnit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Add Unit
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
    </div>
  );
};

export default Dashboard;