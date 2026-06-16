"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "", agreed: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("パスワードが一致しません");
      return;
    }
    if (form.password.length < 8) {
      setError("パスワードは8文字以上で設定してください");
      return;
    }
    if (!form.agreed) {
      setError("利用規約への同意が必要です");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/register-provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, password: form.password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "登録に失敗しました");
      setLoading(false);
      return;
    }

    // 登録成功 → そのままログイン
    const { error: loginError } = await supabaseBrowser.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (loginError) {
      setError("登録は完了しましたが、ログインに失敗しました。ログインページからお試しください。");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  const f = (key: keyof typeof form, val: string | boolean) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F5F3FA", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "400px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img
            src="https://dvqewysazrkhlvvlvuww.supabase.co/storage/v1/object/public/images/logo/ajisai-logo-1781517450336.png"
            alt="ロゴ"
            style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px" }}
          />
          <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 4px" }}>主催者として登録</h1>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>あじさい体験ひろば</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "10px", marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#ef4444", textAlign: "center", margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>名前・屋号 *</label>
            <input
              type="text" required value={form.name} onChange={e => f("name", e.target.value)}
              placeholder="例：田中農園 田中さん"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>電話番号 *</label>
            <input
              type="tel" required value={form.phone} onChange={e => f("phone", e.target.value)}
              placeholder="090-0000-0000"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
            <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>本人確認・緊急連絡のために使用します。外部公開はされません。</p>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>メールアドレス *</label>
            <input
              type="email" required value={form.email} onChange={e => f("email", e.target.value)}
              placeholder="example@email.com"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>パスワード（8文字以上）*</label>
            <input
              type="password" required value={form.password} onChange={e => f("password", e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>パスワード（確認）*</label>
            <input
              type="password" required value={form.confirm} onChange={e => f("confirm", e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          {/* Terms */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox" checked={form.agreed} onChange={e => f("agreed", e.target.checked)}
              style={{ marginTop: "2px", accentColor: "#7B6BA8", flexShrink: 0 }}
            />
            <span style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.6 }}>
              <a href="/terms" target="_blank" style={{ color: "#7B6BA8", fontWeight: 600 }}>利用規約</a>に同意します。子どもが参加する体験の主催者として、安全な環境の提供に責任を持ちます。虚偽の情報での登録・不審な行為はアカウント停止の対象となります。
            </span>
          </label>

          <button
            type="submit" disabled={loading}
            style={{ backgroundColor: "#7B6BA8", color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, marginTop: "4px", touchAction: "manipulation" }}
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "20px" }}>
          すでにアカウントをお持ちの方は{" "}
          <Link href="/admin/login" style={{ color: "#7B6BA8", fontWeight: 600 }}>ログイン</Link>
        </p>
      </div>
    </div>
  );
}
