import { supabase } from '@/lib/supabase';
import type { TransportService } from '@/types/transport';
import type { Route } from '@/types/route';

interface MatchOptions {
  fromArea?: string;
  toHospitalId?: string;
  wheelchair?: boolean;
}

/**
 * 出発地・目的地の情報から利用可能な地域交通手段を検索し、ルート候補を生成
 */
export async function matchTransportServices(options: MatchOptions): Promise<Route[]> {
  const routes: Route[] = [];

  let query = supabase
    .from('transport_services')
    .select('*')
    .eq('is_active', true);

  if (options.fromArea) {
    query = query.contains('service_area', [options.fromArea]);
  }
  if (options.wheelchair) {
    query = query.eq('wheelchair_accessible', true);
  }

  const { data: services } = await query;
  if (!services || services.length === 0) return routes;

  // 送迎バスの検索（目的地が病院の場合）
  if (options.toHospitalId) {
    const shuttles = services.filter((s: TransportService) => s.service_type === 'shuttle');
    for (const s of shuttles) {
      routes.push(buildTransportRoute(s, 'shuttle'));
    }
  }

  // デマンド交通
  const demands = services.filter((s: TransportService) => s.service_type === 'demand');
  for (const s of demands) {
    routes.push(buildTransportRoute(s, 'demand'));
  }

  // タクシー
  const taxis = services.filter((s: TransportService) =>
    s.service_type === 'taxi' || s.service_type === 'welfare_taxi'
  );
  for (const s of taxis) {
    routes.push(buildTransportRoute(s, 'taxi'));
  }

  return routes;
}

function buildTransportRoute(service: TransportService, type: 'demand' | 'taxi' | 'shuttle'): Route {
  return {
    type,
    transport_name: service.name,
    duration_minutes: 0, // 地域交通は所要時間が不定
    distance_km: 0,
    fare: service.fare_info || undefined,
    booking_required: service.advance_booking_required,
    booking_phone: service.phone || undefined,
    booking_url: service.booking_url || undefined,
    steps: [{
      instruction: service.advance_booking_required
        ? `${service.name}に電話で予約してください${service.booking_deadline_hours ? `（${service.booking_deadline_hours}時間前まで）` : ''}`
        : `${service.name}をご利用ください`,
    }],
    notes: [
      service.eligibility,
      service.notes,
    ].filter(Boolean).join('。') || undefined,
  };
}
