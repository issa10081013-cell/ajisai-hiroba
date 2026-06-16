import { getExperienceById, getReviewsByExperienceId } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";
import { Calendar, MapPin, Banknote, Users, Leaf, ChefHat, BookOpen, Scissors, TreePine, Sparkles } from "lucide-react";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

const CAT_GRADIENT: Record<string, { gradient: string; Icon: React.ElementType }> = {
  "農業体験":   { gradient: "linear-gradient(135deg, #bbf7d0, #4ade80, #16a34a)", Icon: Leaf },
  "料理教室":   { gradient: "linear-gradient(135deg, #fed7aa, #fb923c, #c2410c)", Icon: ChefHat },
  "学習体験":   { gradient: "linear-gradient(135deg, #bfdbfe, #60a5fa, #1d4ed8)", Icon: BookOpen },
  "ものづくり":  { gradient: "linear-gradient(135deg, #fbcfe8, #f472b6, #be185d)", Icon: Scissors },
  "自然体験":   { gradient: "linear-gradient(135deg, #a7f3d0, #34d399, #059669)", Icon: TreePine },
  "その他":     { gradient: "linear-gradient(135deg, #e5e7eb, #9ca3af, #4b5563)", Icon: Sparkles },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#e5e7eb", fontSize: "14px" }}>★</span>
      ))}
    </div>
  );
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { id } = await params;
  const [experience, expReviews] = await Promise.all([
    getExperienceById(id),
    getReviewsByExperienceId(id),
  ]);

  if (!experience) notFound();

  const avgRating = expReviews.length
    ? Math.round((expReviews.reduce((s, r) => s + r.rating, 0) / expReviews.length) * 10) / 10
    : null;

  const spotsLeft = experience.capacity - experience.currentBookings;
  const isFull = spotsLeft <= 0;
  const isFree = experience.priceMember === 0;
  const { provider } = experience;
  const cat = CAT_GRADIENT[experience.category] ?? CAT_GRADIENT["その他"];
  const CatIcon = cat.Icon;

  const dateStr = new Date(experience.date + "T00:00:00").toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "16px 16px 48px", backgroundColor: "#FAFAF9", minHeight: "100vh" }}>
      <Link href="/" style={{ fontSize: "12px", color: "#7B6BA8", display: "inline-block", marginBottom: "16px", textDecoration: "none", fontWeight: 600 }}>← トップに戻る</Link>

      {/* Hero image */}
      <div style={{ borderRadius: "20px", overflow: "hidden", marginBottom: "16px", height: "240px" }}>
        {experience.imageUrl ? (
          <img src={experience.imageUrl} alt={experience.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: cat.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CatIcon size={80} color="rgba(255,255,255,0.9)" strokeWidth={1.2} style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.15))" }} />
          </div>
        )}
      </div>

      {/* Title block */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", color: "#7B6BA8", fontWeight: 700, backgroundColor: "#E8E4F5", padding: "4px 12px", borderRadius: "999px" }}>
            {experience.category}
          </span>
          {avgRating && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "#f59e0b" }}>★</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>{avgRating}</span>
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>（{expReviews.length}件）</span>
            </div>
          )}
          {isFull && (
            <span style={{ fontSize: "11px", color: "white", backgroundColor: "#374151", padding: "4px 10px", borderRadius: "999px", fontWeight: 700 }}>
              SOLD OUT
            </span>
          )}
          {!isFull && spotsLeft <= 3 && (
            <span style={{ fontSize: "11px", color: "white", backgroundColor: "#ef4444", padding: "4px 10px", borderRadius: "999px", fontWeight: 700 }}>
              残り{spotsLeft}席
            </span>
          )}
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", lineHeight: 1.35, margin: 0 }}>
          {experience.title}
        </h1>
      </div>

      {/* Info grid */}
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><Calendar size={12} color="#9ca3af" /><span style={{ fontSize: "11px", color: "#9ca3af" }}>日時</span></div>
          <p style={{ fontWeight: 600, color: "#111827", fontSize: "13px", marginBottom: "2px" }}>{dateStr}</p>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>{experience.timeStart}〜{experience.timeEnd}</p>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><MapPin size={12} color="#9ca3af" /><span style={{ fontSize: "11px", color: "#9ca3af" }}>場所</span></div>
          <p style={{ fontWeight: 600, color: "#111827", fontSize: "13px" }}>{experience.location}</p>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><Banknote size={12} color="#9ca3af" /><span style={{ fontSize: "11px", color: "#9ca3af" }}>参加費</span></div>
          {isFree ? (
            <p style={{ fontWeight: 800, color: "#059669", fontSize: "16px" }}>無料</p>
          ) : (
            <div>
              <p style={{ fontWeight: 800, color: "#7B6BA8", fontSize: "16px" }}>会員 ¥{experience.priceMember.toLocaleString()}</p>
              <p style={{ fontSize: "11px", color: "#d1d5db", textDecoration: "line-through" }}>一般 ¥{experience.priceRegular.toLocaleString()}</p>
            </div>
          )}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><Users size={12} color="#9ca3af" /><span style={{ fontSize: "11px", color: "#9ca3af" }}>残席</span></div>
          <p style={{ fontWeight: 700, fontSize: "15px", color: isFull ? "#9ca3af" : spotsLeft <= 3 ? "#ef4444" : "#111827" }}>
            {isFull ? "満員" : `${spotsLeft} / ${experience.capacity}席`}
          </p>
        </div>
      </div>

      {/* Tags */}
      {experience.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
          {experience.tags.map(tag => (
            <span key={tag} style={{ fontSize: "11px", backgroundColor: "#f3f4f6", color: "#6b7280", padding: "4px 10px", borderRadius: "999px" }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Description */}
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "10px" }}>体験について</h2>
        <p style={{ color: "#374151", fontSize: "13px", lineHeight: 1.8 }}>{experience.description}</p>
      </div>

      {/* Provider */}
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "14px" }}>提供者プロフィール</h2>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <img src={provider.imageUrl || `https://i.pravatar.cc/80?u=${provider.id}`} alt={provider.name}
            style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #E8E4F5" }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "#111827", fontSize: "15px", marginBottom: "2px" }}>{provider.name}</p>
            <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "10px" }}>{provider.location}</p>
            <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
              {provider.yearsActive && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, color: "#7B6BA8", fontSize: "14px" }}>{provider.yearsActive}年</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>経験年数</p>
                </div>
              )}
              {provider.totalParticipants && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, color: "#7B6BA8", fontSize: "14px" }}>{provider.totalParticipants}人</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>累計参加者</p>
                </div>
              )}
              {avgRating && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, color: "#7B6BA8", fontSize: "14px" }}>★{avgRating}</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>評価</p>
                </div>
              )}
            </div>
            <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.7 }}>{provider.bio}</p>
            {provider.tags && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                {provider.tags.map(tag => (
                  <span key={tag} style={{ fontSize: "11px", backgroundColor: "#E8E4F5", color: "#7B6BA8", padding: "3px 8px", borderRadius: "999px" }}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {expReviews.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>口コミ</h2>
            <span style={{ color: "#f59e0b" }}>★</span>
            <span style={{ fontWeight: 700, color: "#374151", fontSize: "14px" }}>{avgRating}</span>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>/ {expReviews.length}件</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {expReviews.map(review => (
              <div key={review.id} style={{ backgroundColor: "white", borderRadius: "16px", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <img src={review.reviewerAvatar} alt={review.reviewerName}
                    style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontWeight: 600, color: "#111827", fontSize: "13px" }}>{review.reviewerName}</p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p style={{ fontSize: "11px", color: "#9ca3af" }}>{review.childAge}</p>
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7 }}>{review.comment}</p>
                <p style={{ fontSize: "11px", color: "#d1d5db", marginTop: "8px", textAlign: "right" }}>{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking */}
      {isFull ? (
        <div style={{ backgroundColor: "#f9fafb", borderRadius: "20px", padding: "32px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600, marginBottom: "12px" }}>この体験は満員です</p>
          <Link href="/" style={{ fontSize: "12px", color: "#7B6BA8", textDecoration: "underline" }}>他の体験を探す</Link>
        </div>
      ) : (
        <BookingForm experienceId={experience.id} experienceTitle={experience.title} />
      )}
    </div>
  );
}
