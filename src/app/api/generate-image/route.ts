import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const CATEGORY_HINTS: Record<string, string> = {
  "農業体験": "farming, harvesting vegetables, rice field, Japanese countryside, children with baskets",
  "料理教室": "Japanese cooking class, children making onigiri or sushi, kitchen, warm lighting",
  "学習体験": "children learning, hands-on workshop, educational activity, Japan",
  "ものづくり": "crafts, pottery or woodworking, children in workshop, artisan studio Japan",
  "自然体験": "nature, outdoor play, forest or stream, Japanese countryside, families",
  "その他":   "family activity, children, Fukuoka Japan, community event",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OpenAI API key not set" }, { status: 500 });

  const { title, category } = await req.json();
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const hint = CATEGORY_HINTS[category] ?? CATEGORY_HINTS["その他"];
  const prompt = `A warm, vibrant, high-quality photograph for a family experience event in Fukuoka Japan. The event is: "${title}". Visual style: ${hint}. Show children and families having fun together. No faces visible - shot from behind or hands only. Bright natural lighting, joyful atmosphere. No text or letters in the image. Photorealistic.`;

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
    let base64 = "";
    if (imageData.b64_json) {
      base64 = imageData.b64_json;
    } else if (imageData.url) {
      const imageRes = await fetch(imageData.url);
      const arrayBuffer = await imageRes.arrayBuffer();
      base64 = Buffer.from(arrayBuffer).toString("base64");
    }
    if (!base64) throw new Error("画像が返ってきませんでした");

    return NextResponse.json({ base64, mimeType: "image/png" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
