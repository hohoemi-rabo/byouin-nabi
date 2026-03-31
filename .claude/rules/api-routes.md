---
paths:
  - "src/app/api/**/*.ts"
  - "src/app/admin/actions.ts"
  - "src/lib/supabase*.ts"
---

# API ルート & Server Actions ルール

## エンドポイント一覧

### パブリック API（認証不要）

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/symptoms/generate` | テンプレートベース症状説明文生成 |
| POST | `/api/symptoms/ai-recommend` | Gemini AI 緊急度判定・受診レコメンド（Phase 2） |
| GET | `/api/hospitals` | 全病院リスト取得（schedulesをjoin） |
| GET | `/api/search` | 診療科・市町村・キーワード検索 |
| GET | `/api/transport` | 交通サービス一覧（area/typeフィルタ、Phase 2） |
| GET | `/api/transport/[id]` | 交通サービス詳細（Phase 2） |
| POST | `/api/route/search` | ルート検索（Directions API + 地域交通、Phase 2） |
| GET | `/api/geocode` | 住所→座標変換（Geocoding API、Phase 2） |

### ユーザー API（Supabase Auth 認証必須、Phase 2）

| メソッド | パス | 説明 |
|---------|------|------|
| GET/PUT | `/api/user/profile` | プロフィール取得・更新（upsert） |
| GET/POST/PUT/DELETE | `/api/user/favorites` | かかりつけ医 CRUD（最大5件、GET ?check=id で1件チェック） |
| GET/POST | `/api/user/history` | 受診履歴取得（直近10件重複除去）・記録 |

### 管理 API（認証必須 - Server Actions）

| 関数 | 説明 |
|------|------|
| `createHospital(formData)` | 病院新規登録 |
| `updateHospital(id, formData)` | 病院情報更新 |
| `deleteHospital(id)` | 病院削除 |
| `importHospitals(formData)` | CSV/Excelインポート |
| `exportHospitalsCSV()` | CSVエクスポート |
| `getHospitalSchedules(id)` | 診療時間取得 |
| `updateHospitalSchedules(id, data)` | 診療時間更新 |

## 実装パターン

```typescript
// API Route (src/app/api/[route]/route.ts)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // バリデーション → 処理 → レスポンス
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

```typescript
// Server Action (src/app/admin/actions.ts)
'use server'

async function verifyAdminAuth() {
  // Cookie ベース認証チェック
}

export async function createHospital(formData: FormData) {
  await verifyAdminAuth();
  // supabaseAdmin（Service Role Key）を使用
  // revalidatePath('/admin/hospitals')
}
```

## Supabase クライアント使い分け

- **公開API**: `supabase`（anon key） - `src/lib/supabase.ts`
- **管理操作**: `supabaseAdmin`（Service Role Key） - `src/lib/supabase-admin.ts`
- RLS を bypass する必要がある管理操作は必ず `supabaseAdmin` を使用

## 検索 API クエリパターン

```typescript
// /api/search で使用する Supabase クエリ
query.overlaps('category', categories)  // 診療科（配列の重なり）
query.in('city', cities)                // 市町村（IN句）
query.ilike('name', `%${keyword}%`)     // キーワード（部分一致）
```

## バッチ処理パターン

- ループ内で個別 INSERT しない。バリデーション→一括 INSERT の2段階で処理する
  ```typescript
  // ✅ バッチINSERT（importHospitals で使用）
  const validData = [];
  for (const row of parsedData) {
    // バリデーションのみ実行、validData に push
  }
  await supabaseAdmin.from('hospitals').insert(validData); // 一括挿入
  ```

## AI緊急度判定・受診レコメンド（Phase 2）

- Gemini API: `gemini-3.1-flash-lite-preview` 使用（`src/lib/gemini.ts`）
- 常時有効（機能フラグ廃止、OpenAI 完全廃止）
- フォールバック: Gemini障害時は `departmentMapping.ts` + `fallbackUrgency.ts` で自動切替
- 緊急度3段階: emergency / soon / watch（`UrgencyBadge` コンポーネント）
- 医療法準拠: 「診断」ではなく「参考情報」「受診の目安」と表現
- 免責事項を必ず表示
