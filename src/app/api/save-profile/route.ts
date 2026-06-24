import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, displayName, parentAgeRange, childrenCount, area, interests } =
    await req.json();

  if (!userId) {
    return NextResponse.json({ error: "ユーザーIDが必要です" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    display_name: displayName || null,
    parent_age_range: parentAgeRange || null,
    children_count:
      childrenCount !== undefined && childrenCount !== null && childrenCount !== ""
        ? parseInt(String(childrenCount), 10)
        : null,
    area: area || null,
    interests: Array.isArray(interests) && interests.length > 0 ? interests : null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
