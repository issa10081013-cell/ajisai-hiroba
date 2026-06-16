import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generate(prompt, name) {
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "medium",
  });
  const buffer = Buffer.from(response.data[0].b64_json, "base64");
  const fileName = `icons/${name}-${Date.now()}.png`;
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, buffer, { contentType: "image/png", upsert: true });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from("images").getPublicUrl(data.path);
  console.log(`${name}: ${urlData.publicUrl}`);
}

await generate(
  "A warm illustration icon of a happy Japanese family — mother, father and young child — seen from the waist up, smiling together outdoors. Soft rounded illustration style, pastel purple and warm tones, white background. Clean simple icon, no text.",
  "participant"
);

await generate(
  "A warm illustration icon of a Japanese farmer or craftsperson — an adult seen from the waist up, wearing an apron or work clothes, holding vegetables or a craft tool, smiling outdoors. Soft rounded illustration style, green and earthy tones, white background. Clean simple icon, no text.",
  "host"
);
