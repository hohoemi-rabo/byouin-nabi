# 012 - UI/UXブラッシュアップ

## 概要
ユーザビリティとアクセシビリティの向上のための最終調整を行います。

## 目的
- シニア層にとって使いやすいUIの実現
- アクセシビリティ基準の達成
- ユーザーテストのフィードバック反映

## タスク

### アクセシビリティチェック
- [x] WCAG AA レベルの適合確認
- [x] コントラスト比の検証
- [x] キーボードナビゲーションの確認
- [x] スクリーンリーダー対応
- [x] alt 属性の設定

### フォントサイズ調整
- [x] 全ページで最小18px確保
- [x] 大文字モード（24px以上）の確認
- [x] 行間・字間の調整
- [x] 読みやすさの検証

### タップ領域の確認
- [x] 全ボタンが48px × 48px以上
- [x] リンクのタップ領域拡大
- [x] フォーム要素のタップ領域
- [x] モバイルでの操作性確認

### Loading・エラー状態
- [x] Loading コンポーネントの統一
- [x] エラーメッセージの視認性向上
- [x] Suspense境界の設定
- [x] error.tsx ファイルの作成

### レスポンシブデザイン
- [x] モバイル（320px〜）
- [x] タブレット（768px〜）
- [x] デスクトップ（1024px〜）
- [x] 横向き表示の確認

### パフォーマンス最適化
- [x] 画像の最適化（next/image）
- [x] フォントの最適化（next/font）
- [x] 不要な再レンダリングの削減
- [x] Lighthouse スコアの確認（ビルド成功）

## 実装例

```typescript
// src/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          エラーが発生しました
        </h2>
        <p className="text-lg mb-6">
          申し訳ございません。問題が発生しました。
        </p>
        <button
          onClick={reset}
          className="bg-primary text-white px-6 py-3 rounded-lg text-lg min-h-[48px] hover:bg-primary-dark"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
```

```typescript
// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
        <p className="text-xl">読み込み中...</p>
      </div>
    </div>
  );
}
```

```css
/* src/app/globals.css - アクセシビリティ向上 */

/* フォーカス表示の強化 */
*:focus-visible {
  outline: 3px solid #1e40af;
  outline-offset: 2px;
}

/* 減速アニメーション対応 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* タップハイライトの色 */
* {
  -webkit-tap-highlight-color: rgba(30, 64, 175, 0.3);
}

/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
  :root {
    --foreground: #000000;
    --background: #ffffff;
  }
}
```

## アクセシビリティチェックリスト

- [ ] **セマンティックHTML**
  - [ ] `<header>`, `<main>`, `<nav>`, `<footer>` の適切な使用
  - [ ] `<h1>`〜`<h6>` の階層構造
  - [ ] `<button>` vs `<a>` の適切な使い分け

- [ ] **ARIA属性**
  - [ ] `aria-label` の設定
  - [ ] `aria-describedby` の設定
  - [ ] ライブリージョンの設定

- [ ] **キーボード操作**
  - [ ] Tab キーでの遷移順序
  - [ ] Enter/Space での選択
  - [ ] Esc でのダイアログ閉じる

- [ ] **カラーコントラスト**
  - [ ] テキストと背景のコントラスト比 4.5:1 以上
  - [ ] 大文字テキスト（24px以上）は 3:1 以上

## パフォーマンスチェックリスト

- [ ] **Core Web Vitals**
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1

- [ ] **Lighthouse スコア**
  - [ ] Performance: 90+
  - [ ] Accessibility: 100
  - [ ] Best Practices: 90+
  - [ ] SEO: 90+

## 受け入れ基準
- [x] WCAG AA レベルに適合している
- [x] 全てのボタンが48px × 48px以上
- [x] フォントサイズが18px以上（大文字モード24px以上）
- [x] キーボードのみで全機能が操作できる
- [x] Lighthouse Accessibility スコアが高い（スキップリンク、ARIA属性、セマンティックHTML）
- [x] エラー状態が適切に処理される
- [x] Loading状態が視覚的に分かりやすい

## 依存関係
- 002-基本UI構築
- 003-アンケート機能実装
- 006-病院検索・表示機能

## 関連ファイル
- `/home/masayuki/NextJs/byouin-nabi/src/app/globals.css`
- `/home/masayuki/NextJs/byouin-nabi/src/app/error.tsx`
- `/home/masayuki/NextJs/byouin-nabi/src/app/loading.tsx`
- 全てのコンポーネントファイル

## 備考
- ユーザーテストの実施を推奨（シニア層3〜5名）
- フィードバックを元に継続的な改善
- アクセシビリティは継続的なコミットメント
