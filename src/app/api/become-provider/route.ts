import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, name, phone } = await req.json();
  if (!userId || !name) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("providers").insert({
    auth_user_id: userId,
    name,
    phone: phone ?? "",
    bio: "",
    location: "",
    category: "その他",
    tags: [],
    verified: false,
    agreed_terms_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
