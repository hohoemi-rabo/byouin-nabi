/**
 * 診療時間の型定義
 * Supabase hospital_schedules テーブルに対応
 */
export interface HospitalSchedule {
  id: string;
  hospital_id: string;
  day_of_week: number; // 0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土
  morning_start: string | null;
  morning_end: string | null;
  afternoon_start: string | null;
  afternoon_end: string | null;
  is_closed: boolean;
  note: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * 病院情報の型定義
 * Supabase hospitals テーブルに対応
 */
export interface Hospital {
  id: string;
  name: string;
  category: string[];
  address: string;
  tel: string;
  city: string;
  opening_hours?: string | null;
  google_map_url?: string | null;
  website?: string | null;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
  schedules?: HospitalSchedule[]; // リレーション
}

/**
 * API レスポンス型
 */
export interface HospitalsResponse {
  hospitals: Hospital[];
}

export interface HospitalResponse {
  hospital: Hospital;
}

export interface ErrorResponse {
  error: string;
}
