# 病院ナビ南信 (Byouin-Nabi) - Claude Code ガイド

## プロジェクト概要

**プロジェクト名**: 病院ナビ南信 (Byouin-Nabi)
**サブタイトル**: 症状から探す 安心の病院ナビ
**プロジェクトステージ**: 本番運用中 🚀
**プロジェクトディレクトリ**: `/home/masayuki/NextJs/byouin-nabi`
**本番URL**: Vercel にデプロイ済み

### ミッション

「症状があるのに、どの病院に行けばよいか分からない」という地域住民の悩みを解決し、適切な医療機関への受診を促す Web サービス

### ターゲットユーザー

- 主要層: 40 代～シニア層（特に 60 代以上）
- 特性: スマートフォン操作が苦手、診療科の判断に迷う、症状説明が困難
- UX 要件: 大文字サイズ（18px 以上、大文字モード 24px 以上）、高コントラスト、最小タップ領域 48px × 48px

---

## 🚨 重要な注意事項

### Supabase プロジェクトの使用について

**絶対に以下のプロジェクトを使用しないでください：**

- ❌ **taihei-studio** (プロジェクトID: `gzwugjcjobnsbuagjjyf`)
  - **理由**: 本番環境で別サービスが稼働中
  - **状態**: 絶対に操作・変更・削除禁止

**このプロジェクトで使用するSupabaseプロジェクト：**

- ✅ **byouin-nabi** (プロジェクトID: `xsydqbczmzfufeywjfps`)
  - **リージョン**: 東京 (ap-northeast-1)
  - **用途**: 病院ナビ南信 専用
  - **URL**: https://xsydqbczmzfufeywjfps.supabase.co

**開発時の確認事項：**
- Supabase MCP を使用する際は、必ずプロジェクトIDが `xsydqbczmzfufeywjfps` であることを確認
- .env.local ファイルの NEXT_PUBLIC_SUPABASE_URL が `https://xsydqbczmzfufeywjfps.supabase.co` であることを確認
- 誤って taihei-studio を操作した場合は、即座にユーザーに報告

---

## 技術スタック

### コア依存関係

| 技術 | バージョン | 用途 | 備考 |
|------|-----------|------|------|
| Next.js | 15.5.7 | フロントエンドフレームワーク | App Router を使用（Pages Router ではない） |
| React | 19.1.0 | UI フレームワーク | サーバーコンポーネント対応版 |
| React DOM | 19.1.0 | React 出力先 | - |
| Tailwind CSS | 3.4.17 | CSS フレームワーク | ユーティリティファーストで UI 構築 |
| PostCSS | 8.4.49 | CSS トランスパイラ | Tailwind と Autoprefixer の処理 |
| Autoprefixer | 10.4.20 | ベンダープレフィックス自動付与 | - |
| TypeScript | 5.x | 言語 | 厳格モード有効（tsconfig.json の `strict: true`） |

### 開発環境依存関係

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| ESLint | 9.x | コード品質・スタイル検査 |
| eslint-config-next | 15.5.7 | Next.js 公式 ESLint 設定 |
| @types/node | 20.x | Node.js 型定義 |
| @types/react | 19.x | React 型定義 |
| @types/react-dom | 19.x | React DOM 型定義 |

### 外部サービス（実装完了）

| サービス | 用途 | ステータス | 備考 |
|---------|------|----------|------|
| Supabase | データベース・認証 | ✅ 本番稼働中 | PostgreSQL ベース |
| OpenAI API | AI 診断機能 | ✅ 本番稼働中（実験的） | GPT-4o-mini 使用 |
| html2canvas | 画像生成 | ✅ 実装完了 | 症状説明文のスクリーンショット化 |
| Vercel | ホスティング | ✅ 本番稼働中 | 自動デプロイ |

---

## プロジェクト構造

### ディレクトリレイアウト

```
/home/masayuki/NextJs/byouin-nabi/
├── src/
│   ├── app/                    # App Router のルートディレクトリ
│   │   ├── layout.tsx          # ルートレイアウト（Metadata、フォント設定）
│   │   ├── page.tsx            # ホームページ（現在はテンプレート）
│   │   ├── globals.css         # グローバルスタイル
│   │   └── favicon.ico         # ファビコン
│   ├── components/             # 再利用可能なコンポーネント（予定）
│   ├── pages/                  # Tailwind 対象ディレクトリ
│   └── [その他ページ・API]      # 実装時に追加予定
├── public/                     # 静的ファイル（画像等）
│   ├── next.svg
│   ├── vercel.svg
│   └── [その他アセット]
├── .next/                      # ビルド出力（git ignore）
├── node_modules/               # 依存関係（git ignore）
├── .claude/                    # Claude Code 設定
│   └── settings.local.json
├── package.json                # プロジェクト設定・スクリプト
├── package-lock.json           # 依存関係ロック
├── tsconfig.json               # TypeScript 設定
├── next.config.ts              # Next.js 設定
├── tailwind.config.ts          # Tailwind CSS 設定
├── postcss.config.mjs          # PostCSS 設定
├── eslint.config.mjs           # ESLint 設定（新フラットコンフィグ）
├── .mcp.json                   # Supabase MCP サーバー設定
├── REQUIREMENTS.md             # 要件定義書（詳細）
├── README.md                   # プロジェクト説明
└── CLAUDE.md                   # このファイル
```

### キー設定の意義

#### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,           // 厳格型チェック（必須）
    "paths": {
      "@/*": ["./src/*"]      // パスエイリアス（@/components など）
    },
    "jsx": "preserve"         // Next.js の JSX 処理
  }
}
```

- Path Alias `@/*` により、深い相対パスをシンプルに参照可能
- 「`import Button from '@/components/Button'`」のような形式で統一

#### tailwind.config.ts

- Tailwind が監視対象とするファイル: `src/app/**`, `src/components/**`, `src/pages/**`
- カスタムテーマ: CSS 変数ベース（`--background`, `--foreground`）で動的テーマ対応
- デフォルトプラグインなし（必要に応じて `plugins: []` に追加）

#### next.config.ts

- 現在、カスタム設定なし（デフォルト動作）
- 将来、API キャッシング、画像最適化、API ルート等を追加予定

---

## npm スクリプト

```bash
# 開発サーバー起動（Turbopack 有効）
npm run dev
# → http://localhost:3000 でホットリロード対応開発

# 本番ビルド
npm run build
# → `.next/` 出力フォルダに最適化されたバンドルを生成

# 本番サーバー起動
npm start
# → ビルド済みアプリケーションを本番モードで起動

# ESLint 実行
npm run lint
# → コード品質検査（現在、標準ルール）
```

### Turbopack について

- Next.js 15.5.6 で Turbopack 統合（`--turbopack` フラグ）
- 開発時のビルド速度が大幅に向上
- 本番ビルドでも使用可能だが、互換性を確認しながら進めること

---

## アーキテクチャパターン

### ルーティング戦略

**Next.js App Router を採用**

- フォルダベースのルーティング: `src/app/` 内のファイル構造がそのまるでルートになる
- 例: `src/app/admin/page.tsx` → `/admin` ルート
- レイアウトの階層化: `layout.tsx` で共通ヘッダー・フッターを一元管理

**今後の拡張予定:**

```
src/app/
├── layout.tsx                 # ルートレイアウト
├── page.tsx                   # / (ホーム)
├── questionnaire/
│   └── page.tsx              # /questionnaire (アンケート画面)
├── results/
│   └── page.tsx              # /results (結果表示)
├── hospital/
│   └── [id]/
│       └── page.tsx          # /hospital/[id] (病院詳細)
└── admin/                     # 管理画面（認証保護）
    ├── layout.tsx            # 管理画面レイアウト
    ├── dashboard/
    │   └── page.tsx          # /admin/dashboard
    └── hospitals/
        ├── page.tsx          # /admin/hospitals (一覧)
        └── [id]/edit.tsx     # /admin/hospitals/[id]/edit (編集)
```

### コンポーネント設計

**レイアウト:**

- `app/layout.tsx`: グローバルレイアウト（フォント、metadata）
- ページ固有レイアウト: 必要に応じて `layout.tsx` を各ディレクトリに配置

**コンポーネント構成:**

```
src/components/
├── Questionnaire/
│   ├── QuestionnaireForm.tsx      # アンケーム本体
│   └── QuestionOption.tsx         # 選択肢1つ
├── SymptomResult/
│   ├── SymptomDescription.tsx     # 症状説明文表示
│   └── ImageSaveButton.tsx        # 画像保存
├── HospitalList/
│   ├── HospitalList.tsx           # 病院リスト親コンポーネント
│   └── HospitalCard.tsx           # 病院1つのカード
├── Admin/
│   ├── HospitalForm.tsx           # 病院登録・編集フォーム
│   └── DataImporter.tsx           # CSV/Excel インポート
├── Common/
│   ├── Header.tsx                 # ヘッダー
│   ├── Footer.tsx                 # フッター
│   ├── FontSizeToggle.tsx         # 文字サイズ切替
│   └── LoadingSpinner.tsx         # ローディング表示
└── Layout/
    └── AdminLayout.tsx            # 管理画面用レイアウト
```

### 状態管理

**方針: React Hooks + Context API（サーバーコンポーネント優先）**

- グローバル状態: `React.createContext` + `useContext` で実装
- 複雑な状態: 必要に応じて Redux/Zustand 検討
- サーバーコンポーネント: 可能な限り活用してセキュリティ・パフォーマンス向上

**実装予定:**

```typescript
// src/context/QuestionnaireContext.tsx
import { createContext, useContext, ReactNode } from 'react';

interface QuestionnaireContextType {
  location: string | null;
  duration: string | null;
  symptoms: string[];
  // ... その他の回答
  updateAnswer: (key: string, value: any) => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextType | null>(null);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  // 実装
  return <QuestionnaireContext.Provider value={{...}}>{children}</QuestionnaireContext.Provider>;
}

export function useQuestionnaire() {
  const context = useContext(QuestionnaireContext);
  if (!context) throw new Error('useQuestionnaire must be used within QuestionnaireProvider');
  return context;
}
```

### スタイリング戦略

**Tailwind CSS + CSS 変数**

```css
/* src/app/globals.css */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #1e40af;        /* 選択時のブルー */
  --success: #16a34a;         /* 成功時のグリーン */
  --error: #dc2626;           /* エラー時のレッド */
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

