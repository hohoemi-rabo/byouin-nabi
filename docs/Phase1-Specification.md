# 病院ナビ南信 - システム仕様書

**バージョン**: 2.0
**作成日**: 2026年2月21日
**最終更新日**: 2026年3月29日
**ステータス**: 本番運用中（Vercel）

---

## 目次

1. [システム概要](#1-システム概要)
2. [技術スタック](#2-技術スタック)
3. [プロジェクト構造](#3-プロジェクト構造)
4. [ページ構成・画面仕様](#4-ページ構成画面仕様)
5. [ユーザーフロー](#5-ユーザーフロー)
6. [フロントエンド設計](#6-フロントエンド設計)
7. [バックエンド設計](#7-バックエンド設計)
8. [データベース設計](#8-データベース設計)
9. [認証・セキュリティ](#9-認証セキュリティ)
10. [TypeScript型定義](#10-typescript型定義)
11. [状態管理](#11-状態管理)
12. [アンケート仕様](#12-アンケート仕様)
13. [診療科マッピングロジック](#13-診療科マッピングロジック)
14. [症状説明文生成](#14-症状説明文生成)
15. [AI診断機能（実験的）](#15-ai診断機能実験的)
16. [コンポーネント詳細仕様](#16-コンポーネント詳細仕様)
17. [デザインシステム](#17-デザインシステム)
18. [レスポンシブデザイン戦略](#18-レスポンシブデザイン戦略)
19. [ナビゲーション設計](#19-ナビゲーション設計)
20. [エラーハンドリング戦略](#20-エラーハンドリング戦略)
21. [パフォーマンス最適化](#21-パフォーマンス最適化)
22. [アクセシビリティ](#22-アクセシビリティ)
23. [医療法準拠事項](#23-医療法準拠事項)
24. [マスターデータ](#24-マスターデータ)
25. [CSV インポート/エクスポート仕様](#25-csv-インポートエクスポート仕様)
26. [ビルド結果](#26-ビルド結果)

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
| React | 19.1.0 | UIライブラリ（Server Components 対応） |
| TypeScript | 5.x | 言語（`strict: true`） |
| Tailwind CSS | 3.4.17 | ユーティリティファーストCSS |

### 2.2 外部サービス

| サービス | 用途 | 備考 |
|---------|------|------|
| Supabase | データベース（PostgreSQL） | プロジェクトID: `xsydqbczmzfufeywjfps`、東京リージョン |
| OpenAI API | AI診断機能 | gpt-4o-mini 使用 |
| Vercel | ホスティング・デプロイ | GitHub連携自動デプロイ |

### 2.3 主要ライブラリ

| ライブラリ | 用途 | 備考 |
|-----------|------|------|
| `@supabase/supabase-js` | Supabase クライアント | Anon + Service Role の2クライアント構成 |
| `openai` | OpenAI API クライアント | AI診断機能で使用 |
| `html2canvas` | 症状説明文の画像保存 | 動的インポート（使用時のみロード） |
| `papaparse` | CSV ファイル解析 | UTF-8 対応 |
| `xlsx` | Excel ファイル解析 | .xlsx/.xls 対応 |

### 2.4 開発ツール

| ツール | 用途 |
|-------|------|
| Turbopack | 開発サーバーの高速化（`next dev --turbopack`） |
| ESLint | コード品質チェック |
| PostCSS | Tailwind CSS のビルド |

---

## 3. プロジェクト構造

### 3.1 ディレクトリ構成

```
byouin-nabi/
├── docs/                          # チケット・仕様書
│   ├── README.md                  # チケット管理ガイド
│   ├── Phase1-Specification.md    # 本仕様書
│   └── 000〜014-*.md             # 個別チケットファイル
├── public/                        # 静的ファイル
├── supabase/
│   └── migrations/                # SQLマイグレーションファイル
├── src/
│   ├── app/                       # App Router ルート
│   │   ├── layout.tsx             # ルートレイアウト（Noto Sans JP、Header/Footer）
│   │   ├── page.tsx               # ホーム（Server Component）
│   │   ├── loading.tsx            # グローバルローディング
│   │   ├── error.tsx              # グローバルエラー（Client Component）
│   │   ├── globals.css            # Tailwind + カスタムCSS変数
│   │   ├── questionnaire/
│   │   │   └── page.tsx           # アンケートフォーム
│   │   ├── results/
│   │   │   └── page.tsx           # 結果表示（推奨診療科・症状まとめ・AI・病院リスト）
│   │   ├── search/
│   │   │   ├── page.tsx           # 検索条件（診療科・市町村・キーワード）
│   │   │   └── results/
│   │   │       └── page.tsx       # 検索結果リスト
│   │   ├── hospital/
│   │   │   └── [id]/
│   │   │       └── page.tsx       # 病院詳細（Server Component）
│   │   ├── contact/
│   │   │   └── page.tsx           # お問い合わせ（SNS案内）
│   │   ├── terms/
│   │   │   └── page.tsx           # 利用規約
│   │   ├── admin/
│   │   │   ├── layout.tsx         # 管理画面レイアウト（サイドバー + ヘッダー）
│   │   │   ├── actions.ts         # Server Actions（CRUD・インポート・エクスポート）
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # パスワードログイン
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # 統計ダッシュボード（Server Component）
│   │   │   └── hospitals/
│   │   │       ├── page.tsx       # 病院一覧（CRUD操作）
│   │   │       ├── new/
│   │   │       │   └── page.tsx   # 病院新規登録
│   │   │       ├── [id]/
│   │   │       │   ├── edit/
│   │   │       │   │   └── page.tsx   # 病院編集
│   │   │       │   └── schedules/
│   │   │       │       └── page.tsx   # 診療時間編集
│   │   │       └── import/
│   │   │           └── page.tsx   # CSV/Excelインポート
│   │   └── api/
│   │       ├── hospitals/
│   │       │   └── route.ts       # GET: 全病院取得
│   │       ├── search/
│   │       │   └── route.ts       # GET: 条件検索
│   │       ├── symptoms/
│   │       │   ├── generate/
│   │       │   │   └── route.ts   # POST: 症状説明文生成
│   │       │   └── ai-diagnosis/
│   │       │       └── route.ts   # POST: AI診断
│   │       ├── admin/
│   │       │   ├── login/
│   │       │   │   └── route.ts   # POST: 管理者ログイン
│   │       │   └── logout/
│   │       │       └── route.ts   # POST: 管理者ログアウト
│   │       └── keepalive/
│   │           └── route.ts       # GET: ヘルスチェック
│   ├── components/
│   │   ├── Common/                # 共通UIコンポーネント
│   │   │   ├── Header.tsx         # スティッキーヘッダー
│   │   │   ├── Footer.tsx         # フッター（条件付き表示）
│   │   │   ├── Button.tsx         # ボタン（primary/secondary）
│   │   │   ├── Accordion.tsx      # アコーディオン（3バリアント）
│   │   │   ├── MobileFixedFooter.tsx  # モバイル固定フッター
│   │   │   ├── ConfirmModal.tsx   # 確認ダイアログ
│   │   │   ├── SuccessModal.tsx   # 成功ダイアログ
│   │   │   ├── Toast.tsx          # トースト通知
│   │   │   ├── ErrorBox.tsx       # エラー表示
│   │   │   ├── LoadingBox.tsx     # ローディング表示
│   │   │   ├── LoadingSpinner.tsx # スピナー
│   │   │   ├── ScrollToTop.tsx    # スクロールトップボタン
│   │   │   ├── StartQuestionnaireButton.tsx  # アンケート開始ボタン
│   │   │   └── FontSizeToggle.tsx # 文字サイズ切替（未使用・将来用）
│   │   ├── Questionnaire/         # アンケート機能
│   │   │   ├── QuestionnaireForm.tsx  # 7段階質問フォーム
│   │   │   └── QuestionOption.tsx     # 選択肢ボタン
│   │   ├── SymptomResult/         # 結果表示機能
│   │   │   ├── SymptomDescription.tsx     # 症状説明文
│   │   │   ├── RecommendedDepartments.tsx # 推奨診療科
│   │   │   ├── ImageSaveButton.tsx        # 画像保存
│   │   │   └── AIDiagnosisButton.tsx      # AI診断
│   │   ├── HospitalList/          # 病院リスト機能
│   │   │   ├── HospitalList.tsx       # 病院リスト（自動検索）
│   │   │   ├── HospitalListItem.tsx   # リスト項目（memo化）
│   │   │   └── HospitalCard.tsx       # 病院詳細カード
│   │   ├── Admin/                 # 管理画面
│   │   │   ├── HospitalForm.tsx       # 病院登録/編集フォーム
│   │   │   ├── AdminSidebar.tsx       # サイドバーナビ
│   │   │   └── AdminHeader.tsx        # 管理画面ヘッダー
│   │   └── Layout/                # レイアウト
│   │       └── AdminLayout.tsx        # 管理画面レイアウト
│   ├── context/
│   │   └── QuestionnaireContext.tsx    # アンケートデータ Context + Provider
│   ├── lib/
│   │   ├── supabase.ts            # 公開用 Supabase クライアント（Anon Key）
│   │   ├── supabase-admin.ts      # 管理用 Supabase クライアント（Service Role Key）
│   │   ├── departmentMapping.ts   # 部位→診療科マッピング + 補正ロジック
│   │   ├── generateSymptomDescription.ts  # テンプレートベース症状説明文生成
│   │   ├── queryUtils.ts          # URL パラメータ・配列ユーティリティ
│   │   └── masterData.ts          # 診療科20種 + 市町村14自治体のマスターリスト
│   └── types/
│       ├── hospital.ts            # Hospital, HospitalSchedule, API レスポンス型
│       └── questionnaire.ts       # QuestionnaireData + 選択肢定数
├── middleware.ts                   # 管理画面認証ミドルウェア
├── next.config.ts                 # Next.js 設定
├── tailwind.config.ts             # Tailwind CSS カスタム設定
├── tsconfig.json                  # TypeScript 設定（strict: true）
├── package.json                   # 依存関係・スクリプト
└── CLAUDE.md                      # AI開発アシスタント向けプロジェクト説明
```

### 3.2 パスエイリアス

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`@/components/Common/Button` → `./src/components/Common/Button`

### 3.3 npmスクリプト

```bash
npm run dev     # 開発サーバー（Turbopack）→ http://localhost:3000
npm run build   # 本番ビルド
npm start       # 本番サーバー起動
npm run lint    # ESLint 実行
```

---

## 4. ページ構成・画面仕様

### 4.1 公開ページ一覧

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

### 4.2 管理画面一覧

| パス | 画面名 | レンダリング | 説明 |
|------|--------|------------|------|
| `/admin/login` | ログイン | Client Component | パスワード認証 |
| `/admin/dashboard` | ダッシュボード | Server Component | 統計情報（病院数・市町村数・診療科数） |
| `/admin/hospitals` | 病院一覧 | Client Component | 全病院の一覧・編集・削除 |
| `/admin/hospitals/new` | 病院登録 | Server Component | 新規病院登録フォーム |
| `/admin/hospitals/[id]/edit` | 病院編集 | Server Component | 既存病院の編集フォーム |
| `/admin/hospitals/[id]/schedules` | 診療時間編集 | Client Component | 曜日別・午前午後の診療時間設定 |
| `/admin/hospitals/import` | インポート | Client Component | CSV/Excelの一括インポート・エクスポート |

### 4.3 各ページの実装詳細

#### ホーム（`/`）

- **タイプ**: Server Component（クライアントJSはStartQuestionnaireButtonのみ）
- **セクション構成**:
  1. **ヒーローセクション**: キャッチコピー + 2つのCTA（症状から探す / エリアから探す）
  2. **特徴紹介**: 3カード（簡単アンケート / 最適な病院 / 症状説明）
  3. **使い方ガイド**: 3ステップの番号付きガイド
  4. **CTAセクション**: ページ下部にCTAボタンを再配置
- **StartQuestionnaireButton**: クリック時にLocalStorageをクリアし `/questionnaire` へ遷移

#### アンケート（`/questionnaire`）

- **タイプ**: Server Component（ページ）→ `QuestionnaireProvider` でラップ → `QuestionnaireForm`（Client Component）
- **メタデータ**: カスタムタイトル・description設定
- **詳細**: [12. アンケート仕様](#12-アンケート仕様) を参照

#### 結果表示（`/results`）

- **タイプ**: Client Component（`QuestionnaireProvider` でラップ）
- **状態**: `description`（生成済み説明文）、`loading`、`error`
- **初期化フロー**:
  1. Context の `isLoaded` を待機（LocalStorage ハイドレーション）
  2. データバリデーション（location & duration 必須）→ 不足時は `/questionnaire` へリダイレクト
  3. `/api/symptoms/generate` を呼び出して説明文を生成
- **表示構成（Accordion）**:
  1. **推奨される診療科**（デフォルトで開いた状態、`default` バリアント）
  2. **症状まとめを見る**（`highlight` バリアント、緑色バッジ）
  3. **AI診断を試す**（`gradient` バリアント、紫色バッジ）
- **病院リスト**: `HospitalList` コンポーネント（推奨診療科で自動検索）
- **モバイル**: `MobileFixedFooter`（やり直す + ホーム）、通常ボタンは `md:hidden` で非表示

#### 病院検索（`/search`）

- **タイプ**: Client Component（`Suspense` でラップ）
- **URLパラメータ復元**: `useSearchParams()` で前回の検索条件を復元
- **状態管理**: `selectedDepartments[]`、`selectedCities[]`、`keyword`
- **UIセクション**:
  - キーワード入力フィールド
  - 診療科チェックボックスグリッド（2-4列レスポンシブ）
  - 市町村チェックボックスグリッド（2-4列レスポンシブ）
- **検索実行**: `toCommaSeparatedString()` でURL構築 → `/search/results?categories=...&cities=...&keyword=...` に遷移
- **バリデーション**: 検索条件未入力時は「検索条件が入力されていません」表示 + 検索ボタン無効化
- **最適化**: `useCallback` でトグルハンドラーの再生成を防止

#### 検索結果（`/search/results`）

- **タイプ**: Client Component（`Suspense` でラップ）
- **データフェッチ**: `useEffect` で `/api/search?...` を呼び出し
- **AbortController**: コンポーネントアンマウント時にフェッチをキャンセル（レース条件防止）
- **表示構成**:
  - 検索条件バッジ（診療科・市町村・キーワード）
  - 件数表示（紫色ボックス）
  - 病院リスト or 「該当なし」メッセージ
- **ナビゲーション**: 「条件を変更する」ボタン + モバイル固定フッター
- **リダイレクト**: URLパラメータなしでアクセス時は `/search` へリダイレクト

#### 病院詳細（`/hospital/[id]`）

- **タイプ**: Server Component（`params: Promise<{ id: string }>`）
- **データフェッチ**: Supabase から病院データ + `hospital_schedules` リレーションを取得
- **コンテキスト判定**: `searchParams.from` で遷移元を判定
  - `from=results` → 「症状結果に戻る」（`/results` へ）
  - それ以外 → 「検索結果に戻る」（`/search?categories=...&cities=...` をURLパラメータ保持）
- **404対応**: 病院が存在しない場合 `notFound()` を呼び出し
- **表示**: `HospitalCard` コンポーネントでフル詳細表示

#### 管理画面ログイン（`/admin/login`）

- **タイプ**: Client Component
- **状態**: `password`、`error`、`loading`
- **フロー**: パスワード入力 → `/api/admin/login` POST → 成功時 `/admin/dashboard` へリダイレクト
- **UI**: 中央配置カード（max-w-md）、エラー表示、ローディングボタン

#### 管理画面ダッシュボード（`/admin/dashboard`）

- **タイプ**: Server Component（**クライアントJS 0B**）
- **データフェッチ**: Supabase から全病院を取得
- **統計計算**: 病院数・ユニーク市町村数・ユニーク診療科数
- **表示**: 3つの統計カード + クイックアクション + 市町村/診療科一覧

#### 病院一覧（`/admin/hospitals`）

- **タイプ**: Client Component（`Suspense` フォールバック付き）
- **状態**: `hospitals[]`、`loading`、`error`、`showConfirmModal`、`showSuccessModal`、`showToast`、`hospitalToDelete`、`isPending`
- **機能**:
  - マウント時に `/api/hospitals` をフェッチ
  - URLパラメータ `success=created|updated` でトースト通知表示
  - 各病院に3アクションボタン: ✏️ 編集 / 🕒 診療時間 / 🗑️ 削除
- **削除フロー**: `ConfirmModal` → `deleteHospital` Server Action → 再フェッチ → `SuccessModal`

#### 病院登録・編集

- **新規登録（`/admin/hospitals/new`）**: Server Component → `HospitalForm`（mode="create"）+ `createHospital` Action
- **編集（`/admin/hospitals/[id]/edit`）**: Server Component → Supabase フェッチ → `HospitalForm`（mode="edit"）+ `updateHospital.bind(null, id)` Action
- **404対応**: 病院が存在しない場合 `notFound()`

#### インポート（`/admin/hospitals/import`）

- **タイプ**: Client Component
- **機能**: CSV/Excel ファイルアップロード → バリデーション → 全件置換インポート
- **エクスポート**: UTF-8 BOM付きCSVダウンロード
- **詳細**: [25. CSV インポート/エクスポート仕様](#25-csv-インポートエクスポート仕様) を参照

---

## 5. ユーザーフロー

### 5.1 症状診断フロー

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

### 5.2 病院検索フロー

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

### 5.3 管理画面フロー

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

## 6. フロントエンド設計

### 6.1 レンダリング戦略

| ページ | 方式 | 理由 |
|-------|------|------|
| `/` | Server Component | 静的コンテンツ、SEO重要 |
| `/questionnaire` | Client Component | フォーム操作、Context使用 |
| `/results` | Client Component | API呼び出し、動的コンテンツ |
| `/search` | Client Component + Suspense | URLパラメータ読み取り、フォーム操作 |
| `/search/results` | Client Component + Suspense | APIフェッチ、AbortController |
| `/hospital/[id]` | Server Component | サーバーサイドデータフェッチ、SEO |
| `/contact`, `/terms` | Server Component | 静的コンテンツ |
| `/admin/dashboard` | Server Component | JS 0B、統計のみ |
| `/admin/hospitals` | Client Component | CRUD操作、モーダル状態管理 |
| `/admin/hospitals/new`, `/admin/hospitals/[id]/edit` | Server Component | Server Actions使用 |

### 6.2 ルートレイアウト（`src/app/layout.tsx`）

```
┌──────────────────────────────────┐
│ <html lang="ja">                  │
│   <body className={notoSansJP}>   │
│     ┌─── Skip Link ───────────┐  │
│     │ メインコンテンツへスキップ │  │
│     └─────────────────────────┘  │
│     ┌─── Header ──────────────┐  │
│     │ ロゴ | タグライン | 検索  │  │
│     └─────────────────────────┘  │
│     ┌─── Main ────────────────┐  │
│     │ {children}                │  │
│     │ (flex-grow: 1)            │  │
│     └─────────────────────────┘  │
│     ┌─── Footer ──────────────┐  │
│     │ リンク | © | 免責事項    │  │
│     └─────────────────────────┘  │
│   </body>                         │
│ </html>                           │
└──────────────────────────────────┘
```

- **フォント**: Noto Sans JP（weight: 400, 500, 700）、`next/font` で最適化ロード
- **レイアウト**: `min-h-screen` flex column → Header / Main(flex-1) / Footer
- **スキップリンク**: Tab キーで表示、`#main-content` へジャンプ

### 6.3 管理画面レイアウト（`src/app/admin/layout.tsx`）

```
┌──────────────────────────────────────┐
│ ┌─Sidebar(w-56)─┐ ┌─Content────────┐│
│ │ 📊 ダッシュ    │ │ ┌─AdminHeader─┐││
│ │ 🏥 病院管理    │ │ │ 管理 | ログアウト││
│ │ 📥 データ      │ │ └────────────┘││
│ │                │ │ ┌─Main──────┐ ││
│ │                │ │ │ {children} │ ││
│ │                │ │ │            │ ││
│ │                │ │ └────────────┘ ││
│ │ © 2025        │ │                 ││
│ └────────────────┘ └─────────────────┘│
└──────────────────────────────────────┘
```

- **条件**: `/admin/login` ではサイドバー・ヘッダーを非表示
- **サイドバー**: ダークグレー背景、アクティブ項目はプライマリカラー
- **ヘッダー**: ログアウトボタン（確認ダイアログ付き）

### 6.4 グローバルエラーページ（`src/app/error.tsx`）

- **タイプ**: Client Component（`'use client'`）
- **Props**: `{ error: Error & { digest?: string }, reset: () => void }`
- **表示**: ⚠️ エモジ + エラーメッセージ
- **開発モード**: エラー詳細を表示
- **アクション**: 「もう一度試す」（reset()）/ 「トップページに戻る」（ホームへ遷移）

### 6.5 グローバルローディング（`src/app/loading.tsx`）

- `LoadingSpinner`（size="lg"）+ テキスト
- 中央配置（`min-h-screen`）

### 6.6 Suspense バウンダリ

`useSearchParams()` を使用するページ（`/search`、`/search/results`）は `Suspense` でラップ:

```tsx
export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingBox message="読み込み中..." />}>
      <SearchContent />
    </Suspense>
  );
}
```

---

## 7. バックエンド設計

### 7.1 API ルート

#### GET `/api/hospitals`

全病院データを診療時間スケジュール付きで取得。

| 項目 | 詳細 |
|------|------|
| 認証 | 不要 |
| クライアント | `supabase`（Anon Key） |
| レスポンス | `{ hospitals: Hospital[] }` |
| ソート | 病院名の昇順 |
| JOIN | `hospital_schedules` テーブル（1対多リレーション） |
| エラー | 500 + Supabase エラーログ |

#### GET `/api/search`

条件指定による病院検索。

| パラメータ | 型 | 説明 | Supabase演算子 |
|-----------|---|------|---------------|
| `categories` | カンマ区切り文字列 | 診療科（複数可） | `overlaps`（配列の重なり） |
| `cities` | カンマ区切り文字列 | 市町村（複数可） | `in`（IN句） |
| `keyword` | 文字列 | 病院名 | `ilike`（大文字小文字を区別しない部分一致） |

- **レスポンス**: `{ hospitals: Hospital[], count: number }`
- **クエリ構築**: 動的フィルター（パラメータがある場合のみ追加）
- **JOIN**: `hospital_schedules` テーブル
- **ソート**: 病院名の昇順

#### POST `/api/symptoms/generate`

アンケート回答から症状説明文を生成。

| 項目 | 詳細 |
|------|------|
| 認証 | 不要 |
| リクエストボディ | `QuestionnaireData` |
| レスポンス | `{ description: string }` |
| 処理 | `generateSymptomDescription()` ユーティリティ関数を呼び出し |

**バリデーション**:
- `location`: 配列、1つ以上必須
- `duration`: 文字列、必須
- `symptoms`: 配列、1つ以上必須
- `conditions`: 配列、1つ以上必須
- `medicine`: 文字列、必須
- `lumpSize`: `symptoms` に「しこり・ふくらみ」が含まれる場合のみ必須
- 不足時: 400 + 日本語エラーメッセージ

#### POST `/api/symptoms/ai-diagnosis`

AI による症状分析（実験的機能）。

| 項目 | 詳細 |
|------|------|
| 機能フラグ | `NEXT_PUBLIC_AI_DIAGNOSIS=true` で有効 |
| モデル | gpt-4o-mini |
| temperature | 0.7 |
| max_tokens | 1000 |
| リクエスト | `{ location, duration, symptoms, conditions, medicine, memo }` |
| レスポンス | `{ analysis: string }` |
| 無効時 | 403 エラー |

**プロンプト構造**:
- System: 医療アドバイザー視点、5セクション構成を指示
- User: アンケート回答データを構造化して送信
- **出力セクション**:
  1. 考えられる可能性（最大3つ）
  2. 緊急度（高/中/低）
  3. 推奨診療科
  4. 受診時の注意点
  5. 日常生活でのケア
- **医療法準拠**: 「診断ではない」「必ず医師の診察を」と明記

#### POST `/api/admin/login`

| 項目 | 詳細 |
|------|------|
| リクエスト | `{ password: string }` |
| 認証方式 | `ADMIN_PASSWORD` 環境変数との比較 |
| 成功時 | Cookie `admin-auth=true` 設定 |
| Cookie属性 | `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'strict'`, `maxAge: 86400`（24h） |
| 失敗時 | 401 + `{ error: 'パスワードが正しくありません' }` |
| 環境変数未設定 | 500 + `{ error: 'Server configuration error' }` |

#### POST `/api/admin/logout`

Cookie `admin-auth` を削除（`maxAge: 0`）。

#### GET `/api/keepalive`

Vercel コールドスタート防止用ヘルスチェック。

| 項目 | 詳細 |
|------|------|
| クエリパラメータ | `token` |
| 認証 | `KEEPALIVE_TOKEN` 環境変数との比較 |
| レスポンス | `{ ok: true, timestamp: ISO8601 }` |
| トークン不一致 | 401 |

### 7.2 ミドルウェア（`middleware.ts`）

管理画面ルートへのアクセスを認証で保護。

```
リクエスト → middleware
  │
  ├─ パス === '/admin/login' → そのまま通過
  │
  ├─ パスが '/admin' で始まる
  │    ├─ Cookie 'admin-auth' === 'true' → そのまま通過
  │    └─ Cookie なし or 不一致 → /admin/login へリダイレクト
  │
  └─ その他のパス → そのまま通過
```

**マッチャー**: `/admin/:path*`

### 7.3 Server Actions（`src/app/admin/actions.ts`）

全アクションの前提:
- `'use server'` ディレクティブ
- `verifyAdminAuth()`（Cookie 確認）を最初に実行
- データベース操作は `supabaseAdmin`（Service Role Key）を使用し RLS をバイパス

#### `createHospital(formData: FormData)`

| 項目 | 詳細 |
|------|------|
| 入力 | FormData（name, category, address, tel, city, opening_hours, google_map_url, website, note） |
| 処理 | category をカンマ区切り → 配列に変換、必須フィールドバリデーション |
| DB操作 | `hospitals` テーブルへ INSERT |
| 後処理 | `revalidatePath('/admin/hospitals')` → `redirect('/admin/hospitals?success=created')` |
| エラー | バリデーション失敗 or DBエラー → Error throw |

#### `updateHospital(hospitalId: string, formData: FormData)`

| 項目 | 詳細 |
|------|------|
| 入力 | UUID + FormData（createと同じフィールド） |
| 追加処理 | `updated_at: new Date().toISOString()` を設定 |
| DB操作 | `hospitals` テーブルを UPDATE（WHERE id = hospitalId） |
| 後処理 | `revalidatePath('/admin/hospitals')` → `redirect('/admin/hospitals?success=updated')` |

#### `deleteHospital(hospitalId: string)`

| 項目 | 詳細 |
|------|------|
| DB操作 | `hospitals` テーブルから DELETE（CASCADE で `hospital_schedules` も削除） |
| 戻り値 | `{ success: true }` |
| 後処理 | `revalidatePath('/admin/hospitals')` |

#### `importHospitals(formData: FormData)`

**2フェーズ処理**:

**Phase 1: パース & バリデーション**
1. ファイル形式判定（`.csv` → PapaParse / `.xlsx`/`.xls` → xlsx ライブラリ）
2. 全行のバリデーション:
   - 必須: 病院名、住所、電話番号、市町村
   - 診療科: カンマ区切りパース → 1つ以上必須
   - エラー行: `{ row: number, message: string }` の配列に蓄積

**Phase 2: データ置換**
1. 既存データの全削除（`neq('id', '00000000-0000-0000-0000-000000000000')` トリック）
2. 有効データの一括 INSERT（バッチ方式）

**戻り値**: `{ success: number, errors: [{ row: number, message: string }] }`

#### `exportHospitalsCSV()`

| 項目 | 詳細 |
|------|------|
| DB操作 | 全病院を名前順で取得 |
| CSV形式 | ヘッダー行 + データ行、カテゴリ配列はダブルクォートで囲む |
| エンコード | UTF-8 BOM 付き（`\uFEFF` プレフィックス） |
| 戻り値 | CSV 文字列（クライアント側でダウンロード） |

#### `getHospitalSchedules(hospitalId: string)`

| 項目 | 詳細 |
|------|------|
| DB操作 | `hospital_schedules` WHERE `hospital_id` = hospitalId |
| ソート | `day_of_week` 昇順（0=日 → 6=土） |
| 戻り値 | `HospitalSchedule[]`（空配列可） |

#### `updateHospitalSchedules(hospitalId: string, schedulesData: ScheduleFormData[])`

| 項目 | 詳細 |
|------|------|
| 処理 | 1. 既存スケジュール全削除 → 2. 新スケジュール一括挿入 |
| 入力 | 曜日別のオブジェクト配列（day_of_week, morning_start/end, afternoon_start/end, is_closed, note） |
| 後処理 | `revalidatePath('/admin/hospitals')` + `revalidatePath('/results')` |

### 7.4 ライブラリユーティリティ（`src/lib/`）

#### `supabase.ts` — 公開用クライアント

```typescript
import { createClient } from '@supabase/supabase-js';
// Anon Key: SELECT のみ（RLS で制限）
export const supabase = createClient(url, anonKey);
```

- **認証**: Anonymous Key（`anon` ロール、読み取り専用）
- **用途**: 公開ページのデータ取得、API ルート
- **エラー**: 環境変数未設定時に Error throw

#### `supabase-admin.ts` — 管理用クライアント

```typescript
import { createClient } from '@supabase/supabase-js';
// Service Role Key: RLS バイパス、全権限
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
```

- **認証**: Service Role Key（RLS バイパス、全テーブル全操作可能）
- **用途**: Server Actions でのみ使用
- **セキュリティ**: クライアントに絶対に露出させない

#### `departmentMapping.ts` — 診療科マッピング

**定数**:
- `DEPARTMENT_MAPPING`: `Record<bodyPart, department[]>` — 10部位 → 各1-3診療科
- `EMERGENCY_SYMPTOMS`: `['息苦しい', '熱がある', 'めまいがする']`
- `SKIN_SYMPTOMS`: `['かゆい', '赤い・はれている', 'しこり・ふくらみ']`

**関数 `getDepartments(locations: string[], symptoms: string[]): string[]`**:
1. 各 location の対応診療科を収集
2. 緊急症状があれば「内科」を最優先に追加
3. 皮膚症状があれば「皮膚科」を追加
4. 重複除去
5. フォールバック: location 未選択時は `['内科']`

**関数 `formatDepartments(departments: string[]): string`**:
- 配列を `、`（全角読点）で結合

#### `generateSymptomDescription.ts` — 症状説明文生成

**関数 `generateSymptomDescription(data: QuestionnaireData): string`**:
- テンプレートベースの純粋関数（AI不使用）
- 詳細: [14. 症状説明文生成](#14-症状説明文生成) を参照

#### `queryUtils.ts` — クエリユーティリティ

| 関数 | シグネチャ | 説明 |
|------|----------|------|
| `parseCommaSeparatedList` | `(value: string \| null) => string[]` | カンマ区切り文字列を配列に変換（trim + 空文字除去） |
| `toCommaSeparatedString` | `(values: string[]) => string` | 配列をカンマ区切り文字列に変換 |
| `toggleArrayItem` | `<T>(array: T[], item: T) => T[]` | 配列のイミュータブルなトグル（存在すれば除去、なければ追加） |

#### `masterData.ts` — マスターデータ

- `ALL_DEPARTMENTS`: 20種の診療科名配列（[24. マスターデータ](#24-マスターデータ) 参照）
- `ALL_CITIES`: 14自治体名配列

---

## 8. データベース設計

### 8.1 hospitals テーブル

| カラム | 型 | 制約 | 説明 |
|-------|---|------|------|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | |
| `name` | TEXT | NOT NULL | 病院名 |
| `category` | TEXT[] | NOT NULL | 診療科（PostgreSQL配列型） |
| `address` | TEXT | NOT NULL | 住所 |
| `tel` | TEXT | NOT NULL | 電話番号 |
| `city` | TEXT | NOT NULL | 市町村 |
| `opening_hours` | TEXT | nullable | 診療時間（テキスト、スケジュールテーブルのフォールバック用） |
| `google_map_url` | TEXT | nullable | Google Maps URL |
| `website` | TEXT | nullable | Webサイト URL |
| `note` | TEXT | nullable | 備考 |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | 作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | 更新日時 |

**インデックス**:
- `idx_hospitals_city` ON `city` — 市町村フィルター高速化
- `idx_hospitals_category` ON `category` USING GIN — 配列の `overlaps` 演算子高速化

### 8.2 hospital_schedules テーブル

| カラム | 型 | 制約 | 説明 |
|-------|---|------|------|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | |
| `hospital_id` | UUID | FK → `hospitals(id)` ON DELETE CASCADE | |
| `day_of_week` | INTEGER | CHECK (0-6) | 0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土 |
| `morning_start` | TIME | nullable | 午前開始（例: 08:30） |
| `morning_end` | TIME | nullable | 午前終了（例: 12:00） |
| `afternoon_start` | TIME | nullable | 午後開始（例: 14:00） |
| `afternoon_end` | TIME | nullable | 午後終了（例: 17:30） |
| `is_closed` | BOOLEAN | DEFAULT false | 休診フラグ |
| `note` | TEXT | nullable | 備考（例: 第3土曜休診） |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | |
| `updated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | |

**制約**: UNIQUE(`hospital_id`, `day_of_week`) — 1病院につき各曜日1レコード

### 8.3 テーブル関連図

```
┌─────────────────┐       ┌──────────────────────┐
│    hospitals     │       │  hospital_schedules   │
│─────────────────│       │──────────────────────│
│ id (PK, UUID)   │──┐    │ id (PK, UUID)        │
│ name             │  │    │ hospital_id (FK) ────┘
│ category (TEXT[])│  └───→│ day_of_week (0-6)    │
│ address          │       │ morning_start (TIME)  │
│ tel              │       │ morning_end (TIME)    │
│ city             │       │ afternoon_start (TIME)│
│ opening_hours    │       │ afternoon_end (TIME)  │
│ google_map_url   │       │ is_closed (BOOLEAN)   │
│ website          │       │ note                  │
│ note             │       │ created_at            │
│ created_at       │       │ updated_at            │
│ updated_at       │       └──────────────────────┘
└─────────────────┘
        1 : N（ON DELETE CASCADE）
```

### 8.4 セキュリティ（RLS）

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

| ロール | 権限 | 用途 |
|-------|------|------|
| `anon` | SELECT のみ（読み取り専用） | 公開ページでの病院データ表示 |
| `service_role` | 全権限（RLS バイパス） | 管理画面での CRUD 操作 |

**RLS パフォーマンス最適化**: `auth.role()` → `(select auth.role())` でサブクエリをキャッシュ化（行ごとの再評価を回避）

### 8.5 タイムスタンプ方針

全テーブルで `TIMESTAMPTZ`（タイムゾーン付き）を使用。`TIMESTAMP` ではなく `TIMESTAMPTZ` を選択した理由:
- Supabase のベストプラクティスに準拠
- タイムゾーンの違いによるバグを防止
- UTC で保存、表示時にローカルタイムに変換

---

## 9. 認証・セキュリティ

### 9.1 管理画面認証

| 項目 | 詳細 |
|------|------|
| 方式 | パスワード + Cookie 認証 |
| Cookie名 | `admin-auth` |
| Cookie値 | `'true'` |
| 有効期間 | 24時間（`maxAge: 86400`） |
| Cookie属性 | `httpOnly: true`, `secure: NODE_ENV === 'production'`, `sameSite: 'strict'` |
| 管理者数 | 1名（単一パスワード方式） |

**認証フロー**:

```
1. POST /api/admin/login { password }
   │
   ├─ ADMIN_PASSWORD と一致
   │    → Set-Cookie: admin-auth=true; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
   │    → { success: true }
   │
   └─ 不一致
        → 401 { error: 'パスワードが正しくありません' }

2. /admin/* へのアクセス
   │
   └─ middleware.ts が admin-auth Cookie をチェック
        ├─ 有効 → 通過
        └─ 無効 → /admin/login へリダイレクト

3. Server Actions 実行
   │
   └─ verifyAdminAuth() が Cookie を再確認
        ├─ 有効 → Action 実行
        └─ 無効 → Error throw
```

### 9.2 Supabase クライアント構成

| クライアント | ファイル | キー | 用途 |
|------------|--------|-----|------|
| `supabase` | `src/lib/supabase.ts` | Anon Key | 公開ページでの読み取り |
| `supabaseAdmin` | `src/lib/supabase-admin.ts` | Service Role Key | 管理操作（RLS バイパス） |

**`supabaseAdmin` の設定**:
```typescript
{
  auth: {
    autoRefreshToken: false,   // サーバーサイドのみで使用
    persistSession: false       // セッション不要
  }
}
```

### 9.3 環境変数

| 変数 | 公開範囲 | 用途 | 必須 |
|------|---------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | クライアント | Supabase URL | はい |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | クライアント | Supabase 匿名キー | はい |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバーのみ | 管理者用キー（RLS バイパス） | はい |
| `ADMIN_PASSWORD` | サーバーのみ | 管理画面パスワード | はい |
| `OPENAI_API_KEY` | サーバーのみ | OpenAI API キー | AI診断使用時 |
| `NEXT_PUBLIC_AI_DIAGNOSIS` | クライアント | AI診断の有効/無効フラグ | いいえ（デフォルト: 無効） |
| `KEEPALIVE_TOKEN` | サーバーのみ | keepalive エンドポイント認証 | いいえ |

**命名規則**:
- `NEXT_PUBLIC_*`: クライアントバンドルに含まれる（公開可能な値のみ）
- プレフィックスなし: サーバーサイドのみでアクセス可能（シークレット）

### 9.4 セキュリティ対策一覧

| 対策 | 実装 |
|------|------|
| Cookie セキュリティ | httpOnly（JS不可）、Secure（HTTPS必須）、SameSite=strict（CSRF防止） |
| RLS | 全テーブルで有効。anon は SELECT のみ |
| Service Role Key | サーバーサイドのみ、環境変数で管理 |
| 入力バリデーション | 全APIルートでリクエストボディをバリデーション |
| ミドルウェア保護 | `/admin/*` ルートを一括保護 |
| 二重認証チェック | ミドルウェア + Server Actions 内の `verifyAdminAuth()` |
| 環境変数分離 | シークレットは `NEXT_PUBLIC_` プレフィックスなし |

---

## 10. TypeScript型定義

### 10.1 QuestionnaireData（`src/types/questionnaire.ts`）

```typescript
export interface QuestionnaireData {
  location: string[];           // 気になる部位（複数選択、10選択肢）
  duration: string | null;      // いつから（単一選択、5選択肢）
  symptoms: string[];           // どんな状態（複数選択、9選択肢）
  lumpSize?: string | null;     // しこりの大きさ（条件付き、3選択肢）
  conditions: string[];         // 持病（複数選択、8選択肢）
  medicine: string | null;      // 薬の服用（単一選択、2選択肢）
  memo: string;                 // 自由入力テキスト
}
```

**定数（選択肢配列）**:
- `LOCATION_OPTIONS`: `['のど', 'むね', 'おなか', 'あし', 'うで', 'あたま', 'かお', 'せなか', 'こし', 'その他']`
- `DURATION_OPTIONS`: `['今日', '2-3日前', '1週間前', '2週間前', '1ヶ月以上前']`
- `SYMPTOM_OPTIONS`: `['痛い', 'しこり・ふくらみ', 'かゆい', '赤い・はれている', '熱がある', 'せきが出る', '息苦しい', 'めまいがする', 'その他']`
- `LUMP_SIZE_OPTIONS`: `['小さい（〜1cm）', '1〜3cm', '3cm以上']`
- `CONDITION_OPTIONS`: `['なし', '血圧・心臓', '糖尿病', '腎臓', '肝臓', 'がん', 'アレルギー', 'その他']`
- `MEDICINE_OPTIONS`: `['のんでいる', 'のんでいない']`

### 10.2 Hospital & HospitalSchedule（`src/types/hospital.ts`）

```typescript
export interface HospitalSchedule {
  id: string;                          // UUID
  hospital_id: string;                 // FK → hospitals.id
  day_of_week: number;                 // 0=日, 1=月, ..., 6=土
  morning_start: string | null;        // HH:MM:SS 形式（表示時は HH:MM に変換）
  morning_end: string | null;
  afternoon_start: string | null;
  afternoon_end: string | null;
  is_closed: boolean;                  // true = 休診日
  note: string | null;                 // 備考（例: 第3土曜休診）
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
}

export interface Hospital {
  id: string;                          // UUID
  name: string;                        // 病院名
  category: string[];                  // 診療科（配列）
  address: string;                     // 住所
  tel: string;                         // 電話番号
  city: string;                        // 市町村
  opening_hours?: string | null;       // 診療時間テキスト（フォールバック）
  google_map_url?: string | null;      // Google Maps URL
  website?: string | null;             // Webサイト URL
  note?: string | null;                // 備考
  created_at?: string;                 // ISO 8601
  updated_at?: string;                 // ISO 8601
  schedules?: HospitalSchedule[];      // リレーション（Supabase JOINで取得）
}
```

### 10.3 API レスポンス型

```typescript
export interface HospitalsResponse {
  hospitals: Hospital[];
}

export interface HospitalResponse {
  hospital: Hospital;
}

export interface ErrorResponse {
  error: string;
}
```

### 10.4 Server Actions 入力型

```typescript
// 診療時間フォーム入力
interface ScheduleFormData {
  day_of_week: number;              // 0-6
  morning_start: string | null;     // HH:MM
  morning_end: string | null;
  afternoon_start: string | null;
  afternoon_end: string | null;
  is_closed: boolean;
  note: string | null;
}

// インポート結果
interface ImportResult {
  success: number;                  // 成功件数
  errors: { row: number; message: string }[];  // エラー行リスト
}
```

---

## 11. 状態管理

### 11.1 QuestionnaireContext

アンケート回答データをアプリ全体で共有する React Context。

**Provider の実装**:
```
QuestionnaireProvider
  │
  ├─ 初期状態: { location: [], duration: null, symptoms: [], ... }
  │
  ├─ useEffect (マウント時):
  │    localStorage から読み込み → setData → setIsLoaded(true)
  │
  ├─ useEffect (データ変更時):
  │    isLoaded === true の場合のみ → localStorage に保存
  │
  └─ Context Value:
       ├─ data: QuestionnaireData
       ├─ isLoaded: boolean
       ├─ updateLocation(locations: string[])
       ├─ updateDuration(duration: string)
       ├─ updateSymptoms(symptoms: string[])
       ├─ updateLumpSize(size: string | null)
       ├─ updateConditions(conditions: string[])
       ├─ updateMedicine(medicine: string)
       ├─ updateMemo(memo: string)
       └─ resetData()  // 全データ + localStorage クリア
```

**更新関数の実装パターン**:
```typescript
const updateLocation = (locations: string[]) => {
  setData(prev => ({ ...prev, location: locations }));
};
```

**LocalStorage キー**: `'byouin-nabi-questionnaire-data'`

### 11.2 状態管理パターン一覧

| パターン | 用途 | 例 |
|---------|------|---|
| React Context + localStorage | アンケートデータの永続化 | `QuestionnaireContext` |
| URL パラメータ | 検索条件の保持・共有 | `/search/results?categories=内科&cities=飯田市` |
| Server Actions + revalidatePath | 管理画面のデータ更新 | 病院CRUD後のキャッシュ無効化 |
| useTransition + isPending | 非同期操作のローディング | Server Action 実行中の状態表示 |
| useState | ローカルUIステート | モーダル表示、エラーメッセージ |
| AbortController | フェッチのキャンセル | コンポーネントアンマウント時 |

### 11.3 データフロー図

```
┌─── クライアント（ブラウザ）───────────────────────────┐
│                                                        │
│  localStorage ←→ QuestionnaireContext ←→ コンポーネント │
│        │                    │                          │
│        │              URLパラメータ                     │
│        │           (検索条件の保持)                     │
│        ▼                    ▼                          │
└───────────── fetch / Server Actions ──────────────────┘
                      │
           ┌──────────┼──────────┐
           ▼          ▼          ▼
     /api/symptoms  /api/search  /api/hospitals
     /generate      (GET)        (GET)
     /ai-diagnosis
           │          │          │
           ▼          ▼          ▼
      ┌─── Supabase (PostgreSQL) ───┐
      │  hospitals + schedules      │
      └─────────────────────────────┘
```

---

## 12. アンケート仕様

### 12.1 質問一覧

| # | 質問 | 選択方式 | 選択肢 | 必須 |
|---|------|---------|--------|------|
| Q1 | どこが気になりますか？ | 複数選択 | のど、むね、おなか、あし、うで、あたま、かお、せなか、こし、その他 | はい |
| Q2 | いつからですか？ | 単一選択 | 今日、2-3日前、1週間前、2週間前、1ヶ月以上前 | はい |
| Q3 | どんな状態ですか？ | 複数選択 | 痛い、しこり・ふくらみ、かゆい、赤い・はれている、熱がある、せきが出る、息苦しい、めまいがする、その他 | はい |
| Q4 | しこりの大きさ | 単一選択 | 小さい（〜1cm）、1〜3cm、3cm以上 | Q3で「しこり・ふくらみ」選択時のみ |
| Q5 | 持病はありますか？ | 複数選択 | なし、血圧・心臓、糖尿病、腎臓、肝臓、がん、アレルギー、その他 | はい |
| Q6 | 薬をのんでいますか？ | 単一選択 | のんでいる、のんでいない | はい |
| Q7 | 他に伝えたいこと | 自由入力 | テキストエリア | いいえ |

### 12.2 特殊ロジック

- **Q4 条件表示**: Q3 で「しこり・ふくらみ」を選択した場合のみ表示。選択解除で Q4 の回答もクリア
- **Q5「なし」の排他制御**: 「なし」選択時に他の選択を全クリア。他の項目を選択すると「なし」が自動的に外れる

### 12.3 バリデーション

| ルール | 条件 | エラーメッセージ |
|-------|------|---------------|
| Q1 必須 | `location.length === 0` | 「気になる部位を選んでください」 |
| Q2 必須 | `duration === null` | 「いつからかを選んでください」 |
| Q3 必須 | `symptoms.length === 0` | 「状態を選んでください」 |
| Q4 条件付き必須 | Q3に「しこり」含む & `lumpSize === null` | 「しこりの大きさを選んでください」 |
| Q5 必須 | `conditions.length === 0` | 「持病について選んでください」 |
| Q6 必須 | `medicine === null` | 「薬の服用について選んでください」 |

- エラー発生時: エラーリストを画面上部に表示 + `scrollTo({ top: 0, behavior: 'smooth' })`
- エラー表示: 赤枠ボックスに一覧表示

### 12.4 データ永続化

- **保存先**: `localStorage`（キー: `byouin-nabi-questionnaire-data`）
- **保存タイミング**: 質問への回答時に自動保存（Context の useEffect が data 変更を監視）
- **復元タイミング**: ページロード時に自動読み込み（`isLoaded` フラグで制御）
- **クリアタイミング**:
  - ホームの「症状から病院を探す」ボタン押下時（`StartQuestionnaireButton`）
  - アンケート画面の「最初からやり直す」ボタン（`ConfirmModal` 確認後）

### 12.5 UI パターン

- **選択肢ボタン（QuestionOption）**: ボタン式、選択時にプライマリカラー背景 + 白文字 + チェックマーク
- **複数選択**: □ アイコン（チェックボックス風）
- **単一選択**: ○ アイコン（ラジオボタン風）
- **グリッド**: 2-3列レスポンシブ（モバイル2列、デスクトップ3列）
- **最小タップ領域**: `min-h-tap`（48px）

---

## 13. 診療科マッピングロジック

### 13.1 部位→診療科の基本マッピング

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

### 13.2 症状による補正ルール

- **皮膚症状**（かゆい、赤い・はれている、しこり・ふくらみ）→ 皮膚科を追加
- **緊急症状**（息苦しい、熱がある、めまいがする）→ 内科を最優先に移動
- **重複除去**: 最終リストから重複を排除
- **フォールバック**: 部位未選択時は `['内科']` を返却

### 13.3 アルゴリズムフロー

```
入力: locations[], symptoms[]
  │
  ├─ 各 location の DEPARTMENT_MAPPING を収集
  │    → departments[] (重複あり)
  │
  ├─ EMERGENCY_SYMPTOMS に該当する symptoms がある？
  │    └─ はい → '内科' を配列の先頭に追加
  │
  ├─ SKIN_SYMPTOMS に該当する symptoms がある？
  │    └─ はい → '皮膚科' を追加
  │
  ├─ Set で重複除去
  │
  └─ departments が空？
       └─ はい → ['内科'] をフォールバック
```

---

## 14. 症状説明文生成

### 14.1 生成方式

テンプレートベースの純粋関数（AIは使用しない）。アンケート回答からテキストを組み立てる。

### 14.2 出力フォーマット

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

### 14.3 状態セクションのロジック

各症状の有無を `symptoms` 配列の `includes()` で判定:

| 状態項目 | 判定条件 |
|---------|---------|
| 痛み | `symptoms.includes('痛い')` |
| しこり | `symptoms.includes('しこり・ふくらみ')` → `lumpSize` も表示 |
| 発熱 | `symptoms.includes('熱がある')` |
| かゆみ | `symptoms.includes('かゆい')` |
| 赤み・はれ | `symptoms.includes('赤い・はれている')` |
| せき | `symptoms.includes('せきが出る')` |
| 息苦しさ | `symptoms.includes('息苦しい')` |
| めまい | `symptoms.includes('めまいがする')` |

### 14.4 利用方法

- **テキストコピー**: `navigator.clipboard.writeText()` でクリップボードにコピー → 3秒間「コピーしました✓」表示
- **画像保存**: html2canvas で対象要素をPNG画像に変換 → 自動ダウンロード（ファイル名: `症状説明_YYYYMMDD_HHMMSS.png`）

---

## 15. AI診断機能（実験的）

### 15.1 概要

| 項目 | 詳細 |
|------|------|
| 機能フラグ | `NEXT_PUBLIC_AI_DIAGNOSIS=true` で有効化 |
| モデル | OpenAI gpt-4o-mini |
| パラメータ | temperature: 0.7、max_tokens: 1000 |
| ステータス | 本番環境で有効化済み |

### 15.2 出力内容

1. 考えられる可能性（最大3つ）
2. 緊急度（高/中/低）
3. 推奨診療科
4. 受診時の注意点
5. 日常生活でのケア

### 15.3 UIフロー

```
1. 「AI診断を試す」アコーディオンを開く
   │
2. 赤枠の免責事項表示（5項目の注意点）
   │
3. チェックボックス「上記の内容を理解しました」にチェック
   │  ※チェックなしではボタン無効
   │
4. 「AIに聞いてみる」ボタン押下
   │
5. ローディングスピナー表示
   │
6. /api/symptoms/ai-diagnosis POST
   │
7. 結果表示（白枠ボックス + ✓チェックマークアニメーション）
   │
8. 結果下部に再度免責事項を表示
```

### 15.4 安全対策

| 対策 | 詳細 |
|------|------|
| 同意チェックボックス | 免責事項への同意が必須（チェックなしではボタン無効） |
| 免責事項表示（実行前） | 赤枠・赤文字で「医学的診断ではない」旨を強調。5項目列挙 |
| 免責事項表示（結果後） | 「必ず医師の診察を受けてください」を再度表示 |
| プロンプト内指示 | AI出力に「これは診断ではない」旨を含めるよう指示 |
| 機能フラグ | `NEXT_PUBLIC_AI_DIAGNOSIS` で一括無効化可能 |
| エラー時 | フラグ無効時は 403 を返却 |

### 15.5 バリデーション

- `location` と `duration` の存在チェック
- 配列型の型チェック
- 不足時はエラーメッセージ表示（API呼び出しなし）

---

## 16. コンポーネント詳細仕様

### 16.1 共通コンポーネント（`src/components/Common/`）

#### Header

| 項目 | 詳細 |
|------|------|
| タイプ | Server Component |
| 高さ | 88px（スティッキー、`z-50`） |
| 左側 | ロゴリンク「病院ナビ南信」→ `/` |
| 中央 | タグライン「症状から探す 安心の病院ナビ」（モバイルでは非表示） |
| 右側 | 🔍「検索」ボタン（緑色、`min-h-tap`）→ `/search` |
| 背景 | グラデーション（blue-50 → white）+ 4px 下部青ボーダー |
| アクセシビリティ | `role="banner"`, 各要素に `aria-label` |

#### Footer

| 項目 | 詳細 |
|------|------|
| タイプ | Client Component（`usePathname()` で条件分岐） |
| 非表示条件 | モバイルで `/results`、`/search/results`、`/hospital/[id]` にいる場合 |
| 左側 | お問い合わせ・利用規約リンク |
| 中央 | © 2025 copyright |
| 下部 | ※「このサービスは医療行為ではありません」免責事項 |

#### Button

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `children` | `ReactNode` | 必須 | ボタンテキスト |
| `variant` | `'primary' \| 'secondary'` | `'primary'` | スタイルバリアント |
| `type` | `'button' \| 'submit'` | `'button'` | HTML type |
| `disabled` | `boolean` | `false` | 無効化 |
| `className` | `string` | `''` | 追加CSSクラス |
| `onClick` | `() => void` | - | クリックハンドラー |

**スタイル**:
- Base: `min-h-tap`（48px）、rounded、transition
- Primary: 青背景、白テキスト、ホバーで濃い青
- Secondary: グレー背景、グレーテキスト、ホバーで濃いグレー
- Disabled: 50% opacity、`cursor-not-allowed`

#### Accordion

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `title` | `string` | 必須 | タイトル |
| `icon` | `string` | - | 絵文字アイコン |
| `description` | `string` | - | 閉じた状態で表示される説明 |
| `badge` | `string` | - | バッジテキスト |
| `badgeColor` | `'blue' \| 'green' \| 'orange' \| 'purple'` | `'blue'` | バッジ色 |
| `variant` | `'default' \| 'highlight' \| 'gradient'` | `'default'` | スタイルバリアント |
| `defaultOpen` | `boolean` | `false` | 初期状態 |
| `children` | `ReactNode` | 必須 | コンテンツ |

**アニメーション**: CSS Grid `grid-template-rows: 0fr` → `1fr` トランジション（max-heightより滑らか）
**スクロール**: 開いた時に 350ms 後にスムーズスクロールで表示位置へ移動

**バリアントスタイル**:
| バリアント | 背景 | ボーダー |
|-----------|------|--------|
| `default` | 白 | グレー |
| `highlight` | 青グラデーション | 左4px 青ボーダー |
| `gradient` | 紫-ピンク-オレンジ グラデーション | 左4px 紫ボーダー |

#### MobileFixedFooter

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `backUrl` | `string` | 必須 | 戻るボタンのリンク先 |
| `backText` | `string` | `'戻る'` | 戻るボタンのテキスト |

- 固定配置（`position: fixed`, `bottom: 0`, `z-50`）
- `md:hidden`（デスクトップでは非表示）
- 2ボタンレイアウト: 🏠 ホーム | カスタムボタン

#### ConfirmModal

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `isOpen` | `boolean` | 必須 | 表示状態 |
| `title` | `string` | 必須 | タイトル |
| `message` | `string` | 必須 | メッセージ（改行対応） |
| `confirmText` | `string` | `'OK'` | 確認ボタンテキスト |
| `cancelText` | `string` | `'キャンセル'` | キャンセルボタンテキスト |
| `onConfirm` | `() => void` | 必須 | 確認時コールバック |
| `onCancel` | `() => void` | 必須 | キャンセル時コールバック |
| `type` | `'warning' \| 'danger' \| 'info'` | `'warning'` | タイプ（アイコン・色が変化） |

**アイコン**: ⚠️（warning）/ 🚨（danger）/ ℹ️（info）

#### SuccessModal

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `isOpen` | `boolean` | 必須 | 表示状態 |
| `title` | `string` | 必須 | タイトル（緑色） |
| `message` | `string` | 必須 | メッセージ |
| `buttonText` | `string` | `'閉じる'` | ボタンテキスト |
| `onClose` | `() => void` | 必須 | 閉じるコールバック |

**アニメーション**: ✅ エモジのバウンスアニメーション

#### Toast

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `message` | `string` | 必須 | メッセージ |
| `type` | `'success' \| 'error' \| 'info'` | `'success'` | タイプ |
| `isVisible` | `boolean` | 必須 | 表示状態 |
| `onClose` | `() => void` | 必須 | 閉じるコールバック |
| `duration` | `number` | `3000` | 自動クローズまでの時間（ms） |

- 固定配置（右上）
- 自動クローズ（`duration` ms 後に `onClose` を呼び出し）

#### ErrorBox

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `error` | `string` | 必須 | エラーメッセージ |
| `title` | `string` | `'エラーが発生しました'` | タイトル |
| `onDismiss` | `() => void` | - | 閉じるボタン（指定時のみ表示） |

**スタイル**: 赤枠 + 赤背景、❌ エモジ

#### LoadingBox / LoadingSpinner

| Props (LoadingBox) | 型 | デフォルト | 説明 |
|----|---|----------|------|
| `message` | `string` | - | ローディングメッセージ |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ |

| Props (LoadingSpinner) | 型 | デフォルト | 説明 |
|----|---|----------|------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ（4/8/12 px） |
| `className` | `string` | - | 追加CSSクラス |

**アクセシビリティ**: `role="status"`, `aria-label`, `.sr-only` テキスト

#### ScrollToTop

- `useEffect` でスクロールリスナーを設定
- `scrollY > 300px` で表示
- `md:hidden` でモバイル非表示（モバイルは MobileFixedFooter を使用）
- スムーズスクロールで上部へ移動

#### StartQuestionnaireButton

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `className` | `string` | - | 追加CSSクラス |
| `children` | `ReactNode` | 必須 | ボタンテキスト |

- クリック時: `localStorage.removeItem('byouin-nabi-questionnaire-data')` → `/questionnaire` へ遷移

#### FontSizeToggle（未使用・将来用）

- 「大」⇔「標準」トグル
- `localStorage` に `fontSize` を保存
- `<body>` に `large-text` クラスを付与/除去
- 現在はヘッダーでコメントアウト

### 16.2 アンケートコンポーネント

#### QuestionnaireForm

- **タイプ**: Client Component
- **フック**: `useQuestionnaire()`
- **ローカル状態**: `errors: string[]`, `showResetModal: boolean`
- **7つの質問セクション**: 各セクションに見出し + QuestionOption グリッド
- **アクション**:
  - 「最初からやり直す」→ ConfirmModal → `resetData()` → `/questionnaire` へリダイレクト
  - 「まとめる」→ バリデーション → 成功時 `/results` へ遷移

#### QuestionOption

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `value` | `string` | 必須 | 選択肢の値 |
| `label` | `string` | 必須 | 表示テキスト |
| `selected` | `boolean` | 必須 | 選択状態 |
| `onSelect` | `(value: string) => void` | 必須 | 選択時コールバック |
| `multiSelect` | `boolean` | `false` | 複数選択モード |

**表示**:
- 未選択: 白背景 + グレー枠
- 選択済: プライマリ背景 + 白文字 + SVGチェックマーク
- アイコン: `multiSelect ? □ : ○`
- `aria-pressed` 属性で選択状態を通知

### 16.3 結果表示コンポーネント

#### RecommendedDepartments

| Props | 型 | 説明 |
|-------|---|------|
| `departments` | `string[]` | 推奨診療科リスト |

- 番号付き丸アイコン（1, 2, 3...）で各診療科を表示
- 複数診療科がある場合: 「迷ったら1番目の科、または内科をおすすめします」
- 「内科」が含まれる場合: 「内科は幅広い症状に対応」のインフォボックス表示

#### SymptomDescription

| Props | 型 | 説明 |
|-------|---|------|
| `description` | `string` | 生成された症状説明文 |

- `<pre>` タグで整形表示（緑色背景）
- 「文章をコピーする」ボタン（クリップボード API）
- コピー後3秒間「コピーしました✓」に変化
- 使い方ガイド（3ステップ）
- 赤枠の警告ボックス: 「参考情報であり、医学的な診断ではありません」
- 緊急時案内: 「緊急の場合は119番に電話」

#### ImageSaveButton

| Props | 型 | 説明 |
|-------|---|------|
| `targetId` | `string` | スクリーンショット対象要素のID |

- **動的インポート**: `await import('html2canvas')` で使用時のみ300KB+のライブラリをロード
- **処理フロー**: 要素取得 → html2canvas → Canvas → Blob → ダウンロードリンク生成 → 自動クリック
- **ファイル名**: `症状説明_YYYYMMDD_HHMMSS.png`
- **エラー**: ブラウザの切り替えを提案

#### AIDiagnosisButton

| Props | 型 | 説明 |
|-------|---|------|
| `questionnaireData` | `QuestionnaireData` | アンケート回答データ |

- **機能フラグ**: `NEXT_PUBLIC_AI_DIAGNOSIS !== 'true'` の場合は `null` を返却（何も描画しない）
- **状態**: `analysis`（結果テキスト）、`loading`、`error`、`agreed`（同意チェック）
- **詳細**: [15. AI診断機能](#15-ai診断機能実験的) を参照

### 16.4 病院リストコンポーネント

#### HospitalList

| Props | 型 | 説明 |
|-------|---|------|
| `departments` | `string[]` | 推奨診療科（自動検索に使用） |

- **データフェッチ**: `useEffect` で `/api/search?categories=...` を呼び出し
- **AbortController**: `departments` 変更時やアンマウント時にフェッチキャンセル
- **表示**: LoadingBox → ErrorBox → 病院リスト or 「該当なし」メッセージ

#### HospitalListItem（`React.memo` 化）

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `hospital` | `Hospital` | 必須 | 病院データ |
| `highlightCategories` | `string[]` | `EMPTY_CATEGORIES`（モジュールスコープ定数） | ハイライトする診療科 |
| `detailUrl` | `string` | `/hospital/{id}?from=results` | 詳細ページURL |

- **カード全体がクリック可能**: `router.push(detailUrl)` で遷移
- **ホバーアニメーション**: `scale(1.02)` + shadow増加 + 色変化
- **電話リンク**: `<a href="tel:...">` — イベント伝播を停止（カードクリックを防止）
- **メモ化理由**: 病院リストの再レンダリング時にパフォーマンスを維持
- **`EMPTY_CATEGORIES` 定数**: デフォルトpropsの安定化（毎回新しい空配列を作らない）

#### HospitalCard

| Props | 型 | デフォルト | 説明 |
|-------|---|----------|------|
| `hospital` | `Hospital` | 必須 | 病院データ（schedules含む） |
| `highlightCategories` | `string[]` | - | ハイライトする診療科 |

**表示セクション**:
1. 病院名（太字）
2. 診療科タグ（`highlightCategories` にマッチする科はハイライト表示）
3. 住所（📍 アイコン）
4. アクションボタングリッド:
   - 📞 電話: `<a href="tel:...">`（デスクトップでは番号表示、モバイルでは「電話」）
   - 🗺️ 地図: Google Maps リンク（存在時のみ）
   - 🌐 Web: Webサイトリンク（存在時のみ）
5. 診療時間:
   - `schedules` がある場合: `ScheduleTable` コンポーネント
   - なければ `opening_hours` テキストをフォールバック表示
6. 備考（存在時のみ）

**ScheduleTable サブコンポーネント**:
- テーブル: 曜日 | 午前 | 午後
- 休診日は「休診」テキスト（赤色）
- 時刻表示: `HH:MM:SS` → `HH:MM` に切り出し
- スケジュール備考は表下部に表示

### 16.5 管理画面コンポーネント

#### HospitalForm

| Props | 型 | 説明 |
|-------|---|------|
| `hospital` | `Hospital \| undefined` | 既存データ（編集時） |
| `action` | `(formData: FormData) => Promise<void>` | Server Action |
| `mode` | `'create' \| 'edit'` | モード |

**フィールド（9項目）**:

| フィールド | 入力タイプ | 必須 | 備考 |
|-----------|----------|------|------|
| name | text | はい | 病院名 |
| category | text | はい | カンマ区切り（例: 内科,外科） |
| address | text | はい | 住所 |
| city | text | はい | 市町村 |
| tel | text | はい | 電話番号 |
| opening_hours | textarea | いいえ | 診療時間テキスト |
| google_map_url | text | いいえ | Google Maps URL |
| website | text | いいえ | Webサイト URL |
| note | textarea | いいえ | 備考 |

- **FormData**: Server Actions と直接連携
- **useTransition**: 送信中のローディング状態管理
- **defaultValue**: 編集時に既存データを初期値として設定
- **ボタン**: 「登録」（create）/ 「更新」（edit）+ 「キャンセル」

#### AdminSidebar

- ダークグレー背景（`w-56` = 224px）
- 3メニュー項目: 📊 ダッシュボード / 🏥 病院管理 / 📥 データインポート
- `usePathname()` でアクティブ項目を判定（プライマリ背景 + 太字）
- フッター: copyright

#### AdminHeader

- 白背景 + 下部ボーダー
- タイトル: 「管理システム」
- ログアウトボタン: `/api/admin/logout` POST → 確認 → `/admin/login` へリダイレクト

---

## 17. デザインシステム

### 17.1 カラーパレット

| トークン | 値 | 用途 |
|---------|---|------|
| `--primary` | `#1e40af` | メインカラー（ボタン、リンク、選択状態） |
| `--primary-dark` | `#1e3a8a` | ホバー時 |
| `--primary-light` | `#3b82f6` | アクセント、フォーカスリング |
| `--success` | `#16a34a` | 成功・電話ボタン・検索ボタン |
| `--error` | `#dc2626` | エラー・警告・削除ボタン |
| `--warning` | `#f59e0b` | 注意 |
| `--purple` | `#9333ea` | AI診断・件数表示 |
| `--orange` | `#f97316` | 強調 |
| `--green-light` | `#f0fdf4` | 症状説明文の背景 |
| `--blue-light` | `#eff6ff` | ハイライトアコーディオンの背景 |

### 17.2 タイポグラフィ

| 項目 | 値 |
|------|---|
| フォント | Noto Sans JP（Google Fonts、`next/font` 最適化） |
| ウェイト | 400（通常）、500（中）、700（太字） |
| 基本サイズ | 18px（`--font-size-base`、モバイル・デスクトップ共通） |
| 大文字モード | 24px以上（`body.large-text` クラス適用時） |
| 小サイズ | `--font-size-sm`（注釈・補足テキスト） |
| 大サイズ | `--font-size-lg`（見出し・強調） |

### 17.3 レイアウト定数

| 項目 | 値 | CSS変数/クラス |
|------|---|------------|
| ヘッダー高さ | 88px | `min-h-header` |
| フッター高さ | 80px | `min-h-footer` |
| 最小タップ領域 | 48px x 48px | `min-h-tap`, `min-w-tap` |
| コンテンツ最大幅 | 1024px（結果/詳細）、1152px（検索） | `max-w-4xl`, `max-w-5xl` |
| 管理サイドバー幅 | 224px（56 * 4） | `w-56` |
| モバイル固定フッター | 固定底部、z-50 | `fixed bottom-0` |

### 17.4 Tailwind カスタム設定

`tailwind.config.ts` で定義されたカスタムトークン:

```typescript
// カラー: CSS変数参照
colors: {
  primary: 'var(--primary)',
  'primary-dark': 'var(--primary-dark)',
  // ... 全カラートークン
}

// フォントサイズ: CSS変数参照
fontSize: {
  base: 'var(--font-size-base)',
  lg: 'var(--font-size-lg)',
  sm: 'var(--font-size-sm)',
}

// 最小高さ: ヘッダー/フッター/タップ領域
minHeight: {
  tap: '48px',
  header: '88px',
  footer: '80px',
}
```

### 17.5 アニメーション

| 名前 | 用途 | 時間 | 備考 |
|------|------|------|------|
| `fadeIn` | モーダル背景 | 0.2s | opacity 0→1 |
| `slideIn` | モーダル本体 | 0.3s | 上からスライド |
| `bounceIn` | 成功モーダル | 0.5s | スケールバウンス |
| `slideInRight` | トースト通知 | 0.3s | 右からスライド |
| `fadeInUp` | カード・セクション | 0.3s | 下から上へフェードイン |
| CSS Grid transition | アコーディオン | 0.3s | `grid-template-rows: 0fr → 1fr` |

---

## 18. レスポンシブデザイン戦略

### 18.1 ブレークポイント

| 名前 | 幅 | 用途 |
|------|---|------|
| デフォルト | < 768px | モバイル（メインターゲット） |
| `md:` | >= 768px | タブレット・デスクトップ |

**モバイルファースト**: 基本スタイルはモバイル向け、`md:` プレフィックスでデスクトップ上書き

### 18.2 デバイス別の主要な違い

| 要素 | モバイル | デスクトップ |
|------|---------|------------|
| ナビゲーション | MobileFixedFooter（固定底部） | 通常ボタン + ScrollToTop |
| Footer | 一部ページで非表示 | 常時表示 |
| Header タグライン | 非表示 | 表示 |
| 検索グリッド | 2列 | 3-4列 |
| 質問オプション | 2列 | 3列 |
| 電話ボタン | 「電話」テキスト | 電話番号表示 |
| HospitalCard アクションボタン | 3列グリッド | flex レイアウト |
| ScrollToTop | 非表示 | 表示（`scrollY > 300px` 時） |
| 検索結果の「条件変更」ボタン | MobileFixedFooter 内 | ページ上部/下部に通常ボタン |

### 18.3 タッチ操作最適化

- 全インタラクティブ要素: `min-h-tap`（48px）以上
- ボタン間のスペース: 8px 以上（誤タップ防止）
- フォーム入力: 十分な高さとパディング
- 電話リンク: `<a href="tel:...">` でワンタップ発信

---

## 19. ナビゲーション設計

### 19.1 グローバルナビゲーション

| 要素 | 場所 | リンク先 |
|------|------|--------|
| ロゴ | ヘッダー左 | `/` |
| 検索ボタン | ヘッダー右 | `/search` |
| お問い合わせ | フッター | `/contact` |
| 利用規約 | フッター | `/terms` |

### 19.2 コンテキストナビゲーション（戻るボタン）

病院詳細ページの「戻る」ボタンは、遷移元に応じてテキストとリンク先が変化:

| 遷移元 | `searchParams` | 戻るテキスト | リンク先 |
|--------|---------------|------------|---------|
| 結果ページ | `from=results` | 「症状結果に戻る」 | `/results` |
| 検索結果 | `categories=...&cities=...` | 「検索結果に戻る」 | `/search/results?categories=...&cities=...` |
| 検索条件 | `from=search` | 「検索に戻る」 | `/search` |
| その他 | なし | 「戻る」 | `/` |

### 19.3 URLパラメータ設計

| ページ | パラメータ | 用途 |
|-------|----------|------|
| `/search/results` | `categories`, `cities`, `keyword` | 検索条件の指定 |
| `/hospital/[id]` | `from`, `categories`, `cities` | 戻り先の判定 + 検索条件保持 |
| `/admin/hospitals` | `success=created\|updated` | 操作完了通知トースト |
| `/search` | `categories`, `cities`, `keyword` | 前回の検索条件復元 |

### 19.4 MobileFixedFooter の配置

| ページ | ホームボタン | カスタムボタン |
|-------|------------|-------------|
| `/results` | ✅ | 「やり直す」→ `/questionnaire` |
| `/search/results` | ✅ | 「条件を変更」→ `/search?...`（条件保持） |
| `/hospital/[id]` | ✅ | コンテキスト依存テキスト（上記参照） |

---

## 20. エラーハンドリング戦略

### 20.1 API ルートのエラーレスポンス

| ステータス | 用途 | レスポンス形式 |
|-----------|------|-------------|
| 400 | バリデーションエラー | `{ error: '日本語メッセージ' }` |
| 401 | 認証エラー | `{ error: 'パスワードが正しくありません' }` or `{ error: 'Unauthorized' }` |
| 403 | 機能無効 | `{ error: 'AI診断機能は現在無効です' }` |
| 500 | サーバーエラー | `{ error: '...' }` + `console.error` でログ |

### 20.2 クライアントサイドエラーハンドリング

| パターン | 実装 | 表示 |
|---------|------|------|
| API フェッチ失敗 | try-catch + `setError(message)` | `ErrorBox` コンポーネント |
| バリデーション失敗 | errors 配列 + 上部スクロール | 赤枠エラーリスト |
| グローバルエラー | `error.tsx` | リトライ + ホームボタン |
| ローディング | `loading.tsx` / LoadingBox | スピナー + メッセージ |
| データなし（検索0件） | 条件分岐 | 「条件に一致する病院が見つかりません」 |
| 404（病院不存在） | `notFound()` | Next.js のデフォルト 404 |

### 20.3 Server Actions のエラーハンドリング

- Error を throw → クライアントの useTransition/try-catch でキャッチ
- Supabase エラー: エラーオブジェクトをコンソールにログ + ユーザーフレンドリーなメッセージを throw
- 認証エラー: `verifyAdminAuth()` が Error を throw

### 20.4 AbortController パターン

`HospitalList` と `SearchResults` で使用:

```typescript
useEffect(() => {
  const abortController = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(url, { signal: abortController.signal });
      // ...
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setError('エラーメッセージ');
    }
  };

  fetchData();
  return () => abortController.abort();
}, [dependencies]);
```

- コンポーネントアンマウント時にフェッチをキャンセル
- 依存関係変更時に古いフェッチをキャンセル（レース条件防止）
- `AbortError` は無視（正常なキャンセル）

---

## 21. パフォーマンス最適化

| 施策 | 詳細 | 効果 |
|------|------|------|
| html2canvas 動的インポート | 使用時のみ `await import()` | `/results` 53kB → 7.37kB（-86%） |
| admin/dashboard Server Component化 | クライアントJS不要 | First Load JS: 0B |
| Promise.all 並列化 | params/searchParams を並列解決 | ウォーターフォール解消 |
| HospitalListItem memo化 | デフォルト値をモジュールスコープに巻き上げ | 不要な再レンダリング防止 |
| バッチINSERT | ループ内個別INSERT → 一括INSERT | DB負荷軽減 |
| RLS initplan最適化 | `auth.role()` → `(select auth.role())` | 行ごとの再評価を回避（initplan キャッシュ） |
| Noto Sans JP next/font | Google Fonts の最適化ロード | FOUT（Flash of Unstyled Text）防止 |
| Turbopack | 開発・ビルドの高速化 | 開発体験向上 |
| AbortController | 不要なフェッチのキャンセル | ネットワーク・メモリの浪費防止 |
| useCallback | 検索ページのトグルハンドラー | 子コンポーネントの再レンダリング防止 |
| Suspense Boundaries | 検索ページのコード分割 | ルートレベルのコード分割 |
| GIN インデックス | category 配列の overlaps クエリ | 配列検索の高速化 |
| keepalive エンドポイント | Vercel コールドスタート防止 | 初回レスポンス高速化 |

---

## 22. アクセシビリティ

### 22.1 実装一覧

| 機能 | 実装 | 対象 |
|------|------|------|
| スキップリンク | Tab キーで「メインコンテンツへスキップ」表示 → `#main-content` | ルートレイアウト |
| セマンティック HTML | `<header>`, `<nav>`, `<main>`, `<footer>` + `role` 属性 | 全ページ |
| ARIA 属性 | `aria-label`, `aria-expanded`, `aria-pressed` | ナビ、アコーディオン、選択肢 |
| フォーカス表示 | `outline: 3px solid var(--primary)` | 全フォーカス可能要素 |
| スクリーンリーダー対応 | `.sr-only` クラスで非表示テキスト | LoadingSpinner、アイコンボタン |
| 減速アニメーション | `prefers-reduced-motion: reduce` でアニメーション無効化 | 全アニメーション |
| ハイコントラスト | `prefers-contrast: high` でボーダー強調 | 全ページ |
| キーボードナビゲーション | 全インタラクティブ要素がTab順で操作可能 | 全ページ |
| 最小タップ領域 | 48px x 48px（WCAG 2.5.5 準拠） | ボタン、リンク、選択肢 |
| フォントサイズ | 18px 基本（一般的な16pxより大きい） | テキスト全般 |

### 22.2 シニア向けUI設計方針

| 方針 | 実装 |
|------|------|
| 大きな文字 | 18px 基本サイズ + 将来の 24px モード |
| 大きなタップ領域 | 48px 最小高さ |
| 高コントラスト | 青/白を基調、十分なコントラスト比 |
| 簡潔な操作 | ボタン式選択（ドロップダウン不使用）、大きなCTA |
| 絵文字アイコン | 📞 🗺️ 🌐 で直感的に内容を伝達 |
| 確認ダイアログ | 破壊的操作前に必ず確認 |
| ステップガイド | 使い方を番号付きで説明 |

---

## 23. 医療法準拠事項

| 項目 | 対応 |
|------|------|
| 用語 | 「診断」「治療」を避け、「参考情報」「受診の目安」と表現 |
| 免責事項 | 全結果ページに「医師の診察を受けてください」を明記 |
| AI診断 | 「医学的診断ではない」を赤枠・赤文字で強調表示 |
| 同意 | AI診断実行前にチェックボックスで同意を取得 |
| 緊急時 | 119番通報の案内を記載 |
| 利用規約 | 第1条で「医療行為ではない」旨を赤字で明記 |
| データ保存 | 症状データはLocalStorageのみ保存、サーバーには一切保存しない |
| フッター免責 | 全ページフッターに「このサービスは医療行為ではありません」表示 |

---

## 24. マスターデータ

### 24.1 診療科一覧（20種類）

内科、外科、小児科、整形外科、皮膚科、耳鼻いんこう科、眼科、産婦人科、泌尿器科、脳神経外科、神経内科、循環器内科、呼吸器内科、消化器内科、心臓血管外科、精神科、リハビリテーション科、放射線科、アレルギー科、救急科

### 24.2 対象市町村（14自治体）

飯田市、松川町、高森町、阿南町、阿智村、平谷村、根羽村、下条村、売木村、天龍村、泰阜村、喬木村、豊丘村、大鹿村

---

## 25. CSV インポート/エクスポート仕様

### 25.1 CSV フォーマット

| ヘッダー名 | 必須 | 説明 | 備考 |
|-----------|------|------|------|
| 病院名 | はい | 病院の正式名称 | |
| 診療科 | はい | カンマ区切り（例: `内科,外科`） | ダブルクォートで囲む |
| 住所 | はい | 完全な住所 | |
| 電話番号 | はい | ハイフン付き（例: `0265-22-xxxx`） | |
| 市町村 | はい | 14自治体のいずれか | |
| 診療時間 | いいえ | テキスト形式 | |
| Google Maps URL | いいえ | Google Maps のURL | |
| Webサイト | いいえ | 公式サイトURL | |
| 備考 | いいえ | 自由テキスト | |

### 25.2 インポート処理フロー

```
1. ファイルアップロード
   │
   ├─ .csv → PapaParse でパース
   └─ .xlsx/.xls → xlsx ライブラリでパース
   │
2. バリデーション（全行）
   │  ├─ 必須フィールドチェック（病院名、住所、電話番号、市町村）
   │  ├─ 診療科: カンマ区切りパース → 1つ以上必須
   │  └─ エラー行: { row, message } の配列に蓄積
   │
3. 既存データの全削除（全件置換方式）
   │
4. 有効データの一括INSERT（バッチ方式）
   │
5. 結果返却
   └─ { success: 成功件数, errors: エラー行リスト }
```

**注意**: インポートは「全件置換」方式。既存データは全て削除され、CSVの内容で置き換わる。

### 25.3 エクスポート

- **形式**: UTF-8 BOM 付き CSV（`\uFEFF` プレフィックス → Excelでの文字化け防止）
- **ファイル名**: `hospitals_YYYY-MM-DD.csv`
- **カテゴリ配列**: ダブルクォートで囲む（例: `"内科,外科"`）
- **ソート**: 病院名の昇順

---

## 26. ビルド結果（2026年2月21日時点）

```
Route (app)                             Size  First Load JS
┌ /                                    622 B         121 kB
├ /admin/dashboard                       0 B         122 kB  ← Server Component（JS 0B）
├ /admin/hospitals                   2.85 kB         125 kB
├ /admin/hospitals/[id]/edit             0 B         124 kB  ← Server Component
├ /admin/hospitals/[id]/schedules    53.5 kB         176 kB
├ /admin/hospitals/import            3.65 kB         126 kB
├ /admin/hospitals/new                   0 B         124 kB  ← Server Component
├ /admin/login                       1.16 kB         123 kB
├ /contact                               0 B         121 kB  ← Server Component
├ /hospital/[id]                       427 B         121 kB
├ /questionnaire                     3.46 kB         124 kB
├ /results                          7.37 kB         128 kB  ← html2canvas動的インポート化（53kB→7.37kB）
├ /search                            2.14 kB         123 kB
├ /search/results                    2.72 kB         124 kB
└ /terms                                 0 B         121 kB  ← Server Component

型エラー: なし
リントエラー: なし
Supabase Advisor: セキュリティ ERROR 0件 / パフォーマンス WARN 0件
```
