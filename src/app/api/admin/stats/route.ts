import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    { count: totalProviders },
    { count: newThisWeek },
    { count: totalBookings },
    { data: locationData },
    { count: totalParticipants },
    { count: participantsNewThisWeek },
  ] = await Promise.all([
    supabaseAdmin.from("providers").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("providers").select("*", { count: "exact", head: true }).gte("created_at", weekStart.toISOString()),
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("providers").select("location"),
    // 参加者（家族）の登録数＝profilesテーブル。提供者しか集計されていなかったため追加。
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekStart.toISOString()),
  ]);

  const byLocation: Record<string, number> = {};
  for (const row of locationData ?? []) {
    const loc = (row.location as string) || "未設定";
    byLocation[loc] = (byLocation[loc] ?? 0) + 1;
  }

  return NextResponse.json({
    totalProviders: totalProviders ?? 0,
    newThisWeek: newThisWeek ?? 0,
    totalParticipants: totalParticipants ?? 0,
    participantsNewThisWeek: participantsNewThisWeek ?? 0,
    totalBookings: totalBookings ?? 0,
    byLocation,
  });
}
