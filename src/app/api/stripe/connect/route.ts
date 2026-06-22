import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// 提供者のStripe Connect（Express）オンボーディング。
// 銀行口座を登録して、体験の売上を直接受け取れるようにする。
export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY未設定" }, { status: 500 });
    }
    const stripe = new Stripe(stripeKey);
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { providerId } = await req.json();
    if (!providerId) {
      return NextResponse.json({ error: "providerIdが不足しています" }, { status: 400 });
    }

    const { data: provider } = await supabaseAdmin
      .from("providers")
      .select("id, stripe_account_id")
      .eq("id", providerId)
      .single();

    if (!provider) {
      return NextResponse.json({ error: "提供者が見つかりません" }, { status: 404 });
    }

    let accountId = provider.stripe_account_id as string | null;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "JP",
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: "individual",
      });
      accountId = account.id;
      await supabaseAdmin
        .from("providers")
        .update({ stripe_account_id: accountId })
        .eq("id", providerId);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ajisai-hiroba.vercel.app";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/admin/dashboard?connect=refresh`,
      return_url: `${baseUrl}/admin/dashboard?connect=done`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
