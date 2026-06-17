import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "ユーザーIDが必要です" }, { status: 400 });

    const { data: mem } = await supabaseAdmin
      .from("memberships")
      .select("stripe_subscription_id, status")
      .eq("user_id", userId)
      .single();

    if (!mem?.stripe_subscription_id) {
      return NextResponse.json({ error: "サブスクリプションが見つかりません" }, { status: 400 });
    }

    if (mem.status !== "active") {
      return NextResponse.json({ error: "有効な会員ではありません" }, { status: 400 });
    }

    await stripe.subscriptions.update(mem.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await supabaseAdmin.from("memberships").update({
      status: "canceling",
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
