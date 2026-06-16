import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const response = await openai.images.generate({
  model: "gpt-image-1",
  prompt: "A clean minimalist app logo icon: a single hydrangea (ajisai) flower cluster made of small rounded petals, soft purple and violet gradient, centered on pure white background. Flat vector illustration style, simple and elegant. No text, no letters, no frame. Just the flower icon, perfect circle composition, suitable for a small app icon.",
  n: 1,
  size: "1024x1024",
  quality: "medium",
});

const b64 = response.data[0].b64_json;
const buffer = Buffer.from(b64, "base64");
const fileName = `logo/ajisai-logo-${Date.now()}.png`;

const { data, error } = await supabase.storage
  .from("images")
  .upload(fileName, buffer, { contentType: "image/png", upsert: true });

if (error) {
  console.error("Upload error:", error.message);
  process.exit(1);
}

const { data: urlData } = supabase.storage.from("images").getPublicUrl(data.path);
console.log("LOGO_URL:", urlData.publicUrl);
