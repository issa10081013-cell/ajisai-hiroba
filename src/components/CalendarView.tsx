"use client";
import { useState } from "react";
import { Category, Experience } from "@/lib/types";
import ExperienceCard from "./ExperienceCard";

type Props = {
  experiences: Experience[];
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const CATEGORY_META: Record<string, { emoji: string; color: string; bg: string; text: string; border: string }> = {
  "農業体験":   { emoji: "🌾", color: "#4ade80", bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  "料理教室":   { emoji: "🍳", color: "#fb923c", bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  "学習体験":   { emoji: "📚", color: "#60a5fa", bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  "ものづくり":  { emoji: "🧵", color: "#f472b6", bg: "#fdf2f8", text: "#be185d", border: "#fbcfe8" },
  "自然体験":   { emoji: "🌿", color: "#34d399", bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
  "その他":     { emoji: "✨", color: "#9ca3af", bg: "#f9fafb", text: "#4b5563", border: "#e5e7eb" },
};

export default function CalendarView({ experiences }: Props) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6); // July
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // date → experiences map
  const expByDate: Record<string, Experience[]> = {};
  for (const exp of experiences) {
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
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setSelectedCategory(null);
    } else {
      setSelectedDate(dateStr);
      setSelectedCategory(null);
    }
  };

  // Categories available on the selected date
  const dateCategories: Category[] = selectedDate
    ? [...new Set((expByDate[selectedDate] ?? []).map(e => e.category))]
    : [];

  // Experiences to show (date × category filtered)
  const visibleExps: Experience[] = selectedDate && selectedCategory
    ? (expByDate[selectedDate] ?? []).filter(e => e.category === selectedCategory)
    : [];

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("ja-JP", {
        month: "long", day: "numeric", weekday: "short",
      })
    : null;

  return (
    <div>
      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-lg transition-colors">‹</button>
          <h2 className="font-bold text-gray-800">{year}年{month + 1}月</h2>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-lg transition-colors">›</button>
        </div>

        {/* Weekdays */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }} className="mb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`text-center text-xs py-1 font-medium ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
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
              <button
                key={day}
                onClick={() => hasExp && handleDateSelect(dateStr)}
                disabled={!hasExp}
                className={`flex flex-col items-center py-1.5 rounded-xl transition-colors ${
                  isSelected ? "bg-[#7B6BA8]" : hasExp ? "hover:bg-[#E8E4F5] cursor-pointer" : "cursor-default"
                }`}
              >
                <span className={`text-sm font-medium leading-none ${
                  isSelected ? "text-white"
                  : isToday ? "text-[#7B6BA8] font-bold"
                  : !hasExp ? "text-gray-200"
                  : dow === 0 ? "text-red-400"
                  : dow === 6 ? "text-blue-400"
                  : "text-gray-700"
                }`}>
                  {day}
                </span>
                {hasExp && (
                  <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                    {dayCats.map(cat => (
                      <span
                        key={cat}
                        style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          backgroundColor: isSelected ? "white" : (CATEGORY_META[cat]?.color ?? "#9ca3af"),
                          display: "inline-block",
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f9fafb", display: "flex", flexWrap: "wrap", gap: "8px 12px" }}>
          {Object.entries(CATEGORY_META).map(([cat, meta]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#9ca3af" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: meta.color, display: "inline-block" }} />
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Category chips (日付選択後) */}
      {selectedDate && (
        <div className="mt-5">
          <p className="text-sm font-bold text-gray-800 mb-3">
            {selectedDateLabel}
            <span className="text-gray-400 font-normal text-xs ml-2">何を体験する？</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {dateCategories.map(cat => {
              const meta = CATEGORY_META[cat];
              const isActive = selectedCategory === cat;
              const count = (expByDate[selectedDate] ?? []).filter(e => e.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(isActive ? null : cat)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 16px", borderRadius: "9999px", border: "1px solid",
                    fontSize: "14px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                    backgroundColor: isActive ? "#7B6BA8" : (meta?.bg ?? "#f9fafb"),
                    color: isActive ? "white" : (meta?.text ?? "#4b5563"),
                    borderColor: isActive ? "#7B6BA8" : (meta?.border ?? "#e5e7eb"),
                  }}
                >
                  <span>{meta?.emoji}</span>
                  <span>{cat}</span>
                  {count > 1 && (
                    <span style={{
                      fontSize: "11px", padding: "1px 6px", borderRadius: "9999px",
                      backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
                    }}>
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
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">
              {CATEGORY_META[selectedCategory]?.emoji} {selectedCategory}の体験
            </p>
            <button onClick={() => setSelectedCategory(null)} className="text-xs text-gray-400 hover:text-gray-600">← カテゴリに戻る</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleExps.map(exp => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </div>
      )}

      {/* 日付未選択：月全体をカードで表示 */}
      {!selectedDate && (
        <div className="mt-5">
          <p className="text-sm font-bold text-gray-800 mb-3">
            {year}年{month + 1}月の体験
            <span className="ml-2 text-gray-400 font-normal text-xs">
              {experiences.filter(e => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === month; }).length}件
            </span>
          </p>
          {experiences.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === year && d.getMonth() === month;
          }).length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <p className="text-2xl mb-2">🌸</p>
              <p>この月の体験はまだありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {experiences
                .filter(e => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === month; })
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
