"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const CATEGORIES = ["農業体験", "料理教室", "学習体験", "ものづくり", "自然体験", "その他"];
const AGE_OPTIONS = ["幼児（3〜5歳）", "小学校低学年（6〜8歳）", "小学校高学年（9〜12歳）", "中学生以上", "全年齢OK"];

export default function EditExperiencePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "", description: "", date: "", timeStart: "", timeEnd: "",
    location: "", area: "", priceMember: "", priceRegular: "", priceUnit: "household", capacity: "10",
    category: "農業体験", tags: "", imageUrl: "",
  });
  const [ageTags, setAgeTags] = useState<string[]>([]);

  const toggleAge = (a: string) =>
    setAgeTags(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]));

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { router.push("/admin/login"); return; }

      const { data: exp } = await supabaseBrowser
        .from("experiences").select("*").eq("id", id).single();

      if (!exp) { router.push("/admin/dashboard"); return; }

      setForm({
        title: exp.title ?? "",
        description: exp.description ?? "",
        date: exp.date ?? "",
        timeStart: exp.time_start ?? "",
        timeEnd: exp.time_end ?? "",
        location: exp.location ?? "",
        area: exp.area ?? "",
        priceMember: exp.price_member?.toString() ?? "0",
        priceRegular: exp.price_regular?.toString() ?? "0",
        priceUnit: exp.price_unit ?? "household",
        capacity: exp.capacity?.toString() ?? "10",
        category: exp.category ?? "農業体験",
        tags: (exp.tags ?? []).join(", "),
        imageUrl: exp.image_url ?? "",
      });
      setAgeTags((exp.age_tags as string[] | undefined) ?? []);
      if (exp.image_url) setImagePreview(exp.image_url);
      setInitializing(false);
    };
    init();
  }, [id, router]);

  const f = (key: keyof typeof form, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);

    let imageUrl = form.imageUrl;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const fileName = `experiences/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabaseBrowser.storage
        .from("images")
        .upload(fileName, imageFile, { contentType: imageFile.type, upsert: false });
      if (uploadError) {
        alert("画像のアップロードに失敗しました: " + uploadError.message);
        setLoading(false);
        return;
      }
      if (uploadData) {
        const { data: urlData } = supabaseBrowser.storage.from("images").getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabaseBrowser.from("experiences").update({
      title: form.title,
      description: form.description,
      date: form.date,
      time_start: form.timeStart,
      time_end: form.timeEnd,
      location: form.location,
      area: form.area || null,
      price_member: Number(form.priceMember) || 0,
      price_regular: Number(form.priceRegular) || 0,
      price_unit: form.priceUnit,
      capacity: Number(form.capacity),
      category: form.category,
      tags,
      age_tags: ageTags,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    }).eq("id", id);

    setLoading(false);
    if (error) { alert("エラー: " + error.message); return; }
    router.push("/admin/dashboard");
  };

  if (initializing) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F5F3FA" }}>
      <p style={{ color: "#9ca3af" }}>読み込み中...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F3FA]">
      <div className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#7B6BA8] text-sm bg-none border-none cursor-pointer">← 戻る</button>
          <span className="font-bold text-[#222] text-sm">体験を編集</span>
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-1.5">体験タイトル *</label>
            <input required value={form.title} onChange={e => f("title", e.target.value)}
              className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]" />
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-2">体験画像</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                  <img src={imagePreview} alt="プレビュー" className="w-full h-full object-cover" />
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="text-[12px] text-[#7B6BA8] font-medium cursor-pointer bg-none border-none">
                  画像を変更する
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-[#DDDDDD] text-[#717171] hover:border-[#7B6BA8] hover:text-[#7B6BA8] hover:bg-[#F7F6FD] cursor-pointer transition-all">
                <span style={{ fontSize: "28px" }}>📷</span>
                <span className="text-sm font-semibold">タップして画像を選択</span>
                <span className="text-[11px] text-[#AAAAAA]">JPG・PNG・HEICなど</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-2">カテゴリ *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => f("category", cat)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                    form.category === cat ? "bg-[#7B6BA8] text-white border-[#7B6BA8]" : "bg-white text-[#717171] border-[#DDDDDD]"
                  }`}>{cat}</button>
              ))}
            </div>
          </div>

          {/* 対象年齢 */}
          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-2">対象年齢（複数選択OK）</label>
            <div className="flex flex-wrap gap-2">
              {AGE_OPTIONS.map(age => (
                <button
                  key={age} type="button" onClick={() => toggleAge(age)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                    ageTags.includes(age)
                      ? "bg-[#7B6BA8] text-white border-[#7B6BA8]"
                      : "bg-white text-[#717171] border-[#DDDDDD] hover:border-[#7B6BA8]"
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
            <div>
              <label className="text-[12px] text-[#717171] block mb-1.5">開催日 *</label>
              <input type="date" required value={form.date} onChange={e => f("date", e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[12px] text-[#717171] block mb-1.5">開始時間 *</label>
                <input type="time" required value={form.timeStart} onChange={e => f("timeStart", e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]" />
              </div>
              <div>
                <label className="text-[12px] text-[#717171] block mb-1.5">終了時間 *</label>
                <input type="time" required value={form.timeEnd} onChange={e => f("timeEnd", e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
            <div>
              <label className="text-[12px] text-[#717171] block mb-1.5">場所 *</label>
              <input required value={form.location} onChange={e => f("location", e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]" />
            </div>
            <div>
              <label className="text-[12px] text-[#717171] block mb-1.5">エリア</label>
              <select value={form.area} onChange={e => f("area", e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8] bg-white">
                <option value="">選択してください</option>
                <optgroup label="福岡市">
                  <option>東区</option>
                  <option>博多区</option>
                  <option>中央区</option>
                  <option>南区</option>
                  <option>城南区</option>
                  <option>早良区</option>
                  <option>西区</option>
                </optgroup>
                <optgroup label="近郊・その他の市">
                  <option>春日市</option>
                  <option>大野城市</option>
                  <option>筑紫野市</option>
                  <option>太宰府市</option>
                  <option>那珂川市</option>
                  <option>宗像市</option>
                  <option>古賀市</option>
                  <option>福津市</option>
                  <option>糸島市</option>
                </optgroup>
                <optgroup label="北九州市">
                  <option>門司区</option>
                  <option>小倉北区</option>
                  <option>小倉南区</option>
                  <option>若松区</option>
                  <option>八幡東区</option>
                  <option>八幡西区</option>
                  <option>戸畑区</option>
                </optgroup>
                <option>その他</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[12px] text-[#717171] block mb-1.5">会員価格（¥）</label>
                <input type="number" min="0" value={form.priceMember} onChange={e => f("priceMember", e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]" />
              </div>
              <div>
                <label className="text-[12px] text-[#717171] block mb-1.5">一般価格（¥）</label>
                <input type="number" min="0" value={form.priceRegular} onChange={e => f("priceRegular", e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]" />
              </div>
            </div>
            <div>
              <label className="text-[12px] text-[#717171] block mb-1.5">料金のかけ方</label>
              <select value={form.priceUnit} onChange={e => f("priceUnit", e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]">
                <option value="household">1組（世帯）あたり ※人数で増えない</option>
                <option value="person">1人あたり（大人＋子ども）</option>
                <option value="child">子ども1人あたり</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] text-[#717171] block mb-1.5">定員（人）</label>
              <input type="number" min="1" value={form.capacity} onChange={e => f("capacity", e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-1.5">体験の説明 *</label>
            <textarea required value={form.description} onChange={e => f("description", e.target.value)}
              rows={5} className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none resize-vertical focus:border-[#7B6BA8]" />
          </div>

          <div className="bg-white rounded-2xl p-4">
            <label className="text-[12px] text-[#717171] block mb-1.5">タグ（カンマ区切り）</label>
            <input value={form.tags} onChange={e => f("tags", e.target.value)}
              className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7B6BA8]" />
          </div>

          <button type="submit" disabled={loading}
            className="bg-[#7B6BA8] text-white border-none rounded-2xl py-3.5 text-[15px] font-bold cursor-pointer disabled:opacity-60">
            {loading ? "保存中..." : "変更を保存する"}
          </button>
        </form>
      </div>
    </div>
  );
}
