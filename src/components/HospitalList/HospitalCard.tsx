import type { Hospital } from '@/types/hospital';

interface HospitalCardProps {
  hospital: Hospital;
  highlightCategories?: string[];
}

export default function HospitalCard({
  hospital,
  highlightCategories = []
}: HospitalCardProps) {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
      {/* 病院名 */}
      <h3 className="text-2xl font-bold mb-4 text-foreground">
        {hospital.name}
      </h3>

      {/* 診療科 */}
      <div className="mb-4">
        <span className="text-base text-gray-600 font-medium">診療科：</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {hospital.category.map(cat => (
            <span
              key={cat}
              className={`px-4 py-2 rounded-full text-base font-medium ${
                highlightCategories.includes(cat)
                  ? 'bg-primary text-white font-bold'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* 基本情報 */}
      <div className="space-y-3 text-lg mb-4">
        <p className="flex items-start">
          <span className="mr-2">📍</span>
          <span>{hospital.address}</span>
        </p>
        <p className="flex items-center">
          <span className="mr-2">📞</span>
          <a
            href={`tel:${hospital.tel}`}
            className="text-primary underline font-medium hover:text-primary/80 min-h-tap flex items-center"
          >
            {hospital.tel}
          </a>
        </p>
        {hospital.opening_hours && (
          <p className="flex items-start">
            <span className="mr-2">🕐</span>
            <span className="whitespace-pre-line">{hospital.opening_hours}</span>
          </p>
        )}
      </div>

      {/* アクションボタン */}
      {hospital.google_map_url && (
        <div className="mt-4">
          <a
            href={hospital.google_map_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-success text-white px-6 py-3 rounded-lg hover:bg-success/90 transition-colors font-medium text-lg min-h-tap min-w-tap text-center"
          >
            🗺️ 地図で見る
          </a>
        </div>
      )}

      {/* 備考 */}
      {hospital.note && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-base text-gray-600">
            <span className="mr-1">ℹ️</span>
            {hospital.note}
          </p>
        </div>
      )}
    </div>
  );
}
