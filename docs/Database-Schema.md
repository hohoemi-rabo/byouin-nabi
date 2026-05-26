# 病院ナビ南信 — データベース設計書

**バージョン**: Phase 2 マイグレーション完了時点
**作成日**: 2026年5月26日
**対象**: PostgreSQL 17（Supabase 提供）

---

## 1. プロジェクト情報

| 項目 | 値 |
|------|-----|
| Supabase プロジェクト ID | `xsydqbczmzfufeywjfps` |
| プロジェクト名 | `byouin-nabi` |
| リージョン | 東京（`ap-northeast-1`） |
| プロジェクト URL | `https://xsydqbczmzfufeywjfps.supabase.co` |

> ⚠️ **重要安全警告**: `taihei-studio`（ID: `gzwugjcjobnsbuagjjyf`）は別サービス。絶対に操作禁止。

### 1.1 接続クライアント（src/lib/）

| ファイル | 用途 | 認証 |
|---------|------|------|
| `supabase.ts` | 公開クライアント（ブラウザ/サーバー共用） | Anon Key |
| `supabase-admin.ts` | 管理操作（RLS バイパス） | Service Role Key |
| `supabase-browser.ts` | ブラウザ用認証クライアント | Anon Key + Cookie（`@supabase/ssr`） |
| `supabase-server.ts` | サーバー用認証クライアント | Anon Key + Cookie（`@supabase/ssr`） |

---

## 2. ER 図（概要）

```
┌──────────────┐         ┌──────────────────────┐
│ auth.users   │◀────────│ profiles             │
│ (Supabase)   │ 1:1     │ (id PK = auth.uid)   │
└──────────────┘         └──────────┬───────────┘
                                    │ 1:N
                  ┌─────────────────┼────────────────┐
                  │                 │                │
                  ▼                 ▼                ▼
        ┌────────────────┐ ┌──────────────┐ ┌────────────────┐
        │ favorite_      │ │ search_      │ │ visit_         │
        │ facilities     │ │ history      │ │ reminders      │
        └──────┬─────────┘ └──────┬───────┘ └──────┬─────────┘
               │                  │                │
               │ N:1              │ N:1            │ N:1
               ▼                  ▼                ▼
        ┌─────────────────────────────────────────────────────┐
        │ hospitals                                           │
        │ ├─ 1:N → hospital_schedules（曜日別診療時間）       │
        │ ├─ N:1 ← favorite_facilities                        │
        │ ├─ N:1 ← search_history                             │
        │ └─ N:1 ← visit_reminders                            │
        └─────────────────────────────────────────────────────┘

        ┌────────────────┐
        │ profiles       │
        │  ├─ elder      │ 1:N ─┐
        │  └─ family     │ 1:N ─┴─▶ family_links（招待コード）
        └────────────────┘

        ┌────────────────────┐    ┌─────────────┐    ┌─────────────────┐
        │ transport_services │───▶│ bus_routes  │───▶│ bus_timetables  │
        │ (種別: bus/demand/  │ 1:N│             │ 1:N│                 │
        │  taxi/welfare/     │    └─────────────┘    └────────┬────────┘
        │  shuttle)          │                                │ N:1
        └────────────────────┘                       ┌────────▼────────┐
                                                     │ bus_stops       │
                                                     │ (lat/lng)       │
                                                     └─────────────────┘

        ┌────────────┐                    ┌──────────────┐
        │ facilities │（独立）            │ search_logs  │（匿名）
        └────────────┘                    └──────────────┘
```

---

## 3. テーブル一覧（13 テーブル）

