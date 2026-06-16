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
    .select("title, date, time_start, current_bookings, providers(name, auth_user_id)")
    .eq("id", experienceId)
    .single();

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

  // メール送信（無料プランのため登録メールに固定）
  if (resend) await resend.emails.send({
    from: "あじさい体験ひろば <onboarding@resend.dev>",
    to: "issa10081013@gmail.com",
    subject: `【予約通知】${exp?.title ?? "体験"} に新しい予約が入りました`,
    html: `
      <h2>新しい予約が入りました</h2>
      <p><strong>体験名：</strong>${exp?.title}</p>
      <p><strong>開催日：</strong>${exp?.date} ${exp?.time_start}〜</p>
      <hr />
      <p><strong>保護者名：</strong>${parentName}</p>
      <p><strong>メール：</strong>${parentEmail}</p>
      <p><strong>電話：</strong>${parentPhone}</p>
      <p><strong>子ども：</strong>${childrenCount}人 ／ 大人：${adultsCount}人</p>
      ${message ? `<p><strong>メッセージ：</strong>${message}</p>` : ""}
      <hr />
      <p>あじさい体験ひろばより</p>
    `,
  });


  return NextResponse.json({ ok: true });
}
