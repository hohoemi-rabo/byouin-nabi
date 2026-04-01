import type { HospitalSchedule } from '@/types/hospital';

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * 時刻文字列をフォーマット（HH:MM:SS → HH:MM）
 * 00:00:00の場合は空文字を返す
 */
const formatTime = (time: string | null): string => {
  if (!time) return '';
  // "09:00:00" → "09:00" に変換
  const formatted = time.substring(0, 5);
  // 00:00の場合は空文字を返す（未設定とみなす）
  if (formatted === '00:00') return '';
  return formatted;
};

/**
 * 診療時間テーブルコンポーネント
 */
export default function ScheduleTable({ schedules }: { schedules: HospitalSchedule[] }) {
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
