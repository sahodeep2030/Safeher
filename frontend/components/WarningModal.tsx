import React, { useEffect } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface WarningModalProps {
  countdown: number;
  onConfirmSafe: () => void;
  onTriggerEmergency: () => void;
}

export default function WarningModal({ countdown, onConfirmSafe, onTriggerEmergency }: WarningModalProps) {
  
  // Trigger tactile vibration pattern as the countdown ticks
  useEffect(() => {
    if ('vibrate' in navigator) {
      // Short pulse vibration every second, and longer warning pulses as countdown gets critical (< 5s)
      if (countdown <= 5) {
        navigator.vibrate([200, 100, 200]);
      } else {
        navigator.vibrate(100);
      }
    }
  }, [countdown]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white border border-amber-200 rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6 transform scale-100 transition-transform duration-300">
        
        {/* Pulsing Alert Icon */}
        <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-100 relative">
          <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
          <AlertTriangle className="w-10 h-10 relative z-10 animate-bounce" />
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-800">Unusual Activity Detected</h2>
          <p className="text-sm text-slate-500 font-medium">
            We noticed your journey has changed. Please confirm your safety within the countdown.
          </p>
        </div>

        {/* Ticking Countdown Ring */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-slate-100"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className={`${countdown <= 5 ? 'text-rose-500' : 'text-amber-500'} transition-all duration-1000 ease-linear`}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - countdown / 15)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <span className={`absolute text-3xl font-black ${countdown <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
            {countdown}s
          </span>
        </div>

        {/* Button Options */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            onClick={onConfirmSafe}
            className="py-4 px-6 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-black rounded-3xl transition-all duration-200 text-sm shadow-inner"
          >
            YES, I AM SAFE
          </button>
          
          <button
            onClick={onTriggerEmergency}
            className="py-4 px-6 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black rounded-3xl transition-all duration-200 text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/30"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>NEED HELP</span>
          </button>
        </div>
        
        <p className="text-[10px] text-rose-500/80 font-bold animate-pulse">
          🚨 Critical: Ignoring this countdown will trigger full SOS Emergency Broadcast.
        </p>
      </div>
    </div>
  );
}