**コンポーネントでの使用:**

```tsx
export default function Button({ children, variant = 'primary' }: Props) {
  const baseClass = "px-4 py-2 rounded min-h-[48px] font-medium";
  const variantClass = variant === 'primary' 
    ? 'bg-primary text-white' 
    : 'bg-gray-100 text-foreground';
  
  return <button className={`${baseClass} ${variantClass}`}>{children}</button>;
}
```

---

## Next.js 15 App Router ベストプラクティス

### Server Components vs Client Components

**基本原則:**

- **デフォルトはServer Component**: 全てのコンポーネントはデフォルトでServer Component
- **Client Componentは必要な時のみ**: `'use client'` ディレクティブを追加した時のみClient Component
- **クライアント境界を最小化**: インタラクティブな部分のみをClient Componentに分離

**推奨パターン:**

```typescript
// ✅ 良い例: Server ComponentからClient Componentにデータを渡す
// app/page.tsx (Server Component)
import LikeButton from '@/components/LikeButton'
import { getPost } from '@/lib/data'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  return (
    <div>
      <h1>{post.title}</h1>
      <LikeButton likes={post.likes} />
    </div>
  )
}
```

```typescript
// components/LikeButton.tsx (Client Component)
'use client'
import { useState } from 'react'

export default function LikeButton({ likes }: { likes: number }) {
  const [count, setCount] = useState(likes)
  return (
    <button onClick={() => setCount(count + 1)}>
      いいね {count}
    </button>
  )
}
```

**Server Componentにネストされた Client Component:**

```typescript
// ✅ 良い例: childrenプロップを使ってServer ComponentをClient Component内に配置
// components/Modal.tsx (Client Component)
'use client'

export default function Modal({ children }: { children: React.ReactNode }) {
  return <div className="modal">{children}</div>
}
```

```typescript
// app/page.tsx (Server Component)
import Modal from '@/components/Modal'
import Cart from '@/components/Cart' // Server Component

export default function Page() {
  return (
    <Modal>
      <Cart /> {/* Server Componentのまま */}
    </Modal>
  )
}
```

**Layout構成のベストプラクティス:**

```typescript
// app/layout.tsx (Server Component)
import Search from '@/components/Search' // Client Component
import Logo from '@/components/Logo'     // Server Component

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <Logo />        {/* 静的コンテンツ */}
        <Search />      {/* インタラクティブな検索 */}
      </nav>
      <main>{children}</main>
    </>
  )
}
```

### データフェッチングパターン

**Server Componentでのデータフェッチング（推奨）:**

```typescript
// app/hospitals/page.tsx
export default async function HospitalsPage() {
  // Server Componentで直接データフェッチ
  const hospitals = await fetch('https://api.example.com/hospitals', {
    cache: 'no-store' // Next.js 15のデフォルト動作
  }).then(res => res.json())

  return (
    <div>
      {hospitals.map(hospital => (
        <HospitalCard key={hospital.id} hospital={hospital} />
      ))}
    </div>
  )
}
```

**キャッシュオプション:**

```typescript
// 1. キャッシュなし（リアルタイムデータ）
fetch(url, { cache: 'no-store' })

// 2. 時間ベースの再検証（ISR - Incremental Static Regeneration）
fetch(url, { next: { revalidate: 3600 } }) // 1時間ごとに再検証

// 3. オンデマンド再検証
import { revalidatePath, revalidateTag } from 'next/cache'

// 特定のパスを再検証
revalidatePath('/hospitals')

// タグベースの再検証
fetch(url, { next: { tags: ['hospitals'] } })
revalidateTag('hospitals')
```

**Supabaseでのデータフェッチング例:**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// app/hospitals/page.tsx
import { supabase } from '@/lib/supabase'

export default async function HospitalsPage() {
  const { data: hospitals, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name')

  if (error) {
    throw new Error('病院データの取得に失敗しました')
  }

  return (
    <div>
      {hospitals.map(hospital => (
        <HospitalCard key={hospital.id} hospital={hospital} />
      ))}
    </div>
  )
}
```

### キャッシング戦略

**Next.js 15のキャッシング階層:**

1. **Request Memoization**: 同一レンダリング中の同じリクエストを自動的にメモ化
2. **Data Cache**: サーバー側でのデータキャッシュ（デフォルトは `no-store`）
3. **Full Route Cache**: ビルド時に静的ページをキャッシュ
4. **Router Cache**: クライアント側のルートキャッシュ

**`use cache` ディレクティブ（Next.js 15新機能）:**

```typescript
// ファイルレベルでのキャッシング
'use cache'

export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

```typescript
// コンポーネントレベルでのキャッシング
export async function ExpensiveComponent() {
  'use cache'
  const result = await heavyComputation()
  return <div>{result}</div>
}
```

```typescript
// 関数レベルでのキャッシング
export async function getData() {
  'use cache'
  const data = await fetch('/api/data')
  return data
}
```

**ルートセグメント全体のキャッシング:**

```typescript
// app/layout.tsx
'use cache'

export default function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

// app/page.tsx
'use cache'

async function Users() {
  const users = await fetch('/api/users')
  // ...
}

export default function Page() {
  return (
    <main>
      <Users />
    </main>
  )
}
```

**キャッシュの無効化:**

```typescript
// 動的レンダリングへのオプトアウト
export const dynamic = 'force-dynamic'

export default async function Page() {
  const data = await fetch(url, { cache: 'no-store' })
  return <div>{data}</div>
}
```

### Server Actions のベストプラクティス

**基本的なServer Action:**

```typescript
// app/actions.ts
'use server'

export async function createHospital(formData: FormData) {
  const name = formData.get('name') as string
  const address = formData.get('address') as string

  // データベースへの保存
  const { data, error } = await supabase
    .from('hospitals')
    .insert({ name, address })

  if (error) {
    throw new Error('病院の登録に失敗しました')
  }

  // キャッシュの再検証
  revalidatePath('/admin/hospitals')

  return { success: true, data }
}
```

**フォームでの使用:**

```typescript
// app/admin/hospitals/new/page.tsx
import { createHospital } from '@/app/actions'

export default function NewHospitalPage() {
  return (
    <form action={createHospital}>
      <input type="text" name="name" required />
      <input type="text" name="address" required />
      <button type="submit">登録</button>
    </form>
  )
}
```

**追加の引数を渡す（bind パターン）:**

```typescript
// app/actions.ts
'use server'

export async function updateHospital(hospitalId: string, formData: FormData) {
  const name = formData.get('name') as string
  // ...更新処理
}

// app/admin/hospitals/[id]/edit.tsx
'use client'

import { updateHospital } from '@/app/actions'

export function HospitalEditForm({ hospitalId }: { hospitalId: string }) {
  const updateWithId = updateHospital.bind(null, hospitalId)

  return (
    <form action={updateWithId}>
      <input type="text" name="name" />
      <button type="submit">更新</button>
    </form>
  )
}
```

**認証チェック付きServer Action:**

```typescript
// app/actions.ts
'use server'

import { verifySession } from '@/lib/auth'

export async function adminAction(formData: FormData) {
  const session = await verifySession()
  const userRole = session?.user?.role

  // 権限チェック
  if (userRole !== 'admin') {
    throw new Error('管理者権限が必要です')
  }

  // アクションの実行
  // ...
}
```

**Server Actionのセキュリティ設定:**

```javascript
// next.config.ts
const config = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
      allowedOrigins: ['your-domain.com'],
    },
  },
}
```

**インラインServer Action:**

```typescript
// app/page.tsx (Server Component)
export default function Page() {
  async function publish(formData: FormData) {
    'use server'
    const title = formData.get('title')
    // ...処理
  }

  return (
    <form action={publish}>
      <input name="title" />
      <button type="submit">公開</button>
    </form>
  )
}
```

### パフォーマンス最適化

**画像最適化（next/image）:**

```typescript
import Image from 'next/image'

export function HospitalCard({ hospital }) {
  return (
    <div>
      <Image
        src={hospital.imageUrl || '/placeholder.png'}
        alt={hospital.name}
        width={500}
        height={300}
        priority={false} // Above the fold の画像のみ true
        placeholder="blur"
        blurDataURL="data:image/..."
      />
      <h2>{hospital.name}</h2>
    </div>
  )
}
```

**フォント最適化（next/font）:**

```typescript
// app/layout.tsx
import { Inter, Noto_Sans_JP } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['japanese'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-noto-sans-jp',
})

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

```css
/* globals.css */
body {
  font-family: var(--font-noto-sans-jp), sans-serif;
}
```

**動的インポート（遅延ロード）:**

```typescript
import dynamic from 'next/dynamic'

// Client Componentの遅延ロード
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>読み込み中...</p>,
  ssr: false, // クライアント側でのみレンダリング
})

