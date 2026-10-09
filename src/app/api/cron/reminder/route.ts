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

export async function GET(req: NextRequest) {
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

    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    jst.setUTCDate(jst.getUTCDate() + 1);
    const tomorrow = jst.toISOString().split("T")[0];

    const { data: reservations, error } = await supabase
      .from("reservations")
      .select("id, date, time, menu_id, customers(name, phone)")
      .eq("date", tomorrow)
      .eq("status", "confirmed");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: lineUsers } = await supabase
      .from("line_users")
      .select("line_user_id, phone");

    const { data: menus } = await supabase.from("menus").select("id, name");

    const byPhone = new Map<string, string>();
    for (const user of lineUsers || []) {
      if (!user.phone || !user.line_user_id) continue;
      byPhone.set(digitsOnly(user.phone), user.line_user_id);
    }

    const menuName = (id: string) => {
      const found = menus?.find((menu) => menu.id === id);
      if (found?.name) return found.name;
      if (id === "facial") return "フェイシャル";
      if (id === "body") return "ボディ";
      if (id === "hair") return "脱毛";
      return id;
    };

    let sent = 0;
    let skipped = 0;

    for (const reservation of reservations || []) {
      const customer = Array.isArray(reservation.customers)
        ? reservation.customers[0]
        : reservation.customers;
      const phone = digitsOnly(customer?.phone || "");
      const lineUserId = phone ? byPhone.get(phone) : undefined;

      if (!lineUserId) {
        skipped++;
        continue;
      }

      const message = `Anythingです。
明日のご予約のお知らせです。

お名前：${customer?.name || ""}
日時：${reservation.date} ${reservation.time}
メニュー：${menuName(reservation.menu_id)}

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