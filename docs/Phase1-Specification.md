# 病院ナビ南信 - システム仕様書

**バージョン**: 1.0
**作成日**: 2026年2月21日
**ステータス**: 本番運用中（Vercel）

---

## 1. システム概要

### 1.1 サービス名

**病院ナビ南信** ― 症状から探す 安心の病院ナビ

### 1.2 目的

「症状があるのに、どの病院に行けばよいか分からない」という長野県南信地域の住民の悩みを解決し、適切な医療機関への受診を促す Web サービス。

### 1.3 対象ユーザー

| 区分 | 詳細 |
|------|------|
| 主要層 | 40代〜シニア層（特に60代以上） |
| 特性 | スマートフォン操作が苦手、診療科の判断に迷う、症状説明が困難 |
| UX要件 | 大文字サイズ（18px以上）、高コントラスト、最小タップ領域48px x 48px |

### 1.4 対象地域

長野県南信地域（飯田市・下伊那郡）の14自治体:
飯田市、松川町、高森町、阿南町、阿智村、平谷村、根羽村、下条村、売木村、天龍村、泰阜村、喬木村、豊丘村、大鹿村

---

## 2. 技術スタック

### 2.1 フレームワーク・言語

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.5.7 | フレームワーク（App Router） |
| React | 19.1.0 | UIライブラリ |
| TypeScript | 5.x | 言語（strict モード） |
| Tailwind CSS | 3.4.17 | スタイリング |

### 2.2 外部サービス

| サービス | 用途 | 備考 |
|---------|------|------|
| Supabase | データベース（PostgreSQL） | プロジェクトID: `xsydqbczmzfufeywjfps`、東京リージョン |
| OpenAI API | AI診断機能 | gpt-4o-mini 使用 |
| Vercel | ホスティング・デプロイ | GitHub連携自動デプロイ |

### 2.3 主要ライブラリ

| ライブラリ | 用途 |
|-----------|------|
| `@supabase/supabase-js` | Supabase クライアント |
| `openai` | OpenAI API クライアント |
| `html2canvas` | 症状説明文の画像保存（動的インポート） |
| `papaparse` | CSV ファイル解析 |
| `xlsx` | Excel ファイル解析 |

---

## 3. ページ構成・画面仕様

### 3.1 公開ページ一覧

| パス | 画面名 | レンダリング | 説明 |
|------|--------|------------|------|
| `/` | ホーム | Server Component | サービス紹介、2つのCTAボタン |
| `/questionnaire` | アンケート | Client Component | 症状に関する7段階の質問フォーム |
| `/results` | 結果表示 | Client Component | 推奨診療科・症状まとめ・AI診断・対応病院 |
| `/search` | 病院検索 | Client Component | 診療科・市町村・キーワードで検索条件を選択 |
| `/search/results` | 検索結果 | Client Component | 検索結果の病院リスト |
| `/hospital/[id]` | 病院詳細 | Server Component | 病院の詳細情報・診療時間テーブル |
| `/contact` | お問い合わせ | Server Component | SNS（Instagram / X）での問い合わせ案内 |
| `/terms` | 利用規約 | Server Component | 全8条の利用規約 |

### 3.2 管理画面一覧

| パス | 画面名 | レンダリング | 説明 |
|------|--------|------------|------|
| `/admin/login` | ログイン | Client Component | パスワード認証 |
| `/admin/dashboard` | ダッシュボード | Server Component | 統計情報（病院数・市町村数・診療科数） |
| `/admin/hospitals` | 病院一覧 | Client Component | 全病院の一覧・編集・削除 |
| `/admin/hospitals/new` | 病院登録 | Server Component | 新規病院登録フォーム |
| `/admin/hospitals/[id]/edit` | 病院編集 | Server Component | 既存病院の編集フォーム |
| `/admin/hospitals/[id]/schedules` | 診療時間編集 | Client Component | 曜日別・午前午後の診療時間設定 |
| `/admin/hospitals/import` | インポート | Client Component | CSV/Excelの一括インポート・エクスポート |

