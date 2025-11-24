import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/Common/Header";
import Footer from "@/components/Common/Footer";
import ScrollToTop from "@/components/Common/ScrollToTop";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "病院ナビ南信 | 症状から探す 安心の病院ナビ",
  description: "症状から適切な病院を探せる、南信地域の医療機関検索サービス。シニア層にも使いやすいデザインで、安心の受診をサポートします。",
  keywords: "病院, 南信, 飯田市, 症状, 診療科, シニア, 医療機関",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} antialiased flex flex-col min-h-screen`}>
        {/* スキップリンク（キーボードナビゲーション） */}
        <a href="#main-content" className="skip-link">
          メインコンテンツへスキップ
        </a>

        <Header />

        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>

        <Footer />

        {/* スクロールトップボタン */}
        <ScrollToTop />
      </body>
    </html>
  );
}
