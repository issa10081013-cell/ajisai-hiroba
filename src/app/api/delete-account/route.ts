import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// App Store 審査対応（Guideline 5.1.1(v)）
// アプリ内でアカウントを完全削除するAPI。
// 本人確認 → 投稿・コメント・いいね・口コミ・予約・会員・ブロック等を削除 → 認証ユーザー本体を削除。

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // 本人確認
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const uid = user.id;
  const email = user.email ?? "";

  // 本人の生成データを削除（存在しないテーブルはスキップ扱いにする）
  const safeDelete = async (fn: () => PromiseLike<unknown>) => {
    try { await fn(); } catch { /* テーブルが無い等は無視して続行 */ }
  };

  await safeDelete(() => supabaseAdmin.from("post_likes").delete().eq("user_id", uid));
  await safeDelete(() => supabaseAdmin.from("post_comments").delete().eq("user_id", uid));
  await safeDelete(() => supabaseAdmin.from("posts").delete().eq("user_id", uid));
  await safeDelete(() => supabaseAdmin.from("reviews").delete().eq("user_id", uid));
  await safeDelete(() => supabaseAdmin.from("memberships").delete().eq("user_id", uid));
  await safeDelete(() => supabaseAdmin.from("reports").delete().eq("reporter_id", uid));
  await safeDelete(() => supabaseAdmin.from("user_blocks").delete().eq("blocker_id", uid));
  await safeDelete(() => supabaseAdmin.from("user_blocks").delete().eq("blocked_id", uid));
  await safeDelete(() => supabaseAdmin.from("banned_users").delete().eq("user_id", uid));
  if (email) {
    await safeDelete(() => supabaseAdmin.from("bookings").delete().eq("parent_email", email));
  }

  // アバター画像を削除
  await safeDelete(async () => {
    const { data: files } = await supabaseAdmin.storage.from("avatars").list(uid);
    if (files && files.length > 0) {
      await supabaseAdmin.storage.from("avatars").remove(files.map(f => `${uid}/${f.name}`));
    }
  });

  // 認証ユーザー本体を削除
  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
