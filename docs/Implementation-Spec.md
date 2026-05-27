# 病院ナビ南信 — 実装仕様書

**バージョン**: Phase 2 実装完了時点
**作成日**: 2026年5月26日
**ステータス**: 本番運用中

---

## 1. プロジェクト概要

### 1.1 ミッション

「症状があるのに、どの病院に行けばよいか分からない」という南信地域（飯田市・下伊那郡）住民の悩みを解決する Web サービス。
主要ユーザーは 40 代〜シニア層（特に 60 代以上）。スマホ操作が苦手な方向けの大きな文字・簡単操作を重視。

### 1.2 主要機能（4 つの入り口）

| 機能 | 入り口 | 概要 |
|------|--------|------|
| 症状から病院検索 | `/` → `/questionnaire` | 簡単アンケート → AI による緊急度判定 + 推奨診療科 + 病院リスト |
| 条件指定検索 | `/search` | 診療科・市町村・キーワード・設備フィルター |
| お出かけナビ | `/outing` | 病院以外の施設（買い物・役所・銀行等）への行き方 |
| 緊急時ガイド | `/emergency` | 119 番通報 + 応急処置 + 救急対応病院一覧 |

### 1.3 ターゲットユーザー

- **主要層**: 40 代〜シニア層、特に 60 代以上
- **想定課題**:
  - スマホ操作が苦手
  - 症状に対してどの診療科か判断できない
  - 医師に症状をうまく説明できない
  - 通院の交通手段が分からない（高齢で運転困難）

---

## 2. 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| フレームワーク | Next.js | 15.5.7 | App Router、Server Components |
| ライブラリ | React | 19.1.0 | UI |
| 言語 | TypeScript | 5.x | `strict: true` |
| スタイリング | Tailwind CSS | 3.4.17 | ユーティリティファースト |
| BaaS | Supabase | - | PostgreSQL + Auth（`@supabase/ssr` 0.10.0） |
| AI | Gemini API | - | `gemini-3.1-flash-lite-preview`（緊急度判定・追加質問） |
| 地図 | Google Maps Platform | - | 地図表示・Geocoding・Directions |
| 地図 React | `@react-google-maps/api` | 2.20.8 | 地図埋め込みコンポーネント |
| 状態管理 | Zustand | 5.0.12 | 出発地キャッシュ、UI 設定 |
| PWA | `@ducanh2912/next-pwa` | 10.2.9 | Service Worker、オフライン対応 |
| 画像保存 | html2canvas | 1.4.1 | 症状説明文の画像保存（動的 import） |
| CSV/Excel | papaparse / xlsx | 5.5.3 / 0.18.5 | 管理画面インポート |

### 2.1 ホスティング

- **Vercel** — Next.js のネイティブホスティング
- **Supabase** — 東京リージョン（`ap-northeast-1`）、プロジェクト ID `xsydqbczmzfufeywjfps`

### 2.2 ビルド・開発コマンド

```bash
npm run dev     # 開発サーバー（Turbopack） → http://localhost:3000
npm run build   # 本番ビルド（PWA 有効）
npm start       # 本番サーバー起動
npm run lint    # ESLint
```

---

## 3. アーキテクチャ

### 3.1 全体構成

```
┌─────────────────────┐
│  Browser (PWA)      │
│  - シニア向け UI    │
│  - フォントサイズ可 │
│  - オフライン対応   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌──────────────┐
│  Next.js (Vercel)   │ ◀──▶│  Supabase    │
│  - App Router       │     │  - Postgres  │
│  - Server Components│     │  - Auth      │
│  - API Routes       │     │  - RLS       │
│  - Middleware       │     └──────────────┘
└──┬───────┬───────┬──┘
   │       │       │
   ▼       ▼       ▼
┌────┐ ┌──────┐ ┌─────────┐
│Gemini│ Google│ │ (将来) │
│ API │ Maps  │ │ メール  │
└─────┘ └──────┘ └─────────┘
```

### 3.2 認証アーキテクチャ（2 系統）

