import { getExperiences } from "@/lib/queries";
import ExperienceBrowse from "@/components/ExperienceBrowse";

export const revalidate = 60;

export default async function Home() {
  const experiences = await getExperiences();

  return (
    <div style={{ backgroundColor: "#FAFAF7", minHeight: "100vh" }}>

      {/* ヒーロー：明るく温かい日本的トーン */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* 写真 */}
        <div style={{ position: "relative", height: "420px" }}>
          <img
            src="https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1600&q=85&auto=format&fit=crop"
            alt="福岡の自然"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
          />
          {/* 明るめの白いオーバーレイで日本らしい柔らかさを出す */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(245,243,250,0.88) 0%, rgba(245,243,250,0.6) 50%, rgba(245,243,250,0.2) 100%)" }} />

          {/* テキスト：左寄せ日本語 */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", maxWidth: "540px" }}>
            <span style={{ display: "inline-block", backgroundColor: "#EDE9F8", color: "#7B6BA8", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "6px", marginBottom: "16px", width: "fit-content" }}>
              🌸 福岡の子育て家族のための体験プラットフォーム
            </span>
            <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3, marginBottom: "12px" }}>
              本物の体験が、<br />子どもを育てる。
            </h1>
            <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: 1.9, marginBottom: "24px", fontWeight: 500 }}>
              福岡の農家・料理人・職人たちが<br />あなたの家族を待っています
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "white", borderRadius: "10px", padding: "8px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <span style={{ fontSize: "16px" }}>🌾</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>農業・収穫体験</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "white", borderRadius: "10px", padding: "8px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <span style={{ fontSize: "16px" }}>🍱</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>料理・食文化</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "white", borderRadius: "10px", padding: "8px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <span style={{ fontSize: "16px" }}>🌿</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>自然・アウトドア</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 体験一覧 */}
      <ExperienceBrowse experiences={experiences} />

      {/* あじさいとは */}
      <section style={{ backgroundColor: "white", padding: "48px 20px 56px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span style={{ display: "inline-block", backgroundColor: "#EDE9F8", color: "#7B6BA8", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "6px", marginBottom: "12px" }}>
              あじさい体験ひろばについて
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1a1a1a" }}>
              地域の力で、子どもの可能性を広げる
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {[
              {
                img: "https://images.unsplash.com/photo-1516901408944-6695e58c4f06?w=480&h=280&q=80&auto=format&fit=crop",
                title: "福岡の職人・生産者と出会う",
                desc: "農家・漁師・料理人・職人——教科書では学べないリアルな現場を子どもたちに体験させてあげましょう。",
              },
              {
                img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=480&h=280&q=80&auto=format&fit=crop",
                title: "会員なら毎月お得に参加",
                desc: "月額¥1,000のメンバーシップで、すべての体験が特別価格に。家族みんなで気軽に参加できます。",
              },
              {
                img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=480&h=280&q=80&auto=format&fit=crop",
                title: "同じ想いの保護者と繋がる",
                desc: "体験を通じて、福岡市内の保護者同士がつながるコミュニティをつくっています。",
              },
            ].map(item => (
              <div key={item.title} style={{ borderRadius: "14px", overflow: "hidden", backgroundColor: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
                <div style={{ height: "150px", overflow: "hidden" }}>
                  <img src={item.img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>{item.title}</h3>
                  <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.75 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* あじさいコミュニティCTA */}
          <div style={{ marginTop: "32px", backgroundColor: "#F5F3FA", borderRadius: "16px", padding: "28px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>
              保護者コミュニティに参加しませんか？
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.7, marginBottom: "20px" }}>
              月額¥1,000のメンバーになると体験が割引に。<br />先行メンバー募集中です。
            </p>
            <a href="https://lin.ee/ajisai" style={{ display: "inline-block", backgroundColor: "#7B6BA8", color: "white", padding: "12px 28px", borderRadius: "10px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>
              詳しく見る
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
