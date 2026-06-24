import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 体験を削除する。予約(bookings)が体験を外部キー参照しているため、
// ブラウザ権限(RLS)では予約を消せず FK制約エラーになる。
// ここでサーバー権限(service role)で「予約→体験」の順に確実に削除する。
export async function POST(req: NextRequest) {
  const { experienceId } = await req.json();
  if (!experienceId) {
    return NextResponse.json({ error: "experienceId がありません" }, { status: 400 });
  }

  // 本人確認：ログイントークンから、この体験の提供者本人かを検証する
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  // 体験→提供者をたどり、提供者の auth_user_id が本人と一致するか確認
  const { data: exp } = await supabaseAdmin
    .from("experiences")
    .select("id, providers(auth_user_id)")
    .eq("id", experienceId)
    .single();
  if (!exp) {
    return NextResponse.json({ error: "体験が見つかりません" }, { status: 404 });
  }
  const provider = exp.providers as unknown as { auth_user_id: string | null } | null;
  if (!provider || provider.auth_user_id !== user.id) {
    return NextResponse.json({ error: "この体験を削除する権限がありません" }, { status: 403 });
  }

  // 予約が入っている体験は削除させない（参加した家族の予約が黙って消えるのを防ぐ）。
  // 提供者には「参加者に連絡してキャンセルしてから」削除するよう促す。
  const { count } = await supabaseAdmin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("experience_id", experienceId);
  if (count && count > 0) {
    return NextResponse.json({
      error: `この体験には予約が${count}件入っているため削除できません。参加者へご連絡のうえ、予約をキャンセルしてから削除してください。`,
      hasBookings: true,
      bookingCount: count,
    }, { status: 409 });
  }

  // 予約ゼロなら削除OK
  const { error: eErr } = await supabaseAdmin.from("experiences").delete().eq("id", experienceId);
  if (eErr) {
    return NextResponse.json({ error: "体験の削除に失敗: " + eErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
