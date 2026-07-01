import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// App Store 審査対応（Guideline 1.2 UGC）
// ユーザーが迷惑ユーザーをブロックするAPI。
// ブロック時に①ブロック関係を保存し②運営（開発者）へ通報として通知する。

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

  const { blockedId, blockedName, postId, reason } = await req.json();
  if (!blockedId) return NextResponse.json({ error: "blockedId required" }, { status: 400 });
  if (blockedId === user.id) return NextResponse.json({ error: "cannot block yourself" }, { status: 400 });

  // ① ブロック関係を保存
  const { error: blockErr } = await supabaseAdmin.from("user_blocks").upsert(
    {
      blocker_id: user.id,
      blocked_id: blockedId,
      blocked_name: blockedName ?? null,
      created_at: new Date().toISOString(),
    },
    { onConflict: "blocker_id,blocked_id" }
  );
  if (blockErr) return NextResponse.json({ error: blockErr.message }, { status: 500 });

  // ② 運営（開発者）へ通報として通知する（Apple 1.2要件：ブロックは不適切コンテンツを開発者に通知）
  await supabaseAdmin.from("reports").insert({
    reporter_id: user.id,
    target_type: postId ? "post" : "user",
    target_id: postId ?? blockedId,
    reason: reason ?? "ユーザーをブロック（不適切な言動）",
  });

  return NextResponse.json({ ok: true });
}
