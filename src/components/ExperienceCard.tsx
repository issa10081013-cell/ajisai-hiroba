"use client";
import Link from "next/link";
import { Experience } from "@/lib/types";

const CAT_PHOTOS: Record<string, string> = {
  "農業体験":   "https://images.unsplash.com/photo-1595856898942-7d62e4d84ca1?w=720&h=540&q=80&auto=format&fit=crop",
  "料理教室":   "https://images.unsplash.com/photo-1547592180-85f173990554?w=720&h=540&q=80&auto=format&fit=crop",
  "学習体験":   "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=720&h=540&q=80&auto=format&fit=crop",
  "ものづくり":  "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=720&h=540&q=80&auto=format&fit=crop",
  "自然体験":   "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=720&h=540&q=80&auto=format&fit=crop",
  "その他":     "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=720&h=540&q=80&auto=format&fit=crop",
};

export default function ExperienceCard({ experience }: { experience: Experience }) {
  const spotsLeft = experience.capacity - experience.currentBookings;
  const isFull = spotsLeft <= 0;
  const isFree = experience.priceMember === 0;
  const discountPct = !isFree && experience.priceRegular > experience.priceMember
    ? Math.round((1 - experience.priceMember / experience.priceRegular) * 100)
    : 0;
  const photoSrc = experience.imageUrl || CAT_PHOTOS[experience.category] || CAT_PHOTOS["その他"];

  const dateStr = new Date(experience.date + "T00:00:00").toLocaleDateString("ja-JP", {
    month: "long", day: "numeric", weekday: "short",
  });

  return (
    <Link href={`/experiences/${experience.id}`} className="block group">
      {/* Photo — Airbnb-style: no card box, photo IS the card */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-gray-100">
        <img
          src={photoSrc}
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {isFull && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-wider">満員御礼</span>
          </div>
        )}

        {/* Floating badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isFree && (
            <span className="bg-white text-emerald-600 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              無料
            </span>
          )}
          {discountPct > 0 && (
            <span className="bg-[#7B6BA8] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              あじさい会員{discountPct}%OFF
            </span>
          )}
          {!isFull && spotsLeft <= 3 && (
            <span className="bg-white text-rose-500 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              残り{spotsLeft}席
            </span>
          )}
        </div>
      </div>

      {/* Info — minimal, clean */}
      <div className="space-y-0.5 px-0.5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#717171] font-medium truncate flex items-center gap-1">
            {experience.provider.name}
            {experience.provider.verified && (
              <span style={{ background: "linear-gradient(135deg, #7B6BA8, #3d3566)", color: "white", fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "20px", flexShrink: 0 }}>✓ 公式</span>
            )}
            <span> · {experience.location.split("（")[0]}</span>
          </p>
          <span className="text-[10px] text-[#717171] bg-[#F3F4F6] rounded-full px-2 py-0.5 ml-2 shrink-0">
            {experience.category}
          </span>
        </div>

        <h3 className="text-[13.5px] font-semibold text-[#222] leading-snug line-clamp-2">
          {experience.title}
        </h3>

        <p className="text-xs text-[#717171]">
          {dateStr}　{experience.timeStart}〜{experience.timeEnd}
        </p>

        {experience.ageTags && experience.ageTags.length > 0 && (
          <p className="text-[11px] text-[#7B6BA8] font-medium">
            👦 {experience.ageTags.join("・")}
          </p>
        )}

        {isFree ? (
          <p className="text-[13px] font-semibold text-emerald-600 pt-0.5">無料で参加</p>
        ) : (
          <div className="pt-0.5 flex items-baseline gap-2 flex-wrap">
            <p className="text-[13px]">
              <span className="text-[10px] text-[#7B6BA8] font-bold">あじさい会員</span>
              <span className="font-bold text-[#7B6BA8] ml-1">¥{experience.priceMember.toLocaleString()}</span>
            </p>
            {experience.priceRegular > experience.priceMember && (
              <p className="text-[11px] text-[#aaa] line-through">
                一般 ¥{experience.priceRegular.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
