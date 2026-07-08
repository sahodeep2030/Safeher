import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Shield, AlertTriangle, Phone, Share2, Compass, MapPin, Navigation, Car, AlertOctagon, Heart, User, CheckCircle } from 'lucide-react';
import { RouteInfo } from '../types';
import MapPlaceholder from './MapPlaceholder';

interface LiveMonitoringPageProps {
  activeRoute: RouteInfo | null;
  onToast: (msg: string, type: 'info' | 'success' | 'warn') => void;
  onNavigateTo: (page: 'home' | 'safe-route' | 'emergency' | 'report' | 'community' | 'profile') => void;
}

export default function LiveMonitoringPage({ activeRoute, onToast, onNavigateTo }: LiveMonitoringPageProps) {
  // If no route is active, default to Corridor Alfa for visual fidelity
  const fallbackRoute: RouteInfo = {
    id: 'route-safest',
    name: 'Corridor Alfa (Safest Route)',
    distance: '6.4 km',
    duration: '18 mins',
    safetyScore: 96,
    riskLevel: 'Low',
    litPercent: 98,
    cctvPercent: 92,
    policeStations: 3,
    hospitals: 2,
    rating: 4.9,
    color: 'green',
    description: 'Stays strictly on double-lane arterial roads. Monitored continuously by City CCTV networks.',
    features: ['100% Well-Lit Roads', 'Frequent PCR Checkpoints']
  };

  const route = activeRoute || fallbackRoute;

  const [simulationActive, setSimulationActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCoord, setCurrentCoord] = useState({ x: 0.1, y: 0.85 });
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'deviation' | 'high-risk'>('safe');
  const [showDeviationModal, setShowDeviationModal] = useState(false);
  const [driverContact] = useState({ name: 'Rajesh Kumar', phone: '+91 98765 43210', rating: 4.8, vehicle: 'White Dzire (DL1Y-9823)' });
  const [lastAlertTime, setLastAlertTime] = useState<string | null>(null);

  // Monitor safety status changes to automatically pop up the deviation warning
  useEffect(() => {
    if (safetyStatus === 'deviation') {
      setShowDeviationModal(true);
      setLastAlertTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      onToast('CRITICAL WARNING: Driver has deviated from the safe route!', 'warn');
    }
  }, [safetyStatus]);

  const handleProgressUpdate = (prog: number, coord: { x: number; y: number }, state: 'safe' | 'deviation' | 'high-risk') => {
    setProgress(Math.round(prog * 100));
    setCurrentCoord(coord);
    setSafetyStatus(state);
  };

  const handleStartSim = () => {
    setSimulationActive(true);
    setSafetyStatus('safe');
    setProgress(0);
    onToast('Live journey tracking started. Sharing location with trusted contacts...', 'success');
  };

  const handleStopSim = () => {
    setSimulationActive(false);
    setProgress(0);
    setSafetyStatus('safe');
    onToast('Live tracking session closed.', 'info');
  };

  // Remaining calculation based on progress percentage
  const totalDurationMinutes = parseInt(route.duration) || 18;
  const totalDistanceKm = parseFloat(route.distance) || 6.4;

  const remainingMinutes = Math.max(0, Math.round(totalDurationMinutes * (1 - progress / 100)));
  const remainingDistance = Math.max(0, (totalDistanceKm * (1 - progress / 100))).toFixed(1);

  // Modal actions
  const handleShareLocation = () => {
    setShowDeviationModal(false);
    onToast('Live coordinates successfully broadcast to emergency contacts!', 'success');
  };

  const handleAlertContacts = () => {
    setShowDeviationModal(false);
    onToast('SOS Warning SMS dispatched to Aria, Rahul and Preeti!', 'success');
  };

  const handleCallPolice = () => {
    setShowDeviationModal(false);
    onToast('Dialing 112 / 100 Police Control Room dispatch...', 'warn');
  };

  const handleContinueMonitoring = () => {
    setShowDeviationModal(false);
    onToast('Resuming passive location surveillance.', 'info');
  };

  return (
    <div id="safeher-live-trip-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* 1. Header with Simulation Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-violet-600 animate-spin" />
            Live Trip Sentinel
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Active tracking for route <strong className="text-violet-600 font-semibold">{route.name}</strong> to Destination.
          </p>
        </div>

        {/* Simulation start / stop buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {!simulationActive ? (
            <button
              onClick={handleStartSim}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition shadow-sm hover:shadow-md cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Simulate Safe Ride Tracking
            </button>
          ) : (
            <button
              onClick={handleStopSim}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              Stop Monitoring
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left is map, Right is dashboard telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: Map Window */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm h-[400px]">
            <MapPlaceholder
              mode="live-trip"
              simulationActive={simulationActive}
              onSimulationProgress={handleProgressUpdate}
              start={route.start}
              destination={route.destination}
            />
          </div>

          {/* Progress Timeline widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-teal-600" /> Origin</span>
              <span className="text-violet-600 font-mono">{progress}% Journey Complete</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /> Destination</span>
            </div>

            {/* Custom progress line */}
            <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  safetyStatus === 'deviation'
                    ? 'bg-rose-500'
                    : safetyStatus === 'high-risk'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Micro steps indicator */}
            <div className="grid grid-cols-4 text-center text-[10px] text-slate-400 font-semibold pt-1">
              <span className="text-left text-teal-600 font-bold">Boarded (0%)</span>
              <span>Mid-way Point (33%)</span>
              <span className={progress >= 66 ? 'text-violet-600 font-bold' : ''}>Sector Bypass (66%)</span>
              <span className="text-right">Arrived (100%)</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Telemetry and Driver Info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Safety Status Widget */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Security Sentinel Status</h3>

            {safetyStatus === 'safe' && (
              <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 glow-pulse-teal">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Ride is Secure</h4>
                  <p className="text-xs text-emerald-700 leading-tight">GPS matches green safest corridor.</p>
                </div>
              </div>
            )}

            {safetyStatus === 'deviation' && (
              <div className="flex items-center gap-4 bg-rose-50 p-4 rounded-xl border border-rose-100 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shrink-0 glow-pulse-red">
                  <AlertOctagon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900">Route Deviation Detected</h4>
                  <p className="text-xs text-rose-700 leading-tight">Cab moved off course at {lastAlertTime}.</p>
                </div>
              </div>
            )}

            {safetyStatus === 'high-risk' && (
              <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Entering High-Risk Grid</h4>
                  <p className="text-xs text-amber-700 leading-tight">Low illumination segment bypass.</p>
                </div>
              </div>
            )}

            {/* Core Stats values */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Time Remaining</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{simulationActive ? `${remainingMinutes}m` : '--'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Dist. Remaining</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{simulationActive ? `${remainingDistance} km` : '--'}</span>
              </div>
            </div>
          </div>

          {/* Driver & Cab details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Assigned Cab Dispatch</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 text-xl font-bold shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{driverContact.name}</h4>
                <p className="text-xs text-slate-500">{driverContact.vehicle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 mt-2">
              <div className="py-1">
                <span className="text-slate-400 block">Rating:</span>
                <span className="font-semibold text-slate-800">⭐ {driverContact.rating} Star</span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 block">Contact Num:</span>
                <span className="font-semibold text-violet-600 underline">{driverContact.phone}</span>
              </div>
            </div>
          </div>

          {/* Active Listeners / Contacts shared list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Observers (3)</h3>
            <p className="text-[11px] text-slate-400 leading-tight">These contacts receive encrypted auto-coordinates updates every 15 seconds.</p>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 inline-block animate-pulse"></span>
                  <span className="font-semibold text-slate-800">Aria Sharma (Sister)</span>
                </div>
                <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-bold">Connected</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 inline-block animate-pulse"></span>
                  <span className="font-semibold text-slate-800">Mom (Emergency Grid)</span>
                </div>
                <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-bold">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Sticky SOS button fixed in bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-35 md:bottom-8 md:right-8">
        <button
          onClick={() => onNavigateTo('emergency')}
          className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-2xl border-4 border-white glow-pulse-red hover:scale-105 transition duration-200 cursor-pointer"
        >
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">TAP SOS</span>
        </button>
      </div>

      {/* 2. ROUTE DEVIATION ALERT MODAL (Auto-popup) */}
      <AnimatePresence>
        {showDeviationModal && (
          <>
            {/* Backdrop with warning pink flash tint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeviationModal(false)}
              className="fixed inset-0 z-50 bg-red-950/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed inset-x-4 top-[10%] md:top-[20%] mx-auto z-50 max-w-lg bg-white rounded-3xl border-2 border-rose-500 shadow-2xl p-6 md:p-8 text-center space-y-6"
            >
              {/* Animated Red Warning Icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center border-2 border-rose-300 glow-pulse-red">
                <AlertOctagon className="w-8 h-8 text-rose-500" />
              </div>

              {/* Title & Warning Text */}
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Warning! Route Deviation Detected
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your vehicle has moved away from the recommended safe route corridor <strong className="text-rose-500">{route.name}</strong>. Please confirm your safety or choose a response action immediately.
                </p>
              </div>

              {/* Driver context brief */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Active Vehicle</span>
                  <span className="font-bold text-slate-800">{driverContact.vehicle}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Driver Contact</span>
                  <span className="font-bold text-slate-800">{driverContact.name}</span>
                </div>
              </div>

              {/* Responsive Action Buttons Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleShareLocation}
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-teal-600" />
                  Share Live Location
                </button>

                <button
                  onClick={handleAlertContacts}
                  className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  Alert Emergency Contacts
                </button>

                <button
                  onClick={handleCallPolice}
                  className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  Call Police (112)
                </button>

                <button
                  onClick={handleContinueMonitoring}
                  className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Continue Monitoring
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
