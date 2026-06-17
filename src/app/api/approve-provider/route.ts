import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = "issa10081013@gmail.com";

export async function POST(req: NextRequest) {
  const { providerId, action, requesterId } = await req.json();

  // 管理者チェック
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(requesterId);
  if (user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  if (action === "approve") {
    await supabaseAdmin.from("providers").update({
      verified: true,
      verified_status: "approved",
    }).eq("id", providerId);
  } else if (action === "reject") {
    await supabaseAdmin.from("providers").update({
      verified: false,
      verified_status: "rejected",
    }).eq("id", providerId);
  }

  return NextResponse.json({ ok: true });
}
