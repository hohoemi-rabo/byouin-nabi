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
| Supabase | - | PostgreSQL + 認証 |
| OpenAI API | - | GPT-4o-mini（AI診断・実験的） |
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

# AI診断（実験的・本番有効化済み）
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_AI_DIAGNOSIS=true
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
│   ├── results/            # 結果表示
│   ├── search/             # 検索（条件 + 結果）
│   ├── hospital/[id]/      # 病院詳細
│   ├── contact/            # お問い合わせ
│   ├── terms/              # 利用規約
│   ├── admin/              # 管理画面（認証保護）
│   └── api/                # APIルート
├── components/             # UIコンポーネント
├── context/                # React Context
├── lib/                    # ユーティリティ（supabase, masterData, queryUtils）
└── types/                  # TypeScript型定義
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

---

**更新日**: 2026年2月20日
