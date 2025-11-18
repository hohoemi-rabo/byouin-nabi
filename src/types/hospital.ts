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
  note?: string | null;
  created_at?: string;
  updated_at?: string;
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
