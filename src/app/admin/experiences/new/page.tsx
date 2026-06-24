"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const CATEGORIES = ["農業体験", "料理教室", "学習体験", "ものづくり", "自然体験", "その他"];
const AGE_OPTIONS = ["幼児（3〜5歳）", "小学校低学年（6〜8歳）", "小学校高学年（9〜12歳）", "中学生以上", "全年齢OK"];
const DRAFT_KEY = "ajisai_exp_draft_v1";

const EMPTY_FORM = {
  title: "", description: "", date: "", timeStart: "", timeEnd: "",
  location: "", area: "", priceMember: "", priceRegular: "", priceUnit: "household", capacity: "10",
  category: "農業体験", tags: "",
};

type DraftData = {
  form: typeof EMPTY_FORM;
  ageTags: string[];
  isFeatured: boolean;
  copiedImageUrl: string;
  savedAt: string;
};

export default function NewExperiencePage() {
  const router = useRouter();
  const [providerId, setProviderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isFeatured, setIsFeatured] = useState(false);
  const [ageTags, setAgeTags] = useState<string[]>([]);
  const [copiedImageUrl, setCopiedImageUrl] = useState("");
  const [pendingDraft, setPendingDraft] = useState<DraftData | null>(null);
  const [autosaveReady, setAutosaveReady] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAge = (a: string) =>
    setAgeTags(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]));

  // 初期化：ログイン確認 → 複製元の読み込み（?from=）or 下書きの検出
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { router.push("/admin/login"); return; }
      const { data: provider } = await supabaseBrowser
        .from("providers").select("id").eq("auth_user_id", user.id).single();
      if (!provider) { setAutosaveReady(true); return; }
      setProviderId(provider.id);

      const fromId = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("from")
        : null;

      if (fromId) {
        // 複製：元の体験を読み込んでフォームに反映。開催日だけ空にして入れ直してもらう
        const { data: src } = await supabaseBrowser
          .from("experiences").select("*").eq("id", fromId).single();
        if (src) {
          setForm({
            title: src.title ?? "",
            description: src.description ?? "",
            date: "",
            timeStart: src.time_start ?? "",
            timeEnd: src.time_end ?? "",
            location: src.location ?? "",
            area: src.area ?? "",
            priceMember: src.price_member != null ? String(src.price_member) : "",
            priceRegular: src.price_regular != null ? String(src.price_regular) : "",
            priceUnit: src.price_unit ?? "household",
            capacity: src.capacity != null ? String(src.capacity) : "10",
            category: src.category ?? "農業体験",
            tags: Array.isArray(src.tags) ? src.tags.join(", ") : "",
          });
          setAgeTags(Array.isArray(src.age_tags) ? src.age_tags : []);
          setIsFeatured(false);
          if (src.image_url) { setCopiedImageUrl(src.image_url); setImagePreview(src.image_url); }
          setIsDuplicate(true);
        }
        setAutosaveReady(true);
        return;
      }

      // 下書きの検出（あればバナー表示。解決するまで自動保存は止めてクロバーを防ぐ）
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const d = JSON.parse(raw) as DraftData;
          if (d && d.form) { setPendingDraft(d); return; }
        }
      } catch {}
      setAutosaveReady(true);
    };
    init();
  }, [router]);

  // 入力内容を端末に自動保存（下書き）
  useEffect(() => {
    if (!autosaveReady) return;
    const isEmpty = !form.title && !form.description && !form.location && !form.date
      && ageTags.length === 0 && !copiedImageUrl;
    try {
      if (isEmpty) {
        localStorage.removeItem(DRAFT_KEY);
        setDraftSavedAt(null);
      } else {
        const data: DraftData = { form, ageTags, isFeatured, copiedImageUrl, savedAt: new Date().toISOString() };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        setDraftSavedAt(data.savedAt);
      }
    } catch {}
  }, [autosaveReady, form, ageTags, isFeatured, copiedImageUrl]);

  const restoreDraft = () => {
    if (!pendingDraft) return;
    setForm({ ...EMPTY_FORM, ...pendingDraft.form });
    setAgeTags(pendingDraft.ageTags ?? []);
    setIsFeatured(pendingDraft.isFeatured ?? false);
    if (pendingDraft.copiedImageUrl) { setCopiedImageUrl(pendingDraft.copiedImageUrl); setImagePreview(pendingDraft.copiedImageUrl); }
    setPendingDraft(null);
    setAutosaveReady(true);
  };

  const discardDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setPendingDraft(null);
    setAutosaveReady(true);
  };

  const saveDraftManually = () => {
    try {
      const data: DraftData = { form, ageTags, isFeatured, copiedImageUrl, savedAt: new Date().toISOString() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      setDraftSavedAt(data.savedAt);
      alert("下書きを保存しました。あとでこのページに戻ると続きから入力できます。");
    } catch {
      alert("下書きの保存に失敗しました");
    }
  };

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
    // 新しい画像が無ければ、複製元/下書きの画像URLをそのまま使う
    const finalImageUrl = imageUrl || copiedImageUrl;

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
      price_unit: form.priceUnit,
      capacity: Number(form.capacity),
      current_bookings: 0,
      category: form.category,
      tags,
      age_tags: ageTags,
      is_featured: isFeatured,
      ...(finalImageUrl ? { image_url: finalImageUrl } : {}),
    });

    setLoading(false);
    if (error) { alert("エラー: " + error.message); return; }
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F5F3FA]">
      <div className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#7B6BA8] text-sm bg-none border-none cursor-pointer">
            ← 戻る
          </button>
          <span className="font-bold text-[#222] text-sm">{isDuplicate ? "体験を複製して追加" : "体験を追加する"}</span>
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-6">
        {/* 下書き復元バナー */}
        {pendingDraft && (
          <div className="bg-[#FFF8F0] border border-[#FED7AA] rounded-2xl p-4 mb-4">
            <p className="text-sm font-bold text-[#92400E] m-0 mb-1">📝 前回の下書きがあります</p>
            <p className="text-[12px] text-[#92400E] leading-relaxed m-0 mb-3">
              「{pendingDraft.form.title || "（タイトル未入力）"}」
              {pendingDraft.savedAt ? `／${new Date(pendingDraft.savedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} 保存` : ""}
              <br />続きから入力しますか？
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={restoreDraft}
                className="px-4 py-2 rounded-lg bg-[#7B6BA8] text-white text-[12px] font-bold cursor-pointer border-none">
                復元する
              </button>
              <button type="button" onClick={discardDraft}
                className="px-4 py-2 rounded-lg bg-white text-[#92400E] text-[12px] font-bold cursor-pointer border border-[#FED7AA]">
                破棄して新規
              </button>
            </div>
          </div>
        )}

        {/* 複製の案内 */}
        {isDuplicate && (
          <div className="bg-[#F0F7F2] border border-[#BFE0CC] rounded-2xl p-4 mb-4">
            <p className="text-[12px] text-[#2F6B45] leading-relaxed m-0">
              ✅ 元の体験の内容を読み込みました。<strong>開催日</strong>を入れ直して登録してください（画像・時間・料金などはそのままコピーされています）。
            </p>
          </div>
        )}

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

          {/* 下書き保存 */}
          <button
            type="button"
            onClick={saveDraftManually}
            className="bg-white text-[#7B6BA8] border border-[#D8D0EF] rounded-2xl py-3 text-[13px] font-bold cursor-pointer hover:bg-[#F7F6FD] transition-colors"
          >
            下書きとして保存する
          </button>
          <p className="text-[11px] text-[#9ca3af] text-center m-0 -mt-1">
            {draftSavedAt
              ? `入力内容はこの端末に自動保存されています（${new Date(draftSavedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}）。途中で閉じても、このページに戻れば続きから入力できます。`
              : "入力を始めると、この端末に自動で下書き保存されます（途中で閉じても続きから入力できます）。"}
            <br />※画像は端末保存に含まれないため、復元後にもう一度選び直してください。
          </p>
        </form>
      </div>
    </div>
  );
}
