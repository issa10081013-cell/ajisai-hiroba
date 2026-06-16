"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Check, Copy } from "lucide-react";

const TARGETS = [
  { key: "hero",    label: "ヒーロー画像（トップ）" },
  { key: "農業体験", label: "農業体験" },
  { key: "料理教室", label: "料理教室" },
  { key: "学習体験", label: "学習体験" },
  { key: "ものづくり", label: "ものづくり" },
  { key: "自然体験", label: "自然体験" },
  { key: "その他",   label: "その他" },
];

type ImageState = {
  status: "idle" | "generating" | "done" | "error";
  src?: string;   // data URL or public URL
  publicUrl?: string;
  error?: string;
};

export default function GenerateImagesPage() {
  const router = useRouter();
  const [images, setImages] = useState<Record<string, ImageState>>(
    Object.fromEntries(TARGETS.map(t => [t.key, { status: "idle" }]))
  );
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async (category: string) => {
    setImages(prev => ({ ...prev, [category]: { status: "generating" } }));

    try {
      const res = await fetch("/api/generate-category-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成失敗");

      const src = data.publicUrl ?? `data:${data.mimeType};base64,${data.base64}`;
      setImages(prev => ({
        ...prev,
        [category]: { status: "done", src, publicUrl: data.publicUrl ?? undefined },
      }));
    } catch (err) {
      setImages(prev => ({
        ...prev,
        [category]: { status: "error", error: err instanceof Error ? err.message : "エラー" },
      }));
    }
  };

  const generateAll = () => TARGETS.forEach(t => generate(t.key));

  const copyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F3FA]">
      <div className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[960px] mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#7B6BA8] text-sm cursor-pointer bg-none border-none">
            ← 戻る
          </button>
          <span className="font-bold text-[#222] text-sm">サイト画像を生成（AI）</span>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-5 mb-6">
          <p className="text-sm text-[#717171] mb-4">
            GeminiのAIが福岡らしい商店街・子供の画像を各カテゴリ分生成します。<br />
            生成後、URLをコピーしてコードに貼り付けるか、Supabase Storageに自動保存されます。
          </p>
          <button
            onClick={generateAll}
            className="flex items-center gap-2 bg-[#7B6BA8] text-white px-5 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:bg-[#6a5a96] transition-colors"
          >
            <Sparkles size={15} />
            全カテゴリ一括生成（7枚）
          </button>
          <p className="text-[11px] text-[#AAAAAA] mt-2">※ 1枚あたり15〜30秒かかります</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TARGETS.map(target => {
            const state = images[target.key];
            return (
              <div key={target.key} className="bg-white rounded-2xl overflow-hidden">
                {/* Preview area */}
                <div className="relative aspect-[4/3] bg-[#F3F4F6] flex items-center justify-center">
                  {state.status === "done" && state.src ? (
                    <img src={state.src} alt={target.label} className="w-full h-full object-cover" />
                  ) : state.status === "generating" ? (
                    <div className="flex flex-col items-center gap-2 text-[#7B6BA8]">
                      <Loader2 size={28} className="animate-spin" />
                      <p className="text-xs font-medium">生成中...</p>
                    </div>
                  ) : state.status === "error" ? (
                    <div className="text-center px-4">
                      <p className="text-xs text-red-500 font-medium mb-1">エラー</p>
                      <p className="text-[10px] text-[#717171]">{state.error}</p>
                    </div>
                  ) : (
                    <div className="text-[#AAAAAA] text-center">
                      <p className="text-3xl mb-1">🖼</p>
                      <p className="text-xs">未生成</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm font-semibold text-[#222] mb-3">{target.label}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => generate(target.key)}
                      disabled={state.status === "generating"}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F7F6FD] text-[#7B6BA8] text-xs font-semibold cursor-pointer hover:bg-[#EDE9F8] transition-colors disabled:opacity-50"
                    >
                      {state.status === "generating" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Sparkles size={12} />
                      )}
                      {state.status === "done" ? "再生成" : "生成"}
                    </button>

                    {state.publicUrl && (
                      <button
                        onClick={() => copyUrl(state.publicUrl!, target.key)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DDDDDD] text-xs font-medium text-[#717171] cursor-pointer hover:border-[#7B6BA8] transition-colors"
                      >
                        {copied === target.key ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                        URL
                      </button>
                    )}
                  </div>

                  {state.publicUrl && (
                    <p className="text-[10px] text-emerald-600 mt-2 font-medium flex items-center gap-1">
                      <Check size={10} /> Supabaseに保存済み
                    </p>
                  )}
                  {state.status === "done" && !state.publicUrl && (
                    <p className="text-[10px] text-orange-500 mt-2">
                      ⚠ Storage未設定 — プレビューのみ
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
