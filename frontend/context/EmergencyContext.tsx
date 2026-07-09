import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, doc, setDoc, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export type SafetyLevel = 'safe' | 'warning' | 'emergency';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relation: string;
}

interface TimelineEvent {
  title: string;
  time: string;
  description: string;
  icon: string;
}

interface EmergencyContextType {
  safetyLevel: SafetyLevel;
  riskScore: number;
  setRiskScore: (score: number) => void;
  activeEventId: string | null;
  triggerWarning: (reason: string) => void;
  cancelWarning: () => void;
  triggerEmergency: (reason: string, latitude: number, longitude: number, battery: number, speed: number) => Promise<string | null>;
  resolveEmergency: () => Promise<void>;
  timeline: TimelineEvent[];
  addTimelineEvent: (title: string, description: string, icon: string) => void;
  contacts: EmergencyContact[];
  setContacts: React.Dispatch<React.SetStateAction<EmergencyContact[]>>;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export function EmergencyProvider({ children }: { children: React.ReactNode }) {
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>('safe');
  const [riskScore, setRiskScore] = useState<number>(0);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Primary Guardian', phone: '+1234567890', email: 'guardian@example.com', relation: 'Family' }
  ]);

  const syncIntervalRef = useRef<number | null>(null);
  const currentCoords = useRef<{ lat: number; lng: number }>({ lat: 28.4962, lng: 77.0878 });

  const addTimelineEvent = (title: string, description: string, icon: string) => {
    const newEvent: TimelineEvent = {
      title,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      description,
      icon,
    };
    setTimeline(prev => [...prev, newEvent]);

    // If an emergency event is active in Firestore, sync the timeline event there too!
    if (activeEventId) {
      const eventRef = doc(db, 'EmergencyEvents', activeEventId);
      updateDoc(eventRef, {
        timeline: arrayUnion(newEvent)
      }).catch(err => console.error('Failed to sync timeline to Firestore:', err));
    }
  };

  const triggerWarning = (reason: string) => {
    if (safetyLevel === 'emergency') return;
    setSafetyLevel('warning');
    addTimelineEvent('Warning Triggered', `Unusual behavior detected: ${reason}`, 'AlertTriangle');
  };

  const cancelWarning = () => {
    if (safetyLevel !== 'warning') return;
    setSafetyLevel('safe');
    addTimelineEvent('Warning Resolved', 'User confirmed safety input.', 'CheckCircle2');
  };

  const triggerEmergency = async (
    reason: string,
    latitude: number,
    longitude: number,
    battery: number,
    speed: number
  ): Promise<string | null> => {
    if (safetyLevel === 'emergency') return activeEventId;

    setSafetyLevel('emergency');
    setRiskScore(100);
    const eventId = `sos_${Date.now()}`;
    setActiveEventId(eventId);
    currentCoords.current = { lat: latitude, lng: longitude };

    const initialTimeline: TimelineEvent = {
      title: 'Emergency Activated',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      description: `SOS mode triggered: ${reason}`,
      icon: 'ShieldAlert',
    };

    setTimeline([initialTimeline]);

    // Save initial Emergency Event to Firestore
    try {
      const userId = auth.currentUser?.uid || 'anonymous_user';
      await setDoc(doc(db, 'EmergencyEvents', eventId), {
        id: eventId,
        userId,
        userName: auth.currentUser?.displayName || 'SafeSphere User',
        status: 'active',
        riskScore: 100,
        activationReason: reason,
        startTime: new Date().toISOString(),
        endTime: null,
        latitude,
        longitude,
        speed,
        battery,
        internet: navigator.onLine,
        guardianNotified: true,
        emailSent: false,
        smsSent: false,
        timeline: [initialTimeline],
      });
      console.log(`🔥 Emergency Event saved in Firestore: ${eventId}`);
    } catch (err) {
      console.error('Failed to save Emergency Event to Firestore:', err);
    }

    // Call Backend Alert dispatcher API
    try {
      const response = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: auth.currentUser?.displayName || 'SafeSphere User',
          emergencyEventId: eventId,
          riskScore: 100,
          latitude,
          longitude,
          contacts,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('⚡ Alert dispatches processed by server:', result);
        
        // Update Firestore to log sent notifications
        const eventRef = doc(db, 'EmergencyEvents', eventId);
        await updateDoc(eventRef, {
          emailSent: result.stats.emailsSent > 0,
          smsSent: result.stats.smsSent > 0,
        });

        addTimelineEvent('Alerts Dispatched', `SMS sent: ${result.stats.smsSent}, Emails sent: ${result.stats.emailsSent}`, 'Send');
      }
    } catch (err) {
      console.error('Failed to contact backend API for SOS alerts:', err);
      addTimelineEvent('Dispatch Failed', 'Failed to reach notifications API.', 'XCircle');
    }

    return eventId;
  };

  const resolveEmergency = async () => {
    if (!activeEventId) return;

    const eventId = activeEventId;
    setSafetyLevel('safe');
    setRiskScore(0);
    setActiveEventId(null);
    setTimeline([]);

    // Update Emergency Event in Firestore to resolved
    try {
      const eventRef = doc(db, 'EmergencyEvents', eventId);
      await updateDoc(eventRef, {
        status: 'closed',
        endTime: new Date().toISOString(),
      });
      console.log(`🔥 Emergency Event ${eventId} marked as closed.`);
    } catch (err) {
      console.error('Failed to resolve Emergency Event in Firestore:', err);
    }
  };

  // Sync GPS Coordinates to LocationHistory collection every 5 seconds during Emergency mode
  useEffect(() => {
    if (safetyLevel === 'emergency' && activeEventId) {
      syncIntervalRef.current = window.setInterval(async () => {
        try {
          const lat = currentCoords.current.lat;
          const lng = currentCoords.current.lng;
          
          // Save path history coordinate
          await addDoc(collection(db, 'LocationHistory'), {
            eventId: activeEventId,
            latitude: lat,
            longitude: lng,
            timestamp: new Date().toISOString(),
          });

          // Update active event coordinates
          const eventRef = doc(db, 'EmergencyEvents', activeEventId);
          await updateDoc(eventRef, {
            latitude: lat,
            longitude: lng,
          });

          console.log(`📍 GPS sync: Updated active location in Firestore (lat: ${lat}, lng: ${lng})`);
        } catch (err) {
          console.error('Failed to sync location updates:', err);
        }
      }, 5000);
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [safetyLevel, activeEventId]);

  return (
    <EmergencyContext.Provider
      value={{
        safetyLevel,
        riskScore,
        setRiskScore,
        activeEventId,
        triggerWarning,
        cancelWarning,
        triggerEmergency,
        resolveEmergency,
        timeline,
        addTimelineEvent,
        contacts,
        setContacts,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
