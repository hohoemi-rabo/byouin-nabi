/**
 * 交通関連の型定義（Phase 2）
 * Supabase transport_services / bus_routes / bus_stops / bus_timetables テーブルに対応
 */

export type ServiceType = 'route_bus' | 'demand' | 'taxi' | 'welfare_taxi' | 'shuttle';
export type BookingMethod = 'phone' | 'web' | 'app' | 'none';
export type Direction = 'outbound' | 'inbound';
export type DayType = 'weekday' | 'saturday' | 'holiday';

export interface TransportService {
  id: string;
  name: string;
  operator: string;
  service_type: ServiceType;
  service_area: string[];
  phone?: string | null;
  website_url?: string | null;
  booking_url?: string | null;
  booking_method?: BookingMethod | null;
  advance_booking_required: boolean;
  booking_deadline_hours?: number | null;
  eligibility?: string | null;
  fare_info?: string | null;
  wheelchair_accessible: boolean;
  notes?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BusRoute {
  id: string;
  transport_service_id: string;
  route_name: string;
  route_number?: string | null;
  created_at?: string;
}

export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at?: string;
}

export interface BusTimetable {
  id: string;
  bus_route_id: string;
  bus_stop_id: string;
  departure_time: string; // TIME 型 → HH:MM:SS 文字列
  direction: Direction;
  day_type: DayType;
  stop_order: number;
  created_at?: string;
}
