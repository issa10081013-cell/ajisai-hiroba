import { getExperiences } from "@/lib/queries";
import ExperienceBrowse from "@/components/ExperienceBrowse";

export const revalidate = 60;

export default async function Home() {
  const experiences = await getExperiences();

  return (
    <div style={{ backgroundColor: "#FAFAF7", minHeight: "100vh" }}>

      {/* ヒーロー */}
      <section style={{ position: "relative", height: "420px", overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=85&auto=format&fit=crop&crop=center"
          alt="自然の中で遊ぶ子どもたち"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(245,243,250,0.92) 0%, rgba(245,243,250,0.65) 45%, rgba(245,243,250,0.1) 100%)" }} />

        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px", maxWidth: "520px" }}>
          <span style={{ display: "inline-block", backgroundColor: "#EDE9F8", color: "#7B6BA8", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "6px", marginBottom: "16px", width: "fit-content" }}>
            🌸 福岡の子育て家族のための体験プラットフォーム
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1a1a1a", lineHeight: 1.35, marginBottom: "12px" }}>
            本物の体験が、<br />子どもを育てる。
          </h1>
          <p style={{ color: "#4b5563", fontSize: "13px", lineHeight: 1.9, marginBottom: "22px" }}>
            農家・料理人・職人たちが<br />あなたの家族を待っています
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { emoji: "🌾", label: "農業・収穫体験" },
              { emoji: "🍱", label: "料理・食文化" },
              { emoji: "🌿", label: "自然・外遊び" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "white", borderRadius: "8px", padding: "7px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                <span style={{ fontSize: "15px" }}>{item.emoji}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 体験一覧 */}
      <ExperienceBrowse experiences={experiences} />

      {/* LINE登録CTA */}
      <section style={{ backgroundColor: "#06C755", padding: "36px 20px" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "white", fontWeight: 800, fontSize: "18px", marginBottom: "6px" }}>
              LINEで最新体験情報を受け取る
            </p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", lineHeight: 1.7 }}>
              新しい体験の先行案内・限定クーポンをお届けします
            </p>
          </div>
          <a
            href="https://lin.ee/PLACEHOLDER"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "white", color: "#06C755", padding: "13px 24px", borderRadius: "10px", fontWeight: 800, fontSize: "15px", textDecoration: "none", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#06C755"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
            LINE登録はこちら
          </a>
        </div>
      </section>

      {/* あじさいとは */}
      <section style={{ backgroundColor: "white", padding: "48px 20px 56px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span style={{ display: "inline-block", backgroundColor: "#EDE9F8", color: "#7B6BA8", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "6px", marginBottom: "12px" }}>
              あじさい体験ひろばについて
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1a1a1a" }}>
              地域の力で、子どもの可能性を広げる
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px", marginBottom: "32px" }}>
            {[
              {
                img: "https://images.unsplash.com/photo-1595856898942-7d62e4d84ca1?w=480&h=280&q=80&auto=format&fit=crop",
                fallback: "linear-gradient(135deg, #dcfce7, #16a34a)",
                title: "福岡の職人・生産者と出会う",
                desc: "農家・漁師・料理人・職人——教科書では学べないリアルな現場を子どもたちに体験させてあげましょう。",
              },
              {
                img: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=480&h=280&q=80&auto=format&fit=crop",
                fallback: "linear-gradient(135deg, #fef3c7, #d97706)",
                title: "会員なら毎月お得に参加",
                desc: "月額¥1,000のメンバーシップで、すべての体験が特別価格に。家族みんなで気軽に参加できます。",
              },
              {
                img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=480&h=280&q=80&auto=format&fit=crop",
                fallback: "linear-gradient(135deg, #EDE9F8, #7B6BA8)",
                title: "同じ想いの保護者と繋がる",
                desc: "体験を通じて、福岡市内の保護者同士がつながるコミュニティをつくっています。",
              },
            ].map(item => (
              <div key={item.title} style={{ borderRadius: "14px", overflow: "hidden", backgroundColor: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
                <div style={{ height: "150px", overflow: "hidden", background: item.fallback }}>
                  <img src={item.img} alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div style={{ padding: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>{item.title}</h3>
                  <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.75 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* メンバーシップCTA */}
          <div style={{ backgroundColor: "#F5F3FA", borderRadius: "16px", padding: "28px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>
              保護者コミュニティに参加しませんか？
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.7, marginBottom: "20px" }}>
              月額¥1,000のメンバーになると体験が割引に。<br />先行メンバー募集中です。
            </p>
            <a href="https://lin.ee/PLACEHOLDER" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", backgroundColor: "#7B6BA8", color: "white", padding: "12px 28px", borderRadius: "10px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>
              詳しく見る →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