| カテゴリ | テーブル | 用途 | Phase |
|---------|---------|------|-------|
| 病院 | `hospitals` | 病院マスタ | 1 + 2 拡張 |
| 病院 | `hospital_schedules` | 曜日別診療時間 | 1 |
| ユーザー | `profiles` | プロフィール（`auth.users` 連携） | 2 |
| ユーザー | `favorite_facilities` | かかりつけ医（最大 5 件） | 2 |
| ユーザー | `search_history` | 受診履歴 | 2 |
| ユーザー | `visit_reminders` | 受診リマインダー（未使用） | 2（023 未実装） |
| ユーザー | `family_links` | 家族見守り招待（未使用） | 2（023 未実装） |
| 交通 | `transport_services` | 交通サービスマスタ | 2 |
| 交通 | `bus_routes` | バス路線 | 2 |
| 交通 | `bus_stops` | バス停（lat/lng） | 2 |
| 交通 | `bus_timetables` | バス時刻表 | 2 |
| 施設 | `facilities` | お出かけ施設 | 2 |
| ログ | `search_logs` | 匿名検索ログ | 2 |

全テーブルで **RLS 有効**。

---

## 4. テーブル定義

### 4.1 `hospitals` — 病院マスタ

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `name` | text | NOT NULL | 病院名 |
| `category` | text[] | NOT NULL | 診療科（複数） |
| `address` | text | NOT NULL | 住所 |
| `tel` | text | NOT NULL | 電話番号 |
| `city` | text | NOT NULL | 市町村 |
| `opening_hours` | text | NULL | 営業時間（フリーテキスト） |
| `google_map_url` | text | NULL | Google Maps URL |
| `website` | text | NULL | 公式 Web サイト |
| `note` | text | NULL | 備考 |
| `latitude` | numeric | NULL | 緯度（Phase 2） |
| `longitude` | numeric | NULL | 経度（Phase 2） |
| `online_consultation` | boolean | default false | オンライン診療対応 |
| `online_consultation_url` | text | NULL | オンライン診療 URL |
| `parking` | boolean | default false | 駐車場 |
| `parking_capacity` | integer | NULL | 駐車台数 |
| `barrier_free` | boolean | default false | バリアフリー |
| `emergency_available` | boolean | default false | 救急対応 |
| `shuttle_bus` | boolean | default false | 送迎バス |
| `shuttle_bus_info` | text | NULL | 送迎バス情報 |
| `created_at` | timestamptz | default `now()` | |
| `updated_at` | timestamptz | default `now()` | |

**インデックス**:
- `hospitals_pkey` (PK)
- `idx_hospitals_city` btree(city)
- `idx_hospitals_category` **GIN**(category) — 配列の重なり検索（`overlaps`）

### 4.2 `hospital_schedules` — 曜日別診療時間

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `hospital_id` | uuid | NOT NULL, FK → `hospitals(id)` ON DELETE CASCADE | |
| `day_of_week` | integer | NOT NULL, CHECK `0..6` | 0=日, 1=月, ..., 6=土 |
| `morning_start` | time | NULL | 午前開始 |
| `morning_end` | time | NULL | 午前終了 |
| `afternoon_start` | time | NULL | 午後開始 |
| `afternoon_end` | time | NULL | 午後終了 |
| `is_closed` | boolean | default false | 休診日フラグ |
| `note` | text | NULL | 備考（第 3 土曜休診など） |
| `created_at` | timestamptz | default `now()` | |
| `updated_at` | timestamptz | default `now()` | |

**制約**:
- UNIQUE (`hospital_id`, `day_of_week`) — 1 病院 1 曜日 1 行

**インデックス**:
- `hospital_schedules_pkey` (PK)
- `hospital_schedules_hospital_id_day_of_week_key` (UNIQUE)
- `idx_hospital_schedules_hospital_id` btree(hospital_id)

### 4.3 `profiles` — ユーザープロフィール

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, FK → `auth.users(id)` ON DELETE CASCADE | Supabase Auth と 1:1 |
| `display_name` | text | NOT NULL | 表示名 |
| `age_group` | text | NOT NULL, CHECK | `under39` / `40to64` / `65to74` / `over75` |
| `area` | text | NOT NULL | 居住エリア（自治体名等） |
| `has_car` | boolean | default false | 自家用車保有 |
| `mobility_aid` | text | default `'none'`, CHECK | `none` / `cane` / `wheelchair` |
| `font_size` | text | default `'medium'`, CHECK | `medium` / `large` / `xlarge` |
| `notify_reminder` | boolean | default true | リマインダー通知（未使用） |
| `created_at` | timestamptz | default `now()` | |
| `updated_at` | timestamptz | default `now()` | |