| 系統 | 対象 | 認証方式 | 認証チェック場所 |
|------|------|----------|------------------|
| **一般ユーザー** | `/mypage/*`, `/api/user/*` | Supabase Auth（メール＋パスワード）+ Cookie | `middleware.ts`（セッション更新）+ `AuthGuard`（UI 側）+ API ルート内 |
| **管理者** | `/admin/*` | Cookie 認証（`admin-auth=true`） | `middleware.ts`（リダイレクト）+ Server Actions 内 `verifyAdminAuth()` |

- 管理者は 1 名のみ（`ADMIN_PASSWORD` 環境変数で固定パスワード）
- Supabase Auth セッションは middleware で毎リクエストリフレッシュ
- 管理操作は `supabaseAdmin`（Service Role Key）で RLS をバイパス

### 3.3 ディレクトリ構成

```
byouin-nabi/
├── middleware.ts                # Supabase セッション更新 + 管理画面認証
├── next.config.ts               # PWA 設定（本番のみ有効）
├── public/
│   ├── manifest.json            # PWA マニフェスト
│   ├── icons/                   # PWA アイコン（192/512）
│   └── templates/               # CSV インポートテンプレート
└── src/
    ├── app/
    │   ├── layout.tsx           # Header/Footer/BottomNav/AuthProvider
    │   ├── page.tsx             # ホーム
    │   ├── globals.css          # Tailwind + CSS 変数
    │   ├── error.tsx, loading.tsx, not-found.tsx
    │   ├── ~offline/            # PWA オフラインフォールバック
    │   ├── [機能ページ]/        # questionnaire, results, search, hospital, ...
    │   ├── admin/               # 管理画面 + actions.ts
    │   └── api/                 # API Routes（17 本）
    ├── components/
    │   ├── Common/              # Header, Footer, BottomNav, Accordion, ...
    │   ├── Questionnaire/       # QuestionnaireForm, QuestionOption
    │   ├── SymptomResult/       # UrgencyBadge, FollowUpChat, ImageSaveButton, ...
    │   ├── HospitalList/        # HospitalListItem(memo), HospitalCard, ScheduleTable
    │   ├── Map/                 # HospitalMap, HospitalMapWrapper
    │   ├── Route/               # LocationInput, RouteCard
    │   ├── Outing/              # FacilityCard
    │   ├── Auth/                # AuthGuard
    │   ├── User/                # FavoriteButton, HistoryRecorder, ProfileForm
    │   └── Admin/               # HospitalForm, TransportForm, FacilityForm, ...
    ├── context/
    │   ├── AuthContext.tsx          # Supabase Auth + Profile グローバル
    │   └── QuestionnaireContext.tsx # アンケート状態 + LocalStorage 永続化
    ├── stores/                  # Zustand
    │   ├── locationStore.ts     # 出発地キャッシュ（sessionStorage）
    │   └── uiStore.ts           # フォントサイズ（localStorage）
    ├── lib/
    │   ├── supabase.ts              # 公開クライアント（Anon Key）
    │   ├── supabase-admin.ts        # 管理クライアント（Service Role Key）
    │   ├── supabase-browser.ts      # ブラウザ用（シングルトン）
    │   ├── supabase-server.ts       # サーバー用（Cookie ベース）
    │   ├── gemini.ts                # Gemini クライアント + 定数
    │   ├── departmentMapping.ts     # 部位 → 診療科マッピング
    │   ├── fallbackUrgency.ts       # ルールベース緊急度判定
    │   ├── hospitalScoring.ts       # 病院スコアリング + 営業中判定
    │   ├── transportMatcher.ts      # 地域交通マッチング
    │   ├── generateSymptomDescription.ts  # 症状説明文テンプレート生成
    │   ├── queryUtils.ts            # クエリ文字列ユーティリティ
    │   └── masterData.ts            # 診療科 20 + 自治体 14
    └── types/                   # 型定義（hospital, questionnaire, ai, ...）
```

---

## 4. ページ一覧（公開）

### 4.1 ホーム `/`

