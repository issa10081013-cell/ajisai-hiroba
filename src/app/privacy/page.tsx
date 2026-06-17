export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px" }}>プライバシーポリシー</h1>
      <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "40px" }}>最終更新日：2026年6月17日</p>

      {[
        {
          title: "1. 収集する情報",
          body: "当団体は以下の情報を収集します。①アカウント登録時の氏名・メールアドレス、②体験予約時の参加者情報（氏名・連絡先・参加人数）、③決済情報（Stripeを通じて処理され、当団体はカード番号を保持しません）、④サービス利用時のログ情報。",
        },
        {
          title: "2. 情報の利用目的",
          body: "収集した情報は以下の目的で利用します。①本サービスの提供・運営、②予約確認・キャンセル等の連絡、③会員サービスの管理、④サービス改善のための分析、⑤お知らせ・新着体験のご案内（会員向け）。",
        },
        {
          title: "3. 第三者への提供",
          body: "当団体は、ユーザーの同意なく個人情報を第三者に提供しません。ただし、体験の予約処理のために主催者へ参加者情報を提供する場合、および法令に基づく開示が必要な場合を除きます。",
        },
        {
          title: "4. 外部サービスの利用",
          body: "本サービスでは以下の外部サービスを利用しています。①Supabase（データベース・認証）、②Stripe（決済処理）、③Resend（メール送信）、④Vercel（ホスティング）。各サービスのプライバシーポリシーも合わせてご確認ください。",
        },
        {
          title: "5. 情報の管理",
          body: "当団体は個人情報の不正アクセス・紛失・改ざん等を防止するため、適切なセキュリティ対策を実施します。アカウントのパスワードは暗号化されて保存され、当団体も参照できません。",
        },
        {
          title: "6. Cookieの使用",
          body: "本サービスはログイン状態の維持のためにCookieを使用します。ブラウザの設定でCookieを無効にすることができますが、一部の機能が利用できなくなる場合があります。",
        },
        {
          title: "7. 個人情報の開示・訂正・削除",
          body: "ユーザーは自己の個人情報の開示・訂正・削除を請求することができます。ご希望の場合は下記のメールアドレスまでお問い合わせください。",
        },
        {
          title: "8. プライバシーポリシーの変更",
          body: "当団体は本ポリシーを随時変更することがあります。重要な変更がある場合はサービス上でお知らせします。",
        },
      ].map(({ title, body }) => (
        <div key={title} style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>{title}</h2>
          <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.8, margin: 0 }}>{body}</p>
        </div>
      ))}

      <div style={{ marginTop: "40px", padding: "20px", background: "#f9f8ff", borderRadius: "16px" }}>
        <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>
          個人情報に関するお問い合わせ：<a href="mailto:issa10081013@gmail.com" style={{ color: "#7B6BA8" }}>issa10081013@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