export default function Page() {
  return (
    <div>
      <HeavyComponent />
    </div>
  )
}
```

**レンダリング戦略:**

```typescript
// 静的生成（デフォルト）
export default async function Page() {
  const data = await fetch(url, { next: { revalidate: 3600 } })
  return <div>{data}</div>
}

// 動的レンダリング
export const dynamic = 'force-dynamic'

export default async function Page() {
  const data = await fetch(url, { cache: 'no-store' })
  return <div>{data}</div>
}

// Partial Prerendering (PPR) - 実験的機能
export const experimental_ppr = true

export default function Page() {
  return (
    <div>
      <StaticPart />        {/* 静的に生成 */}
      <Suspense fallback={<Loading />}>
        <DynamicPart />     {/* 動的に生成 */}
      </Suspense>
    </div>
  )
}
```

### ルーティングパターン

**動的ルート:**

```typescript
// app/hospital/[id]/page.tsx
export default async function HospitalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const hospital = await getHospital(id)

  return <div>{hospital.name}</div>
}

// 静的生成用のパス一覧
export async function generateStaticParams() {
  const hospitals = await getHospitals()

  return hospitals.map((hospital) => ({
    id: hospital.id,
  }))
}
```

**パラレルルート（同時表示）:**

```
app/
├── @modal/
│   └── (..)photo/[id]/
│       └── page.tsx
└── page.tsx
```

```typescript
// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

**インターセプティングルート（モーダル）:**

```
app/
├── photos/
│   └── [id]/
│       └── page.tsx        # /photos/123 への直接アクセス
└── @modal/
    └── (..)photos/[id]/
        └── page.tsx        # モーダルでインターセプト
```

```typescript
// app/@modal/(..)photos/[id]/page.tsx
export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = await getPhoto(id)

  return (
    <div className="modal">
      <Image src={photo.url} alt={photo.title} />
    </div>
  )
}
```

**ルートグループ（URLに影響しない）:**

```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx       # /about
│   └── blog/
│       └── page.tsx       # /blog
└── (shop)/
    ├── products/
    │   └── page.tsx       # /products
    └── cart/
        └── page.tsx       # /cart
```

**Middleware によるルーティング制御:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdmin = request.cookies.get('admin-token')

  // 管理画面へのアクセス制御
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

### 開発時のチェックリスト

**コンポーネント設計:**

- [ ] インタラクティブな部分のみをClient Componentに分離
- [ ] Server Componentで可能な限りデータフェッチング
- [ ] `children` プロップを使ってServer/Client Componentを構成

**データフェッチング:**

- [ ] 適切なキャッシング戦略を選択（`no-store`, `revalidate`, `tags`）
- [ ] エラーハンドリングを実装
- [ ] ローディング状態を提供（`loading.tsx` または `Suspense`）

**パフォーマンス:**

- [ ] `next/image` を使用して画像を最適化
- [ ] `next/font` でフォントを最適化
- [ ] 重いコンポーネントは動的インポート
- [ ] 不要な再レンダリングを防ぐ（`memo`, `useMemo`, `useCallback`）

**セキュリティ:**

- [ ] Server Actionに認証チェックを実装
- [ ] 環境変数を適切に管理（`NEXT_PUBLIC_*` の使い分け）
- [ ] CSRFトークンを検証（Server Actionsの `allowedOrigins` 設定）

**アクセシビリティ:**

- [ ] セマンティックHTML を使用
- [ ] `alt` 属性を画像に追加
- [ ] キーボードナビゲーションをサポート
- [ ] 適切なコントラスト比を維持（WCAG AA以上）

---

## API 設計（実装予定）

### エンドポイント一覧

#### パブリック API（認証不要）

```
POST /api/symptoms/generate
  入力: { location, duration, symptoms, conditions, medicine, memo }
  出力: { description: string }
  説明: テンプレートベースで症状説明文を生成

POST /api/symptoms/ai-diagnosis (実験的)
  入力: { location, duration, symptoms, conditions, medicine, memo }
  出力: { analysis: string }
  説明: OpenAI API で AI 診断（初期リリースでは無効化）
  環境変数: NEXT_PUBLIC_AI_DIAGNOSIS

GET /api/hospitals
  入力: なし
  出力: { hospitals: Hospital[] }
  説明: 全病院リストを取得

GET /api/hospitals/search
  入力: { categories: string[] }
  出力: { hospitals: Hospital[] }
  説明: 診療科でフィルタリングして検索
```

#### 管理 API（認証必須）

```
POST /api/admin/hospitals
  入力: { name, categories, address, tel, city, opening_hours, google_map_url, note }
  出力: { hospital: Hospital }
  説明: 病院情報を新規登録

PUT /api/admin/hospitals/:id
  入力: { name, categories, ... }
  出力: { hospital: Hospital }
  説明: 病院情報を更新

DELETE /api/admin/hospitals/:id
  入力: なし
  出力: { success: boolean }
  説明: 病院情報を削除

POST /api/admin/import
  入力: FormData (CSV/Excel ファイル)
  出力: { imported: number, errors: string[] }
  説明: CSV/Excel ファイルから一括インポート
```

### 実装パターン

**App Router での API ルート (`src/app/api/[route]/route.ts`):**

```typescript
// src/app/api/symptoms/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // バリデーション
    // テンプレートで文字列生成
    return NextResponse.json({ description: '...' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## データベース設計（Supabase）

### hospitals テーブル

```sql
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT[] NOT NULL,  -- 複数診療科対応
  address TEXT NOT NULL,
  tel TEXT NOT NULL,
  city TEXT NOT NULL,
  opening_hours TEXT,
  google_map_url TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_hospitals_category ON hospitals USING GIN(category);
```

### hospital_schedules テーブル

```sql
CREATE TABLE hospital_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
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

-- インデックス
CREATE INDEX idx_hospital_schedules_hospital_id ON hospital_schedules(hospital_id);

-- コメント
-- day_of_week: 0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土
-- morning_start/end: 午前診療時間
-- afternoon_start/end: 午後診療時間
-- is_closed: 休診日フラグ
-- note: 備考（第3土曜休診など）
```

### Supabase Auth 設定

- 認証方法: メール + パスワード
- 管理者数: 1 名のみ登録可能
- RLS (Row Level Security): 管理画面で管理者チェック実装

---

## 開発時の重要な原則

### コード品質の基準（この プロジェクトに適用）

1. **TypeScript 厳格モード**
   - `tsconfig.json` の `"strict": true` を遵守
   - `any` 型の使用は最小限に（特に API レスポンス）
   - コンポーネント Props は必ず型定義

2. **エラーハンドリング**
   - ユーザー向けエラー: UI に明確に表示（赤色、大きなフォント）
   - サーバー側エラー: 詳細は console、ユーザーには簡潔なメッセージ
   - ネットワークエラー: リトライ機構を検討

3. **アクセシビリティ（a11y）**
   - シニア向け: 最小フォント 18px（大文字モードで 24px）
   - タップエリア: 最小 48px × 48px
   - コントラスト比: WCAG AA レベル以上
   - キーボードナビゲーション対応

4. **パフォーマンス**
   - 不要な Re-render 最小化（React.memo, useMemo 活用）
   - 画像: Next.js Image コンポーネント使用
   - API キャッシュ: Supabase クエリ結果はメモ化

### ファイル命名規約

- コンポーネント: PascalCase (例: `QuestionnaireForm.tsx`)
- ユーティリティ関数: camelCase (例: `formatDate.ts`)
- テストファイル: `.test.ts` または `.spec.ts` サフィックス
- API ルート: ケバブケース (例: `route.ts`)

### コミット規約

```
feat: 新機能の実装
fix: バグ修正
docs: ドキュメント更新
test: テスト追加・修正
refactor: コードの再構成（機能変更なし）
chore: パッケージ更新等の保守作業
```

例:
```
feat: implement questionnaire form component
fix: correct symptom mapping logic for throat symptoms
docs: update API documentation for hospital search endpoint
```

---

## 環境変数設定（.env.local / Vercel）

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xsydqbczmzfufeywjfps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # 管理機能用（サーバー側のみ）

# 管理画面認証
ADMIN_PASSWORD=...  # 管理者ログインパスワード

# OpenAI (AI診断機能)
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_AI_DIAGNOSIS=true  # AI診断を有効化（本番でも有効）

# Google Maps (将来の URL 生成用)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...  # オプション
```

