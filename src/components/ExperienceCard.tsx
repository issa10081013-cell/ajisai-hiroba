"use client";
import Link from "next/link";
import { Experience } from "@/lib/types";

type Props = {
  experience: Experience;
};

export default function ExperienceCard({ experience }: Props) {
  const spotsLeft = experience.capacity - experience.currentBookings;
  const isFull = spotsLeft <= 0;
  const isFree = experience.priceMember === 0;

  const dateObj = new Date(experience.date);
  const dateStr = dateObj.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <Link href={`/experiences/${experience.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-50 cursor-pointer group">
        <div className="relative h-44 overflow-hidden">
          <img
            src={experience.imageUrl}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-white/90 backdrop-blur-sm text-[#7B6BA8] text-xs font-medium px-2.5 py-1 rounded-full">
              {experience.category}
            </span>
            {isFree && (
              <span className="bg-[#5A8A6A] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                無料
              </span>
            )}
          </div>
          {isFull && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">満員</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">
            {experience.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <span>📅</span>
            <span>{dateStr} {experience.timeStart}〜{experience.timeEnd}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <span>📍</span>
            <span className="truncate">{experience.location.split("（")[0]}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {isFree ? (
                <span className="text-[#5A8A6A] font-bold text-sm">無料</span>
              ) : (
                <div>
                  <span className="text-[#7B6BA8] font-bold text-sm">
                    会員 ¥{experience.priceMember.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-xs ml-1.5 line-through">
                    ¥{experience.priceRegular.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isFull
                ? "bg-gray-100 text-gray-400"
                : spotsLeft <= 3
                ? "bg-red-50 text-red-500"
                : "bg-[#E8E4F5] text-[#7B6BA8]"
            }`}>
              {isFull ? "満員" : `残り${spotsLeft}席`}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <img
              src={experience.provider.imageUrl}
              alt={experience.provider.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs text-gray-500">{experience.provider.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
