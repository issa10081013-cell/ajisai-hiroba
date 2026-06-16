import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ locked: false });

  const { data } = await supabaseAdmin
    .from("login_attempts")
    .select("attempts, locked_until")
    .eq("email", email)
    .single();

  if (!data) return NextResponse.json({ locked: false });

  if (data.locked_until && new Date(data.locked_until) > new Date()) {
    const minutesLeft = Math.ceil((new Date(data.locked_until).getTime() - Date.now()) / 60000);
    return NextResponse.json({ locked: true, minutesLeft });
  }

  return NextResponse.json({ locked: false, attempts: data.attempts ?? 0 });
}

export async function POST(req: NextRequest) {
  const { email, success } = await req.json();
  if (!email) return NextResponse.json({ ok: true });

  if (success) {
    await supabaseAdmin.from("login_attempts").upsert({
      email, attempts: 0, locked_until: null, updated_at: new Date().toISOString(),
    });
  } else {
    const { data } = await supabaseAdmin
      .from("login_attempts")
      .select("attempts")
      .eq("email", email)
      .single();
    const attempts = (data?.attempts ?? 0) + 1;
    const locked_until = attempts >= 10
      ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
      : null;
    await supabaseAdmin.from("login_attempts").upsert({
      email, attempts, locked_until, updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
