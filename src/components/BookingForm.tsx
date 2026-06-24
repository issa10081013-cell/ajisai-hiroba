"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

type Props = {
  experienceId: string;
  experienceTitle: string;
};

export default function BookingForm({ experienceId, experienceTitle }: Props) {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [form, setForm] = useState({
    parentName: "", parentEmail: "", parentPhone: "",
    childrenCount: 1, adultsCount: 1, message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(async ({ data: { user: u } }) => {
      if (u) {
        const name = u.user_metadata?.display_name ?? "";
        const email = u.email ?? "";
        setUser({ email, name });
        setForm(prev => ({ ...prev, parentName: name, parentEmail: email }));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // ログイン中なら本人確認用トークンを付ける（会員判定はサーバー側で行う）
    const { data: { session } } = await supabaseBrowser.auth.getSession();
    const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) authHeaders["Authorization"] = `Bearer ${session.access_token}`;

    // まず決済を試みる（提供者がConnect設定済みなら有料決済へ）
    const payRes = await fetch("/api/stripe/booking-checkout", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ experienceId, ...form }),
    });
    const payData = await payRes.json().catch(() => ({}));

    if (payRes.ok && payData?.url) {
      window.location.href = payData.url; // Stripe決済画面へ
      return;
    }

    // 提供者がまだ決済未設定、または無料(¥0) → 無料予約フローにフォールバック
    if (payData?.noPayment) {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ experienceId, ...form }),
      });
      setLoading(false);
      if (res.ok) setSubmitted(true);
      else setError(true);
      return;
    }

    setLoading(false);
    setError(true);
  };

  if (submitted) {
    return (
      <div style={{ background: "#F5F3FA", borderRadius: "20px", padding: "32px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
        <h3 style={{ fontWeight: "bold", color: "#1a1a1a", marginBottom: "8px" }}>予約を受け付けました！</h3>
        <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.7 }}>
          確認メールをお送りしました。<br />主催者からもご連絡が届きます。
        </p>
        <p style={{ marginTop: "4px", fontSize: "11px", color: "#9ca3af" }}>迷惑メールフォルダもご確認ください</p>
        <p style={{ marginTop: "12px", fontSize: "11px", color: "#9ca3af" }}>{experienceTitle}</p>
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f3f4f6", padding: "20px" }}>
      <h2 style={{ fontWeight: "bold", color: "#1a1a1a", marginBottom: "16px", fontSize: "15px" }}>予約する</h2>

      {/* ログイン状態表示 */}
      {user ? (
        <div style={{ background: "#F5F3FA", borderRadius: "12px", padding: "10px 14px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "12px", color: "#7B6BA8", fontWeight: 600, margin: 0 }}>✓ {user.email} でログイン中</p>
          <button
            onClick={() => supabaseBrowser.auth.signOut().then(() => setUser(null))}
            style={{ fontSize: "11px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
          >ログアウト</button>
        </div>
      ) : (
        <div style={{ background: "#FFF8F0", border: "1px solid #FED7AA", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "#92400E", margin: "0 0 8px", fontWeight: 600 }}>ログインすると名前・メールが自動入力されます</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href={`/login?from=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
              style={{ flex: 1, textAlign: "center", background: "#7B6BA8", color: "white", borderRadius: "8px", padding: "7px", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
              ログイン
            </Link>
            <Link href="/register"
              style={{ flex: 1, textAlign: "center", background: "white", color: "#7B6BA8", border: "1px solid #7B6BA8", borderRadius: "8px", padding: "7px", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
              新規登録
            </Link>
          </div>
        </div>
      )}

      {error && (
        <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px", background: "#fef2f2", padding: "8px", borderRadius: "8px" }}>
          送信に失敗しました。もう一度試してください。
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>お名前 *</label>
          <input type="text" required value={form.parentName}
            onChange={e => setForm({ ...form, parentName: e.target.value })}
            placeholder="山田 花子"
            style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: user ? "#F9F8FF" : "white" }} />
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>メールアドレス *</label>
          <input type="email" required value={form.parentEmail}
            onChange={e => setForm({ ...form, parentEmail: e.target.value })}
            placeholder="example@email.com"
            style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: user ? "#F9F8FF" : "white" }} />
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>電話番号</label>
          <input type="tel" value={form.parentPhone}
            onChange={e => setForm({ ...form, parentPhone: e.target.value })}
            placeholder="090-0000-0000"
            style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>大人の人数 *</label>
            <select value={form.adultsCount} onChange={e => setForm({ ...form, adultsCount: Number(e.target.value) })}
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none" }}>
              {[1,2,3].map(n => <option key={n} value={n}>{n}人</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>子どもの人数 *</label>
            <select value={form.childrenCount} onChange={e => setForm({ ...form, childrenCount: Number(e.target.value) })}
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none" }}>
              {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}人</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>メッセージ（任意）</label>
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
            rows={3} placeholder="アレルギーや不安なことがあれば"
            style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", resize: "none", boxSizing: "border-box" }} />
        </div>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "#6b7280", lineHeight: 1.6 }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: "2px", flexShrink: 0 }} />
          <span>
            <a href="/terms" target="_blank" style={{ color: "#7B6BA8", fontWeight: 600 }}>利用規約・キャンセルポリシー</a>を確認し、同意します
          </span>
        </label>
        <button type="submit" disabled={loading || !agreed}
          style={{ width: "100%", background: "#7B6BA8", color: "white", border: "none", borderRadius: "12px", padding: "13px", fontSize: "14px", fontWeight: "bold", cursor: (loading || !agreed) ? "not-allowed" : "pointer", opacity: (loading || !agreed) ? 0.6 : 1, touchAction: "manipulation" }}>
          {loading ? "送信中..." : "予約を申し込む"}
        </button>
        <p style={{ fontSize: "11px", textAlign: "center", color: "#9ca3af", margin: 0 }}>予約後、主催者からご連絡します</p>
      </form>
    </div>
  );
}