- **タイプ**: Server Component
- **内容**: ヒーロー + 3 つの主要機能ボタン（症状検索 / 条件検索 / お出かけナビ）+ 特徴・使い方説明 + CTA
- **コンポーネント**: `StartQuestionnaireButton`

### 4.2 症状アンケート `/questionnaire`

- **タイプ**: Server Component（`QuestionnaireProvider` ラップ） + Client Form
- **入力項目**（`QuestionnaireData`）:
  - `location` — 部位（複数選択：のど/むね/おなか/あし/うで/あたま/かお/せなか/こし/その他）
  - `duration` — 期間（今日 / 2-3 日前 / 1 週間前 / 2 週間前 / 1 ヶ月以上前）
  - `symptoms` — 症状（複数選択：痛い/しこり/かゆい/赤い・はれ/熱/せき/息苦しい/めまい/その他）
  - `lumpSize` — 条件付き：しこりの大きさ
  - `conditions` — 持病（複数選択：なし/血圧・心臓/糖尿病/腎臓/肝臓/がん/アレルギー/その他）
  - `medicine` — 服薬有無
  - `memo` — 自由記述
- **永続化**: LocalStorage（`byouin-nabi-questionnaire-data`）
- **完了時**: `/results` へ遷移

### 4.3 結果ページ `/results`

- **タイプ**: Client Component（`QuestionnaireContext` から読込）
- **データ取得**: 並列で `/api/symptoms/generate` と `/api/symptoms/ai-recommend` を呼出
- **表示構成**:
  1. **UrgencyBadge**（最上部、目立つ位置）— AI 緊急度判定（emergency/soon/watch）+ 理由 + アドバイス + 免責
  2. **Accordion: 推奨される診療科**（デフォルト開く）— AI 推奨 → ルールベースの順で優先
  3. **Accordion: 症状まとめを見る** — テンプレベース症状説明文 + 画像保存ボタン
  4. **FollowUpChat** — 「もっと詳しく調べる」AI 追加質問 2-3 問 → 再判定
  5. **HospitalList** — 推奨診療科に対応する病院（スコアリング順）
- **匿名検索ログ**: `SearchLogger` が `/api/logs` に記録

### 4.4 条件検索 `/search` + 結果 `/search/results`

- **入力**:
  - キーワード（病院名 ILIKE 検索）
  - 診療科チェックボックス（20 科）
  - 市町村チェックボックス（14 自治体）
  - 設備フィルター：バリアフリー / 駐車場 / 救急対応
- **遷移**: 検索ボタン → `/search/results?categories=...&cities=...&keyword=...`
- **結果表示**: `HospitalListItem`（`memo` 化済み、ハイライト診療科表示）

### 4.5 病院詳細 `/hospital/[id]`

- **タイプ**: Server Component（`Promise.all` で params/searchParams 並列解決）
- **動的メタデータ**: `generateMetadata` で病院名・診療科を出力
- **表示**:
  - `HospitalCard` — 基本情報 + 診療時間テーブル + 電話/地図/Web ボタン
  - `HospitalMapWrapper` — Google Maps 埋込（lat/lng がある場合のみ）
  - `FavoriteButton` — かかりつけ医登録（ログイン時のみ）
  - `HistoryRecorder` — 受診履歴自動記録（ログイン時のみ）
  - 「ここへの行き方を調べる」→ `/route?to={id}&name={name}`
- **戻り先**: クエリ `from=results` で `/results` へ、それ以外は `/search` へ条件保持

### 4.6 ルート検索 `/route`

- **クエリパラメータ**:
  - `to` — 病院 ID または `lat,lng`
  - `from` — オプション、`lat,lng`（指定時は自動検索）
  - `name` — 目的地名（表示用）
- **出発地入力 `LocationInput`** — 3 モード:
  - **GPS** — `navigator.geolocation`
  - **住所入力** — Geocoding API
  - **地区選択** — 14 自治体 → 「{市町村} 役場」を Geocoding
