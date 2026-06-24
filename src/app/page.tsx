import { getExperiences } from "@/lib/queries";
import ExperienceBrowse from "@/components/ExperienceBrowse";
import ExperienceCard from "@/components/ExperienceCard";
import Link from "next/link";
import ProviderCTAButton from "@/components/ProviderCTAButton";

export const revalidate = 60;

export default async function Home() {
  const experiences = await getExperiences();

  return (
    <div className="bg-[#FAFAF9] min-h-screen">

      {/* Hero */}
      <div
        className="relative h-[200px] md:h-[320px] overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2d5a3f 0%, #4A3d7A 100%)" }}
      >
        <img
          src="https://dvqewysazrkhlvvlvuww.supabase.co/storage/v1/object/public/images/category/hero-1781515899862.png"
          alt="家族体験"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 65%", opacity: 0.45 }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(45,90,63,0.55) 0%, rgba(61,53,102,0.45) 50%, transparent 100%)" }} />

        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 max-w-[680px]">
          <p className="text-white font-bold mb-2" style={{ fontSize: "clamp(18px, 5vw, 28px)", letterSpacing: "0.04em" }}>
            あじさい体験ひろば
          </p>
          <p className="text-white/60 text-[10px] font-bold tracking-[0.22em] uppercase mb-3">
            Fukuoka · 福岡の子育て家族のための体験
          </p>
          <h1 className="text-white font-bold leading-[1.2] tracking-tight mb-2"
              style={{ fontSize: "clamp(24px, 6vw, 48px)" }}>
            本物の体験が、<br />子どもを育てる。
          </h1>
          <p className="text-white/70 text-xs leading-relaxed">
            農家・料理人・職人と出会う福岡の体験プラットフォーム
          </p>
        </div>
      </div>

      {/* Role selection */}
      <div style={{ background: "#EDF4EE", padding: "16px 16px" }}>
        <div style={{ display: "flex", gap: "12px", maxWidth: "680px", margin: "0 auto" }}>
          <a
            href="#browse"
            className="no-underline"
            style={{
              flex: 1,
              background: "white",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
              touchAction: "manipulation",
            }}
          >
            <img
              src="https://dvqewysazrkhlvvlvuww.supabase.co/storage/v1/object/public/images/icons/participant-1781517559895.png"
              alt="参加者"
              style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }}
            />
            <p style={{ fontWeight: 700, color: "#222", fontSize: "13px", margin: 0 }}>体験に参加する</p>
            <p style={{ fontSize: "11px", color: "#4A7A5C", margin: 0 }}>子育て家族向け →</p>
          </a>
          <ProviderCTAButton
            style={{
              flex: 1,
              background: "#4A7A5C",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              boxShadow: "0 1px 6px rgba(74,122,92,0.3)",
              touchAction: "manipulation",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <img
              src="https://dvqewysazrkhlvvlvuww.supabase.co/storage/v1/object/public/images/icons/host-1781517578393.png"
              alt="主催者"
              style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }}
            />
            <p style={{ fontWeight: 700, color: "white", fontSize: "13px", margin: 0 }}>体験を開催する</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", margin: 0 }}>主催者・提供者向け →</p>
          </ProviderCTAButton>
        </div>
      </div>

      {/* Browse */}
      <ExperienceBrowse experiences={experiences} />

      {/* Board CTA */}
      <section style={{ background: "#EDF4EE", padding: "20px 16px" }}>
        <a href="/board" style={{ display: "flex", alignItems: "center", gap: "14px", maxWidth: "680px", margin: "0 auto", background: "white", borderRadius: "20px", padding: "16px 20px", textDecoration: "none", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <div style={{ flexShrink: 0, width: "44px", height: "44px", background: "#D4EAD9", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21 6a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h11l4 4V6z" fill="#4A7A5C" opacity="0.15" stroke="#4A7A5C" strokeWidth="1.6" strokeLinejoin="round"/>
              <circle cx="8" cy="10.5" r="1.2" fill="#4A7A5C"/>
              <circle cx="12" cy="10.5" r="1.2" fill="#4A7A5C"/>
              <circle cx="16" cy="10.5" r="1.2" fill="#4A7A5C"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "#222", fontSize: "14px", margin: "0 0 2px" }}>保護者掲示板</p>
            <p style={{ fontSize: "12px", color: "#4A7A5C", margin: 0 }}>悩み・体験談・メンバー募集をシェアしよう →</p>
          </div>
        </a>
      </section>

      {/* 体験の流れ */}
      <section style={{ background: "white", padding: "40px 16px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#7B6BA8", textTransform: "uppercase", marginBottom: "8px" }}>How it works</p>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1a1a1a", marginBottom: "28px" }}>参加するまでの3ステップ</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Step 01 */}
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#EDF4EE", borderRadius: "16px", padding: "16px" }}>
              <div style={{ flexShrink: 0, width: "44px", height: "44px", background: "#7B6BA8", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="1.7"/>
                  <path d="M21 21l-3.5-3.5" stroke="white" strokeWidth="1.7" strokeLinecap="round"/>
                  <path d="M8.5 11 Q11 8 13.5 11 Q11 14 8.5 11Z" fill="white"/>
                  <line x1="11" y1="11" x2="11" y2="13.5" stroke="#7B6BA8" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#7B6BA8", margin: "0 0 3px" }}>STEP 01</p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>体験を選ぶ</p>
                <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.7, margin: 0 }}>農業・料理・ものづくりなど、子どもの興味に合った体験を探す。カレンダーやカテゴリで絞り込めます。</p>
              </div>
            </div>
            {/* Step 02 */}
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#EDF4EE", borderRadius: "16px", padding: "16px" }}>
              <div style={{ flexShrink: 0, width: "44px", height: "44px", background: "#7B6BA8", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="3" width="14" height="18" rx="2" stroke="white" strokeWidth="1.7"/>
                  <path d="M9 3.5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="8" y1="10" x2="16" y2="10" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
                  <line x1="8" y1="13" x2="16" y2="13" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
                  <path d="M8 16.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#7B6BA8", margin: "0 0 3px" }}>STEP 02</p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>フォームから予約</p>
                <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.7, margin: 0 }}>参加したい体験を選んで、お名前・人数を入力するだけ。会員登録なしでも予約できます。</p>
              </div>
            </div>
            {/* Step 03 */}
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#EDF4EE", borderRadius: "16px", padding: "16px" }}>
              <div style={{ flexShrink: 0, width: "44px", height: "44px", background: "#7B6BA8", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="6" r="2.5" stroke="white" strokeWidth="1.6"/>
                  <path d="M4 20v-2a4 4 0 014-4h2a4 4 0 014 4v2" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="17" cy="5" r="1.8" stroke="white" strokeWidth="1.4" opacity="0.75"/>
                  <path d="M15.5 18.5v-1.5a3 3 0 013-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.75"/>
                  <path d="M19 10l.5-1.5M21 11.5l1.5-.5M20.5 13.5l1.5.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#7B6BA8", margin: "0 0 3px" }}>STEP 03</p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>当日参加するだけ</p>
                <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.7, margin: 0 }}>確認メールが届いたら準備完了。当日は会場に行くだけ。主催者が丁寧に案内します。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 会員CTA */}
      <section style={{ background: "linear-gradient(135deg, #2d5a3f, #4A7A5C)", padding: "40px 16px", position: "relative", overflow: "hidden" }}>
        {/* 葉の形の装飾SVG */}
        <svg style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.12 }} width="180" height="180" viewBox="0 0 180 180" fill="none">
          <ellipse cx="100" cy="60" rx="60" ry="35" transform="rotate(30 100 60)" fill="white"/>
          <ellipse cx="50" cy="110" rx="55" ry="32" transform="rotate(-20 50 110)" fill="white"/>
          <ellipse cx="130" cy="120" rx="45" ry="28" transform="rotate(15 130 120)" fill="white"/>
        </svg>
        <svg style={{ position: "absolute", bottom: "-30px", left: "-10px", opacity: 0.08 }} width="140" height="140" viewBox="0 0 140 140" fill="none">
          {[0,60,120,180,240,300].map((angle, i) => {
            const rad = angle * Math.PI / 180;
            const cx = 70 + 30 * Math.cos(rad);
            const cy = 70 + 30 * Math.sin(rad);
            return <circle key={i} cx={cx} cy={cy} r="22" fill="white"/>;
          })}
          <circle cx="70" cy="70" r="18" fill="white"/>
        </svg>
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          {/* あじさい花SVG（紫・緑の葉の上に咲くイメージ） */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: "0 auto 12px" }}>
            {[0,60,120,180,240,300].map((angle, i) => {
              const rad = angle * Math.PI / 180;
              const cx = 24 + 12 * Math.cos(rad);
              const cy = 24 + 12 * Math.sin(rad);
              return <circle key={i} cx={cx} cy={cy} r="8" fill="rgba(255,255,255,0.85)"/>;
            })}
            <circle cx="24" cy="24" r="7" fill="white"/>
          </svg>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "white", margin: "0 0 8px" }}>あじさい会員になる</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", margin: "0 0 20px", lineHeight: 1.7 }}>
            月額¥1,000で全ての体験が会員割引価格に。<br />新着体験の先行案内・コミュニティ優先参加も。
          </p>
          <a href="/mypage" style={{ display: "inline-block", background: "white", color: "#2d5a3f", borderRadius: "20px", padding: "13px 32px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
            今すぐ会員登録する →
          </a>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: "12px 0 0" }}>いつでも解約できます</p>
        </div>
      </section>

      {/* LINE CTA */}
      <section className="bg-[#06C755] py-12 px-6">
        <div className="max-w-[640px] mx-auto flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <div className="text-center sm:text-left">
            <p className="text-white font-bold text-lg mb-1.5">LINEで最新体験情報を受け取る</p>
            <p className="text-white/80 text-sm leading-relaxed">新しい体験の先行案内・限定クーポンをお届けします</p>
          </div>
          <a
            href="https://lin.ee/zmBRrUd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-white text-[#06C755] px-6 py-3.5 rounded-xl font-bold text-sm shrink-0 shadow-lg no-underline"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#06C755">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            LINE登録はこちら
          </a>
        </div>
      </section>

      {/* 人気の体験 */}
      {experiences.filter(e => e.isFeatured).length > 0 && (
        <section style={{ background: "#EDF4EE", padding: "32px 16px" }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#4A7A5C", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 4px" }}>Popular</p>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>注目の体験</h2>
              </div>
              <Link href="/experiences" style={{ fontSize: "12px", color: "#4A7A5C", fontWeight: 600, textDecoration: "none" }}>すべて見る →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {experiences.filter(e => e.isFeatured).slice(0, 4).map(exp => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-[720px] mx-auto">

          <p className="text-[11px] font-bold tracking-[0.14em] text-[#7B6BA8] uppercase mb-4">あじさいについて</p>

          <h2 className="text-xl font-bold text-[#222] leading-snug mb-6">
            「将来の夢がない」と答える子どもが、<br />福岡にも増えています。
          </h2>

          <div className="text-sm text-[#444] leading-[1.9] space-y-4 mb-10">
            <p>
              全国調査では、小学生の約4割が将来の夢を持てていません。<br />
              学校のキャリア教育の授業実施率はわずか5.7%。先生たちは過労死ラインを超えた働き方をしていて、物理的に動けない状況です。
            </p>
            <p>
              同時に、子育て中の保護者の6割以上が「孤独を感じる」と答えています。<br />
              悩みを相談できる場所も、同じ想いを持つ親と出会える場所も、なかなか見つからない。
            </p>
            <p>
              だから、あじさいをつくりました。<br />
              農家・料理人・職人——夢を追い続けている大人たちと、子どもたちが直接出会える体験の場を。そして、保護者同士がつながれるコミュニティを。
            </p>
            <p className="font-semibold text-[#222]">
              本物と出会った体験が、子どもの「なりたい」を育てると信じています。
            </p>
          </div>

          {/* Contact CTA */}
          <div className="bg-[#EDF4EE] rounded-2xl p-7">
            <p className="font-bold text-[#222] text-base mb-1">あじさいの取り組みに興味がありますか？</p>
            <p className="text-sm text-[#717171] leading-relaxed mb-5">
              体験の開催を考えている方・活動に共感してくれた方・一緒に何かやりたい方、まずはLINEで気軽にご連絡ください。
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href="https://lin.ee/zmBRrUd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#06C755] text-white px-6 py-3 rounded-full font-bold text-sm no-underline"
              >LINE で問い合わせる</a>
              <ProviderCTAButton className="inline-flex items-center gap-2 bg-[#7B6BA8] text-white px-6 py-3 rounded-full font-bold text-sm border-none cursor-pointer">
                体験を開催する
              </ProviderCTAButton>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
