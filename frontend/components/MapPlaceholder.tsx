import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Activity, AlertTriangle } from 'lucide-react';
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
  userLocation?: { latitude: number; longitude: number; accuracy: number; speed: number | null } | null;
  onDeviationDetected?: (isDeviated: boolean) => void;
  startCoords?: { lat: number; lng: number } | null;
  destinationCoords?: { lat: number; lng: number } | null;
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

// Nominatim Geocoding API helper
const geocodeAddress = async (addr: string): Promise<[number, number] | null> => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'SafeHer-Sentinel-App/1.0'
      }
    });
    if (!response.ok) throw new Error('Nominatim geocoder error');
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.warn('Geocoding failed for', addr, e);
  }
  return null;
};

// Shifting coordinates slightly for alternative routes
const shiftPath = (coords: [number, number][], latOffset: number, lngOffset: number): [number, number][] => {
  return coords.map(([lat, lng]) => [lat + latOffset, lng + lngOffset]);
};

const localGeocode = (addr: string): [number, number] | null => {
  const normalized = addr.toLowerCase();
  if (normalized.includes('current location') || normalized.includes('sector 6')) {
    return [28.4962, 77.0878];
  }
  if (normalized.includes('cybercity') || normalized.includes('cyber city')) {
    return [28.5020, 77.0880];
  }
  if (normalized.includes('leisure valley') || normalized.includes('sector 29')) {
    return [28.4720, 77.0720];
  }
  if (normalized.includes('iffco')) {
    return [28.4750, 77.0730];
  }
  if (normalized.includes('mg road') || normalized.includes('mall mile')) {
    return [28.4830, 77.0800];
  }
  if (normalized.includes('sector 56')) {
    return [28.4350, 77.1000];
  }
  if (normalized.includes('golf course')) {
    return [28.4500, 77.0980];
  }
  if (normalized.includes('palam')) {
    return [28.4900, 77.0800];
  }
  if (normalized.includes('underpass') || normalized.includes('sector 4')) {
    return [28.4962, 77.0878];
  }
  if (normalized.includes('vikas') || normalized.includes('park')) {
    return [28.4912, 77.0838];
  }
  if (normalized.includes('sambalpur')) {
    return [21.4669, 83.9812];
  }
  if (normalized.includes('bhubaneswar') || normalized.includes('bhubaneshwar')) {
    return [20.2961, 85.8245];
  }
  if (normalized.includes('delhi') || normalized.includes('new delhi')) {
    return [28.6139, 77.2090];
  }
  if (normalized.includes('mumbai') || normalized.includes('bombay')) {
    return [19.0760, 72.8777];
  }
  if (normalized.includes('bangalore') || normalized.includes('bengaluru')) {
    return [12.9716, 77.5946];
  }
  if (normalized.includes('kolkata') || normalized.includes('calcutta')) {
    return [22.5726, 88.3639];
  }
  if (normalized.includes('gurgaon') || normalized.includes('gurugram')) {
    return [28.4595, 77.0266];
  }
  return null;
};

// Resolve start/dest mock addresses to fallback coords
const resolveAddressCoords = async (addr: string): Promise<[number, number]> => {
  const local = localGeocode(addr);
  if (local) return local;
  
  const result = await geocodeAddress(addr);
  if (result) return result;
  
  return [28.4962, 77.0878];
};

