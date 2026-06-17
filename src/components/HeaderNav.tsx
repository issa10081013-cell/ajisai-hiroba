"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function HeaderNav() {
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
      {isProvider && (
        <Link href="/admin/dashboard"
          className="hidden sm:block text-[13px] font-medium text-[#7B6BA8] px-4 py-2 rounded-full border border-[#d8d0ef] hover:border-[#7B6BA8] transition-colors no-underline">
          管理画面
        </Link>
      )}
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