- **キャッシュ**: Zustand `locationStore`（sessionStorage）で前回の出発地を保持
- **検索結果**: 最大 3 ルート
  - 1. Google Maps Driving（自家用車）
  - 2. Google Maps Transit（公共交通）
  - 3. 地域交通（送迎バス・デマンド・タクシー・福祉タクシー）

### 4.7 お出かけナビ `/outing` + `/outing/[category]`

- **カテゴリ**: shopping / government / banking / welfare / leisure
- **施設一覧**: 市町村フィルタ + `FacilityCard` 表示

### 4.7.1 救急ローテーション（管理データ）

Phase 2.1 で `emergency_rotations` テーブル + 管理画面を追加。データソースは飯伊地区包括医療協議会の予定表。
表示側（`/emergency` ページ拡張やカレンダー）は別途実装予定（Expo 連携優先）。

### 4.8 緊急時ガイド `/emergency`

- **タイプ**: Server Component（直接 Supabase 読込）
- **内容**:
  - 巨大な 119 番ボタン（`tel:119`）
  - 応急処置 4 ステップ
  - 救急対応病院リスト（`emergency_available=true`）
  - 免責事項

### 4.9 ユーザー認証

| パス | 内容 |
|------|------|
| `/login` | Supabase Auth `signInWithPassword` |
| `/signup` | Supabase Auth `signUp`（6 文字以上） |
| `/auth/callback` | Supabase Auth コールバック |

### 4.10 マイページ（要ログイン）

| パス | 内容 |
|------|------|
| `/mypage` | アカウント情報 + プロフィール表示 + かかりつけ医（並び替え可）+ 受診履歴 + ログアウト |
| `/mypage/profile` | プロフィール編集（`ProfileForm`：表示名/年齢層/住所/自家用車/移動補助/フォントサイズ） |
| `/mypage/settings` | 設定（プロフィール編集リンク + ログアウト） |

### 4.11 静的ページ

| パス | 内容 |
|------|------|
| `/contact` | お問い合わせ |
| `/terms` | 利用規約 |
| `/~offline` | PWA オフラインフォールバック（119 番ボタン + 再読み込み） |

---

## 5. ページ一覧（管理画面）

全て `/admin/login` 以外は Cookie 認証（`admin-auth=true`）必須。`middleware.ts` でガード。

| パス | 機能 |
|------|------|
| `/admin/login` | パスワードログイン（`AdminLayout` 非表示） |
| `/admin/dashboard` | Server Component。統計（病院数/市町村数/診療科数/交通/施設/ユーザー数/今月の検索数）+ クイックアクション |
| `/admin/hospitals` | 病院一覧 + 編集・削除・診療時間ボタン + Toast 通知 |
| `/admin/hospitals/new` | 新規登録（`HospitalForm`） |
| `/admin/hospitals/[id]/edit` | 編集 |
| `/admin/hospitals/[id]/schedules` | 診療時間編集（曜日別） |
| `/admin/hospitals/import` | CSV/Excel 一括インポート（全削除 → バッチ INSERT） |
| `/admin/transport` 系 | 交通サービス CRUD + インポート |
| `/admin/facilities` 系 | お出かけナビ施設 CRUD + インポート |
| `/admin/emergency-rotations` | 救急ローテーション一覧（月選択タブ + 種別フィルタ + 月次全削除） |
| `/admin/emergency-rotations/new` | 新規登録 |
| `/admin/emergency-rotations/[id]/edit` | 編集 |
| `/admin/emergency-rotations/import` | CSV/Excel 月単位インポート |
| `/admin/emergency-rotations/generate-night` | 夜間急患診療所の月次自動生成（夜間枠＝毎日／昼間枠＝日曜・祝日） |

### 5.1 管理 Server Actions（`src/app/admin/actions.ts`）

全関数で先頭に `await verifyAdminAuth()` を実行。

