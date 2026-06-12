"use client";
import { useState } from "react";
import { Experience } from "@/lib/types";
import ExperienceCard from "./ExperienceCard";
import CalendarView from "./CalendarView";
import { LayoutGrid, Leaf, ChefHat, BookOpen, Scissors, TreePine, Sparkles, CalendarDays, SlidersHorizontal, ChevronDown } from "lucide-react";

const CATS = [
  { key: "全て",     label: "すべて",    Icon: LayoutGrid },
  { key: "農業体験", label: "農業・収穫", Icon: Leaf },
  { key: "料理教室", label: "料理・食",  Icon: ChefHat },
  { key: "学習体験", label: "学び・教育", Icon: BookOpen },
  { key: "ものづくり", label: "ものづくり", Icon: Scissors },
  { key: "自然体験", label: "自然・外遊び", Icon: TreePine },
  { key: "その他",   label: "その他",    Icon: Sparkles },
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
      {/* カテゴリタブ */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #ebebeb", position: "sticky", top: "56px", zIndex: 40 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: "0" }}>
          {/* スクロール可能なカテゴリ */}
          <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none", gap: "0", flex: 1 }}>
            {CATS.map(({ key, label, Icon }) => {
              const isActive = selectedCat === key;
              return (
                <button key={key} onClick={() => setSelectedCat(key)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
                    padding: "12px 16px", border: "none", background: "none", cursor: "pointer", flexShrink: 0,
                    color: isActive ? "#7B6BA8" : "#9ca3af",
                    borderBottom: isActive ? "2px solid #7B6BA8" : "2px solid transparent",
                    transition: "all 0.15s",
                  }}>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  <span style={{ fontSize: "11px", fontWeight: isActive ? 700 : 500, whiteSpace: "nowrap" }}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* エリア＋表示切り替え */}
          <div style={{ display: "flex", gap: "6px", flexShrink: 0, paddingLeft: "8px", borderLeft: "1px solid #f0f0f0" }}>
            <button onClick={() => setShowAreaFilter(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: showAreaFilter ? "#F5F3FA" : "white", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: selectedArea !== "全域" ? "#7B6BA8" : "#374151", whiteSpace: "nowrap" }}>
              <SlidersHorizontal size={13} />
              {selectedArea !== "全域" ? selectedArea : "エリア"}
              <ChevronDown size={12} />
            </button>
            <button onClick={() => setViewMode(v => v === "grid" ? "calendar" : "grid")}
              style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
              <CalendarDays size={13} />
              {viewMode === "grid" ? "カレンダー" : "一覧で見る"}
            </button>
          </div>
        </div>

        {/* エリア絞り込みパネル */}
        {showAreaFilter && (
          <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 16px", backgroundColor: "#FAFAF7" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <p style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, marginBottom: "8px" }}>開催エリアで絞り込む</p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {AREAS.map(area => {
                  const isActive = selectedArea === area;
                  return (
                    <button key={area} onClick={() => { setSelectedArea(area); setShowAreaFilter(false); }}
                      style={{ padding: "6px 14px", borderRadius: "8px", border: "1.5px solid", fontSize: "12px", fontWeight: isActive ? 700 : 500, cursor: "pointer",
                        backgroundColor: isActive ? "#7B6BA8" : "white",
                        color: isActive ? "white" : "#374151",
                        borderColor: isActive ? "#7B6BA8" : "#d1d5db",
                      }}>
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>
        {viewMode === "calendar" ? (
          <CalendarView experiences={filtered} />
        ) : (
          <>
            {filtered.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                  <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{filtered.length}件</span>の体験が見つかりました
                </p>
                {(selectedCat !== "全て" || selectedArea !== "全域") && (
                  <button onClick={() => { setSelectedCat("全て"); setSelectedArea("全域"); }}
                    style={{ fontSize: "12px", color: "#7B6BA8", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>
                    絞り込みを解除
                  </button>
                )}
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "72px 0", color: "#9ca3af" }}>
                <div style={{ fontSize: "40px", marginBottom: "14px" }}>🔍</div>
                <p style={{ fontWeight: 700, color: "#374151", fontSize: "15px", marginBottom: "8px" }}>体験が見つかりませんでした</p>
                <p style={{ fontSize: "13px", marginBottom: "20px" }}>エリアやカテゴリを変えてみてください</p>
                <button onClick={() => { setSelectedCat("全て"); setSelectedArea("全域"); }}
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "1.5px solid #7B6BA8", background: "none", cursor: "pointer", fontWeight: 700, fontSize: "13px", color: "#7B6BA8" }}>
                  すべての体験を見る
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
                {filtered.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
