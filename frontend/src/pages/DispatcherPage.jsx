import React, { useState, useEffect, useRef } from "react";
import { Shield, Flame, HeartPulse, Send, AlertTriangle, Filter, ArrowUpDown, RefreshCw } from "lucide-react";
import Navbar from "../Components/Navbar";
import { useToast } from "../contexts/ToastContext";
import incidentAPI from '../services/incidentAPI';
import vehicleAPI from '../services/vehicleAPI';
import assignmentAPI from '../services/assignmentAPI';
import websocketService from '../services/websocketService';

function DispatcherPage() {
  const { showSuccess, showError, showWarning } = useToast();
  const [vehicleInventory, setVehicleInventory] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [emergencyBoard, setEmergencyBoard] = useState([]);
  const [incidentsMap, setIncidentsMap] = useState({ reported: [], accepted: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortByPriority, setSortByPriority] = useState(false);

  const reportedSubscriptionRef = useRef(null);
  const acceptedSubscriptionRef = useRef(null);
  const vehicleSubscriptionRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incidentsData, vehiclesData] = await Promise.all([
        incidentAPI.getAllIncidents().catch(() => []),
        vehicleAPI.getVehiclesByStatus('AVAILABLE').catch(() => [])
      ]);

      const incidents = incidentsData?.content || incidentsData || [];
      const reported = incidents.filter(i => i.lifeCycleStatus === 'REPORTED');
      const accepted = incidents.filter(i => i.lifeCycleStatus === 'ACCEPTED' || i.lifeCycleStatus === 'ASSIGNED');

      setIncidentsMap({ reported, accepted });
      processVehicles(vehiclesData || []);
      setError('');
    } catch (err) {
      console.error('Error fetching dispatcher data:', err);
      setError('Failed to load dispatch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const processVehicles = (vehicles) => {
    setAvailableVehicles(vehicles);
    const groups = vehicles.reduce((acc, vehicle) => {
      const type = vehicle.vehicleType || vehicle.type || 'Unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(vehicle);
      return acc;
    }, {});

    const inventory = [
      { type: 'POLICE_CAR', label: 'Police Cruisers', count: (groups['POLICE_CAR'] || []).length, color: 'blue' },
      { type: 'FIRE_TRUCK', label: 'Fire Engines', count: (groups['FIRE_TRUCK'] || []).length, color: 'red' },
      { type: 'AMBULANCE', label: 'Ambulance Units', count: (groups['AMBULANCE'] || []).length, color: 'emerald' },
    ];
    setVehicleInventory(inventory);
  };

  const getPriorityLabel = (level) => {
    if (level >= 4) return 'Critical';
    if (level >= 3) return 'High';
    if (level >= 2) return 'Medium';
    return 'Low';
  };

  useEffect(() => {
    const activeIncidents = [...incidentsMap.reported, ...incidentsMap.accepted];

    setEmergencyBoard(prevBoard => {
      return activeIncidents.map(incident => {
        const existing = prevBoard.find(e => e.id === incident.incidentId);
        return {
          id: incident.incidentId,
          type: incident.incidentType || 'MEDICAL',
          location: incident.address?.street
            ? `${incident.address.street} (${incident.address.latitude?.toFixed(4)}, ${incident.address.longitude?.toFixed(4)})`
            : (incident.latitude && incident.longitude) ? `${incident.latitude}, ${incident.longitude}` : 'Location unpinned',
          description: incident.description || 'Emergency incident call',
          severityLevel: incident.severityLevel || 2,
          state: getPriorityLabel(incident.severityLevel),
          status: incident.lifeCycleStatus,
          police: existing ? existing.police : 0,
          fire: existing ? existing.fire : 0,
          ambulance: existing ? existing.ambulance : 0
        };
      });
    });
  }, [incidentsMap]);

  useEffect(() => {
    fetchData();

    websocketService.connect(
      'ws://localhost:8080/ws',
      () => {
        reportedSubscriptionRef.current = websocketService.subscribe('/topic/incident/reported', (data) => {
          if (Array.isArray(data)) {
            setIncidentsMap(prev => ({ ...prev, reported: data }));
          } else {
            fetchData();
          }
        });

        acceptedSubscriptionRef.current = websocketService.subscribe('/topic/incident/accepted', (data) => {
          if (Array.isArray(data)) {
            setIncidentsMap(prev => ({ ...prev, accepted: data }));
          } else {
            fetchData();
          }
        });

        vehicleSubscriptionRef.current = websocketService.subscribe('/topic/vehicle/available', (data) => {
          if (Array.isArray(data)) {
            processVehicles(data);
          } else {
            fetchData();
          }
        });
      }
    );

    return () => {
      if (reportedSubscriptionRef.current) websocketService.unsubscribe(reportedSubscriptionRef.current);
      if (acceptedSubscriptionRef.current) websocketService.unsubscribe(acceptedSubscriptionRef.current);
      if (vehicleSubscriptionRef.current) websocketService.unsubscribe(vehicleSubscriptionRef.current);
    };
  }, []);

  const getVehicleTypeKey = (key) => {
    const map = {
      police: 'POLICE_CAR',
      fire: 'FIRE_TRUCK',
      ambulance: 'AMBULANCE'
    };
    return map[key];
  };

  const updateVehicleCount = (emergencyId, vehicleTypeKey, delta) => {
    const vType = getVehicleTypeKey(vehicleTypeKey);
    const item = vehicleInventory.find(v => v.type === vType);

    if (delta > 0 && (!item || item.count <= 0)) {
      showWarning(`No available ${item?.label || vType} in active fleet!`);
      return;
    }

    const emergency = emergencyBoard.find(e => e.id === emergencyId);
    if (delta < 0 && emergency[vehicleTypeKey] <= 0) {
      return;
    }

    setVehicleInventory(prev => prev.map(v => {
      if (v.type === vType) {
        return { ...v, count: v.count - delta };
      }
      return v;
    }));

    setEmergencyBoard(prev => prev.map(e => {
      if (e.id === emergencyId) {
        return { ...e, [vehicleTypeKey]: e[vehicleTypeKey] + delta };
      }
      return e;
    }));
  };

  const handleDispatch = async (emergency) => {
    const totalUnits = emergency.police + emergency.fire + emergency.ambulance;
    if (totalUnits === 0) {
      showWarning('Assign at least one unit before transmitting dispatch orders.');
      return;
    }

    const assignments = [];

    if (emergency.police > 0) {
      const p = availableVehicles.filter(v => v.vehicleType === 'POLICE_CAR').slice(0, emergency.police);
      p.forEach(v => assignments.push({ incidentId: emergency.id, vehicleId: v.vehicleId }));
    }

    if (emergency.fire > 0) {
      const f = availableVehicles.filter(v => v.vehicleType === 'FIRE_TRUCK').slice(0, emergency.fire);
      f.forEach(v => assignments.push({ incidentId: emergency.id, vehicleId: v.vehicleId }));
    }

    if (emergency.ambulance > 0) {
      const a = availableVehicles.filter(v => v.vehicleType === 'AMBULANCE').slice(0, emergency.ambulance);
      a.forEach(v => assignments.push({ incidentId: emergency.id, vehicleId: v.vehicleId }));
    }

    if (assignments.length < totalUnits) {
      showError('Fleet shortage: Not enough specific vehicles to satisfy dispatch quota.');
      return;
    }

    try {
      await Promise.all(assignments.map(a => assignmentAPI.createAssignment(a)));
      showSuccess(`Dispatched ${totalUnits} units to Incident #${emergency.id}!`);
      fetchData();
    } catch (err) {
      showError('Failed to complete dispatch: ' + err.message);
    }
  };

  let displayedBoard = [...emergencyBoard];
  if (filterType !== 'ALL') {
    displayedBoard = displayedBoard.filter(e => e.type.toUpperCase() === filterType);
  }
  if (sortByPriority) {
    displayedBoard.sort((a, b) => (b.severityLevel || 0) - (a.severityLevel || 0));
  }

  return (
    <div className="min-h-screen bg-[#F8EDE3] text-[#283227]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#283227]">
              Dispatcher Command Board
            </h1>
            <p className="text-sm text-[#5B6859]">
              Live fleet inventory allocation and incident assignment controller
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#BDD2B6] text-xs font-semibold text-[#5B6859] hover:text-[#283227] hover:bg-[#BDD2B6]/20 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Board
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Fleet Inventory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {vehicleInventory.map((item) => (
            <div
              key={item.type}
              className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl ${
                  item.type === 'POLICE_CAR'
                    ? 'bg-[#BDD2B6]/40 text-[#283227] border border-[#A2B29F]'
                    : item.type === 'FIRE_TRUCK'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-[#BDD2B6]/60 text-[#798777] border border-[#A2B29F]'
                }`}>
                  {item.type === 'POLICE_CAR' && <Shield className="w-6 h-6" />}
                  {item.type === 'FIRE_TRUCK' && <Flame className="w-6 h-6" />}
                  {item.type === 'AMBULANCE' && <HeartPulse className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#283227]">{item.label}</h3>
                  <p className="text-xs text-[#5B6859]">Available Ready Fleet</p>
                </div>
              </div>
              <div className="text-3xl font-black font-mono text-[#283227]">
                {item.count}
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Incidents Board */}
        <div className="bg-white rounded-3xl border border-[#BDD2B6] shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#BDD2B6] pb-5">
            <div>
              <h2 className="text-lg font-bold text-[#283227]">Active Emergency Incidents</h2>
              <p className="text-xs text-[#5B6859]">Manage required responding units and execute immediate dispatch orders</p>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F8EDE3] border border-[#BDD2B6] text-xs">
                <Filter className="w-3.5 h-3.5 text-[#5B6859]" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none border-none p-0 text-[#283227]"
                >
                  <option value="ALL">All Services</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="FIRE">Fire</option>
                  <option value="POLICE">Police</option>
                </select>
              </div>

              <button
                onClick={() => setSortByPriority(!sortByPriority)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  sortByPriority
                    ? 'bg-[#798777] text-white border-[#798777] shadow-sm'
                    : 'bg-[#F8EDE3] border-[#BDD2B6] text-[#5B6859] hover:text-[#283227]'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort Priority
              </button>
            </div>
          </div>

          {displayedBoard.length === 0 ? (
            <div className="py-16 text-center text-[#5B6859] text-sm">
              No active emergency incidents waiting on dispatch board
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedBoard.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-[#BDD2B6] bg-[#F8EDE3]/35 hover:bg-[#F8EDE3]/70 hover:border-[#A2B29F] hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        item.type.includes('POLICE')
                          ? 'bg-[#BDD2B6]/50 text-[#283227] border border-[#A2B29F]'
                          : item.type.includes('FIRE')
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-[#BDD2B6]/60 text-[#283227] border border-[#A2B29F]'
                      }`}>
                        {item.type} #{item.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        item.state === 'Critical' ? 'bg-red-100 text-red-700 border border-red-300' :
                        item.state === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-white text-[#5B6859] border border-[#BDD2B6]'
                      }`}>
                        {item.state}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-[#5B6859]">
                      Status: {item.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-[#5B6859] font-medium">
                      Location: <span className="text-[#283227]">{item.location}</span>
                    </p>
                    <p className="text-[#5B6859] font-medium">
                      Description: <span className="text-[#283227]">{item.description}</span>
                    </p>
                  </div>

                  {/* Vehicle Counters */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#BDD2B6] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6859]">
                      Unit Allocation Counters:
                    </span>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#BDD2B6]/50 text-xs font-semibold">
                      <span className="flex items-center gap-2 text-[#283227]">
                        <Shield className="w-3.5 h-3.5 text-[#798777]" /> Police Units
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <button
                          onClick={() => updateVehicleCount(item.id, 'police', -1)}
                          className="w-7 h-7 rounded-lg bg-[#F8EDE3] hover:bg-[#ebdcd0] text-[#283227] flex items-center justify-center font-bold text-sm border border-[#BDD2B6] transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-[#283227]">{item.police}</span>
                        <button
                          onClick={() => updateVehicleCount(item.id, 'police', 1)}
                          className="w-7 h-7 rounded-lg bg-[#798777] hover:bg-[#687566] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#BDD2B6]/50 text-xs font-semibold">
                      <span className="flex items-center gap-2 text-[#283227]">
                        <Flame className="w-3.5 h-3.5 text-red-500" /> Fire Engines
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <button
                          onClick={() => updateVehicleCount(item.id, 'fire', -1)}
                          className="w-7 h-7 rounded-lg bg-[#F8EDE3] hover:bg-[#ebdcd0] text-[#283227] flex items-center justify-center font-bold text-sm border border-[#BDD2B6] transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-[#283227]">{item.fire}</span>
                        <button
                          onClick={() => updateVehicleCount(item.id, 'fire', 1)}
                          className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold text-sm shadow-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5 text-xs font-semibold">
                      <span className="flex items-center gap-2 text-[#283227]">
                        <HeartPulse className="w-3.5 h-3.5 text-[#798777]" /> Ambulances
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <button
                          onClick={() => updateVehicleCount(item.id, 'ambulance', -1)}
                          className="w-7 h-7 rounded-lg bg-[#F8EDE3] hover:bg-[#ebdcd0] text-[#283227] flex items-center justify-center font-bold text-sm border border-[#BDD2B6] transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-[#283227]">{item.ambulance}</span>
                        <button
                          onClick={() => updateVehicleCount(item.id, 'ambulance', 1)}
                          className="w-7 h-7 rounded-lg bg-[#798777] hover:bg-[#687566] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDispatch(item)}
                    className="w-full h-11 rounded-xl bg-[#798777] hover:bg-[#687566] text-white font-bold text-xs shadow-md shadow-[#798777]/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Transmit Vehicle Dispatch Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DispatcherPage;