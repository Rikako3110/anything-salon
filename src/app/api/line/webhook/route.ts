import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function toHalfWidth(text: string) {
  return text.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
}

function digitsOnly(text: string) {
  return toHalfWidth(text).replace(/\D/g, "");
}

function extractPhone(text: string) {
  const compact = toHalfWidth(text).replace(/[ー−‐－\s]/g, "");
  const found = compact.match(/0\d{9,10}/);
  return found ? found[0] : null;
}

async function replyLine(text: string, userId?: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !userId) {
    console.error("LINE reply skipped", { hasToken: Boolean(token), userId });
    return;
  }

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

  const body = await res.text();
  console.log("LINE push status:", res.status, body);
}

async function findReservationsByPhone(phone: string) {
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone");

  const matched = (customers || []).filter(
    (c) => digitsOnly(c.phone || "") === phone
  );
  if (matched.length === 0) return [];

  const ids = matched.map((c) => c.id);
  const { data: reservations } = await supabase
    .from("reservations")
    .select("date, time, status, menu_id, customer_id")
    .in("customer_id", ids)
    .neq("status", "cancelled")
    .order("date", { ascending: true });

  const { data: menus } = await supabase.from("menus").select("id, name");
  const menuName = (id: string) =>
    menus?.find((m) => m.id === id)?.name || id;

  const today = new Date().toISOString().split("T")[0];
  const rows = reservations || [];
  const upcoming = rows.filter((r) => r.date >= today);
  const one = upcoming[0] || rows[rows.length - 1];
  const list = one ? [one] : [];

  return list.map((r) => {
    const customer = matched.find((c) => c.id === r.customer_id);
    return `${r.date} ${r.time}\n${menuName(r.menu_id)}\n${customer?.name || ""} 様`;
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    for (const event of body.events || []) {
      const lineUserId = event.source?.userId as string | undefined;
      if (!lineUserId) continue;

      if (event.type === "follow") {
        await supabase.from("line_users").upsert(
          {
            line_user_id: lineUserId,
            last_message_at: new Date().toISOString(),
          },
          { onConflict: "line_user_id" }
        );
        await replyLine(
          "友だち追加ありがとうございます。\n予約を確認するには、予約時の電話番号を送ってください。\n例：09012345678",
          lineUserId
        );
        continue;
      }

      if (event.type !== "message" || event.message?.type !== "text") {
        continue;
      }

      const text = String(event.message.text || "");
      let phone = extractPhone(text);

      if (!phone) {
        const { data: saved } = await supabase
          .from("line_users")
          .select("phone")
          .eq("line_user_id", lineUserId)
          .maybeSingle();
        phone = saved?.phone ? digitsOnly(saved.phone) : null;
      }

      await supabase.from("line_users").upsert(
        {
          line_user_id: lineUserId,
          last_message_at: new Date().toISOString(),
          ...(phone ? { phone } : {}),
        },
        { onConflict: "line_user_id" }
      );

      if (!phone) {
        await replyLine(
          "予約を確認するには、予約時の電話番号を送ってください。\n例：09012345678",
          lineUserId
        );
        continue;
      }

      const lines = await findReservationsByPhone(phone);
      if (lines.length === 0) {
        await replyLine(
          "その電話番号の予約は見つかりませんでした。",
          lineUserId
        );
        continue;
      }

      await replyLine(
        "ご予約はこちらです。\n\n" + lines.join("\n\n"),
        lineUserId
      );
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