import type { Hospital, HospitalSchedule } from '@/types/hospital';

interface HospitalCardProps {
  hospital: Hospital;
  highlightCategories?: string[];
}

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * 時刻文字列をフォーマット（HH:MM → HH:MM）
 */
const formatTime = (time: string | null): string => {
  if (!time) return '';
  // "09:00:00" → "09:00" に変換
  return time.substring(0, 5);
};

/**
 * 診療時間テーブルコンポーネント
 */
function ScheduleTable({ schedules }: { schedules: HospitalSchedule[] }) {
  if (!schedules || schedules.length === 0) {
    return null;
  }

  // 曜日順にソート
  const sortedSchedules = [...schedules].sort((a, b) => a.day_of_week - b.day_of_week);

  return (
    <div className="mt-4">
      <h4 className="text-lg font-bold mb-3">🕒 診療時間</h4>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-gray-300 text-base">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-center font-bold">曜日</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-bold">午前</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-bold">午後</th>
            </tr>
          </thead>
          <tbody>
            {sortedSchedules.map((schedule) => {
              const morningTime = schedule.morning_start && schedule.morning_end
                ? `${formatTime(schedule.morning_start)} - ${formatTime(schedule.morning_end)}`
                : '-';

              const afternoonTime = schedule.afternoon_start && schedule.afternoon_end
                ? `${formatTime(schedule.afternoon_start)} - ${formatTime(schedule.afternoon_end)}`
                : '-';

              return (
                <tr key={schedule.day_of_week} className={schedule.is_closed ? 'bg-gray-50' : ''}>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {DAYS[schedule.day_of_week]}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {schedule.is_closed ? (
                      <span className="text-gray-400">休診</span>
                    ) : (
                      morningTime
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {schedule.is_closed ? (
                      <span className="text-gray-400">休診</span>
                    ) : (
                      afternoonTime
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* 備考があるスケジュールを表示 */}
      {sortedSchedules.some(s => s.note) && (
        <div className="mt-2 text-sm text-gray-600">
          {sortedSchedules
            .filter(s => s.note)
            .map((s, idx) => (
              <p key={idx}>
                ※ {DAYS[s.day_of_week]}: {s.note}
              </p>
            ))}
        </div>
      )}
    </div>
  );
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
      </div>

      {/* 診療時間 */}
      {hospital.schedules && hospital.schedules.length > 0 ? (
        <ScheduleTable schedules={hospital.schedules} />
      ) : hospital.opening_hours ? (
        <div className="mt-4">
          <h4 className="text-lg font-bold mb-2">🕒 診療時間</h4>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-base whitespace-pre-line text-gray-700">
              {hospital.opening_hours}
            </p>
          </div>
        </div>
      ) : null}

      {/* アクションボタン */}
      <div className="mt-4 flex flex-wrap gap-3">
        {hospital.google_map_url && (
          <a
            href={hospital.google_map_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-success text-white px-6 py-3 rounded-lg hover:bg-success/90 transition-colors font-medium text-lg min-h-tap min-w-tap text-center"
          >
            🗺️ 地図で見る
          </a>
        )}
        {hospital.website && (
          <a
            href={hospital.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg min-h-tap min-w-tap text-center"
          >
            🌐 Webサイト
          </a>
        )}
      </div>

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
