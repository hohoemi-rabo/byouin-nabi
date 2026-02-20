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
| POST | `/api/symptoms/ai-diagnosis` | AI診断（実験的、機能フラグ制御） |
| GET | `/api/hospitals` | 全病院リスト取得（schedulesをjoin） |
| GET | `/api/search` | 診療科・市町村・キーワード検索 |

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

## AI診断機能

- 機能フラグ: `NEXT_PUBLIC_AI_DIAGNOSIS === 'true'` で制御
- OpenAI API: `gpt-4o-mini` 使用
- 医療法準拠: 「診断」ではなく「参考情報」「受診の目安」と表現
- 免責事項を必ず表示