// OSRM routing helper
const fetchOsrmRoute = async (start: [number, number], end: [number, number]) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&alternatives=true`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM request failed');
    return await response.json();
  } catch (error) {
    console.warn('OSRM routing failed:', error);
    return null;
  }
};

// Custom DIV icons to replace Google Maps Advanced Markers
const userIcon = (isDeviated: boolean) => L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="width: 40px; height: 40px; display: flex; items-center; justify-content: center; position: relative;">
      <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; background-color: ${isDeviated ? '#ef4444' : '#10b981'}; pointer-events: none;"></span>
      <div style="width: 32px; height: 32px; border-radius: 9999px; border: 2px solid white; display: flex; items-center; justify-content: center; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.15); background-color: ${isDeviated ? '#ef4444' : '#059669'}; transform: rotate(45deg);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const vehicleIcon = (color: string) => L.divIcon({
  className: 'custom-vehicle-marker',
  html: `
    <div style="width: 40px; height: 40px; display: flex; items-center; justify-content: center; position: relative;">
      <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; background-color: ${color}; pointer-events: none;"></span>
      <div style="width: 32px; height: 32px; border-radius: 9999px; border: 2px solid white; display: flex; items-center; justify-content: center; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.15); background-color: ${color}; transform: rotate(45deg);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const heatmapIcon = (type: string, name: string) => {
  let bg = '#EF4444'; // Red
  let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

  if (type === 'poor-lighting') {
    bg = '#F59E0B'; // Amber
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  } else if (type === 'safe-zone') {
    bg = '#14B8A6'; // Teal
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 11 2 2 4-4"/></svg>`;
  }

  return L.divIcon({
    className: 'custom-heatmap-marker',
    html: `
      <div style="width: 40px; height: 40px; display: flex; items-center; justify-content: center; position: relative;">
        <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; background-color: ${bg}; pointer-events: none;"></span>
        <div style="width: 32px; height: 32px; border-radius: 9999px; border: 2px solid white; display: flex; items-center; justify-content: center; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background-color: ${bg};">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

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
  onRoutesResolved,
  userLocation,
  onDeviationDetected,
  startCoords,
  destinationCoords
}: MapPlaceholderProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayersRef = useRef<L.Polyline[]>([]);
  const markerLayersRef = useRef<L.Marker[]>([]);

  const [routePaths, setRoutePaths] = useState<L.LatLng[][]>([]);
  const [simProgress, setSimProgress] = useState(0);
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'deviation' | 'high-risk'>('safe');
  const [simVehicleCoord, setSimVehicleCoord] = useState<L.LatLngLiteral | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Gurugram center
    const leafletMap = L.map(mapContainerRef.current, {
      center: [28.4962, 77.0878],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // Add Tile Layer (CartoDB Positron - Sleek Light theme map style matching aesthetics)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(leafletMap);

    mapRef.current = leafletMap;

    return () => {
      leafletMap.remove();
      mapRef.current = null;
    };
  }, []);

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

          let currentLat = p1.lat + (p2.lat - p1.lat) * fraction;
          let currentLng = p1.lng + (p2.lng - p1.lng) * fraction;

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

  // Distance computation (Haversine formula)
  const getDistanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Center map on userLocation and evaluate real-time deviation
  useEffect(() => {
    const leafletMap = mapRef.current;
    if (!leafletMap || !userLocation || mode !== 'live-trip') return;

    // Pan map to active user GPS location
    leafletMap.panTo([userLocation.latitude, userLocation.longitude]);

    if (simulationActive || routePaths.length === 0) return;

    const activePath = routePaths[selectedRouteIndex] || routePaths[0];
    if (!activePath || activePath.length === 0) return;

    let minDistance = Infinity;
    let closestIndex = 0;

    activePath.forEach((point, idx) => {
      const dist = getDistanceMeters(userLocation.latitude, userLocation.longitude, point.lat, point.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    const isDev = minDistance > 150;
    if (onDeviationDetected) {
      onDeviationDetected(isDev);
    }

    const state = isDev ? 'deviation' as const : 'safe' as const;
    setSafetyStatus(state);

    if (onSimulationProgress) {
      const progressFraction = closestIndex / (activePath.length - 1 || 1);
      const { x, y } = latLngToRel(userLocation.latitude, userLocation.longitude);
      onSimulationProgress(
        progressFraction,
        { x, y, lat: userLocation.latitude, lng: userLocation.longitude },
        state
      );
    }
  }, [userLocation, simulationActive, routePaths, selectedRouteIndex, mode]);

  // Click handler to set specific location markers with address geocoding
  useEffect(() => {
    const leafletMap = mapRef.current;
    if (!leafletMap || mode !== 'incident-report' || !onSelectPinLocation) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const { x, y } = latLngToRel(lat, lng);

      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(res => res.json())
        .then(data => {
          const addressName = data.display_name || `Pinned Location (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          onSelectPinLocation({ x, y, lat, lng }, addressName);
        })
        .catch(() => {
          const addressName = `Pinned Location (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          onSelectPinLocation({ x, y, lat, lng }, addressName);
        });
    };

    leafletMap.on('click', handleMapClick);
    return () => {
      leafletMap.off('click', handleMapClick);
    };
  }, [mode, onSelectPinLocation]);

  // Calculate and draw real directions using OSRM Routing service
  useEffect(() => {
    const leafletMap = mapRef.current;
    if (!leafletMap || (mode !== 'route-selection' && mode !== 'live-trip')) return;

    let active = true;

    const computeRoutes = async () => {
      const startLoc = startCoords
        ? [startCoords.lat, startCoords.lng] as [number, number]
        : await resolveAddressCoords(start || '');

      const destLoc = destinationCoords
        ? [destinationCoords.lat, destinationCoords.lng] as [number, number]
        : await resolveAddressCoords(destination || '');

      if (!active) return;

      const osrmData = await fetchOsrmRoute(startLoc, destLoc);
      if (!active) return;

      if (osrmData && osrmData.routes && osrmData.routes.length > 0) {
        const paths: L.LatLng[][] = osrmData.routes.map((route: any) => {
          return route.geometry.coordinates.map(([lng, lat]: [number, number]) => {
            return L.latLng(lat, lng);
          });
        });

        // Ensure we have 3 paths to match UI
        if (paths.length < 3) {
          const primaryPath = paths[0];
          const secondary = shiftPath(primaryPath.map(p => [p.lat, p.lng]), 0.001, -0.001)
            .map(([lat, lng]) => L.latLng(lat, lng));
          const tertiary = shiftPath(primaryPath.map(p => [p.lat, p.lng]), -0.0015, 0.0015)
            .map(([lat, lng]) => L.latLng(lat, lng));
          
          if (paths.length === 1) {
            paths.push(secondary, tertiary);
          } else if (paths.length === 2) {
            paths.push(tertiary);
          }
        }

        setRoutePaths(paths);

        if (onRoutesResolved) {
          const resolvedData = osrmData.routes.map((route: any) => {
            const distanceKm = route.distance / 1000;
            const durationMins = Math.round(route.duration / 60);
            return {
              distance: `${distanceKm.toFixed(1)} km`,
              duration: durationMins >= 60
                ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
                : `${durationMins} mins`
            };
          });

          while (resolvedData.length < 3) {
            const base = resolvedData[0] || { distance: '5.0 km', duration: '12 mins' };
            const multiplier = resolvedData.length === 1 ? 1.15 : 0.75;
            const baseKm = parseFloat(base.distance) || 5.0;
            const baseMins = parseInt(base.duration) || 12;
            resolvedData.push({
              distance: `${(baseKm * multiplier).toFixed(1)} km`,
              duration: `${Math.round(baseMins * multiplier)} mins`
            });
          }

          onRoutesResolved(resolvedData);
        }
      } else {
        // Direct line fallbacks
        const line = [L.latLng(startLoc[0], startLoc[1]), L.latLng(destLoc[0], destLoc[1])];
        const secondary = shiftPath([startLoc, destLoc], 0.001, -0.001).map(([lat, lng]) => L.latLng(lat, lng));
        const tertiary = shiftPath([startLoc, destLoc], -0.0015, 0.0015).map(([lat, lng]) => L.latLng(lat, lng));
        
        const paths = [line, secondary, tertiary];
        setRoutePaths(paths);

        if (onRoutesResolved) {
          onRoutesResolved([
            { distance: '4.5 km', duration: '8 mins' },
            { distance: '5.1 km', duration: '9 mins' },
            { distance: '3.3 km', duration: '6 mins' }
          ]);
        }
      }
    };

    computeRoutes();

    return () => {
      active = false;
    };
  }, [start, destination, startCoords, destinationCoords, mode]);

  // Draw Polylines
  useEffect(() => {
    const leafletMap = mapRef.current;
    if (!leafletMap || routePaths.length === 0) return;

    routeLayersRef.current.forEach(l => l.remove());
    routeLayersRef.current = [];

    routePaths.forEach((path, idx) => {
      if (mode === 'live-trip' && idx !== selectedRouteIndex) return;

      const isSelected = idx === selectedRouteIndex;
      let color = '#10B981'; // Green
      if (idx === 1) color = '#F59E0B'; // Yellow
      if (idx >= 2) color = '#EF4444'; // Red

      const polyline = L.polyline(path, {
        color: color,
        weight: isSelected ? 8 : 4,
        opacity: isSelected ? 0.9 : 0.45,
      }).addTo(leafletMap);

      routeLayersRef.current.push(polyline);
    });

    const activeRoute = routePaths[selectedRouteIndex] || routePaths[0];
    if (activeRoute && activeRoute.length > 0 && mode === 'route-selection') {
      const bounds = L.latLngBounds(activeRoute);
      leafletMap.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routePaths, selectedRouteIndex, mode]);

  // Marker Pin rendering
  const resolvedPinLocation = selectedPinLocation
    ? selectedPinLocation.lat !== undefined && selectedPinLocation.lng !== undefined
      ? { lat: selectedPinLocation.lat, lng: selectedPinLocation.lng }
      : relToLatLng(selectedPinLocation.x, selectedPinLocation.y)
    : null;

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

  useEffect(() => {
    const leafletMap = mapRef.current;
    if (!leafletMap) return;

    markerLayersRef.current.forEach(m => m.remove());
    markerLayersRef.current = [];

    const addMarker = (latlng: [number, number] | L.LatLng, icon: L.DivIcon, title: string) => {
      const m = L.marker(latlng, { icon, title }).addTo(leafletMap);
      markerLayersRef.current.push(m);
      return m;
    };

    if (mode === 'route-selection' || mode === 'live-trip') {
      if (routePaths.length > 0) {
        const activePath = routePaths[selectedRouteIndex] || routePaths[0];
        if (activePath && activePath.length > 0) {
          const startPt = activePath[0];
          const destPt = activePath[activePath.length - 1];

          addMarker(startPt, L.divIcon({
            className: 'start-marker',
            html: `<div style="width: 20px; height: 20px; border-radius: 9999px; background-color: #10b981; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.15);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }), 'Starting Point');

          addMarker(destPt, L.divIcon({
            className: 'dest-marker',
            html: `<div style="width: 20px; height: 20px; border-radius: 9999px; background-color: #ef4444; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.15);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }), 'Destination');
        }
      }
    }

    if (mode === 'incident-report' && resolvedPinLocation) {
      addMarker([resolvedPinLocation.lat, resolvedPinLocation.lng], L.divIcon({
        className: 'incident-report-marker',
        html: `
          <div style="width: 40px; height: 40px; display: flex; items-center; justify-center; position: relative;">
            <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: #f43f5e; opacity: 0.75; animation: ping 1.5s infinite; pointer-events: none;"></span>
            <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: #f43f5e; border: 2px solid white; display: flex; items-center; justify-center; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }), 'Incident Location');

      leafletMap.panTo([resolvedPinLocation.lat, resolvedPinLocation.lng]);
    }

    if (mode === 'community-heatmap') {
      filteredHeatmapReports.forEach((rep) => {
        const loc = rep.coordinates.lat !== undefined && rep.coordinates.lng !== undefined
          ? { lat: rep.coordinates.lat, lng: rep.coordinates.lng }
          : relToLatLng(rep.coordinates.x, rep.coordinates.y);

        const m = addMarker([loc.lat, loc.lng], heatmapIcon(rep.type, rep.locationName), rep.locationName);
        m.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #374151; padding: 4px; max-width: 200px;">
            <strong style="font-size: 13px; color: #1f2937;">${rep.locationName}</strong><br/>
            <span style="color: #6b7280; font-size: 10px;">${rep.dateTime}</span>
            <p style="margin: 6px 0 0 0; line-height: 1.4;">${rep.description}</p>
          </div>
        `);
      });
    }

    if (mode === 'live-trip' && simulationActive && simVehicleCoord) {
      let color = '#7c3aed';
      if (safetyStatus === 'deviation') color = '#ef4444';
      else if (safetyStatus === 'high-risk') color = '#f59e0b';

      addMarker([simVehicleCoord.lat, simVehicleCoord.lng], vehicleIcon(color), 'My Live Cab Position');
    }

    if (userLocation && (mode === 'route-selection' || (mode === 'live-trip' && !simulationActive))) {
      const isDev = safetyStatus === 'deviation';
      addMarker([userLocation.latitude, userLocation.longitude], userIcon(isDev), 'Your Real GPS Location');
      leafletMap.panTo([userLocation.latitude, userLocation.longitude]);
    }
  }, [mode, routePaths, selectedRouteIndex, resolvedPinLocation, filteredHeatmapReports, simulationActive, simVehicleCoord, userLocation, safetyStatus]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 font-sans">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 0 }} />

      {/* Floating Control Legend Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 glass-panel py-1.5 px-3 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-800 bg-white/90 backdrop-blur-md">
        <Activity className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
        <span>
          {mode === 'route-selection' && `Real-World Routes (OSM/OSRM)`}
          {mode === 'live-trip' && simulationActive && `Live Trip Active`}
          {mode === 'live-trip' && !simulationActive && `Click Start Ride`}
          {mode === 'incident-report' && `Click Map to Place Pin`}
          {mode === 'community-heatmap' && `Threat Matrix Heatmap`}
        </span>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] glass-panel px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm text-[11px] text-slate-700 font-bold space-y-1 bg-white/90 backdrop-blur-md max-w-xs pointer-events-none">
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
    </div>
  );
}