---

## 4. ユーザーフロー

### 4.1 症状診断フロー

```
ホーム（/）
  │  「症状から病院を探す」ボタン（LocalStorageクリア）
  ▼
アンケート（/questionnaire）
  │  Q1: 気になる部位（複数選択）
  │  Q2: いつから（単一選択）
  │  Q3: どんな状態（複数選択）
  │  Q4: しこりの大きさ（Q3で「しこり・ふくらみ」選択時のみ）
  │  Q5: 持病（複数選択）
  │  Q6: 薬の服用（単一選択）
  │  Q7: 自由メモ（任意）
  │  →「まとめる」ボタン
  ▼
結果表示（/results）
  ├── 推奨される診療科（デフォルトで開いている）
  ├── 症状まとめ（アコーディオン）→ テキストコピー or 画像保存
  ├── AI診断（アコーディオン・実験的機能）
  └── 対応している病院リスト
         │  病院タップ
         ▼
      病院詳細（/hospital/[id]?from=results）
```

### 4.2 病院検索フロー

```
ホーム（/）またはヘッダー「検索」ボタン
  ▼
検索条件（/search）
  │  診療科チェックボックス（20種類）
  │  市町村チェックボックス（14自治体）
  │  キーワード入力（病院名）
  │  →「検索する」ボタン
  ▼
検索結果（/search/results?categories=...&cities=...&keyword=...）
  │  検索条件タグ表示 + 件数表示
  │  病院リスト → 病院タップ
  ▼
病院詳細（/hospital/[id]?categories=...&cities=...）
  │  「検索結果に戻る」→ 検索条件がURLパラメータで復元
  ▼
検索結果（条件保持された状態）
```

### 4.3 管理画面フロー

```
ログイン（/admin/login）
  │  パスワード認証 → Cookie設定（24時間有効）
  ▼
ダッシュボード（/admin/dashboard）
  ├── 病院一覧（/admin/hospitals）
  │     ├── 新規登録（/admin/hospitals/new）
  │     ├── 編集（/admin/hospitals/[id]/edit）
  │     ├── 診療時間編集（/admin/hospitals/[id]/schedules）
  │     └── 削除（確認モーダル付き）
  └── データインポート（/admin/hospitals/import）
        ├── CSVエクスポート（現データのダウンロード）
        └── CSV/Excelインポート（全件置換方式）
```

---

## 5. アンケート仕様

### 5.1 質問一覧

| # | 質問 | 選択方式 | 選択肢 | 必須 |
|---|------|---------|--------|------|
| Q1 | どこが気になりますか？ | 複数選択 | のど、むね、おなか、あし、うで、あたま、かお、せなか、こし、その他 | はい |
| Q2 | いつからですか？ | 単一選択 | 今日、2-3日前、1週間前、2週間前、1ヶ月以上前 | はい |
| Q3 | どんな状態ですか？ | 複数選択 | 痛い、しこり・ふくらみ、かゆい、赤い、はれている、熱がある、せきが出る、息苦しい、めまいがする、その他 | はい |
| Q4 | しこりの大きさ | 単一選択 | 小さい（〜1cm）、1〜3cm、3cm以上 | Q3で「しこり・ふくらみ」選択時のみ |
| Q5 | 持病はありますか？ | 複数選択 | なし、血圧、心臓、糖尿病、腎臓、肝臓、がん、アレルギー、その他 | はい |
| Q6 | 薬をのんでいますか？ | 単一選択 | のんでいる、のんでいない | はい |
| Q7 | 他に伝えたいこと | 自由入力 | テキストエリア | いいえ |

### 5.2 データ永続化

- **保存先**: `localStorage`（キー: `byouin-nabi-questionnaire-data`）
- **タイミング**: 質問への回答時に自動保存
- **復元**: ページロード時にLocalStorageから自動読み込み
- **クリア**: ホームの「症状から病院を探す」ボタン押下時、またはリセットボタン押下時