| 関数 | 役割 |
|------|------|
| `createHospital(formData)` | 病院新規登録 |
| `updateHospital(id, formData)` | 病院情報更新 |
| `deleteHospital(id)` | 病院削除 |
| `importHospitals(formData)` | CSV/Excel パース → 全削除 → バリデーション → バッチ INSERT |
| `exportHospitalsCSV()` | UTF-8 BOM 付き CSV エクスポート |
| `getHospitalSchedules(id)` | 診療時間取得 |
| `updateHospitalSchedules(id, data)` | 診療時間全削除 → 一括 INSERT |
| `geocodeAllHospitals()` | `latitude IS NULL` の病院を一括 Geocoding（50ms 待機でレート制限対策） |
| `createEmergencyRotation(formData)` | 救急ローテーション 1 件登録 |
| `updateEmergencyRotation(id, formData)` | 救急ローテーション 1 件更新 |
| `deleteEmergencyRotation(id)` | 救急ローテーション 1 件削除 |
| `deleteRotationsByMonth(sourceMonth)` | 指定月の全データ削除 |
| `getEmergencyRotationsByMonth(sourceMonth)` | 月別取得（一覧画面用） |
| `getAvailableSourceMonths()` | 登録済み `source_month` 一覧（タブ表示用） |
| `importEmergencyRotations(formData, sourceMonth)` | CSV/Excel 月単位一括取込（同月全削除 → バリデーション → バッチ INSERT） |
| `generateNightEmergencyRotations(sourceMonth, info)` | 夜間急患診療所の月次自動生成（祝日判定込み） |

---

## 6. API エンドポイント一覧（17 本）

### 6.1 パブリック API（認証不要）

| メソッド | パス | 説明 |
|---------|------|------|
| `POST` | `/api/symptoms/generate` | テンプレベース症状説明文生成（バリデーション付き） |
| `POST` | `/api/symptoms/ai-recommend` | Gemini AI 緊急度判定 + 推奨診療科（5 秒タイムアウト、失敗時フォールバック）。`follow_up_answers` 受付可 |
| `POST` | `/api/symptoms/follow-up` | AI 追加質問 2-3 問生成（10 秒タイムアウト） |
| `GET` | `/api/hospitals` | 全病院リスト（必要カラムのみ + `schedules` join） |
| `GET` | `/api/search` | 検索（`categories`/`cities`/`keyword`/`barrier_free`/`parking`/`emergency`） |
| `GET` | `/api/facilities` | 施設一覧（`category`/`city` フィルタ） |
| `POST` | `/api/logs` | 匿名検索ログ記録（symptom/search/outing/route） |
| `GET` | `/api/transport` | 交通サービス一覧（`area`/`type` フィルタ） |
| `GET` | `/api/transport/[id]` | 交通サービス詳細 |
| `POST` | `/api/route/search` | ルート検索（Directions × 2 + 地域交通、最大 3 件） |
| `GET` | `/api/geocode` | 住所 → 座標変換 |

### 6.2 認証必須 API（Supabase Auth、`/api/user/*`）

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/api/user/profile` | プロフィール取得（`PGRST116` は新規ユーザー扱い） |
| `PUT` | `/api/user/profile` | プロフィール upsert（必須: display_name/age_group/area） |
| `GET` | `/api/user/favorites` | 全件取得（hospital 結合、sort_order 順）または `?check={id}` で 1 件チェック |
| `POST` | `/api/user/favorites` | 登録（最大 5 件、重複 23505 でエラー） |
| `PUT` | `/api/user/favorites` | 並び順更新（RPC `update_favorite_order` でバッチ） |
| `DELETE` | `/api/user/favorites` | 解除 |
| `GET` | `/api/user/history` | 受診履歴（RPC `get_unique_history` で病院重複除去、直近 10 件） |
| `POST` | `/api/user/history` | 履歴記録 |

### 6.3 管理 API

| メソッド | パス | 説明 |
|---------|------|------|
| `POST` | `/api/admin/login` | 管理者ログイン（`ADMIN_PASSWORD` 検証 + Cookie 発行、httpOnly/secure/sameSite=strict、24h） |
| `POST` | `/api/admin/logout` | Cookie 削除 |

### 6.4 運用

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/api/keepalive` | `?token=` で `KEEPALIVE_TOKEN` 検証。Supabase の自動停止防止用 cron 起動エンドポイント |

