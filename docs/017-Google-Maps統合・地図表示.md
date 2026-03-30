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

- [x] `@react-google-maps/api` パッケージをインストール
- [x] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 環境変数を `.env.local` に追加（プレースホルダー、API キー取得後に設定）
- [x] Google Cloud Console で Maps JavaScript API / Directions API / Geocoding API / Distance Matrix API を有効化

### Google Maps コンポーネント

- [x] `src/components/Map/HospitalMap.tsx` — 病院位置の地図表示（マーカー付き、useJsApiLoader使用）
- [x] `src/components/Map/HospitalMapWrapper.tsx` — Client Component ラッパー（`next/dynamic` + `ssr: false`）
  - Server Component の病院詳細ページから安全に動的インポート

### 病院詳細ページ改修（`/hospital/[id]`）

- [x] 地図埋め込みセクション追加（lat/lng がある場合のみ表示）
- [ ] 「ここへの行き方」ボタン追加（019 ルート検索チケットで対応）

### 管理画面改修

- [x] 病院編集フォーム（`HospitalForm`）に緯度・経度フィールド追加
- [x] `createHospital` / `updateHospital` Server Actions で latitude/longitude を保存
- [x] 「住所から座標を取得」ボタン — Geocoding API で住所→座標変換（`/api/geocode` + HospitalForm ボタン）
- [x] 既存病院データの一括座標変換機能（`geocodeAllHospitals` Server Action）

### コスト最適化

- [x] 地図表示は病院詳細ページのみ（一覧では不使用）
- [x] HospitalMapWrapper で動的インポート（`next/dynamic` + `ssr: false`）
- [x] API キー未設定時は地図セクション非表示（`return null`）

### 確認

- [x] 病院詳細ページでの地図表示確認（飯田市座標で動作確認済み）
- [x] 座標未設定の病院では地図非表示を確認
- [x] `npm run build` でエラーなし確認（/hospital/[id] 427B → 1.62kB）

---

## 技術メモ

- Google Maps Platform 月$200 無料枠の範囲で運用目標
- 地図表示は詳細ページのみ（一覧は Phase 1 同様リンクのみ）
- `@react-google-maps/api` は動的インポートでバンドルサイズ対策
