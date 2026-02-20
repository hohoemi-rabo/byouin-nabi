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

## 最新ビルド結果（2026年2月21日）

```
Route (app)                             Size  First Load JS
┌ /                                    622 B         121 kB
├ /admin/dashboard                       0 B         122 kB  ← Server Component化
├ /admin/hospitals                   2.85 kB         125 kB
├ /admin/hospitals/[id]/edit             0 B         124 kB
├ /admin/hospitals/[id]/schedules    53.5 kB         176 kB
├ /admin/hospitals/import            3.65 kB         126 kB
├ /admin/hospitals/new                   0 B         124 kB
├ /admin/login                       1.16 kB         123 kB
├ /contact                               0 B         121 kB
├ /hospital/[id]                       427 B         121 kB
├ /questionnaire                     3.46 kB         124 kB
├ /results                          7.37 kB         128 kB  ← html2canvas動的インポート化（53kB→7.37kB）
├ /search                            2.14 kB         123 kB
├ /search/results                    2.72 kB         124 kB
└ /terms                                 0 B         121 kB

型エラー: なし / リントエラー: なし
Supabase Advisor: セキュリティ ERROR 0件 / パフォーマンス WARN 0件
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
- **admin/dashboard**: Server Component（クライアントJSゼロ）
- **hospital/[id]**: `Promise.all` で params/searchParams 並列解決
- **共通コンポーネント**: ErrorBox, LoadingBox, Accordion, MobileFixedFooter
- **ユーティリティ**: `queryUtils.ts`（parseCommaSeparatedList, toggleArrayItem）
- **マスターデータ**: `masterData.ts`（20診療科, 14自治体）

## 今後の拡張予定

- テスト実装（Vitest/Playwright）- チケット013
- エラーログ収集（Sentry 検討）
- ユーザー分析（GA 検討）
- PWA対応
