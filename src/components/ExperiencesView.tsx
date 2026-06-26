"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Category, Experience } from "@/lib/types";
import CalendarView from "./CalendarView";
import ExperienceFilters from "./ExperienceFilters";

// Leaflet は window に依存するため SSR を無効化して読み込む
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "460px", borderRadius: "20px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "13px" }}>
      地図を読み込み中…
    </div>
  ),
});

type Props = { experiences: Experience[] };
type Tab = "calendar" | "map";

export default function ExperiencesView({ experiences }: Props) {
  const [tab, setTab] = useState<Tab>("calendar");
  const [selectedArea, setSelectedArea] = useState("全域");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // エリア＋カテゴリで絞り込み（カレンダー・地図 共通）
  const filtered = experiences.filter(e => {
    if (selectedArea !== "全域" && !e.location.includes(selectedArea)) return false;
    if (selectedCategory && e.category !== selectedCategory) return false;
    return true;
  });

  const hasFilter = selectedArea !== "全域" || selectedCategory !== null;

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "9px 0",
    borderRadius: "999px",
    border: "none",
    fontSize: "13px",
    fontWeight: active ? 700 : 600,
    cursor: "pointer",
    transition: "all 0.12s",
    touchAction: "manipulation",
    background: active ? "#7B6BA8" : "transparent",
    color: active ? "#fff" : "#6b7280",
    boxShadow: active ? "0 2px 8px rgba(123,107,168,0.3)" : "none",
  });

  return (
    <div>
      {/* 共通フィルター（カレンダー・地図で連動） */}
      <ExperienceFilters
        experiences={experiences}
        selectedArea={selectedArea}
        onAreaChange={(area) => setSelectedArea(area)}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => setSelectedCategory(prev => prev === cat ? null : cat)}
      />

      {/* View toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "4px", background: "#f3f4f6", borderRadius: "999px", padding: "4px", flex: 1 }}>
          <button onClick={() => setTab("calendar")} style={tabBtn(tab === "calendar")}>📅 カレンダー</button>
          <button onClick={() => setTab("map")} style={tabBtn(tab === "map")}>🗺 地図</button>
        </div>
        {hasFilter && (
          <button onClick={() => { setSelectedArea("全域"); setSelectedCategory(null); }}
            style={{ flexShrink: 0, fontSize: "11px", color: "#7B6BA8", background: "#EDE9F8", border: "none", borderRadius: "999px", padding: "7px 14px", cursor: "pointer", fontWeight: 600, touchAction: "manipulation" }}>
            絞り込み解除
          </button>
        )}
      </div>

      {tab === "calendar" ? (
        <CalendarView experiences={filtered} />
      ) : (
        <MapView experiences={filtered} />
      )}
    </div>
  );
}
