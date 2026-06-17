import { getProviderById, getExperiencesByProviderId, getReviewsByProviderId } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Leaf, ChefHat, BookOpen, Scissors, TreePine, Sparkles } from "lucide-react";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

const CAT_GRADIENT: Record<string, { gradient: string; Icon: React.ElementType }> = {
  "農業体験":  { gradient: "linear-gradient(135deg, #bbf7d0, #4ade80, #16a34a)", Icon: Leaf },
  "料理教室":  { gradient: "linear-gradient(135deg, #fed7aa, #fb923c, #c2410c)", Icon: ChefHat },
  "学習体験":  { gradient: "linear-gradient(135deg, #bfdbfe, #60a5fa, #1d4ed8)", Icon: BookOpen },
  "ものづくり": { gradient: "linear-gradient(135deg, #fbcfe8, #f472b6, #be185d)", Icon: Scissors },
  "自然体験":  { gradient: "linear-gradient(135deg, #a7f3d0, #34d399, #059669)", Icon: TreePine },
  "その他":    { gradient: "linear-gradient(135deg, #e5e7eb, #9ca3af, #4b5563)", Icon: Sparkles },
};

export default async function ProviderProfilePage({ params }: Props) {
  const { id } = await params;
  const [provider, experiences, reviews] = await Promise.all([
    getProviderById(id),
    getExperiencesByProviderId(id),
    getReviewsByProviderId(id),
  ]);

  if (!provider) notFound();

  const today = new Date().toISOString().split("T")[0];
  const upcoming = experiences.filter(e => e.date >= today);
  const past = experiences.filter(e => e.date < today);

  const avgRating = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10
    : null;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 0 60px", backgroundColor: "#FAFAF9", minHeight: "100vh" }}>

      {/* Back */}
      <div style={{ padding: "16px 16px 0" }}>
        <Link href="/" style={{ fontSize: "12px", color: "#7B6BA8", fontWeight: 600, textDecoration: "none" }}>← 体験一覧に戻る</Link>
      </div>

      {/* Profile header */}
      <div style={{ margin: "12px 16px 0", background: "white", borderRadius: "20px", padding: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px" }}>
          <img
            src={provider.imageUrl || `https://i.pravatar.cc/120?u=${provider.id}`}
            alt={provider.name}
            style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "3px solid #E8E4F5" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 2px" }}>
              <p style={{ fontWeight: 800, fontSize: "18px", color: "#1a1a1a", margin: 0 }}>{provider.name}</p>
              {provider.verified && (
                <span style={{ background: "linear-gradient(135deg, #7B6BA8, #3d3566)", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", flexShrink: 0 }}>
                  ✓ 公式
                </span>
              )}
            </div>
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 10px" }}>📍 {provider.location}</p>
            {/* Stats row */}
            <div style={{ display: "flex", gap: "20px" }}>
              {avgRating && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 800, color: "#7B6BA8", fontSize: "18px", margin: 0 }}>★{avgRating}</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>評価</p>
                </div>
              )}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 800, color: "#7B6BA8", fontSize: "18px", margin: 0 }}>{reviews.length}</p>
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>口コミ</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 800, color: "#7B6BA8", fontSize: "18px", margin: 0 }}>{experiences.length}</p>
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>体験数</p>
              </div>
              {provider.yearsActive && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 800, color: "#7B6BA8", fontSize: "18px", margin: 0 }}>{provider.yearsActive}年</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>経験年数</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.85, margin: "0 0 14px" }}>{provider.bio}</p>

        {provider.tags && provider.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {provider.tags.map(tag => (
              <span key={tag} style={{ fontSize: "11px", background: "#E8E4F5", color: "#7B6BA8", padding: "4px 10px", borderRadius: "20px", fontWeight: 600 }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rating breakdown */}
      {reviews.length > 0 && (
        <div style={{ margin: "12px 16px 0", background: "white", borderRadius: "20px", padding: "20px" }}>
          <p style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", margin: "0 0 14px" }}>口コミ評価まとめ</p>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {/* Big rating */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <p style={{ fontSize: "40px", fontWeight: 800, color: "#1a1a1a", margin: 0, lineHeight: 1 }}>{avgRating}</p>
              <div style={{ display: "flex", gap: "1px", justifyContent: "center", margin: "4px 0" }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize: "14px", color: s <= Math.round(avgRating!) ? "#f59e0b" : "#e5e7eb" }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{reviews.length}件</p>
            </div>
            {/* Bar chart */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
              {ratingCounts.map(({ star, count }) => (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#6b7280", width: "18px", textAlign: "right" }}>{star}★</span>
                  <div style={{ flex: 1, background: "#f3f4f6", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "4px", background: "#f59e0b",
                      width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%",
                    }} />
                  </div>
                  <span style={{ fontSize: "11px", color: "#9ca3af", width: "20px" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming experiences */}
      {upcoming.length > 0 && (
        <div style={{ margin: "12px 16px 0" }}>
          <p style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", margin: "0 0 10px" }}>開催予定の体験</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {upcoming.map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
          </div>
        </div>
      )}

      {/* Past experiences */}
      {past.length > 0 && (
        <div style={{ margin: "12px 16px 0" }}>
          <p style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", margin: "0 0 10px" }}>過去の体験</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {past.map(exp => <ExperienceCard key={exp.id} exp={exp} isPast />)}
          </div>
        </div>
      )}

      {experiences.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontSize: "13px" }}>
          まだ体験が登録されていません
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div style={{ margin: "12px 16px 0" }}>
          <p style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", margin: "0 0 10px" }}>みんなの口コミ</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background: "white", borderRadius: "16px", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <img
                    src={r.reviewerAvatar || `https://i.pravatar.cc/80?u=${r.reviewerName}`}
                    alt={r.reviewerName}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontWeight: 600, color: "#111827", fontSize: "13px", margin: 0 }}>{r.reviewerName}</p>
                      <div style={{ display: "flex", gap: "1px" }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "#e5e7eb", fontSize: "13px" }}>★</span>
                        ))}
                      </div>
                    </div>
                    {r.childAge && <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{r.childAge}</p>}
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, margin: 0 }}>{r.comment}</p>
                <p style={{ fontSize: "11px", color: "#d1d5db", marginTop: "6px", textAlign: "right" }}>{r.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExperienceCard({ exp, isPast = false }: { exp: Awaited<ReturnType<typeof getExperiencesByProviderId>>[0]; isPast?: boolean }) {
  const cat = CAT_GRADIENT[exp.category] ?? CAT_GRADIENT["その他"];
  const CatIcon = cat.Icon;
  const spotsLeft = exp.capacity - exp.currentBookings;
  const isFull = spotsLeft <= 0;

  const dateStr = new Date(exp.date + "T00:00:00").toLocaleDateString("ja-JP", {
    month: "long", day: "numeric", weekday: "short",
  });

  return (
    <Link href={`/experiences/${exp.id}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "white", borderRadius: "16px", display: "flex", gap: "12px", overflow: "hidden", opacity: isPast ? 0.75 : 1 }}>
        {/* Thumbnail */}
        <div style={{ width: "90px", height: "90px", flexShrink: 0 }}>
          {exp.imageUrl ? (
            <img src={exp.imageUrl} alt={exp.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: cat.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CatIcon size={32} color="rgba(255,255,255,0.9)" strokeWidth={1.2} />
            </div>
          )}
        </div>
        {/* Info */}
        <div style={{ flex: 1, padding: "12px 12px 12px 0" }}>
          <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", background: "#E8E4F5", color: "#7B6BA8", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }}>
              {exp.category}
            </span>
            {isPast && <span style={{ fontSize: "10px", background: "#f3f4f6", color: "#9ca3af", padding: "2px 8px", borderRadius: "20px", fontWeight: 600 }}>終了</span>}
            {!isPast && isFull && <span style={{ fontSize: "10px", background: "#374151", color: "white", padding: "2px 8px", borderRadius: "20px", fontWeight: 600 }}>満員</span>}
          </div>
          <p style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "13px", margin: "0 0 4px", lineHeight: 1.3 }}>{exp.title}</p>
          <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{dateStr} · {exp.location}</p>
        </div>
      </div>
    </Link>
  );
}
