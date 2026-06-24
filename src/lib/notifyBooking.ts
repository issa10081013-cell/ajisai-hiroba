import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type BookingDetails = {
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  childrenCount: number;
  adultsCount: number;
  message?: string;
};

/**
 * 予約確定後の処理：残席を1減らし、主催者と参加者にメール通知を送る。
 * 決済成功（webhook）または無料予約（/api/booking）の確定後に呼ぶ。
 */
export async function notifyBooking(experienceId: string, d: BookingDetails) {
  const { data: exp } = await supabaseAdmin
    .from("experiences")
    .select("title, date, time_start, current_bookings, providers(name, auth_user_id, phone)")
    .eq("id", experienceId)
    .single();

  const provider = exp?.providers as unknown as { name: string; auth_user_id: string; phone?: string } | null;
  let providerEmail: string | null = null;
  if (provider?.auth_user_id) {
    const { data: { user: providerUser } } = await supabaseAdmin.auth.admin.getUserById(provider.auth_user_id);
    providerEmail = providerUser?.email ?? null;
  }

  // 残席数を減らす
  await supabaseAdmin
    .from("experiences")
    .update({ current_bookings: (exp?.current_bookings ?? 0) + 1 })
    .eq("id", experienceId);

  const dateLabel = exp?.date
    ? new Date(exp.date + "T00:00:00").toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })
    : exp?.date ?? "";

  if (!resend) return;

  // 主催者へ予約通知メール
  if (providerEmail) {
    await resend.emails.send({
      from: "あじさい体験ひろば <noreply@ajisai-hiroba.com>",
      to: providerEmail,
      subject: `【予約通知】${exp?.title ?? "体験"} に新しい予約が入りました`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#7B6BA8;">新しい予約が入りました 🎉</h2>
          <p style="color:#374151;"><strong>体験名：</strong>${exp?.title}</p>
          <p style="color:#374151;"><strong>開催日：</strong>${dateLabel} ${exp?.time_start}〜</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
          <h3 style="color:#374151;font-size:14px;">参加者情報</h3>
          <p style="color:#374151;"><strong>お名前：</strong>${d.parentName}</p>
          <p style="color:#374151;"><strong>メール：</strong><a href="mailto:${d.parentEmail}">${d.parentEmail}</a></p>
          ${d.parentPhone ? `<p style="color:#374151;"><strong>電話：</strong>${d.parentPhone}</p>` : ""}
          <p style="color:#374151;"><strong>人数：</strong>大人${d.adultsCount}人・子ども${d.childrenCount}人</p>
          ${d.message ? `<p style="color:#374151;"><strong>メッセージ：</strong>${d.message}</p>` : ""}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
          <p style="font-size:12px;color:#9ca3af;">あじさい体験ひろば</p>
        </div>
      `,
    });
  }

  // 参加者へ予約確認メール
  await resend.emails.send({
    from: "あじさい体験ひろば <noreply@ajisai-hiroba.com>",
    to: d.parentEmail,
    subject: `【予約確認】${exp?.title ?? "体験"} のご予約が完了しました`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <div style="background:linear-gradient(135deg,#a78bfa,#7B6BA8);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="font-size:32px;margin:0 0 8px;">🌸</p>
          <h2 style="color:white;margin:0;font-size:18px;">ご予約ありがとうございます！</h2>
        </div>
        <p style="color:#374151;">${d.parentName} 様、以下の体験のご予約が完了しました。</p>
        <div style="background:#F7F6FD;border-radius:12px;padding:16px;margin:16px 0;">
          <h3 style="color:#7B6BA8;margin:0 0 12px;font-size:15px;">${exp?.title}</h3>
          <p style="color:#374151;margin:4px 0;font-size:14px;">📅 ${dateLabel}</p>
          <p style="color:#374151;margin:4px 0;font-size:14px;">🕐 ${exp?.time_start}〜</p>
          <p style="color:#374151;margin:4px 0;font-size:14px;">👥 大人${d.adultsCount}人・子ども${d.childrenCount}人</p>
        </div>
        <p style="color:#374151;font-size:13px;">当日は時間に余裕を持ってお越しください。ご不明な点は、下記の主催者まで直接ご連絡いただけます。</p>
        <div style="background:#F7F6FD;border-radius:12px;padding:12px 16px;margin:12px 0;">
          <p style="color:#7B6BA8;margin:0 0 6px;font-size:12px;font-weight:bold;">主催者の連絡先</p>
          <p style="color:#374151;margin:2px 0;font-size:13px;"><strong>主催者：</strong>${provider?.name ?? ""}</p>
          ${providerEmail ? `<p style="color:#374151;margin:2px 0;font-size:13px;"><strong>メール：</strong><a href="mailto:${providerEmail}">${providerEmail}</a></p>` : ""}
          ${provider?.phone ? `<p style="color:#374151;margin:2px 0;font-size:13px;"><strong>電話：</strong>${provider.phone}</p>` : ""}
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
        <p style="font-size:12px;color:#9ca3af;">あじさい体験ひろば</p>
      </div>
    `,
  });
}
