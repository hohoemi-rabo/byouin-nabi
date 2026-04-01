# 実装完了状況 & チケット管理

## チケット完了状況（2026年2月21日時点）

| # | チケット | ステータス | 実装日 |
|---|---------|----------|--------|
| 000 | プロジェクトセットアップ | 完了 | - |
| 001 | データベース設計・構築 | 完了 | - |
| 002 | 基本UI構築 | 完了 | - |
| 003 | アンケート機能実装 | 完了 | - |
| 004 | 症状説明文生成機能 | 完了 | - |
| 005 | 診療科マッピング機能 | 完了 | - |
| 006 | 病院検索・表示機能 | 完了 | 11/24 |
| 007 | 画像保存機能 | 完了 | - |
| 008 | 管理画面構築 | 完了 | - |
| 009 | 病院CRUD機能 | 完了 | 11/18 |
| 010 | CSVインポート機能 | 完了 | 11/19 |
| 011 | AI診断機能実装 | 完了（本番運用中） | 11/24 |
| 012 | UI/UXブラッシュアップ | 完了 | 11/24 |
| 013 | テスト実装 | 未着手 | - |
| 014 | 本番環境構築・デプロイ | 完了 | 11/28 |

### 追加実装

- 診療時間テーブル機能（11/19）
- 病院検索UI 2ページ構成（11/30）
- 病院リスト表示最適化（11/24）
- リファクタリング・コード品質改善（11/28）
- お問い合わせページ（11/28）
- /results ページ アコーディオン構成（12/11）
- Vercel React ベストプラクティス準拠リファクタリング（2/21）
- Supabase Postgres ベストプラクティス準拠マイグレーション（2/21）
- Next.js ベストプラクティス準拠リファクタリング第2弾（4/1）
  - React.memo / useCallback 最適化（QuestionOption, QuestionnaireForm, FollowUpChat）
  - ScheduleTable コンポーネント切り出し（HospitalCard → ScheduleTable.tsx）
  - LocationInput インライン配列のモジュールスコープ化
  - generateMetadata 追加（hospital/[id], outing/[category]）
  - not-found.tsx（カスタム404ページ）作成
- Supabase Postgres ベストプラクティス準拠修正第2弾（4/1）
  - search_logs RLS ポリシーをロール限定に変更
  - search_history 複合インデックス追加
  - RPC: update_favorite_order（N+1解消）、get_unique_history（DB側重複除去）
  - API select(*) → 必要カラム指定化（hospitals, search, facilities, dashboard）

## 最新ビルド結果（2026年4月1日）

```
Route (app)                             Size  First Load JS
┌ /                                  6.01 kB         189 kB
├ /_not-found                            0 B         183 kB  ← 新規: カスタム404
├ /admin/dashboard                       0 B         184 kB  ← select最適化
├ /admin/hospitals                   2.86 kB         187 kB
├ /admin/hospitals/[id]/edit             0 B         186 kB
├ /admin/hospitals/[id]/schedules    2.66 kB         187 kB
├ /admin/hospitals/import            3.65 kB         188 kB
├ /admin/hospitals/new                   0 B         186 kB
├ /admin/login                       1.16 kB         186 kB
├ /contact                               0 B         183 kB
├ /hospital/[id]                     2.43 kB         185 kB  ← generateMetadata追加
├ /questionnaire                     3.53 kB         186 kB  ← memo/useCallback最適化
├ /results                              9 kB         192 kB  ← FollowUpChat useCallback最適化
├ /search                            2.43 kB         185 kB
├ /search/results                    3.68 kB         187 kB
├ /outing/[category]                 2.91 kB         186 kB  ← generateMetadata追加
└ /terms                                 0 B         183 kB

型エラー: なし / リントエラー: なし
Supabase Advisor: セキュリティ WARN 2件（search_logs INSERT意図的、漏洩PW保護はダッシュボード設定）
                  パフォーマンス INFO: 未使用インデックス（Phase 2 データ増加で解消見込み）
```

## チケット管理

- チケットファイル: `/docs/` ディレクトリ
- 形式: `- [ ]` 未完了 / `- [x]` 完了
- 依存関係: `/docs/README.md` を参照

## 技術的な重要ポイント（実装済み）

