'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Test coordinates for simulation - worker will teleport in/out of the circle
const WORKER_COORDS = [
  { lat: 40.7901, lng: -73.9533, name: 'Inside Mount Sinai', expected: 'INSIDE' }, // Inside the 3km radius
  { lat: 40.8201, lng: -73.9833, name: 'Outside Mount Sinai', expected: 'OUTSIDE' }, // Outside the 3km radius
  { lat: 40.8001, lng: -73.9633, name: 'Near Mount Sinai', expected: 'INSIDE' }, // Inside the 3km radius
  { lat: 40.8501, lng: -74.0033, name: 'Far from Mount Sinai', expected: 'OUTSIDE' }, // Outside the 3km radius
];

export const useLocationTracking = (geofences: Array<{ latitude: number; longitude: number; radius: number }>) => {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [simulationIndex, setSimulationIndex] = useState<number | null>(null);
  const [hasInitialLocation, setHasInitialLocation] = useState<boolean>(false);
  
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationIndexRef = useRef<number>(0);

  // Get real GPS location once when component mounts
  useEffect(() => {
    // Check if we're in the browser before accessing navigator
    if (typeof window !== 'undefined' && !hasInitialLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          setCurrentLocation({ latitude, longitude, accuracy });
          setHasInitialLocation(true);
        },
        (err) => {
          // Fallback to default location if GPS fails
          setCurrentLocation({ latitude: 40.7901, longitude: -73.9533, accuracy: 100 });
          setHasInitialLocation(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else if (typeof window === 'undefined') {
      // Server-side rendering - set default location
      setCurrentLocation({ latitude: 40.7901, longitude: -73.9533, accuracy: 100 });
      setHasInitialLocation(true);
    }
  }, [hasInitialLocation]);

  const simulateWorkerPosition = useCallback((coord: { lat: number; lng: number }, index: number) => {
    
    setCurrentLocation({
      latitude: coord.lat,
      longitude: coord.lng,
      accuracy: 10
    });
    
    setSimulationIndex(index);
    if (geofences.length > 0) {
      const geofence = geofences[0];
      // Distance calculation removed as it's not being used
    }
  }, [geofences]);

  const startSimulation = useCallback(() => {
    // Only run simulation in browser
    if (typeof window === 'undefined') return;
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    
    setIsTracking(true);
    setSimulationIndex(0);
    simulationIndexRef.current = 0;
    
    
    const firstCoord = WORKER_COORDS[0];
    simulateWorkerPosition(firstCoord, 0);
    
    
    simulationIntervalRef.current = setInterval(() => {
      simulationIndexRef.current = (simulationIndexRef.current + 1) % WORKER_COORDS.length;
      const nextCoord = WORKER_COORDS[simulationIndexRef.current];
      simulateWorkerPosition(nextCoord, simulationIndexRef.current);
    }, 10000); 
  }, [simulateWorkerPosition]);

  const stopSimulation = useCallback(() => {
    // Only run simulation in browser
    if (typeof window === 'undefined') return;
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    
    setIsTracking(false);
    setSimulationIndex(null);
  }, []);

  
  useEffect(() => {
    return () => {
      // Only cleanup in browser
      if (typeof window !== 'undefined' && simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  return {
    currentLocation,
    isTracking,
    simulationIndex,
    startSimulation,
    stopSimulation
  };
};


function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
} 