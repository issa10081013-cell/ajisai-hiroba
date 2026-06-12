"use client";
import { useState } from "react";
import { Category, Experience } from "@/lib/types";
import ExperienceCard from "./ExperienceCard";

type Props = { experiences: Experience[] };

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const CAT_META: Record<string, { emoji: string; color: string; bg: string; text: string; border: string }> = {
  "農業体験":   { emoji: "🌾", color: "#4ade80", bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  "料理教室":   { emoji: "🍳", color: "#fb923c", bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  "学習体験":   { emoji: "📚", color: "#60a5fa", bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  "ものづくり":  { emoji: "🧵", color: "#f472b6", bg: "#fdf2f8", text: "#be185d", border: "#fbcfe8" },
  "自然体験":   { emoji: "🌿", color: "#34d399", bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
  "その他":     { emoji: "✨", color: "#9ca3af", bg: "#f9fafb", text: "#4b5563", border: "#e5e7eb" },
};

const AREAS = [
  "全域", "東区", "博多区", "中央区", "南区", "城南区", "早良区", "西区", "糸島市", "春日市", "大野城市",
];

export default function CalendarView({ experiences }: Props) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedArea, setSelectedArea] = useState("全域");

  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const areaFilteredExps = selectedArea === "全域"
    ? experiences
    : experiences.filter(e => e.location.includes(selectedArea));

  const expByDate: Record<string, Experience[]> = {};
  for (const exp of areaFilteredExps) {
    if (!expByDate[exp.date]) expByDate[exp.date] = [];
    expByDate[exp.date].push(exp);
  }

  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const prevMonth = () => {
    setSelectedDate(null); setSelectedCategory(null);
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    setSelectedDate(null); setSelectedCategory(null);
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
  };

  const handleDateSelect = (dateStr: string) => {
    if (selectedDate === dateStr) { setSelectedDate(null); setSelectedCategory(null); }
    else { setSelectedDate(dateStr); setSelectedCategory(null); }
  };

  const dateCategories: Category[] = selectedDate
    ? [...new Set((expByDate[selectedDate] ?? []).map(e => e.category))]
    : [];

  const visibleExps: Experience[] = selectedDate && selectedCategory
    ? (expByDate[selectedDate] ?? []).filter(e => e.category === selectedCategory)
    : [];

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })
    : null;

  const monthExps = areaFilteredExps.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      {/* Area filter */}
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.05em" }}>エリアで絞り込む</p>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
          {AREAS.map(area => {
            const isActive = selectedArea === area;
            return (
              <button key={area} onClick={() => { setSelectedArea(area); setSelectedDate(null); setSelectedCategory(null); }}
                style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "999px", border: "1.5px solid", fontSize: "12px", fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap",
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

      {/* Calendar */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", padding: "16px", border: "1px solid #f3f4f6" }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <button onClick={prevMonth} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "#f9fafb", color: "#9ca3af", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <h2 style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "15px" }}>{year}年{month + 1}月</h2>
          <button onClick={nextMonth} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "#f9fafb", color: "#9ca3af", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>

        {/* Weekday labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" }}>
          {WEEKDAYS.map((w, i) => (
            <div key={w} style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, padding: "4px 0",
              color: i === 0 ? "#f87171" : i === 6 ? "#60a5fa" : "#9ca3af" }}>
              {w}
            </div>
          ))}
        </div>

        {/* Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: "4px" }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = toDateStr(day);
            const dayExps = expByDate[dateStr] ?? [];
            const hasExp = dayExps.length > 0;
            const isSelected = selectedDate === dateStr;
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const dow = new Date(year, month, day).getDay();
            const dayCats = [...new Set(dayExps.map(e => e.category))].slice(0, 3);

            return (
              <button key={day} onClick={() => hasExp && handleDateSelect(dateStr)} disabled={!hasExp}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 2px", borderRadius: "12px", border: "none", cursor: hasExp ? "pointer" : "default", transition: "all 0.12s",
                  backgroundColor: isSelected ? "#7B6BA8" : "transparent",
                }}>
                <span style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1,
                  color: isSelected ? "white" : isToday ? "#7B6BA8" : !hasExp ? "#d1d5db" : dow === 0 ? "#f87171" : dow === 6 ? "#60a5fa" : "#374151" }}>
                  {day}
                </span>
                {hasExp && (
                  <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                    {dayCats.map(cat => (
                      <span key={cat} style={{ width: "5px", height: "5px", borderRadius: "50%", display: "inline-block",
                        backgroundColor: isSelected ? "rgba(255,255,255,0.8)" : (CAT_META[cat]?.color ?? "#9ca3af") }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f3f4f6", display: "flex", flexWrap: "wrap", gap: "6px 12px" }}>
          {Object.entries(CAT_META).map(([cat, meta]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#9ca3af" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: meta.color, display: "inline-block" }} />
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Category chips */}
      {selectedDate && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "10px" }}>
            {selectedDateLabel}
            <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "12px", marginLeft: "8px" }}>何を体験する？</span>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {dateCategories.map(cat => {
              const meta = CAT_META[cat];
              const isActive = selectedCategory === cat;
              const count = (expByDate[selectedDate] ?? []).filter(e => e.category === cat).length;
              return (
                <button key={cat} onClick={() => setSelectedCategory(isActive ? null : cat)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "999px", border: "1.5px solid", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.12s",
                    backgroundColor: isActive ? "#7B6BA8" : (meta?.bg ?? "#f9fafb"),
                    color: isActive ? "white" : (meta?.text ?? "#4b5563"),
                    borderColor: isActive ? "#7B6BA8" : (meta?.border ?? "#e5e7eb"),
                    boxShadow: isActive ? "0 2px 8px rgba(123,107,168,0.25)" : "none",
                  }}>
                  <span>{meta?.emoji}</span>
                  <span>{cat}</span>
                  {count > 1 && (
                    <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "999px",
                      backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)" }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Experience cards */}
      {selectedDate && selectedCategory && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              {CAT_META[selectedCategory]?.emoji} {selectedCategory}の体験
            </p>
            <button onClick={() => setSelectedCategory(null)}
              style={{ fontSize: "12px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>
              ← カテゴリに戻る
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {visibleExps.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
          </div>
        </div>
      )}

      {/* No date selected: show all month experiences */}
      {!selectedDate && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              {year}年{month + 1}月の体験
            </p>
            <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>
              {monthExps.length}件
            </span>
          </div>
          {monthExps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: "32px", marginBottom: "8px" }}>🌸</p>
              <p style={{ fontSize: "13px" }}>
                {selectedArea !== "全域" ? `${selectedArea}の` : ""}この月の体験はまだありません
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {monthExps.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
