export type Page = 'home' | 'safe-route' | 'live-trip' | 'emergency' | 'report' | 'community' | 'profile';

export type TravelMode = 'walking' | 'cab' | 'auto' | 'bus';

export interface RouteInfo {
  id: string;
  name: string;
  distance: string;
  duration: string;
  safetyScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  litPercent: number;
  cctvPercent: number;
  policeStations: number;
  hospitals: number;
  rating: number;
  color: 'green' | 'yellow' | 'red';
  description: string;
  features: string[];
  start?: string;
  destination?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isTrusted: boolean;
  avatar: string;
}

export interface IncidentReport {
  id: string;
  type: 'harassment' | 'theft' | 'unsafe-road' | 'poor-lighting' | 'safe-zone';
  description: string;
  dateTime: string;
  locationName: string;
  coordinates: { x: number; y: number; lat?: number; lng?: number };
  isAnonymous: boolean;
  status: 'pending' | 'verified' | 'resolved';
  reporter: string;
  upvotes: number;
}

export interface CommunityComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
  likes: number;
  location: string;
  tag?: string;
}

export interface SavedPlace {
  id: string;
  label: string;
  address: string;
  icon: string;
}

export interface JourneyHistoryItem {
  id: string;
  date: string;
  from: string;
  to: string;
  mode: TravelMode;
  duration: string;
  safetyScore: number;
  status: 'completed' | 'alert-triggered';
}
