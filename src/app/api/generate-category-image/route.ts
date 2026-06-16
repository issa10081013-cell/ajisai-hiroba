import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const PROMPTS: Record<string, string> = {
  hero: "Four joyful Japanese children aged 5-8 running freely in a bright golden sunny meadow, laughing with big smiles, holding colorful balloons (red yellow green blue) floating in the air, soap bubbles drifting around them. Beautiful blue and purple hydrangea flowers (ajisai) blooming softly in the foreground. Warm golden hour sunlight, lush green grass, clear sky with soft clouds. Bright cheerful joyful atmosphere. Wide horizontal cinematic composition. Photorealistic high quality lifestyle photography.",
  農業体験: "Japanese children from behind harvesting vegetables in a sunny farm field in Fukuoka Japan. Kids with baskets picking tomatoes and cucumbers. Lush green countryside, warm summer light. No faces visible. Documentary photography style. Photorealistic.",
  料理教室: "Children's hands making onigiri or sushi rolls in a cozy Japanese kitchen. Close-up of small hands shaping rice. Wooden kitchen counters, warm lighting. No faces. Lifestyle photography style. Photorealistic.",
  学習体験: "Children's hands doing a fun educational craft workshop in Japan. Hands-on activity with colorful materials. Bright modern space. No faces visible. Photorealistic.",
  ものづくり: "Children's hands crafting pottery or wooden toys in a traditional Japanese workshop. Small hands with clay tools. Warm artisan studio with natural light. No faces. Photorealistic.",
  自然体験: "Children from behind splashing in a clear stream or exploring a forest path near Fukuoka Japan. Green trees, golden sunlight filtering through leaves. No faces visible. Outdoor adventure atmosphere. Photorealistic.",
  その他: "A lively family event in Fukuoka Japan's shopping district. Colorful decorations, community gathering atmosphere. People from behind. Vibrant and warm atmosphere. Photorealistic.",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OpenAI API key not set" }, { status: 500 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { category } = await req.json();
  const prompt = PROMPTS[category];
  if (!prompt) return NextResponse.json({ error: "Unknown category" }, { status: 400 });

  let imageBuffer: Buffer;
  const mimeType = "image/png";

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1536x1024",
      quality: "medium",
    });
    const imageData = response.data[0];
    if (imageData.b64_json) {
      imageBuffer = Buffer.from(imageData.b64_json, "base64");
    } else if (imageData.url) {
      const imageRes = await fetch(imageData.url);
      if (!imageRes.ok) throw new Error("画像のダウンロードに失敗しました");
      imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    } else {
      throw new Error("画像データが返ってきませんでした");
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Generation failed" }, { status: 502 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const KEY_MAP: Record<string, string> = {
    hero: "hero", 農業体験: "farming", 料理教室: "cooking",
    学習体験: "learning", ものづくり: "crafts", 自然体験: "nature", その他: "other",
  };
  const safeKey = KEY_MAP[category] ?? category.replace(/[^\w-]/g, "_");
  const fileName = `category/${safeKey}-${Date.now()}.png`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("images")
    .upload(fileName, imageBuffer, { contentType: mimeType, upsert: true });

  if (uploadError) {
    const base64 = imageBuffer.toString("base64");
    return NextResponse.json({ base64, mimeType, publicUrl: null, uploadError: uploadError.message });
  }

  const { data: urlData } = supabase.storage.from("images").getPublicUrl(uploadData.path);
  return NextResponse.json({ publicUrl: urlData.publicUrl, base64: null });
}