**インデックス**:
- `profiles_pkey` (PK)

### 4.4 `favorite_facilities` — かかりつけ医

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `user_id` | uuid | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | |
| `hospital_id` | uuid | NOT NULL, FK → `hospitals(id)` ON DELETE CASCADE | |
| `sort_order` | integer | default 0 | 表示順 |
| `created_at` | timestamptz | default `now()` | |

**制約**:
- UNIQUE (`user_id`, `hospital_id`) — 重複登録防止
- **アプリ側制約**: 1 ユーザー最大 5 件（`/api/user/favorites` で `MAX_FAVORITES=5`）

**インデックス**:
- `favorite_facilities_pkey` (PK)
- `favorite_facilities_user_id_hospital_id_key` (UNIQUE)
- `idx_favorite_facilities_hospital_id` btree(hospital_id) — FK 性能対策

### 4.5 `search_history` — 受診履歴

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `user_id` | uuid | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | |
| `search_type` | text | NOT NULL, CHECK | `symptom` / `search` / `outing` / `route` |
| `search_params` | jsonb | NOT NULL | 検索条件 |
| `result_hospital_id` | uuid | NULL, FK → `hospitals(id)` ON DELETE SET NULL | |
| `created_at` | timestamptz | default `now()` | |

**インデックス**:
- `search_history_pkey` (PK)
- `idx_search_history_user_created` btree(user_id, created_at DESC) — マイページの履歴取得用
- `idx_search_history_result_hospital_id` btree(result_hospital_id)

### 4.6 `visit_reminders` — 受診リマインダー（未実装）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `user_id` | uuid | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | |
| `hospital_id` | uuid | NOT NULL, FK → `hospitals(id)` ON DELETE CASCADE | |
| `next_visit_date` | date | NOT NULL | 次回受診日 |
| `interval_days` | integer | NULL | 周期（日） |
| `memo` | text | NULL | |
| `is_active` | boolean | default true | |
| `notified_at` | timestamptz | NULL | 最終通知日時 |
| `created_at` | timestamptz | default `now()` | |
| `updated_at` | timestamptz | default `now()` | |

**インデックス**:
- `visit_reminders_pkey` (PK)
- `idx_visit_reminders_user_id` btree(user_id)
- `idx_visit_reminders_hospital_id` btree(hospital_id)

> Phase 2 チケット 022 として未実装。テーブルとインデックスのみ存在。

### 4.7 `family_links` — 家族見守り招待（未実装）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `elder_user_id` | uuid | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | 高齢者本人 |
| `family_user_id` | uuid | NULL, FK → `profiles(id)` ON DELETE CASCADE | 招待を受けた家族 |
| `invite_code` | text | NOT NULL, UNIQUE | 招待コード |
| `status` | text | default `'pending'`, CHECK | `pending` / `active` / `revoked` |
| `expires_at` | timestamptz | NOT NULL | 招待コード有効期限 |
| `created_at` | timestamptz | default `now()` | |

**インデックス**:
- `family_links_pkey` (PK)
- `family_links_invite_code_key` (UNIQUE)
- `idx_family_links_elder_user_id` btree(elder_user_id)
- `idx_family_links_family_user_id` btree(family_user_id)

> Phase 2 チケット 023 として未実装。テーブル・RLS のみ存在。

