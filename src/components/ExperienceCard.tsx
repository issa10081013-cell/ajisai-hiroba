"use client";
import Link from "next/link";
import { Experience } from "@/lib/types";
import { Calendar, MapPin } from "lucide-react";

// 日本の農業・料理・自然の写真（Unsplash）
const CAT_PHOTOS: Record<string, string> = {
  "農業体験":   "https://images.unsplash.com/photo-1516901408944-6695e58c4f06?w=600&h=420&q=80&auto=format&fit=crop",
  "料理教室":   "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=420&q=80&auto=format&fit=crop",
  "学習体験":   "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=420&q=80&auto=format&fit=crop",
  "ものづくり":  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=420&q=80&auto=format&fit=crop",
  "自然体験":   "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=420&q=80&auto=format&fit=crop",
  "その他":     "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&h=420&q=80&auto=format&fit=crop",
};

const CAT_GRADIENT: Record<string, string> = {
  "農業体験":   "linear-gradient(135deg, #d1fae5, #059669)",
  "料理教室":   "linear-gradient(135deg, #fef3c7, #d97706)",
  "学習体験":   "linear-gradient(135deg, #dbeafe, #2563eb)",
  "ものづくり":  "linear-gradient(135deg, #fce7f3, #db2777)",
  "自然体験":   "linear-gradient(135deg, #dcfce7, #16a34a)",
  "その他":     "linear-gradient(135deg, #f3f4f6, #6b7280)",
};

export default function ExperienceCard({ experience }: { experience: Experience }) {
  const spotsLeft = experience.capacity - experience.currentBookings;
  const isFull = spotsLeft <= 0;
  const isFree = experience.priceMember === 0;

  const photoSrc = experience.imageUrl || CAT_PHOTOS[experience.category] || CAT_PHOTOS["その他"];
  const fallbackGradient = CAT_GRADIENT[experience.category] || CAT_GRADIENT["その他"];

  const dateObj = new Date(experience.date + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });

  return (
    <Link href={`/experiences/${experience.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{ backgroundColor: "white", borderRadius: "14px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0" }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 28px rgba(0,0,0,0.11)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
        }}
      >
        {/* 写真 */}
        <div style={{ position: "relative", height: "200px", overflow: "hidden", background: fallbackGradient }}>
          <img
            src={photoSrc}
            alt={experience.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          {/* 下からのグラデーション */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)" }} />

          {/* カテゴリバッジ */}
          <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "5px" }}>
            <span style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "#374151", fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "6px", backdropFilter: "blur(4px)" }}>
              {experience.category}
            </span>
            {isFree && (
              <span style={{ backgroundColor: "#059669", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "6px" }}>
                無料
              </span>
            )}
          </div>

          {spotsLeft <= 3 && !isFull && (
            <span style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "#ef4444", color: "white", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>
              残り{spotsLeft}席
            </span>
          )}

          {isFull && (
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: "14px", letterSpacing: "0.05em", backgroundColor: "rgba(0,0,0,0.4)", padding: "6px 16px", borderRadius: "8px" }}>満員御礼</span>
            </div>
          )}
        </div>

        {/* 情報エリア */}
        <div style={{ padding: "12px 14px 14px" }}>
          {/* 提供者 */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <img
              src={experience.provider.imageUrl || `https://i.pravatar.cc/40?u=${experience.provider.id}`}
              alt={experience.provider.name}
              style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
            <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600 }}>{experience.provider.name}</span>
          </div>

          {/* タイトル */}
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px", lineHeight: 1.45,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {experience.title}
          </h3>

          {/* 日時・場所 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Calendar size={11} color="#b0b0b0" strokeWidth={2} />
              <span style={{ fontSize: "12px", color: "#6b7280" }}>{dateStr}　{experience.timeStart}〜</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <MapPin size={11} color="#b0b0b0" strokeWidth={2} />
              <span style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {experience.location.split("（")[0]}
              </span>
            </div>
          </div>

          {/* 価格 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "9px", borderTop: "1px solid #f3f4f6" }}>
            {isFree ? (
              <span style={{ color: "#059669", fontWeight: 800, fontSize: "15px" }}>無料で参加</span>
            ) : (
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ color: "#7B6BA8", fontWeight: 800, fontSize: "15px" }}>¥{experience.priceMember.toLocaleString()}</span>
                <span style={{ color: "#d1d5db", fontSize: "11px", textDecoration: "line-through" }}>¥{experience.priceRegular.toLocaleString()}</span>
                <span style={{ color: "#9ca3af", fontSize: "11px" }}>/家族</span>
              </div>
            )}
            {!isFull && spotsLeft > 3 && (
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "6px", backgroundColor: "#F0EDF8", color: "#7B6BA8" }}>
                残{spotsLeft}席
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