---

## 6. 診療科マッピングロジック

### 6.1 部位→診療科の基本マッピング

| 部位 | 推奨診療科 |
|------|-----------|
| のど | 耳鼻いんこう科、内科 |
| むね | 内科、循環器内科、呼吸器内科 |
| おなか | 内科、消化器内科、外科 |
| あし | 整形外科、内科 |
| うで | 整形外科、内科 |
| あたま | 内科、脳神経外科、神経内科 |
| かお | 皮膚科、耳鼻いんこう科、内科 |
| せなか | 整形外科、内科 |
| こし | 整形外科、内科 |
| その他 | 内科 |

### 6.2 症状による補正ルール

- **皮膚症状**（かゆい、赤い、はれている、しこり・ふくらみ）→ 皮膚科を追加
- **緊急症状**（息苦しい、熱がある、めまいがする）→ 内科を最優先に移動
- **重複除去**: 最終リストから重複を排除

---

## 7. 症状説明文生成

### 7.1 生成方式

テンプレートベースの純粋関数（AIは使用しない）。アンケート回答からテキストを組み立てる。

### 7.2 出力フォーマット

```
【症状について】
{部位}が気になります。
症状は「{症状リスト}」があります。

【いつから】
「{期間}」から続いています。

【状態】
・痛み: あり/なし
・しこり: あり/なし（大きさ: {サイズ}）
・発熱: あり/なし
・かゆみ: あり/なし
・赤み・はれ: あり/なし
・せき: あり/なし
・息苦しさ: あり/なし
・めまい: あり/なし

【持病・薬】
持病: {持病リスト}
薬: {服用状況}

【本人のメモ】
{自由入力テキスト}

━━━━━━━━━━━━━━━━━━━━
※この内容は参考情報です。診断ではありません。
　必ず医師の診察を受けてください。
━━━━━━━━━━━━━━━━━━━━
```

### 7.3 利用方法

- テキストコピー（クリップボードにコピー）
- 画像保存（html2canvasでPNG画像として端末に保存）

---

## 8. AI診断機能（実験的）

### 8.1 概要

| 項目 | 詳細 |
|------|------|
| 機能フラグ | `NEXT_PUBLIC_AI_DIAGNOSIS=true` で有効化 |
| モデル | OpenAI gpt-4o-mini |
| パラメータ | temperature: 0.7、max_tokens: 1000 |
| ステータス | 本番環境で有効化済み |

### 8.2 出力内容

1. 考えられる可能性（最大3つ）
2. 緊急度（高/中/低）
3. 推奨診療科
4. 受診時の注意点
5. 日常生活でのケア

### 8.3 安全対策

- **同意チェックボックス**: 免責事項への同意が必須
- **免責事項表示**: 赤枠・赤文字で「医学的診断ではない」旨を強調
- **結果下部にも再度表示**: 「必ず医師の診察を受けてください」
- **緊急時案内**: 119番通報の指示
- **医療法準拠**: 「診断」ではなく「参考情報」「受診の目安」と表現

---

## 9. API 仕様

### 9.1 パブリック API

#### GET `/api/hospitals`

全病院データを診療時間スケジュール付きで取得。

| 項目 | 詳細 |
|------|------|
| 認証 | 不要 |
| レスポンス | `{ hospitals: Hospital[] }` |
| ソート | 病院名の昇順 |
| JOIN | `hospital_schedules` テーブル |

#### GET `/api/search`

条件指定による病院検索。

| パラメータ | 型 | 説明 | Supabase演算子 |
|-----------|---|------|---------------|
| `categories` | カンマ区切り文字列 | 診療科（複数可） | `overlaps`（配列の重なり） |
| `cities` | カンマ区切り文字列 | 市町村（複数可） | `in`（IN句） |
| `keyword` | 文字列 | 病院名 | `ilike`（部分一致） |

レスポンス: `{ hospitals: Hospital[], count: number }`

#### POST `/api/symptoms/generate`