---

## 7. AI 機能仕様

### 7.1 緊急度判定 + 推奨診療科（`/api/symptoms/ai-recommend`）

- **モデル**: `gemini-3.1-flash-lite-preview`（`src/lib/gemini.ts`）
- **タイムアウト**: 5 秒
- **出力構造**:
  ```json
  {
    "urgency": "emergency" | "soon" | "watch",
    "urgency_reason": "緊急度の判定理由（1〜2 文）",
    "recommended_departments": ["診療科 1", "診療科 2"],
    "department_reason": "診療科推奨の理由",
    "advice": "受診までの注意点",
    "disclaimer": "※この判定は医療診断ではありません..."
  }
  ```
- **入力**: アンケート全項目 + 任意で `age_group`、`area`、`follow_up_answers`
- **バリデーション**: `recommended_departments` をマスターリスト（`ALL_DEPARTMENTS` 20 科）でフィルタ。空なら `['内科']`
- **フォールバック条件**:
  - `GEMINI_API_KEY` 未設定 → `source: 'fallback'`
  - API 失敗・タイムアウト・JSON パース失敗 → `source: 'fallback'`
- **フォールバック内容**:
  - 緊急度: `fallbackUrgency.ts` のルール（息苦しい/めまい → emergency、熱/痛い → soon、それ以外 → watch）
  - 診療科: `departmentMapping.ts` のルール（部位 → 診療科テーブル + 緊急症状で内科優先 + 皮膚症状で皮膚科追加）

### 7.2 追加質問生成（`/api/symptoms/follow-up`）

- **タイムアウト**: 10 秒
- **出力**: 2-3 問の配列、`type: select | text`、select の場合 3-5 個の選択肢
- **失敗時**: 空配列を返す（UI 側でエラーメッセージ）

### 7.3 症状説明文生成（`/api/symptoms/generate`）

- **方式**: テンプレートベース（AI 不使用）。`generateSymptomDescription.ts`
- **セクション**: 症状について / いつから / 状態（チェックリスト） / 持病・薬 / 本人のメモ + 免責事項
- **用途**: 病院受付・医師に見せる説明文。画像保存可能（`html2canvas` 動的 import）

### 7.4 医療法準拠

- 「診断」「治療」など医療行為を示唆する語を回避
- 「参考情報」「受診の目安」と表現
- AI 結果に必ず免責事項（`disclaimer`）を表示
- 緊急時は 119 番通報を明示

---

## 8. ルート検索仕様（`/api/route/search`）

### 8.1 処理フロー

```
1. 出発地解決
   - 座標指定: そのまま使用
   - 住所指定: Geocoding API
2. 目的地解決
   - hospital_id 指定: hospitals テーブルから lat/lng 取得
   - 座標指定: そのまま使用
3. 出発地の市町村取得（reverse geocode）
4. 並列ルート取得:
   - Google Directions (driving)
   - Google Directions (transit)
   - 地域交通マッチング (matchTransportServices)
5. 統合 (最大3件):
   - 自家用車 → 公共交通 → 地域交通の順
   - 地域交通は service_type の重複を避ける
```

### 8.2 地域交通マッチング（`lib/transportMatcher.ts`）

- 出発地の市町村が `service_area` に含まれる `transport_services` を抽出
- `wheelchair=true` 指定時は `wheelchair_accessible=true` で絞り込み
- 種別ごとにルート生成：
  - `shuttle` — 目的地が病院の場合のみ
  - `demand` — 全件
  - `taxi` / `welfare_taxi` — 全件
- 各ルートに予約方法・電話番号・予約期限・料金情報を含める

---

## 9. 病院スコアリング（`lib/hospitalScoring.ts`）

検索結果ページや症状結果ページで病院をソートする際のスコア計算。

| 加点項目 | 点数 |
|---------|------|
| 推奨診療科に一致 | +100 |
| かかりつけ医に登録済み | +50 |
| 救急対応（緊急度 emergency 時のみ） | +40 |
| 現在営業中 | +30 |

