export default function TokushoPage() {
  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "販売事業者名",
      value: "紫人彩",
    },
    {
      label: "代表者名",
      value: "井手壱彩",
    },
    {
      label: "所在地",
      value: (
        <>
          福岡県
          <br />
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
            ※特定商取引法第11条に基づき、請求があった場合は遅滞なく開示します
          </span>
        </>
      ),
    },
    {
      label: "連絡先",
      value: (
        <a href="mailto:issa10081013@gmail.com" style={{ color: "#7B6BA8" }}>
          issa10081013@gmail.com
        </a>
      ),
    },
    {
      label: "サービスの名称",
      value: "あじさい体験ひろば",
    },
    {
      label: "サービスの内容",
      value:
        "福岡の子育て家族向けの体験・イベント予約プラットフォーム。「あじさい会員」では会員限定割引価格での体験参加が可能。",
    },
    {
      label: "販売価格",
      value: (
        <>
          あじさい会員：月額 ¥1,000（税込）
          <br />
          各体験の参加費：各体験詳細ページに記載
        </>
      ),
    },
    {
      label: "価格以外の費用",
      value: "インターネット接続費用等（お客様の通信環境による）",
    },
    {
      label: "支払方法",
      value: "クレジットカード決済（Visa・Mastercard・American Express・JCB）",
    },
    {
      label: "支払時期",
      value:
        "あじさい会員：決済完了時に初回課金、以後毎月同日に自動更新・自動課金",
    },
    {
      label: "サービス提供時期",
      value: "決済完了後、即時に会員特典をご利用いただけます",
    },
    {
      label: "解約・キャンセルについて",
      value: (
        <>
          あじさい会員はマイページからいつでも解約できます。
          <br />
          解約月末日まで会員特典をご利用いただけます。
          <br />
          すでに支払済みの月額料金の返金は行いません。
          <br />
          各体験のキャンセルポリシーは体験詳細ページの記載に従います。
        </>
      ),
    },
    {
      label: "動作環境",
      value: "スマートフォン（iOS・Android）、PC（最新版ブラウザ推奨）",
    },
  ];

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px" }}>
        特定商取引法に基づく表示
      </h1>
      <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "40px" }}>
        最終更新日：2026年6月17日
      </p>

      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {rows.map(({ label, value }, i) => (
          <div
            key={label}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              borderTop: i === 0 ? "none" : "1px solid #E5E7EB",
            }}
          >
            <div
              style={{
                padding: "16px",
                background: "#F9F8FF",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {label}
            </div>
            <div
              style={{
                padding: "16px",
                fontSize: "13px",
                color: "#374151",
                lineHeight: 1.8,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "24px" }}>
        お問い合わせ：
        <a href="mailto:issa10081013@gmail.com" style={{ color: "#7B6BA8" }}>
          issa10081013@gmail.com
        </a>
      </p>
    </div>
  );
}