アンケート回答から症状説明文を生成。

| 項目 | 詳細 |
|------|------|
| 認証 | 不要 |
| リクエスト | `QuestionnaireData` |
| レスポンス | `{ description: string }` |
| バリデーション | location, duration, symptoms, conditions, medicine 必須 |

#### POST `/api/symptoms/ai-diagnosis`

AI による症状分析（実験的機能）。

| 項目 | 詳細 |
|------|------|
| 認証 | 不要（機能フラグで制御） |
| 前提 | `NEXT_PUBLIC_AI_DIAGNOSIS=true` |
| リクエスト | `{ location, duration, symptoms, conditions, medicine, memo }` |
| レスポンス | `{ analysis: string }` |
| 無効時 | 403エラー |

### 9.2 管理 API

#### POST `/api/admin/login`

| 項目 | 詳細 |
|------|------|
| リクエスト | `{ password: string }` |
| 認証方式 | `ADMIN_PASSWORD` 環境変数との比較 |
| 成功時 | Cookie `admin-auth=true` 設定（httpOnly, secure, sameSite=strict, maxAge=24h） |

#### POST `/api/admin/logout`

Cookie `admin-auth` を削除。

### 9.3 Server Actions（`src/app/admin/actions.ts`）

全アクションで `verifyAdminAuth()`（Cookie確認）を最初に実行。
データベース操作は `supabaseAdmin`（Service Role Key）を使用。

| アクション | 説明 | 後処理 |
|-----------|------|--------|
| `createHospital(formData)` | 病院新規登録 | `revalidatePath` → `redirect` |
| `updateHospital(id, formData)` | 病院更新 | `revalidatePath` → `redirect` |
| `deleteHospital(id)` | 病院削除 | `revalidatePath` |
| `importHospitals(formData)` | CSV/Excelインポート（全件置換） | `revalidatePath` |
| `exportHospitalsCSV()` | CSVエクスポート（UTF-8 BOM付き） | - |
| `getHospitalSchedules(id)` | 診療時間取得 | - |
| `updateHospitalSchedules(id, data)` | 診療時間一括更新（削除+挿入） | `revalidatePath` |

---

## 10. データベース設計

### 10.1 hospitals テーブル

| カラム | 型 | 制約 | 説明 |
|-------|---|------|------|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | |
| `name` | TEXT | NOT NULL | 病院名 |
| `category` | TEXT[] | NOT NULL | 診療科（配列） |
| `address` | TEXT | NOT NULL | 住所 |
| `tel` | TEXT | NOT NULL | 電話番号 |
| `city` | TEXT | NOT NULL | 市町村 |
| `opening_hours` | TEXT | nullable | 診療時間（テキスト、フォールバック用） |
| `google_map_url` | TEXT | nullable | Google Maps URL |
| `website` | TEXT | nullable | Webサイト URL |
| `note` | TEXT | nullable | 備考 |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | 作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | 更新日時 |

**インデックス**:
- `idx_hospitals_city` ON `city`
- `idx_hospitals_category` ON `category` USING GIN

### 10.2 hospital_schedules テーブル