### 9.1 営業中判定（`isCurrentlyOpen`）

- 現在の曜日と時刻を取得
- `hospital_schedules` から該当曜日の枠を取得
- 午前枠 OR 午後枠の時刻範囲内ならば `true`
- `is_closed=true` または該当曜日のスケジュール無しは `false`

---

## 10. 状態管理

### 10.1 React Context

| Context | 永続化 | 用途 |
|---------|--------|------|
| `QuestionnaireContext` | LocalStorage (`byouin-nabi-questionnaire-data`) | アンケート全項目 |
| `AuthContext` | （Supabase セッション） | user, profile, signOut, refreshProfile。シングルトン Supabase ブラウザクライアントで管理 |

### 10.2 Zustand ストア

| ストア | 永続化先 | 用途 |
|--------|----------|------|
| `useLocationStore` | sessionStorage (`byouin-nabi-location`) | 出発地キャッシュ（タブ閉じるまで保持） |
| `useUIStore` | localStorage (`byouin-nabi-ui`) | フォントサイズ（medium/large/xlarge） |

---

## 11. PWA 対応

### 11.1 マニフェスト（`public/manifest.json`）

- **name**: 病院ナビ南信
- **start_url**: `/`
- **display**: standalone
- **theme_color**: `#1e40af`（プライマリ青）
- **icons**: 192×192, 512×512（maskable）

### 11.2 Service Worker

- `@ducanh2912/next-pwa` で本番ビルド時のみ生成
- `next.config.ts` で開発時は無効化（Turbopack 互換性のため）
- **オフラインフォールバック**: `/~offline` ページ（119 番ボタン常時表示）
- `.gitignore` に `fallback-*.js` 追加（生成物）

---

## 12. アクセシビリティ・シニア対応

### 12.1 基準

| 項目 | 基準 |
|------|------|
| フォントサイズ | 最小 18px、xlarge モード 24px〜 |
| タップ領域 | 最小 48px × 48px（`min-h-tap` クラス） |
| コントラスト比 | WCAG AA 以上 |
| キーボード操作 | 全機能対応 |

### 12.2 実装

- **セマンティック HTML**:
  - Header: `role="banner"`、Footer: `role="contentinfo"`、Main: `id="main-content" role="main"`
  - スキップリンク: `<a href="#main-content">メインコンテンツへスキップ</a>`（`layout.tsx`）
- **CSS 対応**:
  - `prefers-reduced-motion` — アニメーション無効化
  - `prefers-contrast: high` — ハイコントラスト
  - `.sr-only` — スクリーンリーダー専用
- **モバイル**:
  - `MobileFixedFooter` — スマホ用固定フッター（戻るボタン）
  - `BottomNav` — モバイルボトムナビゲーション
  - `FontSizeToggle` — フォントサイズ切替（`useUIStore` 連携）
- **電話アクション**: 全電話番号を `<a href="tel:...">` で電話アプリ起動

---

## 13. セキュリティ

### 13.1 Supabase RLS（Row Level Security）

全テーブルで RLS 有効。詳細は `Database-Schema.md` 参照。

- 公開テーブル（hospitals 等）: `anon` は SELECT のみ
- ユーザーテーブル（profiles 等）: `auth.uid()` で本人のみアクセス
- 管理書込: `service_role` ロール（Server Actions 経由）
- RLS 関数は `(select auth.uid())` でキャッシュ化（パフォーマンス最適化）

### 13.2 環境変数の分離

- `NEXT_PUBLIC_*` — クライアント露出可（Supabase URL/Anon Key/Maps Key）
- プリフィックス無し — サーバー専用（Service Role Key/Admin Password/Gemini Key/Keepalive Token）

### 13.3 認証 Cookie

- 管理者 Cookie: `httpOnly`, `secure` (本番のみ), `sameSite: 'strict'`, `maxAge: 24h`
- Supabase セッション: `@supabase/ssr` 公式パターンで管理

### 13.4 入力検証

