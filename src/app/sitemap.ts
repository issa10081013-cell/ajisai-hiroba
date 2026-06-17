import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ajisai-hiroba.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: experiences } = await supabase
    .from("experiences")
    .select("id, updated_at")
    .order("date", { ascending: true });

  const experienceUrls = (experiences ?? []).map((e) => ({
    url: `${BASE_URL}/experiences/${e.id}`,
    lastModified: new Date(e.updated_at ?? Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/experiences`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/board`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...experienceUrls,
  ];
}
