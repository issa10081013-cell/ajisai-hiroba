import { experiences, reviews } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";

type Props = {
  params: Promise<{ id: string }>;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#e5e7eb", fontSize: "14px" }}>★</span>
      ))}
    </div>
  );
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { id } = await params;
  const experience = experiences.find((e) => e.id === id);
  if (!experience) notFound();

  const expReviews = reviews.filter((r) => r.experienceId === id);
  const avgRating = expReviews.length
    ? Math.round((expReviews.reduce((s, r) => s + r.rating, 0) / expReviews.length) * 10) / 10
    : null;

  const spotsLeft = experience.capacity - experience.currentBookings;
  const isFull = spotsLeft <= 0;
  const isFree = experience.priceMember === 0;
  const { provider } = experience;

  const dateStr = new Date(experience.date + "T00:00:00").toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="text-xs text-[#7B6BA8] mb-4 inline-block hover:underline">
        ← カレンダーに戻る
      </Link>

      {/* Hero image */}
      <div className="rounded-2xl overflow-hidden mb-5 h-56">
        <img src={experience.imageUrl} alt={experience.title} className="w-full h-full object-cover" />
      </div>

      {/* Category + title + rating */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-[#7B6BA8] font-medium bg-[#E8E4F5] px-3 py-1 rounded-full">
          {experience.category}
        </span>
        {avgRating && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#f59e0b", fontSize: "14px" }}>★</span>
            <span className="text-sm font-bold text-gray-700">{avgRating}</span>
            <span className="text-xs text-gray-400">（{expReviews.length}件）</span>
          </div>
        )}
      </div>
      <h1 className="text-xl font-bold text-gray-800 mb-4 leading-snug">{experience.title}</h1>

      {/* Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">日時</p>
          <p className="font-medium text-gray-700 text-sm">{dateStr}</p>
          <p className="text-gray-500 text-sm">{experience.timeStart}〜{experience.timeEnd}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">場所</p>
          <p className="font-medium text-gray-700 text-sm">{experience.location}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">参加費</p>
          {isFree ? (
            <p className="font-bold text-[#5A8A6A]">無料</p>
          ) : (
            <div>
              <p className="font-bold text-[#7B6BA8]">会員 ¥{experience.priceMember.toLocaleString()}</p>
              <p className="text-xs text-gray-400 line-through">一般 ¥{experience.priceRegular.toLocaleString()}</p>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">残席</p>
          <p className={`font-bold ${isFull ? "text-gray-400" : spotsLeft <= 3 ? "text-red-500" : "text-gray-700"}`}>
            {isFull ? "満員" : `${spotsLeft}/${experience.capacity}席`}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {experience.tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">#{tag}</span>
        ))}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="font-bold text-gray-800 mb-2">体験について</h2>
        <p className="text-gray-600 text-sm leading-relaxed">{experience.description}</p>
      </div>

      {/* Provider profile */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-bold text-gray-800 mb-4 text-sm">提供者プロフィール</h2>
        <div className="flex items-start gap-4">
          <img
            src={provider.imageUrl}
            alt={provider.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-[#E8E4F5]"
          />
          <div className="flex-1">
            <p className="font-bold text-gray-800">{provider.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-2">{provider.location}</p>
            {/* Stats */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
              {provider.yearsActive && (
                <div className="text-center">
                  <p className="font-bold text-[#7B6BA8] text-sm">{provider.yearsActive}年</p>
                  <p className="text-xs text-gray-400">経験年数</p>
                </div>
              )}
              {provider.totalParticipants && (
                <div className="text-center">
                  <p className="font-bold text-[#7B6BA8] text-sm">{provider.totalParticipants}人</p>
                  <p className="text-xs text-gray-400">累計参加者</p>
                </div>
              )}
              {avgRating && (
                <div className="text-center">
                  <p className="font-bold text-[#7B6BA8] text-sm">★{avgRating}</p>
                  <p className="text-xs text-gray-400">評価</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{provider.bio}</p>
            {/* Provider tags */}
            {provider.tags && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {provider.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-[#E8E4F5] text-[#7B6BA8] px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {expReviews.length > 0 && (
        <div className="mb-8">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <h2 className="font-bold text-gray-800">口コミ</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "#f59e0b" }}>★</span>
              <span className="font-bold text-gray-700">{avgRating}</span>
              <span className="text-xs text-gray-400">/ {expReviews.length}件</span>
            </div>
          </div>

          <div className="space-y-3">
            {expReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <img
                    src={review.reviewerAvatar}
                    alt={review.reviewerName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p className="font-medium text-gray-800 text-sm">{review.reviewerName}</p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-xs text-gray-400">{review.childAge}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                <p className="text-xs text-gray-300 mt-2 text-right">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking */}
      {isFull ? (
        <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400">
          <p className="font-medium">この体験は満員です</p>
          <Link href="/" className="mt-3 inline-block text-xs text-[#7B6BA8] underline">他の体験を探す</Link>
        </div>
      ) : (
        <BookingForm experienceId={experience.id} experienceTitle={experience.title} />
      )}
    </div>
  );
}
