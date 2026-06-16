"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import ReportModal from "./ReportModal";

type Review = {
  id: string;
  user_id?: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  child_age: string;
  date: string;
};

type Props = {
  experienceId: string;
  initialReviews: Review[];
};

export default function ReviewForm({ experienceId, initialReviews }: Props) {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [childAge, setChildAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [report, setReport] = useState<{ id: string } | null>(null);

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ id: u.id, name: u.user_metadata?.display_name ?? u.email?.split("@")[0] ?? "匿名", email: u.email ?? "" });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    const { data, error } = await supabaseBrowser.from("reviews").insert({
      experience_id: experienceId,
      user_id: user.id,
      reviewer_name: user.name,
      reviewer_avatar: `https://i.pravatar.cc/80?u=${user.email}`,
      rating, comment, child_age: childAge, date: today,
    }).select().single();
    setLoading(false);
    if (error) { alert("送信に失敗しました"); return; }
    setReviews(prev => [{ ...(data as Review), user_id: user.id }, ...prev]);
    setSubmitted(true);
    setComment(""); setChildAge(""); setRating(5);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("この口コミを削除しますか？")) return;
    const { error } = await supabaseBrowser.from("reviews").delete().eq("id", id);
    if (!error) setReviews(prev => prev.filter(r => r.id !== id));
  };

  const avg = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10
    : null;

  return (
    <div style={{ marginTop: "8px" }}>
      {report && user && (
        <ReportModal targetType="review" targetId={report.id} reporterId={user.id} onClose={() => setReport(null)} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: 0 }}>口コミ</h2>
        {avg && <>
          <span style={{ color: "#f59e0b" }}>★</span>
          <span style={{ fontWeight: 700, color: "#374151", fontSize: "14px" }}>{avg}</span>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>/ {reviews.length}件</span>
        </>}
      </div>

      {reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: "white", borderRadius: "16px", padding: "14px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", paddingRight: "32px" }}>
                <img src={`https://i.pravatar.cc/80?u=${r.reviewer_name}`} alt={r.reviewer_name}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontWeight: 600, color: "#111827", fontSize: "13px", margin: 0 }}>{r.reviewer_name}</p>
                    <div style={{ display: "flex", gap: "1px" }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "#e5e7eb", fontSize: "13px" }}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.child_age && <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{r.child_age}</p>}
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, margin: 0 }}>{r.comment}</p>
              <p style={{ fontSize: "11px", color: "#d1d5db", marginTop: "6px", textAlign: "right" }}>{r.date}</p>

              {/* 削除 or 通報 */}
              {user && (
                <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                  {r.user_id === user.id ? (
                    <button onClick={() => handleDelete(r.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "4px", touchAction: "manipulation", opacity: 0.5 }}
                      title="削除">🗑️</button>
                  ) : (
                    <button onClick={() => setReport({ id: r.id })}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "4px", touchAction: "manipulation", opacity: 0.4 }}
                      title="通報">⚠️</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "white", borderRadius: "16px", padding: "16px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>口コミを書く</h3>

        {submitted && (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "10px", marginBottom: "12px" }}>
            <p style={{ fontSize: "13px", color: "#166534", fontWeight: 600, margin: 0 }}>✓ 口コミを投稿しました！ありがとうございます</p>
          </div>
        )}

        {!user ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>口コミを書くにはログインが必要です</p>
            <Link href="/login" style={{ display: "inline-block", background: "#7B6BA8", color: "white", borderRadius: "10px", padding: "8px 24px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
              ログイン / 新規登録
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>評価 *</label>
              <div style={{ display: "flex", gap: "4px" }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setRating(s)}
                    onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "28px", padding: "0", touchAction: "manipulation", color: s <= (hovered || rating) ? "#f59e0b" : "#e5e7eb" }}>★</button>
                ))}
                <span style={{ fontSize: "12px", color: "#6b7280", alignSelf: "center", marginLeft: "4px" }}>
                  {["", "残念", "いまいち", "普通", "良かった", "最高！"][hovered || rating]}
                </span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>お子さんの年齢（任意）</label>
              <input value={childAge} onChange={e => setChildAge(e.target.value)} placeholder="例：6歳・小1"
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>コメント *</label>
              <textarea required value={comment} onChange={e => setComment(e.target.value)} rows={4}
                placeholder="体験の感想を教えてください。他の保護者の参考になります。"
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", outline: "none", resize: "none", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ background: "#7B6BA8", color: "white", border: "none", borderRadius: "10px", padding: "11px", fontSize: "13px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, touchAction: "manipulation" }}>
              {loading ? "投稿中..." : "口コミを投稿する"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
