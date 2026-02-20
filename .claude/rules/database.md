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
  website TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, day_of_week)
);
```

## RLS（Row Level Security）

### hospitals テーブル（RLS 有効）

| ポリシー名 | 操作 | 条件 |
|-----------|------|------|
| Public hospitals are viewable by everyone | SELECT | `true`（公開読み取り） |
| Authenticated users can insert hospitals | INSERT | `(select auth.role()) = 'authenticated'` |
| Authenticated users can update hospitals | UPDATE | `(select auth.role()) = 'authenticated'` |
| Authenticated users can delete hospitals | DELETE | `(select auth.role()) = 'authenticated'` |

### hospital_schedules テーブル（RLS 有効）

| ポリシー名 | 操作 | 条件 |
|-----------|------|------|
| Public schedules are viewable by everyone | SELECT | `true`（公開読み取り） |

### 権限設計

- **`anon` ロール**: SELECT のみ（読み取り専用）
- **`service_role`**: 全権限（RLS バイパス）
- 管理操作は全て `supabaseAdmin`（Service Role Key）経由
- RLSポリシーの `auth.role()` は `(select auth.role())` でラップ済み（パフォーマンス最適化）

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

// バルクインポート（バッチINSERT）
supabaseAdmin.from('hospitals').insert(validDataArray)
```

## 認証

- 認証方法: Cookie ベース（ADMIN_PASSWORD による簡易認証）
- 管理者数: 1名のみ
- 管理操作は `supabaseAdmin`（Service Role Key）を使用

## DB設計の注意事項

- `timestamp` ではなく `timestamptz` を使用（タイムゾーン対応）
- テーブル名・カラム名は全て snake_case（小文字）
- FK列には必ずインデックスを作成（`hospital_id` にインデックス済み）
- バルクINSERTはバッチ方式（ループ内個別INSERTを避ける）
- `text` 型を使用（`varchar(255)` ではなく）
