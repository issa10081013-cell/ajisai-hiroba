import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    experienceId, parentName, parentEmail, parentPhone,
    childrenCount, adultsCount, message,
  } = body;

  // 体験と提供者情報を取得
  const { data: exp } = await supabaseAdmin
    .from("experiences")
    .select("title, date, time_start, current_bookings, providers(name, auth_user_id, phone)")
    .eq("id", experienceId)
    .single();

  // 主催者のメールアドレスを取得
  const provider = exp?.providers as { name: string; auth_user_id: string; phone?: string } | null;
  let providerEmail: string | null = null;
  if (provider?.auth_user_id) {
    const { data: { user: providerUser } } = await supabaseAdmin.auth.admin.getUserById(provider.auth_user_id);
    providerEmail = providerUser?.email ?? null;
  }

  // 予約をDBに保存
  const { error: bookingError } = await supabaseAdmin.from("bookings").insert({
    experience_id: experienceId,
    parent_name: parentName,
    parent_email: parentEmail,
    parent_phone: parentPhone,
    children_count: childrenCount,
    adults_count: adultsCount,
    message: message ?? "",
  });

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  // 残席数を減らす
  await supabaseAdmin
    .from("experiences")
    .update({ current_bookings: (exp?.current_bookings ?? 0) + 1 })
    .eq("id", experienceId);

  // 主催者へ予約通知メール
  if (resend && providerEmail) {
    await resend.emails.send({
      from: "あじさい体験ひろば <onboarding@resend.dev>",
      to: providerEmail,
      subject: `【予約通知】${exp?.title ?? "体験"} に新しい予約が入りました`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#7B6BA8;">新しい予約が入りました 🎉</h2>
          <p style="color:#374151;"><strong>体験名：</strong>${exp?.title}</p>
          <p style="color:#374151;"><strong>開催日：</strong>${exp?.date} ${exp?.time_start}〜</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
          <h3 style="color:#374151;font-size:14px;">参加者情報</h3>
          <p style="color:#374151;"><strong>保護者名：</strong>${parentName}</p>
          <p style="color:#374151;"><strong>メール：</strong><a href="mailto:${parentEmail}">${parentEmail}</a></p>
          ${parentPhone ? `<p style="color:#374151;"><strong>電話：</strong>${parentPhone}</p>` : ""}
          <p style="color:#374151;"><strong>人数：</strong>大人${adultsCount}人・子ども${childrenCount}人</p>
          ${message ? `<p style="color:#374151;"><strong>メッセージ：</strong>${message}</p>` : ""}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
          <p style="font-size:12px;color:#9ca3af;">あじさい体験ひろば</p>
        </div>
      `,
    });
  }


  return NextResponse.json({ ok: true });
}
