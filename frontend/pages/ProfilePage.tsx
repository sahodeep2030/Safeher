import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Phone, MapPin, Heart, Clock, Settings, Save, AlertTriangle, Eye, Compass, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import { EmergencyContact, SavedPlace, JourneyHistoryItem } from '../types';

interface ProfilePageProps {
  onToast: (msg: string, type: 'info' | 'success' | 'warn') => void;
  onNavigateTo: (page: 'home' | 'safe-route' | 'emergency' | 'report' | 'community' | 'profile') => void;
  currentUser: { email: string | null; displayName: string | null } | null;
}

export default function ProfilePage({ onToast, onNavigateTo, currentUser }: ProfilePageProps) {
  // Safety Preferences States
  const [prefAutoDeviation, setPrefAutoDeviation] = useState(true);
  const [prefLockTrigger, setPrefLockTrigger] = useState(true);
  const [prefAudioRecord, setPrefAudioRecord] = useState(false);
  const [prefAutoPolice, setPrefAutoPolice] = useState(false);

  // Saved Places
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([
    { id: 'p1', label: 'Home Apartment', address: 'B-402, Royal Palms, Sector 6', icon: '🏠' },
    { id: 'p2', label: 'Office HQ (DLF)', address: 'Building 10B, DLF CyberCity Gate 2', icon: '🏢' },
    { id: 'p3', label: 'Sister Aria’s Flat', address: 'Block D, Sector 12 Housing Colony', icon: '👩' },
    { id: 'p4', label: 'Palam Gym Hub', address: 'First Floor, Palam Commercial Center', icon: '💪' },
  ]);

  // Journey History
  const [history] = useState<JourneyHistoryItem[]>([
    {
      id: 'h1',
      date: 'Today, 11:30 AM',
      from: 'Sector 6 Residence',
      to: 'DLF CyberCity Gate 2',
      mode: 'cab',
      duration: '18 mins',
      safetyScore: 96,
      status: 'completed'
    },
    {
      id: 'h2',
      date: 'Yesterday, 8:45 PM',
      from: 'Palam Commercial Center',
      to: 'Sector 6 Residence',
      mode: 'auto',
      duration: '15 mins',
      safetyScore: 78,
      status: 'completed'
    },
    {
      id: 'h3',
      date: 'July 4, 10:15 PM',
      from: 'Sector 12 Housing Colony',
      to: 'Sector 6 Residence',
      mode: 'cab',
      duration: '22 mins',
      safetyScore: 42,
      status: 'alert-triggered'
    }
  ]);

  const handleSavePref = () => {
    onToast('Safety preferences updated successfully.', 'success');
  };

  const handleEditPlace = (id: string) => {
    onToast('Modify Address feature opened (mock).', 'info');
  };

  return (
    <div id="safeher-profile-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Profile Header Banner */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 text-white mb-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-md">
        {/* Decorative backdrop aura */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=240"
          alt="Profile Avatar"
          referrerPolicy="no-referrer"
          className="w-24 h-24 rounded-full border-4 border-violet-500/30 object-cover shrink-0 shadow-lg relative z-10"
        />

        <div className="space-y-2 text-center md:text-left relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">{currentUser?.displayName || 'Aria Sharma'}</h2>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest bg-teal-900/40 border border-teal-800 px-2.5 py-0.5 rounded-full inline-block mx-auto sm:mx-0 shrink-0">
              ✓ Sentinel Profile Verified
            </span>
          </div>
          <p className="text-xs text-slate-400">Primary email connected: <strong>{currentUser?.email || 'aria@safeher-grid.org'}</strong></p>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
            Active guard member since May 2026. Aria has participated in 14 community lighting reviews, logged 3 construction bypass flags, and completed 42 safe route trips.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Safety Prefs & Saved Places (Cols: 6) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Safety preferences controls panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
              <Settings className="w-4.5 h-4.5 text-violet-600" />
              Safety Preferences Configuration
            </h3>

            <div className="space-y-4">
              {/* Pref 1 */}
              <div className="flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">Proactive Route Deviation Alert</h4>
                  <p className="text-[10px] text-slate-400 leading-snug">Popup trigger automatically when cab deviates 200m from safest corridor.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefAutoDeviation(!prefAutoDeviation)}
                  className="text-violet-600 cursor-pointer"
                >
                  {prefAutoDeviation ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                </button>
              </div>

              {/* Pref 2 */}
              <div className="flex items-center justify-between gap-4 text-xs border-t border-slate-100 pt-3">
                <div>
                  <h4 className="font-bold text-slate-800">Hardware SOS Shortcut</h4>
                  <p className="text-[10px] text-slate-400 leading-snug">Pressing device lock button 3 times triggers silent SOS transmit instantly.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefLockTrigger(!prefLockTrigger)}
                  className="text-violet-600 cursor-pointer"
                >
                  {prefLockTrigger ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                </button>
              </div>

              {/* Pref 3 */}
              <div className="flex items-center justify-between gap-4 text-xs border-t border-slate-100 pt-3">
                <div>
                  <h4 className="font-bold text-slate-800">Automated Audio Surveillance</h4>
                  <p className="text-[10px] text-slate-400 leading-snug">Auto-record 15-second surrounding audio snippets and upload to safe server during SOS.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefAudioRecord(!prefAudioRecord)}
                  className="text-violet-600 cursor-pointer"
                >
                  {prefAudioRecord ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                </button>
              </div>

              {/* Pref 4 */}
              <div className="flex items-center justify-between gap-4 text-xs border-t border-slate-100 pt-3">
                <div>
                  <h4 className="font-bold text-slate-800">Immediate Police Dispatch</h4>
                  <p className="text-[10px] text-slate-400 leading-snug">Auto-dial 112 dispatcher if distress is not cancelled within 3 seconds countdown.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefAutoPolice(!prefAutoPolice)}
                  className="text-violet-600 cursor-pointer"
                >
                  {prefAutoPolice ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSavePref}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>

          {/* Saved places panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
              <MapPin className="w-4.5 h-4.5 text-violet-600" />
              Saved Locations Slots
            </h3>

            <div className="space-y-2">
              {savedPlaces.map((place) => (
                <div key={place.id} className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 group">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base select-none">{place.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-800">{place.label}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{place.address}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditPlace(place.id)}
                    className="text-[10px] font-bold text-violet-600 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Journey History & Safety stats (Cols: 6) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* History of trips */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
              <Clock className="w-4.5 h-4.5 text-violet-600" />
              Journey History History
            </h3>

            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="text-xs p-3.5 border border-slate-100 rounded-2xl flex justify-between items-center bg-white">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">{h.date}</span>
                      <span
                        className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          h.status === 'completed' ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {h.status === 'completed' ? 'Secured' : 'SOS Triggered'}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 leading-tight">
                        {h.from} → {h.to}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Mode: {h.mode.toUpperCase()} • Duration: {h.duration}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block font-semibold">Safety Score</span>
                    <span
                      className={`text-lg font-mono font-extrabold ${
                        h.safetyScore >= 80 ? 'text-teal-600' : h.safetyScore >= 50 ? 'text-amber-500' : 'text-rose-500'
                      }`}
                    >
                      {h.safetyScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics summary card */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/50 flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Protection Counter</span>
              <h4 className="text-base font-bold text-slate-800">Your Personal Safety metrics</h4>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-200/50">
              <div>
                <span className="text-xl font-extrabold text-violet-600 block font-mono">142 km</span>
                <span className="text-[9px] text-slate-500 font-bold block">Safe Travel Tracked</span>
              </div>
              <div>
                <span className="text-xl font-extrabold text-teal-600 block font-mono">18</span>
                <span className="text-[9px] text-slate-500 font-bold block">Guardian Checkins</span>
              </div>
              <div>
                <span className="text-xl font-extrabold text-indigo-600 block font-mono">98.4%</span>
                <span className="text-[9px] text-slate-500 font-bold block">Avg Safety index</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
