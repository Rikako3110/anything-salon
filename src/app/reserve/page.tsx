"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ALL_TIMES = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];

type MenuItem = {
  id: string;
  name: string;
  duration: string | null;
  price: string | null;
  description: string | null;
};

export default function ReservePage() {
  const [step, setStep] = useState(1);
  const [menu, setMenu] = useState("");
  const [menuId, setMenuId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [reservedMap, setReservedMap] = useState<Record<string, string[]>>({});
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(true);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  useEffect(() => {
    const fetchMenus = async () => {
      setLoadingMenus(true);
      const { data } = await supabase
        .from("menus")
        .select("id, name, duration, price, description")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setMenus(data || []);
      setLoadingMenus(false);
    };
    fetchMenus();
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoadingCalendar(true);
      const y = currentMonth.getFullYear();
      const m = currentMonth.getMonth();
      const start = `${y}-${String(m + 1).padStart(2, "0")}-01`;
      const last = new Date(y, m + 1, 0).getDate();
      const end = `${y}-${String(m + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;

      const { data: blocked } = await supabase
        .from("blocked_dates")
        .select("date")
        .gte("date", start)
        .lte("date", end);
      setBlockedDates((blocked || []).map((b) => b.date));

      const { data: reservations } = await supabase
        .from("reservations")
        .select("date, time")
        .gte("date", start)
        .lte("date", end)
        .neq("status", "cancelled");

      const map: Record<string, string[]> = {};
      (reservations || []).forEach((r) => {
        if (!map[r.date]) map[r.date] = [];
        map[r.date].push(r.time);
      });
      setReservedMap(map);
      setLoadingCalendar(false);
    };
    run();
  }, [currentMonth]);

  useEffect(() => {
    if (!date) {
      setAvailableTimes([]);
      return;
    }
    const taken = reservedMap[date] || [];
    setAvailableTimes(ALL_TIMES.filter((t) => !taken.includes(t)));
  }, [date, reservedMap]);

  const isDisabledDate = (dateStr: string) => {
    if (dateStr < todayStr) return true;
    if (blockedDates.includes(dateStr)) return true;
    return (reservedMap[dateStr] || []).length >= ALL_TIMES.length;
  };

  const calendarDays = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: (null | { day: number; dateStr: string })[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }
    return cells;
  }, [currentMonth]);

  const monthLabel = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;

  const handleSubmit = async () => {
    if (!name || !phone) return;
    setLoading(true);
    try {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert([{ name, phone }])
        .select()
        .single();
      if (customerError) {
        alert("顧客保存エラー: " + customerError.message);
        return;
      }
      if (!customer) {
        alert("顧客データが取得できませんでした");
        return;
      }
      const { error: reservationError } = await supabase.from("reservations").insert([
        { customer_id: customer.id, menu_id: menuId, date, time, status: "confirmed" },
      ]);
      if (reservationError) {
        alert("予約保存エラー: " + reservationError.message);
        return;
      }
      try {
        await fetch("/api/line/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, menu, date, time }),
        });
      } catch (e) {
        console.error(e);
      }
      setSuccess(true);
    } catch (error: any) {
      alert("エラー: " + (error?.message || "不明なエラー"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] text-[#4a453f] flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-light mb-4">ご予約ありがとうございました</h1>
        <p className="text-[#7a746c] text-center mb-10 leading-relaxed">
          {name} 様<br />
          {date} {time}<br />
          {menu}
        </p>
        <a href="/" className="bg-[#5c564f] text-white px-8 py-3 rounded-full text-sm">
          トップに戻る
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-[#4a453f]">
      <header className="border-b border-[#e8e4de] sticky top-0 bg-[#f7f5f2]/90 backdrop-blur z-10">
        <div className="max-w-lg mx-auto flex justify-between items-center px-6 py-4">
          <a href="/" className="text-xl tracking-[0.2em] font-light">Anything</a>
          <a href="/" className="text-xs text-[#7a746c]">トップに戻る</a>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-light text-center mb-2">ご予約</h1>
        <p className="text-center text-[#a39e96] text-xs tracking-widest mb-10">STEP {step} / 4</p>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-center text-[#7a746c] mb-6">メニューを選択してください</h2>
            {loadingMenus ? (
              <p className="text-center text-[#a39e96]">読み込み中...</p>
            ) : menus.length === 0 ? (
              <p className="text-center text-[#a39e96]">メニューがありません</p>
            ) : (
              menus.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMenu(m.name);
                    setMenuId(m.id);
                    setStep(2);
                  }}
                  className="w-full bg-white border border-[#e8e4de] rounded-2xl p-5 text-left hover:border-[#c4bdb3]"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg">{m.name}</p>
                      <p className="text-sm text-[#a39e96] mt-1">
                        {m.duration}
                        {m.description ? ` / ${m.description}` : ""}
                      </p>
                    </div>
                    <p>{m.price}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-center text-[#7a746c] mb-6">希望日を選択してください</h2>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => {
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
                  setDate("");
                  setTime("");
                }}
                className="px-3 py-1 border border-[#e8e4de] rounded-lg bg-white text-sm"
              >
                ←
              </button>
              <p>{monthLabel}</p>
              <button
                onClick={() => {
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
                  setDate("");
                  setTime("");
                }}
                className="px-3 py-1 border border-[#e8e4de] rounded-lg bg-white text-sm"
              >
                →
              </button>
            </div>
            {loadingCalendar ? (
              <p className="text-center text-[#a39e96] py-10">読み込み中...</p>
            ) : (
              <>
                <div className="grid grid-cols-7 text-center text-xs text-[#a39e96] mb-2">
                  {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
                    <div key={w} className="py-2">{w}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {calendarDays.map((cell, i) =>
                    !cell ? (
                      <div key={"e" + i} />
                    ) : (
                      <button
                        key={cell.dateStr}
                        disabled={isDisabledDate(cell.dateStr)}
                        onClick={() => {
                          setDate(cell.dateStr);
                          setTime("");
                        }}
                        className={
                          "aspect-square rounded-lg text-sm " +
                          (date === cell.dateStr
                            ? "bg-[#5c564f] text-white"
                            : isDisabledDate(cell.dateStr)
                            ? "text-[#d4cfc8]"
                            : "bg-white hover:bg-[#efebe6]")
                        }
                      >
                        {cell.day}
                      </button>
                    )
                  )}
                </div>
                <p className="text-xs text-center text-[#a39e96] mb-6">
                  薄い日は予約できません（過去・NG日・満席）
                </p>
              </>
            )}
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 border border-[#c4bdb3] py-3 rounded-full text-sm">
                戻る
              </button>
              <button
                onClick={() => date && setStep(3)}
                disabled={!date}
                className="flex-1 bg-[#5c564f] text-white py-3 rounded-full text-sm disabled:opacity-40"
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-center text-[#7a746c] mb-2">希望時間を選択してください</h2>
            <p className="text-center text-[#a39e96] text-sm mb-6">{date}</p>
            {availableTimes.length === 0 ? (
              <p className="text-center text-[#a39e96] mb-8">この日は空きがありません</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-8">
                {availableTimes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={
                      "py-3 rounded-xl border text-sm " +
                      (time === t
                        ? "bg-[#5c564f] text-white border-[#5c564f]"
                        : "bg-white border-[#e8e4de]")
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 border border-[#c4bdb3] py-3 rounded-full text-sm">
                戻る
              </button>
              <button
                onClick={() => time && setStep(4)}
                disabled={!time}
                className="flex-1 bg-[#5c564f] text-white py-3 rounded-full text-sm disabled:opacity-40"
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-center text-[#7a746c] mb-6">お客様情報を入力してください</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs text-[#a39e96]">お名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 花子"
                  className="w-full bg-white border border-[#e8e4de] rounded-xl px-4 py-3 mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-[#a39e96]">電話番号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="090-1234-5678"
                  className="w-full bg-white border border-[#e8e4de] rounded-xl px-4 py-3 mt-1"
                />
              </div>
            </div>
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-5 mb-8 text-sm">
              <p className="text-xs text-[#a39e96] mb-2">ご予約内容</p>
              <p>メニュー：{menu}</p>
              <p>
                日時：{date} {time}
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(3)} className="flex-1 border border-[#c4bdb3] py-3 rounded-full text-sm">
                戻る
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name || !phone || loading}
                className="flex-1 bg-[#5c564f] text-white py-3 rounded-full text-sm disabled:opacity-40"
              >
                {loading ? "送信中..." : "予約を確定する"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}