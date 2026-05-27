---
paths:
  - "src/app/admin/**"
  - "src/components/Admin/**"
  - "src/components/Layout/AdminLayout.tsx"
  - "middleware.ts"
---

# 管理画面ルール

## 認証システム

- Cookie ベース認証（`admin-auth`）
- `/api/admin/login` - ログイン
- `/api/admin/logout` - ログアウト
- `middleware.ts` - `/admin` パスを保護（`/admin/login` は除外）
- 管理者1名のみ（`ADMIN_PASSWORD` 環境変数）

## 管理画面ページ構成

| パス | 内容 |
|------|------|
| `/admin/login` | ログイン画面（AdminLayout非表示） |
| `/admin/dashboard` | ダッシュボード（Server Component、クライアントJS 0B） |
| `/admin/hospitals` | 病院一覧（編集・削除・診療時間ボタン） |
| `/admin/hospitals/new` | 新規登録 |
| `/admin/hospitals/[id]/edit` | 編集（動的ルート） |
| `/admin/hospitals/[id]/schedules` | 診療時間編集 |
| `/admin/hospitals/import` | CSV/Excelインポート |
| `/admin/transport` 系 | 交通サービス CRUD + インポート（Phase 2） |
| `/admin/facilities` 系 | お出かけ施設 CRUD + インポート（Phase 2） |
| `/admin/emergency-rotations` | 救急ローテーション一覧（月選択タブ + 種別フィルタ + 月次全削除、Phase 2.1） |
| `/admin/emergency-rotations/new` | 新規登録 |
| `/admin/emergency-rotations/[id]/edit` | 編集 |
| `/admin/emergency-rotations/import` | CSV/Excel 月単位インポート |
| `/admin/emergency-rotations/generate-night` | 夜間急患診療所の月次自動生成 |

## Server Actions（`src/app/admin/actions.ts`）

- 全アクションで `verifyAdminAuth()` を実行
- `supabaseAdmin`（Service Role Key）を使用（RLS bypass）
- 成功時: `revalidatePath('/admin/hospitals')`

## フォームコンポーネントの共通パターン

`HospitalForm` / `EmergencyRotationForm` / `TransportForm` / `FacilityForm` 全てで以下を踏襲:

- 新規登録・編集を 1 コンポーネントで兼用（`mode: 'create' | 'edit'` プロップ）
- `useTransition()` で非同期状態管理
- `defaultValue` でレコードからプリフィル
- Server Action は `bind(null, id)` パターンで編集用にラップ
- 成功時は Server Action 内で `redirect()`、エラーは form 内に表示

### EmergencyRotationForm の固有仕様

- 種別が `duty_pharmacy` / `night_emergency` のとき `department` 入力欄を disabled に
- `hospital_id` セレクト → `facility_name` を自動入力（編集可）
- `source_month` は `duty_date` から自動算出（フォーム送信時に Server Action 内で導出）

## CSV インポート/エクスポート

- **インポート（フル置換）**: 病院など全件管理対象。CSV/Excel → パース → バリデーション → 全削除＋バッチINSERT
- **インポート（月単位置換）**: 救急ローテーションで採用。`source_month` フィルタで同月分だけを全削除 → バッチINSERT
- **エクスポート**: UTF-8 BOM付き CSV（Excel文字化け防止）
- パッケージ: `papaparse`（CSV）, `xlsx`（Excel）
- ConfirmModal で確認 → LoadingSpinner → SuccessModal / Toast 通知

### CSV テンプレート配置

`public/templates/` に配置:
- `emergency-rotations-template.csv` — 空テンプレ（4 種別の記入例 4 行付き、要削除）
- `emergency-rotations-sample.csv` — 2026 年 6 月実データ

### 月次自動生成

- 救急ローテーションの夜間急患（365 日担当）は `generateNightEmergencyRotations` で月単位一括生成
- `@holiday-jp/holiday_jp` で日曜・祝日（振替休日含む）を判定し、昼間枠を自動付与

## UI注意事項

- 管理画面は**デスクトップ管理者向け**サイズ（text-2xl, p-4）
- 公開ページはシニア向けサイズ（text-4xl, p-6）
- `/admin/login` では AdminLayout を非表示にする
