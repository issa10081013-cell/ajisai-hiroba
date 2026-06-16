"use client";
import { useState } from "react";

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const runSeed = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "エラー");
      setStatus("done");
      setMessage(data.message ?? "完了");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "不明なエラー");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FA] flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
        <p className="text-3xl mb-4">🌱</p>
        <h1 className="text-lg font-bold text-[#222] mb-2">サンプルデータを追加</h1>
        <p className="text-sm text-[#717171] mb-6 leading-relaxed">
          LPに表示するサンプルの体験データ（4件）を<br />Supabaseに追加します。
        </p>

        {status === "done" && (
          <div className="bg-green-50 text-green-700 rounded-xl p-3 mb-4 text-sm font-medium">
            ✅ {message}
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-4 text-sm font-medium">
            ❌ {message}
          </div>
        )}

        <button
          onClick={runSeed}
          disabled={status === "loading" || status === "done"}
          className="w-full bg-[#7B6BA8] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6a5a96] transition-colors"
        >
          {status === "loading" ? "追加中..." : status === "done" ? "追加済み" : "サンプルデータを追加する"}
        </button>

        {status === "done" && (
          <a href="/" className="block mt-4 text-sm text-[#7B6BA8] font-medium underline">
            トップページで確認する →
          </a>
        )}
      </div>
    </div>
  );
}
