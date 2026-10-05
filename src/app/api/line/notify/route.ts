import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, menu, date, time } = await req.json();
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const staffId = process.env.STAFF_LINE_USER_ID;

    if (!token || !staffId) {
      return NextResponse.json(
        { error: "LINE token or staff id not set" },
        { status: 500 }
      );
    }

    const message = `新しい予約が入りました。

お名前：${name}
日時：${date} ${time}
メニュー：${menu}`;

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: staffId,
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