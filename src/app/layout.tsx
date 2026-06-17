import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import HeaderNav from "@/components/HeaderNav";

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
              <span className="font-bold text-[#222] text-[15px] tracking-tight whitespace-nowrap">
                あじさい<span className="text-[#7B6BA8]">体験ひろば</span>
              </span>
            </Link>

            <HeaderNav />
          </div>
        </header>

        <main className="pb-[60px] sm:pb-0">{children}</main>

        <BottomNav />

        <footer className="hidden sm:block bg-white border-t border-[#EBEBEB] mt-20 py-10 px-6">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="https://dvqewysazrkhlvvlvuww.supabase.co/storage/v1/object/public/images/logo/ajisai-logo-1781517450336.png"
                alt="あじさいロゴ"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-semibold text-[#717171]">あじさい体験ひろば</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-[11px] text-[#AAAAAA] hover:text-[#7B6BA8]">利用規約</Link>
              <Link href="/privacy" className="text-[11px] text-[#AAAAAA] hover:text-[#7B6BA8]">プライバシーポリシー</Link>
              <p className="text-[11px] text-[#AAAAAA] m-0">© 2026 あじさい体験ひろば</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
