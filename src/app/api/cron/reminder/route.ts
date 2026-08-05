import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  // Vercel Cron からの呼び出しを簡易チェック
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "No LINE token" }, { status: 500 });
    }

    // 明日の日付（JST）
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    jst.setDate(jst.getDate() + 1);
    const tomorrow = jst.toISOString().split("T")[0];

    // 明日の予約を取得
    const { data: reservations, error } = await supabase
      .from("reservations")
      .select(`
        id,
        date,
        time,
        menu_id,
        status,
        customers (
          name,
          line_user_id
        )
      `)
      .eq("date", tomorrow)
      .eq("status", "confirmed");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const menuNames: Record<string, string> = {
      facial: "フェイシャル",
      body: "ボディ",
      hair: "脱毛",
    };

    let sent = 0;
    let skipped = 0;

    for (const r of reservations || []) {
      const customer = Array.isArray(r.customers)
        ? r.customers[0]
        : r.customers;

      const lineUserId = customer?.line_user_id;
      if (!lineUserId) {
        skipped++;
        continue;
      }

      const menu = menuNames[r.menu_id] || r.menu_id;
      const message = `Anythingです。
明日のご予約のお知らせです。

お名前：${customer?.name || ""}
日時：${r.date} ${r.time}
メニュー：${menu}

ご来店をお待ちしております。`;

      const res = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: lineUserId,
          messages: [{ type: "text", text: message }],
        }),
      });

      if (res.ok) sent++;
      else skipped++;
    }

    return NextResponse.json({
      ok: true,
      tomorrow,
      sent,
      skipped,
      total: reservations?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "failed" },
      { status: 500 }
    );
  }
}