import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // LINEからのイベントを処理
    if (body.events && Array.isArray(body.events)) {
      for (const event of body.events) {
        // 友だち追加 or メッセージ受信時
        if (
          event.type === "follow" ||
          event.type === "message"
        ) {
          const lineUserId = event.source?.userId;

          if (lineUserId) {
            // line_users テーブルに保存（なければ作る）
            await supabase.from("line_users").upsert(
              {
                line_user_id: lineUserId,
                last_message_at: new Date().toISOString(),
              },
              { onConflict: "line_user_id" }
            );
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true }); // LINEには常に200を返す
  }
}

// LINEの接続確認用
export async function GET() {
  return NextResponse.json({ status: "LINE webhook is ready" });
}