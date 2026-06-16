"use client";
import { useState } from "react";
import { Experience } from "@/lib/types";
import ExperienceCard from "./ExperienceCard";
import CalendarView from "./CalendarView";

const CATS = [
  { key: "全て",      label: "すべて",      emoji: "🏡" },
  { key: "農業体験",  label: "農業・収穫",  emoji: "🌾" },
  { key: "料理教室",  label: "料理・食",    emoji: "🍳" },
  { key: "学習体験",  label: "学び",        emoji: "📚" },
  { key: "ものづくり", label: "ものづくり", emoji: "🔨" },
  { key: "自然体験",  label: "自然・外遊び", emoji: "🌿" },
  { key: "その他",    label: "その他",      emoji: "✨" },
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

  const hasFilter = selectedCat !== "全て" || selectedArea !== "全域";

  return (
    <div id="browse">
      {/* Sticky filter bar */}
      <div style={{
        position: "sticky",
        top: "64px",
        zIndex: 40,
        backgroundColor: "white",
        borderBottom: "1px solid #EBEBEB",
      }}>
        {/* Category tabs */}
        <div style={{
          display: "flex",
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          padding: "0 12px",
        }}>
          {CATS.map(({ key, label, emoji }) => {
            const active = selectedCat === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCat(key)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  padding: "10px 14px",
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  borderBottom: active ? "2px solid #222" : "2px solid transparent",
                  cursor: "pointer",
                  touchAction: "manipulation",
                  transition: "opacity 0.1s",
                  opacity: active ? 1 : 0.65,
                }}
              >
                <span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>
                <span style={{
                  fontSize: "10px",
                  fontWeight: active ? 700 : 500,
                  color: active ? "#222" : "#717171",
                  whiteSpace: "nowrap",
                }}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: "8px", padding: "8px 16px", alignItems: "center" }}>
          <button
            onClick={() => setShowAreaFilter(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 13px", borderRadius: "999px",
              border: `1.5px solid ${selectedArea !== "全域" ? "#222" : "#DDDDDD"}`,
              background: selectedArea !== "全域" ? "#222" : "white",
              color: selectedArea !== "全域" ? "white" : "#222",
              fontSize: "12px", fontWeight: 500,
              cursor: "pointer", touchAction: "manipulation",
            }}
          >
            📍 {selectedArea !== "全域" ? selectedArea : "エリア"}
          </button>

          <button
            onClick={() => setViewMode(v => v === "grid" ? "calendar" : "grid")}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 13px", borderRadius: "999px",
              border: `1.5px solid ${viewMode === "calendar" ? "#222" : "#DDDDDD"}`,
              background: viewMode === "calendar" ? "#222" : "white",
              color: viewMode === "calendar" ? "white" : "#222",
              fontSize: "12px", fontWeight: 500,
              cursor: "pointer", touchAction: "manipulation",
            }}
          >
            📅 {viewMode === "calendar" ? "一覧に戻る" : "日程で探す"}
          </button>

          {hasFilter && (
            <button
              onClick={() => { setSelectedCat("全て"); setSelectedArea("全域"); }}
              style={{
                marginLeft: "auto",
                fontSize: "11px", color: "#717171", fontWeight: 500,
                background: "none", border: "none", cursor: "pointer",
                touchAction: "manipulation", textDecoration: "underline",
              }}
            >
              絞り込みを解除
            </button>
          )}
        </div>

        {/* Area dropdown */}
        {showAreaFilter && (
          <div style={{ borderTop: "1px solid #F0F0F0", padding: "12px 16px", backgroundColor: "white" }}>
            <p style={{ fontSize: "11px", color: "#717171", fontWeight: 600, marginBottom: "10px" }}>
              開催エリアで絞り込む
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {AREAS.map(area => (
                <button
                  key={area}
                  onClick={() => { setSelectedArea(area); setShowAreaFilter(false); }}
                  style={{
                    padding: "7px 16px", borderRadius: "999px",
                    border: `1.5px solid ${selectedArea === area ? "#222" : "#DDDDDD"}`,
                    background: selectedArea === area ? "#222" : "white",
                    color: selectedArea === area ? "white" : "#222",
                    fontSize: "13px", fontWeight: 500,
                    cursor: "pointer", touchAction: "manipulation",
                  }}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 12px 60px" }}>
        {viewMode === "calendar" ? (
          <CalendarView experiences={filtered} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</p>
            <p style={{ fontWeight: 600, color: "#222", marginBottom: "8px" }}>体験が見つかりませんでした</p>
            <p style={{ fontSize: "13px", color: "#717171", marginBottom: "20px" }}>
              エリアやカテゴリを変えてみてください
            </p>
            <button
              onClick={() => { setSelectedCat("全て"); setSelectedArea("全域"); }}
              style={{
                padding: "12px 28px", borderRadius: "999px",
                border: "1.5px solid #222", background: "white",
                color: "#222", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", touchAction: "manipulation",
              }}
            >
              すべての体験を見る
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "13px", color: "#717171", marginBottom: "16px" }}>
              <span style={{ fontWeight: 700, color: "#222" }}>{filtered.length}件</span>の体験
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6">
              {filtered.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
