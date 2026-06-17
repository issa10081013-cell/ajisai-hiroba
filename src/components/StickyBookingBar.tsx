"use client";
import { useEffect, useState, useRef } from "react";

export default function StickyBookingBar({ isFull, title }: { isFull: boolean; title: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const booking = document.getElementById("booking-section");
    if (!booking) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(booking);
    return () => observer.disconnect();
  }, []);

  if (isFull || !visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "64px",
      left: 0,
      right: 0,
      zIndex: 50,
      padding: "12px 16px",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(8px)",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      maxWidth: "680px",
      margin: "0 auto",
    }}>
      <p style={{ flex: 1, fontSize: "12px", color: "#374151", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {title}
      </p>
      <a
        href="#booking-section"
        style={{
          flexShrink: 0,
          background: "linear-gradient(135deg, #2d5a3f, #4A7A5C)",
          color: "white",
          borderRadius: "20px",
          padding: "10px 24px",
          fontSize: "13px",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        予約する
      </a>
    </div>
  );
}
