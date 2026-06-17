import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET() {
  // 明日の日付
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  // 明日開催の体験を取得
  const { data: experiences } = await supabaseAdmin
    .from("experiences")
    .select("id, title, date, time_start, time_end, location, providers(name)")
    .eq("date", tomorrowStr);

  if (!experiences || experiences.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let sent = 0;

  for (const exp of experiences) {
    const provider = exp.providers as { name: string } | null;
    const dateLabel = new Date(exp.date + "T00:00:00").toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric", weekday: "long",
    });

    // この体験の予約者を取得
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("parent_name, parent_email, adults_count, children_count")
      .eq("experience_id", exp.id);

    if (!bookings || bookings.length === 0) continue;

    for (const booking of bookings) {
      if (!resend || !booking.parent_email) continue;

      await resend.emails.send({
        from: "あじさい体験ひろば <noreply@ajisai-hiroba.com>",
        to: booking.parent_email,
        subject: `【明日開催】${exp.title} のリマインダー`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
            <div style="background:linear-gradient(135deg,#a78bfa,#7B6BA8);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
              <p style="font-size:32px;margin:0 0 8px;">🌸</p>
              <h2 style="color:white;margin:0;font-size:18px;">明日、体験があります！</h2>
            </div>
            <p style="color:#374151;">${booking.parent_name} 様</p>
            <p style="color:#374151;">明日の体験の時間が近づきました。お忘れなくご参加ください。</p>
            <div style="background:#F7F6FD;border-radius:12px;padding:16px;margin:16px 0;">
              <h3 style="color:#7B6BA8;margin:0 0 12px;font-size:15px;">${exp.title}</h3>
              <p style="color:#374151;margin:4px 0;font-size:14px;">📅 ${dateLabel}</p>
              <p style="color:#374151;margin:4px 0;font-size:14px;">🕐 ${exp.time_start}〜${exp.time_end}</p>
              <p style="color:#374151;margin:4px 0;font-size:14px;">📍 ${exp.location}</p>
              <p style="color:#374151;margin:4px 0;font-size:14px;">👥 大人${booking.adults_count}人・子ども${booking.children_count}人</p>
            </div>
            <p style="color:#374151;font-size:13px;">当日は時間に余裕を持ってお越しください。</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
            <p style="font-size:12px;color:#9ca3af;">主催者：${provider?.name ?? ""}</p>
            <p style="font-size:12px;color:#9ca3af;">あじさい体験ひろば</p>
          </div>
        `,
      });
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
