import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, onLocationSelect }) {
  const [markerPosition, setMarkerPosition] = useState(position);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const precisePosition = [parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))];
      setMarkerPosition(precisePosition);
      onLocationSelect(precisePosition[0], precisePosition[1]);
    },
  });

  return markerPosition ? <Marker position={markerPosition} /> : null;
}

export default function LocationPickerMap({ initialPosition = [30.0444, 31.2357], onLocationSelect }) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-[#BDD2B6] shadow-inner bg-[#F8EDE3]">
      <MapContainer
        center={initialPosition}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={initialPosition}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
    </div>
  );
}