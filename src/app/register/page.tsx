"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) { setError("パスワードが一致しません"); return; }
    if (form.password.length < 8) { setError("パスワードは8文字以上で設定してください"); return; }

    setLoading(true);

    const { error: signUpError } = await supabaseBrowser.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { display_name: form.name } },
    });

    if (signUpError) {
      setError(signUpError.message.includes("already registered")
        ? "このメールアドレスはすでに登録されています"
        : signUpError.message);
      setLoading(false);
      return;
    }

    // そのままログイン
    await supabaseBrowser.auth.signInWithPassword({ email: form.email, password: form.password });
    router.push("/");
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
          <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 4px" }}>会員登録</h1>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>あじさい体験ひろば</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "10px", marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#ef4444", textAlign: "center", margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>お名前 *</label>
            <input
              type="text" required value={form.name} onChange={e => f("name", e.target.value)}
              placeholder="山田 花子"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
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
          {/* 同意チェックボックス */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "14px", background: "#F9F8FF", borderRadius: "12px", marginTop: "4px" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={e => setAgreedTerms(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "#7B6BA8", flexShrink: 0, width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "12px", color: "#374151", lineHeight: 1.6 }}>
                <Link href="/terms" target="_blank" style={{ color: "#7B6BA8", fontWeight: 600 }}>利用規約</Link>
                ・
                <Link href="/tokusho" target="_blank" style={{ color: "#7B6BA8", fontWeight: 600 }}>特定商取引法に基づく表示</Link>
                に同意します
              </span>
            </label>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={agreedPrivacy}
                onChange={e => setAgreedPrivacy(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "#7B6BA8", flexShrink: 0, width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "12px", color: "#374151", lineHeight: 1.6 }}>
                <Link href="/privacy" target="_blank" style={{ color: "#7B6BA8", fontWeight: 600 }}>プライバシーポリシー</Link>
                に同意し、個人情報の取り扱いについて承諾します
              </span>
            </label>
          </div>

          <button
            type="submit" disabled={loading || !agreedTerms || !agreedPrivacy}
            style={{ backgroundColor: "#7B6BA8", color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: "bold", cursor: (loading || !agreedTerms || !agreedPrivacy) ? "not-allowed" : "pointer", opacity: (loading || !agreedTerms || !agreedPrivacy) ? 0.5 : 1, marginTop: "4px", touchAction: "manipulation" }}
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "20px" }}>
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" style={{ color: "#7B6BA8", fontWeight: 600 }}>ログイン</Link>
        </p>
        <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
          <Link href="/" style={{ color: "#9ca3af" }}>← 体験を見る（登録不要）</Link>
        </p>
      </div>
    </div>
  );
}
