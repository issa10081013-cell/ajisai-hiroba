"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const CATEGORIES = ["農業体験", "料理教室", "学習体験", "ものづくり", "自然体験", "その他"];

export default function NewExperiencePage() {
  const router = useRouter();
  const [providerId, setProviderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", date: "", timeStart: "", timeEnd: "",
    location: "", priceMember: "", priceRegular: "", capacity: "10",
    category: "農業体験", tags: "",
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { router.push("/admin/login"); return; }
      const { data: provider } = await supabaseBrowser
        .from("providers").select("id").eq("auth_user_id", user.id).single();
      if (provider) setProviderId(provider.id);
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerId) return;
    setLoading(true);

    const tags = form.tags.split("　").concat(form.tags.split(" ")).join(",").split(",").map(t => t.trim()).filter(Boolean);

    const { error } = await supabaseBrowser.from("experiences").insert({
      provider_id: providerId,
      title: form.title,
      description: form.description,
      date: form.date,
      time_start: form.timeStart,
      time_end: form.timeEnd,
      location: form.location,
      price_member: Number(form.priceMember) || 0,
      price_regular: Number(form.priceRegular) || 0,
      capacity: Number(form.capacity),
      current_bookings: 0,
      category: form.category,
      tags,
    });

    setLoading(false);
    if (error) { alert("エラー: " + error.message); return; }
    router.push("/admin/dashboard");
  };

  const f = (key: keyof typeof form, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F3FA" }}>
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #f3f4f6", padding: "0 16px" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", height: "56px", display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#7B6BA8", cursor: "pointer", fontSize: "14px" }}>← 戻る</button>
          <span style={{ fontWeight: "bold", color: "#1a1a1a", fontSize: "14px" }}>体験を追加する</span>
        </div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 16px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Title */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>体験タイトル *</label>
            <input required value={form.title} onChange={e => f("title", e.target.value)}
              placeholder="例：糸島の夏野菜収穫体験"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Category */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>カテゴリ *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => f("category", cat)}
                  style={{ padding: "6px 14px", borderRadius: "999px", border: "1px solid", fontSize: "12px", cursor: "pointer", fontWeight: form.category === cat ? "bold" : "normal", backgroundColor: form.category === cat ? "#7B6BA8" : "white", color: form.category === cat ? "white" : "#6b7280", borderColor: form.category === cat ? "#7B6BA8" : "#e5e7eb" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>開催日 *</label>
              <input type="date" required value={form.date} onChange={e => f("date", e.target.value)}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>開始時間 *</label>
                <input type="time" required value={form.timeStart} onChange={e => f("timeStart", e.target.value)}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>終了時間 *</label>
                <input type="time" required value={form.timeEnd} onChange={e => f("timeEnd", e.target.value)}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>場所 *</label>
            <input required value={form.location} onChange={e => f("location", e.target.value)}
              placeholder="例：福岡県糸島市（詳細は予約後お知らせ）"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Price & Capacity */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>会員価格（¥）</label>
                <input type="number" min="0" value={form.priceMember} onChange={e => f("priceMember", e.target.value)}
                  placeholder="0（無料の場合）"
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>一般価格（¥）</label>
                <input type="number" min="0" value={form.priceRegular} onChange={e => f("priceRegular", e.target.value)}
                  placeholder="0"
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>定員（人）</label>
              <input type="number" min="1" value={form.capacity} onChange={e => f("capacity", e.target.value)}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Description */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>体験の説明 *</label>
            <textarea required value={form.description} onChange={e => f("description", e.target.value)}
              rows={5} placeholder="体験の内容、持ち物、注意事項などを書いてください"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>

          {/* Tags */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>タグ（カンマ区切り）</label>
            <input value={form.tags} onChange={e => f("tags", e.target.value)}
              placeholder="例：糸島, 野菜, 小学生OK"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <button type="submit" disabled={loading || !providerId}
            style={{ backgroundColor: "#7B6BA8", color: "white", border: "none", borderRadius: "14px", padding: "14px", fontSize: "15px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "登録中..." : "体験を登録する"}
          </button>
        </form>
      </div>
    </div>
  );
}
