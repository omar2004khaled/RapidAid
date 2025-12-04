import React, { useState, useEffect, useRef } from "react";
import "../css/DispatcherCss.css";
import incidentAPI from '../services/incidentAPI';
import vehicleAPI from '../services/vehicleAPI';
import websocketService from '../services/websocketService';

function DispatcherPage() {
    const [vehicle_inventory, setVehicle_inventory] = useState([]);
    const [emergencyBoard, setEmergencyBoard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const incidentSubscriptionRef = useRef(null);
    const vehicleSubscriptionRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [incidentsData, availableVehicles] = await Promise.all([
                incidentAPI.getAllIncidents(),
                vehicleAPI.getVehiclesByStatus('AVAILABLE')
            ]);
            
            processIncidents(incidentsData);
            processVehicles(availableVehicles);
            setError('');
        } catch (err) {
            console.error('Error fetching dispatcher data:', err);
            setError('Failed to load data. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const processVehicles = (vehicles) => {
        // Group vehicles by type and count them for inventory display
        const vehicleGroups = vehicles.reduce((acc, vehicle) => {
            const type = vehicle.vehicleType || vehicle.type || 'Unknown';
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(vehicle);
            return acc;
        }, {});
        
        const transformedUnits = Object.entries(vehicleGroups).map(([type, vehicles]) => ({
            id: type,
            type: type,
            inventory: String(vehicles.length)
        }));
        setVehicle_inventory(transformedUnits);
    };

    const processIncidents = (incidentsData) => {
        // Extract incidents from paginated response and filter only active incidents
        const incidents = incidentsData.content || incidentsData;
        const activeIncidents = incidents.filter(incident => 
            incident.lifeCycleStatus === 'REPORTED' || 
            incident.lifeCycleStatus === 'ASSIGNED'
        );
        
        setEmergencyBoard(prevBoard => {
            return activeIncidents.map(incident => {
                // Check if we already have this incident in state
                const existing = prevBoard.find(e => e.id === incident.incidentId);
                
                return {
                    id: incident.incidentId,
                    type: incident.incidentType,
                    location: incident.address ? 
                        `${incident.address.street}, ${incident.address.city}` : 
                        'Location not specified',
                    des: 'Emergency incident',
                    state: getPriorityLabel(incident.severityLevel),
                    status: incident.lifeCycleStatus,
                    // Preserve local counts if they exist, otherwise 0
                    police: existing ? existing.police : 0,
                    fire: existing ? existing.fire : 0,
                    ambulance: existing ? existing.ambulance : 0
                };
            });
        });
    };

    useEffect(() => {
        fetchData();
        
        // Connect to WebSocket (will use existing connection if already connected)
        websocketService.connect(
            'http://localhost:8080/ws',
            () => {
                console.log('[Dispatcher] Connected to WebSocket');
                
                // Subscribe to incident updates
                incidentSubscriptionRef.current = websocketService.subscribe('/topic/incidents', (data) => {
                    console.log('[Dispatcher] Incident update received:', data);
                    processIncidents(data);
                });
                
                // Subscribe to vehicle updates
                vehicleSubscriptionRef.current = websocketService.subscribe('/topic/vehicles', (data) => {
                    console.log('[Dispatcher] Vehicle update received:', data);
                    processVehicles(data);
                });
            },
            (error) => {
                console.error('[Dispatcher] WebSocket connection error:', error);
            }
        );
        
        // Don't disconnect on unmount since Dashboard manages the connection
        return () => {
            // Unsubscribe from topics when component unmounts
            if (incidentSubscriptionRef.current) websocketService.unsubscribe(incidentSubscriptionRef.current);
            if (vehicleSubscriptionRef.current) websocketService.unsubscribe(vehicleSubscriptionRef.current);
        };
    }, []);
    
    const getPriorityLabel = (level) => {
        if (level >= 4) return 'Critical';
        if (level >= 3) return 'High';
        if (level >= 2) return 'Medium';
        return 'Low';
    };

    const getVehicleTypeMapping = (vehicleType) => {
        const mapping = {
            'police': 'Police Car',
            'fire': 'Fire Truck',
            'ambulance': 'Ambulance'
        };
        return mapping[vehicleType];
    };

    const updateVehicleCount = (emergencyId, vehicleType, delta) => {
        const vehicleName = getVehicleTypeMapping(vehicleType);
        const vehicle = vehicle_inventory.find(v => v.type === vehicleName);
        
        // Check if we have enough inventory when adding vehicles to emergency
        if (delta > 0 && parseInt(vehicle.inventory) <= 0) {
            alert(`No ${vehicleName} available!`);
            return;
        }

        // Check if we can subtract from emergency (can't go below 0)
        const emergency = emergencyBoard.find(e => e.id === emergencyId);
        if (delta < 0 && emergency[vehicleType] <= 0) {
            return;
        }

        // Update vehicle inventory
        setVehicle_inventory(prev => prev.map(v => {
            if (v.type === vehicleName) {
                return { ...v, inventory: String(parseInt(v.inventory) - delta) };
            }
            return v;
        }));

        // Update emergency board
        setEmergencyBoard(prev => prev.map(e => {
            if (e.id === emergencyId) {
                return { ...e, [vehicleType]: e[vehicleType] + delta };
            }
            return e;
        }));
    };

    const handleDispatch = async (emergency) => {
        try {
            const totalUnits = emergency.police + emergency.fire + emergency.ambulance;
            if (totalUnits === 0) {
                alert('Please assign at least one unit before dispatching.');
                return;
            }
            
            // TODO: Implement actual dispatch logic (assigning specific vehicles)
            // For now, we just update the status to ACCEPTED as a placeholder
            await incidentAPI.updateToAccepted(emergency.id);
            
            alert(`Successfully dispatched to ${emergency.location}:\n- Police: ${emergency.police}\n- Fire: ${emergency.fire}\n- Ambulance: ${emergency.ambulance}`);
            
            // Refresh data
            fetchData();
        } catch (err) {
            console.error('Error dispatching:', err);
            alert('Failed to dispatch: ' + err.message);
        }
    };
  if (loading && emergencyBoard.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading dispatcher data...</div>
      </div>
    );
  }

  return (
    <div>
        {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                    onClick={fetchData}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        )}
        <div className="dispatcher-content">
            <div className="vehicle-inventory">
                <h2>Vehicle Inventory</h2>
                <div className="vehicle-items-container">
                    {vehicle_inventory.map(vehicle => (
                        <div key={vehicle.id} className="vehicle-item">
                            <h3>{vehicle.type}</h3>
                            <p>{vehicle.inventory}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="emergency-board">
                <button>Filter</button>
                <button>Sort</button>
                <div className="emergency-item-container">
                    {emergencyBoard.map(emergency => (
                        <div key={emergency.id} className="emergency-item">
                            <div className="emergency-header">
                                <h3>{emergency.type}</h3>
                                <span className="emergency-state">{emergency.state}</span>
                            </div>
                            <p>Location: {emergency.location}</p>
                            <p>Description: {emergency.des}</p>
                            
                            <div className="vehicle-counters">
                                {'police' in emergency && (
                                    <div className="counter-row">
                                        <span>Police:</span>
                                        <div className="counter-controls">
                                            <button onClick={() => updateVehicleCount(emergency.id, 'police', -1)}>-</button>
                                            <span>{emergency.police}</span>
                                            <button onClick={() => updateVehicleCount(emergency.id, 'police', 1)}>+</button>
                                        </div>
                                    </div>
                                )}
                                {'fire' in emergency && (
                                    <div className="counter-row">
                                        <span>Fire:</span>
                                        <div className="counter-controls">
                                            <button onClick={() => updateVehicleCount(emergency.id, 'fire', -1)}>-</button>
                                            <span>{emergency.fire}</span>
                                            <button onClick={() => updateVehicleCount(emergency.id, 'fire', 1)}>+</button>
                                        </div>
                                    </div>
                                )}
                                {'ambulance' in emergency && (
                                    <div className="counter-row">
                                        <span>Ambulance:</span>
                                        <div className="counter-controls">
                                            <button onClick={() => updateVehicleCount(emergency.id, 'ambulance', -1)}>-</button>
                                            <span>{emergency.ambulance}</span>
                                            <button onClick={() => updateVehicleCount(emergency.id, 'ambulance', 1)}>+</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <button className="dispatch-btn" onClick={() => handleDispatch(emergency)}>Dispatch</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

export default DispatcherPage;