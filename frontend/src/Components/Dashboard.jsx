import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Shield,
  Flame,
  HeartPulse,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  XCircle,
  MapPin,
  Car,
  Users,
  Clock,
  AlertTriangle,
  X,
  RefreshCw,
  Send,
  Zap
} from 'lucide-react';
import Navbar from './Navbar';
import MapPage from '../pages/MapPage';
import LocationPickerMap from './LocationPickerMap';
import AnalyticsPage from '../pages/AnalyticsPage';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import adminAPI from '../services/adminAPI';
import incidentAPI from '../services/incidentAPI';
import vehicleAPI from '../services/vehicleAPI';
import assignmentAPI from '../services/assignmentAPI';
import websocketService from '../services/websocketService';
import jmeterAPI from '../services/jmeterAPI';
import automationAPI from '../services/automationAPI';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError, showWarning } = useToast();
  const { confirm } = useConfirm();

  const [activeTab, setActiveTab] = useState('incidents');
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [emergencyUnits, setEmergencyUnits] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [numberOfIncidents, setNumberOfIncidents] = useState('');
  const [numberOfVehicles, setNumberOfVehicles] = useState('');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [newUnit, setNewUnit] = useState({ type: 'AMBULANCE', count: 1, latitude: 30.0444, longitude: 31.2357 });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const incidentReportedSubRef = useRef(null);
  const incidentAcceptedSubRef = useRef(null);
  const vehicleSubRef = useRef(null);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

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
        try { setUserInfo(JSON.parse(storedUser)); } catch (e) {}
      } else if (storedToken) {
        const userData = parseJwt(storedToken);
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          setUserInfo(userData);
        }
      }
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchIncidents(),
      fetchUnits(),
      fetchAdmins(),
      fetchPendingUsers()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    websocketService.connect(
      'ws://localhost:8080/ws',
      () => {
        incidentReportedSubRef.current = websocketService.subscribe('/topic/incident/reported', () => {
          fetchIncidents();
        });
        incidentAcceptedSubRef.current = websocketService.subscribe('/topic/incident/accepted', () => {
          fetchIncidents();
        });
        vehicleSubRef.current = websocketService.subscribe('/topic/vehicle/available', (data) => {
          if (Array.isArray(data)) {
            processUnits(data);
          } else {
            fetchUnits();
          }
        });
      }
    );

    return () => {
      if (incidentReportedSubRef.current) websocketService.unsubscribe(incidentReportedSubRef.current);
      if (incidentAcceptedSubRef.current) websocketService.unsubscribe(incidentAcceptedSubRef.current);
      if (vehicleSubRef.current) websocketService.unsubscribe(vehicleSubRef.current);
    };
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await incidentAPI.getAllIncidents();
      const list = res?.content || res || [];
      setIncidents(Array.isArray(list) ? list : []);
    } catch (e) {
      setIncidents([]);
    }
  };

  const processUnits = (vehicles) => {
    const units = vehicles.map(v => ({
      id: v.vehicleId,
      type: v.vehicleType || v.type || 'Unknown',
      registrationNumber: v.registrationNumber,
      count: 1,
      location: (v.lastLatitude && v.lastLongitude)
        ? `${Number(v.lastLatitude).toFixed(4)}, ${Number(v.lastLongitude).toFixed(4)}`
        : 'Location unpinned',
      status: v.status || 'AVAILABLE'
    }));
    setEmergencyUnits(units);
  };

  const fetchUnits = async () => {
    try {
      const avail = await vehicleAPI.getVehiclesByStatus('AVAILABLE');
      if (Array.isArray(avail)) {
        processUnits(avail);
        setAvailableVehicles(avail);
      }
    } catch (e) {
      setEmergencyUnits([]);
      setAvailableVehicles([]);
    }
  };

  const fetchAdmins = async () => {
    try {
      const users = await adminAPI.getAllUsers();
      if (Array.isArray(users)) {
        setAdmins(users.filter(u => u.role === 'ADMINISTRATOR'));
      }
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('401') || msg.includes('403') || msg.toLowerCase().includes('denied')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const pending = await adminAPI.getPendingUsers();
      if (Array.isArray(pending)) {
        setPendingUsers(pending);
      }
    } catch (e) {
      setPendingUsers([]);
    }
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || newAdmin.name.trim().length < 2) {
      showError('Name must be at least 2 characters');
      return;
    }
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!newAdmin.email || !emailRegex.test(newAdmin.email)) {
      showError('Enter a valid email address');
      return;
    }
    if (!newAdmin.password || newAdmin.password.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    try {
      await adminAPI.createAdmin({
        name: newAdmin.name.trim(),
        email: newAdmin.email.trim().toLowerCase(),
        password: newAdmin.password
      });
      showSuccess('Administrator created successfully');
      setNewAdmin({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (e) {
      showError(e.message || 'Failed to create admin');
    }
  };

  const removeAdmin = async (adminId) => {
    const ok = await confirm('Are you sure you want to demote/remove this administrator?');
    if (!ok) return;

    try {
      await adminAPI.demoteAdmin(adminId);
      showSuccess('Administrator removed successfully');
      fetchAdmins();
    } catch (e) {
      showError(e.message || 'Failed to remove admin');
    }
  };

  const startSimulation = async () => {
    const incCount = parseInt(numberOfIncidents) || 0;
    const vehCount = parseInt(numberOfVehicles) || 0;

    if (incCount <= 0 && vehCount <= 0) {
      showWarning('Please enter a count for simulated incidents or vehicles.');
      return;
    }

    try {
      if (incCount > 0) {
        await jmeterAPI.createJmeterIncidents(incCount);
      }
      if (vehCount > 0) {
        await jmeterAPI.createJmeterVehicles(vehCount);
      }
      await automationAPI.setAutomation(true);
      showSuccess(`Simulation started! (${incCount} incidents, ${vehCount} vehicles)`);
      setNumberOfIncidents('');
      setNumberOfVehicles('');
      setTimeout(() => fetchData(), 2000);
    } catch (e) {
      showError(e.message || 'Simulation error');
    }
  };

  const addUnit = async () => {
    const count = parseInt(newUnit.count) || 1;
    if (count <= 0) {
      showWarning('Count must be at least 1');
      return;
    }

    try {
      for (let i = 0; i < count; i++) {
        const vehicleData = {
          vehicleType: newUnit.type,
          registrationNumber: `UNIT-${Math.floor(10000 + Math.random() * 90000)}`,
          status: 'AVAILABLE',
          capacity: 4,
          lastLatitude: parseFloat(newUnit.latitude.toFixed(6)),
          lastLongitude: parseFloat(newUnit.longitude.toFixed(6))
        };

        const created = await vehicleAPI.createVehicle(vehicleData);
        if (created?.vehicleId) {
          try {
            await fetch(`http://localhost:8080/test/vehicle-location/update/${created.vehicleId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `latitude=${vehicleData.lastLatitude}&longitude=${vehicleData.lastLongitude}`
            });
          } catch (err) {}
        }
      }

      showSuccess(`Successfully deployed ${count} ${newUnit.type} unit(s)!`);
      fetch(`http://localhost:8080/test/vehicle-location/init-all-vehicles`, { method: 'POST' }).catch(() => {});
      setNewUnit({ type: 'AMBULANCE', count: 1, latitude: 30.0444, longitude: 31.2357 });
      fetchUnits();
    } catch (e) {
      showError(e.message || 'Failed to create unit');
    }
  };

  const removeUnit = async (id) => {
    const ok = await confirm('Are you sure you want to decommission this vehicle unit?');
    if (!ok) return;

    try {
      const res = await fetch(`http://localhost:8080/test/vehicle-location/delete/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showSuccess('Unit decommissioned successfully');
        fetchUnits();
      } else {
        showError('Failed to remove unit');
      }
    } catch (e) {
      showError('Error removing vehicle unit');
    }
  };

  const updateIncidentStatus = async (id, status) => {
    try {
      await incidentAPI.updateStatus(id, status);
      showSuccess(`Incident #${id} status updated to ${status}`);
      fetchIncidents();
    } catch (e) {
      showError('Failed to update status: ' + e.message);
    }
  };

  const handleAssignVehicle = (incident) => {
    setSelectedIncident(incident);
    setShowAssignModal(true);
  };

  const assignVehicleToIncident = async (vehicleId) => {
    if (!selectedIncident) return;
    try {
      await assignmentAPI.createAssignment({
        incidentId: selectedIncident.incidentId,
        vehicleId: vehicleId,
        assignedByUserId: userInfo?.userId || 1
      });
      showSuccess(`Vehicle assigned to incident #${selectedIncident.incidentId}!`);
      setShowAssignModal(false);
      setSelectedIncident(null);
      fetchIncidents();
      fetchUnits();
    } catch (e) {
      showError(e.message || 'Failed to assign vehicle');
    }
  };

  const approveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      showSuccess('User approved successfully');
      fetchPendingUsers();
      fetchAdmins();
    } catch (e) {
      showError('Failed to approve: ' + e.message);
    }
  };

  const rejectUser = async (userId) => {
    const ok = await confirm('Reject and discard this user registration request?');
    if (!ok) return;
    try {
      await adminAPI.rejectUser(userId);
      showSuccess('User registration rejected');
      fetchPendingUsers();
    } catch (e) {
      showError('Failed to reject: ' + e.message);
    }
  };

  const getPriorityLabel = (level) => {
    if (level >= 4) return 'Critical';
    if (level >= 3) return 'High';
    if (level >= 2) return 'Medium';
    return 'Low';
  };

  return (
    <div className="min-h-screen bg-[#F8EDE3] text-[#283227] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#BDD2B6] overflow-x-auto pb-1">
          {[
            { id: 'incidents', label: 'Reported Incidents', icon: Flame, count: incidents.length },
            { id: 'units', label: 'Emergency Fleet', icon: Car, count: emergencyUnits.length },
            { id: 'admins', label: 'Command Staff', icon: Shield, count: admins.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                  active
                    ? 'border-[#798777] text-[#283227] bg-white shadow-sm'
                    : 'border-transparent text-[#5B6859] hover:text-[#283227] hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    active ? 'bg-[#BDD2B6]/50 text-[#283227] border border-[#A2B29F]' : 'bg-[#FAF5EF] text-[#5B6859] border border-[#BDD2B6]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: INCIDENTS & MAP */}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            {/* Simulation Controller Bar */}
            <div className="p-5 rounded-2xl bg-white border border-[#BDD2B6] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#798777]" />
                <h3 className="font-bold text-sm text-[#283227]">Emergency Dispatch Simulation Engine</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="number"
                  min="0"
                  placeholder="Simulate Incidents (Count)"
                  value={numberOfIncidents}
                  onChange={(e) => setNumberOfIncidents(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-[#F8EDE3]/40 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] text-xs focus:outline-none focus:border-[#798777] font-mono"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Simulate Vehicles (Count)"
                  value={numberOfVehicles}
                  onChange={(e) => setNumberOfVehicles(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-[#F8EDE3]/40 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] text-xs focus:outline-none focus:border-[#798777] font-mono"
                />
                <button
                  onClick={startSimulation}
                  className="h-11 rounded-xl bg-[#798777] hover:bg-[#687566] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#798777]/25 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Launch Live Simulation
                </button>
              </div>
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#283227]">Reported Emergency Calls</h2>
                  <p className="text-xs text-[#5B6859]">Manage triage and assign emergency vehicle dispatch</p>
                </div>
                <button
                  onClick={fetchIncidents}
                  className="p-2 rounded-xl text-[#5B6859] hover:text-[#283227] hover:bg-[#F8EDE3] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {incidents.length === 0 ? (
                <div className="py-12 text-center text-[#798777] text-sm bg-white rounded-2xl border border-[#BDD2B6]">
                  No emergency incidents reported
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incidents.map((incident) => {
                    const priority = getPriorityLabel(incident.severityLevel);
                    return (
                      <div
                        key={incident.incidentId}
                        className="p-5 rounded-2xl bg-white border border-[#BDD2B6] hover:border-[#A2B29F] shadow-sm space-y-3 flex flex-col justify-between transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-[#283227]">
                              {incident.incidentType} #{incident.incidentId}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                              priority === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              priority === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-[#BDD2B6]/40 text-[#283227] border border-[#BDD2B6]'
                            }`}>
                              {priority}
                            </span>
                          </div>

                          <div className="text-xs text-[#5B6859] space-y-1">
                            <p className="flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#798777] flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2 text-[#283227] font-medium">
                                {incident.address?.street || 'Location not specified'}
                                {incident.address?.latitude && incident.address?.longitude &&
                                  ` (${incident.address.latitude.toFixed(4)}, ${incident.address.longitude.toFixed(4)})`
                                }
                              </span>
                            </p>
                            <p className="text-[#5B6859] line-clamp-2">
                              {incident.description || 'No description provided'}
                            </p>
                            <p className="text-[10px] text-[#798777] font-mono">
                              Reported: {incident.timeReported ? new Date(incident.timeReported).toLocaleTimeString() : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#BDD2B6]/50 flex items-center justify-between gap-2">
                          <select
                            value={incident.lifeCycleStatus}
                            onChange={(e) => updateIncidentStatus(incident.incidentId, e.target.value)}
                            className="text-xs font-semibold rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] px-2.5 py-1.5 focus:outline-none focus:border-[#798777]"
                          >
                            <option value="REPORTED">REPORTED</option>
                            <option value="ASSIGNED">ASSIGNED</option>
                            <option value="RESOLVED">RESOLVED</option>
                          </select>

                          <div className="flex items-center gap-1.5">
                            {incident.lifeCycleStatus === 'REPORTED' && (
                              <button
                                onClick={() => handleAssignVehicle(incident)}
                                className="px-3 py-1.5 rounded-xl bg-[#798777] hover:bg-[#687566] text-white text-xs font-bold transition-all shadow-sm shadow-[#798777]/20"
                              >
                                Assign Unit
                              </button>
                            )}

                            <button
                              onClick={async () => {
                                const ok = await confirm(`Delete emergency incident #${incident.incidentId}?`);
                                if (ok) {
                                  try {
                                    await incidentAPI.deleteIncident(incident.incidentId);
                                    showSuccess('Incident deleted');
                                    fetchIncidents();
                                  } catch (e) {
                                    showError('Failed to delete incident');
                                  }
                                }
                              }}
                              className="p-1.5 text-[#798777] hover:text-rose-700 rounded-xl hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Embedded Live Map */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#283227]">Live Emergency Tactical Map</h2>
                  <p className="text-xs text-[#5B6859]">Real-time vehicle telemetry via Redis and active routing lines</p>
                </div>
              </div>
              <MapPage />
            </div>
          </div>
        )}

        {/* TAB 2: EMERGENCY FLEET UNITS */}
        {activeTab === 'units' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-[#BDD2B6] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#798777]" />
                  <h3 className="font-bold text-sm text-[#283227]">Deploy Emergency Fleet Units</h3>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('http://localhost:8080/test/vehicle-location/init-all-vehicles', { method: 'POST' });
                      const r = await res.json();
                      showSuccess(r.message || 'All vehicles loaded to Redis map');
                    } catch (e) {
                      showError('Failed to initialize Redis');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#BDD2B6] hover:bg-[#A2B29F] text-[#283227] text-xs font-bold shadow-sm transition-all"
                >
                  Sync Fleet to Map
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <select
                  value={newUnit.type}
                  onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value })}
                  className="h-11 px-3.5 rounded-xl bg-[#F8EDE3]/40 border border-[#BDD2B6] text-[#283227] text-xs font-semibold focus:outline-none focus:border-[#798777]"
                >
                  <option value="AMBULANCE">Ambulance (Medical)</option>
                  <option value="FIRE_TRUCK">Fire Truck (Fire/Rescue)</option>
                  <option value="POLICE_CAR">Police Car (Security)</option>
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Unit Count"
                  value={newUnit.count}
                  onChange={(e) => setNewUnit({ ...newUnit, count: parseInt(e.target.value) || 1 })}
                  className="h-11 px-3.5 rounded-xl bg-[#F8EDE3]/40 border border-[#BDD2B6] text-[#283227] text-xs font-mono focus:outline-none focus:border-[#798777]"
                />

                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="h-11 px-3.5 rounded-xl bg-[#F8EDE3] hover:bg-[#FAF5EF] border border-[#BDD2B6] text-xs font-semibold text-[#283227] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#798777]" />
                  Pick Coordinates
                </button>

                <div className="h-11 flex items-center px-3 rounded-xl bg-[#FAF5EF] border border-[#BDD2B6] text-xs text-[#5B6859] font-mono truncate">
                  {newUnit.latitude.toFixed(4)}, {newUnit.longitude.toFixed(4)}
                </div>

                <button
                  type="button"
                  onClick={addUnit}
                  className="h-11 rounded-xl bg-[#798777] hover:bg-[#687566] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#798777]/25 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Deploy Unit(s)
                </button>
              </div>
            </div>

            {/* Units Table */}
            <div className="bg-white rounded-2xl border border-[#BDD2B6] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#BDD2B6] flex items-center justify-between">
                <span className="font-bold text-sm text-[#283227]">Active Emergency Vehicles</span>
                <span className="text-xs text-[#5B6859] font-mono">{emergencyUnits.length} total units</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#BDD2B6]/40 text-left text-xs">
                  <thead className="bg-[#F8EDE3]/70 text-[#5B6859] uppercase font-bold">
                    <tr>
                      <th className="py-3 px-4">Call Sign</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Coordinates</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BDD2B6]/40 font-medium text-[#283227]">
                    {emergencyUnits.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[#798777]">No active vehicle units found</td>
                      </tr>
                    ) : (
                      emergencyUnits.map((unit) => (
                        <tr key={unit.id} className="hover:bg-[#F8EDE3]/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#283227]">
                            {unit.registrationNumber || `Unit #${unit.id}`}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                              unit.type === 'POLICE_CAR' ? 'bg-[#798777]/20 text-[#283227] border border-[#798777]/40' :
                              unit.type === 'FIRE_TRUCK' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              'bg-[#BDD2B6]/40 text-[#283227] border border-[#BDD2B6]'
                            }`}>
                              {unit.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#5B6859]">{unit.location}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#BDD2B6]/50 text-[#283227] border border-[#A2B29F]">
                              {unit.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => removeUnit(unit.id)}
                              className="text-rose-700 hover:text-rose-900 text-xs font-semibold transition-colors"
                            >
                              Decommission
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN MANAGEMENT */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-[#BDD2B6] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#798777]" />
                <h3 className="font-bold text-sm text-[#283227]">Commission New Administrator</h3>
              </div>
              <form onSubmit={addAdmin} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  required
                  className="h-11 px-4 rounded-xl bg-[#F8EDE3]/40 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] text-xs focus:outline-none focus:border-[#798777]"
                />
                <input
                  type="email"
                  placeholder="Official Email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  required
                  className="h-11 px-4 rounded-xl bg-[#F8EDE3]/40 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] text-xs focus:outline-none focus:border-[#798777]"
                />
                <input
                  type="password"
                  placeholder="Temporary Password (8+ chars)"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                  className="h-11 px-4 rounded-xl bg-[#F8EDE3]/40 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] text-xs font-mono focus:outline-none focus:border-[#798777]"
                />
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-[#798777] hover:bg-[#687566] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#798777]/25 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Grant Admin Role
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-[#BDD2B6] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#BDD2B6]">
                <span className="font-bold text-sm text-[#283227]">Active System Administrators</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#BDD2B6]/40 text-left text-xs">
                  <thead className="bg-[#F8EDE3]/70 text-[#5B6859] uppercase font-bold">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BDD2B6]/40 font-medium text-[#283227]">
                    {admins.map((admin) => {
                      const isMe = admin.email === userInfo?.sub || admin.email === userInfo?.email;
                      const isRoot = admin.email === 'admin@emergency.gov';
                      return (
                        <tr key={admin.userId} className="hover:bg-[#F8EDE3]/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#283227]">
                            {admin.fullName || admin.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#5B6859]">{admin.email}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#BDD2B6]/40 text-[#283227] border border-[#A2B29F]">
                              {admin.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isRoot ? (
                              <span className="text-[#798777] text-xs">Root Administrator</span>
                            ) : isMe ? (
                              <span className="text-[#5B6859] text-xs font-semibold">Active Session</span>
                            ) : (
                              <button
                                onClick={() => removeAdmin(admin.userId)}
                                className="text-rose-700 hover:text-rose-900 text-xs font-semibold transition-colors"
                              >
                                Revoke Access
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ASSIGN VEHICLE TO INCIDENT */}
      {showAssignModal && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2119]/50 backdrop-blur-sm">
          <div className="bg-white border border-[#BDD2B6] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-[#BDD2B6] pb-4">
              <div>
                <h3 className="font-bold text-base text-[#283227]">
                  Assign Unit to Incident #{selectedIncident.incidentId}
                </h3>
                <p className="text-xs text-[#5B6859] mt-0.5">
                  Type: {selectedIncident.incidentType} &bull; Priority: {getPriorityLabel(selectedIncident.severityLevel)}
                </p>
              </div>
              <button
                onClick={() => { setShowAssignModal(false); setSelectedIncident(null); }}
                className="p-1.5 rounded-xl text-[#5B6859] hover:text-[#283227] hover:bg-[#F8EDE3] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6859]">
                Available Compatible Fleet:
              </span>

              {(() => {
                const incType = (selectedIncident.incidentType || '').toLowerCase();
                let filtered = availableVehicles;
                if (incType.includes('police')) {
                  filtered = availableVehicles.filter(v => v.vehicleType === 'POLICE_CAR');
                } else if (incType.includes('fire')) {
                  filtered = availableVehicles.filter(v => v.vehicleType === 'FIRE_TRUCK');
                } else if (incType.includes('medical') || incType.includes('ambulance')) {
                  filtered = availableVehicles.filter(v => v.vehicleType === 'AMBULANCE');
                }

                if (filtered.length === 0) {
                  return (
                    <div className="p-4 rounded-xl bg-[#FAF5EF] border border-[#BDD2B6] text-center text-xs text-[#5B6859]">
                      No compatible units currently in READY state.
                    </div>
                  );
                }

                return (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {filtered.map((v) => (
                      <div
                        key={v.vehicleId}
                        className="p-3.5 rounded-xl border border-[#BDD2B6] bg-[#FAF5EF] flex items-center justify-between hover:border-[#A2B29F] transition-colors"
                      >
                        <div>
                          <p className="font-bold text-xs text-[#283227]">
                            {v.registrationNumber || `Unit #${v.vehicleId}`}
                          </p>
                          <p className="text-[10px] text-[#5B6859] font-mono">
                            Type: {v.vehicleType}
                          </p>
                        </div>
                        <button
                          onClick={() => assignVehicleToIncident(v.vehicleId)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#798777] hover:bg-[#687566] text-white text-xs font-bold transition-all shadow-sm shadow-[#798777]/20"
                        >
                          Dispatch Unit
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#BDD2B6]">
              <button
                onClick={() => { setShowAssignModal(false); setSelectedIncident(null); }}
                className="px-5 py-2 rounded-xl bg-[#F8EDE3] text-xs font-semibold text-[#283227] hover:bg-[#FAF5EF] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOCATION PICKER */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2119]/50 backdrop-blur-sm">
          <div className="bg-white border border-[#BDD2B6] rounded-3xl w-full max-w-3xl h-[550px] flex flex-col overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-4 border-b border-[#BDD2B6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#798777]" />
                <h3 className="font-bold text-[#283227] text-sm">Select Deployment Station Coordinates</h3>
              </div>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="p-1 rounded-lg text-[#5B6859] hover:text-[#283227] hover:bg-[#F8EDE3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 relative">
              <LocationPickerMap
                initialPosition={[newUnit.latitude, newUnit.longitude]}
                onLocationSelect={(lat, lng) => {
                  setNewUnit(prev => ({ ...prev, latitude: lat, longitude: lng }));
                }}
              />
            </div>
            <div className="p-4 border-t border-[#BDD2B6] flex items-center justify-between bg-[#F8EDE3]">
              <span className="text-xs text-[#5B6859] font-mono">
                Coordinates: {newUnit.latitude.toFixed(5)}, {newUnit.longitude.toFixed(5)}
              </span>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="px-5 py-2 rounded-xl bg-[#798777] hover:bg-[#687566] text-white text-xs font-bold shadow-md shadow-[#798777]/25"
              >
                Confirm Placement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
