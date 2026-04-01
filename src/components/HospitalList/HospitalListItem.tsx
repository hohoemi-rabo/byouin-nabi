'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Hospital } from '@/types/hospital';
import { isCurrentlyOpen } from '@/lib/hospitalScoring';

const EMPTY_CATEGORIES: string[] = [];

interface HospitalListItemProps {
  hospital: Hospital;
  highlightCategories?: string[];
  detailUrl?: string;
  isFavorite?: boolean;
  showRouteButton?: boolean;
}

const HospitalListItem = memo(function HospitalListItem({
  hospital,
  highlightCategories = EMPTY_CATEGORIES,
  detailUrl,
  isFavorite = false,
  showRouteButton = false,
}: HospitalListItemProps) {
  const router = useRouter();
  const open = isCurrentlyOpen(hospital);

  const handleClick = () => {
    const url = detailUrl || `/hospital/${hospital.id}?from=results`;
    router.push(url);
  };

  return (
    <div
      onClick={handleClick}
      className="border-l-4 border-primary bg-white p-4 hover:bg-blue-50 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 active:bg-blue-100 active:scale-100 transition-all duration-200 cursor-pointer shadow-md rounded-r-lg"
    >
      {/* 病院名 + バッジ */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <h3 className="text-xl font-bold text-foreground">{hospital.name}</h3>
        {isFavorite && (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">⭐ かかりつけ</span>
        )}
        {hospital.schedules && hospital.schedules.length > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {open ? '営業中' : '営業時間外'}
          </span>
        )}
      </div>

      {/* 診療科（左）と電話番号（右） */}
      <div className="grid grid-cols-[1fr_auto] gap-4 items-start mb-2">
        <div className="flex flex-wrap gap-2">
          {hospital.category.map(cat => (
            <span
              key={cat}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                highlightCategories.includes(cat)
                  ? 'bg-primary text-white font-bold'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        <a
          href={`tel:${hospital.tel}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-base whitespace-nowrap bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-colors font-medium min-h-tap"
        >
          <span>📞</span>
          <span>{hospital.tel}</span>
        </a>
      </div>

      {/* 診療時間 */}
      {hospital.opening_hours && (
        <p className="text-base text-gray-700 mb-2">
          <span className="font-medium">診療時間</span> {hospital.opening_hours.replace(/\n/g, ' ')}
        </p>
      )}

      {/* 行き方ボタン */}
      {showRouteButton && hospital.latitude && hospital.longitude && (
        <Link
          href={`/route?to=${hospital.id}&name=${encodeURIComponent(hospital.name)}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 transition-colors font-medium text-sm min-h-tap shadow-sm mt-1"
        >
          🚌 行き方
        </Link>
      )}
    </div>
  );
});

export default HospitalListItem;
