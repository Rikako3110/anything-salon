import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("LINE Webhook received:", JSON.stringify(body));

    if (body.events && Array.isArray(body.events)) {
      for (const event of body.events) {
        const lineUserId = event.source?.userId;
        console.log("Event type:", event.type, "User ID:", lineUserId);

        if (lineUserId) {
          const { data, error } = await supabase.from("line_users").upsert(
            {
              line_user_id: lineUserId,
              last_message_at: new Date().toISOString(),
            },
            { onConflict: "line_user_id" }
          );

          if (error) {
            console.error("Supabase error:", error);
          } else {
            console.log("Saved user:", lineUserId, data);
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "LINE webhook is ready" });
}