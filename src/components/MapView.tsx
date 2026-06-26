"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Link from "next/link";
import { Geolocation } from "@capacitor/geolocation";
import { Navigation } from "lucide-react";
import { Experience } from "@/lib/types";
import { FUKUOKA_CENTER, resolveCoord } from "@/lib/fukuoka-geo";
import { isNativeApp } from "@/lib/platform";

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

const USER_ICON = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 5px rgba(37,99,235,0.22);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

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

// 現在地が取れたら地図をそこへ移動する。
function FlyToUser({ pos }: { pos: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo([pos.lat, pos.lng], 13, { duration: 0.8 });
  }, [pos, map]);
  return null;
}

export default function MapView({ experiences }: Props) {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const handleLocate = async () => {
    setLocating(true);
    try {
      if (isNativeApp()) {
        // ネイティブ(iOS/Android)はCapacitorで権限要求→現在地取得
        const perm = await Geolocation.requestPermissions();
        if (perm.location === "denied") {
          alert("位置情報の利用が許可されていません。設定から許可してください。");
          return;
        }
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } else if (typeof navigator !== "undefined" && navigator.geolocation) {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (p) => { setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }); resolve(); },
            (e) => reject(e),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      } else {
        alert("この環境では位置情報を利用できません。");
      }
    } catch {
      alert("位置情報を取得できませんでした。");
    } finally {
      setLocating(false);
    }
  };

  return (
    <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" }}>
      <button
        onClick={handleLocate}
        disabled={locating}
        style={{ position: "absolute", top: "12px", right: "12px", zIndex: 1000, display: "flex", alignItems: "center", gap: "6px", background: "#fff", color: "#7B6BA8", border: "1px solid #e5e7eb", borderRadius: "999px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", cursor: locating ? "default" : "pointer", touchAction: "manipulation" }}
        aria-label="現在地から探す"
      >
        <Navigation size={14} />
        {locating ? "取得中…" : "現在地から探す"}
      </button>
      <MapContainer
        center={[FUKUOKA_CENTER.lat, FUKUOKA_CENTER.lng]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "460px", width: "100%" }}
      >
        <MapResizeFix />
        <FlyToUser pos={userPos} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPos && (
          <Marker position={[userPos.lat, userPos.lng]} icon={USER_ICON}>
            <Popup>現在地</Popup>
          </Marker>
        )}
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
