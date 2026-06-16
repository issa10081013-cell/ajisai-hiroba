import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  // Insert sample providers
  const { data: providers, error: provErr } = await supabase
    .from("providers")
    .insert([
      {
        name: "山田農園",
        bio: "福岡市東区で30年以上野菜を育てる農家。旬の野菜収穫体験を提供しています。",
        image_url: "https://images.unsplash.com/photo-1595856898942-7d62e4d84ca1?w=400&h=400&q=80&auto=format&fit=crop",
        category: "農業体験",
        location: "東区",
        years_active: 30,
        total_participants: 500,
        tags: ["農業", "野菜", "収穫"],
      },
      {
        name: "田中シェフの料理教室",
        bio: "福岡市中央区在住の料理研究家。子ども向けの和食・お菓子作り教室を開催中。",
        image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&q=80&auto=format&fit=crop",
        category: "料理教室",
        location: "中央区",
        years_active: 8,
        total_participants: 300,
        tags: ["料理", "和食", "お菓子"],
      },
      {
        name: "森のクラフト工房",
        bio: "糸島の自然豊かな工房で木工・陶芸体験を提供。親子で本物の手仕事を体感できます。",
        image_url: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&h=400&q=80&auto=format&fit=crop",
        category: "ものづくり",
        location: "糸島市",
        years_active: 5,
        total_participants: 200,
        tags: ["木工", "陶芸", "クラフト"],
      },
    ])
    .select("id, name, category");

  if (provErr) {
    return NextResponse.json({ error: "providers insert failed: " + provErr.message }, { status: 500 });
  }

  const providerMap: Record<string, string> = {};
  for (const p of providers ?? []) {
    providerMap[p.name] = p.id;
  }

  // Insert sample experiences (dates in near future from 2026-06-15)
  const { error: expErr } = await supabase.from("experiences").insert([
    {
      provider_id: providerMap["山田農園"],
      title: "夏野菜の収穫体験 〜トマト・きゅうりを採ろう〜",
      description: "農家の山田さんと一緒に夏野菜を収穫！採れたての野菜を味見もできます。土に触れながら食育を楽しみましょう。",
      date: "2026-06-28",
      time_start: "10:00",
      time_end: "12:00",
      location: "福岡市東区（山田農園）",
      price_member: 800,
      price_regular: 1500,
      capacity: 8,
      current_bookings: 3,
      image_url: "https://images.unsplash.com/photo-1595856898942-7d62e4d84ca1?w=720&h=540&q=80&auto=format&fit=crop",
      category: "農業体験",
      tags: ["収穫", "食育", "夏野菜"],
    },
    {
      provider_id: providerMap["田中シェフの料理教室"],
      title: "親子でおにぎり＆お味噌汁教室",
      description: "旬の食材でおにぎりとお味噌汁を一緒に作りましょう。日本の食文化を楽しく学べます。",
      date: "2026-07-05",
      time_start: "10:30",
      time_end: "12:30",
      location: "福岡市中央区（田中シェフ料理教室）",
      price_member: 1200,
      price_regular: 2000,
      capacity: 6,
      current_bookings: 2,
      image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=720&h=540&q=80&auto=format&fit=crop",
      category: "料理教室",
      tags: ["料理", "和食", "食育"],
    },
    {
      provider_id: providerMap["森のクラフト工房"],
      title: "木のスプーン削り体験",
      description: "糸島の木工職人と一緒に、世界に一つだけのオリジナルスプーンを作ります。小学生以上のお子さんにおすすめ。",
      date: "2026-07-12",
      time_start: "13:00",
      time_end: "15:30",
      location: "糸島市（森のクラフト工房）",
      price_member: 2000,
      price_regular: 3000,
      capacity: 5,
      current_bookings: 0,
      image_url: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=720&h=540&q=80&auto=format&fit=crop",
      category: "ものづくり",
      tags: ["木工", "クラフト", "ものづくり"],
    },
    {
      provider_id: providerMap["山田農園"],
      title: "田んぼの生き物さがし＆泥あそび",
      description: "田んぼに入ってどろどろになりながら生き物を探そう！カエル・タニシ・カニに出会えるかも。",
      date: "2026-07-19",
      time_start: "09:30",
      time_end: "11:30",
      location: "福岡市東区（山田農園 田んぼ）",
      price_member: 0,
      price_regular: 500,
      capacity: 12,
      current_bookings: 5,
      image_url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=720&h=540&q=80&auto=format&fit=crop",
      category: "自然体験",
      tags: ["自然", "生き物", "泥あそび", "無料"],
    },
  ]);

  if (expErr) {
    return NextResponse.json({ error: "experiences insert failed: " + expErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "サンプルデータを追加しました" });
}
