import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: ユーザーをバン
export async function POST(req: NextRequest) {
  const { userId, reason } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("banned_users").upsert({
    user_id: userId,
    reason: reason ?? "管理者による停止",
    banned_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE: バン解除
export async function DELETE(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("banned_users").delete().eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// GET: バン済みユーザー一覧
export async function GET() {
  const { data, error } = await supabaseAdmin.from("banned_users").select("*").order("banned_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
