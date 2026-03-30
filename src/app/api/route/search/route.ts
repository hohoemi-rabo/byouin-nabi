import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { matchTransportServices } from '@/lib/transportMatcher';
import type { Route, RouteSearchResponse } from '@/types/route';

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_MAPS_KEY) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_KEY}&language=ja`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === 'OK' && data.results?.length) {
    return data.results[0].geometry.location;
  }
  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
  if (!GOOGLE_MAPS_KEY) return undefined;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_KEY}&language=ja`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === 'OK' && data.results?.length) {
    // 市町村名を抽出
    for (const component of data.results[0].address_components) {
      if (component.types.includes('locality')) {
        return component.long_name;
      }
    }
  }
  return undefined;
}

async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: 'driving' | 'transit' | 'walking'
): Promise<Route | null> {
  if (!GOOGLE_MAPS_KEY) return null;

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${GOOGLE_MAPS_KEY}&language=ja`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.routes?.length) return null;

    const route = data.routes[0];
    const leg = route.legs[0];

    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=${mode}`;

    return {
      type: mode,
      duration_minutes: Math.round(leg.duration.value / 60),
      distance_km: Math.round(leg.distance.value / 100) / 10,
      fare: mode === 'transit' && leg.fare ? leg.fare.text : undefined,
      booking_required: false,
      steps: leg.steps.slice(0, 5).map((step: { html_instructions: string; distance?: { text: string }; duration?: { text: string } }) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance?.text,
        duration: step.duration?.text,
      })),
      map_url: mapUrl,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, wheelchair } = body;

    // 出発地の座標解決
    let origin: { lat: number; lng: number };
    if ('lat' in from && 'lng' in from) {
      origin = { lat: from.lat, lng: from.lng };
    } else if ('address' in from) {
      const coords = await geocodeAddress(from.address);
      if (!coords) {
        return NextResponse.json({ error: '出発地の座標を取得できませんでした' }, { status: 400 });
      }
      origin = coords;
    } else {
      return NextResponse.json({ error: '出発地が指定されていません' }, { status: 400 });
    }

    // 目的地の座標解決
    let destination: { lat: number; lng: number; name: string };
    let hospitalId: string | undefined;

    if ('hospital_id' in to) {
      hospitalId = to.hospital_id;
      const { data: hospital } = await supabase
        .from('hospitals')
        .select('name, latitude, longitude')
        .eq('id', to.hospital_id)
        .single();

      if (!hospital?.latitude || !hospital?.longitude) {
        return NextResponse.json({ error: '目的地の座標がありません' }, { status: 400 });
      }
      destination = { lat: hospital.latitude, lng: hospital.longitude, name: hospital.name };
    } else if ('lat' in to && 'lng' in to) {
      destination = { lat: to.lat, lng: to.lng, name: '目的地' };
    } else {
      return NextResponse.json({ error: '目的地が指定されていません' }, { status: 400 });
    }

    // 出発地の市町村を逆ジオコーディングで取得
    const fromArea = await reverseGeocode(origin.lat, origin.lng);

    // 並列でルート取得
    const [drivingRoute, transitRoute, localRoutes] = await Promise.all([
      getDirections(origin, destination, 'driving'),
      getDirections(origin, destination, 'transit'),
      matchTransportServices({
        fromArea,
        toHospitalId: hospitalId,
        wheelchair,
      }),
    ]);

    // ルートを統合・優先順位付け（最大3ルート）
    const allRoutes: Route[] = [];

    // 1. 自家用車ルート
    if (drivingRoute) allRoutes.push(drivingRoute);
    // 2. 公共交通機関（Google Maps）
    if (transitRoute) allRoutes.push(transitRoute);
    // 3. 地域交通（デマンド・タクシー・送迎、最大1件ずつ）
    const addedTypes = new Set<string>();
    for (const r of localRoutes) {
      if (!addedTypes.has(r.type) && allRoutes.length < 3) {
        allRoutes.push(r);
        addedTypes.add(r.type);
      }
    }

    // 3ルートに満たない場合、地域交通を追加
    for (const r of localRoutes) {
      if (allRoutes.length >= 3) break;
      if (!allRoutes.includes(r)) {
        allRoutes.push(r);
      }
    }

    const response: RouteSearchResponse = {
      routes: allRoutes.slice(0, 3),
      destination: { name: destination.name, lat: destination.lat, lng: destination.lng },
      origin,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Route search error:', error);
    return NextResponse.json({ error: 'ルート検索に失敗しました' }, { status: 500 });
  }
}
