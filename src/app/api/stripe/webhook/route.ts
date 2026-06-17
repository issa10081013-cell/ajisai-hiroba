import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

type StripeSubLike = { customer: string; current_period_end: number; status: string; cancel_at_period_end: boolean };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "署名なし" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "署名検証エラー" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      // サブスクリプション詳細を取得
      const subRaw = await stripe.subscriptions.retrieve(subscriptionId);
      const sub = subRaw as unknown as StripeSubLike;
      const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

      await supabaseAdmin.from("memberships")
        .update({
          stripe_subscription_id: subscriptionId,
          status: "active",
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.updated": {
      const subRaw = event.data.object as unknown as StripeSubLike;
      const customerId = subRaw.customer;
      const periodEnd = new Date(subRaw.current_period_end * 1000).toISOString();
      const status = subRaw.cancel_at_period_end
        ? "canceling"
        : subRaw.status === "active"
        ? "active"
        : "inactive";

      await supabaseAdmin.from("memberships")
        .update({
          status,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const subDel = event.data.object as unknown as { customer: string };
      const customerId = subDel.customer;

      await supabaseAdmin.from("memberships")
        .update({
          status: "inactive",
          stripe_subscription_id: null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
