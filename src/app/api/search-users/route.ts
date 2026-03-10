import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { query, userId } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ users: [] });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Use service key to bypass RLS
    if (supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("id, email, username, avatar_url")
        .ilike("username", `%${query.trim()}%`)
        .neq("id", userId || "")
        .limit(10);
      return NextResponse.json({ users: data || [] });
    }

    // Fallback: use anon key (depends on RLS)
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data } = await supabase
        .from("profiles")
        .select("id, email, username, avatar_url")
        .ilike("username", `%${query.trim()}%`)
        .neq("id", userId || "")
        .limit(10);
      return NextResponse.json({ users: data || [] });
    }

    return NextResponse.json({ users: [] });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
