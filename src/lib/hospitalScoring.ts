import type { Hospital } from '@/types/hospital';
import type { UrgencyLevel } from '@/types/ai';

interface ScoringOptions {
  recommendedDepartments: string[];
  favoriteHospitalIds?: string[];
  urgency?: UrgencyLevel;
}

/**
 * 病院のスコアを計算し、優先順位を決定する
 */
export function scoreHospital(hospital: Hospital, options: ScoringOptions): number {
  let score = 0;

  // 推奨診療科の一致: +100
  const hasMatch = hospital.category.some(cat =>
    options.recommendedDepartments.includes(cat)
  );
  if (hasMatch) score += 100;

  // かかりつけ医登録: +50
  if (options.favoriteHospitalIds?.includes(hospital.id)) {
    score += 50;
  }

  // 救急対応: +40（緊急度が emergency の場合のみ）
  if (options.urgency === 'emergency' && hospital.emergency_available) {
    score += 40;
  }

  // 営業中判定: +30
  if (isCurrentlyOpen(hospital)) {
    score += 30;
  }

  return score;
}

/**
 * 病院リストをスコア順にソートして返す
 */
export function sortByScore(hospitals: Hospital[], options: ScoringOptions): Hospital[] {
  return [...hospitals]
    .map(h => ({ hospital: h, score: scoreHospital(h, options) }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.hospital);
}

/**
 * 現在の曜日・時刻で営業中かどうかを判定
 */
export function isCurrentlyOpen(hospital: Hospital): boolean {
  if (!hospital.schedules || hospital.schedules.length === 0) return false;

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=日, 6=土
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todaySchedule = hospital.schedules.find(s => s.day_of_week === dayOfWeek);
  if (!todaySchedule || todaySchedule.is_closed) return false;

  const inMorning = isInTimeRange(
    currentMinutes,
    todaySchedule.morning_start,
    todaySchedule.morning_end
  );
  const inAfternoon = isInTimeRange(
    currentMinutes,
    todaySchedule.afternoon_start,
    todaySchedule.afternoon_end
  );

  return inMorning || inAfternoon;
}

function isInTimeRange(currentMinutes: number, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const startMin = parseTimeToMinutes(start);
  const endMin = parseTimeToMinutes(end);
  if (startMin === null || endMin === null) return false;
  return currentMinutes >= startMin && currentMinutes <= endMin;
}

function parseTimeToMinutes(time: string): number | null {
  const parts = time.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}
