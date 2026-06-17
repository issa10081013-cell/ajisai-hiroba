"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

type Experience = {
  id: string;
  title: string;
  date: string;
  time_start: string;
  capacity: number;
  current_bookings: number;
  category: string;
};

type Booking = {
  id: string;
  experience_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  children_count: number;
  adults_count: number;
  message: string;
  created_at: string;
  experience_title?: string;
};

type Report = {
  id: string;
  reporter_id: string;
  target_type: "post" | "comment" | "review";
  target_id: string;
  reason: string;
  created_at: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerName, setProviderName] = useState("");
  const [providerId, setProviderId] = useState("");
  const [tab, setTab] = useState<"experiences" | "bookings" | "reports">("experiences");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [verified, setVerified] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState<string | null>(null);
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [userId, setUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { router.push("/admin/login"); return; }

      setUserId(user.id);
      setIsAdmin(user.email === "issa10081013@gmail.com");

      const { data: provider } = await supabaseBrowser
        .from("providers").select("id, name, verified, verified_status").eq("auth_user_id", user.id).single();

      if (provider) {
        setProviderName(provider.name);
        setProviderId(provider.id);
        setVerified(provider.verified ?? false);
        setVerifiedStatus(provider.verified_status ?? null);

        const { data: exps } = await supabaseBrowser
          .from("experiences")
          .select("id, title, date, time_start, capacity, current_bookings, category")
          .eq("provider_id", provider.id)
          .order("date", { ascending: true });

        const expList = exps ?? [];
        setExperiences(expList);

        if (expList.length > 0) {
          const expIds = expList.map(e => e.id);
          const { data: bks } = await supabaseBrowser
            .from("bookings")
            .select("*")
            .in("experience_id", expIds)
            .order("created_at", { ascending: false });

          const bksWithTitle = (bks ?? []).map(b => ({
            ...b,
            experience_title: expList.find(e => e.id === b.experience_id)?.title ?? "",
          }));
          setBookings(bksWithTitle);
        }
      }
      // 通報一覧（管理者APIで取得）
      const res = await fetch("/api/admin/reports");
      if (res.ok) setReports(await res.json());

      setLoading(false);
    };
    init();
  }, [router]);

  const handleDelete = async (expId: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？\n予約データも一緒に削除されます。`)) return;
    setDeleting(expId);
    await supabaseBrowser.from("bookings").delete().eq("experience_id", expId);
    const { error } = await supabaseBrowser.from("experiences").delete().eq("id", expId);
    if (error) {
      alert("削除に失敗しました: " + error.message);
      setDeleting(null);
      return;
    }
    setExperiences(prev => prev.filter(e => e.id !== expId));
    setBookings(prev => prev.filter(b => b.experience_id !== expId));
    setDeleting(null);
  };

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/admin/login");
  };

  const handleRequestVerification = async () => {
    setRequestingVerification(true);
    await fetch("/api/request-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId }),
    });
    setVerifiedStatus("pending");
    setRequestingVerification(false);
  };

  const totalParticipants = bookings.reduce((s, b) => s + b.children_count + b.adults_count, 0);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F5F3FA" }}>
      <p style={{ color: "#9ca3af" }}>読み込み中...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F3FA" }}>
      {/* Header */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #f3f4f6", padding: "0 16px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="https://dvqewysazrkhlvvlvuww.supabase.co/storage/v1/object/public/images/logo/ajisai-logo-1781517450336.png"
              alt="ロゴ" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
            <span style={{ fontWeight: "bold", color: "#7B6BA8", fontSize: "14px" }}>管理画面</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/admin/profile" style={{ fontSize: "12px", color: "#7B6BA8", textDecoration: "none" }}>プロフィール</Link>
            <button onClick={handleLogout} style={{ fontSize: "12px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", touchAction: "manipulation" }}>
              ログアウト
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "20px 12px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 2px" }}>ようこそ</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#1a1a1a", margin: 0 }}>{providerName || "提供者"}</h1>
            {verified && (
              <span style={{ background: "linear-gradient(135deg, #7B6BA8, #3d3566)", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>
                ✓ 公式
              </span>
            )}
          </div>
          {/* 公式申請ボタン */}
          {!verified && (
            <div style={{ marginTop: "10px" }}>
              {verifiedStatus === "pending" ? (
                <span style={{ fontSize: "12px", color: "#9ca3af", background: "#f3f4f6", padding: "6px 14px", borderRadius: "20px" }}>
                  申請中…審査をお待ちください
                </span>
              ) : verifiedStatus === "rejected" ? (
                <span style={{ fontSize: "12px", color: "#ef4444", background: "#fef2f2", padding: "6px 14px", borderRadius: "20px" }}>
                  今回は公式認定されませんでした
                </span>
              ) : (
                <button
                  onClick={handleRequestVerification}
                  disabled={requestingVerification}
                  style={{ fontSize: "12px", color: "#7B6BA8", background: "#F9F8FF", border: "1px solid #d8d0ef", padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: 600 }}
                >
                  {requestingVerification ? "申請中..." : "✓ 公式マークを申請する"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "体験数", value: experiences.length },
            { label: "予約数", value: bookings.length },
            { label: "累計参加者", value: `${totalParticipants}人` },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: "white", borderRadius: "14px", padding: "14px", textAlign: "center" }}>
              <p style={{ fontSize: "20px", fontWeight: "bold", color: "#7B6BA8", margin: "0 0 2px" }}>{stat.value}</p>
              <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr 1fr 1fr" : "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          <Link href="/admin/experiences/new" style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "#7B6BA8", borderRadius: "14px", padding: "16px", textAlign: "center", cursor: "pointer", touchAction: "manipulation" }}>
              <p style={{ fontSize: "20px", margin: "0 0 4px" }}>＋</p>
              <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>体験を追加</p>
            </div>
          </Link>
          <Link href="/admin/profile" style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "16px", textAlign: "center", border: "1px solid #f3f4f6", cursor: "pointer", touchAction: "manipulation" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" style={{margin:"0 auto 4px"}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              <p style={{ fontSize: "13px", fontWeight: "bold", color: "#1a1a1a", margin: 0 }}>プロフィール</p>
            </div>
          </Link>
          {isAdmin && (
            <Link href="/admin/verify" style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "16px", textAlign: "center", border: "1.5px solid #d8d0ef", cursor: "pointer", touchAction: "manipulation" }}>
                <p style={{ fontSize: "20px", margin: "0 0 4px" }}>✓</p>
                <p style={{ fontSize: "13px", fontWeight: "bold", color: "#7B6BA8", margin: 0 }}>公式審査</p>
              </div>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", marginBottom: "16px" }}>
          {[
            { key: "experiences", label: `体験一覧（${experiences.length}）` },
            { key: "bookings", label: `予約一覧（${bookings.length}）` },
            { key: "reports", label: `通報（${reports.length}）` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as "experiences" | "bookings" | "reports")}
              style={{
                padding: "10px 16px", fontSize: "13px", fontWeight: tab === t.key ? 700 : 500,
                color: tab === t.key ? "#7B6BA8" : "#9ca3af",
                background: "none", border: "none",
                borderBottom: tab === t.key ? "2px solid #7B6BA8" : "2px solid transparent",
                marginBottom: "-2px", cursor: "pointer", touchAction: "manipulation",
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Tab: 体験一覧 */}
        {tab === "experiences" && (
          experiences.length === 0 ? (
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
              <div style={{ marginBottom: "8px", display:"flex", justifyContent:"center" }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round"><path d="M12 22V12"/><path d="M12 12C12 12 7 11 7 6c3 0 5 2.5 5 6z"/><path d="M12 12C12 12 17 11 17 6c-3 0-5 2.5-5 6z"/></svg></div>
              <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>まだ体験が登録されていません</p>
              <Link href="/admin/experiences/new">
                <button style={{ backgroundColor: "#7B6BA8", color: "white", border: "none", borderRadius: "12px", padding: "10px 24px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", touchAction: "manipulation" }}>
                  最初の体験を追加する
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {experiences.map(exp => {
                const spotsLeft = exp.capacity - exp.current_bookings;
                const dateLabel = new Date(exp.date + "T00:00:00").toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });
                const expBookings = bookings.filter(b => b.experience_id === exp.id);
                return (
                  <div key={exp.id} style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "13px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 4px" }}>{exp.title}</p>
                        <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                          {dateLabel} {exp.time_start}〜 ｜ 残り{spotsLeft}席 ｜ 予約{expBookings.length}件
                        </p>
                      </div>
                      <span style={{ fontSize: "10px", backgroundColor: "#E8E4F5", color: "#7B6BA8", padding: "2px 8px", borderRadius: "999px", flexShrink: 0 }}>
                        {exp.category}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link href={`/admin/experiences/${exp.id}/edit`} style={{ textDecoration: "none", flex: 1 }}>
                        <button style={{ width: "100%", padding: "8px", borderRadius: "10px", border: "1.5px solid #7B6BA8", background: "white", color: "#7B6BA8", fontSize: "12px", fontWeight: 600, cursor: "pointer", touchAction: "manipulation" }}>
                          編集
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(exp.id, exp.title)}
                        disabled={deleting === exp.id}
                        style={{ flex: 1, padding: "8px", borderRadius: "10px", border: "1.5px solid #fecaca", background: "white", color: "#ef4444", fontSize: "12px", fontWeight: 600, cursor: "pointer", touchAction: "manipulation", opacity: deleting === exp.id ? 0.5 : 1 }}
                      >
                        {deleting === exp.id ? "削除中..." : "削除"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Tab: 予約一覧 */}
        {tab === "bookings" && (
          bookings.length === 0 ? (
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
              <div style={{ marginBottom: "8px", display:"flex", justifyContent:"center" }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></svg></div>
              <p style={{ fontSize: "13px", color: "#9ca3af" }}>まだ予約がありません</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {bookings.map(b => (
                <div key={b.id} style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <p style={{ fontSize: "11px", color: "#7B6BA8", fontWeight: 600, margin: 0 }}>{b.experience_title}</p>
                    <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
                      {new Date(b.created_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 6px" }}>{b.parent_name}</p>
                  <div style={{ display: "flex", gap: "16px", marginBottom: "6px" }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>大人{b.adults_count}人・子ども{b.children_count}人</p>
                  </div>
                  <a href={`mailto:${b.parent_email}`} style={{ fontSize: "12px", color: "#7B6BA8", textDecoration: "none", display: "block" }}>{b.parent_email}</a>
                  {b.parent_phone && <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>{b.parent_phone}</p>}
                  {b.message && (
                    <div style={{ backgroundColor: "#F7F6FD", borderRadius: "8px", padding: "8px", marginTop: "8px" }}>
                      <p style={{ fontSize: "12px", color: "#374151", margin: 0 }}>{b.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
        {/* Tab: 通報一覧 */}
        {tab === "reports" && (
          reports.length === 0 ? (
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
              <div style={{ marginBottom: "8px", display:"flex", justifyContent:"center" }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/></svg></div>
              <p style={{ fontSize: "13px", color: "#9ca3af" }}>通報はありません</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reports.map(r => {
                const typeLabel = { post: "掲示板投稿", comment: "コメント", review: "口コミ" }[r.target_type];
                const typeLink = r.target_type === "post" ? `/board/${r.target_id}` : r.target_type === "comment" ? `/board` : null;
                return (
                  <div key={r.id} style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", border: "1px solid #fee2e2" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", background: "#FEF2F2", color: "#ef4444", padding: "3px 10px", borderRadius: "20px", fontWeight: 700 }}>
                        ⚠️ {typeLabel}
                      </span>
                      <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                        {new Date(r.created_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>理由：{r.reason}</p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 8px", wordBreak: "break-all" }}>対象ID：{r.target_id}</p>
                    {typeLink && (
                      <Link href={typeLink} style={{ fontSize: "12px", color: "#7B6BA8", fontWeight: 600, textDecoration: "none" }}>
                        対象を確認する →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
