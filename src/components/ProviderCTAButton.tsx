"use client";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import React from "react";

export default function ProviderCTAButton({ style, className, children }: { style?: React.CSSProperties; className?: string; children?: React.ReactNode }) {
  const router = useRouter();

  const handleClick = async () => {
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (user) {
      const { data } = await supabaseBrowser.from("providers").select("id").eq("auth_user_id", user.id).single();
      router.push(data ? "/admin/dashboard" : "/admin/register");
    } else {
      router.push("/admin/register");
    }
  };

  return (
    <button onClick={handleClick} style={style} className={className}>
      {children}
    </button>
  );
}