| カラム | 型 | 制約 | 説明 |
|-------|---|------|------|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | |
| `hospital_id` | UUID | FK → hospitals(id) ON DELETE CASCADE | |
| `day_of_week` | INTEGER | CHECK (0-6) | 0=日, 1=月, ..., 6=土 |
| `morning_start` | TIME | nullable | 午前開始 |
| `morning_end` | TIME | nullable | 午前終了 |
| `afternoon_start` | TIME | nullable | 午後開始 |
| `afternoon_end` | TIME | nullable | 午後終了 |
| `is_closed` | BOOLEAN | DEFAULT false | 休診フラグ |
| `note` | TEXT | nullable | 備考（例: 第3土曜休診） |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | |
| `updated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | |

**制約**: UNIQUE(`hospital_id`, `day_of_week`)

### 10.3 セキュリティ（RLS）

#### hospitals テーブル（RLS 有効）

| ポリシー | 操作 | 条件 |
|---------|------|------|
| Public hospitals are viewable by everyone | SELECT | `true` |
| Authenticated users can insert hospitals | INSERT | `(select auth.role()) = 'authenticated'` |
| Authenticated users can update hospitals | UPDATE | `(select auth.role()) = 'authenticated'` |
| Authenticated users can delete hospitals | DELETE | `(select auth.role()) = 'authenticated'` |

#### hospital_schedules テーブル（RLS 有効）

| ポリシー | 操作 | 条件 |
|---------|------|------|
| Public schedules are viewable by everyone | SELECT | `true` |

#### 権限設計

| ロール | 権限 |
|-------|------|
| `anon` | SELECT のみ（読み取り専用） |
| `service_role` | 全権限（RLS バイパス） |

管理操作は全て `supabaseAdmin`（Service Role Key）経由で実行。

---

## 11. 認証・セキュリティ

### 11.1 管理画面認証

| 項目 | 詳細 |
|------|------|
| 方式 | パスワード + Cookie 認証 |
| Cookie名 | `admin-auth` |
| 有効期間 | 24時間 |
| Cookie属性 | httpOnly, secure（本番のみ）, sameSite=strict |
| 管理者数 | 1名 |
| ミドルウェア | `/admin/*` を保護（`/admin/login` は除外） |

### 11.2 Supabase クライアント

| クライアント | キー | 用途 |
|------------|-----|------|
| `supabase` | Anon Key | 公開ページでの読み取り |
| `supabaseAdmin` | Service Role Key | 管理操作（RLS バイパス） |

### 11.3 環境変数

| 変数 | 公開範囲 | 用途 |
|------|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | クライアント | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | クライアント | Supabase 匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバーのみ | 管理者用キー |
| `ADMIN_PASSWORD` | サーバーのみ | 管理画面パスワード |
| `OPENAI_API_KEY` | サーバーのみ | OpenAI API キー |
| `NEXT_PUBLIC_AI_DIAGNOSIS` | クライアント | AI診断の有効/無効フラグ |
| `KEEPALIVE_TOKEN` | サーバーのみ | keepaliveエンドポイント認証 |

---

## 12. デザインシステム

### 12.1 カラーパレット

| トークン | 値 | 用途 |
|---------|---|------|
| `--primary` | `#1e40af` | メインカラー（ボタン、リンク） |
| `--primary-dark` | `#1e3a8a` | ホバー時 |
| `--primary-light` | `#3b82f6` | アクセント |
| `--success` | `#16a34a` | 成功・電話ボタン |
| `--error` | `#dc2626` | エラー・警告 |
| `--warning` | `#f59e0b` | 注意 |
| `--purple` | `#9333ea` | AI診断・件数表示 |
| `--orange` | `#f97316` | 強調 |

### 12.2 タイポグラフィ

| 項目 | 値 |
|------|---|
| フォント | Noto Sans JP（400/500/700） |
| 基本サイズ | 18px（モバイル・デスクトップ共通） |
| 大文字モード | 24px以上（`body.large-text` クラス） |

### 12.3 レイアウト定数

| 項目 | 値 |
|------|---|
| ヘッダー高さ | 88px（スティッキー） |
| フッター高さ | 80px |
| 最小タップ領域 | 48px x 48px |
| コンテンツ最大幅 | 1024px（結果/詳細）、1152px（検索） |

### 12.4 アクセシビリティ

| 機能 | 実装 |
|------|------|
| スキップリンク | Tab キーで「メインコンテンツへスキップ」表示 |
| セマンティック HTML | `role="banner"`, `role="main"`, `role="contentinfo"` |
| ARIA属性 | 全ナビゲーション・ボタンに `aria-label` |
| フォーカス表示 | `outline: 3px solid var(--primary)` |
| 減速アニメーション | `prefers-reduced-motion` 対応 |
| ハイコントラスト | `prefers-contrast: high` 対応 |

### 12.5 アニメーション

| 名前 | 用途 | 時間 |
|------|------|------|
| `fadeIn` | モーダル背景 | 0.2s |
| `slideIn` | モーダル本体（上からスライド） | 0.3s |
| `bounceIn` | 成功モーダル | 0.5s |
| `slideInRight` | トースト通知（右から） | 0.3s |
| `fadeInUp` | カード・セクション | 0.3s |

---

## 13. コンポーネント構成

### 13.1 共通コンポーネント（`src/components/Common/`）

| コンポーネント | 説明 |
|-------------|------|
| `Header` | スティッキーヘッダー。ロゴ + 検索ボタン |
| `Footer` | フッター。お問い合わせ・利用規約リンク・免責事項。一部ページでスマホ非表示 |
| `Button` | primary / secondary バリアント。48px以上のタップ領域 |
| `Accordion` | CSS Grid行アニメーション。default / highlight / gradient バリアント |
| `MobileFixedFooter` | スマホ専用固定フッター（`md:hidden`）。ホーム + カスタム戻るボタン |
| `ConfirmModal` | 確認ダイアログ（warning / danger / info） |
| `SuccessModal` | 成功ダイアログ |
| `Toast` | 右上トースト通知（success / error / info）。自動クローズ |
| `ErrorBox` | エラー表示ボックス |
| `LoadingBox` | ローディング表示（sm / md / lg） |
| `ScrollToTop` | PCのみスクロールトップボタン |

### 13.2 機能別コンポーネント

| ディレクトリ | コンポーネント | 説明 |
|------------|-------------|------|
| `Questionnaire/` | `QuestionnaireForm` | 全質問フォーム・バリデーション |
| | `QuestionOption` | ボタン式選択肢（`aria-pressed` 対応） |
| `SymptomResult/` | `SymptomDescription` | 症状説明文表示・コピー機能 |
| | `RecommendedDepartments` | 推奨診療科リスト |
| | `ImageSaveButton` | html2canvas で画像保存（動的インポート） |
| | `AIDiagnosisButton` | AI診断ボタン・免責事項・同意チェック |
| `HospitalList/` | `HospitalList` | 診療科で病院検索・リスト表示 |
| | `HospitalListItem` | 病院リスト項目（`memo`化済み）。診療科タグ・電話ボタン |
| | `HospitalCard` | 病院詳細表示。住所・連絡先ボタン・診療時間テーブル |
| `Admin/` | `HospitalForm` | 新規登録・編集共用フォーム |
| `Layout/` | `AdminLayout` | 管理画面レイアウト（サイドバー + ヘッダー） |

---

## 14. 状態管理

### 14.1 QuestionnaireContext

アンケート回答データをアプリ全体で共有する React Context。

| API | 説明 |
|-----|------|
| `data: QuestionnaireData` | 現在のアンケートデータ |
| `isLoaded: boolean` | LocalStorage読み込み完了フラグ |
| `updateLocation(locations)` | 部位を更新 |
| `updateDuration(duration)` | 期間を更新 |
| `updateSymptoms(symptoms)` | 症状を更新 |
| `updateLumpSize(size)` | しこりサイズを更新 |
| `updateConditions(conditions)` | 持病を更新 |
| `updateMedicine(medicine)` | 薬を更新 |
| `updateMemo(memo)` | メモを更新 |
| `resetData()` | 全データリセット（LocalStorage削除含む） |

### 14.2 データフロー

```
localStorage ←→ QuestionnaireContext ←→ 各コンポーネント
                      │
                      ▼
              /api/symptoms/generate（説明文生成）
              /api/symptoms/ai-diagnosis（AI診断）
              getDepartments()（診療科マッピング）
```

---

## 15. マスターデータ

### 15.1 診療科一覧（20種類）

内科、外科、小児科、整形外科、皮膚科、耳鼻いんこう科、眼科、産婦人科、泌尿器科、脳神経外科、神経内科、循環器内科、呼吸器内科、消化器内科、心臓血管外科、精神科、リハビリテーション科、放射線科、アレルギー科、救急科

### 15.2 対象市町村（14自治体）

飯田市、松川町、高森町、阿南町、阿智村、平谷村、根羽村、下条村、売木村、天龍村、泰阜村、喬木村、豊丘村、大鹿村

---

## 16. CSV インポート/エクスポート仕様

### 16.1 CSV フォーマット

| ヘッダー名 | 必須 | 説明 |
|-----------|------|------|
| 病院名 | はい | |
| 診療科 | はい | カンマ区切り（例: `内科,外科`） |
| 住所 | はい | |
| 電話番号 | はい | |
| 市町村 | はい | |
| 診療時間 | いいえ | テキスト |
| Google Maps URL | いいえ | |
| Webサイト | いいえ | |
| 備考 | いいえ | |

### 16.2 インポート処理

1. ファイル形式判定（CSV: papaparse / Excel: xlsx）
2. 全行のバリデーション（必須項目チェック、診療科1つ以上）
3. 既存データの全削除
4. 有効データの一括INSERT（バッチ方式）
5. 結果返却（成功件数 + エラー行リスト）

### 16.3 エクスポート

- UTF-8 BOM 付き CSV（Excelでの文字化け防止）
- ファイル名: `hospitals_YYYY-MM-DD.csv`

---

## 17. パフォーマンス最適化

| 施策 | 詳細 | 効果 |
|------|------|------|
| html2canvas 動的インポート | 使用時のみ `await import()` | `/results` 53kB → 7.37kB（-86%） |
| admin/dashboard Server Component化 | クライアントJS不要 | First Load JS: 0B |
| Promise.all 並列化 | params/searchParams を並列解決 | ウォーターフォール解消 |
| HospitalListItem memo化 | デフォルト値をモジュールスコープに巻き上げ | 不要な再レンダリング防止 |
| バッチINSERT | ループ内個別INSERT → 一括INSERT | DB負荷軽減 |
| RLS initplan最適化 | `auth.role()` → `(select auth.role())` | 行ごとの再評価を回避 |
| Noto Sans JP next/font | Google Fonts の最適化ロード | FOUT防止 |
| Turbopack | 開発・ビルドの高速化 | - |

---

## 18. 医療法準拠事項

| 項目 | 対応 |
|------|------|
| 用語 | 「診断」「治療」を避け、「参考情報」「受診の目安」と表現 |
| 免責事項 | 全結果ページに「医師の診察を受けてください」を明記 |
| AI診断 | 「医学的診断ではない」を赤枠・赤文字で強調表示 |
| 同意 | AI診断実行前にチェックボックスで同意を取得 |
| 緊急時 | 119番通報の案内を記載 |
| 利用規約 | 第1条で「医療行為ではない」旨を赤字で明記 |
| データ保存 | 症状データはLocalStorageのみ保存、サーバー非保存 |

---

## 19. ビルド結果（2026年2月21日時点）

```
Route (app)                             Size  First Load JS
┌ /                                    622 B         121 kB
├ /admin/dashboard                       0 B         122 kB
├ /admin/hospitals                   2.85 kB         125 kB
├ /admin/hospitals/[id]/edit             0 B         124 kB
├ /admin/hospitals/[id]/schedules    53.5 kB         176 kB
├ /admin/hospitals/import            3.65 kB         126 kB
├ /admin/hospitals/new                   0 B         124 kB
├ /admin/login                       1.16 kB         123 kB
├ /contact                               0 B         121 kB
├ /hospital/[id]                       427 B         121 kB
├ /questionnaire                     3.46 kB         124 kB
├ /results                          7.37 kB         128 kB
├ /search                            2.14 kB         123 kB
├ /search/results                    2.72 kB         124 kB
└ /terms                                 0 B         121 kB

型エラー: なし
リントエラー: なし
Supabase Advisor: セキュリティ ERROR 0件 / パフォーマンス WARN 0件
```
