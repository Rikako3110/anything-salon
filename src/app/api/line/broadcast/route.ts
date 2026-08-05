import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { target, title, body } = await req.json();
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "No LINE token" }, { status: 500 });
    }

    if (!body || !body.trim()) {
      return NextResponse.json({ error: "本文が空です" }, { status: 400 });
    }

    let query = supabase
      .from("customers")
      .select("line_user_id, name")
      .not("line_user_id", "is", null);

    // ターゲット絞り込み（簡易版）
    if (target === "linked") {
      // LINE連携済み全員（上記のまま）
    }

    const { data: customers, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const messageText = title
      ? `【${title}】\n\n${body}`
      : body;

    let sent = 0;
    let failed = 0;

    for (const c of customers || []) {
      if (!c.line_user_id) continue;

      const res = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: c.line_user_id,
          messages: [{ type: "text", text: messageText }],
        }),
      });

      if (res.ok) sent++;
      else failed++;
    }

    return NextResponse.json({
      ok: true,
      sent,
      failed,
      total: customers?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "failed" },
      { status: 500 }
    );
  }
}