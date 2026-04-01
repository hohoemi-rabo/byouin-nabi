# 028: Zustand 導入・状態管理リファクタ

**フェーズ**: Phase 2-B
**優先度**: 中
**依存**: 020（ユーザー認証 — ユーザー状態管理用）
**参照**: Phase2-Requirements.md セクショ��� 2.1

---

## 概要

Zustand を導入し、Phase 2 で増加するクライアント状態を効率的に管理する。Phase 1 の QuestionnaireContext + localStorage パターンを補完。

---

## Todo

### Zustand 導入

- [x] `zustand` パッケージをインストール
- [x] `src/stores/locationStore.ts` — 出発地キャッシュ（sessionStorage persist）
- [x] `src/stores/uiStore.ts` — UI状態（フォントサイズ、localStorage persist）
- AuthContext は動作実績があるのでそのまま維持（authStore は不要と判断）

### 出発地キャッシュ

- [x] LocationInput で出発地取得時にストアに保存
- [x] 「📍 前回の出発地を使う」ボタン表示（キャッシュがある場合）
- [x] /route ページでキャッシュがある場合は自動検索
- [x] 「出発地を変更」ボタンで再入力可能（既存）

### Phase 1 との共存

- [x] `QuestionnaireContext` はそのまま維持
- [x] 新規の状態管理のみ Zustand を使用
- [x] `persist` middleware で sessionStorage / localStorage と連携

### 確認

- [ ] 出発地キャッシュの動作確認
- [x] `npm run build` でエラーなし確認

---

## 技術メモ

- Zustand は軽量（1.1kB）で Context の boilerplate が不要
- Phase 1 の QuestionnaireContext は変更しない（動作実績のある既存コードを尊重）
- 新規の状態管理のみ Zustand を使用する方針
- `persist` middleware で localStorage と連携可能