**Vercel環境変数設定:**
上記の環境変数はVercelのプロジェクト設定 > Environment Variables に設定済み。

**セキュリティ注意:**

- API キーは `.env.local` に記載し、`.gitignore` に追加
- `NEXT_PUBLIC_*` プリフィックスは、クライアント側で必要な場合のみ使用
- Server-only シークレット: プリフィックスなし（`OPENAI_API_KEY` など）

---

## 実装時の注意点

### AI 診断機能の取り扱い

この機能は **実験的** ですが、本番環境で **有効化** されています。

**現在のステータス:**
- ✅ 免責事項・ユーザー同意フロー実装完了
- ✅ 本番環境で有効化済み（`NEXT_PUBLIC_AI_DIAGNOSIS=true`）
- ⚠️ 利用者を限定してテスト運用中

**実装例:**

```typescript
const isAIDiagnosisEnabled = process.env.NEXT_PUBLIC_AI_DIAGNOSIS === 'true';

export async function generateAIDiagnosis(symptoms: Symptoms) {
  if (!isAIDiagnosisEnabled) {
    throw new Error('AI diagnosis is not enabled in this environment');
  }
  // OpenAI API 呼び出し
}
```

### 医療法への準拠

- 「診断」「治療」などの医療用語を避ける（「参考情報」「受診の目安」と表現）
- 必ず「医師の診察を受けてください」を明記
- AI 診断結果には「医学的診断ではない」と強調表示

### 画像保存機能（html2canvas）

- スクリーンショット化は **クライアント側のみ**（サーバーで処理しない）
- 保存先は **端末ローカルストレージ** のみ（サーバーに送信しない）
- ユーザーの症状データは保存しない

---

## 開発時のデバッグ手法

### VS Code での TypeScript エラー確認

```bash
# CLI で型チェック
npx tsc --noEmit
```

### Next.js 開発サーバーのログ

```bash
npm run dev
# → http://localhost:3000
# → コンソールで HMR (Hot Module Replacement) 通知
```

### Supabase の確認

- 接続確認: https://supabase.com/dashboard
- データベースクエリ: Supabase Studio の SQL エディタ
- MCP サーバー: `.mcp.json` で設定済み

---

## テスト戦略（計画中）

- **ユニットテスト**: Vitest または Jest
- **統合テスト**: Cypress または Playwright
- **E2E テスト**: 実際のユーザーフローをシミュレート

**重点箇所:**

- 症状説明文の生成ロジック（テンプレート）
- 診療科マッピング（症状 → 推奨科の対応）
- 管理画面の CRUD 操作
- AI 診断の出力フォーマット（実験的機能）

---

## 開発フェーズ完了状況

### ✅ Phase 1: 基盤構築（完了）
- Next.js 15 + React 19 + TypeScript
- Supabase 連携
- 基本UI構築

### ✅ Phase 2: コア機能（完了）
- アンケート機能
- 症状説明文生成
- 診療科マッピング
- 病院検索・表示

### ✅ Phase 3: 管理機能（完了）
- 管理者ログイン画面
- 病院 CRUD 操作
- CSV/Excel インポート
- 診療時間テーブル管理

### ✅ Phase 4: AI 診断機能（完了・運用中）
- OpenAI API 連携
- 免責事項・同意フロー
- 本番環境で有効化済み

### ✅ Phase 5: 本番デプロイ（完了）
- Vercel デプロイ
- 環境変数設定
- パフォーマンス最適化
- リファクタリング完了

### 今後の拡張予定
- エラーログ収集（Sentry 等の導入検討）
- ユーザー分析（Google Analytics 等）
- テスト実装（Vitest/Playwright）
- PWA対応

---

## よくある質問（FAQ）

### Q: どうやって開発を始めるか？

```bash
cd /home/masayuki/NextJs/byouin-nabi
npm install  # 依存関係インストール（初回のみ）
npm run dev  # 開発サーバー起動
# http://localhost:3000 にアクセス
```

### Q: Path Alias `@/` の使い方は？

```typescript
// Bad
import Button from '../../components/Button';

// Good
import Button from '@/components/Button';
```

### Q: Tailwind CSS でカスタムカラーを使いたい

```typescript
// tailwind.config.ts に追加
const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',  // CSS 変数を参照
        'custom-blue': '#0066cc',
      },
    },
  },
};
```

### Q: 環境変数を新規追加したら？

1. `.env.local` に追加
2. `NEXT_PUBLIC_` プリフィックスをつけるか検討（クライアント側で必要か）
3. 開発サーバーを再起動

### Q: Supabase のテーブル構造を変更したい

1. Supabase Studio (`https://supabase.com/dashboard`) でマイグレーション作成
2. または SQL エディタから直接実行
3. ローカル型生成: `npx supabase gen types typescript --project-id [ID]`

---

## 参考資料・リンク

### 公式ドキュメント

