"use client";
import { useState } from "react";
import { Experience } from "@/lib/types";
import ExperienceCard from "./ExperienceCard";
import CalendarView from "./CalendarView";
import { LayoutGrid, Leaf, ChefHat, BookOpen, Scissors, TreePine, Sparkles, CalendarDays, SlidersHorizontal } from "lucide-react";

const CATS = [
  { key: "全て",    label: "全て",     Icon: LayoutGrid },
  { key: "農業体験", label: "農業",     Icon: Leaf },
  { key: "料理教室", label: "料理",     Icon: ChefHat },
  { key: "学習体験", label: "学習",     Icon: BookOpen },
  { key: "ものづくり", label: "ものづくり", Icon: Scissors },
  { key: "自然体験", label: "自然",     Icon: TreePine },
  { key: "その他",  label: "その他",    Icon: Sparkles },
];

const AREAS = ["全域", "東区", "博多区", "中央区", "南区", "城南区", "早良区", "西区", "糸島市", "春日市"];

export default function ExperienceBrowse({ experiences }: { experiences: Experience[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [selectedCat, setSelectedCat] = useState("全て");
  const [selectedArea, setSelectedArea] = useState("全域");
  const [showAreaFilter, setShowAreaFilter] = useState(false);

  const filtered = experiences.filter(e => {
    const catOk = selectedCat === "全て" || e.category === selectedCat;
    const areaOk = selectedArea === "全域" || e.location.includes(selectedArea);
    return catOk && areaOk;
  });

  return (
    <div>
      {/* Category tabs — Airbnb style */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #ebebeb", position: "sticky", top: "56px", zIndex: 40 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none", gap: "0", flex: 1 }}>
            {CATS.map(({ key, label, Icon }) => {
              const isActive = selectedCat === key;
              return (
                <button key={key} onClick={() => setSelectedCat(key)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", padding: "14px 20px", border: "none", background: "none", cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                    color: isActive ? "#111827" : "#6b7280",
                    borderBottom: isActive ? "2px solid #111827" : "2px solid transparent",
                  }}>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  <span style={{ fontSize: "11px", fontWeight: isActive ? 700 : 500, whiteSpace: "nowrap" }}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Filter + View toggle */}
          <div style={{ display: "flex", gap: "8px", flexShrink: 0, paddingLeft: "12px" }}>
            <button onClick={() => setShowAreaFilter(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #ebebeb", background: showAreaFilter ? "#f3f4f6" : "white", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#374151" }}>
              <SlidersHorizontal size={14} />
              {selectedArea !== "全域" ? selectedArea : "エリア"}
            </button>
            <button onClick={() => setViewMode(v => v === "grid" ? "calendar" : "grid")}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #ebebeb", background: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#374151" }}>
              <CalendarDays size={14} />
              {viewMode === "grid" ? "カレンダー" : "一覧"}
            </button>
          </div>
        </div>

        {/* Area filter dropdown */}
        {showAreaFilter && (
          <div style={{ borderTop: "1px solid #f3f4f6", padding: "10px 16px", backgroundColor: "white" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "6px", overflowX: "auto", scrollbarWidth: "none" }}>
              {AREAS.map(area => {
                const isActive = selectedArea === area;
                return (
                  <button key={area} onClick={() => { setSelectedArea(area); setShowAreaFilter(false); }}
                    style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "999px", border: "1.5px solid", fontSize: "12px", fontWeight: isActive ? 700 : 500, cursor: "pointer",
                      backgroundColor: isActive ? "#111827" : "white",
                      color: isActive ? "white" : "#374151",
                      borderColor: isActive ? "#111827" : "#d1d5db",
                    }}>
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>
        {viewMode === "calendar" ? (
          <CalendarView experiences={filtered} />
        ) : (
          <>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px", fontWeight: 500 }}>
              {filtered.length > 0 ? `${filtered.length}件の体験が見つかりました` : ""}
            </p>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                <p style={{ fontWeight: 600, color: "#374151", marginBottom: "8px" }}>体験が見つかりませんでした</p>
                <p style={{ fontSize: "13px" }}>条件を変えて再度お試しください</p>
                <button onClick={() => { setSelectedCat("全て"); setSelectedArea("全域"); }}
                  style={{ marginTop: "16px", padding: "10px 20px", borderRadius: "10px", border: "1.5px solid #111827", background: "none", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
                  絞り込みをリセット
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
                {filtered.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
