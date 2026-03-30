'use client';

import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { useCallback } from 'react';
import LoadingBox from '@/components/Common/LoadingBox';

interface HospitalMapProps {
  latitude: number;
  longitude: number;
  hospitalName: string;
}

const containerStyle = {
  width: '100%',
  height: '300px',
};

export default function HospitalMap({ latitude, longitude, hospitalName }: HospitalMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  });

  const center = { lat: latitude, lng: longitude };

  const onLoad = useCallback(() => {
    // マップロード完了
  }, []);

  if (!apiKey) return null;

  if (loadError) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
        <p>地図の読み込みに失敗しました</p>
        <a
          href={`https://www.google.com/maps?q=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline mt-2 inline-block"
        >
          Google Maps で開く
        </a>
      </div>
    );
  }

  if (!isLoaded) {
    return <LoadingBox message="地図を読み込み中..." size="sm" />;
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        <MarkerF position={center} title={hospitalName} />
      </GoogleMap>
    </div>
  );
}
