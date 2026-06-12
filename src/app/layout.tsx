import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const noto = Noto_Sans_JP({
  weight: ["400", "500", "700", "800"],
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
    <html lang="ja" className={`h-full ${noto.className}`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#FAFAF9", color: "#1a1a1a" }}>
        <header style={{ backgroundColor: "white", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 16px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <span style={{ fontSize: "22px" }}>🌸</span>
              <span style={{ fontWeight: 800, color: "#7B6BA8", fontSize: "16px", letterSpacing: "-0.01em" }}>あじさい体験ひろば</span>
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link href="/experiences" style={{ color: "#6b7280", fontSize: "13px", textDecoration: "none", fontWeight: 500 }}>
                体験を探す
              </Link>
              <Link href="/experiences" style={{ backgroundColor: "#7B6BA8", color: "white", padding: "7px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                予約する
              </Link>
            </nav>
          </div>
        </header>
        <main style={{ flex: 1 }}>{children}</main>
        <footer style={{ backgroundColor: "white", borderTop: "1px solid #f3f4f6", marginTop: "64px", padding: "32px 16px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#9ca3af" }}>あじさい体験ひろば — 紫人彩（あじさい）が運営する福岡の子育て家族のための体験プラットフォーム</p>
        </footer>
      </body>
    </html>
  );
}
