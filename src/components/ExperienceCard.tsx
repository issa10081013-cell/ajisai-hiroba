"use client";
import Link from "next/link";
import { Experience } from "@/lib/types";
import { Calendar, MapPin } from "lucide-react";

// Real Unsplash photos per category (shown when provider has no image)
const CAT_PHOTOS: Record<string, string> = {
  "農業体験":   "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=420&q=80&auto=format&fit=crop",
  "料理教室":   "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=420&q=80&auto=format&fit=crop",
  "学習体験":   "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=420&q=80&auto=format&fit=crop",
  "ものづくり":  "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=420&q=80&auto=format&fit=crop",
  "自然体験":   "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=420&q=80&auto=format&fit=crop",
  "その他":     "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=420&q=80&auto=format&fit=crop",
};

const CAT_GRADIENT: Record<string, string> = {
  "農業体験":   "linear-gradient(135deg, #bbf7d0, #16a34a)",
  "料理教室":   "linear-gradient(135deg, #fed7aa, #c2410c)",
  "学習体験":   "linear-gradient(135deg, #bfdbfe, #1d4ed8)",
  "ものづくり":  "linear-gradient(135deg, #fbcfe8, #be185d)",
  "自然体験":   "linear-gradient(135deg, #a7f3d0, #059669)",
  "その他":     "linear-gradient(135deg, #e5e7eb, #4b5563)",
};

export default function ExperienceCard({ experience }: { experience: Experience }) {
  const spotsLeft = experience.capacity - experience.currentBookings;
  const isFull = spotsLeft <= 0;
  const isFree = experience.priceMember === 0;

  const photoSrc = experience.imageUrl || CAT_PHOTOS[experience.category] || CAT_PHOTOS["その他"];
  const fallbackGradient = CAT_GRADIENT[experience.category] || CAT_GRADIENT["その他"];

  const dateObj = new Date(experience.date + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });

  return (
    <Link href={`/experiences/${experience.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
        }}
      >
        {/* Photo */}
        <div style={{ position: "relative", height: "210px", overflow: "hidden", background: fallbackGradient }}>
          <img
            src={photoSrc}
            alt={experience.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />

          {/* Top badges */}
          <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
            <span style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "#111827", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", backdropFilter: "blur(8px)" }}>
              {experience.category}
            </span>
            {isFree && (
              <span style={{ backgroundColor: "#059669", color: "white", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px" }}>
                無料
              </span>
            )}
          </div>

          {spotsLeft <= 3 && !isFull && (
            <span style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "#ef4444", color: "white", fontSize: "10px", fontWeight: 700, padding: "4px 9px", borderRadius: "999px" }}>
              残り{spotsLeft}席
            </span>
          )}

          {isFull && (
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: "15px", letterSpacing: "0.1em" }}>SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "12px 14px 14px" }}>
          {/* Provider */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <img
              src={experience.provider.imageUrl || `https://i.pravatar.cc/40?u=${experience.provider.id}`}
              alt={experience.provider.name}
              style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
            <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600 }}>{experience.provider.name}</span>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "0 0 8px", lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {experience.title}
          </h3>

          {/* Date & location */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Calendar size={11} color="#9ca3af" strokeWidth={2} />
              <span style={{ fontSize: "12px", color: "#6b7280" }}>{dateStr}　{experience.timeStart}〜</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <MapPin size={11} color="#9ca3af" strokeWidth={2} />
              <span style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {experience.location.split("（")[0]}
              </span>
            </div>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #f3f4f6" }}>
            {isFree ? (
              <span style={{ color: "#059669", fontWeight: 800, fontSize: "15px" }}>無料</span>
            ) : (
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ color: "#111827", fontWeight: 800, fontSize: "15px" }}>¥{experience.priceMember.toLocaleString()}</span>
                <span style={{ color: "#d1d5db", fontSize: "11px", textDecoration: "line-through" }}>¥{experience.priceRegular.toLocaleString()}</span>
                <span style={{ color: "#9ca3af", fontSize: "11px" }}>/家族</span>
              </div>
            )}
            {!isFull && spotsLeft > 3 && (
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "999px", backgroundColor: "#f3f4f6", color: "#6b7280" }}>
                残{spotsLeft}席
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
