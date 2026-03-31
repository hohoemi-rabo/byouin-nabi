# 病院ナビ南信 (Byouin-Nabi)

**症状から探す 安心の病院ナビ** | 本番運用中 | Vercel デプロイ済み

## ミッション

「症状があるのに、どの病院に行けばよいか分からない」という南信地域住民の悩みを解決する Web サービス。
主要ユーザーは40代〜シニア層（特に60代以上）。スマホ操作が苦手な方向けの大きな文字・簡単操作を重視。

---

## 重要な安全警告

### Supabase プロジェクト

- **使用禁止**: `taihei-studio` (ID: `gzwugjcjobnsbuagjjyf`) - 別サービス稼働中、絶対に操作禁止
- **使用する**: `byouin-nabi` (ID: `xsydqbczmzfufeywjfps`) - 東京リージョン
- MCP 使用時は必ずプロジェクトID `xsydqbczmzfufeywjfps` を確認

---

## 技術スタック

| 技術 | バージョン | 備考 |
|------|-----------|------|
| Next.js | 15.5.7 | App Router（Pages Router ではない） |
| React | 19.1.0 | Server Components 対応 |
| TypeScript | 5.x | `strict: true` |
| Tailwind CSS | 3.4.17 | ユーティリティファースト |
| Supabase | - | PostgreSQL + Supabase Auth（`@supabase/ssr`） |
| Gemini API | - | `gemini-3.1-flash-lite-preview`（AI緊急度判定・受診レコメンド） |
| Google Maps Platform | - | 地図表示・ルート検索・Geocoding |
| `@react-google-maps/api` | - | Google Maps React コンポーネント |
| html2canvas | - | 症状説明文の画像保存 |

## npm スクリプト

```bash
npm run dev     # 開発サーバー（Turbopack）→ http://localhost:3000
npm run build   # 本番ビルド
npm start       # 本番サーバー起動
npm run lint    # ESLint 実行
```

---

## 開発の基本原則

### TypeScript

- `strict: true` を遵守、`any` 型は最小限に
- Props は必ず型定義
- パスエイリアス `@/*` → `./src/*`

### ファイル命名規約

- コンポーネント: PascalCase（`QuestionnaireForm.tsx`）
- ユーティリティ: camelCase（`formatDate.ts`）
- API ルート: `route.ts`

### コミット規約

```
feat: 新機能 / fix: バグ修正 / docs: ドキュメント
test: テスト / refactor: 再構成 / chore: 保守作業
```

---

## 環境変数

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xsydqbczmzfufeywjfps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # 管理機能用（サーバー側のみ）

# 管理画面認証
ADMIN_PASSWORD=...

# Gemini API（AI緊急度判定・受診レコメンド）
GEMINI_API_KEY=...

# Google Maps API（地図表示・ルート検索）
GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

- `NEXT_PUBLIC_*`: クライアント側で必要な場合のみ
- Server-only シークレットはプリフィックスなし

---

## プロジェクト構造（概要）

