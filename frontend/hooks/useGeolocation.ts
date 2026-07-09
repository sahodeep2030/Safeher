import { useState, useEffect, useRef } from 'react';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  timestamp: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchId = useRef<number | null>(null);

  // Fallback coords for simulation/demo (CyberCity, Gurugram)
  const defaultCoords: LocationCoords = {
    latitude: 28.4962,
    longitude: 77.0878,
    accuracy: 10,
    speed: 1.4, // standard walking speed m/s
    timestamp: Date.now(),
  };

  const startTracking = () => {
    if (isTracking) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      // Fallback to simulation coordinates for developer testing
      setLocation(defaultCoords);
      setIsTracking(true);
      return;
    }

    setIsTracking(true);
    setError(null);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (err) => {
        console.warn('Geolocation Permission Error or Timeout. Engaging simulation fallback:', err.message);
        setError(err.message);
        // Automatically fallback to simulation so the app is always functional
        setLocation(defaultCoords);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
    setLocation(null);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
    setLocation, // Expose setter to allow developer coordinate simulation overrides
  };
}
