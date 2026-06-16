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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerName, setProviderName] = useState("");
  const [providerId, setProviderId] = useState("");
  const [tab, setTab] = useState<"experiences" | "bookings">("experiences");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { router.push("/admin/login"); return; }

      const { data: provider } = await supabaseBrowser
        .from("providers").select("id, name").eq("auth_user_id", user.id).single();

      if (provider) {
        setProviderName(provider.name);
        setProviderId(provider.id);

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
      setLoading(false);
    };
    init();
  }, [router]);

  const handleDelete = async (expId: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？\n予約データも一緒に削除されます。`)) return;
    setDeleting(expId);
    await supabaseBrowser.from("bookings").delete().eq("experience_id", expId);
    await supabaseBrowser.from("experiences").delete().eq("id", expId);
    setExperiences(prev => prev.filter(e => e.id !== expId));
    setBookings(prev => prev.filter(b => b.experience_id !== expId));
    setDeleting(null);
  };

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/admin/login");
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
        <div style={{ maxWidth: "640px", margin: "0 auto", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px 16px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 2px" }}>ようこそ</p>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#1a1a1a", margin: 0 }}>{providerName || "提供者"}</h1>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          <Link href="/admin/experiences/new" style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "#7B6BA8", borderRadius: "14px", padding: "16px", textAlign: "center", cursor: "pointer", touchAction: "manipulation" }}>
              <p style={{ fontSize: "20px", margin: "0 0 4px" }}>＋</p>
              <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>体験を追加</p>
            </div>
          </Link>
          <Link href="/admin/profile" style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "16px", textAlign: "center", border: "1px solid #f3f4f6", cursor: "pointer", touchAction: "manipulation" }}>
              <p style={{ fontSize: "20px", margin: "0 0 4px" }}>👤</p>
              <p style={{ fontSize: "13px", fontWeight: "bold", color: "#1a1a1a", margin: 0 }}>プロフィール</p>
            </div>
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", marginBottom: "16px" }}>
          {[
            { key: "experiences", label: `体験一覧（${experiences.length}）` },
            { key: "bookings", label: `予約一覧（${bookings.length}）` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
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
              <p style={{ fontSize: "28px", marginBottom: "8px" }}>🌱</p>
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
              <p style={{ fontSize: "28px", marginBottom: "8px" }}>📋</p>
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
      </div>
    </div>
  );
}
