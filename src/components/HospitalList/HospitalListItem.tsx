'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import type { Hospital } from '@/types/hospital';

interface HospitalListItemProps {
  hospital: Hospital;
  highlightCategories?: string[];
  detailUrl?: string; // カスタムURLを指定可能
}

/**
 * シンプルな病院リスト項目コンポーネント
 * クリックで詳細ページに遷移
 * memo化により不要な再レンダリングを防止
 */
const HospitalListItem = memo(function HospitalListItem({
  hospital,
  highlightCategories = [],
  detailUrl
}: HospitalListItemProps) {
  const router = useRouter();

  const handleClick = () => {
    const url = detailUrl || `/hospital/${hospital.id}?from=results`;
    router.push(url);
  };

  return (
    <div
      onClick={handleClick}
      className="border-l-4 border-primary bg-white p-4 hover:bg-blue-50 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 active:bg-blue-100 active:scale-100 transition-all duration-200 cursor-pointer shadow-md rounded-r-lg"
    >
      {/* 病院名 */}
      <h3 className="text-xl font-bold mb-3 text-foreground">
        {hospital.name}
      </h3>

      {/* 診療科（左）と電話番号（右）をGrid配置 */}
      <div className="grid grid-cols-[1fr_auto] gap-4 items-start mb-2">
        {/* 診療科 */}
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

        {/* 電話番号（クリック可能・右端固定） */}
        <a
          href={`tel:${hospital.tel}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-base whitespace-nowrap bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-colors font-medium min-h-tap"
        >
          <span>📞</span>
          <span>{hospital.tel}</span>
        </a>
      </div>

      {/* 診療時間を横並び */}
      {hospital.opening_hours && (
        <p className="text-base text-gray-700">
          <span className="font-medium">診療時間</span> {hospital.opening_hours.replace(/\n/g, ' ')}
        </p>
      )}
    </div>
  );
});

export default HospitalListItem;
