import { useState, useEffect, useRef } from 'react';
import { useEmergency } from '../context/EmergencyContext';

interface RiskEngineParams {
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  isSimulatedDev?: boolean;
  isActive: boolean;
}

export function useRiskDetection({ latitude, longitude, speed, isSimulatedDev = false, isActive }: RiskEngineParams) {
  const { safetyLevel, setRiskScore, triggerWarning, triggerEmergency, activeEventId } = useEmergency();
  
  // Real-time risk factors
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isNightTime, setIsNightTime] = useState<boolean>(false);
  const [isUnsafeArea, setIsUnsafeArea] = useState<boolean>(false);
  const [isDeviated, setIsDeviated] = useState<boolean>(false);
  const [isStoppedLong, setIsStoppedLong] = useState<boolean>(false);

  // Warning countdown state
  const [warningCountdown, setWarningCountdown] = useState<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);

  // Monitor battery level using Battery Status API
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        const handleLevelChange = () => {
          setBatteryLevel(Math.round(battery.level * 100));
        };
        battery.addEventListener('levelchange', handleLevelChange);
        
        return () => {
          battery.removeEventListener('levelchange', handleLevelChange);
        };
      });
    }
  }, []);

  // Monitor internet connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check night time (10 PM to 5 AM)
  useEffect(() => {
    const checkTime = () => {
      const hours = new Date().getHours();
      setIsNightTime(hours >= 22 || hours < 5);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Evaluate location-based factors (e.g. unsafe area or route deviation)
  useEffect(() => {
    if (!latitude || !longitude) return;

    // Simulate unsafe area if user coordinates are within specific latitude offsets
    // Example: Sector 56 or side roads in Gurgaon
    const latStr = latitude.toFixed(4);
    const lngStr = longitude.toFixed(4);
    
    // Simulating unsafe area based on coordinate values
    const isUnsafe = parseFloat(latStr) % 2 === 0 || parseFloat(lngStr) % 2 !== 0;
    setIsUnsafeArea(isUnsafe);

    // Set deviation state based on simulated path deviations or explicit dev flag
    setIsDeviated(isSimulatedDev);
  }, [latitude, longitude, isSimulatedDev]);

  // Stopped tracking simulation
  useEffect(() => {
    let timeout: number;
    if (speed !== null && speed === 0 && safetyLevel === 'safe') {
      // If user is stopped for over 10 seconds (accelerated for testing from 3 mins), mark as stopped long
      timeout = window.setTimeout(() => {
        setIsStoppedLong(true);
      }, 10000);
    } else {
      setIsStoppedLong(false);
    }
    return () => clearTimeout(timeout);
  }, [speed, safetyLevel]);

  // Calculate and update risk score continuously
  useEffect(() => {
    if (!isActive) {
      setRiskScore(0);
      return;
    }
    if (safetyLevel === 'emergency') return;

    let score = 0;

    if (isDeviated) score += 30;
    if (isStoppedLong) score += 20;
    if (isNightTime) score += 15;
    if (isUnsafeArea) score += 25;
    if (batteryLevel < 20) score += 5;
    if (!isOnline) score += 5;

    // Cap at 100
    score = Math.min(score, 100);
    setRiskScore(score);

    // State escalation rules
    if (score >= 61) {
      // Escalate straight to Emergency if risk is extreme
      triggerEmergency('Critical Risk Score Trigger', latitude || 0, longitude || 0, batteryLevel, speed || 0);
    } else if (score >= 31 && (isDeviated || isStoppedLong || score >= 50) && safetyLevel === 'safe') {
      // Trigger warning state
      triggerWarning(
        isDeviated ? 'Route Deviation Detected' :
        isStoppedLong ? 'Prolonged Stoppage' : 'Critical Combined Risk Index'
      );
    }
  }, [isActive, isDeviated, isStoppedLong, isNightTime, isUnsafeArea, batteryLevel, isOnline, safetyLevel, latitude, longitude, speed]);

  // Warning countdown logic (15 seconds before automatic escalation)
  useEffect(() => {
    if (!isActive) {
      if (warningTimerRef.current) {
        clearInterval(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      setWarningCountdown(null);
      return;
    }

    if (safetyLevel === 'warning') {
      setWarningCountdown(15);
      
      warningTimerRef.current = window.setInterval(() => {
        setWarningCountdown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(warningTimerRef.current!);
            warningTimerRef.current = null;
            // Escalate to emergency automatically if ignored
            triggerEmergency(
              'Warning check ignored by user',
              latitude || 0,
              longitude || 0,
              batteryLevel,
              speed || 0
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (warningTimerRef.current) {
        clearInterval(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      setWarningCountdown(null);
    }

    return () => {
      if (warningTimerRef.current) {
        clearInterval(warningTimerRef.current);
      }
    };
  }, [isActive, safetyLevel, latitude, longitude, batteryLevel, speed]);


  return {
    batteryLevel,
    isOnline,
    isNightTime,
    isUnsafeArea,
    isDeviated,
    isStoppedLong,
    warningCountdown,
    setIsDeviated, // Expose overrides for simulator panel testing
    setIsStoppedLong,
    setIsUnsafeArea,
  };
}
