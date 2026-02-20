---
paths:
  - "src/lib/supabase*.ts"
  - "src/types/**/*.ts"
  - "src/app/api/**/*.ts"
  - "src/app/admin/actions.ts"
---

# データベース設計ルール（Supabase）

## Supabase プロジェクト

- **プロジェクトID**: `xsydqbczmzfufeywjfps`
- **リージョン**: 東京 (ap-northeast-1)
- **URL**: `https://xsydqbczmzfufeywjfps.supabase.co`

## テーブル構造

### hospitals

```sql
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT[] NOT NULL,       -- 複数診療科（配列）
  address TEXT NOT NULL,
  tel TEXT NOT NULL,
  city TEXT NOT NULL,
  opening_hours TEXT,
  google_map_url TEXT,
  website TEXT,                   -- 2025/11/18 追加
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_hospitals_category ON hospitals USING GIN(category);
```

### hospital_schedules

```sql
CREATE TABLE hospital_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  -- day_of_week: 0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土
  morning_start TIME,
  morning_end TIME,
  afternoon_start TIME,
  afternoon_end TIME,
  is_closed BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hospital_id, day_of_week)
);
```

## TypeScript 型定義 (`src/types/hospital.ts`)

```typescript
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
  schedules?: HospitalSchedule[];
}

export interface HospitalSchedule {
  id: string;
  hospital_id: string;
  day_of_week: number;
  morning_start: string | null;
  morning_end: string | null;
  afternoon_start: string | null;
  afternoon_end: string | null;
  is_closed: boolean;
  note: string | null;
}
```

## クエリパターン

```typescript
// スケジュールを含む病院データ取得
supabase.from('hospitals').select(`*, schedules:hospital_schedules(*)`)

// 診療科検索（配列の重なり）
.overlaps('category', ['内科', '外科'])

// 市町村検索（IN句）
.in('city', ['飯田市', '松川町'])
```

## 認証

- 認証方法: Cookie ベース（ADMIN_PASSWORD による簡易認証）
- 管理者数: 1名のみ
- 管理操作は `supabaseAdmin`（Service Role Key）を使用
