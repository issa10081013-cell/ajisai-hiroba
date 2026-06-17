import { getExperienceById, getReviewsByExperienceId } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import ReviewForm from "@/components/ReviewForm";
import StickyBookingBar from "@/components/StickyBookingBar";
import { Calendar, MapPin, Banknote, Users, Leaf, ChefHat, BookOpen, Scissors, TreePine, Sparkles } from "lucide-react";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const experience = await getExperienceById(id);
  if (!experience) return {};

  const dateStr = new Date(experience.date + "T00:00:00").toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
  });
  const title = `${experience.title} | あじさい体験ひろば`;
  const description = `${dateStr}開催 · ${experience.location} · ${experience.description.slice(0, 80)}…`;
  const image = experience.imageUrl || "https://dvqewysazrkhlvvlvuww.supabase.co/storage/v1/object/public/images/logo/ajisai-logo-1781517450336.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

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
  const discountPct = !isFree && experience.priceRegular > experience.priceMember
    ? Math.round((1 - experience.priceMember / experience.priceRegular) * 100)
    : 0;
  const { provider } = experience;
  const cat = CAT_GRADIENT[experience.category] ?? CAT_GRADIENT["その他"];
  const CatIcon = cat.Icon;

  const dateStr = new Date(experience.date + "T00:00:00").toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "16px 16px 48px", backgroundColor: "#FAFAF9", minHeight: "100vh" }}>
      <Link href="/" style={{ fontSize: "12px", color: "#4A7A5C", display: "inline-block", marginBottom: "16px", textDecoration: "none", fontWeight: 600 }}>← トップに戻る</Link>
      <StickyBookingBar isFull={isFull} title={experience.title} />

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
          <span style={{ fontSize: "11px", color: "#2d5a3f", fontWeight: 700, backgroundColor: "#D4EAD9", padding: "4px 12px", borderRadius: "999px" }}>
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
          {/* LINEシェアボタン */}
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ajisai-hiroba.vercel.app"}/experiences/${experience.id}`)}&text=${encodeURIComponent(experience.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", background: "#06C755", color: "white", borderRadius: "999px", padding: "5px 12px", fontSize: "11px", fontWeight: 700, textDecoration: "none", flexShrink: 0 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            シェア
          </a>
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
            <p style={{ fontWeight: 800, color: "#2d5a3f", fontSize: "15px", margin: 0 }}>¥{experience.priceMember.toLocaleString()}〜</p>
          )}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><Users size={12} color="#9ca3af" /><span style={{ fontSize: "11px", color: "#9ca3af" }}>残席</span></div>
          <p style={{ fontWeight: 700, fontSize: "15px", color: isFull ? "#9ca3af" : spotsLeft <= 3 ? "#ef4444" : "#111827" }}>
            {isFull ? "満員" : `${spotsLeft} / ${experience.capacity}席`}
          </p>
        </div>
      </div>

      {/* 価格比較 */}
      {!isFree && (
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
            <Banknote size={13} color="#7B6BA8" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>参加費</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {/* あじさい会員 */}
            <div style={{ background: "linear-gradient(135deg, #2d5a3f, #4A7A5C)", borderRadius: "14px", padding: "14px", textAlign: "center", position: "relative" }}>
              {discountPct > 0 && (
                <span style={{ position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)", background: "#f59e0b", color: "white", fontSize: "9px", fontWeight: 800, padding: "2px 8px", borderRadius: "20px", whiteSpace: "nowrap" }}>
                  {discountPct}%お得
                </span>
              )}
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", margin: "0 0 4px", fontWeight: 600 }}>あじさい会員</p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "white", margin: 0 }}>
                ¥{experience.priceMember.toLocaleString()}
              </p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", margin: "2px 0 0" }}>/ 人</p>
            </div>
            {/* 一般 */}
            <div style={{ background: "#f9fafb", borderRadius: "14px", padding: "14px", textAlign: "center", border: "1.5px solid #e5e7eb" }}>
              <p style={{ fontSize: "10px", color: "#9ca3af", margin: "0 0 4px", fontWeight: 600 }}>一般</p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#374151", margin: 0 }}>
                ¥{experience.priceRegular.toLocaleString()}
              </p>
              <p style={{ fontSize: "10px", color: "#d1d5db", margin: "2px 0 0" }}>/ 人</p>
            </div>
          </div>
          {discountPct > 0 && (
            <p style={{ fontSize: "11px", color: "#2d5a3f", margin: "10px 0 0", textAlign: "center", fontWeight: 600 }}>
              会員になると ¥{(experience.priceRegular - experience.priceMember).toLocaleString()} お得！
            </p>
          )}
        </div>
      )}

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", margin: 0 }}>提供者プロフィール</h2>
          <Link href={`/providers/${provider.id}`} style={{ fontSize: "11px", color: "#4A7A5C", fontWeight: 600, textDecoration: "none" }}>
            詳しく見る →
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <Link href={`/providers/${provider.id}`} style={{ flexShrink: 0 }}>
            <img src={provider.imageUrl || `https://i.pravatar.cc/80?u=${provider.id}`} alt={provider.name}
              style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid #D4EAD9" }} />
          </Link>
          <div style={{ flex: 1 }}>
            <Link href={`/providers/${provider.id}`} style={{ fontWeight: 700, color: "#111827", fontSize: "15px", marginBottom: "2px", textDecoration: "none", display: "block" }}>{provider.name}</Link>
            <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "10px" }}>{provider.location}</p>
            <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
              {provider.yearsActive && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, color: "#2d5a3f", fontSize: "14px" }}>{provider.yearsActive}年</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>経験年数</p>
                </div>
              )}
              {provider.totalParticipants && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, color: "#2d5a3f", fontSize: "14px" }}>{provider.totalParticipants}人</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>累計参加者</p>
                </div>
              )}
              {avgRating && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, color: "#2d5a3f", fontSize: "14px" }}>★{avgRating}</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>評価</p>
                </div>
              )}
            </div>
            <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.7 }}>{provider.bio}</p>
            {provider.tags && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                {provider.tags.map(tag => (
                  <span key={tag} style={{ fontSize: "11px", backgroundColor: "#D4EAD9", color: "#2d5a3f", padding: "3px 8px", borderRadius: "999px" }}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews + 投稿フォーム */}
      <div style={{ marginBottom: "24px" }}>
        <ReviewForm
          experienceId={experience.id}
          initialReviews={expReviews.map(r => ({
            id: r.id,
            user_id: r.userId,
            reviewer_name: r.reviewerName,
            rating: r.rating,
            comment: r.comment,
            child_age: r.childAge,
            date: r.date,
          }))}
        />
      </div>

      {/* Booking */}
      <div id="booking-section">
        {isFull ? (
          <div style={{ backgroundColor: "#f9fafb", borderRadius: "20px", padding: "32px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600, marginBottom: "12px" }}>この体験は満員です</p>
            <Link href="/" style={{ fontSize: "12px", color: "#4A7A5C", textDecoration: "underline" }}>他の体験を探す</Link>
          </div>
        ) : (
          <BookingForm experienceId={experience.id} experienceTitle={experience.title} />
        )}
      </div>
    </div>
  );
}
