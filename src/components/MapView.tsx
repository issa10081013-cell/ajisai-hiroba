"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Link from "next/link";
import { Experience } from "@/lib/types";
import { FUKUOKA_CENTER, resolveCoord } from "@/lib/fukuoka-geo";

type Props = { experiences: Experience[] };

const CAT_META: Record<string, { emoji: string; color: string }> = {
  "農業体験": { emoji: "🌾", color: "#4ade80" },
  "料理教室": { emoji: "🍳", color: "#fb923c" },
  "学習体験": { emoji: "📚", color: "#60a5fa" },
  "ものづくり": { emoji: "🧵", color: "#f472b6" },
  "自然体験": { emoji: "🌿", color: "#34d399" },
  "その他": { emoji: "✨", color: "#9ca3af" },
};

function makeIcon(emoji: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:34px;height:34px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;">
      <span style="transform:rotate(45deg);font-size:15px;line-height:1;">${emoji}</span>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

// タブ内/動的読み込みでコンテナのサイズ確定前に描画されると地図が灰色になるため、
// マウント後にサイズを再計算する。
function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function MapView({ experiences }: Props) {
  return (
    <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" }}>
      <MapContainer
        center={[FUKUOKA_CENTER.lat, FUKUOKA_CENTER.lng]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "460px", width: "100%" }}
      >
        <MapResizeFix />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {experiences.filter((exp) => exp.category !== "その他").map((exp) => {
          const c = resolveCoord(exp.location, exp.id);
          const meta = CAT_META[exp.category] ?? CAT_META["その他"];
          const dateLabel = new Date(exp.date + "T00:00:00").toLocaleDateString("ja-JP", {
            month: "long", day: "numeric", weekday: "short",
          });
          return (
            <Marker key={exp.id} position={[c.lat, c.lng]} icon={makeIcon(meta.emoji, meta.color)}>
              <Popup>
                <div style={{ minWidth: "180px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700, color: meta.color, marginBottom: "4px" }}>
                    <span>{meta.emoji}</span><span>{exp.category}</span>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>{exp.title}</p>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 2px" }}>📅 {dateLabel} {exp.timeStart}〜</p>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px" }}>📍 {exp.location}</p>
                  <Link href={`/experiences/${exp.id}`}
                    style={{ display: "inline-block", fontSize: "12px", fontWeight: 700, color: "#fff", background: "#7B6BA8", padding: "6px 14px", borderRadius: "999px", textDecoration: "none" }}>
                    詳細を見る
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
