import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { name, menu, date, time } = await req.json();
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "LINE token not set" },
        { status: 500 }
      );
    }

    // 保存されているLINEユーザーを取得（テスト用：最新の1件）
    const { data: users, error } = await supabase
      .from("line_users")
      .select("line_user_id")
      .order("last_message_at", { ascending: false })
      .limit(1);

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: "No LINE user found" },
        { status: 404 }
      );
    }

    const lineUserId = users[0].line_user_id;
    const message = `Anythingです。
ご予約ありがとうございました。

お名前：${name}
日時：${date} ${time}
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

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "failed" },
      { status: 500 }
    );
  }
}