"use client";
import Link from "next/link";
import { Experience } from "@/lib/types";
import { Calendar, MapPin } from "lucide-react";

const CAT_STYLE: Record<string, { gradient: string; emoji: string }> = {
  "農業体験":   { gradient: "linear-gradient(135deg, #bbf7d0 0%, #4ade80 60%, #16a34a 100%)", emoji: "🌾" },
  "料理教室":   { gradient: "linear-gradient(135deg, #fed7aa 0%, #fb923c 60%, #c2410c 100%)", emoji: "🍳" },
  "学習体験":   { gradient: "linear-gradient(135deg, #bfdbfe 0%, #60a5fa 60%, #1d4ed8 100%)", emoji: "📚" },
  "ものづくり":  { gradient: "linear-gradient(135deg, #fbcfe8 0%, #f472b6 60%, #be185d 100%)", emoji: "🧵" },
  "自然体験":   { gradient: "linear-gradient(135deg, #a7f3d0 0%, #34d399 60%, #059669 100%)", emoji: "🌿" },
  "その他":     { gradient: "linear-gradient(135deg, #e5e7eb 0%, #9ca3af 60%, #4b5563 100%)", emoji: "✨" },
};

export default function ExperienceCard({ experience }: { experience: Experience }) {
  const spotsLeft = experience.capacity - experience.currentBookings;
  const isFull = spotsLeft <= 0;
  const isFree = experience.priceMember === 0;
  const cat = CAT_STYLE[experience.category] ?? CAT_STYLE["その他"];

  const dateObj = new Date(experience.date + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });

  return (
    <Link href={`/experiences/${experience.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{ backgroundColor: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", transition: "transform 0.15s, box-shadow 0.15s", cursor: "pointer" }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 28px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
        }}
      >
        {/* Image / Gradient */}
        <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
          {experience.imageUrl ? (
            <img src={experience.imageUrl} alt={experience.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: cat.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "60px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.18))" }}>{cat.emoji}</span>
            </div>
          )}

          {/* Category badge */}
          <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
            <span style={{ backgroundColor: "rgba(255,255,255,0.93)", color: "#7B6BA8", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", backdropFilter: "blur(8px)" }}>
              {experience.category}
            </span>
            {isFree && (
              <span style={{ backgroundColor: "#059669", color: "white", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px" }}>
                無料
              </span>
            )}
          </div>

          {/* Urgency badge */}
          {spotsLeft <= 3 && !isFull && (
            <div style={{ position: "absolute", top: "12px", right: "12px" }}>
              <span style={{ backgroundColor: "#ef4444", color: "white", fontSize: "10px", fontWeight: 700, padding: "4px 9px", borderRadius: "999px" }}>
                残り{spotsLeft}席
              </span>
            </div>
          )}

          {isFull && (
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: "16px", letterSpacing: "0.1em" }}>SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "14px 16px 16px" }}>
          {/* Provider */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
            <img
              src={experience.provider.imageUrl || `https://i.pravatar.cc/40?u=${experience.provider.id}`}
              alt={experience.provider.name}
              style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1.5px solid #E8E4F5" }}
            />
            <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600 }}>{experience.provider.name}</span>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "0 0 10px", lineHeight: 1.45,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {experience.title}
          </h3>

          {/* Date & Location */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Calendar size={12} color="#9ca3af" strokeWidth={2} />
              <span style={{ fontSize: "12px", color: "#6b7280" }}>{dateStr}　{experience.timeStart}〜{experience.timeEnd}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <MapPin size={12} color="#9ca3af" strokeWidth={2} />
              <span style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {experience.location.split("（")[0]}
              </span>
            </div>
          </div>

          {/* Price row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f3f4f6", paddingTop: "10px" }}>
            {isFree ? (
              <div>
                <span style={{ color: "#059669", fontWeight: 800, fontSize: "16px" }}>無料</span>
                <span style={{ color: "#9ca3af", fontSize: "11px", marginLeft: "4px" }}>で参加</span>
              </div>
            ) : (
              <div>
                <span style={{ color: "#7B6BA8", fontWeight: 800, fontSize: "16px" }}>¥{experience.priceMember.toLocaleString()}</span>
                <span style={{ color: "#d1d5db", fontSize: "11px", marginLeft: "4px", textDecoration: "line-through" }}>¥{experience.priceRegular.toLocaleString()}</span>
                <span style={{ color: "#9ca3af", fontSize: "11px" }}> /家族</span>
              </div>
            )}
            {!isFull && spotsLeft > 3 && (
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", backgroundColor: "#EDE9F8", color: "#7B6BA8" }}>
                残り{spotsLeft}席
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
