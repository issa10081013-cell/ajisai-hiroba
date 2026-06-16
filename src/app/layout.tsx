import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const noto = Noto_Sans_JP({
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
});

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
    <html lang="ja" className={noto.className}>
      <body className="bg-[#FAFAF9] text-[#222]" style={{ WebkitFontSmoothing: "antialiased" }}>

        <header className="bg-white border-b border-[#EBEBEB] sticky top-0 z-50">
          <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 no-underline min-w-0">
              <img
                src="https://dvqewysazrkhlvvlvuww.supabase.co/storage/v1/object/public/images/logo/ajisai-logo-1781517450336.png"
                alt="あじさいロゴ"
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <span className="hidden sm:block font-bold text-[#222] text-[15px] tracking-tight whitespace-nowrap">
                あじさい<span className="text-[#7B6BA8]">体験ひろば</span>
              </span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1 shrink-0">
              <Link
                href="/experiences"
                className="hidden sm:block text-[13px] font-medium text-[#222] px-4 py-2 rounded-full border border-[#DDDDDD] hover:border-[#222] transition-colors no-underline"
              >
                体験を探す
              </Link>
              <Link
                href="/board"
                className="hidden sm:block text-[13px] font-medium text-[#222] px-4 py-2 rounded-full border border-[#DDDDDD] hover:border-[#222] transition-colors no-underline"
              >
                掲示板
              </Link>
              <Link
                href="/login"
                className="hidden sm:block text-[13px] font-medium text-[#222] px-4 py-2 rounded-full border border-[#DDDDDD] hover:border-[#222] transition-colors no-underline"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="ml-1 bg-[#7B6BA8] text-white px-4 py-2 rounded-full text-[13px] font-semibold no-underline whitespace-nowrap"
              >
                会員登録
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="bg-white border-t border-[#EBEBEB] mt-20 py-10 px-6">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="https://dvqewysazrkhlvvlvuww.supabase.co/storage/v1/object/public/images/logo/ajisai-logo-1781517450336.png"
                alt="あじさいロゴ"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-semibold text-[#717171]">あじさい体験ひろば</span>
            </div>
            <p className="text-[11px] text-[#AAAAAA]">
              © 2026 紫人彩（あじさい）— 福岡の子育て家族のための体験プラットフォーム
            </p>
          </div>
        </footer>

      </body>
    </html>
  );
}
