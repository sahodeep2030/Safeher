import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } catch (err) {
      console.warn('Speech cancellation failed:', err);
    }
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.log(`🔊 [Speech Synthesis (Unsupported)]: "${text}"`);
      return;
    }

    try {
      // Cancel any ongoing speech to start immediately
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower, clearer emergency tone
      utterance.pitch = 1.0;
      
      // Select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(voice => voice.lang.startsWith('en-'));
      if (engVoice) {
        utterance.voice = engVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn('Speech synthesis error occurred:', e);
        setIsSpeaking(false);
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to trigger speech synthesis:', err);
      setIsSpeaking(false);
    }
  }, [isSupported]);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    speak,
    stop,
  };
}
