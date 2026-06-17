"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const ICON_HOME = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#7B6BA8" : "none"} stroke={active ? "#7B6BA8" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);
const ICON_SEARCH = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#7B6BA8" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const ICON_BOARD = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#7B6BA8" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const ICON_USER = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#7B6BA8" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const ICON_PROVIDER = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#7B6BA8" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export default function BottomNav() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      setLoggedIn(!!user);
      if (user) {
        const { data } = await supabaseBrowser.from("providers").select("id").eq("auth_user_id", user.id).single();
        setIsProvider(!!data);
      }
    };
    check();
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
      if (!session) setIsProvider(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const mypageHref = loggedIn ? "/mypage" : "/login";

  const TABS = [
    { href: "/", label: "ホーム", icon: ICON_HOME },
    { href: "/experiences", label: "体験を探す", icon: ICON_SEARCH },
    { href: "/board", label: "掲示板", icon: ICON_BOARD },
    ...(isProvider ? [{ href: "/admin/dashboard", label: "管理画面", icon: ICON_PROVIDER }] : []),
    { href: mypageHref, label: "マイページ", icon: ICON_USER },
  ];

  const isActive = (href: string) => {
    if (href === "/" ) return pathname === "/";
    if (href === "/login") return pathname === "/login";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EBEBEB]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div style={{ display: "flex" }}>
        {TABS.map(tab => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 4px 8px", textDecoration: "none", touchAction: "manipulation" }}>
              {tab.icon(active)}
              <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, color: active ? "#7B6BA8" : "#9ca3af", lineHeight: 1 }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
