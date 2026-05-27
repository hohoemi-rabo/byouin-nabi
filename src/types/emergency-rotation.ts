/**
 * 救急ローテーションの型定義
 * Supabase emergency_rotations テーブルに対応
 */

export type RotationType =
  | 'night_emergency'  // 夜間急患診療所（365日固定）
  | 'duty_doctor'      // 休日当番医
  | 'duty_dentist'     // 休日当番歯科
  | 'duty_pharmacy';   // 休日当番薬局

export interface EmergencyRotation {
  id: string;
  duty_date: string;        // 'YYYY-MM-DD'
  rotation_type: RotationType;
  area: string;
  department: string | null;
  hospital_id: string | null;
  facility_name: string;
  phone: string;
  start_time: string;       // 'HH:MM:SS'
  end_time: string;         // 'HH:MM:SS'
  note: string | null;
  source_month: string;     // 'YYYY-MM'
  created_at?: string;
  updated_at?: string;
}

export type EmergencyRotationFormData = Omit<
  EmergencyRotation,
  'id' | 'created_at' | 'updated_at'
>;

export interface NightFacilityInfo {
  area: string;
  facilityName: string;
  phone: string;
  dayStart: string;    // '09:00'
  dayEnd: string;      // '12:30'
  nightStart: string;  // '19:00'
  nightEnd: string;    // '22:00'
  note?: string;
}

export const ROTATION_TYPE_LABELS: Record<RotationType, string> = {
  night_emergency: '夜間急患診療所',
  duty_doctor: '休日当番医',
  duty_dentist: '休日当番歯科',
  duty_pharmacy: '休日当番薬局',
};

export const ROTATION_TYPE_OPTIONS: { value: RotationType; label: string }[] = [
  { value: 'duty_doctor', label: '休日当番医' },
  { value: 'duty_dentist', label: '休日当番歯科' },
  { value: 'duty_pharmacy', label: '休日当番薬局' },
  { value: 'night_emergency', label: '夜間急患診療所' },
];

/**
 * 診療科のオプション（協議会の予定表に登場する科のみ）
 */
export const ROTATION_DEPARTMENT_OPTIONS = [
  '内科',
  '小児科',
  '外科',
  '産婦人科',
  '歯科',
] as const;

export interface ImportRotationResult {
  success: number;
  errors: Array<{ row: number; message: string }>;
}
