/**
 * 施設・検索ログ関連の型定義（Phase 2）
 * Supabase facilities / search_logs テーブルに対応
 */

export type FacilityCategory = 'shopping' | 'government' | 'banking' | 'welfare' | 'leisure';
export type SearchLogType = 'symptom' | 'search' | 'outing' | 'route';

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  address: string;
  city: string;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  website_url?: string | null;
  opening_hours?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SearchLog {
  id: string;
  log_type: SearchLogType;
  search_data: Record<string, unknown>;
  area?: string | null;
  created_at?: string;
}
