import { useEffect, useRef } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useSpeech } from '../hooks/useSpeech';

export default function VoiceAssistant() {
  const { safetyLevel } = useEmergency();
  const { speak, stop } = useSpeech();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any active loops when safety state changes
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stop();

    if (safetyLevel === 'warning') {
      speak('Warning alert. We noticed unusual activity. Please verify you are safe on your device screen.');
    } else if (safetyLevel === 'emergency') {
      // Immediate announcement
      speak('Emergency mode activated. Stay calm. I am sharing your coordinates. Walk towards the nearest public space. Emergency contacts have been notified.');

      // Repeat safety guidance announcements every 30 seconds
      intervalRef.current = window.setInterval(() => {
        speak('Emergency mode is active. Keep moving towards a well-lit public place. SafeSphere has locked your coordinates and notified authorities.');
      }, 30000);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      stop();
    };
  }, [safetyLevel, speak, stop]);

  return null; // Non-rendering utility component
}