### 4.8 `transport_services` — 交通サービスマスタ

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `name` | text | NOT NULL | サービス名 |
| `operator` | text | NOT NULL | 運営者 |
| `service_type` | text | NOT NULL, CHECK | `route_bus` / `demand` / `taxi` / `welfare_taxi` / `shuttle` |
| `service_area` | text[] | NOT NULL | 対応エリア（自治体名の配列） |
| `phone` | text | NULL | |
| `website_url` | text | NULL | |
| `booking_url` | text | NULL | |
| `booking_method` | text | NULL, CHECK | `phone` / `web` / `app` / `none` |
| `advance_booking_required` | boolean | default false | |
| `booking_deadline_hours` | integer | NULL | 何時間前まで予約可 |
| `eligibility` | text | NULL | 利用資格 |
| `fare_info` | text | NULL | 料金情報 |
| `wheelchair_accessible` | boolean | default false | |
| `notes` | text | NULL | |
| `is_active` | boolean | default true | |
| `created_at` | timestamptz | default `now()` | |
| `updated_at` | timestamptz | default `now()` | |

**インデックス**:
- `transport_services_pkey` (PK)
- `idx_transport_services_type` btree(service_type)
- `idx_transport_services_area` **GIN**(service_area)

### 4.9 `bus_routes` — バス路線

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `transport_service_id` | uuid | NOT NULL, FK → `transport_services(id)` ON DELETE CASCADE | |
| `route_name` | text | NOT NULL | |
| `route_number` | text | NULL | |
| `created_at` | timestamptz | default `now()` | |

**インデックス**:
- `bus_routes_pkey` (PK)
- `idx_bus_routes_transport_service_id` btree(transport_service_id)

### 4.10 `bus_stops` — バス停

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `name` | text | NOT NULL | バス停名 |
| `latitude` | numeric | NOT NULL | 緯度 |
| `longitude` | numeric | NOT NULL | 経度 |
| `created_at` | timestamptz | default `now()` | |

**インデックス**:
- `bus_stops_pkey` (PK)
- `idx_bus_stops_location` btree(latitude, longitude)

### 4.11 `bus_timetables` — バス時刻表

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `bus_route_id` | uuid | NOT NULL, FK → `bus_routes(id)` ON DELETE CASCADE | |
| `bus_stop_id` | uuid | NOT NULL, FK → `bus_stops(id)` ON DELETE CASCADE | |
| `departure_time` | time | NOT NULL | 発車時刻 |
| `direction` | text | NOT NULL, CHECK | `outbound` / `inbound` |
| `day_type` | text | NOT NULL, CHECK | `weekday` / `saturday` / `holiday` |
| `stop_order` | integer | NOT NULL | 停車順 |
| `created_at` | timestamptz | default `now()` | |

**インデックス**:
- `bus_timetables_pkey` (PK)
- `idx_bus_timetables_route` btree(bus_route_id, direction, day_type, stop_order) — 複合
- `idx_bus_timetables_bus_stop_id` btree(bus_stop_id)

### 4.12 `facilities` — お出かけナビ施設

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `name` | text | NOT NULL | 施設名 |
| `category` | text | NOT NULL, CHECK | `shopping` / `government` / `banking` / `welfare` / `leisure` |
| `address` | text | NOT NULL | 住所 |
| `city` | text | NOT NULL | 市町村 |
| `phone` | text | NULL | |
| `latitude` | numeric | NULL | |
| `longitude` | numeric | NULL | |
| `website_url` | text | NULL | |
| `opening_hours` | text | NULL | |
| `notes` | text | NULL | |
| `is_active` | boolean | default true | |
| `created_at` | timestamptz | default `now()` | |
| `updated_at` | timestamptz | default `now()` | |

**インデックス**:
- `facilities_pkey` (PK)
- `idx_facilities_category` btree(category)
- `idx_facilities_city` btree(city)

### 4.13 `search_logs` — 匿名検索ログ

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `log_type` | text | NOT NULL, CHECK | `symptom` / `search` / `outing` / `route` |
| `search_data` | jsonb | NOT NULL | 検索パラメータ |
| `area` | text | NULL | エリア |
| `created_at` | timestamptz | default `now()` | |

**インデックス**:
- `search_logs_pkey` (PK)
- `idx_search_logs_type` btree(log_type)
- `idx_search_logs_created` btree(created_at)

