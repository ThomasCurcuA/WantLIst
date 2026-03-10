import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { senderId, senderName, senderAvatar, recipientId, items, message } = await req.json();

    if (!senderId || !recipientId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabaseAdmin.from("shared_lists").insert({
      sender_id: senderId,
      sender_name: senderName || "Unknown",
      sender_avatar: senderAvatar || null,
      recipient_id: recipientId,
      items,
      message: message || null,
    });

    if (error) {
      console.error("[share-wishes] Supabase error:", error.message, error.details, error.hint);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[share-wishes] catch error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
