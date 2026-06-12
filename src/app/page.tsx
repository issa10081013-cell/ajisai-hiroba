import { getExperiences } from "@/lib/queries";
import CalendarView from "@/components/CalendarView";

export const revalidate = 60;

export default async function Home() {
  const experiences = await getExperiences();

  return (
    <div style={{ backgroundColor: "#FAFAF9", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", padding: "48px 20px 40px", textAlign: "center", background: "linear-gradient(160deg, #EDE9F8 0%, #F5F3FA 40%, #E8F0E8 100%)" }}>
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: "-40px", left: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(123,107,168,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(90,138,106,0.08)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{ display: "inline-block", backgroundColor: "rgba(123,107,168,0.12)", color: "#7B6BA8", fontSize: "11px", fontWeight: 700, padding: "5px 14px", borderRadius: "999px", marginBottom: "16px", letterSpacing: "0.06em" }}>
            🌱 福岡の子育て家族のための体験プラットフォーム
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", lineHeight: 1.3, marginBottom: "12px" }}>
            本物の体験が、<br />子どもを育てる。
          </h1>
          <p style={{ color: "#6b7280", fontSize: "13px", lineHeight: 1.8, maxWidth: "300px", margin: "0 auto 24px" }}>
            農家・料理教室・塾・職人——<br />日付を選んで体験を予約しよう
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            {[
              { emoji: "🌾", label: "農業・自然" },
              { emoji: "🍳", label: "料理体験" },
              { emoji: "🧵", label: "ものづくり" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "24px" }}>{item.emoji}</span>
                <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
        <CalendarView experiences={experiences} />
      </section>

      {/* About */}
      <section style={{ backgroundColor: "white", margin: "8px 0 0", padding: "40px 20px" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#7B6BA8", letterSpacing: "0.06em", marginBottom: "8px" }}>ABOUT</p>
          <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#111827", marginBottom: "28px" }}>あじさい体験ひろばとは</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { icon: "🌱", title: "本物に触れる", desc: "農家・料理人・職人の現場へ" },
              { icon: "💜", title: "会員は特別価格", desc: "月額¥1,000で割引体験" },
              { icon: "🤝", title: "つながりが生まれる", desc: "福岡の家族と仲間になる" },
            ].map(item => (
              <div key={item.title} style={{ backgroundColor: "#FAFAF9", borderRadius: "16px", padding: "20px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "28px" }}>{item.icon}</span>
                <p style={{ fontWeight: 700, color: "#111827", fontSize: "12px" }}>{item.title}</p>
                <p style={{ color: "#9ca3af", fontSize: "11px", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
