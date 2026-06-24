import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// 手数料率。デフォルト0%（アプリ開始時の無料期間）。
// 月2から10%にする時は、Vercelの環境変数 STRIPE_APP_FEE_RATE=0.1 を設定するだけ（再デプロイ不要）。
const APP_FEE_RATE = process.env.STRIPE_APP_FEE_RATE ? Number(process.env.STRIPE_APP_FEE_RATE) : 0;

// 体験予約の決済セッションを作る。
// お金は提供者の口座へ直接（destination charge）、あじさいは10%だけ（application_fee）。
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

    const b = await req.json();
    const {
      experienceId, parentName, parentEmail, parentPhone,
      childrenCount, adultsCount, message,
    } = b;

    // 会員かどうかは「ブラウザの自己申告」を信じず、サーバー側で本人確認してから判定する。
    // （リクエストを細工して会員価格を不正取得されるのを防ぐ）
    let isMember = false;
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const { data: mem } = await supabaseAdmin
          .from("memberships").select("status").eq("user_id", user.id).single();
        isMember = mem?.status === "active";
      }
    }

    const { data: exp } = await supabaseAdmin
      .from("experiences")
      .select("title, price_member, price_regular, price_unit, providers(stripe_account_id, charges_enabled)")
      .eq("id", experienceId)
      .single();

    if (!exp) {
      return NextResponse.json({ error: "体験が見つかりません" }, { status: 404 });
    }

    const provider = exp.providers as unknown as { stripe_account_id: string | null; charges_enabled: boolean } | null;

    // 提供者がまだ決済設定（Connect）を完了していない場合は、決済不可（フォーム側で無料予約にフォールバック）
    if (!provider?.stripe_account_id || !provider.charges_enabled) {
      return NextResponse.json({ error: "この体験はまだ決済に対応していません", noPayment: true }, { status: 400 });
    }

    // 料金のかけ方（household=世帯定額 / person=1人ごと / child=子どもごと）
    const unit = (isMember ? exp.price_member : exp.price_regular) as number; // JPYは最小単位＝円
    const priceUnit = ((exp as { price_unit?: string }).price_unit ?? "household");
    const children = childrenCount ?? 0;
    const adults = adultsCount ?? 0;
    let amount = unit; // household（世帯定額）
    if (priceUnit === "person") amount = unit * Math.max(adults + children, 1);
    else if (priceUnit === "child") amount = unit * Math.max(children, 1);

    // 無料（¥0）の体験は決済を作らない。Stripeは¥0決済を作れずエラーになるため、
    // 提供者が決済設定済みでも、料金0円なら無料予約フローにフォールバックさせる。
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "無料の体験です", noPayment: true }, { status: 400 });
    }

    const applicationFee = Math.round(amount * APP_FEE_RATE);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ajisai-hiroba.vercel.app";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "jpy",
          product_data: { name: exp.title },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: applicationFee,                       // あじさいの取り分（10%）
        transfer_data: { destination: provider.stripe_account_id },   // 残りは提供者へ直接
      },
      customer_email: parentEmail,
      locale: "ja",
      success_url: `${baseUrl}/experiences/${experienceId}?booking=success`,
      cancel_url: `${baseUrl}/experiences/${experienceId}?booking=canceled`,
      metadata: {
        type: "booking",
        experienceId,
        parentName, parentEmail, parentPhone: parentPhone ?? "",
        childrenCount: String(childrenCount ?? 0),
        adultsCount: String(adultsCount ?? 0),
        message: message ?? "",
        amount: String(amount),
        applicationFee: String(applicationFee),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
