import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { bookingId, userEmail } = await req.json();
  if (!bookingId || !userEmail) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  // 本人確認: 予約のメールアドレスと一致するか
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, experience_id, parent_email")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.parent_email !== userEmail) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  // 予約削除
  const { error } = await supabaseAdmin.from("bookings").delete().eq("id", bookingId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // current_bookings を -1
  const { data: exp } = await supabaseAdmin
    .from("experiences")
    .select("current_bookings")
    .eq("id", booking.experience_id)
    .single();

  if (exp && exp.current_bookings > 0) {
    await supabaseAdmin
      .from("experiences")
      .update({ current_bookings: exp.current_bookings - 1 })
      .eq("id", booking.experience_id);
  }

  return NextResponse.json({ ok: true });
}
