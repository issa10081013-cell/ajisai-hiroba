"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const lockRes = await fetch(`/api/auth/lockout?email=${encodeURIComponent(form.email)}`);
    const lockData = await lockRes.json();
    if (lockData.locked) {
      setError(`ログイン試行回数が上限を超えました。${lockData.minutesLeft}分後に再試行してください。`);
      setLoading(false);
      return;
    }

    const { error } = await supabaseBrowser.auth.signInWithPassword({ email: form.email, password: form.password });

    await fetch("/api/auth/lockout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, success: !error }),
    });

    if (error) {
      const remaining = 10 - ((lockData.attempts ?? 0) + 1);
      setError(remaining > 0
        ? `メールアドレスまたはパスワードが正しくありません（残り${remaining}回）`
        : "ログインがロックされました。1時間後に再試行してください。"
      );
      setLoading(false);
    } else {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (user && redirectTo === "/") {
        const { data: provider } = await supabaseBrowser.from("providers").select("id").eq("auth_user_id", user.id).single();
        router.push(provider ? "/admin/dashboard" : "/");
      } else {
        router.push(redirectTo);
      }
    }
  };

  const f = (key: keyof typeof form, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F5F3FA", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "400px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img
            src="https://dvqewysazrkhlvvlvuww.supabase.co/storage/v1/object/public/images/logo/ajisai-logo-1781517450336.png"
            alt="ロゴ"
            style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px" }}
          />
          <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 4px" }}>ログイン</h1>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>あじさい体験ひろば</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "10px", marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#ef4444", textAlign: "center", margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>メールアドレス</label>
            <input
              type="email" required value={form.email} onChange={e => f("email", e.target.value)}
              placeholder="example@email.com"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>パスワード</label>
            <input
              type="password" required value={form.password} onChange={e => f("password", e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{ backgroundColor: "#7B6BA8", color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, marginTop: "4px", touchAction: "manipulation" }}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "20px" }}>
          アカウントをお持ちでない方は{" "}
          <Link href="/register" style={{ color: "#7B6BA8", fontWeight: 600 }}>新規登録</Link>
        </p>
        <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
          <Link href="/" style={{ color: "#9ca3af" }}>← 体験を見る（登録不要）</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
