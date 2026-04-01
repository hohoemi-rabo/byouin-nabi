import Link from 'next/link';
import type { Facility } from '@/types/facility';

interface FacilityCardProps {
  facility: Facility;
}

export default function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <div className="border-l-4 border-primary bg-white p-4 shadow-sm hover:shadow-md transition-shadow rounded-r-lg">
      <h3 className="text-xl font-bold mb-2 text-foreground">{facility.name}</h3>

      <div className="space-y-1 text-base mb-3">
        <p className="flex items-start">
          <span className="mr-2">📍</span>
          <span className="text-gray-700">{facility.address}</span>
        </p>
        {facility.opening_hours && (
          <p className="flex items-start">
            <span className="mr-2">🕒</span>
            <span className="text-gray-700">{facility.opening_hours}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {facility.phone && (
          <a href={`tel:${facility.phone}`}
            className="flex items-center justify-center gap-1 bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-colors font-bold text-base min-h-tap shadow-md">
            📞 {facility.phone}
          </a>
        )}
        {facility.website_url && (
          <a href={facility.website_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium text-base min-h-tap shadow-md">
            🌐 Web
          </a>
        )}
        <Link href={`/route?to=${facility.latitude},${facility.longitude}&name=${encodeURIComponent(facility.name)}`}
          className="flex items-center justify-center bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 transition-colors font-medium text-base min-h-tap shadow-md">
          🚌 行き方
        </Link>
      </div>

      {facility.notes && (
        <p className="mt-2 text-sm text-gray-600">ℹ️ {facility.notes}</p>
      )}
    </div>
  );
}
