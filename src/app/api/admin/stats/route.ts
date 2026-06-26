import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 参加者数の集計から除外するアカウント（管理者本人・テスト用）
const EXCLUDED_EMAILS = new Set(["issa10081013@gmail.com", "test@ajisai.com"]);

export async function GET() {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    { count: totalProviders },
    { count: newThisWeek },
    { count: totalBookings },
    { data: locationData },
    { data: providerRows },
  ] = await Promise.all([
    supabaseAdmin.from("providers").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("providers").select("*", { count: "exact", head: true }).gte("created_at", weekStart.toISOString()),
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("providers").select("location"),
    supabaseAdmin.from("providers").select("auth_user_id"),
  ]);

  const byLocation: Record<string, number> = {};
  for (const row of locationData ?? []) {
    const loc = (row.location as string) || "未設定";
    byLocation[loc] = (byLocation[loc] ?? 0) + 1;
  }

  // 参加者（家族）＝認証アカウントのうち、提供者・管理者・テスト垢を除いた実登録者
  const providerIds = new Set((providerRows ?? []).map((r) => r.auth_user_id).filter(Boolean));
  let totalParticipants = 0;
  let participantsNewThisWeek = 0;
  let page = 1;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data) break;
    for (const u of data.users) {
      if (providerIds.has(u.id)) continue;
      if (u.email && EXCLUDED_EMAILS.has(u.email)) continue;
      totalParticipants++;
      if (u.created_at && new Date(u.created_at) >= weekStart) participantsNewThisWeek++;
    }
    if (data.users.length < 1000) break;
    page++;
  }

  return NextResponse.json({
    totalProviders: totalProviders ?? 0,
    newThisWeek: newThisWeek ?? 0,
    totalParticipants,
    participantsNewThisWeek,
    totalBookings: totalBookings ?? 0,
    byLocation,
  });
}
