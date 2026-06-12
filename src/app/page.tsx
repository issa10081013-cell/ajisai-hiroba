import { getExperiences } from "@/lib/queries";
import ExperienceBrowse from "@/components/ExperienceBrowse";

export const revalidate = 60;

export default async function Home() {
  const experiences = await getExperiences();

  return (
    <div style={{ backgroundColor: "#FAFAF9", minHeight: "100vh" }}>
      {/* Full-bleed hero */}
      <section style={{ position: "relative", height: "440px", overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1536337005238-94b997371b40?w=1600&q=85&auto=format&fit=crop"
          alt="hero"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }}
        />
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />

        {/* Hero text */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 20px" }}>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", marginBottom: "12px" }}>
            FUKUOKA · FAMILY · EXPERIENCE
          </p>
          <h1 style={{ color: "white", fontSize: "34px", fontWeight: 800, lineHeight: 1.25, marginBottom: "14px", textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}>
            本物の体験が、<br />子どもを育てる。
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", lineHeight: 1.8, maxWidth: "360px", fontWeight: 500 }}>
            農家・料理人・職人が福岡の子育て家族を待っています
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: "32px", marginTop: "28px" }}>
            {[
              { num: "30+", label: "体験プログラム" },
              { num: "10+", label: "地域のプロ" },
              { num: "福岡", label: "全エリア対応" },
            ].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <p style={{ color: "white", fontWeight: 800, fontSize: "20px", lineHeight: 1 }}>{item.num}</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", marginTop: "4px" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse section */}
      <ExperienceBrowse experiences={experiences} />

      {/* About section */}
      <section style={{ backgroundColor: "white", padding: "56px 20px", marginTop: "32px" }}>
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#7B6BA8", letterSpacing: "0.08em", marginBottom: "8px" }}>WHY AJISAI</p>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>なぜあじさい体験ひろばなのか</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
            {[
              {
                img: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=260&q=80&auto=format&fit=crop",
                icon: "🌱",
                title: "本物に触れる体験",
                desc: "農家・料理人・職人——教科書では学べない現場の知識と技術を子どもたちに",
              },
              {
                img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=260&q=80&auto=format&fit=crop",
                icon: "💜",
                title: "会員は特別価格",
                desc: "月額¥1,000のメンバーシップで、すべての体験が大幅割引。家族で気軽に参加できる",
              },
              {
                img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=260&q=80&auto=format&fit=crop",
                icon: "🤝",
                title: "つながりが生まれる",
                desc: "福岡の家族と仲間になる。同じ価値観を持つ保護者コミュニティが広がっていく",
              },
            ].map(item => (
              <div key={item.title} style={{ borderRadius: "16px", overflow: "hidden", backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ height: "160px", overflow: "hidden", position: "relative" }}>
                  <img src={item.img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }} />
                  <span style={{ position: "absolute", bottom: "12px", left: "14px", fontSize: "22px" }}>{item.icon}</span>
                </div>
                <div style={{ padding: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>{item.title}</h3>
                  <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
