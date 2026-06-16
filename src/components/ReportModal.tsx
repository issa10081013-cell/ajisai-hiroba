"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const REASONS = ["スパム・宣伝", "不適切な内容", "個人情報が含まれている", "嫌がらせ・誹謗中傷", "その他"];

type Props = {
  targetType: "post" | "comment" | "review";
  targetId: string;
  reporterId: string;
  onClose: () => void;
};

export default function ReportModal({ targetType, targetId, reporterId, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    await supabaseBrowser.from("reports").insert({
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      reason,
    });
    setLoading(false);
    setDone(true);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: "480px" }}
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ fontSize: "32px", marginBottom: "10px" }}>✅</p>
            <p style={{ fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>通報しました</p>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "20px" }}>ご協力ありがとうございます。内容を確認いたします。</p>
            <button onClick={onClose} style={{ background: "#7B6BA8", color: "white", border: "none", borderRadius: "10px", padding: "10px 32px", fontWeight: 700, fontSize: "13px", cursor: "pointer", touchAction: "manipulation" }}>
              閉じる
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontWeight: 700, fontSize: "15px", color: "#1a1a1a", margin: "0 0 4px" }}>通報する</p>
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 16px" }}>該当する理由を選んでください</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  style={{ padding: "12px 14px", borderRadius: "12px", border: `1.5px solid ${reason === r ? "#7B6BA8" : "#e5e7eb"}`, background: reason === r ? "#F5F3FB" : "white", color: reason === r ? "#7B6BA8" : "#374151", fontWeight: reason === r ? 700 : 400, fontSize: "13px", textAlign: "left", cursor: "pointer", touchAction: "manipulation" }}>
                  {reason === r ? "✓ " : ""}{r}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={onClose}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", color: "#6b7280", fontWeight: 600, fontSize: "13px", cursor: "pointer", touchAction: "manipulation" }}>
                キャンセル
              </button>
              <button onClick={handleSubmit} disabled={!reason || loading}
                style={{ flex: 2, padding: "11px", borderRadius: "10px", border: "none", background: "#ef4444", color: "white", fontWeight: 700, fontSize: "13px", cursor: "pointer", touchAction: "manipulation", opacity: !reason || loading ? 0.5 : 1 }}>
                {loading ? "送信中..." : "通報する"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
