import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { name, email, password, phone, location } = await req.json();

  if (!name || !email || !password || !phone || !location) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  // Supabase Authにユーザー作成
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return NextResponse.json({ error: "このメールアドレスはすでに登録されています" }, { status: 400 });
    }
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // providersテーブルにレコード作成
  const { error: providerError } = await supabaseAdmin.from("providers").insert({
    auth_user_id: authData.user.id,
    name,
    phone: phone ?? "",
    bio: "",
    location: location ?? "",
    category: "その他",
    tags: [],
    verified: false,
    agreed_terms_at: new Date().toISOString(),
  });

  if (providerError) {
    // ロールバック: authユーザー削除
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: "登録に失敗しました。もう一度お試しください。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
