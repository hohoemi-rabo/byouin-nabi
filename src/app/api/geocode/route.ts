import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: '住所を指定してください' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API キーが設定されていません' }, { status: 500 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=ja`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.results?.length) {
      return NextResponse.json({ error: '座標が見つかりませんでした。住所を確認してください。' }, { status: 404 });
    }

    const { lat, lng } = data.results[0].geometry.location;
    return NextResponse.json({ latitude: lat, longitude: lng });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ error: '座標の取得に失敗しました' }, { status: 500 });
  }
}
