import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY未設定" }, { status: 500 });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "STRIPE_PRICE_ID未設定" }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey);

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { userId, userEmail } = await req.json();

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "ユーザー情報が不足しています" }, { status: 400 });
    }

    const { data: mem } = await supabaseAdmin
      .from("memberships")
      .select("stripe_customer_id, status")
      .eq("user_id", userId)
      .single();

    if (mem?.status === "active") {
      return NextResponse.json({ error: "すでに会員です" }, { status: 400 });
    }

    let customerId = mem?.stripe_customer_id;

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
      line_items: [{ price: priceId.trim(), quantity: 1 }],
      success_url: `${baseUrl}/mypage?membership=success`,
      cancel_url: `${baseUrl}/mypage?membership=canceled`,
      locale: "ja",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
