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

- [ ] `@supabase/auth-helpers-nextjs` パッケージをインストール
- [ ] Supabase ダッシュボードで Auth 設定（マジックリンク有効化、リダイレクトURL設定）
- [ ] `src/lib/supabase-auth.ts` — 認証用 Supabase クライアント（ブラウザ用、SSR用）
- [ ] Supabase Auth の メールテンプレート設定（日本語化）

### ログインページ

- [ ] `/login/page.tsx` — ログイン画面（Client Component）
  - マジックリンク: メールアドレス入力 → 「ログインリンクを送信」ボタン
  - メール + パスワード: 従来型ログインフォーム（サブオプション）
  - 「アカウントをお持ちでない方」→ `/signup` へのリンク
  - ゲスト利用案内: 「ログインせずに使う」リンク
  - シニア向け UI: 大きな入力フィールド、わかりやすい説明テキスト

### 新規登録ページ

- [ ] `/signup/page.tsx` — アカウント作成画面（Client Component）
  - メールアドレス入力
  - マジックリンク方式 or パスワード設定
  - 登録完了後 → プロフィール入力画面へ遷移

### プロフィール入力

- [ ] `/mypage/profile/page.tsx` — プロフィール編集画面
- [ ] `src/components/User/ProfileForm.tsx` — プロフィールフォーム
  - 表示名（テキスト、必須）
  - 年齢層（選択式: 〜39歳 / 40〜64歳 / 65〜74歳 / 75歳以上、必須）
  - 居住地区（ドロップダウン: 14市町村、必須）
  - 自家用車の有無（はい/いいえ、任意）
  - 移動補助（なし / 杖 / 車椅子、任意）
  - フォントサイズ（標準 / 大 / 特大）
- [ ] 初回ログイン時に自動リダイレクト（profiles レコードが未作成の場合）

### API ルート

- [ ] `GET/PUT /api/user/profile/route.ts` — プロフィール取得・更新
  - Supabase Auth トークン検証必須
  - GET: 自分のプロフィール取得
  - PUT: プロフィール更新

### Auth コールバック

- [ ] `/auth/callback/route.ts` — Supabase Auth のコールバック処理（マジックリンク / OAuth）

### 認証ガードコンポーネント

- [ ] `src/components/Auth/AuthGuard.tsx` — ログイン必須ページのラッパー
  - 未ログイン → `/login` へリダイレクト
  - ログイン済み + プロフィール未作成 → プロフィール入力へ
- [ ] `src/components/Auth/AuthProvider.tsx` — 認証状態の Context Provider

### ヘッダー改修

- [ ] ログイン状態で 👤 ユーザーアイコン表示（→ `/mypage`）
- [ ] 未ログイン時は「ログイン」リンク表示
- [ ] Phase 1 の管理者認証との共存を確認（`/admin` は Cookie 方式を維持）

### 確認

- [ ] マジックリンクでのログインフロー確認
- [ ] メール + パスワードでのログインフロー確認
- [ ] プロフィール作成・編集フロー確認
- [ ] 管理者認証（Cookie）との共存確認
- [ ] `npm run build` でエラーなし確認

---

## 技術メモ

- Supabase Auth と既存の admin Cookie 認証は完全に別系統
- マジックリンク推奨理由: 高齢者はパスワードの記憶・入力が困難
- profiles テーブルは `auth.users(id)` への FK で 1:1 関係
- フォントサイズ設定は profiles に保存し、Phase 1 の FontSizeToggle を有効化