- API ルートで必須項目チェック
- アンケート: しこり選択時は大きさ必須など条件付きバリデーション
- 管理 Server Action: バリデーション後にバッチ INSERT
- Geocoding/Directions: API キー漏洩防止のためサーバー側プロキシ経由

---

## 14. 環境変数

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xsydqbczmzfufeywjfps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # 管理機能用（サーバー専用）

# 管理画面認証
ADMIN_PASSWORD=...                       # 管理者 1 名分

# AI
GEMINI_API_KEY=...                       # サーバー専用

# Google Maps
GOOGLE_MAPS_API_KEY=...                  # サーバー用（Geocoding/Directions）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...      # クライアント用（地図表示）

# 運用
KEEPALIVE_TOKEN=...                      # Supabase keepalive 用
```

---

## 15. パフォーマンス最適化

### 15.1 React/Next.js

- **Server Components** デフォルト、Client Components は必要箇所のみ
- **動的 import**: `html2canvas` を `await import()` で使用時のみロード（86% バンドル削減）
- **`React.memo`**: `HospitalListItem`, `QuestionOption`, `QuestionnaireForm`, `FollowUpChat`
- **`useCallback`**: メモ化された子に渡す全ハンドラ
- **モジュールスコープのデフォルト値**: 非プリミティブを巻き上げて参照を安定化
- **`Promise.all`**: 独立 await を並列化（params/searchParams 同時解決等）
- **`generateMetadata`**: `/hospital/[id]`, `/outing/[category]`

### 15.2 Supabase

- **`select('*')` 回避**: API では必要カラムのみ指定
- **複合インデックス**: `search_history(user_id, created_at DESC)`
- **GIN インデックス**: `hospitals.category`, `transport_services.service_area`
- **RPC 関数**:
  - `update_favorite_order(p_user_id, p_ordered_ids)` — N+1 解消バッチ更新
  - `get_unique_history(p_user_id, p_limit)` — DB 側 DISTINCT ON で重複除去
- **RLS キャッシュ**: `(select auth.role())` で関数結果をキャッシュ

### 15.3 ビルド結果（参考）

```
Route (app)                        Size  First Load JS
┌ /                              6.01 kB         189 kB
├ /_not-found                       0 B         183 kB
├ /admin/dashboard                  0 B         184 kB  (Server Component)
├ /hospital/[id]                2.43 kB         185 kB
├ /questionnaire                3.53 kB         186 kB
├ /results                         9 kB         192 kB
├ /search                       2.43 kB         185 kB
├ /search/results               3.68 kB         187 kB
└ /outing/[category]            2.91 kB         186 kB
```

---

## 16. 既知の制約・今後の課題

### 16.1 未実装（Phase 2 残）

- **022 — 受診リマインダー・メール通知**（テーブル `visit_reminders` は存在、UI/cron 未実装）
- **023 — 家族見守り機能**（テーブル `family_links` は存在、UI 未実装）
- **031 — Phase 2 テスト・結合・デプロイ**

### 16.2 未実装（Phase 1 残）

- **013 — テスト実装**（Vitest/Playwright 未着手）

### 16.3 運用上の注意

- Supabase Advisor:
  - セキュリティ WARN 2 件：`search_logs` INSERT（意図的 — 匿名ログ収集のため）、漏洩 PW 保護（ダッシュボード設定で対応）
  - パフォーマンス INFO：未使用インデックスあり（Phase 2 のデータ増加で解消見込み）
- AI フォールバック発動時はユーザーから見て差異がない設計（`source` フィールドで識別可能）
- `geocodeAllHospitals` は Google Maps API のレート制限対策で 50ms 待機

---

## 17. 関連ドキュメント

- **`docs/Database-Schema.md`** — DB スキーマ詳細
- **`docs/Phase1-Specification.md`** — Phase 1 初期仕様（91 KB）
- **`docs/Phase2-Requirements.md`** — Phase 2 要件定義（64 KB）
- **`docs/000-031`** — 各チケット詳細
- **`.claude/rules/`** — 開発ルール（frontend/api-routes/database/admin/accessibility/completion-log）
- **`CLAUDE.md`** — プロジェクト全体ガイド