> ユーザーを紐づけない（個人情報含まない）。`anon`/`authenticated` が INSERT 可、`service_role` のみが SELECT 可。

---

## 5. RLS（Row Level Security）ポリシー

全テーブルで RLS 有効。`auth.role()` / `auth.uid()` は `(SELECT ...)` でラップし、行ごとの再実行を回避。

### 5.1 公開読込テーブル

| テーブル | SELECT | INSERT / UPDATE / DELETE |
|---------|--------|--------------------------|
| `hospitals` | `true`（全員） | `(select auth.role()) = 'authenticated'`（※historical、現状は Server Actions 経由なので実質 service_role） |
| `hospital_schedules` | `true`（全員） | （ポリシー無し → service_role 経由のみ書込可） |
| `transport_services` | `true` | `service_role` のみ |
| `bus_routes` | `true` | `service_role` のみ |
| `bus_stops` | `true` | `service_role` のみ |
| `bus_timetables` | `true` | `service_role` のみ |
| `facilities` | `true` | `service_role` のみ |

### 5.2 ユーザー所有テーブル

| テーブル | ポリシー |
|---------|---------|
| `profiles` | SELECT/INSERT/UPDATE: `auth.uid() = id`（本人のみ） |
| `favorite_facilities` | ALL: `auth.uid() = user_id`（本人のみ） |
| `search_history` | ALL: `auth.uid() = user_id`（本人のみ） |
| `visit_reminders` | ALL: `auth.uid() = user_id`（本人のみ） |

### 5.3 `family_links`

| ポリシー | 操作 | 条件 |
|---------|------|------|
| Elders can create links | INSERT | `auth.uid() = elder_user_id` |
| Elders can delete links | DELETE | `auth.uid() = elder_user_id` |
| Users can update links | UPDATE | `auth.uid() = elder_user_id` OR `status = 'pending'` （USING）/ `auth.uid() = elder_user_id` OR `status = 'active'`（WITH CHECK） |
| Users can view related links | SELECT | `auth.uid() = elder_user_id` OR (`auth.uid() = family_user_id` AND `status = 'active'`) |

### 5.4 `search_logs`

| ポリシー | ロール | 操作 | 条件 |
|---------|--------|------|------|
| Admin read search_logs | public | SELECT | `service_role` のみ |
| Anon and authenticated can insert search_logs | anon, authenticated | INSERT | `true`（誰でも記録可） |

> Supabase Advisor で **セキュリティ WARN** が出るが、匿名ログ収集のため意図的設計。

---

## 6. RPC（PL/pgSQL）関数

### 6.1 `update_favorite_order(p_user_id uuid, p_ordered_ids uuid[]) RETURNS void`

```sql
CREATE OR REPLACE FUNCTION public.update_favorite_order(
  p_user_id uuid,
  p_ordered_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  FOR i IN 1..array_length(p_ordered_ids, 1) LOOP
    UPDATE favorite_facilities
    SET sort_order = i - 1
    WHERE user_id = p_user_id
      AND hospital_id = p_ordered_ids[i];
  END LOOP;
END;
$$;
```

- **目的**: かかりつけ医の並び順をバッチ更新（N+1 解消）
- **呼出元**: `/api/user/favorites` PUT
- **SECURITY DEFINER**: 関数定義者の権限で実行（RLS 影響なし）
- **`search_path` 固定**: スキーマインジェクション対策

### 6.2 `get_unique_history(p_user_id uuid, p_limit integer DEFAULT 10) RETURNS TABLE(...)`

