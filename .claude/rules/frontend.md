---
paths:
  - "src/app/**/*.tsx"
  - "src/app/**/*.ts"
  - "src/components/**/*.tsx"
  - "src/components/**/*.ts"
  - "src/context/**/*.tsx"
  - "src/app/globals.css"
  - "tailwind.config.ts"
---

# フロントエンド開発ルール

## Server Components vs Client Components

- デフォルトは Server Component。`'use client'` は必要な時のみ追加
- インタラクティブな部分のみ Client Component に分離
- `children` プロップで Server Component を Client Component 内にネスト可能

```typescript
// Server Component でデータ取得 → Client Component にプロップで渡す
// app/page.tsx (Server Component)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getData(id)
  return <InteractiveWidget data={data} />
}
```

## データフェッチング

- Server Component で直接フェッチ（推奨）
- Next.js 15 のデフォルト: `cache: 'no-store'`
- ISR: `fetch(url, { next: { revalidate: 3600 } })`
- オンデマンド: `revalidatePath()` / `revalidateTag()`

```typescript
// Supabase でのフェッチ例
const { data, error } = await supabase
  .from('hospitals')
  .select(`*, schedules:hospital_schedules(*)`)
  .order('name')
```

## Server Actions

```typescript
'use server'

export async function createHospital(formData: FormData) {
  // 認証チェック → バリデーション → DB操作 → revalidatePath()
}

// bind パターンで追加引数を渡す
const updateWithId = updateHospital.bind(null, hospitalId)
```

## スタイリング

- Tailwind CSS ユーティリティファースト
- CSS変数: `--background`, `--foreground`, `--primary`, `--success`, `--error`
- 最小タップ領域: `min-h-[48px]`（シニア対応）
- レスポンシブ: モバイルファースト

## パフォーマンス

- `next/image` で画像最適化（`priority` は Above the fold のみ）
- `next/font` でフォント最適化（Noto Sans JP）
- 重いコンポーネントは `dynamic()` で遅延ロード
- `React.memo`, `useMemo`, `useCallback` で不要な再レンダリング防止

## ルーティング

- App Router（フォルダベース）: `src/app/` 配下
- 動的ルート: `[id]/page.tsx` で `params: Promise<{ id: string }>` を `await`
- ルートグループ: `(groupName)/` で URL に影響なくグルーピング

## 状態管理

- React Hooks + Context API（`QuestionnaireContext` で実装済み）
- LocalStorage への自動保存対応

## コンポーネント構成

```
src/components/
├── Questionnaire/     # アンケート機能
├── SymptomResult/     # 症状説明文・AI診断
├── HospitalList/      # 病院リスト・カード
├── Admin/             # 管理画面フォーム
├── Common/            # Header, Footer, Accordion, ErrorBox, LoadingBox, MobileFixedFooter
└── Layout/            # AdminLayout
```

## 開発チェックリスト

- [ ] Client Component は最小限に
- [ ] エラーハンドリング実装（ErrorBox 使用）
- [ ] ローディング状態を提供（LoadingBox / loading.tsx / Suspense）
- [ ] `next/image`, `next/font` 使用
- [ ] WCAG AA コントラスト比
