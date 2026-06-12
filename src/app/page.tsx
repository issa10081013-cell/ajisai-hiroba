import Link from "next/link";
import { getExperiences } from "@/lib/queries";
import CalendarView from "@/components/CalendarView";

export const revalidate = 60;

export default async function Home() {
  const experiences = await getExperiences();

  return (
    <div>
      <section className="bg-gradient-to-b from-[#F5F3FA] to-[#FAFAF9] pt-10 pb-8 px-4 text-center">
        <p className="text-[#7B6BA8] font-medium text-xs mb-2 tracking-wide">福岡の子育て家族のための</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">
          本物の体験が、<br />子どもを育てる。
        </h1>
        <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto mb-4">
          農家・料理教室・塾・職人——日付を選んで体験を予約しよう
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-[#5A8A6A] inline-block" />
          今なら無料で参加できます
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-6">
        <CalendarView experiences={experiences} />
      </section>

      <section className="bg-[#F5F3FA] py-10 px-4 mt-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-bold text-gray-800 text-center text-sm mb-6">あじさい体験ひろばとは</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "🌱", title: "本物に触れる", desc: "農家・料理人・職人の現場へ" },
              { icon: "💜", title: "会員は特別価格", desc: "月額¥1,000で割引体験" },
              { icon: "🤝", title: "つながりが生まれる", desc: "福岡の家族と仲間になる" },
            ].map((item) => (
              <div key={item.title}>
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="font-bold text-gray-800 text-xs mb-1">{item.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
