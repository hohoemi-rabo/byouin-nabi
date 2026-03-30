/**
 * ユーザー関連の型定義（Phase 2）
 * Supabase profiles / favorite_facilities / search_history / visit_reminders / family_links テーブルに対応
 */

export type AgeGroup = 'under39' | '40to64' | '65to74' | 'over75';
export type MobilityAid = 'none' | 'cane' | 'wheelchair';
export type FontSize = 'medium' | 'large' | 'xlarge';
export type SearchType = 'symptom' | 'search' | 'outing' | 'route';
export type FamilyLinkStatus = 'pending' | 'active' | 'revoked';

export interface Profile {
  id: string;
  display_name: string;
  age_group: AgeGroup;
  area: string;
  has_car: boolean;
  mobility_aid: MobilityAid;
  font_size: FontSize;
  notify_reminder: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FavoriteFacility {
  id: string;
  user_id: string;
  hospital_id: string;
  sort_order: number;
  created_at?: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  search_type: SearchType;
  search_params: Record<string, unknown>;
  result_hospital_id?: string | null;
  created_at?: string;
}

export interface VisitReminder {
  id: string;
  user_id: string;
  hospital_id: string;
  next_visit_date: string; // DATE 型 → ISO文字列
  interval_days?: number | null;
  memo?: string | null;
  is_active: boolean;
  notified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FamilyLink {
  id: string;
  elder_user_id: string;
  family_user_id?: string | null;
  invite_code: string;
  status: FamilyLinkStatus;
  expires_at: string;
  created_at?: string;
}
