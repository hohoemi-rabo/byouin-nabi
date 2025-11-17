# 病院ナビ南信 (Byouin-Nabi) - Claude Code ガイド

## プロジェクト概要

**プロジェクト名**: 病院ナビ南信 (Byouin-Nabi)  
**サブタイトル**: 症状から探す 安心の病院ナビ  
**プロジェクトステージ**: MVP 開発フェーズ  
**プロジェクトディレクトリ**: `/home/masayuki/NextJs/byouin-nabi`

### ミッション

「症状があるのに、どの病院に行けばよいか分からない」という地域住民の悩みを解決し、適切な医療機関への受診を促す Web サービス

### ターゲットユーザー

- 主要層: 40 代～シニア層（特に 60 代以上）
- 特性: スマートフォン操作が苦手、診療科の判断に迷う、症状説明が困難
- UX 要件: 大文字サイズ（18px 以上、大文字モード 24px 以上）、高コントラスト、最小タップ領域 48px × 48px

---

## 技術スタック

### コア依存関係

| 技術 | バージョン | 用途 | 備考 |
|------|-----------|------|------|
| Next.js | 15.5.6 | フロントエンドフレームワーク | App Router を使用（Pages Router ではない） |
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
| eslint-config-next | 15.5.6 | Next.js 公式 ESLint 設定 |
| @types/node | 20.x | Node.js 型定義 |
| @types/react | 19.x | React 型定義 |
| @types/react-dom | 19.x | React DOM 型定義 |

### 外部サービス（実装予定）

| サービス | 用途 | ステータス | 備考 |
|---------|------|----------|------|
| Supabase | データベース・認証 | 設定済み（.mcp.json）| PostgreSQL ベース |
| OpenAI API | AI 診断機能 | オプション（実験的） | GPT-4o-mini、初期リリース時は無効化 |
| html2canvas | 画像生成 | 実装予定 | 症状説明文のスクリーンショット化 |

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

## 環境変数設定（.env.local）

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# OpenAI (実験的機能用)
# 初期リリース: 設定せず（機能無効化状態）
# テスト環境でのみ設定
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_AI_DIAGNOSIS=false  # 本番では必ず false

# Google Maps (将来の URL 生成用)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...  # オプション
```

**セキュリティ注意:**

- API キーは `.env.local` に記載し、`.gitignore` に追加
- `NEXT_PUBLIC_*` プリフィックスは、クライアント側で必要な場合のみ使用
- Server-only シークレット: プリフィックスなし（`OPENAI_API_KEY` など）

---

## 実装時の注意点

### AI 診断機能の取り扱い

この機能は **実験的** で、初期リリース時は **無効化** されます。

**有効化の条件:**

- 十分な法務・医療アドバイザーレビュー完了
- 免責事項・ユーザー同意フロー実装完了
- テスト環境での十分な動作確認

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

## 今後の拡張予定

### Phase 2: 管理機能
- 管理者ログイン画面
- 病院 CRUD 操作
- CSV/Excel インポート

### Phase 3: AI 診断機能
- OpenAI API 連携
- UI の追加（「AI 診断を試す」ボタン）
- 免責事項の表示

### Phase 4: 本番化準備
- パフォーマンス最適化
- セキュリティレビュー
- ブラウザ互換性テスト

### Phase 5: 運用・監視
- エラーログ収集（Sentry 等の導入検討）
- ユーザー分析（Google Analytics 等）
- 定期的なセキュリティ監査

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

**更新日**: 2025 年 1 月 17 日  
**作成者**: Claude Code (AI Assistant)
