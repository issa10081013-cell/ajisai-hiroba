"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

const CATS = [
  { key: "全て", emoji: "📋" },
  { key: "体験の感想", emoji: "🌟" },
  { key: "子育て相談", emoji: "💬" },
  { key: "一緒に行く人を探す", emoji: "🤝" },
  { key: "こんな体験してほしい", emoji: "💡" },
];

type Post = {
  id: string;
  author_name: string;
  category: string;
  title: string;
  body: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cat, setCat] = useState("全て");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "体験の感想" });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ id: u.id, name: u.user_metadata?.display_name ?? u.email?.split("@")[0] ?? "匿名" });
    });
    fetchPosts();
  }, []);

  const fetchPosts = async (category?: string) => {
    setLoading(true);
    let q = supabaseBrowser.from("posts").select("*").order("created_at", { ascending: false });
    if (category && category !== "全て") q = q.eq("category", category);
    const { data } = await q;
    setPosts(data ?? []);
    setLoading(false);
  };

  const handleCat = (c: string) => {
    setCat(c);
    fetchPosts(c);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPosting(true);
    const { data } = await supabaseBrowser.from("posts").insert({
      user_id: user.id,
      author_name: user.name,
      title: form.title,
      body: form.body,
      category: form.category,
    }).select().single();
    if (data) setPosts(prev => [data as Post, ...prev]);
    setForm({ title: "", body: "", category: "体験の感想" });
    setShowForm(false);
    setPosting(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "たった今";
    if (m < 60) return `${m}分前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}時間前`;
    return `${Math.floor(h / 24)}日前`;
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>保護者掲示板</h1>
          {user ? (
            <button onClick={() => setShowForm(v => !v)}
              style={{ background: "#7B6BA8", color: "white", border: "none", borderRadius: "20px", padding: "8px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer", touchAction: "manipulation" }}>
              ＋ 投稿する
            </button>
          ) : (
            <Link href="/login" style={{ background: "#7B6BA8", color: "white", borderRadius: "20px", padding: "8px 18px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
              ログインして投稿
            </Link>
          )}
        </div>
        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 16px" }}>悩みや体験談をシェアして、つながろう</p>
      </div>

      {/* 投稿フォーム */}
      {showForm && (
        <div style={{ margin: "0 16px 16px", background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {CATS.filter(c => c.key !== "全て").map(c => (
                <button key={c.key} type="button" onClick={() => setForm(f => ({ ...f, category: c.key }))}
                  style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, cursor: "pointer", touchAction: "manipulation", border: "1.5px solid", borderColor: form.category === c.key ? "#7B6BA8" : "#e5e7eb", background: form.category === c.key ? "#7B6BA8" : "white", color: form.category === c.key ? "white" : "#6b7280" }}>
                  {c.emoji} {c.key}
                </button>
              ))}
            </div>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="タイトル"
              style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }} />
            <textarea required value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              rows={4} placeholder="内容を書いてください。悩み・体験談・募集など何でもOKです。"
              style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", outline: "none", resize: "none", width: "100%", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", color: "#6b7280", fontSize: "13px", fontWeight: 600, cursor: "pointer", touchAction: "manipulation" }}>
                キャンセル
              </button>
              <button type="submit" disabled={posting}
                style={{ flex: 2, padding: "10px", borderRadius: "10px", border: "none", background: "#7B6BA8", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer", touchAction: "manipulation", opacity: posting ? 0.6 : 1 }}>
                {posting ? "投稿中..." : "投稿する"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* カテゴリフィルター */}
      <div style={{ display: "flex", overflowX: "auto", gap: "8px", padding: "0 16px 12px", scrollbarWidth: "none" }}>
        {CATS.map(c => (
          <button key={c.key} onClick={() => handleCat(c.key)}
            style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, cursor: "pointer", touchAction: "manipulation", border: "1.5px solid", borderColor: cat === c.key ? "#7B6BA8" : "#e5e7eb", background: cat === c.key ? "#7B6BA8" : "white", color: cat === c.key ? "white" : "#6b7280" }}>
            {c.emoji} {c.key}
          </button>
        ))}
      </div>

      {/* 投稿一覧 */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0", fontSize: "13px" }}>読み込み中...</p>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "32px", marginBottom: "12px" }}>📝</p>
            <p style={{ fontWeight: 600, color: "#374151", marginBottom: "6px" }}>まだ投稿がありません</p>
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>最初の投稿をしてみましょう！</p>
          </div>
        ) : posts.map(post => (
          <Link key={post.id} href={`/board/${post.id}`} style={{ textDecoration: "none" }}>
            <div style={{ background: "white", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", background: "#E8E4F5", color: "#7B6BA8", padding: "3px 10px", borderRadius: "20px", fontWeight: 700 }}>
                  {CATS.find(c => c.key === post.category)?.emoji} {post.category}
                </span>
                <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>{timeAgo(post.created_at)}</span>
              </div>
              <p style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "14px", margin: "0 0 6px" }}>{post.title}</p>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {post.body}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>👤 {post.author_name}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>❤️ {post.likes_count}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>💬 {post.comments_count}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
