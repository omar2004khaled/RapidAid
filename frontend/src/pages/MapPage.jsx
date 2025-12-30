import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import incidentAPI from '../services/incidentAPI';
import vehicleAPI from '../services/vehicleAPI';
import "leaflet/dist/leaflet.css";

/** Helper: build a Leaflet divIcon from SVG */
function svgIcon(svg, { size = 44, anchorX = size / 2, anchorY = size } = {}) {
  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [size, size],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -anchorY],
  });
}

/** ===== INCIDENT ICONS ===== */
const incidentPoliceIcon = svgIcon(
  `
  <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shP" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
    </defs>

    <!-- badge -->
    <path filter="url(#shP)"
      d="M22 4
         C17 7, 12 8, 9 9
         V20
         C9 30, 16 37, 22 40
         C28 37, 35 30, 35 20
         V9
         C32 8, 27 7, 22 4 Z"
      fill="#1e3a8a"/>
    <path
      d="M22 8
         C18 10.5, 14.5 11.2, 12 12
         V20
         C12 28, 17.6 33.7, 22 36
         C26.4 33.7, 32 28, 32 20
         V12
         C29.5 11.2, 26 10.5, 22 8 Z"
      fill="rgba(255,255,255,0.12)"/>

    <!-- star -->
    <path d="M22 13.5 L23.8 17.3 L27.9 17.7 L24.7 20.4 L25.7 24.4 L22 22.2 L18.3 24.4 L19.3 20.4 L16.1 17.7 L20.2 17.3 Z"
      fill="white" opacity="0.95"/>
    <circle cx="22" cy="20.5" r="2" fill="#1e3a8a" opacity="0.9"/>
  </svg>
  `,
  { size: 44, anchorX: 22, anchorY: 42 }
);

const incidentFireIcon = svgIcon(
  `
  <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shF" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
    </defs>

    <!-- circle badge -->
    <circle cx="22" cy="22" r="18" fill="#b91c1c" filter="url(#shF)"/>
    <circle cx="22" cy="22" r="15.5" fill="rgba(255,255,255,0.12)"/>

    <!-- flame -->
    <path d="M22 10
             C18 14, 26 15, 19 22
             C15.5 25.5, 16 32, 22 34
             C28 32, 29 26, 26 22
             C24 18.5, 28 16, 22 10 Z"
          fill="white" opacity="0.95"/>
    <path d="M22 18
             C20.5 20, 23.5 21, 21.3 23.5
             C20 25, 20.3 28, 22 28.6
             C23.7 28, 24.2 25.6, 23 23.4
             C22.4 22.2, 23.2 21, 22 18 Z"
          fill="#b91c1c" opacity="0.85"/>
  </svg>
  `,
  { size: 44, anchorX: 22, anchorY: 42 }
);

const incidentAmbulanceIcon = svgIcon(
  `
  <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shA" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
    </defs>

    <!-- pin -->
    <path filter="url(#shA)"
      d="M22 4
         C14 4, 8 10, 8 18
         C8 29, 22 40, 22 40
         C22 40, 36 29, 36 18
         C36 10, 30 4, 22 4 Z"
      fill="#047857"/>
    <circle cx="22" cy="18" r="11" fill="rgba(255,255,255,0.14)"/>

    <!-- medical cross -->
    <rect x="19.5" y="11.5" width="5" height="13" rx="1.2" fill="white"/>
    <rect x="15.5" y="15.5" width="13" height="5" rx="1.2" fill="white"/>
  </svg>
  `,
  { size: 44, anchorX: 22, anchorY: 42 }
);

