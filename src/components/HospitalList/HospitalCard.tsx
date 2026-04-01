import type { Hospital } from '@/types/hospital';
import ScheduleTable from './ScheduleTable';

interface HospitalCardProps {
  hospital: Hospital;
  highlightCategories?: string[];
}

export default function HospitalCard({
  hospital,
  highlightCategories = []
}: HospitalCardProps) {
  return (
    <div className="border-l-4 border-primary bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* 左側: 病院名と基本情報 */}
        <div className="flex-1">
          {/* 病院名 */}
          <h3 className="text-xl font-bold mb-2 text-foreground">
            {hospital.name}
          </h3>

          {/* 診療科 */}
          <div className="mb-3">
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
          </div>

          {/* 基本情報 */}
          <div className="space-y-2 text-base">
            <p className="flex items-start">
              <span className="mr-2">📍</span>
              <span className="text-gray-700">{hospital.address}</span>
            </p>
          </div>
        </div>

        {/* 右側: アクションボタン */}
        <div className="grid grid-cols-3 md:flex md:flex-col gap-2 w-full md:w-auto">
          {/* 電話ボタン */}
          <a
            href={`tel:${hospital.tel}`}
            className="flex items-center justify-center gap-1 md:gap-2 bg-success text-white px-2 md:px-5 py-3 rounded-lg hover:bg-success/90 active:bg-success/80 transition-colors font-bold text-sm md:text-lg min-h-tap text-center shadow-md hover:shadow-lg"
          >
            <span className="text-base md:text-xl">📞</span>
            <span className="hidden md:inline">{hospital.tel}</span>
            <span className="md:hidden">電話</span>
          </a>
          {hospital.google_map_url ? (
            <a
              href={hospital.google_map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-orange text-white px-2 md:px-4 py-3 md:py-2 rounded-lg hover:bg-orange/90 transition-colors font-medium text-sm md:text-base min-h-tap text-center shadow-md"
            >
              🗺️ 地図
            </a>
          ) : (
            <div className="md:hidden" />
          )}
          {hospital.website ? (
            <a
              href={hospital.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-primary text-white px-2 md:px-4 py-3 md:py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm md:text-base min-h-tap text-center shadow-md"
            >
              🌐 Web
            </a>
          ) : (
            <div className="md:hidden" />
          )}
        </div>
      </div>

      {/* 診療時間 */}
      {hospital.schedules && hospital.schedules.length > 0 ? (
        <ScheduleTable schedules={hospital.schedules} />
      ) : hospital.opening_hours ? (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-base font-bold mb-2">🕒 診療時間</h4>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm whitespace-pre-line text-gray-700">
              {hospital.opening_hours}
            </p>
          </div>
        </div>
      ) : null}

      {/* 備考 */}
      {hospital.note && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="mr-1">ℹ️</span>
            {hospital.note}
          </p>
        </div>
      )}
    </div>
  );
}
