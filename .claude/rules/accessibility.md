---
paths:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
  - "src/app/**/*.css"
---

# アクセシビリティ & シニア向けUIルール

## ターゲットユーザー

- 主要層: 40代〜シニア層（特に60代以上）
- スマートフォン操作が苦手
- 診療科の判断に迷う、症状説明が困難

## 必須要件

| 項目 | 基準 |
|------|------|
| フォントサイズ | 最小18px、大文字モード24px以上 |
| タップ領域 | 最小48px x 48px（`min-h-[48px]`） |
| コントラスト比 | WCAG AA レベル以上 |
| キーボード操作 | 全機能がキーボードのみで操作可能 |

## セマンティックHTML & ARIA

- Header: `role="banner"`, `aria-label`
- Footer: `role="contentinfo"`, `aria-label`
- Navigation: `<nav role="navigation" aria-label="...">`
- Main: `<main id="main-content" role="main">`
- スキップリンク: `<a href="#main-content">メインコンテンツへスキップ</a>`

## CSS 対応

- `prefers-reduced-motion`: アニメーション自動無効化
- `prefers-contrast: high`: ハイコントラストモード対応
- `.sr-only`: スクリーンリーダー専用テキスト
- `-webkit-tap-highlight-color`: タップハイライト

## 医療法準拠

- 「診断」「治療」などの医療用語を避ける
- 「参考情報」「受診の目安」と表現する
- 「医師の診察を受けてください」を必ず明記
- AI診断結果には「医学的診断ではない」と強調表示
- 緊急時の119番通報指示を含める

## モバイル対応

- スマホ用固定フッター（MobileFixedFooter コンポーネント）
- 電話番号ボタン: `<a href="tel:...">` で電話アプリ起動
- ボタンは3列グリッドで配置（電話・地図・Web）
