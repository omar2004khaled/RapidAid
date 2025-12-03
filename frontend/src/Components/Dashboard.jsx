import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DispatcherPage from '../pages/DispatcherPage';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('incidents');
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
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

  const [newUnit, setNewUnit] = useState({ type: '', count: 0 });

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      const userData = parseJwt(token);
      if (userData) localStorage.setItem('user', JSON.stringify(userData));
    }
    fetchAdmins();
    fetchIncidents();
    fetchUnits();
  }, [searchParams]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (response.ok) {
        const users = await response.json();
        setAdmins(users.filter(user => user.role === 'ADMINISTRATOR'));
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/admin/incidents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch('/admin/units', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEmergencyUnits(data);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
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
    if (newAdmin.name && newAdmin.email && newAdmin.password) {
      try {
        const response = await fetch('/admin/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(newAdmin)
        });
        if (response.ok) {
          alert('Admin created successfully!');
          setNewAdmin({ name: '', email: '', password: '' });
          fetchAdmins();
        } else {
          const error = await response.text();
          alert(error);
        }
      } catch (error) {
        console.error('Error creating admin:', error);
      }
    }
  };

  const removeAdmin = async (adminId) => {
    try {
      const response = await fetch(`/admin/demote/${adminId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (response.ok) {
        alert('Admin removed successfully!');
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  const addUnit = async () => {
    if (newUnit.type && newUnit.count > 0) {
      try {
        const response = await fetch('/admin/units', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(newUnit)
        });
        if (response.ok) {
          setNewUnit({ type: '', count: 0 });
          fetchUnits();
        }
      } catch (error) {
        console.error('Error adding unit:', error);
      }
    }
  };

  const removeUnit = async (id) => {
    try {
      const response = await fetch(`/admin/units/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (response.ok) {
        fetchUnits();
      }
    } catch (error) {
      console.error('Error removing unit:', error);
    }
  };

  const updateIncidentStatus = async (id, status) => {
    try {
      const response = await fetch(`/admin/incidents/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchIncidents();
      }
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
            <button 
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
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
                {tab === 'units' ? 'Emergency Units' : tab}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incidents.map(incident => (
                    <tr key={incident.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{incident.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          incident.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          incident.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>{incident.priority}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          incident.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          incident.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{incident.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select 
                          value={incident.status}
                          onChange={(e) => updateIncidentStatus(incident.id, e.target.value)}
                          className="border rounded px-2 py-1 text-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Resolved">Resolved</option>
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
                <input
                  type="text"
                  placeholder="Name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="border rounded px-3 py-2"
                />
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
                    <tr key={admin.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {admin.email !== 'admin@emergency.gov' && (
                          <button 
                            onClick={() => removeAdmin(admin.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Unit Type"
                  value={newUnit.type}
                  onChange={(e) => setNewUnit({...newUnit, type: e.target.value})}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Count"
                  value={newUnit.count}
                  onChange={(e) => setNewUnit({...newUnit, count: parseInt(e.target.value) || 0})}
                  className="border rounded px-3 py-2"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emergencyUnits.map(unit => (
                    <tr key={unit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{unit.status}</span>
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