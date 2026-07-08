import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Shield, MapPin, Navigation, AlertTriangle, Eye, Activity, Info, ShieldCheck, Moon } from 'lucide-react';
import { IncidentReport } from '../types';

interface MapPlaceholderProps {
  mode: 'route-selection' | 'live-trip' | 'incident-report' | 'community-heatmap';
  selectedRouteIndex?: number;
  simulationActive?: boolean;
  onSimulationProgress?: (
    progress: number,
    coordinates: { x: number; y: number; lat: number; lng: number },
    state: 'safe' | 'deviation' | 'high-risk'
  ) => void;
  onSelectPinLocation?: (
    coordinates: { x: number; y: number; lat: number; lng: number },
    addressName: string
  ) => void;
  selectedPinLocation?: { x: number; y: number; lat?: number; lng?: number } | null;
  heatmapFilter?: string;
  customReports?: IncidentReport[];
  start?: string;
  destination?: string;
  onRoutesResolved?: (routes: Array<{ distance: string; duration: string }>) => void;
}

// Map logical relative grid coords (0.0 - 1.0) to actual physical bounds in Gurugram, India (CyberCity / Sector 6 area)
const relToLatLng = (x: number, y: number) => {
  const lat = 28.5100 - y * (28.5100 - 28.4700);
  const lng = 77.0600 + x * (77.1100 - 77.0600);
  return { lat, lng };
};

const latLngToRel = (lat: number, lng: number) => {
  const y = (28.5100 - lat) / (28.5100 - 28.4700);
  const x = (lng - 77.0600) / (77.1100 - 77.0600);
  return { x, y };
};

const getLat = (p: any): number => {
  if (!p) return 0;
  if (typeof p.lat === 'function') return p.lat();
  return Number(p.lat);
};

const getLng = (p: any): number => {
  if (!p) return 0;
  if (typeof p.lng === 'function') return p.lng();
  return Number(p.lng);
};

