# 病院ナビ南信 — Phase 2 要件定義書

## AI受診・お出かけナビゲーション統合

**バージョン**: 1.0
**作成日**: 2026年3月29日
**前提**: Phase 1 仕様書（Phase1-Specification.md v2.0）の全機能が実装済み
**リポジトリ**: `byouin-nabi/`（既存リポジトリに追加開発）

---

## 目次

1. [Phase 2 概要](#1-phase-2-概要)
2. [Phase 1 からの変更・拡張サマリー](#2-phase-1-からの変更拡張サマリー)
3. [新規機能：交通ナビゲーション](#3-新規機能交通ナビゲーション)
4. [新規機能：AI受診ナビゲーション強化](#4-新規機能ai受診ナビゲーション強化)
5. [新規機能：お出かけナビ](#5-新規機能お出かけナビ)
6. [新規機能：ユーザーアカウント](#6-新規機能ユーザーアカウント)
7. [新規機能：家族見守り](#7-新規機能家族見守り)
8. [管理画面の拡張](#8-管理画面の拡張)
9. [データベース設計（追加テーブル）](#9-データベース設計追加テーブル)
10. [API設計（追加エンドポイント）](#10-api設計追加エンドポイント)
11. [ページ構成（追加・変更）](#11-ページ構成追加変更)
12. [ユーザーフロー（Phase 2）](#12-ユーザーフローphase-2)
13. [外部API・サービス追加](#13-外部apiサービス追加)
14. [既存コンポーネントの改修](#14-既存コンポーネントの改修)
15. [非機能要件](#15-非機能要件)
16. [開発サブフェーズ](#16-開発サブフェーズ)
17. [リスクと対策](#17-リスクと対策)
18. [コスト見積もり（追加分）](#18-コスト見積もり追加分)

---

## 1. Phase 2 概要

### 1.1 Phase 2 のビジョン

Phase 1 で実現した「症状 → 推奨診療科 → 病院リスト」のフローに、**交通ナビゲーション**を統合する。ユーザーが症状を入力して最適な受診先を見つけた後、「そこにどうやって行くか」までをシームレスに案内する。

加えて、病院以外の外出目的（買い物・役所・公共施設等）にも対応する「お出かけナビ」機能と、家族が高齢者の受診を見守れる機能を追加し、南信州地域の高齢者の生活インフラとなるサービスへ進化させる。

### 1.2 Phase 2 のスローガン

**「どこに行くか」も「どうやって行くか」も、これ一つで。**

### 1.3 Phase 2 で追加するコア機能

| #   | 機能                   | 概要                                                                       |
| --- | ---------------------- | -------------------------------------------------------------------------- |
| 1   | **交通ナビゲーション** | 地域の交通手段（路線バス・デマンド交通・タクシー等）の情報統合とルート提示 |
| 2   | **AI受診ナビ強化**     | 症状入力→AI緊急度判定→受診先レコメンド→交通手段を一気通貫で提示            |
| 3   | **お出かけナビ**       | 病院以外の施設（スーパー・役所・銀行等）への交通手段案内                   |
| 4   | **ユーザーアカウント** | かかりつけ医登録・受診履歴・リマインダー                                   |
| 5   | **家族見守り**         | 家族アカウント紐付け・受診予定通知・代理検索                               |

### 1.4 Phase 1 から引き継ぐ設計原則

- **シニアファースト UI**: 18px基本フォント、48px最小タップ領域、ボタン式選択
- **医療法準拠**: 「医療行為ではない」免責表示の徹底
- **レンダリング戦略**: 静的コンテンツはServer Component、インタラクティブ部分はClient Component
- **管理者認証方式**: 既存のCookie認証を維持（Phase 2の管理画面拡張にも適用）

---

## 2. Phase 1 からの変更・拡張サマリー

### 2.1 技術スタック追加

| 技術                                  | バージョン | 用途                          | 備考                                                                   |
| ------------------------------------- | ---------- | ----------------------------- | ---------------------------------------------------------------------- |
| `@supabase/auth-helpers-nextjs`       | latest     | ユーザー認証（Supabase Auth） | Phase 1のCookie管理者認証とは別系統                                    |
| `@react-google-maps/api`              | latest     | Google Maps 地図埋め込み      | Phase 1のgoogle_map_url（外部リンク）を強化                            |
| Google Maps Directions API            | —          | ルート検索・所要時間計算      | 新規                                                                   |
| Google Maps Geocoding API             | —          | 住所→座標変換                 | 新規                                                                   |
| Gemini API（`@google/generative-ai`） | latest     | AI緊急度判定・受診レコメンド  | モデル: `gemini-3.1-flash-lite-preview`。Phase 1のOpenAI依存を完全廃止 |
| Zustand                               | latest     | クライアント状態管理          | Phase 1のContext + localStorageパターンを補完                          |
| Resend                                | latest     | メール送信                    | リマインダー通知・マジックリンク認証                                   |

### 2.2 既存テーブル変更

#### `hospitals` テーブルへのカラム追加

| カラム                    | 型                    | 説明                      |
| ------------------------- | --------------------- | ------------------------- |
| `latitude`                | NUMERIC               | 緯度（Google Maps連携用） |
| `longitude`               | NUMERIC               | 経度（Google Maps連携用） |
| `online_consultation`     | BOOLEAN DEFAULT false | オンライン診療対応        |
| `online_consultation_url` | TEXT nullable         | オンライン診療予約URL     |
| `parking`                 | BOOLEAN DEFAULT false | 駐車場の有無              |
| `parking_capacity`        | INTEGER nullable      | 駐車場台数                |
| `barrier_free`            | BOOLEAN DEFAULT false | バリアフリー対応          |
| `emergency_available`     | BOOLEAN DEFAULT false | 救急対応の可否            |
| `shuttle_bus`             | BOOLEAN DEFAULT false | 送迎バスの有無            |
| `shuttle_bus_info`        | TEXT nullable         | 送迎バスの詳細情報        |

**マイグレーション方針**: ALTER TABLE でカラム追加。既存データには影響なし（全てnullable or DEFAULT値あり）。

### 2.3 既存ページの改修一覧

| ページ                       | 改修内容                                                                   |
| ---------------------------- | -------------------------------------------------------------------------- |
| `/` (ホーム)                 | CTAに「お出かけナビ」ボタン追加、ログインリンク追加                        |
| `/results`                   | 病院リスト各項目に「ここへの行き方」ボタン追加、AI緊急度判定セクション追加 |
| `/hospital/[id]`             | 地図埋め込み表示、交通アクセス情報セクション追加、かかりつけ医登録ボタン   |
| `/search`                    | オンライン診療対応・バリアフリー等のフィルター追加                         |
| `/admin/dashboard`           | 交通データ・ユーザー統計の追加                                             |
| `/admin/hospitals/[id]/edit` | 新規カラム（緯度経度・オンライン診療等）の編集フォーム追加                 |
| Header                       | ログイン状態でユーザーアイコン表示、ナビ項目追加                           |
| Footer                       | お出かけナビ・緊急時ガイドへのリンク追加                                   |

---

## 3. 新規機能：交通ナビゲーション

### 3.1 交通手段データベース

南信州地域で利用可能な公共交通・移動手段の情報を一元管理する。

#### 対象交通手段

| 種別         | 具体例                               | データ取得方法                         |
| ------------ | ------------------------------------ | -------------------------------------- |
| 路線バス     | 信南交通、伊那バス                   | 事業者公式サイト・紙時刻表から手動入力 |
| デマンド交通 | 各市町村のデマンドバス・乗合タクシー | 各自治体への問い合わせ                 |
| 一般タクシー | 南信タクシー、丸共タクシー 等        | 電話番号・営業エリア情報               |
| 福祉タクシー | 介護タクシー事業者                   | 事業者リスト                           |
| 病院送迎バス | 各医療機関の送迎バス                 | hospitalsテーブルのshuttle_bus情報     |

#### データ項目

```
transport_services テーブル（後述 9章参照）
- サービス名、運営事業者、種別
- 運行エリア（市町村単位）
- 連絡先（電話番号、Web予約URL）
- 予約方法（電話 / Web / アプリ）
- 事前予約の要否、予約締切時間
- 利用条件（事前登録、対象地域、年齢制限）
- 料金情報（テキスト形式）
- 車椅子対応
```

### 3.2 ルート検索機能

#### 入力

| 項目         | 入力方法                                  | 備考                                |
| ------------ | ----------------------------------------- | ----------------------------------- |
| 出発地       | GPS自動取得 / 住所入力 / 地区名選択       | Geolocation API + Geocoding API     |
| 目的地       | 病院詳細から自動セット / 施設検索から選択 | hospitals.latitude/longitude を使用 |
| 到着希望時刻 | 日付ピッカー + 時間帯（午前/午後/夕方）   | 任意。未指定の場合は現在時刻基準    |
| 移動条件     | 車椅子 / 杖使用（任意チェックボックス）   | 対応可能な交通手段のフィルタリング  |

#### ルート提示ロジック

```
1. 出発地・目的地の座標を確定
2. Google Maps Directions API でルート候補を取得
   - driving（自家用車）
   - transit（公共交通機関 ※Googleデータがある場合）
   - walking（徒歩 ※短距離の場合のみ）
3. 地域交通データベースから利用可能な交通手段を検索
   - 出発地の市町村に対応するデマンド交通・タクシー
   - 目的地付近を通る路線バス
   - 目的地の医療機関に送迎バスがある場合
4. 最大3ルートを提示（優先順位: 到着確実性 > 料金 > 利便性）
```

#### ルート表示項目

各ルートに以下を表示する。

- 交通手段の種類アイコン + 名称
- 出発時刻 → 到着予定時刻（所要時間）
- 概算料金（把握できている場合）
- 予約の要否
- 予約方法: **電話番号へのワンタップ発信リンク**（`tel:`）or Web予約リンク
- 地図上でのルート表示（Google Maps埋め込み）
- 注意事項（「前日までに予約が必要です」等）

### 3.3 交通情報の表示パターン

#### パターン A: 病院詳細ページからの交通検索

```
病院詳細（/hospital/[id]）
  └── 「ここへの行き方」ボタン
        └── 出発地入力モーダル（GPS or 住所入力）
              └── ルート結果表示（/route?to=hospital_id&from=lat,lng）
```

#### パターン B: 結果ページからの一気通貫

```
結果表示（/results）
  └── 病院リスト各項目の「行き方」ボタン
        └── 出発地入力（初回のみ、以降はキャッシュ）
              └── ルート結果をインライン展開
```

#### パターン C: お出かけナビからの交通検索

```
お出かけナビ（/outing）
  └── 目的カテゴリ選択 → 施設選択
        └── ルート検索（/route?to=lat,lng&from=lat,lng）
```

### 3.4 UI仕様

- ルート表示はカード形式で最大3ルート
- 各カードに交通手段アイコン（🚌 バス / 🚕 タクシー / 🚗 自家用車 / 🚶 徒歩）
- 電話予約ボタンは特大サイズ（56px高さ）で目立つ配色（Phase 1の電話ボタンと同様のスタイル）
- 地図表示は折りたたみ可能（Phase 1のAccordionコンポーネントを再利用）
- 「交通手段がわからない場合は 0265-XX-XXXX にお電話ください」の案内を常時表示

---

## 4. 新規機能：AI受診ナビゲーション強化

### 4.1 Phase 1 AI機能からの進化

| 項目           | Phase 1                           | Phase 2                                                            |
| -------------- | --------------------------------- | ------------------------------------------------------------------ |
| AI基盤         | OpenAI gpt-4o-mini（実験的）      | **Gemini API `gemini-3.1-flash-lite-preview`**（メイン・常時有効） |
| フォールバック | —                                 | Phase 1のルールベース（`departmentMapping.ts`）                    |
| OpenAI依存     | あり（`OPENAI_API_KEY`必要）      | **完全廃止**（環境変数・パッケージとも削除）                       |
| 機能フラグ     | `NEXT_PUBLIC_AI_DIAGNOSIS` で制御 | 常時有効（コア機能化）                                             |
| 入力           | アンケート回答テキスト            | アンケート回答 + 年齢層 + 現在地エリア                             |
| 出力           | 5セクションのテキスト分析         | 緊急度判定 + 受診先ランキング + 交通手段セット                     |
| 位置づけ       | オプショナルなアコーディオン内    | 結果画面のメインセクション                                         |
| コスト         | OpenAI従量課金                    | **$0.25/1M入力 + $1.50/1M出力**（大幅コスト削減）                  |

### 4.2 AI緊急度判定

Phase 1のアンケート結果（`QuestionnaireData`）をAIに送信し、緊急度を3段階で判定する。

#### 緊急度レベル

| レベル                | 表示                   | アクション                                               |
| --------------------- | ---------------------- | -------------------------------------------------------- |
| 🔴 **緊急**           | 赤背景の大きなアラート | 「119番に電話してください」ボタン + 救急対応病院のみ表示 |
| 🟡 **早めに受診**     | 黄背景の注意表示       | 当日〜翌日の受診を推奨、受付可能な医療機関を優先         |
| 🟢 **様子を見て受診** | 緑背景の通常表示       | 近日中の受診を推奨、通常の病院リスト表示                 |

#### AIプロンプト設計

```
System Prompt:
あなたは南信州地域の医療アクセスを支援するAIアシスタントです。
以下の症状情報を分析し、JSON形式で回答してください。

出力JSON構造:
{
  "urgency": "emergency" | "soon" | "watch",
  "urgency_reason": "緊急度の判定理由（1〜2文）",
  "recommended_departments": ["診療科1", "診療科2"],
  "department_reason": "診療科推奨の理由（1〜2文）",
  "advice": "受診までの注意点（2〜3文）",
  "disclaimer": "※この判定は医療診断ではありません。症状が重い場合はすぐに119番に電話してください。"
}

注意:
- 必ずJSONのみを返してください
- 緊急度は安全側（高め）に判定してください
- 20の診療科マスターから選択してください
- 医療行為や診断に該当する表現は避けてください
```

#### フォールバック

Gemini APIが応答不能（タイムアウト・障害等）の場合は、Phase 1の既存ロジックにフォールバックする。OpenAI APIは使用しない。

**フォールバック構成**:

```
① Gemini API（gemini-3.1-flash-lite-preview）
   │
   ├── 成功 → AI緊急度判定 + 推奨診療科を表示
   │
   └── 失敗（タイムアウト5秒 or APIエラー）
         │
         ▼
② ルールベースフォールバック
   ├── 診療科判定: departmentMapping.ts の getDepartments()（Phase 1 既存）
   └── 緊急度判定: 下記の fallbackUrgency()（新規）
```

```typescript
// フォールバック緊急度判定
function fallbackUrgency(symptoms: string[]): UrgencyLevel {
  const EMERGENCY_SYMPTOMS = ['息苦しい', 'めまいがする'];
  const SOON_SYMPTOMS = ['熱がある', '痛い'];

  if (symptoms.some((s) => EMERGENCY_SYMPTOMS.includes(s))) return 'emergency';
  if (symptoms.some((s) => SOON_SYMPTOMS.includes(s))) return 'soon';
  return 'watch';
}
```

### 4.3 受診先レコメンドの強化

Phase 1の診療科マッピング結果に加え、以下の要素でスコアリングする。

| 要素                     | スコア加算                | 備考                                               |
| ------------------------ | ------------------------- | -------------------------------------------------- |
| 推奨診療科の一致         | +100（必須条件）          | Phase 1の`getDepartments()`の結果を使用            |
| ユーザー現在地からの距離 | +50（近い）〜 +10（遠い） | Google Maps距離計算 or 市町村の一致                |
| 診療時間の適合           | +30                       | `hospital_schedules`から希望日時に営業中かチェック |
| オンライン診療対応       | +20                       | 移動困難な場合にボーナス                           |
| かかりつけ医登録         | +50                       | ログインユーザーのお気に入りに登録済み             |
| 救急対応                 | +40                       | 緊急度が「緊急」の場合のみ加算                     |

### 4.4 統合フロー

Phase 2の結果画面（`/results`）の表示構成を以下に変更:

```
結果表示（/results）Phase 2
│
├── 🔴🟡🟢 緊急度判定（最上部に大きく表示）
│     └── AI判定理由 + 免責事項
│
├── 推奨される診療科（Phase 1のRecommendedDepartmentsを維持）
│     └── Phase 1のルールベース + AI推奨を統合表示
│
├── 症状まとめ（Phase 1のSymptomDescriptionを維持）
│     └── テキストコピー・画像保存機能はそのまま
│
├── 対応している病院リスト（スコア順に変更）
│     ├── 各病院に「📞 電話」「🗺️ 地図」「🚌 行き方」ボタン
│     ├── オンライン診療対応マーク
│     └── 営業中/営業時間外の表示
│
└── MobileFixedFooter（「やり直す」+「ホーム」← Phase 1踏襲）
```

---

## 5. 新規機能：お出かけナビ

### 5.1 概要

病院以外の外出先への交通手段を案内する機能。高齢者の日常的な外出をサポートする。

### 5.2 施設カテゴリ

| カテゴリ       | アイコン | 代表的な施設                               |
| -------------- | -------- | ------------------------------------------ |
| 買い物         | 🛒       | スーパー、ドラッグストア、商店街           |
| 役所・公共施設 | 🏛️       | 市役所、公民館、図書館、支所               |
| 銀行・郵便局   | 🏧       | 八十二銀行、飯田信用金庫、郵便局           |
| 医療・福祉     | 🏥       | 病院（既存機能へのリンク）、デイサービス   |
| 趣味・交流     | 🎭       | 文化施設、公園、温泉、コミュニティセンター |

### 5.3 施設データ

施設データは新規テーブル `facilities` で管理する。医療機関は既存の `hospitals` テーブルを使用し、`facilities` にはそれ以外の施設を登録する。

### 5.4 ユーザーフロー

```
お出かけナビ（/outing）
  │  カテゴリ選択（大きなボタン、5カテゴリ）
  ▼
施設一覧（/outing/[category]）
  │  市町村でフィルタリング
  │  施設カード表示（名称・住所・電話番号）
  │  施設タップ
  ▼
施設詳細 + 交通検索
  │  地図表示 + 「ここへの行き方」ボタン
  ▼
ルート検索結果（/route?...）
```

### 5.5 UI設計

- トップページのCTAに「🚶 お出かけナビ」ボタンを追加（3番目のCTA）
- カテゴリ選択はPhase 1のアンケート選択肢（`QuestionOption`コンポーネント）と同じスタイル
- 施設リストはPhase 1の`HospitalListItem`と同様のカードレイアウト
- ボトムナビゲーションの導入を検討（ホーム / 症状検索 / お出かけ / マイページ）

---

## 6. 新規機能：ユーザーアカウント

### 6.1 認証方式

Phase 1の管理者認証（単一パスワード + Cookie）とは完全に別系統として、一般ユーザー向け認証を Supabase Auth で実装する。

| 方式                | 優先度     | 対象           | 備考                                             |
| ------------------- | ---------- | -------------- | ------------------------------------------------ |
| マジックリンク      | **メイン** | 全ユーザー     | パスワード不要。メール内のリンクをタップするだけ |
| メール + パスワード | サブ       | 慣れたユーザー | 従来型ログイン                                   |
| ゲスト利用          | —          | 未登録ユーザー | Phase 1と同等の機能（アカウント不要）            |

**マジックリンクを推奨する理由**: 高齢者はパスワードの記憶・入力が困難なケースが多い。メールアドレスだけ入力すれば、届いたメールのリンクをタップするだけでログインできる。

### 6.2 ユーザープロフィール

| 項目           | 入力方式                                          | 必須 | 用途                                      |
| -------------- | ------------------------------------------------- | ---- | ----------------------------------------- |
| 表示名         | テキスト                                          | はい | 画面表示                                  |
| 年齢層         | 選択式（〜39歳 / 40〜64歳 / 65〜74歳 / 75歳以上） | はい | AI推奨の精度向上                          |
| 居住地区       | ドロップダウン（14市町村）                        | はい | 近隣の医療機関優先表示、交通手段フィルタ  |
| 自家用車の有無 | はい/いいえ                                       | 任意 | ルート検索の最適化                        |
| 移動補助       | 選択式（なし / 杖 / 車椅子）                      | 任意 | バリアフリー・福祉タクシーの優先表示      |
| フォントサイズ | 選択式（標準 / 大 / 特大）                        | —    | UI表示。Phase 1の`FontSizeToggle`を有効化 |

### 6.3 かかりつけ医登録

- 病院詳細ページに「⭐ かかりつけ医に登録」ボタンを追加
- 最大5件まで登録可能
- マイページで一覧表示・並び替え・削除
- 受診ナビの結果で、かかりつけ医は ⭐ バッジ付きで上位表示

### 6.4 受診履歴

- 結果画面で病院をタップした際に自動記録（ログインユーザーのみ）
- マイページから履歴一覧を表示
- 「前回と同じ病院に行く」ワンタップ再検索
- 直近10件を保存

### 6.5 受診リマインダー

- 定期通院の次回受診日をリマインダー設定可能
- 前日にメール通知（Resend API）
- マイページでリマインダー一覧・編集・削除

### 6.6 マイページ構成

```
マイページ（/mypage）
├── プロフィール情報
├── かかりつけ医（最大5件）
│     └── 各病院カード + 「電話」「行き方」ボタン
├── 受診履歴（直近10件）
│     └── 「もう一度この病院を検索」ボタン
├── リマインダー一覧
│     └── 次回受診日 + 医療機関名 + 編集・削除
├── 家族見守り設定（後述）
└── 設定（フォントサイズ・通知設定・ログアウト）
```

---

## 7. 新規機能：家族見守り

### 7.1 概要

遠方に住む家族が、高齢者の受診状況を把握できる機能。高齢者側が招待コードを発行し、家族がそのコードで紐付ける。

### 7.2 紐付けフロー

```
高齢者（マイページ）
  │  「家族を招待する」ボタン
  │  → 6桁の招待コードを生成・表示（24時間有効）
  │  → コードをメール or 口頭で家族に伝える
  ▼
家族（マイページ）
  │  「家族と繋がる」ボタン
  │  → 招待コード入力
  │  → 紐付け完了
```

### 7.3 家族ができること

| 機能                   | 説明                                           |
| ---------------------- | ---------------------------------------------- |
| かかりつけ医の確認     | 高齢者が登録したかかりつけ医を閲覧             |
| 代理検索               | 高齢者の居住地区を基準にした症状検索・病院検索 |
| 受診リマインダーの確認 | 次回受診予定の確認                             |
| 受診予定通知           | 高齢者がリマインダーを登録した際にメール通知   |

### 7.4 プライバシー配慮

- 高齢者側で家族連携を解除可能
- 症状入力データ・AI診断結果は家族に共有**しない**（プライバシー保護）
- 共有されるのは「かかりつけ医」「リマインダー」の情報のみ
- 家族リンクは最大3名まで

---

## 8. 管理画面の拡張

### 8.1 追加メニュー

Phase 1の管理画面サイドバー（`AdminSidebar`）に以下を追加:

| メニュー          | パス                      | 説明                                 |
| ----------------- | ------------------------- | ------------------------------------ |
| 📊 ダッシュボード | `/admin/dashboard`        | 既存（統計追加）                     |
| 🏥 病院管理       | `/admin/hospitals`        | 既存                                 |
| 🚌 交通手段管理   | `/admin/transport`        | **新規**                             |
| 🏪 施設管理       | `/admin/facilities`       | **新規**                             |
| 📥 データ管理     | `/admin/hospitals/import` | 既存（交通データのインポートも追加） |

### 8.2 交通手段管理（新規）

- 交通サービスのCRUD（一覧・新規登録・編集・削除）
- CSVインポート/エクスポート（Phase 1の病院インポートと同じUI・ロジックを再利用）
- バス路線・時刻表の管理（別画面）

### 8.3 施設管理（新規）

- お出かけナビ用施設のCRUD
- カテゴリ別の絞り込み
- CSVインポート/エクスポート

### 8.4 ダッシュボード統計の追加

Phase 1のダッシュボード（病院数・市町村数・診療科数）に以下を追加:

| 統計項目                | 表示形式                     |
| ----------------------- | ---------------------------- |
| 登録交通サービス数      | 数値カード                   |
| 登録施設数              | 数値カード                   |
| 登録ユーザー数          | 数値カード                   |
| 今月の検索回数          | 数値カード                   |
| よく検索される症状 TOP5 | リスト                       |
| エリア別検索分布        | リスト（将来的にチャート化） |

---

## 9. データベース設計（追加テーブル）

### 9.1 ER図（Phase 2 追加分）

```
Phase 1 既存テーブル
┌─────────────┐    ┌──────────────────┐
│  hospitals   │    │ hospital_schedules│
│  (既存+拡張) │───→│   (既存)          │
└──────┬──────┘    └──────────────────┘
       │
       │  FK参照
       │
Phase 2 新規テーブル
┌──────┴──────┐
│             │
▼             ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ favorite_      │  │ search_        │  │ visit_         │
│ facilities     │  │ history        │  │ reminders      │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                     ┌──────┴──────┐
                     │   profiles   │ ← auth.users
                     └──────┬──────┘
                            │
                     ┌──────┴──────┐
                     │ family_links │
                     └─────────────┘

┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│ transport_       │  │ bus_routes   │  │ bus_stops    │
│ services         │──│              │──│              │
└──────────────────┘  └──────────────┘  └──────┬───────┘
                                               │
                                        ┌──────┴───────┐
                                        │ bus_         │
                                        │ timetables   │
                                        └──────────────┘

┌──────────────────┐
│   facilities     │ ← お出かけナビ用施設
└──────────────────┘

┌──────────────────┐
│ search_logs      │ ← 匿名統計用
└──────────────────┘
```

### 9.2 テーブル定義

#### `profiles`（ユーザープロフィール）

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('under39', '40to64', '65to74', 'over75')),
  area TEXT NOT NULL,           -- 14市町村のいずれか
  has_car BOOLEAN DEFAULT false,
  mobility_aid TEXT DEFAULT 'none' CHECK (mobility_aid IN ('none', 'cane', 'wheelchair')),
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('medium', 'large', 'xlarge')),
  notify_reminder BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `favorite_facilities`（かかりつけ医登録）

```sql
CREATE TABLE favorite_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hospital_id)
);
```

#### `search_history`（検索履歴）

```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  search_type TEXT NOT NULL CHECK (search_type IN ('symptom', 'search', 'outing', 'route')),
  search_params JSONB NOT NULL,  -- 検索パラメータを丸ごと保存
  result_hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 直近10件のみ保持（アプリ側で制御）
```

#### `visit_reminders`（受診リマインダー）

```sql
CREATE TABLE visit_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  next_visit_date DATE NOT NULL,
  interval_days INTEGER,         -- 定期通院の間隔（null = 単発）
  memo TEXT,
  is_active BOOLEAN DEFAULT true,
  notified_at TIMESTAMPTZ,       -- 最後に通知した日時
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `family_links`（家族紐付け）

```sql
CREATE TABLE family_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  family_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL, -- 招待コードの有効期限（24時間）
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `transport_services`（交通サービス）

```sql
CREATE TABLE transport_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  operator TEXT NOT NULL,           -- 運営事業者名
  service_type TEXT NOT NULL CHECK (service_type IN (
    'route_bus', 'demand', 'taxi', 'welfare_taxi', 'shuttle'
  )),
  service_area TEXT[] NOT NULL,     -- 対応市町村（配列）
  phone TEXT,
  website_url TEXT,
  booking_url TEXT,
  booking_method TEXT CHECK (booking_method IN ('phone', 'web', 'app', 'none')),
  advance_booking_required BOOLEAN DEFAULT false,
  booking_deadline_hours INTEGER,   -- 予約締切（出発の何時間前）
  eligibility TEXT,                 -- 利用条件
  fare_info TEXT,                   -- 料金情報
  wheelchair_accessible BOOLEAN DEFAULT false,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_transport_services_area ON transport_services USING GIN (service_area);
CREATE INDEX idx_transport_services_type ON transport_services (service_type);
```

#### `bus_routes`（バス路線）

```sql
CREATE TABLE bus_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transport_service_id UUID NOT NULL REFERENCES transport_services(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  route_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `bus_stops`（バス停）

```sql
CREATE TABLE bus_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bus_stops_location ON bus_stops (latitude, longitude);
```

#### `bus_timetables`（時刻表）

```sql
CREATE TABLE bus_timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_route_id UUID NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
  bus_stop_id UUID NOT NULL REFERENCES bus_stops(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  day_type TEXT NOT NULL CHECK (day_type IN ('weekday', 'saturday', 'holiday')),
  stop_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bus_timetables_route ON bus_timetables (bus_route_id, direction, day_type, stop_order);
```

#### `facilities`（お出かけナビ用施設）

```sql
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'shopping', 'government', 'banking', 'welfare', 'leisure'
  )),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  website_url TEXT,
  opening_hours TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_facilities_category ON facilities (category);
CREATE INDEX idx_facilities_city ON facilities (city);
```

#### `search_logs`（匿名検索ログ）

```sql
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type TEXT NOT NULL CHECK (log_type IN ('symptom', 'search', 'outing', 'route')),
  search_data JSONB NOT NULL,     -- 匿名化された検索データ（個人情報を含めない）
  area TEXT,                       -- 検索元の市町村（統計用）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_logs_type ON search_logs (log_type);
CREATE INDEX idx_search_logs_created ON search_logs (created_at);
```

### 9.3 RLSポリシー（新規テーブル）

#### `profiles`

| ポリシー                     | 操作   | 条件                       |
| ---------------------------- | ------ | -------------------------- |
| Users can view own profile   | SELECT | `(select auth.uid()) = id` |
| Users can update own profile | UPDATE | `(select auth.uid()) = id` |
| Users can insert own profile | INSERT | `(select auth.uid()) = id` |

#### `favorite_facilities`, `search_history`, `visit_reminders`

| ポリシー                  | 操作                           | 条件                            |
| ------------------------- | ------------------------------ | ------------------------------- |
| Users can manage own data | SELECT, INSERT, UPDATE, DELETE | `(select auth.uid()) = user_id` |

#### `family_links`

| ポリシー                      | 操作   | 条件                                                         |
| ----------------------------- | ------ | ------------------------------------------------------------ |
| Elders can manage own links   | ALL    | `(select auth.uid()) = elder_user_id`                        |
| Family can view active links  | SELECT | `(select auth.uid()) = family_user_id AND status = 'active'` |
| Anyone can activate with code | UPDATE | `status = 'pending'`（コード認証はServer Action内で）        |

#### `transport_services`, `bus_routes`, `bus_stops`, `bus_timetables`, `facilities`

| ポリシー    | 操作                   | 条件                                    |
| ----------- | ---------------------- | --------------------------------------- |
| Public read | SELECT                 | `true`                                  |
| Admin write | INSERT, UPDATE, DELETE | `(select auth.role()) = 'service_role'` |

#### `search_logs`

| ポリシー          | 操作   | 条件                                    |
| ----------------- | ------ | --------------------------------------- |
| Anyone can insert | INSERT | `true`                                  |
| Admin read        | SELECT | `(select auth.role()) = 'service_role'` |

---

## 10. API設計（追加エンドポイント）

### 10.1 交通関連

#### GET `/api/transport`

交通サービス一覧を取得。

| パラメータ | 型     | 説明                                           |
| ---------- | ------ | ---------------------------------------------- |
| `area`     | string | 市町村でフィルタ（service_area配列にoverlaps） |
| `type`     | string | サービス種別でフィルタ                         |

レスポンス: `{ services: TransportService[] }`

#### GET `/api/transport/[id]`

交通サービス詳細（バス路線の場合は路線・停留所・時刻表込み）。

#### POST `/api/route/search`

ルート検索。

```typescript
// リクエスト
{
  from: { lat: number, lng: number } | { address: string },
  to: { lat: number, lng: number } | { hospital_id: string },
  arrival_time?: string,  // ISO 8601
  wheelchair?: boolean
}

// レスポンス
{
  routes: [
    {
      type: 'driving' | 'transit' | 'demand' | 'taxi' | 'walking',
      transport_name?: string,
      departure_time: string,
      arrival_time: string,
      duration_minutes: number,
      distance_km: number,
      fare?: string,
      booking_required: boolean,
      booking_phone?: string,
      booking_url?: string,
      steps: RouteStep[],
      map_url?: string  // Google Maps のルートURL
    }
  ]
}
```

### 10.2 AI関連

#### POST `/api/symptoms/ai-recommend`

AI受診レコメンド（Phase 1の`/api/symptoms/ai-diagnosis`を置換。Gemini `gemini-3.1-flash-lite-preview` を使用）。

```typescript
// リクエスト
{
  questionnaire: QuestionnaireData,  // Phase 1と同じ構造
  age_group?: string,
  area?: string
}

// レスポンス
{
  urgency: 'emergency' | 'soon' | 'watch',
  urgency_reason: string,
  recommended_departments: string[],
  department_reason: string,
  advice: string,
  disclaimer: string
}
```

### 10.3 ユーザー関連

#### GET/PUT `/api/user/profile`

プロフィール取得・更新（Supabase Auth認証必須）。

#### GET/POST/DELETE `/api/user/favorites`

かかりつけ医のCRUD。

#### GET `/api/user/history`

検索履歴一覧（直近10件）。

#### GET/POST/PUT/DELETE `/api/user/reminders`

受診リマインダーのCRUD。

#### POST `/api/user/family/invite`

家族招待コード発行。

#### POST `/api/user/family/connect`

招待コードでの家族紐付け。

### 10.4 施設関連

#### GET `/api/facilities`

お出かけナビ用施設一覧。

| パラメータ | 型     | 説明             |
| ---------- | ------ | ---------------- |
| `category` | string | カテゴリフィルタ |
| `city`     | string | 市町村フィルタ   |

### 10.5 統計関連

#### POST `/api/logs`

匿名検索ログの記録。ユーザーの検索時に自動送信（個人情報を含めない）。

---

## 11. ページ構成（追加・変更）

### 11.1 追加ページ

| パス                         | 画面名               | レンダリング     | 説明                                         |
| ---------------------------- | -------------------- | ---------------- | -------------------------------------------- |
| `/outing`                    | お出かけナビ         | Client Component | 目的カテゴリ選択                             |
| `/outing/[category]`         | 施設一覧             | Client Component | カテゴリ別施設リスト                         |
| `/route`                     | ルート検索結果       | Client Component | 交通ルート表示・地図                         |
| `/login`                     | ログイン             | Client Component | マジックリンク / メール+パスワード           |
| `/signup`                    | 新規登録             | Client Component | アカウント作成 + プロフィール入力            |
| `/mypage`                    | マイページ           | Client Component | プロフィール・かかりつけ・履歴・リマインダー |
| `/mypage/family`             | 家族見守り           | Client Component | 家族リンク管理                               |
| `/mypage/settings`           | 設定                 | Client Component | フォントサイズ・通知・ログアウト             |
| `/emergency`                 | 緊急時ガイド         | Server Component | 救急病院リスト + 119番ボタン                 |
| `/admin/transport`           | 交通手段管理         | Client Component | 交通サービスCRUD                             |
| `/admin/transport/[id]/edit` | 交通手段編集         | Server Component | 詳細情報編集                                 |
| `/admin/transport/import`    | 交通データインポート | Client Component | CSV取り込み                                  |
| `/admin/facilities`          | 施設管理             | Client Component | お出かけナビ施設CRUD                         |
| `/admin/facilities/import`   | 施設データインポート | Client Component | CSV取り込み                                  |

### 11.2 変更ページ

| パス               | 変更内容                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| `/`                | CTA3つ化（症状 / 検索 / お出かけ）、ログインリンク、緊急時ガイドリンク |
| `/results`         | 緊急度表示追加、病院リスト項目に「行き方」ボタン追加                   |
| `/hospital/[id]`   | Google Maps埋め込み、交通アクセスセクション、かかりつけ登録ボタン      |
| `/search`          | フィルター追加（オンライン診療・バリアフリー・救急対応）               |
| `/admin/dashboard` | 統計項目追加                                                           |

---

## 12. ユーザーフロー（Phase 2）

### 12.1 症状 → 受診先 → 交通手段（メインフロー）

```
ホーム（/）
  │  「症状から病院を探す」
  ▼
アンケート（/questionnaire）← Phase 1と同じ
  │  Q1〜Q7 回答
  ▼
結果表示（/results）← Phase 2 で強化
  │
  ├── 🔴🟡🟢 AI緊急度判定（新規）
  │     └── 緊急の場合: 119番ボタン + 救急病院のみ表示
  │
  ├── 推奨診療科（既存 + AI強化）
  ├── 症状まとめ（既存）
  │
  └── 対応病院リスト（スコア順、既存改修）
        │  病院タップ → 病院詳細
        │  「🚌 行き方」タップ
        ▼
     出発地入力モーダル
        │  GPS or 住所入力
        ▼
     ルート検索結果（/route?...）
        ├── ルート1: 🚌 信南交通バス → 所要25分、¥300
        ├── ルート2: 🚕 南信タクシー → 所要15分、約¥2,000（📞 ワンタップ予約）
        └── ルート3: 🚗 自家用車 → 所要12分
```

### 12.2 お出かけナビフロー

```
ホーム（/）
  │  「🚶 お出かけナビ」
  ▼
お出かけナビ（/outing）
  │  カテゴリ選択（買い物 / 役所 / 銀行...）
  ▼
施設一覧（/outing/shopping）
  │  市町村フィルタ → 施設タップ
  ▼
施設詳細 + 「ここへの行き方」
  ▼
ルート検索結果（/route?...）
```

### 12.3 マイページフロー

```
ヘッダー「👤」アイコン
  ▼
マイページ（/mypage）
  ├── かかりつけ医（⭐ 一覧）
  │     └── 「📞 電話」「🚌 行き方」ボタン
  ├── 受診履歴
  │     └── 「もう一度この病院を検索」
  ├── リマインダー
  │     └── 次回受診日の設定・編集
  ├── 家族見守り（/mypage/family）
  │     ├── 招待コード発行
  │     └── リンク済み家族の一覧
  └── 設定（/mypage/settings）
        └── フォントサイズ / 通知 / ログアウト
```

---

## 13. 外部API・サービス追加

### 13.1 Google Maps Platform

| API                 | 用途                     | 料金目安           |
| ------------------- | ------------------------ | ------------------ |
| Maps JavaScript API | 地図埋め込み表示         | 月$200無料枠       |
| Directions API      | ルート検索・所要時間計算 | $5/1,000リクエスト |
| Geocoding API       | 住所→座標変換            | $5/1,000リクエスト |
| Distance Matrix API | 距離・所要時間の一括計算 | $5/1,000リクエスト |

**コスト最適化策**:

- 地図表示は病院詳細ページのみ（一覧では不使用）
- Directions APIの結果をキャッシュ（同一ルートは24時間キャッシュ）
- Distance Matrixは管理画面での一括計算時のみ使用

### 13.2 Gemini API

| 用途                 | モデル                                          | 料金                                        |
| -------------------- | ----------------------------------------------- | ------------------------------------------- |
| 症状分析・緊急度判定 | `gemini-3.1-flash-lite-preview`                 | $0.25/1M入力トークン + $1.50/1M出力トークン |
| フォールバック       | Phase 1のルールベース（`departmentMapping.ts`） | 無料（ローカル処理）                        |

**Gemini 3.1 Flash-Lite を選択した理由**:

- **高速**: 2.5 Flashと比べてTTFT（最初のトークンまでの時間）が2.5倍高速。症状分析の応答5秒以内を達成しやすい
- **低コスト**: $0.25/1M入力は最安クラス。高齢者向けサービスの限られた予算で運用可能
- **十分な品質**: GPQA Diamondで86.9%のスコア。症状→診療科マッピング程度のタスクには十分な性能
- **JSON出力対応**: `response_mime_type: "application/json"` でネイティブにJSON構造化出力が可能
- **1Mコンテキスト**: 将来的にRAG（医療ナレッジベース連携）にも対応可能

**Phase 1からの移行作業**:

- `openai` パッケージを削除（`npm uninstall openai`）
- `OPENAI_API_KEY` 環境変数を削除
- `NEXT_PUBLIC_AI_DIAGNOSIS` 環境変数を削除（常時有効化）
- `/api/symptoms/ai-diagnosis` を `/api/symptoms/ai-recommend` に置換
- `@google/generative-ai` パッケージを追加（`npm install @google/generative-ai`）
- `GEMINI_API_KEY` 環境変数を追加

### 13.3 Resend

| 用途                     | 備考                         |
| ------------------------ | ---------------------------- |
| マジックリンク認証メール | Supabase Auth経由で設定可能  |
| 受診リマインダー通知     | 前日18:00にバッチ送信        |
| 家族への受診予定通知     | リマインダー登録時に即時送信 |

月間3,000通まで無料プラン。

---

## 14. 既存コンポーネントの改修

### 14.1 再利用するコンポーネント

| コンポーネント                  | Phase 2での用途        | 改修内容                            |
| ------------------------------- | ---------------------- | ----------------------------------- |
| `QuestionnaireForm`             | 症状入力（変更なし）   | そのまま使用                        |
| `QuestionOption`                | お出かけカテゴリ選択   | props追加でアイコンサイズ変更可能に |
| `HospitalListItem`              | 施設リスト項目にも流用 | 汎用化（`ListItem`に名称変更検討）  |
| `HospitalCard`                  | 施設詳細にも流用       | 交通アクセスセクション追加          |
| `Accordion`                     | ルート詳細の折りたたみ | そのまま使用（3バリアント活用）     |
| `MobileFixedFooter`             | 全ページで使用         | ボトムナビゲーション化を検討        |
| `ConfirmModal` / `SuccessModal` | 管理画面全般           | そのまま使用                        |
| `Toast`                         | 操作通知               | そのまま使用                        |
| `Button`                        | 全ページ               | 「電話予約」用の特大バリアント追加  |
| `LoadingBox` / `LoadingSpinner` | 全ページ               | そのまま使用                        |
| `ErrorBox`                      | 全ページ               | そのまま使用                        |

### 14.2 新規コンポーネント

| コンポーネント   | 用途                                     |
| ---------------- | ---------------------------------------- |
| `RouteCard`      | ルート検索結果の各ルートカード           |
| `RouteMap`       | Google Maps埋め込みルート表示            |
| `UrgencyBadge`   | 🔴🟡🟢 緊急度バッジ                      |
| `LocationInput`  | 出発地入力（GPS + 住所入力 + 地区選択）  |
| `TransportInfo`  | 交通手段情報カード                       |
| `FavoriteButton` | かかりつけ医登録/解除ボタン（⭐ トグル） |
| `ReminderForm`   | リマインダー登録フォーム                 |
| `FamilyInvite`   | 家族招待コード表示・入力                 |
| `BottomNav`      | ボトムナビゲーション（4タブ）            |
| `AuthGuard`      | ログイン必須ページのガード               |
| `FacilityCard`   | お出かけナビ施設カード                   |
| `CategoryGrid`   | お出かけカテゴリ選択グリッド             |

### 14.3 レイアウト変更

#### ボトムナビゲーション導入

Phase 1ではMobileFixedFooterがページごとに異なるボタンを表示していたが、Phase 2ではグローバルなボトムナビゲーションを導入。

```
┌──────────────────────────────────┐
│  🏠 ホーム  │ 🩺 症状  │ 🚶 お出かけ  │ 👤 マイページ │
└──────────────────────────────────┘
```

- モバイルのみ表示（`md:hidden`）
- 現在のページに対応するアイコンがアクティブカラーに
- ゲスト時は「マイページ」タップでログイン画面へ
- Phase 1のMobileFixedFooterはページ固有のアクションボタン用として併存

---

## 15. 非機能要件

### 15.1 パフォーマンス目標

| 項目                   | 目標値             | 備考                                 |
| ---------------------- | ------------------ | ------------------------------------ |
| ページ初期読み込み     | 3秒以内（LTE環境） | Phase 1と同等                        |
| AI緊急度判定応答       | 5秒以内            | Gemini APIのレイテンシ               |
| ルート検索応答         | 4秒以内            | Google Maps API + 地域交通データ検索 |
| 地図描画               | 2秒以内            | Google Maps JavaScript API           |
| Lighthouse Performance | 85以上             | 地図APIの追加により若干低下を許容    |

### 15.2 PWA対応

- `next-pwa` による Progressive Web App 化
- ホーム画面追加プロンプトの表示
- オフライン時: 最後に閲覧した医療機関情報・かかりつけ医情報のキャッシュ表示
- Service Worker によるAPIレスポンスキャッシュ

### 15.3 セキュリティ追加事項

| 対策                 | 実装                                           |
| -------------------- | ---------------------------------------------- |
| Supabase Auth        | ユーザー認証・セッション管理                   |
| RLS（新規テーブル）  | 全新規テーブルでRLS有効化                      |
| AI送信データの匿名化 | Gemini APIへの送信時は個人特定情報を除外       |
| 招待コードの有効期限 | 24時間で自動失効                               |
| レート制限           | AI API呼び出しを1ユーザーあたり10回/時間に制限 |

---

## 16. 開発サブフェーズ

Phase 2 全体を約4ヶ月で開発。以下の3サブフェーズに分割。

### Phase 2-A: 交通ナビ基盤 + DB拡張（約6週間）

| タスク                 | 詳細                                                      |
| ---------------------- | --------------------------------------------------------- |
| hospitalsテーブル拡張  | ALTER TABLE でカラム追加（緯度経度・オンライン診療等）    |
| 交通データテーブル作成 | transport_services, bus_routes, bus_stops, bus_timetables |
| 交通データ管理画面     | 管理画面にCRUD + CSVインポート                            |
| Google Maps統合        | 病院詳細に地図埋め込み、Directions APIルート検索          |
| ルート検索UI           | `/route` ページ、RouteCard、LocationInput                 |
| 病院詳細改修           | 地図表示 + 「ここへの行き方」ボタン                       |
| 結果ページ改修         | 病院リスト項目に「行き方」ボタン追加                      |
| 初期交通データ投入     | 飯田市内の主要交通手段データ                              |

### Phase 2-B: AI強化 + ユーザー機能（約6週間）

| タスク               | 詳細                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Gemini API統合       | `@google/generative-ai` 導入、`gemini-3.1-flash-lite-preview` でAI緊急度判定・受診レコメンド。OpenAIパッケージ・環境変数を削除 |
| 緊急度UI             | UrgencyBadge、結果ページのレイアウト変更                                                                                       |
| Supabase Auth導入    | ユーザー登録・ログイン（マジックリンク）                                                                                       |
| プロフィール機能     | profiles テーブル、プロフィール編集UI                                                                                          |
| かかりつけ医         | FavoriteButton、マイページ表示                                                                                                 |
| 検索履歴             | 自動記録、マイページ表示                                                                                                       |
| 受診リマインダー     | ReminderForm、メール通知（Resend）                                                                                             |
| マイページ           | 全サブ機能の統合UI                                                                                                             |
| ボトムナビゲーション | BottomNavコンポーネント、ヘッダー改修                                                                                          |

### Phase 2-C: お出かけナビ + 見守り + 仕上げ（約4週間）

| タスク                 | 詳細                                      |
| ---------------------- | ----------------------------------------- |
| facilitiesテーブル作成 | お出かけナビ用施設データ                  |
| 施設管理画面           | 管理画面にCRUD + CSVインポート            |
| お出かけナビUI         | `/outing` + `/outing/[category]`          |
| 家族見守り             | family_links テーブル、招待・紐付けフロー |
| 緊急時ガイド           | `/emergency` 救急病院リスト + 119番ボタン |
| 統計ダッシュボード強化 | search_logs、統計表示追加                 |
| ホームページ改修       | CTA3つ化、ナビ改修                        |
| PWA対応                | Service Worker、オフラインキャッシュ      |
| テスト・デバッグ       | 全機能の結合テスト                        |
| 検索フィルター追加     | オンライン診療・バリアフリー・救急対応    |

---

## 17. リスクと対策

### 17.1 技術リスク

| リスク                               | 影響             | 対策                                                                                        |
| ------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------- |
| Google Maps API コスト超過           | 月額増加         | キャッシュ戦略、$200無料枠の範囲で運用                                                      |
| Gemini API 応答遅延・障害            | UX低下           | ルールベースフォールバック（Phase 1の`departmentMapping.ts`）で自動切替。OpenAIは使用しない |
| Supabase Auth + 既存Cookie認証の共存 | 認証の複雑化     | 管理者認証は既存方式を維持、ユーザー認証のみSupabase Auth                                   |
| 地図APIによるバンドルサイズ増加      | 読み込み速度低下 | 動的インポート（Phase 1のhtml2canvasパターンを踏襲）                                        |

### 17.2 データリスク

| リスク                 | 影響                     | 対策                                                          |
| ---------------------- | ------------------------ | ------------------------------------------------------------- |
| 交通データの収集困難   | 機能不完全               | MVP段階では電話番号リンクのみでも価値あり。段階的にデータ拡充 |
| バス時刻表の頻繁な変更 | データ陳腐化             | 更新フローの明確化、管理画面での簡易更新                      |
| 施設データの網羅性     | お出かけナビの利便性低下 | 飯田市中心部から開始、ユーザーフィードバックで拡充            |

### 17.3 ビジネスリスク

| リスク       | 影響                     | 対策                                               |
| ------------ | ------------------------ | -------------------------------------------------- |
| ユーザー獲得 | 利用されない             | ほほえみラボの生徒に先行体験してもらい、口コミ展開 |
| 運用負荷     | データ更新が追いつかない | 管理画面の使いやすさ重視、CSVインポートの活用      |
| 自治体連携   | 公式データが得られない   | 公開情報での運用から開始し、実績を作ってから交渉   |

---

## 18. コスト見積もり（追加分）

### 18.1 Phase 2 追加ランニングコスト

| サービス                                    | 月額                | 備考                                                        |
| ------------------------------------------- | ------------------- | ----------------------------------------------------------- |
| Google Maps Platform                        | ¥0〜¥10,000         | 月$200の無料枠内を目標                                      |
| Gemini API（gemini-3.1-flash-lite-preview） | ¥0〜¥500            | $0.25/1M入力 + $1.50/1M出力。月数千リクエスト程度なら数百円 |
| Resend                                      | ¥0                  | 月3,000通まで無料                                           |
| Supabase Pro（移行時）                      | ¥3,200              | ユーザー数増加でフリープランの制限に達した場合              |
| **Phase 2 追加合計**                        | **¥0〜¥13,700**     |                                                             |
| **Phase 1 + 2 合計**                        | **¥6,000〜¥44,700** |                                                             |

### 18.2 無料枠最大活用の方針

- Google Maps: 地図表示を必要最小限に。一覧では地図不使用、詳細ページのみ
- Gemini: `gemini-3.1-flash-lite-preview` は最安クラス（$0.25/1M入力）。月1,000リクエスト×200トークンでも約$0.05
- Supabase: フリープランで可能な限り運用（50,000行まで）
- Resend: 通知メールは必要なもののみ（リマインダー前日通知のみ）

---

**ドキュメントバージョン**: v1.0
**作成日**: 2026-03-29
**作成者**: ほほえみラボ
**前提ドキュメント**: Phase1-Specification.md v2.0
