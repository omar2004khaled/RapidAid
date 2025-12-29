import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

export default function LocationPickerMap({ initialPosition, onLocationSelect }) {
  return (
    <MapContainer
      center={initialPosition}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker
        position={initialPosition}
        onLocationSelect={onLocationSelect}
      />
    </MapContainer>
  );
}