# 017: Google Maps 統合・地図表示

**フェーズ**: Phase 2-A
**優先度**: 高
**依存**: 015（hospitals テーブルに lat/lng カラム追加後）
**参照**: Phase2-Requirements.md セクション 3, 13.1

---

## 概要

Google Maps Platform を導入し、病院詳細ページに地図埋め込み表示を追加する。
後続のルート検索機能（018）の基盤となる。

---

## Todo

### パッケージ・環境変数

- [ ] `@react-google-maps/api` パッケージをインストール
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 環境変数を `.env.local` および Vercel に追加
- [ ] Google Cloud Console で Maps JavaScript API / Directions API / Geocoding API を有効化

### Google Maps クライアント

- [ ] `src/lib/googleMaps.ts` — サーバーサイド用 Geocoding/Directions ユーティリティ
- [ ] `src/components/Map/MapProvider.tsx` — `@react-google-maps/api` の LoadScript ラッパー
  - 動的インポートパターン（Phase 1 の html2canvas と同様、バンドルサイズ対策）
- [ ] `src/components/Map/HospitalMap.tsx` — 病院位置の地図表示（マーカー付き）

### 病院詳細ページ改修（`/hospital/[id]`）

- [ ] 地図埋め込みセクション追加（lat/lng がある場合のみ表示）
- [ ] Accordion コンポーネントで折りたたみ可能に（Phase 1 のバリアント再利用）
- [ ] 「ここへの行き方」ボタン追加（018 ルート検索への導線）

### 管理画面の住所→座標変換

- [ ] 病院編集フォーム（`HospitalForm`）に緯度・経度フィールド追加
- [ ] 「住所から座標を取得」ボタン — Geocoding API で住所→座標変換
- [ ] 既存病院データの一括座標変換機能（管理画面 or スクリプト）

### コスト最適化

- [ ] 地図表示は病院詳細ページのみ（一覧では不使用）
- [ ] MapProvider の動的インポート（`next/dynamic` + `ssr: false`）

### 確認

- [ ] 病院詳細ページでの地図表示確認
- [ ] 座標未設定の病院では地図非表示を確認
- [ ] モバイル・デスクトップ両方でのレスポンシブ確認
- [ ] `npm run build` でエラーなし確認

---

## 技術メモ

- Google Maps Platform 月$200 無料枠の範囲で運用目標
- 地図表示は詳細ページのみ（一覧は Phase 1 同様リンクのみ）
- `@react-google-maps/api` は動的インポートでバンドルサイズ対策
