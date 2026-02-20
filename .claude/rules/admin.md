---
paths:
  - "src/app/admin/**"
  - "src/components/Admin/**"
  - "src/components/Layout/AdminLayout.tsx"
  - "middleware.ts"
---

# 管理画面ルール

## 認証システム

- Cookie ベース認証（`admin-token`）
- `/api/admin/login` - ログイン
- `/api/admin/logout` - ログアウト
- `middleware.ts` - `/admin` パスを保護（`/admin/login` は除外）
- 管理者1名のみ（`ADMIN_PASSWORD` 環境変数）

## 管理画面ページ構成

| パス | 内容 |
|------|------|
| `/admin/login` | ログイン画面（AdminLayout非表示） |
| `/admin/dashboard` | ダッシュボード |
| `/admin/hospitals` | 病院一覧（編集・削除・診療時間ボタン） |
| `/admin/hospitals/new` | 新規登録 |
| `/admin/hospitals/[id]/edit` | 編集（動的ルート） |
| `/admin/hospitals/[id]/schedules` | 診療時間編集 |
| `/admin/hospitals/import` | CSV/Excelインポート |

## Server Actions（`src/app/admin/actions.ts`）

- 全アクションで `verifyAdminAuth()` を実行
- `supabaseAdmin`（Service Role Key）を使用（RLS bypass）
- 成功時: `revalidatePath('/admin/hospitals')`

## HospitalForm コンポーネント

- 新規登録・編集共用フォーム
- `useTransition()` で非同期状態管理
- 入力フィールド: 病院名、診療科（カンマ区切り）、住所、市町村、電話番号、診療時間、Google Maps URL、Webサイト、備考

## CSV インポート/エクスポート

- **インポート**: CSV/Excel → パース → バリデーション → 全削除＋新規挿入（フル置換方式）
- **エクスポート**: UTF-8 BOM付き CSV（Excel文字化け防止）
- パッケージ: `papaparse`（CSV）, `xlsx`（Excel）
- ConfirmModal で確認 → LoadingSpinner → SuccessModal

## UI注意事項

- 管理画面は**デスクトップ管理者向け**サイズ（text-2xl, p-4）
- 公開ページはシニア向けサイズ（text-4xl, p-6）
- `/admin/login` では AdminLayout を非表示にする