/** ===== VEHICLE ICONS (real vehicles) ===== */
const policeCarIcon = svgIcon(
  `
  <svg width="46" height="46" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shVC1" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
    </defs>

    <!-- pin base -->
    <path filter="url(#shVC1)"
      d="M23 3
         C14.5 3, 8 9.5, 8 18
         C8 30, 23 43, 23 43
         C23 43, 38 30, 38 18
         C38 9.5, 31.5 3, 23 3 Z"
      fill="#2563eb"/>
    <circle cx="23" cy="18.5" r="11.5" fill="rgba(255,255,255,0.16)"/>

    <!-- police car body -->
    <path d="M16 20.2 L17.6 17.2 C18 16.5 18.7 16 19.5 16H26.5
             C27.3 16 28 16.5 28.4 17.2L30 20.2
             C31.4 20.5 32.3 21.5 32.3 22.9V25.2
             C32.3 25.7 31.9 26.1 31.4 26.1H30.3
             C29.9 26.1 29.6 25.9 29.5 25.6L29.1 24.8H16.9
             L16.5 25.6C16.4 25.9 16.1 26.1 15.7 26.1H14.6
             C14.1 26.1 13.7 25.7 13.7 25.2V22.9
             C13.7 21.5 14.6 20.5 16 20.2Z"
          fill="white" opacity="0.96"/>

    <!-- stripe -->
    <path d="M17.8 21.2H28.2" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" opacity="0.9"/>

    <!-- lightbar -->
    <rect x="20" y="14.2" width="6" height="2.4" rx="1.1" fill="white" opacity="0.95"/>
    <rect x="20" y="14.2" width="3" height="2.4" rx="1.1" fill="#ef4444" opacity="0.95"/>
    <rect x="23" y="14.2" width="3" height="2.4" rx="1.1" fill="#60a5fa" opacity="0.95"/>

    <!-- wheels -->
    <circle cx="17.6" cy="25.3" r="1.5" fill="#2563eb" opacity="0.9"/>
    <circle cx="28.4" cy="25.3" r="1.5" fill="#2563eb" opacity="0.9"/>
  </svg>
  `,
  { size: 46, anchorX: 23, anchorY: 44 }
);

const ambulanceVehicleIcon = svgIcon(
  `
  <svg width="46" height="46" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shVC2" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
    </defs>

    <!-- pin base -->
    <path filter="url(#shVC2)"
      d="M23 3
         C14.5 3, 8 9.5, 8 18
         C8 30, 23 43, 23 43
         C23 43, 38 30, 38 18
         C38 9.5, 31.5 3, 23 3 Z"
      fill="#10b981"/>
    <circle cx="23" cy="18.5" r="11.5" fill="rgba(255,255,255,0.16)"/>

    <!-- ambulance van -->
    <rect x="14.5" y="18" width="17" height="8" rx="2" fill="white" opacity="0.96"/>
    <rect x="14.5" y="16.2" width="10.5" height="3.2" rx="1.6" fill="white" opacity="0.96"/>
    <rect x="26.2" y="18.8" width="4.8" height="2.8" rx="1.2" fill="rgba(16,185,129,0.25)"/>

    <!-- cross -->
    <rect x="20.7" y="19.2" width="2.6" height="5.6" rx="0.8" fill="#10b981"/>
    <rect x="18.7" y="21.2" width="6.6" height="2.6" rx="0.8" fill="#10b981"/>

    <!-- siren -->
    <rect x="19.5" y="15.1" width="7" height="2.2" rx="1.1" fill="#ef4444" opacity="0.95"/>

    <!-- wheels -->
    <circle cx="18" cy="26.2" r="1.5" fill="#10b981" opacity="0.9"/>
    <circle cx="28" cy="26.2" r="1.5" fill="#10b981" opacity="0.9"/>
  </svg>
  `,
  { size: 46, anchorX: 23, anchorY: 44 }
);

const fireTruckIcon = svgIcon(
  `
  <svg width="46" height="46" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shVC3" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
    </defs>

    <!-- pin base -->
    <path filter="url(#shVC3)"
      d="M23 3
         C14.5 3, 8 9.5, 8 18
         C8 30, 23 43, 23 43
         C23 43, 38 30, 38 18
         C38 9.5, 31.5 3, 23 3 Z"
      fill="#ef4444"/>
    <circle cx="23" cy="18.5" r="11.5" fill="rgba(255,255,255,0.16)"/>

    <!-- fire truck body -->
    <rect x="14.2" y="18.2" width="18.2" height="7.8" rx="2" fill="white" opacity="0.96"/>
    <rect x="25.4" y="16" width="7" height="4.2" rx="1.6" fill="white" opacity="0.96"/>
    <rect x="26.2" y="16.8" width="5.4" height="2.6" rx="1.2" fill="rgba(239,68,68,0.25)"/>

    <!-- ladder -->
    <path d="M15.2 17.0H29.8" stroke="#ef4444" stroke-width="2.0" stroke-linecap="round" opacity="0.95"/>
    <path d="M17 15.6V18.2 M20 15.6V18.2 M23 15.6V18.2 M26 15.6V18.2 M29 15.6V18.2"
          stroke="#ef4444" stroke-width="1.2" stroke-linecap="round" opacity="0.95"/>

    <!-- hose reel circle -->
    <circle cx="20" cy="22.1" r="2" fill="#ef4444" opacity="0.9"/>
    <circle cx="20" cy="22.1" r="1" fill="white" opacity="0.95"/>

    <!-- wheels -->
    <circle cx="18" cy="26.3" r="1.5" fill="#ef4444" opacity="0.9"/>
    <circle cx="28.8" cy="26.3" r="1.5" fill="#ef4444" opacity="0.9"/>
  </svg>
  `,
  { size: 46, anchorX: 23, anchorY: 44 }
);

