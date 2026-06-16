"use client";
import { useState, useEffect, use } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CAT_EMOJI: Record<string, string> = {
  "体験の感想": "🌟",
  "子育て相談": "💬",
  "一緒に行く人を探す": "🤝",
  "こんな体験してほしい": "💡",
};

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

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export default function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabaseBrowser.auth.getUser();
      if (u) {
        setUser({ id: u.id, name: u.user_metadata?.display_name ?? u.email?.split("@")[0] ?? "匿名" });
        const { data: like } = await supabaseBrowser.from("post_likes").select("id").eq("post_id", id).eq("user_id", u.id).single();
        if (like) setLiked(true);
      }

      const { data: p } = await supabaseBrowser.from("posts").select("*").eq("id", id).single();
      if (!p) { router.push("/board"); return; }
      setPost(p as Post);

      const { data: c } = await supabaseBrowser.from("post_comments").select("*").eq("post_id", id).order("created_at", { ascending: true });
      setComments((c ?? []) as Comment[]);
      setLoading(false);
    };
    init();
  }, [id, router]);

  const handleLike = async () => {
    if (!user || !post) return;
    if (liked) {
      await supabaseBrowser.from("post_likes").delete().eq("post_id", id).eq("user_id", user.id);
      await supabaseBrowser.from("posts").update({ likes_count: post.likes_count - 1 }).eq("id", id);
      setPost(p => p ? { ...p, likes_count: p.likes_count - 1 } : p);
      setLiked(false);
    } else {
      await supabaseBrowser.from("post_likes").insert({ post_id: id, user_id: user.id });
      await supabaseBrowser.from("posts").update({ likes_count: post.likes_count + 1 }).eq("id", id);
      setPost(p => p ? { ...p, likes_count: p.likes_count + 1 } : p);
      setLiked(true);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post) return;
    setPosting(true);
    const { data } = await supabaseBrowser.from("post_comments").insert({
      post_id: id,
      user_id: user.id,
      author_name: user.name,
      body: comment,
    }).select().single();
    await supabaseBrowser.from("posts").update({ comments_count: post.comments_count + 1 }).eq("id", id);
    if (data) {
      setComments(prev => [...prev, data as Comment]);
      setPost(p => p ? { ...p, comments_count: p.comments_count + 1 } : p);
    }
    setComment("");
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

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9ca3af", fontSize: "13px" }}>読み込み中...</p>
    </div>
  );
  if (!post) return null;

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 0" }}>
        <Link href="/board" style={{ fontSize: "12px", color: "#7B6BA8", fontWeight: 600, textDecoration: "none" }}>← 掲示板に戻る</Link>
      </div>

      {/* Post */}
      <div style={{ margin: "12px 16px 0", background: "white", borderRadius: "20px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", background: "#E8E4F5", color: "#7B6BA8", padding: "4px 12px", borderRadius: "20px", fontWeight: 700 }}>
            {CAT_EMOJI[post.category] ?? "📋"} {post.category}
          </span>
          <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>{timeAgo(post.created_at)}</span>
        </div>
        <h1 style={{ fontSize: "17px", fontWeight: 800, color: "#1a1a1a", margin: "0 0 14px", lineHeight: 1.4 }}>{post.title}</h1>
        <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.9, margin: "0 0 16px", whiteSpace: "pre-wrap" }}>{post.body}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>👤 {post.author_name}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <button onClick={handleLike} disabled={!user}
              style={{ display: "flex", alignItems: "center", gap: "4px", background: liked ? "#FFF0F0" : "#f9fafb", border: `1.5px solid ${liked ? "#fca5a5" : "#e5e7eb"}`, borderRadius: "20px", padding: "6px 14px", fontSize: "12px", fontWeight: 700, cursor: user ? "pointer" : "default", color: liked ? "#ef4444" : "#6b7280", touchAction: "manipulation" }}>
              {liked ? "❤️" : "🤍"} {post.likes_count}
            </button>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: "20px", padding: "6px 14px", fontSize: "12px", color: "#6b7280" }}>
              💬 {post.comments_count}
            </span>
          </div>
        </div>
        {!user && (
          <p style={{ fontSize: "11px", color: "#9ca3af", textAlign: "right", marginTop: "6px" }}>
            <Link href="/login" style={{ color: "#7B6BA8", fontWeight: 600 }}>ログイン</Link> するといいねができます
          </p>
        )}
      </div>

      {/* Comments */}
      <div style={{ margin: "16px 16px 0" }}>
        <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", margin: "0 0 10px" }}>コメント（{comments.length}）</p>
        {comments.length === 0 && (
          <p style={{ fontSize: "13px", color: "#9ca3af", padding: "20px 0", textAlign: "center" }}>まだコメントがありません。最初のコメントをどうぞ！</p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {comments.map(c => (
            <div key={c.id} style={{ background: "white", borderRadius: "16px", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>👤 {c.author_name}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>{timeAgo(c.created_at)}</span>
              </div>
              <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comment form */}
      <div style={{ margin: "16px 16px 0", background: "white", borderRadius: "16px", padding: "16px" }}>
        <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", margin: "0 0 10px" }}>コメントを書く</p>
        {!user ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "10px" }}>コメントするにはログインが必要です</p>
            <Link href={`/login?from=${encodeURIComponent(`/board/${id}`)}`}
              style={{ display: "inline-block", background: "#7B6BA8", color: "white", borderRadius: "10px", padding: "8px 24px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
              ログイン / 新規登録
            </Link>
          </div>
        ) : (
          <form onSubmit={handleComment} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <textarea required value={comment} onChange={e => setComment(e.target.value)}
              rows={3} placeholder="コメントを入力してください"
              style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", outline: "none", resize: "none", width: "100%", boxSizing: "border-box" }} />
            <button type="submit" disabled={posting}
              style={{ background: "#7B6BA8", color: "white", border: "none", borderRadius: "10px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", touchAction: "manipulation", opacity: posting ? 0.6 : 1 }}>
              {posting ? "送信中..." : "コメントする"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
