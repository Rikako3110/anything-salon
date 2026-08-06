"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ALL_TIMES = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];

const menus = [
  { id: "facial", name: "フェイシャル", duration: "90分", price: "¥12,000" },
  { id: "body", name: "ボディ", duration: "90分", price: "¥15,000" },
  { id: "hair", name: "脱毛", duration: "60分〜", price: "¥8,000〜" },
];

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

  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoadingCalendar(true);

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDate = new Date(year, month + 1, 0);
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        endDate.getDate()
      ).padStart(2, "0")}`;

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

    fetchCalendarData();
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
    const taken = reservedMap[dateStr] || [];
    if (taken.length >= ALL_TIMES.length) return true;
    return false;
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (null | { day: number; dateStr: string })[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      cells.push({ day: d, dateStr });
    }
    return cells;
  }, [currentMonth]);

  const monthLabel = `${currentMonth.getFullYear()}年${
    currentMonth.getMonth() + 1
  }月`;

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
    setDate("");
    setTime("");
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
    setDate("");
    setTime("");
  };

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

      const { error: reservationError } = await supabase
        .from("reservations")
        .insert([
          {
            customer_id: customer.id,
            menu_id: menuId,
            date,
            time,
            status: "confirmed",
          },
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
        console.error("LINE通知エラー:", e);
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
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl font-light mb-4">ご予約ありがとうございました</h1>
        <p className="text-gray-400 text-center mb-8">
          {name} 様
          <br />
          {date} {time}
          <br />
          {menu}
        </p>
        <a href="/" className="bg-white text-black px-8 py-3 rounded-full">
          トップに戻る
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <a href="/" className="text-2xl font-bold tracking-wider">
          Anything
        </a>
        <a href="/" className="text-sm text-gray-400 hover:text-white">
          トップに戻る
        </a>
      </header>

      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-3xl font-light text-center mb-2">ご予約</h1>
        <p className="text-center text-gray-500 text-sm mb-10">
          Step {step} / 4
        </p>

        {/* Step 1: メニュー */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl mb-6">メニューを選択してください</h2>
            {menus.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMenu(m.name);
                  setMenuId(m.id);
                  setStep(2);
                }}
                className="w-full border border-gray-700 rounded-2xl p-5 text-left hover:border-white transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg">{m.name}</p>
                    <p className="text-gray-500 text-sm">{m.duration}</p>
                  </div>
                  <p className="text-gray-300">{m.price}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: カレンダー */}
        {step === 2 && (
          <div>
            <h2 className="text-xl mb-6">希望日を選択してください</h2>

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="px-3 py-1 border border-gray-700 rounded-lg text-sm"
              >
                ←
              </button>
              <p className="text-lg">{monthLabel}</p>
              <button
                onClick={nextMonth}
                className="px-3 py-1 border border-gray-700 rounded-lg text-sm"
              >
                →
              </button>
            </div>

            {loadingCalendar ? (
              <p className="text-gray-400 text-center py-10">読み込み中...</p>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                  {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
                    <div key={w} className="py-2">
                      {w}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {calendarDays.map((cell, i) => {
                    if (!cell) return <div key={`e-${i}`} />;
                    const disabled = isDisabledDate(cell.dateStr);
                    const selected = date === cell.dateStr;
                    return (
                      <button
                        key={cell.dateStr}
                        disabled={disabled}
                        onClick={() => {
                          setDate(cell.dateStr);
                          setTime("");
                        }}
                        className={`aspect-square rounded-lg text-sm transition ${
                          selected
                            ? "bg-white text-black"
                            : disabled
                            ? "text-gray-700 cursor-not-allowed"
                            : "hover:bg-gray-800 text-white"
                        }`}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mb-6">
                  灰色の日は予約できません（過去・NG日・満席）
                </p>
              </>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-600 py-3 rounded-full"
              >
                戻る
              </button>
              <button
                onClick={() => date && setStep(3)}
                disabled={!date}
                className="flex-1 bg-white text-black py-3 rounded-full disabled:opacity-40"
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 時間 */}
        {step === 3 && (
          <div>
            <h2 className="text-xl mb-2">希望時間を選択してください</h2>
