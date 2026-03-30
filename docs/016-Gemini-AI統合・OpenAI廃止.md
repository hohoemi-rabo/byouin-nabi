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

- [x] `openai` パッケージを削除（`npm uninstall openai`）
- [x] `OPENAI_API_KEY` 環境変数を `.env.local` から削除（Vercel は API キー取得後に削除）
- [x] `NEXT_PUBLIC_AI_DIAGNOSIS` 環境変数を削除（常時有効化するため不要）
- [x] `/api/symptoms/ai-diagnosis/route.ts` を削除
- [x] `AIDiagnosisButton` コンポーネントを削除（UrgencyBadge に置換）
- [x] 利用規約の OpenAI 参照を Gemini に更新

### Gemini API 統合

- [x] `@google/generative-ai` パッケージをインストール
- [x] `GEMINI_API_KEY` 環境変数を `.env.local` に追加（プレースホルダー、API キー取得後に設定）
- [x] `src/lib/gemini.ts` — Gemini クライアント初期化ユーティリティ作成
- [x] `/api/symptoms/ai-recommend/route.ts` — 新規APIルート作成
  - リクエスト: `{ questionnaire: QuestionnaireData, age_group?, area? }`
  - レスポンス: `{ urgency, urgency_reason, recommended_departments, department_reason, advice, disclaimer, source }`
  - `responseMimeType: "application/json"` でJSON構造化出力
  - temperature: 0.7, maxOutputTokens: 1000
- [x] System Prompt 設計（Phase2-Requirements.md セクション 4.2 のプロンプト構造に準拠）
- [x] 20診療科マスターからのみ選択するようプロンプトで制約（レスポンス後にバリデーション）

### フォールバック実装

- [x] `src/lib/fallbackUrgency.ts` — ルールベース緊急度判定関数
- [x] AI-recommend API 内でタイムアウト5秒 + try-catch でフォールバック切替
- [x] フォールバック時は既存 `getDepartments()` + `fallbackUrgency()` で結果生成
- [x] Gemini API キー未設定時もフォールバックで動作

### 緊急度 UI

- [x] `src/components/SymptomResult/UrgencyBadge.tsx` — 3段階緊急度バッジ
  - 🔴 緊急（赤背景）: 119番ボタン表示
  - 🟡 早めに受診（黄背景）: 当日〜翌日の受診を推奨
  - 🟢 様子を見て受診（緑背景）: 通常表示
- [x] `/results` ページに緊急度セクションを追加（最上部に大きく表示）
- [x] Phase 1 の AI診断アコーディオンを緊急度表示に置換
- [x] 免責事項表示は Phase 1 同等以上を維持
- [x] AI推奨診療科がある場合、その理由も表示

### 型定義

- [x] `src/types/ai.ts` — AI レスポンス型（UrgencyLevel, AIRecommendResponse, AIRecommendRequest）

### テスト・確認

- [x] Gemini API の正常応答確認（gemini-3.1-flash-lite-preview で3パターン正常動作）
- [x] フォールバック動作確認（API キー未設定でフォールバック使用）
- [x] 緊急度 UI の3パターン表示確認（emergency/soon/watch 全て正常判定）
- [x] `npm run build` で型エラー・リントエラーなし確認

---

## 技術メモ

- Gemini 3.1 Flash-Lite: $0.25/1M入力 + $1.50/1M出力（最安クラス）
- `response_mime_type: "application/json"` でネイティブJSON出力対応
- タイムアウト5秒でフォールバックに切替
- 医療法準拠: 「診断」表現の回避、免責事項の徹底
