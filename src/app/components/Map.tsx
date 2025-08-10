'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// User location marker icon (different color)
const userLocationIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [32, 32],
  // We'll use CSS to change the color
  className: 'user-location-marker'
});

interface LocationMapProps {
  currentLocation?: {
    latitude: number;
    longitude: number;
    name: string;
    radius?: number; // radius in kilometers
  };
  latitude?: number;
  longitude?: number;
  name?: string;
  radius?: number; // radius in kilometers
  userLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export default function LocationMap({ currentLocation, latitude, longitude, name, radius, userLocation }: LocationMapProps) {
  // Use currentLocation if provided, otherwise use individual props, then userLocation, with fallback to Toronto
  
  const lat = currentLocation?.latitude ?? latitude ?? userLocation?.latitude ?? 43.6532;
  const lng = currentLocation?.longitude ?? longitude ?? userLocation?.longitude ?? -79.3832;
  const locationName = currentLocation?.name ?? name ?? (userLocation ? 'Your Current Location' : 'Default Location');
  const radiusKm = currentLocation?.radius ?? radius;

  // Ensure coordinates are valid numbers
  const validLat = typeof lat === 'number' && !isNaN(lat) ? lat : 43.6532;
  const validLng = typeof lng === 'number' && !isNaN(lng) ? lng : -79.3832;

  // Create a unique key for the map to force re-render when location changes
  const mapKey = `${validLat}-${validLng}`;

  // Add mounted state to prevent SSR issues
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[350px] rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <style jsx global>{`
        .user-location-marker {
          filter: hue-rotate(120deg) brightness(1.2);
        }
      `}</style>
      <MapContainer
        key={mapKey}
        center={[validLat, validLng] as [number, number]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render radius circle if radius is provided */}
        {radiusKm && radiusKm > 0 && (
          <Circle
            center={[validLat, validLng] as [number, number]}
            radius={radiusKm * 1000} // Convert km to meters
            pathOptions={{
              color: '#3b82f6', // Blue color
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        )}

        {/* Main location marker */}
        <Marker position={[validLat, validLng] as [number, number]} icon={customIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">{locationName}</h3>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Latitude:</strong> {validLat.toFixed(6)}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Longitude:</strong> {validLng.toFixed(6)}
              </p>
              {radiusKm && (
                <p className="text-sm text-gray-600">
                  <strong>Radius:</strong> {radiusKm} km
                </p>
              )}
            </div>
          </Popup>
        </Marker>

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude] as [number, number]} icon={userLocationIcon}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-2 text-green-600">Your Location</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Latitude:</strong> {userLocation.latitude.toFixed(6)}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Longitude:</strong> {userLocation.longitude.toFixed(6)}
                </p>
                {userLocation.accuracy && (
                  <p className="text-sm text-gray-600">
                    <strong>Accuracy:</strong> ±{Math.round(userLocation.accuracy)}m
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}