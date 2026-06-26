"use client";
import { Share2 } from "lucide-react";
import { Share } from "@capacitor/share";
import { isNativeApp } from "@/lib/platform";

// ネイティブ共有ボタン。
// アプリ(iOS/Android)ではCapacitorのネイティブ共有シートを開き、
// ブラウザではWeb Share API、非対応環境ではURLをクリップボードにコピーする。
// App Storeガイドライン4.2対策として「Webサイトにない実機能」を持たせる狙いも兼ねる。
export default function ShareButton({ title, url }: { title: string; url: string }) {
  const handleShare = async () => {
    try {
      if (isNativeApp()) {
        await Share.share({ title, text: title, url, dialogTitle: "体験をシェア" });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text: title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      alert("リンクをコピーしました");
    } catch {
      // ユーザーがキャンセルした場合などは何もしない
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{ display: "flex", alignItems: "center", gap: "5px", background: "#7B6BA8", color: "white", border: "none", borderRadius: "999px", padding: "5px 12px", fontSize: "11px", fontWeight: 700, cursor: "pointer", flexShrink: 0, touchAction: "manipulation" }}
      aria-label="この体験をシェア"
    >
      <Share2 size={13} />
      シェア
    </button>
  );
}