```sql
CREATE OR REPLACE FUNCTION public.get_unique_history(
  p_user_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  search_type text,
  search_params jsonb,
  result_hospital_id uuid,
  created_at timestamptz,
  hospital jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT ON (sh.result_hospital_id)
    sh.id,
    sh.user_id,
    sh.search_type,
    sh.search_params,
    sh.result_hospital_id,
    sh.created_at,
    CASE
      WHEN h.id IS NOT NULL THEN
        jsonb_build_object(
          'id', h.id,
          'name', h.name,
          'category', h.category,
          'address', h.address,
          'tel', h.tel,
          'city', h.city
        )
      ELSE NULL
    END AS hospital
  FROM search_history sh
  LEFT JOIN hospitals h ON h.id = sh.result_hospital_id
  WHERE sh.user_id = p_user_id
    AND sh.result_hospital_id IS NOT NULL
  ORDER BY sh.result_hospital_id, sh.created_at DESC
  LIMIT p_limit;
$$;
```

- **目的**: 受診履歴を病院 ID で重複除去し、最新を取得
- **`DISTINCT ON`** で DB 側重複除去（アプリ側でやらない）
- **呼出元**: `/api/user/history` GET
- **`STABLE`**: 同一トランザクション内で同じ結果（最適化ヒント）

---

## 7. インデックス一覧（実用観点）

| 種別 | 用途 | テーブル | カラム |
|------|------|---------|--------|
| GIN | 配列の重なり検索 | `hospitals` | `category` |
| GIN | 配列の重なり検索 | `transport_services` | `service_area` |
| 複合 | マイページ履歴取得 | `search_history` | `(user_id, created_at DESC)` |
| 複合 | バス時刻表絞込 | `bus_timetables` | `(bus_route_id, direction, day_type, stop_order)` |
| 複合 | バス停の地理検索 | `bus_stops` | `(latitude, longitude)` |
| FK | カスケード/JOIN 性能 | 全 FK | 各 FK 列に作成済み |

---

## 8. マイグレーション履歴

| バージョン | 名前 | 説明 |
|-----------|------|------|
| 20251118074021 | create_hospitals_table | 初期病院テーブル |
| 20251122045557 | create_hospital_schedules_table | 診療時間テーブル |
| 20260220160220 | enable_rls_hospital_schedules | RLS 有効化 |
| 20260220160231 | restrict_anon_permissions | `anon` 権限を SELECT のみに |
| 20260220160242 | optimize_rls_policies | `auth.role()` → `(select auth.role())` |
| 20260220160252 | timestamp_to_timestamptz | `timestamp` → `timestamptz` 移行 |
| 20260330084834 | extend_hospitals_table | Phase 2 拡張カラム（lat/lng/parking 等） |
| 20260330084852 | create_user_tables | profiles/favorites/history/reminders/family_links |
| 20260330084915 | create_transport_tables | 交通系 4 テーブル |
| 20260330084926 | create_facilities_table | お出かけ施設 |
| 20260330084932 | create_search_logs_table | 匿名ログ |
| 20260330085343 | add_missing_fk_indexes | 不足 FK インデックス追加 |
| 20260330085400 | fix_family_links_policies | family_links RLS 修正 |
| 20260401115836 | postgres_best_practices_fixes | `search_logs` RLS ロール限定 + RPC 追加 + 複合インデックス |

---

## 9. インストール済み拡張機能

| 拡張 | バージョン | 用途 |
|------|-----------|------|
| `plpgsql` | 1.0 | PL/pgSQL（標準） |
| `uuid-ossp` | 1.1 | UUID 生成 |
| `pgcrypto` | 1.3 | `gen_random_uuid()` |
| `pg_stat_statements` | 1.11 | クエリ統計 |
| `pg_graphql` | 1.5.11 | GraphQL（Supabase 標準） |
| `supabase_vault` | 0.3.1 | シークレット管理 |

> 上記以外の拡張（PostGIS 等）は利用可能だが未インストール。

---

## 10. クエリパターン（実装側）

### 10.1 病院検索（公開 API）

```typescript
// /api/search — フィルター付き検索
supabase
  .from('hospitals')
  .select(`
    id, name, category, address, tel, city,
    opening_hours, google_map_url, website, note,
    latitude, longitude,
    parking, barrier_free, emergency_available,
    schedules:hospital_schedules(*)
  `)
  .overlaps('category', categories)   // GIN インデックス利用
  .in('city', cities)
  .ilike('name', `%${keyword}%`)
  .eq('barrier_free', true)
  .order('name');
```

