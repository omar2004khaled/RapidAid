import React, { useState } from "react";
import "../css/DispatcherCss.css";

function DispatcherPage() {
    const [vehicle_inventory, setVehicle_inventory] = useState([
        // Sample vehicle data
        { id: 1, type: 'Ambulance', inventory: '10' },
        { id: 2, type: 'Fire Truck', inventory: '5' },
        { id: 3, type: 'Police Car', inventory: '8' },
    ]);
    const [emergencyBoard, setEmergencyBoard] = useState([
        // Sample emergency data
        { id: 1, type: 'Medical', location: '123 Main St', des:"adawadaw", state: 'Very important', police: 0},
        { id: 2, type: 'Fire', location: '456 Oak Ave',des:"adawdaw" , state: 'Med',ambulance: 0 },
        { id: 3, type: 'Crime', location: '789 Pine Rd', des:"adawdaw", state: 'Not important',fire: 0},
        { id: 1, type: 'Medical', location: '123 Main St', des:"adawadaw", state: 'Very important', police: 0},
        { id: 2, type: 'Fire', location: '456 Oak Ave',des:"adawdaw" , state: 'Med',ambulance: 0 },
        { id: 3, type: 'Crime', location: '789 Pine Rd', des:"adawdaw", state: 'Not important',fire: 0},
        { id: 1, type: 'Medical', location: '123 Main St', des:"adawadaw", state: 'Very important', police: 0},
        { id: 2, type: 'Fire', location: '456 Oak Ave',des:"adawdaw" , state: 'Med',ambulance: 0 },
        { id: 3, type: 'Crime', location: '789 Pine Rd', des:"adawdaw", state: 'Not important',fire: 0},
    ]);

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

    const handleDispatch = (emergency) => {
        console.log('Dispatching:', emergency);
        alert(`Dispatching to ${emergency.location}:\n- Police: ${emergency.police}\n- Fire: ${emergency.fire}\n- Ambulance: ${emergency.ambulance}`);
    };
  return (
    <div>
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