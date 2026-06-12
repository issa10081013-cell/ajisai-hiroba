import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "あじさい体験ひろば",
  description: "福岡の子育て家族のための体験・予約プラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-[#FAFAF9]">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🌸</span>
              <span className="font-bold text-[#7B6BA8] text-lg">あじさい体験ひろば</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/experiences" className="text-gray-600 hover:text-[#7B6BA8] transition-colors">
                体験を探す
              </Link>
              <Link
                href="/experiences"
                className="bg-[#7B6BA8] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#6a5b97] transition-colors"
              >
                予約する
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-gray-100 mt-16 py-8 text-center text-sm text-gray-400">
          <p>あじさい体験ひろば — 紫人彩（あじさい）が運営する福岡の子育て家族のための体験プラットフォーム</p>
        </footer>
      </body>
    </html>
  );
}
