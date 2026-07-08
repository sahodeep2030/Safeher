import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Eye, Heart, Shield, Activity, Landmark, Compass, Flame, AlertCircle, Info } from 'lucide-react';
import { TravelMode, RouteInfo } from '../types';
import MapPlaceholder from './MapPlaceholder';

interface SafeRoutePageProps {
  onStartJourney: (route: RouteInfo) => void;
  onToast: (msg: string, type: 'info' | 'success' | 'warn') => void;
}

export default function SafeRoutePage({ onStartJourney, onToast }: SafeRoutePageProps) {
  const [start, setStart] = useState('My Current Location (Sector 6)');
  const [destination, setDestination] = useState('DLF CyberCity Gate 2');
  const [mode, setMode] = useState<TravelMode>('cab');
  const [calculating, setCalculating] = useState(false);
  const [showResults, setShowResults] = useState(true); // Default loaded with mock routes
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // Travel Modes Definition
  const travelModesList = [
    { id: 'walking', label: 'Walking', icon: '🚶' },
    { id: 'cab', label: 'Cab / Taxi', icon: '🚖' },
    { id: 'auto', label: 'Auto', icon: '🛺' },
    { id: 'bus', label: 'Bus / Transit', icon: '🚌' },
  ] as const;

  // Dynamic Route Generator
  const generateDynamicRoutes = (startVal: string, destVal: string, travelMode: TravelMode): RouteInfo[] => {
    const cleanStart = startVal.trim() || 'Sector 6';
    const cleanDest = destVal.trim() || 'DLF CyberCity';
    
    const combinedLength = (cleanStart.length + cleanDest.length) || 15;
    const baseDistance = 3 + (combinedLength % 10) + (combinedLength % 3) * 0.7;

    let speed = 35;
    if (travelMode === 'walking') speed = 4.5;
    else if (travelMode === 'bus') speed = 22;
    else if (travelMode === 'auto') speed = 26;

    const baseDurationMins = Math.max(3, Math.round((baseDistance / speed) * 60));

    return [
      {
        id: 'route-safest',
        name: `Via ${cleanStart} Arterial Corridor (Safest Route)`,
        distance: `${baseDistance.toFixed(1)} km`,
        duration: baseDurationMins >= 60 ? `${Math.floor(baseDurationMins/60)}h ${baseDurationMins%60}m` : `${baseDurationMins} mins`,
        safetyScore: 96,
        riskLevel: 'Low',
        litPercent: 98,
        cctvPercent: 92,
        policeStations: baseDistance > 8 ? 3 : baseDistance > 4 ? 2 : 1,
        hospitals: baseDistance > 8 ? 2 : 1,
        rating: 4.9,
        color: 'green',
        description: `Stays strictly on double-lane major arterial roads from ${cleanStart} to ${cleanDest}. Fully lit and monitored continuously by police checkpoints and city-wide smart surveillance network.`,
        features: ['100% Well-Lit Roads', 'Frequent Police Checkpoints', 'Active High-Density Footfall'],
        start: cleanStart,
        destination: cleanDest
      },
      {
        id: 'route-alternate',
        name: `Via ${cleanDest} Bypass Link (Moderate Route)`,
        distance: `${(baseDistance * 1.15).toFixed(1)} km`,
        duration: Math.round(baseDurationMins * 1.15) >= 60 ? `${Math.floor(baseDurationMins*1.15/60)}h ${Math.round(baseDurationMins*1.15)%60}m` : `${Math.round(baseDurationMins * 1.15)} mins`,
        safetyScore: 78,
        riskLevel: 'Moderate',
        litPercent: 82,
        cctvPercent: 68,
        policeStations: 1,
        hospitals: 1,
        rating: 4.1,
        color: 'yellow',
        description: `An alternate corridor bypassing heavy intersections. Generally safe, but features lower pedestrian traffic near ${cleanDest}'s industrial/development zones. Recommended for daytime travel.`,
        features: ['80%+ Streetlight Coverage', 'Passive CCTV Security', 'Medium Density Crowds'],
        start: cleanStart,
        destination: cleanDest
      },
      {
        id: 'route-shortest',
        name: `Via Inner Alleys & Side Lanes (Shortest / Riskier)`,
        distance: `${(baseDistance * 0.75).toFixed(1)} km`,
        duration: Math.round(baseDurationMins * 0.75) >= 60 ? `${Math.floor(baseDurationMins*0.75/60)}h ${Math.round(baseDurationMins*0.75)%60}m` : `${Math.round(baseDurationMins * 0.75)} mins`,
        safetyScore: 43,
        riskLevel: 'High',
        litPercent: 41,
        cctvPercent: 15,
        policeStations: 0,
        hospitals: 0,
        rating: 2.2,
        color: 'red',
        description: `Passes through narrow, dimly lit back alleys and industrial corridors between ${cleanStart} and ${cleanDest}. High incident rate with low cellular reception. Strictly avoid during night hours.`,
        features: ['Dims/Unlit Segments', 'Zero CCTV Surveillance', 'Low Connectivity Zones'],
        start: cleanStart,
        destination: cleanDest
      }
    ];
  };

  const [routes, setRoutes] = useState<RouteInfo[]>(() =>
    generateDynamicRoutes('My Current Location (Sector 6)', 'DLF CyberCity Gate 2', 'cab')
  );

  const handleRoutesResolved = (resolvedRoutes: Array<{ distance: string; duration: string }>) => {
    setRoutes((currentRoutes) => {
      if (!currentRoutes || currentRoutes.length === 0) return currentRoutes;
      return currentRoutes.map((route, idx) => {
        const resolved = resolvedRoutes[idx] || resolvedRoutes[0];
        if (!resolved) return route;
        return {
          ...route,
          distance: resolved.distance,
          duration: resolved.duration
        };
      });
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start.trim() || !destination.trim()) {
      onToast('Please enter both origin and destination', 'warn');
      return;
    }

    setCalculating(true);
    setShowResults(false);
    
    setTimeout(() => {
      setCalculating(false);
      setShowResults(true);
      setSelectedRouteIndex(0);
      setRoutes(generateDynamicRoutes(start, destination, mode));
      onToast(`Safety route tracks generated for ${destination}!`, 'success');
    }, 1500);
  };

  const handleSelectRoute = (idx: number) => {
    setSelectedRouteIndex(idx);
    const selected = routes[idx];
    if (selected.riskLevel === 'High') {
      onToast('Warning: This route has a High Risk Level. We recommend Corridor Alfa.', 'warn');
    } else {
      onToast(`Switched to ${selected.name}`, 'info');
    }
  };

  const currentRoute = routes[selectedRouteIndex];

  return (
    <div id="safeher-safe-route-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Navigation className="w-6 h-6 text-violet-600 animate-pulse" />
          Safe Route Navigation
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Plan your destination using safety scores calculated from city sensors, police data, lighting levels, and community reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR: Search Controls (Cols: 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-600" />
              Configure Route Settings
            </h2>

            <form onSubmit={handleSearch} className="space-y-4">
              {/* Origin input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block">Starting Point</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4.5 h-4.5 text-teal-500" />
                  <input
                    type="text"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="Enter start location..."
                    className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Destination input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block">Where are you heading?</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4.5 h-4.5 text-rose-500" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter destination..."
                    className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Travel Mode selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 block">Travel Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {travelModesList.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer ${
                        mode === m.id
                          ? 'border-violet-500 bg-violet-50/70 text-violet-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-lg mb-1 select-none">{m.icon}</span>
                      <span className="text-[10px] font-semibold tracking-tight">{m.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={calculating}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {calculating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                    Calculating Safest Tracks...
                  </>
                ) : (
                  <>
                    <Compass className="w-4.5 h-4.5" />
                    Find Safest Route
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Notice widget */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 flex gap-3 text-xs text-amber-800 leading-relaxed">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Proactive Safety Notice</p>
              <p>DLF CyberCity police barricades are active. Route Alfa keeps you within visual distance of PCR booths and fully active high-mast lights.</p>
            </div>
          </div>
        </div>

        {/* RIGHT MAP DISPLAY AND RESULTS (Cols: 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Vector Map Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[400px] relative">
            <MapPlaceholder
              mode="route-selection"
              selectedRouteIndex={selectedRouteIndex}
              start={start}
              destination={destination}
              onRoutesResolved={handleRoutesResolved}
            />
          </div>

          {/* RESULTS GRID / ROUTE CARD DETAILS */}
          {showResults && (
            <div className="space-y-5">
              {/* Route Tabs Selector (High-level details) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {routes.map((route, idx) => {
                  const isSelected = idx === selectedRouteIndex;
                  return (
                    <button
                      key={route.id}
                      onClick={() => handleSelectRoute(idx)}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? route.color === 'green'
                            ? 'border-emerald-500 bg-emerald-50/45 shadow-sm'
                            : route.color === 'yellow'
                            ? 'border-amber-500 bg-amber-50/45 shadow-sm'
                            : 'border-rose-500 bg-rose-50/45 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-xs font-bold text-slate-700">{route.name.split(' (')[0]}</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            route.color === 'green'
                              ? 'bg-emerald-100 text-emerald-800'
                              : route.color === 'yellow'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {route.riskLevel} Risk
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xl font-bold text-slate-900">{route.duration}</span>
                        <span className="text-xs text-slate-500">{route.distance}</span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 mt-2">
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              route.color === 'green'
                                ? 'bg-emerald-500'
                                : route.color === 'yellow'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${route.safetyScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold font-mono shrink-0">{route.safetyScore}% Safety</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Active Route Card */}
              <motion.div
                key={selectedRouteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6"
              >
                {/* Title & Core stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-800">{currentRoute.name}</h3>
                      <span className="text-[10px] font-bold text-teal-600 uppercase bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        Top Rated
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{currentRoute.description}</p>
                  </div>

                  <button
                    onClick={() => onStartJourney(currentRoute)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    Start Safe Journey
                  </button>
                </div>

                {/* Grid of Route Security Indicators (WCAG Large Text) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Metric 1 */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Illumination</span>
                    <span className="text-xl font-extrabold text-slate-900 block font-mono">{currentRoute.litPercent}%</span>
                    <span className="text-[9px] font-semibold text-emerald-600 block mt-0.5">Highly Lit Streets</span>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">CCTV Coverage</span>
                    <span className="text-xl font-extrabold text-slate-900 block font-mono">{currentRoute.cctvPercent}%</span>
                    <span className="text-[9px] font-semibold text-emerald-600 block mt-0.5">Active Surveillance</span>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Police Booths</span>
                    <span className="text-xl font-extrabold text-slate-900 block font-mono">{currentRoute.policeStations}</span>
                    <span className="text-[9px] font-semibold text-slate-500 block mt-0.5">Checkpoints on track</span>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Hospitals</span>
                    <span className="text-xl font-extrabold text-slate-900 block font-mono">{currentRoute.hospitals}</span>
                    <span className="text-[9px] font-semibold text-slate-500 block mt-0.5">Within 500m radius</span>
                  </div>
                </div>

                {/* Bullet Checkpoints */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Safety Checklist Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentRoute.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-100/50 text-xs font-medium text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
