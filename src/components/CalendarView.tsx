"use client";
import { useState } from "react";
import { Experience } from "@/lib/types";
import ExperienceCard from "./ExperienceCard";

type Props = { experiences: Experience[] };

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const CAT_META: Record<string, { emoji: string; color: string }> = {
  "農業体験":   { emoji: "🌾", color: "#4ade80" },
  "料理教室":   { emoji: "🍳", color: "#fb923c" },
  "学習体験":   { emoji: "📚", color: "#60a5fa" },
  "ものづくり":  { emoji: "🧵", color: "#f472b6" },
  "自然体験":   { emoji: "🌿", color: "#34d399" },
  "その他":     { emoji: "✨", color: "#9ca3af" },
};

export default function CalendarView({ experiences }: Props) {
  const now = new Date();

  // 今月以降で最初に体験がある月にデフォルト移動
  const firstExpDate = experiences
    .map(e => e.date)
    .filter(d => d >= now.toISOString().slice(0, 10))
    .sort()[0];
  const defaultDate = firstExpDate ? new Date(firstExpDate + "T00:00:00") : now;

  const [year, setYear] = useState(defaultDate.getFullYear());
  const [month, setMonth] = useState(defaultDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 今月の体験（親で絞り込み済みの experiences をそのまま使う）
  const monthExps = experiences.filter(e => {
    const d = new Date(e.date + "T00:00:00");
    return d.getFullYear() === year && d.getMonth() === month;
  }).sort((a, b) => a.date.localeCompare(b.date));

  // カレンダー用: 日付→体験マップ
  const expByDate: Record<string, Experience[]> = {};
  for (const exp of experiences) {
    if (!expByDate[exp.date]) expByDate[exp.date] = [];
    expByDate[exp.date].push(exp);
  }

  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const prevMonth = () => {
    setSelectedDate(null);
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    setSelectedDate(null);
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  };

  // 表示する体験カード
  const visibleExps: Experience[] = selectedDate
    ? (expByDate[selectedDate] ?? [])
    : monthExps;

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })
    : null;

  return (
    <div>
      {/* Calendar */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", padding: "16px", border: "1px solid #f3f4f6", marginBottom: "20px" }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <button onClick={prevMonth} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "#f9fafb", color: "#9ca3af", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation" }}>‹</button>
          <h2 style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "15px" }}>{year}年{month + 1}月</h2>
          <button onClick={nextMonth} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "#f9fafb", color: "#9ca3af", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation" }}>›</button>
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
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 2px", borderRadius: "12px", border: "none", cursor: hasExp ? "pointer" : "default", transition: "all 0.12s", touchAction: "manipulation",
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
          {Object.entries(CAT_META).filter(([cat]) => cat !== "その他").map(([cat, meta]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#9ca3af" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: meta.color, display: "inline-block" }} />
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Results header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: 0 }}>
          {selectedDate
            ? selectedDateLabel
            : <>{year}年{month + 1}月の体験</>}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>{visibleExps.length}件</span>
          {selectedDate && (
            <button onClick={() => setSelectedDate(null)}
              style={{ fontSize: "11px", color: "#7B6BA8", background: "#EDE9F8", border: "none", borderRadius: "999px", padding: "4px 12px", cursor: "pointer", fontWeight: 600, touchAction: "manipulation" }}>
              日付選択を解除
            </button>
          )}
        </div>
      </div>

      {/* Experience cards */}
      {visibleExps.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
          <p style={{ fontSize: "32px", marginBottom: "8px" }}>🌸</p>
          <p style={{ fontSize: "13px" }}>
            {selectedDate ? `${selectedDateLabel}の` : `${year}年${month + 1}月の`}
            体験はありません
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {visibleExps.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
        </div>
      )}
    </div>
  );
}
