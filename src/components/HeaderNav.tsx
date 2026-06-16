"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function HeaderNav() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user));
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="flex items-center gap-1 shrink-0">
      <Link href="/experiences"
        className="hidden sm:block text-[13px] font-medium text-[#222] px-4 py-2 rounded-full border border-[#DDDDDD] hover:border-[#222] transition-colors no-underline">
        体験を探す
      </Link>
      <Link href="/board"
        className="hidden sm:block text-[13px] font-medium text-[#222] px-4 py-2 rounded-full border border-[#DDDDDD] hover:border-[#222] transition-colors no-underline">
        掲示板
      </Link>
      {loggedIn ? (
        <Link href="/mypage"
          className="ml-1 hidden sm:block text-[13px] font-medium text-[#222] px-4 py-2 rounded-full border border-[#DDDDDD] hover:border-[#222] transition-colors no-underline">
          マイページ
        </Link>
      ) : (
        <>
          <Link href="/login"
            className="hidden sm:block text-[13px] font-medium text-[#222] px-4 py-2 rounded-full border border-[#DDDDDD] hover:border-[#222] transition-colors no-underline">
            ログイン
          </Link>
          <Link href="/register"
            className="ml-1 bg-[#7B6BA8] text-white px-4 py-2 rounded-full text-[13px] font-semibold no-underline whitespace-nowrap">
            会員登録
          </Link>
        </>
      )}
    </nav>
  );
}
