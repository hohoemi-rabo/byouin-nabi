'use client';

import dynamic from 'next/dynamic';

const HospitalMap = dynamic(() => import('@/components/Map/HospitalMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />,
});

interface HospitalMapWrapperProps {
  latitude: number;
  longitude: number;
  hospitalName: string;
}

export default function HospitalMapWrapper(props: HospitalMapWrapperProps) {
  return <HospitalMap {...props} />;
}
