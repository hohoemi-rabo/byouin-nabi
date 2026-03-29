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

- [ ] `zustand` パッケージをインストール
- [ ] `src/stores/locationStore.ts` — 出発地キャッシュ（GPS/住所、セッション内で保持）
- [ ] `src/stores/authStore.ts` — ユーザー認証状態（ログイン状態、プロフィール情報）
- [ ] `src/stores/uiStore.ts` — UI状態（フォントサイズ設定等）

### 出発地キャッシュ

- [ ] ルート検索時に取得した出発地をストアに保存
- [ ] 2回目以降のルート検索では保存済みの出発地を初期値に
- [ ] 「出発地を変更」ボタンで再入力可能

### Phase 1 との共存

- [ ] `QuestionnaireContext` はそのまま維持（Phase 1 のアンケートフロー）
- [ ] 新規の状態管理は Zustand を使用
- [ ] localStorage 永続化が必要な場合は `zustand/middleware` の `persist` を使用

### 確認

- [ ] 出発地キャッシュの動作確認
- [ ] 認証状態の同期確認
- [ ] Phase 1 の QuestionnaireContext が正常動作することを確認
- [ ] `npm run build` でエラーなし確認

---

## 技術メモ

- Zustand は軽量（1.1kB）で Context の boilerplate が不要
- Phase 1 の QuestionnaireContext は変更しない（動作実績のある既存コードを尊重）
- 新規の状態管理のみ Zustand を使用する方針
- `persist` middleware で localStorage と連携可能
