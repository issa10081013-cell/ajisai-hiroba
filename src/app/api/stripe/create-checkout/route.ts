import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, userEmail } = await req.json();

  if (!userId || !userEmail) {
    return NextResponse.json({ error: "ユーザー情報が不足しています" }, { status: 400 });
  }

  // 既存のStripeカスタマーIDを確認
  const { data: mem } = await supabaseAdmin
    .from("memberships")
    .select("stripe_customer_id, status")
    .eq("user_id", userId)
    .single();

  // すでにアクティブな会員なら拒否
  if (mem?.status === "active") {
    return NextResponse.json({ error: "すでに会員です" }, { status: 400 });
  }

  let customerId = mem?.stripe_customer_id;

  // カスタマーIDがなければ作成
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { supabase_user_id: userId },
    });
    customerId = customer.id;

    await supabaseAdmin.from("memberships").upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      status: "inactive",
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ajisai-hiroba.vercel.app";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/mypage?membership=success`,
    cancel_url: `${baseUrl}/mypage?membership=canceled`,
    locale: "ja",
  });

  return NextResponse.json({ url: session.url });
}