### 10.2 ユーザー RPC

```typescript
// かかりつけ医の並び順をバッチ更新
supabase.rpc('update_favorite_order', {
  p_user_id: user.id,
  p_ordered_ids: ['uuid1', 'uuid2', 'uuid3'],
});

// 受診履歴の重複除去取得
supabase.rpc('get_unique_history', {
  p_user_id: user.id,
  p_limit: 10,
});
```

### 10.3 管理 Server Action（RLS バイパス）

```typescript
// 病院インポート：全削除 → バリデーション → バッチ INSERT
await supabaseAdmin
  .from('hospitals')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000');

await supabaseAdmin.from('hospitals').insert(validDataArray);
```

---

## 11. 設計上の注意事項

### 11.1 命名規約

- テーブル名・カラム名: **snake_case**（小文字）
- 主キー: `id` (uuid)
- 外部キー: `<table>_id`（例: `hospital_id`）
- インデックス: `idx_<table>_<columns>`

### 11.2 型選択

- **時刻**: 必ず `timestamptz`（タイムゾーン対応）。`timestamp` は禁止
- **文字列**: 必ず `text`。`varchar(N)` は使わない
- **時刻のみ**: `time without time zone`（曜日別診療時間）
- **配列**: GIN インデックスで検索可能（`category text[]`, `service_area text[]`）
- **JSON**: 構造化データは `jsonb`（`search_params`, `search_data`）

### 11.3 削除動作

| FK | ON DELETE |
|----|-----------|
| `profiles.id` → `auth.users(id)` | CASCADE（アカウント削除でプロフィール削除） |
| `*.user_id` → `profiles(id)` | CASCADE |
| `hospital_schedules.hospital_id` → `hospitals(id)` | CASCADE |
| `favorite_facilities.hospital_id` → `hospitals(id)` | CASCADE |
| `visit_reminders.hospital_id` → `hospitals(id)` | CASCADE |
| `search_history.result_hospital_id` → `hospitals(id)` | **SET NULL**（履歴を残す） |
| `bus_*.transport_service_id` → `transport_services(id)` | CASCADE |

### 11.4 認証連携

- `profiles.id` は `auth.users.id` と同一値（1:1）
- 新規サインアップ時はアプリ側で `profiles` レコードを作成（upsert by id）
- RLS は全て `auth.uid() = user_id` / `id` パターン

### 11.5 RLS パフォーマンス

- ❌ `auth.uid() = user_id` — 行ごとに再実行
- ✅ `(SELECT auth.uid()) = user_id` — クエリ計画でキャッシュ

### 11.6 N+1 解消

- ループ内 UPDATE → RPC 関数でバッチ化（`update_favorite_order`）
- JS 側重複除去 → DB 側 `DISTINCT ON`（`get_unique_history`）
- ループ内 INSERT → バッチ INSERT（`importHospitals`）

### 11.7 `select('*')` 回避

- API ルートでは必要カラムのみ指定（ネットワーク転送量削減）
- 例: `/api/hospitals` は 14 カラム + `schedules` を明示

---

## 12. Supabase Advisor 警告（既知）

### 12.1 セキュリティ WARN

| 警告 | 対応 |
|------|------|
| `search_logs` の anon INSERT 許可 | 意図的（匿名ログ収集のため） |
| 漏洩パスワード保護未有効 | Supabase ダッシュボード設定で対応（コード変更不要） |

### 12.2 パフォーマンス INFO

- **未使用インデックス**: Phase 2 のデータ蓄積で解消見込み
- 観測時期と将来トラフィックを考慮し、現状は維持

---

## 13. 関連ドキュメント

- **`docs/Implementation-Spec.md`** — 機能仕様
- **`.claude/rules/database.md`** — データベース開発ルール
- **`CLAUDE.md`** — プロジェクト全体ガイド
- **`src/types/`** — TypeScript 型定義（テーブルと 1:1 対応）
