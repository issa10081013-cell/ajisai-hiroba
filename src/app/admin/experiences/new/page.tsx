"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const CATEGORIES = ["農業体験", "料理教室", "学習体験", "ものづくり", "自然体験", "その他"];

export default function NewExperiencePage() {
  const router = useRouter();
  const [providerId, setProviderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", date: "", timeStart: "", timeEnd: "",
    location: "", area: "", priceMember: "", priceRegular: "", capacity: "10",
    category: "農業体験", tags: "",
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { router.push("/admin/login"); return; }
      const { data: provider } = await supabaseBrowser
        .from("providers").select("id").eq("auth_user_id", user.id).single();
      if (provider) setProviderId(provider.id);
    };
    init();
  }, [router]);

  const f = (key: keyof typeof form, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerId) return;
    setLoading(true);

    const tags = form.tags.split("　").concat(form.tags.split(" ")).join(",").split(",").map(t => t.trim()).filter(Boolean);

    let imageUrl = "";
    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const fileName = `experiences/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabaseBrowser.storage
        .from("images")
        .upload(fileName, imageFile, { contentType: imageFile.type, upsert: false });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabaseBrowser.storage.from("images").getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabaseBrowser.from("experiences").insert({
      provider_id: providerId,
      title: form.title,
      description: form.description,
      date: form.date,
      time_start: form.timeStart,
      time_end: form.timeEnd,
      location: form.location,
      area: form.area || null,
      price_member: Number(form.priceMember) || 0,
      price_regular: Number(form.priceRegular) || 0,
      capacity: Number(form.capacity),
      current_bookings: 0,
      category: form.category,
      tags,
      is_featured: isFeatured,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    });

    setLoading(false);
    if (error) { alert("エラー: " + error.message); return; }
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F5F3FA]">
      <div className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#7B6BA8] text-sm bg-none border-none cursor-pointer">
            ← 戻る
          </button>
          <span className="font-bold text-[#222] text-sm">体験を追加する</span>
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Title */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-1.5">体験タイトル *</label>
            <input
              required
              value={form.title}
              onChange={e => f("title", e.target.value)}
              placeholder="例：糸島の夏野菜収穫体験"
              className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]"
            />
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-2">カテゴリ *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat} type="button" onClick={() => f("category", cat)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                    form.category === cat
                      ? "bg-[#7B6BA8] text-white border-[#7B6BA8]"
                      : "bg-white text-[#717171] border-[#DDDDDD] hover:border-[#7B6BA8]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-2">体験画像</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                  <img src={imagePreview} alt="プレビュー" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[12px] text-[#7B6BA8] font-medium cursor-pointer bg-none border-none"
                >
                  画像を変更する
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-[#DDDDDD] text-[#717171] hover:border-[#7B6BA8] hover:text-[#7B6BA8] hover:bg-[#F7F6FD] cursor-pointer transition-all"
              >
                <span style={{ fontSize: "28px" }}>📷</span>
                <span className="text-sm font-semibold">タップして画像を選択</span>
                <span className="text-[11px] text-[#AAAAAA]">JPG・PNG・HEICなど</span>
              </button>
            )}
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
            <div>
              <label className="text-[12px] text-[#717171] block mb-1.5">開催日 *</label>
              <input
                type="date" required value={form.date} onChange={e => f("date", e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[12px] text-[#717171] block mb-1.5">開始時間 *</label>
                <input
                  type="time" required value={form.timeStart} onChange={e => f("timeStart", e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#717171] block mb-1.5">終了時間 *</label>
                <input
                  type="time" required value={form.timeEnd} onChange={e => f("timeEnd", e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]"
                />
              </div>
            </div>
          </div>

          {/* Location & Area */}
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
            <div>
              <label className="text-[12px] text-[#717171] block mb-1.5">場所 *</label>
              <input
                required value={form.location} onChange={e => f("location", e.target.value)}
                placeholder="例：福岡県糸島市（詳細は予約後お知らせ）"
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#717171] block mb-1.5">エリア</label>
              <select
                value={form.area} onChange={e => f("area", e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8] bg-white"
              >
                <option value="">選択してください</option>
                <option>博多区</option>
                <option>中央区</option>
                <option>城南区</option>
                <option>南区</option>
                <option>早良区</option>
                <option>西区</option>
                <option>東区</option>
                <option>糸島市</option>
                <option>その他</option>
              </select>
            </div>
          </div>

          {/* Price & Capacity */}
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[12px] text-[#717171] block mb-1.5">会員価格（¥）</label>
                <input
                  type="number" min="0" value={form.priceMember} onChange={e => f("priceMember", e.target.value)}
                  placeholder="0（無料の場合）"
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#717171] block mb-1.5">一般価格（¥）</label>
                <input
                  type="number" min="0" value={form.priceRegular} onChange={e => f("priceRegular", e.target.value)}
                  placeholder="0"
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]"
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] text-[#717171] block mb-1.5">定員（人）</label>
              <input
                type="number" min="1" value={form.capacity} onChange={e => f("capacity", e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-1.5">体験の説明 *</label>
            <textarea
              required value={form.description} onChange={e => f("description", e.target.value)}
              rows={5} placeholder="体験の内容、持ち物、注意事項などを書いてください"
              className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none resize-vertical focus:border-[#7B6BA8]"
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-1.5">タグ（カンマ区切り）</label>
            <input
              value={form.tags} onChange={e => f("tags", e.target.value)}
              placeholder="例：糸島, 野菜, 小学生OK"
              className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]"
            />
          </div>

          {/* おすすめフラグ */}
          <label className="flex items-center gap-3 bg-white rounded-2xl p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              className="w-5 h-5 accent-[#7B6BA8]"
            />
            <div>
              <p className="text-sm font-bold text-[#1a1a1a] m-0">トップページに掲載する</p>
              <p className="text-xs text-[#9ca3af] m-0">チェックするとトップページの「注目の体験」に表示されます</p>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading || !providerId}
            className="bg-[#7B6BA8] text-white border-none rounded-2xl py-3.5 text-[15px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#6a5a96] transition-colors"
          >
            {loading ? "登録中..." : "体験を登録する"}
          </button>
        </form>
      </div>
    </div>
  );
}
