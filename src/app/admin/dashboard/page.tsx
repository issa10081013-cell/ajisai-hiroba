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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerName, setProviderName] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { router.push("/admin/login"); return; }

      // 自分のproviderデータを取得
      const { data: provider } = await supabaseBrowser
        .from("providers")
        .select("id, name")
        .eq("auth_user_id", user.id)
        .single();

      if (provider) {
        setProviderName(provider.name);
        const { data: exps } = await supabaseBrowser
          .from("experiences")
          .select("id, title, date, time_start, capacity, current_bookings, category")
          .eq("provider_id", provider.id)
          .order("date", { ascending: true });
        setExperiences(exps ?? []);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/admin/login");
  };

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
            <span style={{ fontSize: "20px" }}>🌸</span>
            <span style={{ fontWeight: "bold", color: "#7B6BA8", fontSize: "14px" }}>管理画面</span>
          </div>
          <button onClick={handleLogout} style={{ fontSize: "12px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>
            ログアウト
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "12px", color: "#9ca3af" }}>ようこそ</p>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#1a1a1a" }}>{providerName || "提供者"}</h1>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          <Link href="/admin/experiences/new" style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "#7B6BA8", borderRadius: "16px", padding: "20px", textAlign: "center", cursor: "pointer" }}>
              <p style={{ fontSize: "24px", margin: "0 0 4px" }}>＋</p>
              <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>体験を追加する</p>
            </div>
          </Link>
          <Link href="/admin/profile" style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", textAlign: "center", border: "1px solid #f3f4f6", cursor: "pointer" }}>
              <p style={{ fontSize: "24px", margin: "0 0 4px" }}>👤</p>
              <p style={{ fontSize: "13px", fontWeight: "bold", color: "#1a1a1a", margin: 0 }}>プロフィール編集</p>
            </div>
          </Link>
        </div>

        {/* Experiences list */}
        <h2 style={{ fontSize: "14px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "12px" }}>
          登録中の体験 <span style={{ color: "#9ca3af", fontWeight: "normal" }}>{experiences.length}件</span>
        </h2>

        {experiences.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: "28px", marginBottom: "8px" }}>🌱</p>
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>まだ体験が登録されていません</p>
            <Link href="/admin/experiences/new">
              <button style={{ marginTop: "16px", backgroundColor: "#7B6BA8", color: "white", border: "none", borderRadius: "12px", padding: "10px 24px", fontSize: "13px", fontWeight: "bold", cursor: "pointer" }}>
                最初の体験を追加する
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {experiences.map((exp) => {
              const spotsLeft = exp.capacity - exp.current_bookings;
              const dateLabel = new Date(exp.date + "T00:00:00").toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });
              return (
                <div key={exp.id} style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 4px" }}>{exp.title}</p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{dateLabel} {exp.time_start}〜 ｜ 残り{spotsLeft}席</p>
                  </div>
                  <span style={{ fontSize: "11px", backgroundColor: "#E8E4F5", color: "#7B6BA8", padding: "2px 8px", borderRadius: "999px" }}>
                    {exp.category}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
