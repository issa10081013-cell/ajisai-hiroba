"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", phone: "" });
  const [profile, setProfile] = useState({
    parentAgeRange: "",
    childrenCount: "",
    area: "",
    interests: [] as string[],
  });
  const [isProvider, setIsProvider] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const AREAS = ["福岡市東区", "福岡市博多区", "福岡市中央区", "福岡市南区", "福岡市西区", "福岡市城南区", "福岡市早良区", "北九州市", "福岡市外・その他"];
  const INTERESTS = ["農業・自然", "料理・食育", "ものづくり", "学習・科学", "アート・音楽", "スポーツ・アウトドア"];

  const toggleInterest = (v: string) =>
    setProfile(p => ({ ...p, interests: p.interests.includes(v) ? p.interests.filter(i => i !== v) : [...p.interests, v] }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) { setError("パスワードが一致しません"); return; }
    if (form.password.length < 8) { setError("パスワードは8文字以上で設定してください"); return; }
    if (isProvider && !form.phone) { setError("主催者登録には電話番号が必要です"); return; }

    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabaseBrowser.auth.signUp({
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

    if (signUpData.user) {
      // プロフィール保存（サーバー側でservice role経由・RLSに依存しない）
      await fetch("/api/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: signUpData.user.id,
          displayName: form.name,
          parentAgeRange: profile.parentAgeRange,
          childrenCount: profile.childrenCount,
          area: profile.area,
          interests: profile.interests,
        }),
      });

      // 主催者として登録する場合はprovidersテーブルにも追加
      if (isProvider) {
        await fetch("/api/become-provider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: signUpData.user.id, name: form.name, phone: form.phone }),
        });
      }
    }

    await supabaseBrowser.auth.signInWithPassword({ email: form.email, password: form.password });
    router.push(isProvider ? "/admin/dashboard" : "/");
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

        {/* 登録タイプ選択 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setIsProvider(false)}
            style={{ flex: 1, padding: "10px", borderRadius: "12px", border: `2px solid ${!isProvider ? "#7B6BA8" : "#e5e7eb"}`, background: !isProvider ? "#F9F8FF" : "white", color: !isProvider ? "#7B6BA8" : "#9ca3af", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            参加者として登録
          </button>
          <button
            type="button"
            onClick={() => setIsProvider(true)}
            style={{ flex: 1, padding: "10px", borderRadius: "12px", border: `2px solid ${isProvider ? "#7B6BA8" : "#e5e7eb"}`, background: isProvider ? "#F9F8FF" : "white", color: isProvider ? "#7B6BA8" : "#9ca3af", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            体験を開催する
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "10px", marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#ef4444", textAlign: "center", margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              {isProvider ? "名前・屋号 *" : "お名前 *"}
            </label>
            <input
              type="text" required value={form.name} onChange={e => f("name", e.target.value)}
              placeholder={isProvider ? "例：田中農園 田中さん" : "山田 花子"}
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {isProvider && (
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>電話番号 *</label>
              <input
                type="tel" required value={form.phone} onChange={e => f("phone", e.target.value)}
                placeholder="090-0000-0000"
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
              <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>本人確認・緊急連絡用。外部公開されません。</p>
            </div>
          )}

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

          {/* プロフィール情報（任意） */}
          <div style={{ background: "#F5F9F6", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#4A7A5C", margin: 0 }}>あなたについて教えてください（任意）</p>

            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>保護者の年代</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["20代", "30代", "40代", "50代以上"].map(v => (
                  <button key={v} type="button" onClick={() => setProfile(p => ({ ...p, parentAgeRange: v }))}
                    style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "1.5px solid", borderColor: profile.parentAgeRange === v ? "#4A7A5C" : "#e5e7eb", background: profile.parentAgeRange === v ? "#4A7A5C" : "white", color: profile.parentAgeRange === v ? "white" : "#6b7280" }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>お子さんの人数</label>
              <input type="number" min="0" max="10" value={profile.childrenCount}
                onChange={e => setProfile(p => ({ ...p, childrenCount: e.target.value }))}
                placeholder="例：2"
                style={{ width: "80px", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "8px 12px", fontSize: "14px", outline: "none" }} />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>お住まいのエリア</label>
              <select value={profile.area} onChange={e => setProfile(p => ({ ...p, area: e.target.value }))}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", outline: "none", background: "white", boxSizing: "border-box" }}>
                <option value="">選択してください</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>興味のある体験（複数選択可）</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {INTERESTS.map(v => (
                  <button key={v} type="button" onClick={() => toggleInterest(v)}
                    style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, cursor: "pointer", border: "1.5px solid", borderColor: profile.interests.includes(v) ? "#7B6BA8" : "#e5e7eb", background: profile.interests.includes(v) ? "#7B6BA8" : "white", color: profile.interests.includes(v) ? "white" : "#6b7280" }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 同意チェックボックス */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "14px", background: "#F9F8FF", borderRadius: "12px", marginTop: "4px" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "#7B6BA8", flexShrink: 0, width: "16px", height: "16px" }} />
              <span style={{ fontSize: "12px", color: "#374151", lineHeight: 1.6 }}>
                <Link href="/terms" target="_blank" style={{ color: "#7B6BA8", fontWeight: 600 }}>利用規約</Link>・
                <Link href="/tokusho" target="_blank" style={{ color: "#7B6BA8", fontWeight: 600 }}>特定商取引法に基づく表示</Link>に同意します
              </span>
            </label>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" checked={agreedPrivacy} onChange={e => setAgreedPrivacy(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "#7B6BA8", flexShrink: 0, width: "16px", height: "16px" }} />
              <span style={{ fontSize: "12px", color: "#374151", lineHeight: 1.6 }}>
                <Link href="/privacy" target="_blank" style={{ color: "#7B6BA8", fontWeight: 600 }}>プライバシーポリシー</Link>に同意し、個人情報の取り扱いについて承諾します
              </span>
            </label>
          </div>

          <button
            type="submit" disabled={loading || !agreedTerms || !agreedPrivacy}
            style={{ backgroundColor: "#7B6BA8", color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: "bold", cursor: (loading || !agreedTerms || !agreedPrivacy) ? "not-allowed" : "pointer", opacity: (loading || !agreedTerms || !agreedPrivacy) ? 0.5 : 1, marginTop: "4px", touchAction: "manipulation" }}
          >
            {loading ? "登録中..." : isProvider ? "主催者として登録する" : "登録する"}
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
