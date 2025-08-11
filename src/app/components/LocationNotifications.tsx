'use client';
import React, { useState, useEffect } from 'react';
import { EnvironmentOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

interface LocationNotificationsProps {
  userLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  workLocation?: {
    latitude: number;
    longitude: number;
    radius: number; 
    name: string;
  };
}


const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; 
};

const LocationNotifications: React.FC<LocationNotificationsProps> = ({
  userLocation,
  workLocation
}) => {
  const [previousState, setPreviousState] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [notificationType, setNotificationType] = useState<'enter' | 'exit'>('enter');
  const [distance, setDistance] = useState<number>(0);

  useEffect(() => {
    if (!userLocation || !workLocation) {
      return;
    }

    const distanceInMeters = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      workLocation.latitude,
      workLocation.longitude
    );

    setDistance(distanceInMeters);

    const radiusInMeters = workLocation.radius * 1000;
    const currentlyInside = distanceInMeters <= radiusInMeters;
    
    
    // Detect state change and show notification
    if (currentlyInside !== previousState) {
      if (currentlyInside) {
        setNotificationMessage(`Welcome to ${workLocation.name}! You're now in the work area (${workLocation.radius}km radius).`);
        setNotificationType('enter');
      } else {
        setNotificationMessage(`You've left ${workLocation.name}. Distance: ${Math.round(distanceInMeters)}m (outside ${workLocation.radius}km radius)`);
        setNotificationType('exit');
      }
      setShowNotification(true);
      setPreviousState(currentlyInside);

      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
  }, [userLocation, workLocation, previousState]);

  if (!showNotification) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: notificationType === 'enter' ? '#f6ffed' : '#fff7e6',
        border: `1px solid ${notificationType === 'enter' ? '#b7eb8f' : '#ffd666'}`,
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        minWidth: '300px',
        maxWidth: '500px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
      
      {notificationType === 'enter' ? (
        <EnvironmentOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
      ) : (
        <ExclamationCircleOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
      )}
      
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>
          {notificationType === 'enter' ? 'Entered Work Area' : 'Left Work Area'}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {notificationMessage}
        </div>
        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
          Distance from center: {Math.round(distance)}m
          {userLocation?.accuracy && ` • GPS accuracy: ±${Math.round(userLocation.accuracy)}m`}
          {workLocation && (
            <span> • Work area radius: {workLocation.radius}km ({workLocation.radius * 1000}m)</span>
          )}
        </div>
      </div>
      
      <button
        onClick={() => setShowNotification(false)}
        style={{
          background: 'none',
          border: 'none',
          color: '#999',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '4px',
          borderRadius: '4px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default LocationNotifications; 