function getIncidentIcon(type) {
  if (type === "police") return incidentPoliceIcon;
  if (type === "fire") return incidentFireIcon;
  return incidentAmbulanceIcon;
}
function getVehicleIcon(type) {
  if (type === "police") return policeCarIcon;
  if (type === "fire") return fireTruckIcon;
  return ambulanceVehicleIcon;
}
function lineColor(type) {
  if (type === "police") return "#2563eb";
  if (type === "fire") return "#ef4444";
  return "#10b981";
}

/** ===== Example data (edit coords) ===== */
// incidents are loaded asynchronously from the API into component state
// See useEffect inside the component for the fetch logic


const VEHICLES = [
  { id: "veh-police", type: "police", label: "Police Car A1", position: [33.5415, -101.8402], status: "En route" },
  { id: "veh-fire", type: "fire", label: "Fire Truck F7", position: [33.553, -101.842], status: "En route" },
  { id: "veh-ambulance", type: "ambulance", label: "Ambulance M3", position: [33.5389, -101.8371], status: "En route" },
];

import websocketService from '../services/websocketService';

export default function MapPage() {
  const [incidents, setIncidents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleLocations, setVehicleLocations] = useState({});
  const [vehicleRoutes, setVehicleRoutes] = useState({});

  // Refs for subscriptions
  const incidentReportedSubRef = React.useRef(null);
  const incidentAcceptedSubRef = React.useRef(null);
  const vehicleSubRef = React.useRef(null);

  // Fetch incidents and vehicles
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        console.log('[MapPage] Fetching fresh data...');
        // Fetch incidents
        const incidentData = await incidentAPI.getAllIncidents();
        const incidentList = incidentData?.content || incidentData || [];

        // Fetch vehicles
        const vehicleData = await vehicleAPI.getVehiclesByStatus('AVAILABLE');
        const onRouteVehicles = await vehicleAPI.getVehiclesByStatus('ON_ROUTE').catch(() => []);
        const allVehicles = [...vehicleData, ...onRouteVehicles];

        if (mounted) {
          processIncidents(incidentList, setIncidents);
          setVehicles(allVehicles);
        }
      } catch (err) {
        console.error('[MapPage] error loading data', err);
      }
    };

    // Initial fetch
    fetchData();

    // WebSocket Connection
    websocketService.connect(
      'http://localhost:8080/ws',
      () => {
        // console.log('[MapPage] Connected to WebSocket');

        // Subscribe to updates -> Trigger Re-fetch
        incidentReportedSubRef.current = websocketService.subscribe('/topic/incident/reported', () => {
          // console.log('[MapPage] Reported update -> Refreshing');
          fetchData();
        });

        incidentAcceptedSubRef.current = websocketService.subscribe('/topic/incident/accepted', () => {
          // console.log('[MapPage] Accepted update -> Refreshing');
          fetchData();
        });

        vehicleSubRef.current = websocketService.subscribe('/topic/vehicle/available', () => {
          fetchData();
        });
      },
      (err) => console.error('[MapPage] WS Error:', err)
    );

    // Fetch vehicle locations from Redis every 1 second (faster for smooth movement)
    const locationInterval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8080/test/vehicle-location/redis/all');
        if (response.ok) {
          const locations = await response.json();
          if (mounted) {
            setVehicleLocations(locations);

            // Fetch route points for vehicles that have routes
            const routePromises = [];
            Object.keys(locations).forEach(key => {
              if (key.startsWith('vehicle:route:')) {
                const vehicleId = key.replace('vehicle:route:', '');
                routePromises.push(
                  fetch(`http://localhost:8080/test/vehicle-location/route/${vehicleId}`)
                    .then(res => res.json())
                    .then(data => ({ vehicleId, data }))
                    .catch(() => ({ vehicleId, data: { hasRoute: false } }))
                );
              }
            });

            if (routePromises.length > 0) {
              Promise.all(routePromises).then(results => {
                const routes = {};
                results.forEach(({ vehicleId, data }) => {
                  routes[vehicleId] = data;
                });
                setVehicleRoutes(routes);
              });
            }
          }
        }
      } catch (err) {
        console.error('[MapPage] error fetching vehicle locations', err);
      }
    }, 1000); // 1s update for smoother feeling

    return () => {
      mounted = false;
      clearInterval(locationInterval);

      // Unsubscribe
      if (incidentReportedSubRef.current) websocketService.unsubscribe(incidentReportedSubRef.current);
      if (incidentAcceptedSubRef.current) websocketService.unsubscribe(incidentAcceptedSubRef.current);
      if (vehicleSubRef.current) websocketService.unsubscribe(vehicleSubRef.current);
    };
  }, []);

  // Cairo, Egypt coordinates
  const center = [30.0444, 31.2357];

  // Process incidents helper function
  const processIncidents = (list, setIncidents) => {
    const seenIds = new Set();
    const transformed = list.reduce((acc, inc, idx) => {
      const rawLat = inc.latitude ?? inc.lat ?? inc.address?.latitude ?? inc.location?.latitude;
      const rawLng = inc.longitude ?? inc.lon ?? inc.lng ?? inc.address?.longitude ?? inc.location?.longitude;

      if (!isFinite(rawLat) || !isFinite(rawLng)) {
        console.warn('[MapPage] skipping incident with missing/invalid coords:', inc);
        return acc;
      }

      const rawId = inc.id ?? inc.incidentId ?? inc.uuid ?? idx;
      let id = `inc-${rawId}`;
      if (seenIds.has(id)) {
        let suffix = 1;
        while (seenIds.has(`${id}-${suffix}`)) suffix += 1;
        id = `${id}-${suffix}`;
      }
      seenIds.add(id);

      const typeRaw = (inc.incidentType || '').toString().toLowerCase();
      let mappedType = 'ambulance';
      if (typeRaw.includes('police')) mappedType = 'police';
      else if (typeRaw.includes('fire')) mappedType = 'fire';
      else if (typeRaw.includes('medical') || typeRaw.includes('ambulance')) mappedType = 'ambulance';

      const title = inc.description || inc.title || `${mappedType.toUpperCase()} Incident ${rawId}` || 'Untitled Incident';

      acc.push({
        id,
        type: mappedType,
        title,
        position: [Number(rawLat), Number(rawLng)],
        status: inc.lifeCycleStatus || 'REPORTED',
        raw: inc,
      });

      return acc;
    }, []);

    setIncidents(transformed);
  };

  return (
    <div style={{ height: "70vh", width: "100%", borderRadius: 16, overflow: "hidden" }}>
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Incidents */}
        {incidents.map((inc) => (
          <Marker key={inc.id} position={inc.position} icon={getIncidentIcon(inc.type)}>
            <Popup>
              <b>{inc.title}</b>
              <div>Type: {inc.type}</div>
              <div>Status: {inc.status}</div>
            </Popup>
          </Marker>
        ))}

        {/* Render Vehicles */}
        {vehicles.map((vehicle) => {
          const locationKey = `vehicle:location:${vehicle.vehicleId}`;
          const location = vehicleLocations[locationKey];

          if (!location?.latitude || !location?.longitude) {
            return null;
          }

          const position = [parseFloat(parseFloat(location.latitude).toFixed(8)), parseFloat(parseFloat(location.longitude).toFixed(8))];
          const vehicleType = (vehicle.vehicleType || '').toLowerCase();
          let iconType = 'ambulance';
          if (vehicleType.includes('police')) iconType = 'police';
          else if (vehicleType.includes('fire')) iconType = 'fire';

          return (
            <React.Fragment key={vehicle.vehicleId}>
              <Marker position={position} icon={getVehicleIcon(iconType)}>
                <Popup>
                  <b>{vehicle.registrationNumber || `Vehicle ${vehicle.vehicleId}`}</b>
                  <div>Type: {vehicle.vehicleType}</div>
                  <div>Status: {vehicle.status}</div>
                </Popup>
              </Marker>

              {/* Show route line if vehicle is en route */}
              {vehicleRoutes[vehicle.vehicleId]?.hasRoute && (
                <Polyline
                  positions={vehicleRoutes[vehicle.vehicleId].points.map(p => [p.lat, p.lng])}
                  pathOptions={{ color: lineColor(iconType), weight: 4, opacity: 0.8 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
