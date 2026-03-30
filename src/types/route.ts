/**
 * ルート検索関連の型定義（Phase 2）
 */

export type RouteType = 'driving' | 'transit' | 'demand' | 'taxi' | 'walking' | 'shuttle';

export interface RouteSearchRequest {
  from: { lat: number; lng: number } | { address: string };
  to: { lat: number; lng: number } | { hospital_id: string };
  arrival_time?: string;
  wheelchair?: boolean;
}

export interface RouteStep {
  instruction: string;
  distance?: string;
  duration?: string;
}

export interface Route {
  type: RouteType;
  transport_name?: string;
  departure_time?: string;
  arrival_time?: string;
  duration_minutes: number;
  distance_km: number;
  fare?: string;
  booking_required: boolean;
  booking_phone?: string;
  booking_url?: string;
  steps: RouteStep[];
  map_url?: string;
  notes?: string;
}

export interface RouteSearchResponse {
  routes: Route[];
  destination: {
    name: string;
    lat: number;
    lng: number;
  };
  origin: {
    lat: number;
    lng: number;
  };
}