- **Supabase RLS**: 両テーブルでRLS有効。`anon`はSELECTのみ。管理操作は `supabaseAdmin`（Service Role Key）で bypass
- **RLSパフォーマンス最適化**: `auth.role()` → `(select auth.role())` でキャッシュ化
- **タイムスタンプ**: 全テーブル `timestamptz` 使用（タイムゾーン対応）
- **CSV インポート**: バッチINSERT方式（全削除→バリデーション→一括挿入）
- **AI診断**: 本番で有効化済み（`NEXT_PUBLIC_AI_DIAGNOSIS=true`）
- **html2canvas**: 動的インポート（使用時のみロード、バンドルサイズ86%削減）
- **HospitalListItem**: `memo` 化済み（デフォルト値はモジュールスコープに巻き上げ）
- **QuestionOption**: `memo` 化済み（リスト内再レンダリング防止）
- **QuestionnaireForm**: 全ハンドラ `useCallback` 化（memo済み子への安定参照）
- **FollowUpChat**: 全ハンドラ `useCallback` 化
- **ScheduleTable**: HospitalCard から別ファイルに切り出し（ネスト関数コンポーネント解消）
- **LocationInput**: モード切替ボタン配列をモジュールスコープ定数化
- **admin/dashboard**: Server Component（クライアントJSゼロ、select最適化済み）
- **hospital/[id]**: `Promise.all` で params/searchParams 並列解決 + `generateMetadata`
- **outing/[category]**: layout.tsx で `generateMetadata` 提供
- **not-found.tsx**: カスタム日本語404ページ
- **RPC関数**: `update_favorite_order`（バッチ更新）、`get_unique_history`（DISTINCT ON 重複除去）
- **API select最適化**: hospitals/search/facilities/dashboard で必要カラムのみ取得
- **共通コンポーネント**: ErrorBox, LoadingBox, Accordion, MobileFixedFooter
- **ユーティリティ**: `queryUtils.ts`（parseCommaSeparatedList, toggleArrayItem）
- **マスターデータ**: `masterData.ts`（20診療科, 14自治体）

## Phase 2 チケット状況（2026年3月29日〜）

| # | チケット | サブフェーズ | ステータス | 依存 |
|---|---------|-------------|----------|------|
| 015 | DB拡張・マイグレーション | 2-A | 完了 | なし |
| 016 | Gemini AI統合・OpenAI廃止 | 2-B | 完了 | 015 |
| 017 | Google Maps統合・地図表示 | 2-A | 完了 | 015 |
| 018 | 交通データ管理・管理画面 | 2-A | 完了 | 015 |
| 019 | ルート検索機能 | 2-A | 完了 | 015,017,018 |
| 020 | Supabase Auth・ユーザー認証 | 2-B | 完了 | 015 |
| 021 | マイページ・かかりつけ医・履歴 | 2-B | 完了 | 015,020 |
| 022 | 受診リマインダー・メール通知 | 2-B | 未着手 | 015,020 |
| 023 | 家族見守り機能 | 2-C | 未着手 | 015,020,021,022 |
| 024 | お出かけナビ | 2-C | 完了 | 015,017,019 |
| 025 | 結果ページ強化・スコアリング | 2-B | 完了 | 016,017,020 |
| 026 | ボトムナビ・ヘッダー・レイアウト改修 | 2-B | 完了 | 020 |
| 027 | 緊急時ガイド・統計ダッシュボード | 2-C | 完了 | 015,016 |
| 028 | Zustand導入・状態管理リファクタ | 2-B | 完了 | 020 |
| 029 | PWA対応 | 2-C | 完了 | 全主要機能 |
| 030 | AI対話型症状深掘り | 2-C | 完了 | 016,025 |
| 031 | Phase2テスト・結合・デプロイ | 2-C | 未着手 | 015〜030 |

### Phase 2 サブフェーズ

| サブフェーズ | 期間目安 | 内容 |
|------------|---------|------|
| Phase 2-A | 約6週間 | 交通ナビ基盤 + DB拡張 + Google Maps（015,017,018,019） |
| Phase 2-B | 約6週間 | AI強化 + ユーザー機能（016,020,021,022,025,026,028） |
| Phase 2-C | 約4週間 | お出かけナビ + 見守り + 仕上げ（023,024,027,029,030） |

## 今後の拡張予定

- テスト実装（Vitest/Playwright）- チケット013
- エラーログ収集（Sentry 検討）
- ユーザー分析（GA 検討）
