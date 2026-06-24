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
    .select("title, date, time_start, current_bookings, price_member, price_regular, price_unit, providers(name, auth_user_id, phone, stripe_account_id, charges_enabled)")
    .eq("id", experienceId)
    .single();

  // 主催者のメールアドレスを取得
  const provider = exp?.providers as unknown as { name: string; auth_user_id: string; phone?: string; stripe_account_id?: string | null; charges_enabled?: boolean } | null;

  // 不正対策：この「無料予約」が本当に無料で許されるかをサーバー側で検証する。
  // 提供者が決済対応(Connect)済みで、かつ料金が0円より大きい場合は、ここで無料予約させない
  // （決済をスキップして有料体験をタダ取りされるのを防ぐ）。会員判定もサーバー側で行う。
  const paymentCapable = !!(provider?.stripe_account_id && provider?.charges_enabled);
  if (paymentCapable) {
    let isMember = false;
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const { data: mem } = await supabaseAdmin
          .from("memberships").select("status").eq("user_id", user.id).single();
        isMember = mem?.status === "active";
      }
    }
    const unit = (isMember ? exp?.price_member : exp?.price_regular) as number | undefined;
    const priceUnit = (exp as { price_unit?: string } | null)?.price_unit ?? "household";
    let amount = unit ?? 0;
    if (priceUnit === "person") amount = (unit ?? 0) * Math.max((adultsCount ?? 0) + (childrenCount ?? 0), 1);
    else if (priceUnit === "child") amount = (unit ?? 0) * Math.max(childrenCount ?? 0, 1);
    if (amount > 0) {
      return NextResponse.json({ error: "この体験はオンライン決済が必要です" }, { status: 400 });
    }
  }
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

  const dateLabel = exp?.date
    ? new Date(exp.date + "T00:00:00").toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })
    : exp?.date ?? "";

  if (resend) {
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

    // 参加者へ予約確認メール
    await resend.emails.send({
      from: "あじさい体験ひろば <noreply@ajisai-hiroba.com>",
      to: parentEmail,
      subject: `【予約確認】${exp?.title ?? "体験"} のご予約が完了しました`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <div style="background:linear-gradient(135deg,#a78bfa,#7B6BA8);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="font-size:32px;margin:0 0 8px;">🌸</p>
            <h2 style="color:white;margin:0;font-size:18px;">ご予約ありがとうございます！</h2>
          </div>
          <p style="color:#374151;">${parentName} 様、以下の体験のご予約が完了しました。</p>
          <div style="background:#F7F6FD;border-radius:12px;padding:16px;margin:16px 0;">
            <h3 style="color:#7B6BA8;margin:0 0 12px;font-size:15px;">${exp?.title}</h3>
            <p style="color:#374151;margin:4px 0;font-size:14px;">📅 ${dateLabel}</p>
            <p style="color:#374151;margin:4px 0;font-size:14px;">🕐 ${exp?.time_start}〜</p>
            <p style="color:#374151;margin:4px 0;font-size:14px;">👥 大人${adultsCount}人・子ども${childrenCount}人</p>
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

  return NextResponse.json({ ok: true });
}
