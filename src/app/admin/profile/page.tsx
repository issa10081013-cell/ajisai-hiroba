"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [providerId, setProviderId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", bio: "", location: "", instagram: "",
    yearsActive: "", totalParticipants: "", tags: "", imageUrl: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { router.push("/admin/login"); return; }

      const { data: provider } = await supabaseBrowser
        .from("providers").select("*").eq("auth_user_id", user.id).single();

      if (provider) {
        setProviderId(provider.id);
        setForm({
          name: provider.name ?? "",
          bio: provider.bio ?? "",
          location: provider.location ?? "",
          instagram: provider.instagram ?? "",
          yearsActive: provider.years_active?.toString() ?? "",
          totalParticipants: provider.total_participants?.toString() ?? "",
          tags: (provider.tags ?? []).join(", "),
          imageUrl: provider.image_url ?? "",
        });
        if (provider.image_url) setImagePreview(provider.image_url);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);

    let imageUrl = form.imageUrl;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const fileName = `providers/${providerId}/profile.${ext}`;
      const { data: uploadData, error: uploadError } = await supabaseBrowser.storage
        .from("images")
        .upload(fileName, imageFile, { contentType: imageFile.type, upsert: true });

      if (uploadError) {
        alert("画像のアップロードに失敗しました: " + uploadError.message);
        setSaving(false);
        return;
      }
      if (uploadData) {
        const { data: urlData } = supabaseBrowser.storage.from("images").getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabaseBrowser.from("providers").update({
      name: form.name,
      bio: form.bio,
      location: form.location,
      instagram: form.instagram,
      years_active: Number(form.yearsActive) || null,
      total_participants: Number(form.totalParticipants) || null,
      tags,
      image_url: imageUrl,
    }).eq("id", providerId);

    setSaving(false);
    if (error) {
      alert("保存に失敗しました: " + error.message);
      return;
    }
    router.push("/admin/dashboard");
  };

  const f = (key: keyof typeof form, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F5F3FA" }}>
      <p style={{ color: "#9ca3af" }}>読み込み中...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F3FA" }}>
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #f3f4f6", padding: "0 16px" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", height: "56px", display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#7B6BA8", cursor: "pointer", fontSize: "14px" }}>← 戻る</button>
          <span style={{ fontWeight: "bold", color: "#1a1a1a", fontSize: "14px" }}>プロフィール編集</span>
        </div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 16px" }}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Profile image */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "12px" }}>プロフィール写真</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ width: "72px", height: "72px", borderRadius: "50%", border: "2px dashed #d8d0ef", overflow: "hidden", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#F9F8FF" }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="プレビュー" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "28px" }}>📷</span>
                )}
              </div>
              <div>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{ background: "#F9F8FF", border: "1px solid #d8d0ef", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", color: "#7B6BA8", fontWeight: 600, cursor: "pointer" }}>
                  写真を選択
                </button>
                <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px", marginBottom: 0 }}>JPG・PNG・HEICなど</p>
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>名前・屋号 *</label>
              <input required value={form.name} onChange={e => f("name", e.target.value)}
                placeholder="例：田中農園 田中さん"
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>活動地域</label>
              <select value={form.location} onChange={e => f("location", e.target.value)}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box", backgroundColor: "white" }}>
                <option value="">選択してください</option>
                <option value="城南区">福岡市 城南区</option>
                <option value="早良区">福岡市 早良区</option>
                <option value="中央区">福岡市 中央区</option>
                <option value="南区">福岡市 南区</option>
                <option value="西区">福岡市 西区</option>
                <option value="東区">福岡市 東区</option>
                <option value="博多区">福岡市 博多区</option>
                <option value="糸島市">糸島市</option>
                <option value="その他">その他（福岡市外）</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>Instagram（任意）</label>
              <input value={form.instagram} onChange={e => f("instagram", e.target.value)}
                placeholder="@example"
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>経験年数</label>
              <input type="number" min="0" value={form.yearsActive} onChange={e => f("yearsActive", e.target.value)}
                placeholder="20"
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>累計参加者数</label>
              <input type="number" min="0" value={form.totalParticipants} onChange={e => f("totalParticipants", e.target.value)}
                placeholder="100"
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Bio */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>自己紹介</label>
            <textarea value={form.bio} onChange={e => f("bio", e.target.value)}
              rows={4} placeholder="あなたの活動・想いを教えてください"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>

          {/* Tags */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>タグ（カンマ区切り）</label>
            <input value={form.tags} onChange={e => f("tags", e.target.value)}
              placeholder="例：無農薬, 糸島, 収穫体験"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <button type="submit" disabled={saving}
            style={{ backgroundColor: "#7B6BA8", color: "white", border: "none", borderRadius: "14px", padding: "14px", fontSize: "15px", fontWeight: "bold", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "保存中..." : "保存する"}
          </button>
        </form>
      </div>
    </div>
  );
}
