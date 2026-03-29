# 016: Gemini AI統合・OpenAI廃止

**フェーズ**: Phase 2-B
**優先度**: 高
**���存**: 015（DB拡張完了後）
**参照**: Phase2-Requirements.md セクション 4, 10.2, 13.2

---

## 概要

Phase 1 の OpenAI gpt-4o-mini ベースの AI診断を廃止し、Gemini API（`gemini-3.1-flash-lite-preview`）による AI緊急度判定・受診レコメンドに置換する。フォールバックは Phase 1 のルールベース（`departmentMapping.ts`）を使用。

---

## Todo

### OpenAI 廃止

- [ ] `openai` パッケージを削除（`npm uninstall openai`）
- [ ] `OPENAI_API_KEY` 環境変数を `.env.local` および Vercel から削除
- [ ] `NEXT_PUBLIC_AI_DIAGNOSIS` 環境変数を削除（常時有効化するため不要）
- [ ] `/api/symptoms/ai-diagnosis/route.ts` を削除
- [ ] `AIDiagnosisButton` コンポーネントから機能フラグ分岐を削除

### Gemini API 統合

- [ ] `@google/generative-ai` パッケージをインストール
- [ ] `GEMINI_API_KEY` 環境変数を `.env.local` および Vercel に追加
- [ ] `src/lib/gemini.ts` — Gemini クライアント初期化ユーティリティ作成
- [ ] `/api/symptoms/ai-recommend/route.ts` — 新規APIルート作成
  - リクエスト: `{ questionnaire: QuestionnaireData, age_group?, area? }`
  - レスポンス: `{ urgency, urgency_reason, recommended_departments, department_reason, advice, disclaimer }`
  - `response_mime_type: "application/json"` でJSON構造化出力
  - temperature, max_tokens 等のパラメータ設定
- [ ] System Prompt 設計（Phase2-Requirements.md セクション 4.2 のプロンプト構造に準拠）
- [ ] 20診療科マスターからのみ選択するようプロンプトで制約

### フォールバック実装

- [ ] `src/lib/fallbackUrgency.ts` — ルールベース緊急度判定関数
  - EMERGENCY_SYMPTOMS → 'emergency'
  - SOON_SYMPTOMS → 'soon'
  - デフォルト → 'watch'
- [ ] AI-recommend API 内でタイムアウト5秒 + try-catch でフォールバック切替
- [ ] フォールバック時は既存 `getDepartments()` + `fallbackUrgency()` で結果生成

### 緊急度 UI

- [ ] `src/components/SymptomResult/UrgencyBadge.tsx` — 3段階緊急度バッジ
  - 🔴 緊急（赤背景）: 119番ボタン + 救急対応病院のみ表示
  - 🟡 早めに受診（黄背景）: 当日〜翌日の受診を推奨
  - 🟢 様子を見て受診（緑背景）: 通常表示
- [ ] `/results` ページに緊急度セクションを追加（最上部に大きく表示）
- [ ] Phase 1 の AI診断アコーディオンを緊急度表示に置換
- [ ] 免責事項表示は Phase 1 同等以上を維持

### 型定義

- [ ] `src/types/ai.ts` — AI レスポンス型（UrgencyLevel, AIRecommendResponse 等）

### テスト・確認

- [ ] Gemini API の正常応答確認
- [ ] フォールバック動作確認（API キーを無効化してテスト）
- [ ] 緊急度 UI の3パターン表示確認
- [ ] `npm run build` で型エラー・リントエラーなし確認

---

## 技術メモ

- Gemini 3.1 Flash-Lite: $0.25/1M入力 + $1.50/1M出力（最安クラス）
- `response_mime_type: "application/json"` でネイティブJSON出力対応
- タイムアウト5秒でフォールバックに切替
- 医療法準拠: 「診断」表現の回避、免責事項の徹底
