"use client";
import { Category, Experience } from "@/lib/types";

const CAT_META: Record<string, { emoji: string; color: string; bg: string; text: string; border: string }> = {
  "農業体験":   { emoji: "🌾", color: "#4ade80", bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  "料理教室":   { emoji: "🍳", color: "#fb923c", bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  "学習体験":   { emoji: "📚", color: "#60a5fa", bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  "ものづくり":  { emoji: "🧵", color: "#f472b6", bg: "#fdf2f8", text: "#be185d", border: "#fbcfe8" },
  "自然体験":   { emoji: "🌿", color: "#34d399", bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
  "その他":     { emoji: "✨", color: "#9ca3af", bg: "#f9fafb", text: "#4b5563", border: "#e5e7eb" },
};

const AREAS = [
  "全域", "東区", "博多区", "中央区", "南区", "城南区", "早良区", "西区",
  "門司区", "小倉北区", "小倉南区", "若松区", "八幡東区", "八幡西区", "戸畑区",
  "糸島市", "春日市", "大野城市",
];

type Props = {
  experiences: Experience[];
  selectedArea: string;
  onAreaChange: (area: string) => void;
  selectedCategory: Category | null;
  onCategoryChange: (cat: Category) => void;
};

export default function ExperienceFilters({ experiences, selectedArea, onAreaChange, selectedCategory, onCategoryChange }: Props) {
  // エリア絞り込み後の集合（カテゴリのチップ・件数算出用）
  const areaFiltered = selectedArea === "全域"
    ? experiences
    : experiences.filter(e => e.location.includes(selectedArea));

  // エリア絞り込み後に存在するカテゴリ（「その他」は絞り込みチップに出さない）
  const categories = ([...new Set(areaFiltered.map(e => e.category))] as Category[])
    .filter(c => c !== "その他");

  return (
    <div>
      {/* Area filter */}
      <div style={{ marginBottom: "12px" }}>
        <p style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.05em" }}>エリア</p>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
          {AREAS.map(area => {
            const isActive = selectedArea === area;
            return (
              <button key={area} onClick={() => onAreaChange(area)}
                style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "999px", border: "1.5px solid", fontSize: "12px", fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap", touchAction: "manipulation",
                  backgroundColor: isActive ? "#7B6BA8" : "white",
                  color: isActive ? "white" : "#6b7280",
                  borderColor: isActive ? "#7B6BA8" : "#e5e7eb",
                  boxShadow: isActive ? "0 2px 8px rgba(123,107,168,0.3)" : "none",
                }}>
                {area}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.05em" }}>カテゴリ</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {categories.map(cat => {
              const meta = CAT_META[cat];
              const isActive = selectedCategory === cat;
              const count = areaFiltered.filter(e => e.category === cat).length;
              return (
                <button key={cat} onClick={() => onCategoryChange(cat)}
                  style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "999px", border: "1.5px solid", fontSize: "12px", fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.12s", touchAction: "manipulation",
                    backgroundColor: isActive ? "#7B6BA8" : (meta?.bg ?? "#f9fafb"),
                    color: isActive ? "white" : (meta?.text ?? "#4b5563"),
                    borderColor: isActive ? "#7B6BA8" : (meta?.border ?? "#e5e7eb"),
                    boxShadow: isActive ? "0 2px 8px rgba(123,107,168,0.25)" : "none",
                  }}>
                  <span style={{ fontSize: "13px" }}>{meta?.emoji}</span>
                  <span>{cat}</span>
                  <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "999px",
                    backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                    color: isActive ? "white" : "inherit" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