```
src/
├── app/                    # App Router ルート
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # ホーム
│   ├── questionnaire/      # アンケート
│   ├── results/            # 結果表示（AI緊急度判定統合）
│   ├── search/             # 検索（条件 + 結果）
│   ├── hospital/[id]/      # 病院詳細（地図埋め込み + 行き方ボタン）
│   ├── route/              # ルート検索結果（Phase 2）
│   ├── login/              # ログイン（Phase 2）
│   ├── signup/             # 新規登録（Phase 2）
│   ├── mypage/             # マイページ・プロフィール・設定（Phase 2）
│   ├── auth/callback/      # Supabase Auth コールバック（Phase 2）
│   ├── contact/            # お問い合わせ
│   ├── terms/              # 利用規約
│   ├── admin/              # 管理画面（病院 + 交通手段管理）
│   └── api/                # APIルート
│       ├── hospitals/      # 病院データ
│       ├── search/         # 病院検索
│       ├── symptoms/       # 症状説明文生成 + AI緊急度判定
│       ├── transport/      # 交通サービス
│       ├── route/search/   # ルート検索
│       ├── geocode/        # 住所→座標変換
│       └── user/           # プロフィール・かかりつけ医・履歴（Phase 2）
├── components/
│   ├── Common/             # 共通UI（Header, Footer, Button, Accordion 等）
│   ├── Questionnaire/      # アンケート機能
│   ├── SymptomResult/      # 症状結果・緊急度バッジ
│   ├── HospitalList/       # 病院リスト・カード
│   ├── Map/                # Google Maps 地図表示（Phase 2）
│   ├── Route/              # ルート検索UI（Phase 2）
│   ├── Auth/               # AuthGuard（Phase 2）
│   ├── User/               # FavoriteButton, ProfileForm, HistoryRecorder（Phase 2）
│   ├── Admin/              # 管理画面フォーム
│   └── Layout/             # AdminLayout
├── context/                # React Context
│   ├── QuestionnaireContext.tsx  # アンケートデータ
│   └── AuthContext.tsx          # Supabase Auth 状態管理（Phase 2）
├── lib/                    # ユーティリティ
│   ├── supabase.ts         # 公開用クライアント（Anon Key）
│   ├── supabase-admin.ts   # 管理用クライアント（Service Role Key）
│   ├── supabase-browser.ts # ブラウザ用認証クライアント（Phase 2）
│   ├── supabase-server.ts  # サーバー用認証クライアント（Phase 2）
│   ├── gemini.ts           # Gemini AI クライアント（Phase 2）
│   ├── departmentMapping.ts # 部位→診療科マッピング
│   ├── fallbackUrgency.ts  # ルールベース緊急度判定（Phase 2）
│   ├── transportMatcher.ts # 地域交通マッチング（Phase 2）
│   └── masterData.ts       # 診療科20種・市町村14自治体
└── types/                  # TypeScript型定義
    ├── hospital.ts         # Hospital, HospitalSchedule
    ├── questionnaire.ts    # QuestionnaireData
    ├── ai.ts               # UrgencyLevel, AIRecommendResponse（Phase 2）
    ├── transport.ts        # TransportService, BusRoute 等（Phase 2）
    ├── route.ts            # Route, RouteSearchResponse（Phase 2）
    ├── user.ts             # Profile, FavoriteFacility 等（Phase 2）
    └── facility.ts         # Facility, SearchLog（Phase 2）
```

---

## ルール構成（.claude/rules/）

詳細なルールはパスベースで分割管理しています:

| ファイル | 対象 | 内容 |
|---------|------|------|
| `frontend.md` | `src/app/**`, `src/components/**` | Next.js/React パターン、スタイリング |
| `api-routes.md` | `src/app/api/**`, `actions.ts` | API設計、Server Actions |
| `database.md` | `src/lib/supabase*`, `src/types/**` | テーブル構造、Supabase クエリ |
| `admin.md` | `src/app/admin/**` | 管理画面、認証、CSV |
| `accessibility.md` | `src/components/**`, `src/app/**` | a11y、シニア向けUI、医療法 |
| `completion-log.md` | 常時 | チケット完了状況、ビルド結果 |

---

## クイックリファレンス

### 開発開始

```bash
cd /home/masayuki/NextJs/byouin-nabi
npm install && npm run dev
```

### チケット管理

- チケットファイル: `/docs/` ディレクトリ
- 詳細: `/docs/README.md`
- 完了状況: `.claude/rules/completion-log.md`

### チケット内 Todo 管理

各チケットファイル（`/docs/015-*.md` 等）では Todo を以下の形式で管理する:

- `- [ ]` 未完了タスク
- `- [x]` 完了タスク

**ルール**:
- タスクに着手したら完了後に必ず `- [ ]` → `- [x]` に更新する
- チケット内の全 Todo が `- [x]` になったら、`.claude/rules/completion-log.md` にも完了を記録する
- Todo の粒度は「1回のコミットで完結できる程度」を目安にする

---

**更新日**: 2026年4月1日
