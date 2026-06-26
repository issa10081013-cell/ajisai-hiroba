"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useIsNativeApp } from "@/components/HideOnNativeApp";

type Booking = {
  id: string;
  experience_id: string;
  created_at: string;
  adults_count: number;
  children_count: number;
  experience_title?: string;
  experience_date?: string;
};

type Review = {
  id: string;
  experience_id: string;
  rating: number;
  comment: string;
  date: string;
};

type Post = {
  id: string;
  title: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

type Membership = { status: string; current_period_end: string | null };

function MyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const membershipResult = searchParams.get("membership");
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<"bookings" | "reviews" | "posts">("bookings");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [canceling, setCanceling] = useState<string | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [joiningMembership, setJoiningMembership] = useState(false);
  const isNative = useIsNativeApp(); // App Store 3.1.1対策：iOS/Androアプリでは会員購入導線を隠す
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelingMembership, setCancelingMembership] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabaseBrowser.auth.getUser();
      if (!u) { router.push("/login?from=/mypage"); return; }

      setUser({ id: u.id, name: u.user_metadata?.display_name ?? u.email?.split("@")[0] ?? "匿名", email: u.email ?? "" });
      if (u.user_metadata?.avatar_url) setAvatarUrl(u.user_metadata.avatar_url);

      const { data: mem } = await supabaseBrowser
        .from("memberships").select("status, current_period_end").eq("user_id", u.id).single();
      setMembership(mem ?? { status: "inactive", current_period_end: null });

      // 予約履歴（メールで照合）
      const { data: bks } = await supabaseBrowser
        .from("bookings").select("*").eq("parent_email", u.email).order("created_at", { ascending: false });

      if (bks && bks.length > 0) {
        const expIds = [...new Set(bks.map((b: Booking) => b.experience_id))];
        const { data: exps } = await supabaseBrowser.from("experiences").select("id, title, date").in("id", expIds);
        setBookings(bks.map((b: Booking) => ({
          ...b,
          experience_title: exps?.find((e: { id: string; title: string; date: string }) => e.id === b.experience_id)?.title,
          experience_date: exps?.find((e: { id: string; title: string; date: string }) => e.id === b.experience_id)?.date,
        })));
      }

      // 口コミ
      const { data: rvs } = await supabaseBrowser
        .from("reviews").select("id, experience_id, rating, comment, date").eq("user_id", u.id).order("created_at", { ascending: false });
      setReviews(rvs ?? []);

      // 掲示板投稿
      const { data: pts } = await supabaseBrowser
        .from("posts").select("id, title, category, likes_count, comments_count, created_at").eq("user_id", u.id).order("created_at", { ascending: false });
      setPosts(pts ?? []);

      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/");
  };

  const handleCancel = async (bookingId: string) => {
    if (!user) return;
    if (!confirm("この予約をキャンセルしますか？")) return;
    setCanceling(bookingId);
    const res = await fetch("/api/cancel-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, userEmail: user.email }),
    });
    if (res.ok) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } else {
      alert("キャンセルに失敗しました");
    }
    setCanceling(null);
  };

  const handleJoinMembership = async () => {
    if (!user) return;
    setJoiningMembership(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("エラーが発生しました: " + (data.error ?? "不明なエラー"));
        setJoiningMembership(false);
      }
    } catch (err) {
      alert("通信エラーが発生しました: " + (err instanceof Error ? err.message : "不明なエラー"));
      setJoiningMembership(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!user) return;
    setCancelingMembership(true);
    try {
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.ok) {
        setMembership(prev => prev ? { ...prev, status: "canceling" } : prev);
        setShowCancelConfirm(false);
      } else {
        alert("エラーが発生しました: " + (data.error ?? "不明なエラー"));
      }
    } catch (err) {
      alert("通信エラーが発生しました: " + (err instanceof Error ? err.message : "不明なエラー"));
    } finally {
      setCancelingMembership(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabaseBrowser.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) { alert("アップロードに失敗しました"); setUploading(false); return; }

    const { data } = supabaseBrowser.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;

    await supabaseBrowser.auth.updateUser({ data: { avatar_url: url } });
    setAvatarUrl(url);
    setUploading(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9ca3af", fontSize: "13px" }}>読み込み中...</p>
    </div>
  );



  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 0 80px" }}>

      {/* 会員登録結果バナー */}
      {membershipResult === "success" && (
        <div style={{ background: "#d1fae5", color: "#065f46", padding: "12px 16px", fontSize: "13px", fontWeight: 600, textAlign: "center" }}>
          ✓ あじさい会員登録が完了しました！
        </div>
      )}
      {membershipResult === "canceled" && (
        <div style={{ background: "#fef3c7", color: "#92400e", padding: "12px 16px", fontSize: "13px", fontWeight: 600, textAlign: "center" }}>
          会員登録をキャンセルしました
        </div>
      )}

      {/* プロフィールヘッダー */}
      <div style={{ background: "linear-gradient(135deg, #2d5a3f, #4A7A5C)", padding: "32px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", cursor: "pointer", touchAction: "manipulation", padding: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="アバター" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              )}
              {uploading && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                  <span style={{ fontSize: "10px", color: "white", fontWeight: 700 }}>...</span>
                </div>
              )}
            </button>
            <div style={{ position: "absolute", bottom: 0, right: 0, background: "white", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", pointerEvents: "none" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7B6BA8" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: "18px", color: "white", margin: "0 0 2px" }}>{user?.name}</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", margin: 0 }}>{user?.email}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { label: "予約", value: bookings.length },
            { label: "口コミ", value: reviews.length },
            { label: "投稿", value: posts.length },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 800, fontSize: "20px", color: "white", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 会員ステータス */}
      {(membership?.status === "active" || membership?.status === "canceling") ? (
        <div style={{ margin: "16px", background: membership.status === "canceling" ? "linear-gradient(135deg, #9ca3af, #6b7280)" : "linear-gradient(135deg, #2d5a3f, #4A7A5C)", borderRadius: "20px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.2)", color: "white", padding: "3px 10px", borderRadius: "20px", fontWeight: 700 }}>
                {membership.status === "canceling" ? "解約予定" : "会員中"}
              </span>
              <p style={{ color: "white", fontWeight: 800, fontSize: "16px", margin: "6px 0 0" }}>あじさい会員</p>
            </div>
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">{[0,60,120,180,240,300].map((a,i)=>{const r=a*Math.PI/180;return<circle key={i} cx={24+10*Math.cos(r)} cy={24+10*Math.sin(r)} r="7" fill="rgba(255,255,255,0.7)"/>})}<circle cx="24" cy="24" r="6" fill="rgba(255,255,255,0.9)"/></svg>
          </div>
          {membership.status === "canceling" ? (
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", margin: 0 }}>
              解約手続き済みです。期間終了まで会員特典をご利用いただけます。
            </p>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", margin: 0 }}>
              月額 ¥1,000 · すべての体験が会員価格で参加できます
            </p>
          )}
          {membership.current_period_end && (
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", margin: "6px 0 0" }}>
              {membership.status === "canceling" ? "特典利用可能期間：" : "次回更新："}
              {new Date(membership.current_period_end).toLocaleDateString("ja-JP")} まで
            </p>
          )}

          {/* 解約ボタン（active時のみ） */}
          {membership.status === "active" && !showCancelConfirm && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              style={{ marginTop: "14px", background: "none", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px", padding: "7px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)", cursor: "pointer", touchAction: "manipulation" }}
            >
              解約する
            </button>
          )}

          {/* 解約確認 */}
          {showCancelConfirm && (
            <div style={{ marginTop: "14px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "14px" }}>
              <p style={{ color: "white", fontSize: "12px", margin: "0 0 12px", lineHeight: 1.6 }}>
                解約すると今月末で会員特典が終了します。本当に解約しますか？
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleCancelMembership}
                  disabled={cancelingMembership}
                  style={{ flex: 1, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "10px", padding: "8px", fontSize: "12px", color: "white", fontWeight: 700, cursor: cancelingMembership ? "not-allowed" : "pointer", opacity: cancelingMembership ? 0.5 : 1, touchAction: "manipulation" }}
                >
                  {cancelingMembership ? "処理中..." : "解約する"}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  style={{ flex: 1, background: "white", border: "none", borderRadius: "10px", padding: "8px", fontSize: "12px", color: "#2d5a3f", fontWeight: 700, cursor: "pointer", touchAction: "manipulation" }}
                >
                  やめる
                </button>
              </div>
            </div>
          )}
        </div>
      ) : isNative ? null : (
        <div style={{ margin: "16px", background: "white", borderRadius: "20px", padding: "20px", border: "2px dashed #b0d4bc" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <span style={{ fontSize: "10px", background: "#f3f4f6", color: "#9ca3af", padding: "3px 10px", borderRadius: "20px", fontWeight: 700 }}>未加入</span>
              <p style={{ color: "#1a1a1a", fontWeight: 800, fontSize: "16px", margin: "6px 0 0" }}>あじさい会員になる</p>
            </div>
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">{[0,60,120,180,240,300].map((a,i)=>{const r=a*Math.PI/180;return<circle key={i} cx={24+10*Math.cos(r)} cy={24+10*Math.sin(r)} r="7" fill="#b0d4bc"/>})}<circle cx="24" cy="24" r="6" fill="#4A7A5C"/></svg>
          </div>
          <ul style={{ margin: "0 0 16px", padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {["すべての体験が会員割引価格で参加できる", "保護者コミュニティへの優先参加", "新着体験の先行案内メール"].map(b => (
              <li key={b} style={{ fontSize: "12px", color: "#374151" }}>{b}</li>
            ))}
          </ul>
          <button
            onClick={handleJoinMembership}
            disabled={joiningMembership}
            style={{ width: "100%", background: joiningMembership ? "#9ca3af" : "linear-gradient(135deg, #2d5a3f, #4A7A5C)", color: "white", border: "none", borderRadius: "14px", padding: "13px", fontSize: "14px", fontWeight: 700, cursor: joiningMembership ? "not-allowed" : "pointer", touchAction: "manipulation" }}
          >
            {joiningMembership ? "処理中..." : "月額 ¥1,000 で会員になる"}
          </button>
        </div>
      )}

      {/* タブ */}
      <div style={{ background: "white", display: "flex", borderBottom: "2px solid #f3f4f6" }}>
        {([
          { key: "bookings", label: `予約履歴（${bookings.length}）` },
          { key: "reviews", label: `口コミ（${reviews.length}）` },
          { key: "posts", label: `投稿（${posts.length}）` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: "12px 4px", fontSize: "12px", fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? "#7B6BA8" : "#9ca3af", background: "none", border: "none", borderBottom: tab === t.key ? "2px solid #7B6BA8" : "2px solid transparent", marginBottom: "-2px", cursor: "pointer", touchAction: "manipulation" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px" }}>

        {/* 予約履歴 */}
        {tab === "bookings" && (
          bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="14" x2="10" y2="16"/><line x1="10" y1="16" x2="14" y2="13"/></svg></div>
              <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>まだ予約がありません</p>
              <Link href="/experiences" style={{ background: "#4A7A5C", color: "white", borderRadius: "20px", padding: "10px 24px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                体験を探す
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {bookings.map(b => {
                const dateStr = b.experience_date
                  ? new Date(b.experience_date + "T00:00:00").toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })
                  : "";
                const today = new Date().toISOString().slice(0, 10);
                const isFuture = !b.experience_date || b.experience_date >= today;
                return (
                  <div key={b.id} style={{ background: "white", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
                    <Link href={`/experiences/${b.experience_id}`} style={{ textDecoration: "none", display: "block", marginBottom: "10px" }}>
                      <p style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "14px", margin: "0 0 6px" }}>{b.experience_title ?? "体験"}</p>
                      <div style={{ display: "flex", gap: "12px" }}>
                        {dateStr && (
                          <span style={{ fontSize: "11px", color: isFuture ? "#7B6BA8" : "#9ca3af", fontWeight: 600 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{display:"inline",marginRight:"3px",verticalAlign:"middle"}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>{dateStr}
                          </span>
                        )}
                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>大人{b.adults_count}・子ども{b.children_count}</span>
                      </div>
                      <p style={{ fontSize: "10px", color: "#d1d5db", margin: "4px 0 0", textAlign: "right" }}>
                        {new Date(b.created_at).toLocaleDateString("ja-JP")}予約
                      </p>
                    </Link>
                    {isFuture && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={canceling === b.id}
                        style={{ width: "100%", padding: "8px", borderRadius: "10px", border: "1.5px solid #fecaca", background: "white", color: "#ef4444", fontSize: "12px", fontWeight: 600, cursor: "pointer", touchAction: "manipulation", opacity: canceling === b.id ? 0.5 : 1 }}
                      >
                        {canceling === b.id ? "キャンセル中..." : "予約をキャンセルする"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* 口コミ */}
        {tab === "reviews" && (
          reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
              <p style={{ fontSize: "13px", color: "#9ca3af" }}>まだ口コミを書いていません</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reviews.map(r => (
                <Link key={r.id} href={`/experiences/${r.experience_id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "white", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ display: "flex", gap: "1px" }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ fontSize: "14px", color: s <= r.rating ? "#f59e0b" : "#e5e7eb" }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: "11px", color: "#9ca3af" }}>{r.date}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, margin: 0 }}>{r.comment}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* 掲示板投稿 */}
        {tab === "posts" && (
          posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
              <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>まだ投稿がありません</p>
              <Link href="/board" style={{ background: "#4A7A5C", color: "white", borderRadius: "20px", padding: "10px 24px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                掲示板を見る
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {posts.map(p => (
                <Link key={p.id} href={`/board/${p.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "white", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: "10px", background: "#E8E4F5", color: "#7B6BA8", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }}>{p.category}</span>
                    <p style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "14px", margin: "6px 0 8px" }}>{p.title}</p>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ fontSize: "11px", color: "#9ca3af", display:"flex", alignItems:"center", gap:"3px" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>{p.likes_count}</span>
                      <span style={{ fontSize: "11px", color: "#9ca3af", display:"flex", alignItems:"center", gap:"3px" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>{p.comments_count}</span>
                      <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>
                        {new Date(p.created_at).toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* ログアウト */}
        <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={handleLogout}
            style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e5e7eb", background: "white", color: "#9ca3af", fontSize: "13px", fontWeight: 600, cursor: "pointer", touchAction: "manipulation" }}>
            ログアウト
          </button>
        </div>

        {/* 法律リンク */}
        <div style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
          <Link href="/tokusho" style={{ fontSize: "11px", color: "#9ca3af", textDecoration: "none" }}>特定商取引法に基づく表示</Link>
          <Link href="/terms" style={{ fontSize: "11px", color: "#9ca3af", textDecoration: "none" }}>利用規約</Link>
          <Link href="/privacy" style={{ fontSize: "11px", color: "#9ca3af", textDecoration: "none" }}>プライバシーポリシー</Link>
        </div>
      </div>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#9ca3af", fontSize: "13px" }}>読み込み中...</p>
      </div>
    }>
      <MyPageContent />
    </Suspense>
  );
}
