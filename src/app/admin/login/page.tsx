"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });

    if (error) {
      setError("メールアドレスまたはパスワードが違います");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F5F3FA", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "400px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <span style={{ fontSize: "32px" }}>🌸</span>
          <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a", marginTop: "8px" }}>提供者ログイン</h1>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>あじさい体験ひろば 管理画面</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "10px", marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#ef4444", textAlign: "center" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>メールアドレス</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>パスワード</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{ backgroundColor: "#7B6BA8", color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, marginTop: "4px" }}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
