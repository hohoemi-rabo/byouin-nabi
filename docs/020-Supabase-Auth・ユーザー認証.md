# 020: Supabase Auth・ユーザー認証

**フェーズ**: Phase 2-B
**優先度**: 高（ユーザー機能の前提）
**依存**: 015（profiles テーブル作成後）
**参照**: Phase2-Requirements.md セクション 6.1, 6.2

---

## 概要

Supabase Auth による一般ユーザー認証を導入する。Phase 1 の管理者認証（Cookie方式）とは完全に別系統。マジックリンク認証をメインとし、高齢者のパスワード入力負担を軽減。

---

## Todo

### パッケージ・設定

- [x] `@supabase/ssr` パッケージをインストール（`@supabase/auth-helpers-nextjs` は非推奨のため代替）
- [ ] Supabase ダッシュボードで Auth 設定（マジックリンク有効化、リダイレクトURL設定）
- [x] `src/lib/supabase-browser.ts` — createBrowserClient（Client Components 用）
- [x] `src/lib/supabase-server.ts` — createServerClient（Server Components / API Routes 用）
- [ ] Supabase Auth の メールテンプレート設定（日本語化）

### ミドルウェア拡張

- [x] `middleware.ts` — Supabase auth トークンリフレッシュ + admin Cookie auth を共存
- [x] matcher: `/admin/:path*`, `/mypage/:path*`, `/login`, `/signup`, `/auth/:path*`, `/api/user/:path*`

### ログインページ

- [x] `/login/page.tsx` — マジックリンク（メイン）+ メール+パスワード（サブ）
- [x] ゲスト利用案内、サインアップリンク
- [x] シニア向け UI（18px+, 48px タップ領域, rounded-xl）

### 新規登録ページ

- [x] `/signup/page.tsx` — マジックリンク or パスワード登録
- [x] 登録後 → `/mypage/profile` へ遷移

### Auth コールバック

- [x] `/auth/callback/route.ts` — PKCE exchangeCodeForSession

### 認証コンテキスト

- [x] `src/context/AuthContext.tsx` — user, profile, isLoading, signOut
- [x] `src/app/layout.tsx` に AuthProvider を追加
- [x] `src/components/Auth/AuthGuard.tsx` — ログイン必須ラッパー（未ログイン→/login, プロフィール未作成→/mypage/profile）

### ヘッダー改修

- [x] `src/components/Common/HeaderAuthNav.tsx` — Client Component（👤 or ログイン）
- [x] Header.tsx に HeaderAuthNav を追加（Server Component のまま維持）

### プロフィール

- [x] `src/components/User/ProfileForm.tsx` — 表示名, 年齢層, 居住地区, 自家用車, 移動補助, 文字サイズ
- [x] `/mypage/page.tsx` — マイページトップ（プロフィール表示 + 準備中セクション）
- [x] `/mypage/profile/page.tsx` — プロフィール編集
- [x] `GET/PUT /api/user/profile/route.ts` — プロフィール API（upsert）

### 確認

- [ ] マジックリンクでのログインフロー確認（Supabase Auth 設定後）
- [ ] メール + パスワードでのログインフロー確認
- [ ] プロフィール作成・編集フロー確認
- [ ] 管理者認証（Cookie）との共存確認
- [x] `npm run build` でエラーなし確認

---

## 技術メモ

- Supabase Auth と既存の admin Cookie 認証は完全に別系統
- マジックリンク推奨理由: 高齢者はパスワードの記憶・入力が困難
- profiles テーブルは `auth.users(id)` への FK で 1:1 関係
- フォントサイズ設定は profiles に保存し、Phase 1 の FontSizeToggle を有効化
