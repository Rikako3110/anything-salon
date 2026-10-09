import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function digitsOnly(text: string) {
  return text
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\D/g, "");
}

async function pushLine(token: string, userId: string, text: string) {
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, menu, date, time } = await req.json();
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const staffId = process.env.STAFF_LINE_USER_ID;

    if (!token || !staffId) {
      return NextResponse.json(
        { error: "LINE token or staff id not set" },
        { status: 500 }
      );
    }

    await pushLine(
      token,
      staffId,
      `新しい予約が入りました。

お名前：${name}
日時：${date} ${time}
メニュー：${menu}`
    );

    let customerSent = false;
    const normalized = digitsOnly(String(phone || ""));

    if (normalized) {
      const { data: lineUsers } = await supabase
        .from("line_users")
        .select("line_user_id, phone");

      const matched = (lineUsers || []).find(
        (user) =>
          user.line_user_id &&
          user.line_user_id !== staffId &&
          digitsOnly(user.phone || "") === normalized
      );

      if (matched?.line_user_id) {
        await pushLine(
          token,
          matched.line_user_id,
          `Anythingです。
ご予約ありがとうございました。

お名前：${name}
日時：${date} ${time}
メニュー：${menu}

ご来店をお待ちしております。`
        );
        customerSent = true;
      }
    }

    return NextResponse.json({ ok: true, customerSent });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "failed" },
      { status: 500 }
    );
  }
}