- [Next.js 15 公式ドキュメント](https://nextjs.org/docs)
- [React 19 公式ドキュメント](https://react.dev)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [Supabase ドキュメント](https://supabase.com/docs)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)

### プロジェクト関連ドキュメント

- `/home/masayuki/NextJs/byouin-nabi/REQUIREMENTS.md` - 詳細な要件定義書
- `/home/masayuki/NextJs/byouin-nabi/README.md` - セットアップガイド

### 外部 API

- [OpenAI API リファレンス](https://platform.openai.com/docs) (実験的機能用)
- [Google Maps Platform](https://developers.google.com/maps) (将来対応)

---

## 最後に

このプロジェクトは **シニア層を対象にした医療情報サービス** です。

**開発時に必ず意識すること:**

1. **ユーザー中心設計**: テンプレートベースの説明文生成で、シニア層にも分かりやすく
2. **医療法準拠**: 「診断」は行わない、「参考情報」である旨を常に明記
3. **品質第一**: 医療関連サービスのため、エラーやバグは許されない
4. **段階的実装**: 実験的機能（AI 診断）は無効状態でリリース、十分なレビュー後に有効化
5. **保守性**: 将来の改修を見据え、DRY 原則・適切な命名・テストを心がける

---

## チケット管理とTodo運用

### チケットの場所

`/home/masayuki/NextJs/byouin-nabi/docs/` ディレクトリに機能別のチケットファイルが格納されています。

### チケット一覧

- **000-プロジェクトセットアップ.md**
- **001-データベース設計・構築.md**
- **002-基本UI構築.md**
- **003-アンケート機能実装.md**
- **004-症状説明文生成機能.md**
- **005-診療科マッピング機能.md**
- **006-病院検索・表示機能.md**
- **007-画像保存機能.md**
- **008-管理画面構築.md**
- **009-病院CRUD機能.md**
- **010-CSVインポート機能.md**
- **011-AI診断機能実装.md**（実験的、初期リリース時はスキップ可）
- **012-UIUXブラッシュアップ.md**
- **013-テスト実装.md**
- **014-本番環境構築・デプロイ.md**

詳細は `/docs/README.md` を参照してください。

### Todoの記法

各チケット内のタスクは以下の形式で管理します：

```markdown
## タスク

### セクション名
- [ ] 未完了のタスク
- [x] 完了したタスク
- [ ] 進行中のタスク
```

### Todo管理ルール

1. **タスク開始時**: `- [ ]` のままで作業開始
2. **タスク完了時**: `- [ ]` を `- [x]` に変更
3. **チケット完了時**: 「受け入れ基準」の全項目が `- [x]` になっていることを確認

### 進捗確認方法

```bash
# 特定のチケットの進捗確認
grep -E "^- \[[ x]\]" docs/003-アンケート機能実装.md

# 全チケットの未完了タスク数
grep -c "^- \[ \]" docs/*.md

# 完了したタスク数
grep -c "^- \[x\]" docs/*.md
```

### チケット実装の流れ

1. **チケット選択**: 依存関係を確認し、実装可能なチケットを選択
2. **タスク確認**: チケット内の「タスク」セクションを確認
3. **実装**: タスクを1つずつ実装
4. **Todo更新**: 完了したら `- [x]` に変更
5. **受け入れ基準チェック**: 全ての受け入れ基準が満たされているか確認
6. **次のチケットへ**: 依存関係に応じて次のチケットに進む

### 注意事項

- **必ずチケットを読んでから実装**: 実装例やベストプラクティスが含まれています
- **受け入れ基準は厳守**: 全て満たさない限りチケットは完了とみなしません
- **依存関係を確認**: 必要なチケットが完了していないと、実装が困難になります
- **Todoは随時更新**: 進捗を可視化し、抜け漏れを防ぐため

### チケット間の依存関係

```
000 (プロジェクトセットアップ)
 ├─ 001 (データベース設計)
 ├─ 002 (基本UI構築)
 │   └─ 003 (アンケート機能)
 │       ├─ 004 (症状説明文生成)
 │       │   ├─ 005 (診療科マッピング)
 │       │   │   └─ 006 (病院検索・表示)
 │       │   └─ 007 (画像保存)
 │       │   └─ 011 (AI診断) ※オプション
 │       └─ 012 (UI/UXブラッシュアップ)
 └─ 008 (管理画面構築)
     └─ 009 (病院CRUD)
         └─ 010 (CSVインポート)

013 (テスト実装) - 並行作業可能
014 (本番環境構築) - 全機能完了後
```

---

## 実装完了状況

### 完了済みチケット（2025年11月18日時点）

#### ✅ チケット 000: プロジェクトセットアップ
- Next.js 15.5.6 + React 19 + TypeScript プロジェクト構築完了
- Tailwind CSS 設定完了
- プロジェクト構造確立

#### ✅ チケット 001: データベース設計・構築
- Supabase プロジェクト作成（byouin-nabi: xsydqbczmzfufeywjfps）
- hospitals テーブル作成・設定完了
- カラム構成:
  - id (UUID, Primary Key)
  - name (TEXT)
  - category (TEXT[]) - 診療科の配列
  - address (TEXT)
  - tel (TEXT)
  - city (TEXT)
  - opening_hours (TEXT, nullable)
  - google_map_url (TEXT, nullable)
  - website (TEXT, nullable) - **2025/11/18追加**
  - note (TEXT, nullable)
  - created_at, updated_at (TIMESTAMP)

#### ✅ チケット 002: 基本UI構築
- レイアウトコンポーネント実装（Header, Footer, AdminLayout）
- 共通コンポーネント実装（Button, LoadingSpinner）
- レスポンシブデザイン対応

#### ✅ チケット 003: アンケート機能実装
- QuestionnaireContext によるグローバル状態管理
- 多段階フォーム実装（部位選択 → 詳細症状 → 補足情報）
- LocalStorage への自動保存機能
- バリデーション実装

#### ✅ チケット 004: 症状説明文生成機能
- テンプレートベースの症状説明文生成API実装
- `/api/symptoms/generate` エンドポイント作成
- SymptomDescription コンポーネント実装

#### ✅ チケット 005: 診療科マッピング機能
- 部位と症状から診療科を推奨する機能実装
- `/lib/departmentMapping.ts` 実装
- RecommendedDepartments コンポーネント実装

#### ✅ チケット 006: 病院検索・表示機能
- `/api/hospitals` エンドポイント実装（全病院取得）
- `/api/hospitals/search` エンドポイント実装（診療科フィルタリング）
- HospitalList コンポーネント実装
- HospitalCard コンポーネント実装
  - 地図表示ボタン（🗺️ Google Maps）
  - Webサイトボタン（🌐 外部リンク）

#### ✅ チケット 007: 画像保存機能
- html2canvas 統合
- ImageSaveButton コンポーネント実装
- 症状説明文のスクリーンショット保存機能

#### ✅ チケット 008: 管理画面構築
- Cookie ベース認証システム実装
  - `/api/admin/login` - ログインAPI
  - `/api/admin/logout` - ログアウトAPI
  - `/middleware.ts` - 認証ガード（/admin 保護）
- AdminLayout 実装（条件付きレンダリング対応）
  - `/admin/login` ページでは管理画面レイアウトを非表示
- AdminSidebar, AdminHeader コンポーネント実装
- `/admin/dashboard` ページ実装

#### ✅ チケット 009: 病院CRUD機能
- **実装日**: 2025年11月18日
- **重要な技術的解決事項**:
  - **Supabase RLS問題の解決**: Service Role Key を使用した管理用クライアント作成
  - **ファイル**: `/src/lib/supabase-admin.ts`
  - **環境変数**: `SUPABASE_SERVICE_ROLE_KEY` 追加

**実装内容:**

1. **Server Actions** (`/src/app/admin/actions.ts`):
   ```typescript
   'use server'

   // 認証チェック
   async function verifyAdminAuth()

   // CRUD操作（全てsupabaseAdminを使用）
   export async function createHospital(formData: FormData)
   export async function updateHospital(hospitalId: string, formData: FormData)
   export async function deleteHospital(hospitalId: string)
   ```

2. **HospitalForm コンポーネント** (`/src/components/Admin/HospitalForm.tsx`):
   - 新規登録・編集共用フォーム
   - `useTransition()` による非同期状態管理
   - バリデーション（クライアント側・サーバー側）
   - 入力フィールド:
     - 病院名、診療科（カンマ区切り）、住所、市町村、電話番号
     - 診療時間、Google Maps URL、Webサイト、備考

3. **管理画面ページ**:
   - `/admin/hospitals` - 病院一覧（編集・削除ボタン付き）
   - `/admin/hospitals/new` - 新規登録
   - `/admin/hospitals/[id]/edit` - 編集（動的ルート）

4. **UI調整**:
   - 管理画面のフォントサイズ・パディング最適化
   - シニア向けサイズ（text-4xl, p-6）→ デスクトップ管理者向け（text-2xl, p-4）に調整

5. **Websiteフィールド追加** (2025/11/18):
   - データベースに `website` カラム追加
   - Hospital型定義に `website?: string | null` 追加
   - フォーム入力欄追加
   - 管理画面一覧にWebサイト表示（🌐アイコン + リンク）
   - 公開ページ（HospitalCard）にWebサイトボタン追加

**受け入れ基準:**
- ✅ 病院の新規登録が管理画面から可能
- ✅ 病院情報の編集が可能
- ✅ 病院の削除が可能（確認ダイアログ付き）
- ✅ 診療科の複数選択対応（カンマ区切り入力）
- ✅ バリデーション実装（必須項目チェック）
- ✅ エラーハンドリング実装
- ✅ 成功・失敗時のフィードバック表示
- ✅ 本番ビルド成功確認（npm run build）

### ビルドテスト結果（2025年11月18日）

```
✓ Compiled successfully in 16.3s
✓ Linting and checking validity of types
✓ Generating static pages (16/16)

Route (app)                         Size  First Load JS
┌ ○ /                              647 B         119 kB
├ ○ /admin/dashboard             1.27 kB         121 kB
├ ○ /admin/hospitals             1.78 kB         122 kB
├ ƒ /admin/hospitals/[id]/edit       0 B         122 kB
├ ○ /admin/hospitals/new             0 B         122 kB
├ ○ /admin/login                 1.16 kB         121 kB
├ ○ /questionnaire               3.02 kB         122 kB
└ ○ /results                     50.6 kB         169 kB

型エラー: なし
リントエラー: なし
```

#### ✅ チケット 010: CSVインポート機能
- **実装日**: 2025年11月19日

**実装内容:**

1. **パッケージインストール**:
   - `papaparse` (CSV解析)
   - `xlsx` (Excel解析)
   - `@types/papaparse` (型定義)

2. **Server Actions** (`/src/app/admin/actions.ts`に追加):
   ```typescript
   export async function importHospitals(formData: FormData): Promise<ImportResult>
   export async function exportHospitalsCSV(): Promise<string>
   ```

3. **インポート機能** (`/src/app/admin/hospitals/import/page.tsx`):
   - CSV/Excelファイルアップロード
   - ファイル形式自動判定（.csv, .xlsx, .xls）
   - データバリデーション（必須項目チェック）
   - エラー行の詳細レポート
   - 既存データ全削除 + 新規データインポート（フル置換方式）
   - ConfirmModal による確認ダイアログ
   - LoadingSpinner によるインポート中表示
   - 完了モーダル（成功件数・エラー件数表示）

4. **CSVエクスポート機能**:
   - 登録済み病院データのCSVダウンロード
   - UTF-8 BOM 対応（Excelでの文字化け防止）
   - ダウンロードファイル名: `hospitals_YYYY-MM-DD.csv`

5. **ワークフロー**:
   - ① 登録データをCSVでダウンロード
   - ② Excelやテキストエディタで編集（追加・修正・削除）
   - ③ 編集したCSVをインポート（既存データを全削除してから新規データを挿入）

6. **UI/UX改善（追加実装）**:
   - リッチモーダルシステム（ConfirmModal, SuccessModal）
   - トースト通知（Toast）
   - CSS アニメーション（fadeIn, slideIn, bounceIn, slideInRight）
   - 全ての `window.confirm()` と `alert()` をリッチモーダルに置き換え:
     - 病院削除確認
     - CSVインポート確認
     - アンケートリセット確認
     - 削除成功メッセージ
     - インポート完了メッセージ
     - 登録・更新時のトースト通知

**受け入れ基準:**
- ✅ CSVファイルからインポートできる
- ✅ Excelファイルからインポートできる
- ✅ バリデーションエラーが適切に報告される
- ✅ 成功件数とエラー件数が表示される
- ✅ エラー行が特定できる
- ✅ 登録データCSVダウンロード機能
- ✅ インポート前の確認モーダル表示
- ✅ インポート中のローディング表示
- ✅ インポート完了モーダル表示
- ✅ 既存データ全削除 + 新規データインポート（フル置換方式）
- ✅ 本番ビルド成功確認（npm run build）

### ビルドテスト結果（2025年11月19日）

```
✓ Compiled successfully in 19.4s
✓ Linting and checking validity of types
✓ Generating static pages (17/17)

Route (app)                         Size  First Load JS
┌ ○ /                              647 B         119 kB
├ ○ /admin/dashboard             1.27 kB         121 kB
├ ○ /admin/hospitals             2.81 kB         123 kB
├ ƒ /admin/hospitals/[id]/edit       0 B         122 kB
├ ○ /admin/hospitals/import      3.65 kB         124 kB
├ ○ /admin/hospitals/new             0 B         122 kB
├ ○ /admin/login                 1.16 kB         121 kB
├ ○ /questionnaire               3.47 kB         122 kB
└ ○ /results                     50.7 kB         169 kB

型エラー: なし
リントエラー: なし
```

#### ✅ 診療時間テーブル機能
- **実装日**: 2025年11月19日

**実装内容:**

1. **データベーステーブル追加**:
   - `hospital_schedules` テーブル作成
   - 曜日別（0=日, 1=月, ..., 6=土）の診療時間管理
   - 午前・午後の時間帯（TIME型）
   - 休診日フラグ（`is_closed`）
   - 備考フィールド（第3土曜休診など）
   - `hospital_id` による外部キー制約（ON DELETE CASCADE）

2. **TypeScript型定義** (`/src/types/hospital.ts`):
   ```typescript
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
     created_at?: string;
     updated_at?: string;
   }

   export interface Hospital {
     // ...既存フィールド
     schedules?: HospitalSchedule[]; // リレーション
   }
   ```

3. **Server Actions** (`/src/app/admin/actions.ts`に追加):
   ```typescript
   export async function getHospitalSchedules(hospitalId: string)
   export async function updateHospitalSchedules(
     hospitalId: string,
     schedulesData: ScheduleFormData[]
   )
   ```

4. **管理画面 - 診療時間編集ページ** (`/src/app/admin/hospitals/[id]/schedules/page.tsx`):
   - 7曜日分の診療時間入力フォーム
   - 午前・午後それぞれに開始時刻・終了時刻を入力（`<input type="time">`）
   - 休診チェックボックス（チェック時は時刻入力を非表示）
   - 備考入力欄（各曜日ごと）
   - 一括保存機能（既存削除 + 新規挿入）

5. **管理画面 - 病院一覧ページ更新**:
   - 「🕒 診療時間」ボタン追加
   - `/admin/hospitals/[id]/schedules` へのリンク

6. **API更新**:
   - `/api/hospitals` - `schedules:hospital_schedules(*)` を join
   - `/api/hospitals/search` - `schedules:hospital_schedules(*)` を join

7. **HospitalCard コンポーネント** (`/src/components/HospitalList/HospitalCard.tsx`):
   - **テーブル形式で診療時間を表示**:
     - 曜日 × 午前・午後のテーブル
     - 休診日は「休診」と表示
     - 備考がある曜日は表下に表示
   - **フォールバック**: `schedules` がない場合は `opening_hours` を従来通り表示（後方互換性）

**受け入れ基準:**
- ✅ 管理画面で診療時間を曜日別・午前午後別に入力可能
- ✅ 休診日を設定可能
- ✅ 備考（第3土曜休診など）を入力可能
- ✅ 診療時間がテーブル形式で見やすく表示される
- ✅ 既存の opening_hours フィールドとの互換性維持
- ✅ 本番ビルド成功確認（npm run build）

#### ✅ 病院検索機能
- **実装日**: 2025年11月24日
- **UI改善日**: 2025年11月30日

**実装内容:**

1. **マスターデータ** (`/src/lib/masterData.ts`):
   - 全診療科リスト（20種類）: `ALL_DEPARTMENTS`
   - 南信地域市町村リスト（14自治体）: `ALL_CITIES`
   - 市町村名はデータベースの`city`カラムと一致（郡名なし: 高森町、松川町など）

2. **検索API** (`/src/app/api/search/route.ts`):
   ```typescript
   export async function GET(request: NextRequest) {
     // クエリパラメータから検索条件を取得
     const categoriesParam = searchParams.get('categories');
     const citiesParam = searchParams.get('cities');
     const keyword = searchParams.get('keyword');

     // Supabaseクエリ構築
     let query = supabase
       .from('hospitals')
       .select(`*, schedules:hospital_schedules(*)`)
       .order('name');

     // 診療科フィルタリング（overlaps演算子で配列検索）
     if (categoriesParam) {
       query = query.overlaps('category', categories);
     }

     // 市町村フィルタリング（in演算子で複数値検索）
     if (citiesParam) {
       query = query.in('city', cities);
     }

     // キーワードフィルタリング（ilike演算子で部分一致検索）
     if (keyword) {
       query = query.ilike('name', `%${keyword}%`);
     }
   }
   ```

3. **検索UIの2ページ構成**（2025年11月30日改善）:

   **検索条件ページ** (`/src/app/search/page.tsx`):
   - 診療科選択（チェックボックス × 20）
   - 市町村選択（チェックボックス × 14）
   - キーワード入力（病院名）
   - 検索/リセットボタン
   - 検索ボタンで `/search/results` へ遷移
   - 条件未入力時はボタン無効化

   **検索結果ページ** (`/src/app/search/results/page.tsx`):
   - URLパラメータから検索条件を取得して検索実行
   - 検索条件の表示（タグ形式）
   - 検索結果リスト表示
   - **スマホ用固定フッター**: 「ホーム」「条件を変更」ボタン
   - PC用「条件を変更して再検索」ボタン
   - 条件がない場合は `/search` へリダイレクト

4. **病院詳細ページ** (`/src/app/hospital/[id]/page.tsx`):
   - サーバーサイドレンダリング（async component）
   - Supabase から病院情報と診療時間を取得
   - HospitalCard コンポーネントで詳細表示
   - **スマホ用固定フッター**: 「ホーム」「検索結果」ボタン
   - PC用「← 検索結果に戻る」リンク（検索パラメータ付き）
   - **スマホ用ボタンサイズ調整**: 電話・地図・Webボタンを3列グリッドで配置

5. **共通コンポーネント**:
   - `MobileFixedFooter`: スマホ用固定フッター（検索結果・詳細ページで使用）
   - `Footer`: 検索結果・詳細ページではスマホ非表示

6. **ヘッダー更新** (`/src/components/Common/Header.tsx`):
   - 「🔍 検索」ボタン追加
   - `/search` へのリンク

**検索フロー:**
```
/search（検索条件ページ）
  ↓ 診療科・市町村・キーワードを選択
  ↓ 「検索する」ボタン
/search/results?categories=内科&cities=飯田市（検索結果ページ）
  ↓ 病院をタップ
/hospital/[id]?categories=内科&cities=飯田市（病院詳細ページ）
  ↓ 「検索結果」ボタン（スマホ）または「← 検索結果に戻る」（PC）
/search/results?categories=内科&cities=飯田市（検索結果ページ - 条件保持）
```

**受け入れ基準:**
- ✅ 診療科で絞り込み検索が可能
- ✅ 市町村で絞り込み検索が可能
- ✅ 病院名でキーワード検索が可能
- ✅ 複数条件の組み合わせ検索が可能
- ✅ 検索結果がリスト形式で表示される
- ✅ 検索結果から病院詳細ページへ遷移できる
- ✅ 病院詳細ページから検索結果に戻れる
- ✅ 検索条件が URL に保存され、戻るボタンで復元される
- ✅ ヘッダーに検索リンクが表示される
- ✅ スマホで固定フッターが表示される
- ✅ 本番ビルド成功確認（npm run build）

#### ✅ UI/UX改善 - 病院リスト表示の最適化
- **実装日**: 2025年11月24日

**実装内容:**

1. **市町村マスターデータの最適化** (`/src/lib/masterData.ts`):
   - 対象地域を飯田市・下伊那郡に限定
   - **14自治体**: 飯田市、松川町、高森町、阿南町、阿智村、平谷村、根羽村、下条村、売木村、天龍村、泰阜村、喬木村、豊丘村、大鹿村

2. **HospitalListItem コンポーネント作成** (`/src/components/HospitalList/HospitalListItem.tsx`):
   - シンプルなリスト形式の病院表示
   - **Grid レイアウト** (`grid-cols-[1fr_auto]`) で診療科と電話番号を配置
   - 診療科（左側）: 可変幅、複数行に自動折り返し
   - 電話番号（右側）: 固定幅、常に右上に配置
   - `opening_hours` カラムの内容を1行表示

3. **電話番号ボタンの実装**:
   - 緑色のクリック可能ボタン (`bg-success`)
   - `<a href="tel:${hospital.tel}">` で電話アプリ起動
   - `onClick={(e) => e.stopPropagation()}` で詳細ページへの遷移を防止
   - 視覚的に分かりやすいデザイン（ホバー効果、十分なタップ領域）

4. **コンテナ幅の調整**:
   - `/results` ページ: `max-w-4xl` → `max-w-5xl` (1024px)
   - `/search` ページ: `max-w-6xl` (1152px) - 検索フォームが多いため維持
   - ページの用途に応じた最適な幅設定

5. **レイアウトの統一**:
   - `/results` と `/search` の両ページで `HospitalListItem` を共通使用
   - 一貫したUI/UX体験を提供
   - `detailUrl` プロップで柔軟なURL指定が可能

6. **表示内容の最適化**:
   - **リスト表示** (`HospitalListItem`): `opening_hours` カラムのみ
   - **詳細ページ** (`HospitalCard`):
     - 優先: `hospital_schedules` テーブル（テーブル形式）
     - フォールバック: `opening_hours` カラム（テキスト形式）
     - 後方互換性を維持

**受け入れ基準:**
- ✅ 市町村リストが15自治体に削減
- ✅ 病院リストがシンプルで見やすいレイアウト
- ✅ 診療科が多くても電話番号が右上に固定
- ✅ 電話番号ボタンから直接電話をかけられる
- ✅ /results と /search のレイアウトが統一
- ✅ コンテナ幅が適切に調整
- ✅ 詳細ページで診療時間テーブルが優先表示
- ✅ 本番ビルド成功確認（npm run build）

#### ✅ チケット 011: AI診断機能実装（実験的）
- **実装日**: 2025年11月24日

**実装内容:**

1. **パッケージインストール**:
   - `openai` (^4.77.3) - OpenAI API クライアント

2. **環境変数設定**:
   ```bash
   # AI Diagnosis Feature (実験的機能)
   NEXT_PUBLIC_AI_DIAGNOSIS=true

   # OpenAI API Key
   OPENAI_API_KEY=sk-proj-...
   ```

3. **API エンドポイント** (`/src/app/api/symptoms/ai-diagnosis/route.ts`):
   - `POST /api/symptoms/ai-diagnosis` 実装
   - OpenAI API (`gpt-4o-mini`) との連携
   - 機能フラグ (`NEXT_PUBLIC_AI_DIAGNOSIS`) による制御
   - プロンプトテンプレート実装:
     - 考えられる可能性（3つまで）
     - 緊急度（高/中/低）
     - 推奨診療科
     - 受診時の注意点
     - 日常生活でのケア
   - エラーハンドリング（OpenAI API エラー、バリデーションエラー）

4. **AIDiagnosisButton コンポーネント** (`/src/components/SymptomResult/AIDiagnosisButton.tsx`):
   - クライアントコンポーネント (`'use client'`)
   - 機能フラグによる表示制御（無効時は `null` を返す）
   - 免責事項の強調表示:
     - 赤枠・赤文字での警告
     - 「医学的診断ではない」の明示
     - 「必ず医師の診察を受けてください」の強調
     - 緊急時の119番通報指示
   - 同意チェックボックス（必須）
   - LoadingSpinner によるAI分析中表示
   - 分析結果の表示（整形済み）
   - 再度の免責事項表示（結果下部）

5. **結果ページへの統合** (`/src/app/results/page.tsx`):
   - AIDiagnosisButton コンポーネント追加
   - QuestionnaireContext の `data` を渡す
   - 型の整合性確保（nullable フィールド対応）

6. **型定義の更新**:
   - AIDiagnosisButton の Props インターフェース定義
   - nullable 型 (`string | null`) 対応
   - 必須項目バリデーション実装

**受け入れ基準:**
- ✅ 開発環境でAI診断が動作する
- ✅ 本番環境ではボタンが表示されない（機能フラグで制御）
- ✅ 免責事項が明確に表示される（赤枠・赤文字）
- ✅ ユーザー同意が必須である（チェックボックス）
- ✅ AI分析結果が適切にフォーマットされる
- ✅ エラーハンドリングが適切に実装されている
- ✅ 環境変数で機能のON/OFFができる
- ✅ 本番ビルド成功確認（npm run build）

**注意事項:**
- この機能は**実験的**で、初期リリース時は**無効化推奨**
- 本番環境では `NEXT_PUBLIC_AI_DIAGNOSIS=false` を設定
- 法務レビュー完了後に有効化を検討
- OpenAI API 利用料金に注意（gpt-4o-mini 使用）
- レート制限を考慮した実装が必要

#### ✅ チケット 012: UI/UXブラッシュアップ
- **実装日**: 2025年11月24日

**実装内容:**

1. **グローバルエラーハンドリング** (`/src/app/error.tsx`):
   - クライアントコンポーネント (`'use client'`)
   - エラー情報の表示（開発環境のみエラー詳細を表示）
   - リトライボタン（`reset()` 関数）
   - トップページへ戻るボタン
   - 大きなフォント・明確なエラーメッセージ
   - `useEffect` でエラーログ記録

2. **グローバルローディング** (`/src/app/loading.tsx`):
   - LoadingSpinner コンポーネントの再利用
   - 大きなフォントで「読み込み中...」表示
   - 中央配置、視認性の高いデザイン

3. **アクセシビリティ向上スタイル** (`/src/app/globals.css`):
   - **タップハイライト色** (`-webkit-tap-highlight-color`)
   - **減速アニメーション対応** (`prefers-reduced-motion`)
   - **ハイコントラストモード対応** (`prefers-contrast: high`)
   - **スクリーンリーダー専用テキスト** (`.sr-only`)
   - **スキップリンク** (`.skip-link`) - キーボードナビゲーション
   - **フォーカス表示の強化** - すべてのインタラクティブ要素
   - **レスポンシブタイポグラフィ** - モバイル18px、デスクトップ18px、大文字モード24px以上

4. **レイアウトの改善** (`/src/app/layout.tsx`):
   - スキップリンク追加（「メインコンテンツへスキップ」）
   - セマンティックHTML (`<main id="main-content" role="main">`)
   - キーボードユーザーの利便性向上

5. **Header コンポーネントの改善** (`/src/components/Common/Header.tsx`):
   - `role="banner"` 追加
   - `aria-label` 追加（「病院ナビ南信 ホームページ」「病院を検索」）
   - `<nav role="navigation" aria-label="メインナビゲーション">` でナビゲーションを明示

6. **Footer コンポーネントの改善** (`/src/components/Common/Footer.tsx`):
   - `role="contentinfo"` 追加
   - `aria-label` 追加（「フッターナビゲーション」「利用規約」「お問い合わせ」）
   - 免責事項に `role="note" aria-label="免責事項"` 追加

**受け入れ基準:**
- ✅ WCAG AA レベルに適合（セマンティックHTML、ARIA属性、コントラスト比）
- ✅ 全てのボタンが48px × 48px以上（`min-h-tap` クラスで統一）
- ✅ フォントサイズが18px以上（レスポンシブタイポグラフィで保証）
- ✅ キーボードのみで全機能が操作できる（スキップリンク、フォーカス表示強化）
- ✅ エラー状態が適切に処理される（error.tsx で統一）
- ✅ Loading状態が視覚的に分かりやすい（loading.tsx で統一）
- ✅ 本番ビルド成功確認（npm run build）

**アクセシビリティ機能:**
- スキップリンク: Tab キーでフォーカス時に表示
- スクリーンリーダー対応: ARIA ラベル、role 属性
- ハイコントラストモード: 自動対応（`prefers-contrast: high`）
- 減速アニメーション: 自動対応（`prefers-reduced-motion: reduce`）
- レスポンシブタイポグラフィ: 画面サイズに応じて最適なフォントサイズ

#### ✅ チケット 014: 本番環境構築・デプロイ
- **実装日**: 2025年11月28日

**実装内容:**

1. **Vercelデプロイ**:
   - GitHub連携による自動デプロイ設定
   - 環境変数設定（Supabase, OpenAI, 管理者認証）

2. **環境変数（Vercel設定済み）**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_AI_DIAGNOSIS=true`

3. **AI診断機能**:
   - 本番環境で有効化
   - 限定ユーザーでテスト運用中

**受け入れ基準:**
- ✅ Vercelへのデプロイ成功
- ✅ 環境変数の設定完了
- ✅ 全機能の動作確認
- ✅ AI診断機能の有効化

#### ✅ リファクタリング・コード品質改善
- **実装日**: 2025年11月28日

**実装内容:**

1. **パフォーマンス向上**:
   - `HospitalListItem` の `memo` 化（不要な再レンダリング防止）

2. **共通コンポーネント作成**:
   - `ErrorBox` - 統一されたエラー表示
   - `LoadingBox` - 統一されたローディング表示

3. **ユーティリティ関数**:
   - `/src/lib/queryUtils.ts` 作成:
     - `parseCommaSeparatedList()` - カンマ区切り文字列→配列
     - `toCommaSeparatedString()` - 配列→カンマ区切り文字列
     - `toggleArrayItem()` - 配列トグル処理

4. **API統合**:
   - `/api/hospitals/search` を削除
   - `/api/search` に統合（重複排除）

5. **適用箇所**:
   - `/src/app/search/page.tsx` - ErrorBox, LoadingBox, queryUtils適用
   - `/src/app/results/page.tsx` - ErrorBox, LoadingBox適用
   - `/src/components/HospitalList/HospitalList.tsx` - ErrorBox, LoadingBox適用

**改善効果:**
- コード削減: 約50行
- 保守性向上: エラー/ローディング表示の統一
- パフォーマンス向上: リスト表示時の再レンダリング削減

#### ✅ お問い合わせページ追加
- **実装日**: 2025年11月28日

**実装内容:**

1. **お問い合わせページ** (`/src/app/contact/page.tsx`):
   - SNSダイレクトメッセージでの問い合わせ案内
   - Instagramボタン（グラデーション背景）
   - X (Twitter) ボタン（黒背景）
   - 返信期間の案内（1〜2日以内）
   - 注意事項（病院への直接問い合わせ推奨など）

2. **リンク先**:
   - Instagram: https://www.instagram.com/masayuki.kiwami/
   - X: https://x.com/masayuki_kiwami

3. **フッターリンク**:
   - 既存の「お問い合わせ」リンクから `/contact` へ遷移

**受け入れ基準:**
- ✅ お問い合わせページが表示される
- ✅ SNSリンクが正しく機能する
- ✅ レスポンシブデザイン対応
- ✅ フッターからアクセス可能

### ビルドテスト結果（2025年11月28日 - 本番デプロイ版）

```
✓ Compiled successfully in 20.1s
✓ Linting and checking validity of types
✓ Generating static pages (21/21)

Route (app)                             Size  First Load JS
┌ ○ /                                  647 B         121 kB
├ ○ /admin/dashboard                 1.27 kB         123 kB
├ ○ /admin/hospitals                 2.85 kB         125 kB
├ ƒ /admin/hospitals/[id]/edit           0 B         123 kB
├ ƒ /admin/hospitals/[id]/schedules  53.5 kB         175 kB
├ ○ /admin/hospitals/import          3.65 kB         126 kB
├ ○ /admin/hospitals/new                 0 B         123 kB
├ ○ /admin/login                     1.16 kB         123 kB
├ ○ /contact                             0 B         120 kB
├ ƒ /hospital/[id]                       0 B         120 kB
├ ○ /questionnaire                   3.49 kB         124 kB
├ ○ /results                         52.1 kB         173 kB
├ ○ /search                          3.21 kB         124 kB
├ ○ /terms                               0 B         120 kB
└ API Routes (5)

型エラー: なし
リントエラー: なし
```

### 全チケット完了状況

| チケット | 内容 | ステータス |
|---------|------|----------|
| 000 | プロジェクトセットアップ | ✅ 完了 |
| 001 | データベース設計・構築 | ✅ 完了 |
| 002 | 基本UI構築 | ✅ 完了 |
| 003 | アンケート機能実装 | ✅ 完了 |
| 004 | 症状説明文生成機能 | ✅ 完了 |
| 005 | 診療科マッピング機能 | ✅ 完了 |
| 006 | 病院検索・表示機能 | ✅ 完了 |
| 007 | 画像保存機能 | ✅ 完了 |
| 008 | 管理画面構築 | ✅ 完了 |
| 009 | 病院CRUD機能 | ✅ 完了 |
| 010 | CSVインポート機能 | ✅ 完了 |
| 011 | AI診断機能実装 | ✅ 完了（本番運用中） |
| 012 | UI/UXブラッシュアップ | ✅ 完了 |
| 013 | テスト実装 | 📋 未着手 |
| 014 | 本番環境構築・デプロイ | ✅ 完了 |

#### ✅ /results ページ UI改善（アコーディオン構成）
- **実装日**: 2025年12月11日

**実装内容:**

1. **Accordion コンポーネント作成** (`/src/components/Common/Accordion.tsx`):
   - 開閉アニメーション付きアコーディオン
   - `variant` プロップ: `default`, `highlight`, `gradient`
   - `badge` プロップ: バッジ表示（点滅アニメーション）
   - `description` プロップ: 説明文表示
   - `badgeColor` プロップ: `blue`, `green`, `orange`, `purple`
   - 開いた時のリング効果
   - ホバー時の背景色変化

2. **`/results` ページ構成変更**:
   - **推奨される診療科**（デフォルトで開く）
   - **症状まとめを見る**（閉じている）
     - ブルー系グラデーション背景
     - 「便利」バッジ（緑色）
     - 説明文:「病院で見せられる説明文を作成しました」
   - **AI診断を試す**（閉じている）
     - パープル〜ピンク〜オレンジのグラデーション背景
     - 「実験的」バッジ（紫色）
     - 説明文:「AIが症状を分析して可能性のある病気を提案します」
   - **対応している病院**（常に表示）

3. **モバイル固定フッター追加** (`/results` ページ):
   - 「ホーム」ボタン → トップページへ
   - 「やり直す」ボタン → アンケートページへ
   - PC用ボタンはPCのみ表示

4. **Footer コンポーネント更新**:
   - `/results` ページでスマホ時は通常フッターを非表示

5. **Header コンポーネント更新**:
   - `FontSizeToggle` をコメントアウト（必要時に復活可能）

6. **不要ファイル削除**:
   - `SliderTabs.tsx` を削除（不採用のため）

**受け入れ基準:**
- ✅ アコーディオンで情報を整理
- ✅ 病院リストがすぐに見える位置に表示
- ✅ 押したくなるデザイン（グラデーション、バッジ、説明文）
- ✅ モバイル固定フッター実装
- ✅ 本番ビルド成功確認（npm run build）

### ビルドテスト結果（2025年12月11日）

```
✓ Compiled successfully in 28.6s
✓ Generating static pages (22/22)

Route (app)                             Size  First Load JS
┌ ○ /                                  622 B         122 kB
├ ○ /admin/dashboard                 1.27 kB         124 kB
├ ○ /admin/hospitals                 2.85 kB         125 kB
├ ƒ /admin/hospitals/[id]/edit           0 B         124 kB
├ ƒ /admin/hospitals/[id]/schedules  53.5 kB         176 kB
├ ○ /admin/hospitals/import          3.65 kB         126 kB
├ ○ /admin/hospitals/new                 0 B         124 kB
├ ○ /admin/login                     1.16 kB         123 kB
├ ○ /contact                             0 B         121 kB
├ ƒ /hospital/[id]                     417 B         121 kB
├ ○ /questionnaire                   3.46 kB         124 kB
├ ○ /results                           53 kB         174 kB
├ ○ /search                          2.14 kB         123 kB
├ ○ /search/results                  2.67 kB         124 kB
└ ○ /terms                               0 B         121 kB

型エラー: なし
リントエラー: なし
```

---

**更新日**: 2025 年 12 月 11 日
**作成者**: Claude Code (AI Assistant)