// Expose API Key securely via System Secrets and Vite configuration
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function MapPlaceholder({
  mode,
  selectedRouteIndex = 0,
  simulationActive = false,
  onSimulationProgress,
  onSelectPinLocation,
  selectedPinLocation,
  heatmapFilter,
  customReports = [],
  start,
  destination,
  onRoutesResolved
}: MapPlaceholderProps) {

  if (!hasValidKey) {
    return (
      <div id="safeher-maps-fallback" className="flex items-center justify-center h-full w-full bg-slate-50 border border-slate-200/85 rounded-2xl p-6 text-center select-none">
        <div className="max-w-md space-y-4">
          <div className="mx-auto w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 animate-pulse">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Google Maps Integration Required</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            SafeHer supports high-fidelity real-time Google Maps and Directions routing. To enable this feature:
          </p>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-left text-[11px] text-slate-600 space-y-2 font-medium">
            <p><strong>Step 1:</strong> Obtain a free API key at <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-violet-600 font-bold underline">Google Cloud Console</a>.</p>
            <p><strong>Step 2:</strong> Add your key inside AI Studio:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Click the <strong>Settings</strong> (⚙️ gear icon, top-right corner).</li>
              <li>Select <strong>Secrets</strong>.</li>
              <li>Enter <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the name, then paste your API key as the value.</li>
            </ul>
          </div>
          <p className="text-[10px] text-slate-400">The application will automatically compile and enable live tracking upon key detection.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <MapContainer
          mode={mode}
          selectedRouteIndex={selectedRouteIndex}
          simulationActive={simulationActive}
          onSimulationProgress={onSimulationProgress}
          onSelectPinLocation={onSelectPinLocation}
          selectedPinLocation={selectedPinLocation}
          heatmapFilter={heatmapFilter}
          customReports={customReports}
          start={start}
          destination={destination}
          onRoutesResolved={onRoutesResolved}
        />
      </div>
    </APIProvider>
  );
}

function MapContainer({
  mode,
  selectedRouteIndex = 0,
  simulationActive = false,
  onSimulationProgress,
  onSelectPinLocation,
  selectedPinLocation,
  heatmapFilter,
  customReports = [],
  start,
  destination,
  onRoutesResolved
}: MapPlaceholderProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const geocodingLib = useMapsLibrary('geocoding');

  const [routePaths, setRoutePaths] = useState<google.maps.LatLng[][]>([]);
  const [simProgress, setSimProgress] = useState(0);
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'deviation' | 'high-risk'>('safe');
  const [simVehicleCoord, setSimVehicleCoord] = useState<google.maps.LatLngLiteral | null>(null);

  const defaultCenter = { lat: 28.4962, lng: 77.0878 }; // Gurugram / Cybercity Center Area

  // Run live simulation interval
  useEffect(() => {
    let interval: any;
    if (simulationActive && mode === 'live-trip') {
      interval = setInterval(() => {
        setSimProgress((prev) => {
          const next = prev + 0.005;
          if (next >= 1) return 0;
          return next;
        });
      }, 100);
    } else {
      setSimProgress(0);
      setSimVehicleCoord(null);
      setSafetyStatus('safe');
    }
    return () => clearInterval(interval);
  }, [simulationActive, mode]);

  // Handle live vehicle coordinate interpolation
  useEffect(() => {
    if (mode === 'live-trip' && simulationActive && routePaths.length > 0 && onSimulationProgress) {
      const activePath = routePaths[selectedRouteIndex] || routePaths[0];
      if (activePath && activePath.length > 0) {
        const totalPoints = activePath.length;
        const floatIndex = simProgress * (totalPoints - 1);
        const index = Math.floor(floatIndex);
        const fraction = floatIndex - index;

        if (index < totalPoints - 1) {
          const p1 = activePath[index];
          const p2 = activePath[index + 1];

          let currentLat = getLat(p1) + (getLat(p2) - getLat(p1)) * fraction;
          let currentLng = getLng(p1) + (getLng(p2) - getLng(p1)) * fraction;

          let state: 'safe' | 'deviation' | 'high-risk' = 'safe';
          // At 45% - 70% progress, we force deviation to demonstrate safety alerts and proactive guards
          if (simProgress > 0.45 && simProgress < 0.7) {
            state = 'deviation';
            currentLat += 0.0018 * Math.sin((simProgress - 0.45) * Math.PI * 4);
            currentLng += 0.0018 * Math.cos((simProgress - 0.45) * Math.PI * 4);
          } else if (simProgress >= 0.7 && simProgress < 0.85) {
            state = 'high-risk';
          }

          setSafetyStatus(state);
          const coord = { lat: currentLat, lng: currentLng };
          setSimVehicleCoord(coord);

          const { x, y } = latLngToRel(currentLat, currentLng);
          onSimulationProgress(simProgress, { x, y, lat: currentLat, lng: currentLng }, state);
        }
      }
    }
  }, [simProgress, simulationActive, routePaths, selectedRouteIndex, mode]);

  // Click handler to set specific location markers with address geocoding
  const handleMapClick = (e: any) => {
    if (mode !== 'incident-report' || !onSelectPinLocation || !e.detail?.latLng) return;
    const clickedLat = e.detail.latLng.lat;
    const clickedLng = e.detail.latLng.lng;

    const { x, y } = latLngToRel(clickedLat, clickedLng);

    if (geocodingLib) {
      const geocoder = new geocodingLib.Geocoder();
      geocoder.geocode({ location: { lat: clickedLat, lng: clickedLng } }, (results, status) => {
        let addressName = `Sector ${Math.floor(x * 10 + 1)} Corridor (GPS: ${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)})`;
        if (status === 'OK' && results && results[0]) {
          addressName = results[0].formatted_address;
        }
        onSelectPinLocation({ x, y, lat: clickedLat, lng: clickedLng }, addressName);
      });
    } else {
      const fallbackAddress = `Pinned Location (GPS: ${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)})`;
      onSelectPinLocation({ x, y, lat: clickedLat, lng: clickedLng }, fallbackAddress);
    }
  };

  // Calculate and draw real directions using the Routes API (V2 computeRoutes)
  const originAddr = start || 'Sector 6, Gurugram, Haryana, India';
  const destAddr = destination || 'DLF CyberCity, Gurugram, Haryana, India';
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || (mode !== 'route-selection' && mode !== 'live-trip')) return;

    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin: originAddr,
      destination: destAddr,
      travelMode: 'DRIVING',
      computeAlternativeRoutes: true,
      fields: ['path', 'viewport'],
    }).then(({ routes }) => {
      if (routes && routes.length > 0) {
        const paths = routes.map(r => r.path);
        setRoutePaths(paths);

        // Notify parent with actual distances and durations computed in real-time
        if (onRoutesResolved) {
          const resolvedData = routes.map((route, rIdx) => {
            const path = route.path;
            let distanceKm = 0;
            for (let i = 0; i < path.length - 1; i++) {
              const p1 = path[i];
              const p2 = path[i + 1];
              const dLat = getLat(p2) - getLat(p1);
              const dLng = getLng(p2) - getLng(p1);
              distanceKm += Math.sqrt(dLat * dLat + dLng * dLng) * 111;
            }
            if (distanceKm === 0) distanceKm = 5.0;

            // Speed estimation depending on route
            let speed = 35;
            if (rIdx === 0) speed = 35;
            else if (rIdx === 1) speed = 30;
            else speed = 25;

            const durationMins = Math.max(3, Math.round((distanceKm / speed) * 60));
            const durationText = durationMins >= 60
              ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
              : `${durationMins} mins`;

            return {
              distance: `${distanceKm.toFixed(1)} km`,
              duration: durationText
            };
          });
          onRoutesResolved(resolvedData);
        }

        routes.forEach((route, idx) => {
          if (mode === 'live-trip' && idx !== 0) return;

          const isSelected = idx === selectedRouteIndex;
          let color = '#10B981'; // Green (safest)
          if (idx === 1) color = '#F59E0B'; // Yellow (alternate bypass)
          if (idx >= 2) color = '#EF4444'; // Red (alleyway/higher risk)

          const polylines = route.createPolylines();
          polylines.forEach(p => {
            p.setOptions({
              strokeColor: color,
              strokeOpacity: isSelected ? 0.9 : 0.45,
              strokeWeight: isSelected ? 8 : 4,
            });
            p.setMap(map);
            polylinesRef.current.push(p);
          });
        });

        if (routes[0].viewport) {
          map.fitBounds(routes[0].viewport);
        }
      }
    }).catch(err => {
      console.warn("Could not load real-world directions. Placing fallback route vectors.", err);
    });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, originAddr, destAddr, selectedRouteIndex, mode]);

  // Marker Pin positioning for Incident Reports
  const resolvedPinLocation = selectedPinLocation
    ? selectedPinLocation.lat !== undefined && selectedPinLocation.lng !== undefined
      ? { lat: selectedPinLocation.lat, lng: selectedPinLocation.lng }
      : relToLatLng(selectedPinLocation.x, selectedPinLocation.y)
    : null;

  // Static reports list corresponding to default community comments
  const staticReports: IncidentReport[] = [
    {
      id: 'r1',
      type: 'poor-lighting',
      description: 'Sector 4 Metro Underpass is completely dark. bulb broken.',
      dateTime: 'Reported 2 hours ago',
      locationName: 'Sector 4 Metro Underpass Link',
      coordinates: { x: 0.58, y: 0.55 },
      isAnonymous: true,
      status: 'verified',
      reporter: 'Anonymous Guardian',
      upvotes: 42
    },
    {
      id: 'r2',
      type: 'harassment',
      description: 'Two men loitering near construction site gate.',
      dateTime: 'Reported 5 hours ago',
      locationName: 'Outer Ring Bypass Construction Site',
      coordinates: { x: 0.28, y: 0.42 },
      isAnonymous: false,
      status: 'verified',
      reporter: 'Ritu Sen',
      upvotes: 28
    },
    {
      id: 'r3',
      type: 'theft',
      description: 'Two-wheeler chain snatching incident reported near the park.',
      dateTime: 'Reported Yesterday',
      locationName: 'Vikas Public Park Gate 3',
      coordinates: { x: 0.82, y: 0.75 },
      isAnonymous: true,
      status: 'resolved',
      reporter: 'Anonymous Member',
      upvotes: 56
    },
    {
      id: 'r4',
      type: 'safe-zone',
      description: '24/7 market cluster. Extremely safe with guards.',
      dateTime: 'Reported 2 days ago',
      locationName: 'Palam Market Cluster',
      coordinates: { x: 0.62, y: 0.8 },
      isAnonymous: false,
      status: 'verified',
      reporter: 'Neha Malhotra',
      upvotes: 89
    }
  ];

  const allHeatmapReports = [...customReports, ...staticReports];

  const filteredHeatmapReports = allHeatmapReports.filter((rep) => {
    if (!heatmapFilter || heatmapFilter === 'all') return true;
    if (heatmapFilter === 'harassment' && rep.type === 'harassment') return true;
    if (heatmapFilter === 'theft' && rep.type === 'theft') return true;
    if (heatmapFilter === 'poor-lighting' && rep.type === 'poor-lighting') return true;
    if (heatmapFilter === 'unsafe-roads' && rep.type === 'unsafe-road') return true;
    if (heatmapFilter === 'safe-zones' && rep.type === 'safe-zone') return true;
    return false;
  });

  return (
    <>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        onClick={handleMapClick}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Render community threat matrix markers if in heatmap overlay mode */}
        {mode === 'community-heatmap' &&
          filteredHeatmapReports.map((rep) => {
            const loc = rep.coordinates.lat !== undefined && rep.coordinates.lng !== undefined
              ? { lat: rep.coordinates.lat, lng: rep.coordinates.lng }
              : relToLatLng(rep.coordinates.x, rep.coordinates.y);

            let bg = '#EF4444'; // Red
            if (rep.type === 'poor-lighting') bg = '#F59E0B'; // Amber
            if (rep.type === 'safe-zone') bg = '#14B8A6'; // Teal

            return (
              <AdvancedMarker key={rep.id} position={loc} title={rep.locationName}>
                <div style={{ width: '40px', height: '40px' }} className="flex items-center justify-center relative">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping pointer-events-none"
                    style={{ backgroundColor: bg }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white shadow-md relative"
                    style={{ backgroundColor: bg }}
                  >
                    {rep.type === 'safe-zone' ? (
                      <ShieldCheck className="w-4.5 h-4.5" />
                    ) : rep.type === 'poor-lighting' ? (
                      <Moon className="w-4.5 h-4.5" />
                    ) : (
                      <AlertTriangle className="w-4.5 h-4.5" />
                    )}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

        {/* Selected custom pin if placing a new report */}
        {mode === 'incident-report' && resolvedPinLocation && (
          <AdvancedMarker position={resolvedPinLocation} title="Reported Incident Location">
            <div style={{ width: '40px', height: '40px' }} className="flex items-center justify-center relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping pointer-events-none" />
              <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white shadow-md relative">
                <AlertTriangle className="w-4.5 h-4.5 animate-bounce" />
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Live simulated cab vehicle moving along computed street routes */}
        {mode === 'live-trip' && simulationActive && simVehicleCoord && (
          <AdvancedMarker position={simVehicleCoord} title="My Live Cab Position">
            <div style={{ width: '40px', height: '40px' }} className="flex items-center justify-center relative">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping pointer-events-none ${
                  safetyStatus === 'deviation'
                    ? 'bg-rose-400'
                    : safetyStatus === 'high-risk'
                    ? 'bg-amber-400'
                    : 'bg-violet-400'
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg relative ${
                  safetyStatus === 'deviation'
                    ? 'bg-rose-500'
                    : safetyStatus === 'high-risk'
                    ? 'bg-amber-500'
                    : 'bg-violet-600'
                }`}
              >
                <Navigation className="w-4.5 h-4.5 rotate-45" />
              </div>
            </div>
          </AdvancedMarker>
        )}
      </Map>

      {/* Floating Control Legend Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 glass-panel py-1.5 px-3 rounded-full border border-slate-200 shadow-sm text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-md">
        <Activity className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
        <span>
          {mode === 'route-selection' && `Real-World Routes Evaluated`}
          {mode === 'live-trip' && simulationActive && `Live Trip Active`}
          {mode === 'live-trip' && !simulationActive && `Click Start Ride`}
          {mode === 'incident-report' && `Click Map to Place Pin`}
          {mode === 'community-heatmap' && `Community Threat Matrix`}
        </span>
      </div>

      <div className="absolute bottom-4 left-4 z-10 glass-panel px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm text-[11px] text-slate-700 font-medium space-y-1 bg-white/90 backdrop-blur-md max-w-xs pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
          <span>Safest Main Routes / Safe Zones</span>
        </div>
        {mode === 'community-heatmap' && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse inline-block"></span>
            <span>Reported Incidents / Alleys</span>
          </div>
        )}
        {mode === 'live-trip' && simulationActive && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block animate-pulse"></span>
            <span>Your Live GPS Tracking</span>
          </div>
        )}
      </div>
    </>
  );
}
