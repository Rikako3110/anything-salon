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
     return (
    <div className="min-h-screen bg-[#f7f5f2] text-[#4a453f]">
      <header className="bg-[#f7f5f2]/90 backdrop-blur border-b border-[#e8e4de] sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between px-6 py-4">
          <a href="/" className="text-xl tracking-[0.2em] font-light text-[#3d3935]">
            Anything
          </a>
          <a href="/" className="text-xs tracking-wider text-[#7a746c] hover:text-[#3d3935]">
            トップに戻る
          </a>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-light text-center mb-2 text-[#3d3935]">ご予約</h1>
        <p className="text-center text-[#a39e96] text-xs tracking-widest mb-10">
          STEP {step} / 4
        </p>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base mb-6 text-center text-[#7a746c]">
              メニューを選択してください
            </h2>
            {menus.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMenu(m.name);
                  setMenuId(m.id);
                  setStep(2);
                }}
                className="w-full bg-white border border-[#e8e4de] rounded-2xl p-5 text-left hover:border-[#c4bdb3] transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg text-[#3d3935]">{m.name}</p>
                    <p className="text-[#a39e96] text-sm mt-1">{m.duration}</p>
                  </div>
                  <p className="text-[#5c564f]">{m.price}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-base mb-6 text-center text-[#7a746c]">
              希望日を選択してください
            </h2>

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="px-3 py-1 border border-[#e8e4de] rounded-lg text-sm bg-white"
              >
                ←
              </button>
              <p className="text-base text-[#3d3935]">{monthLabel}</p>
              <button
                onClick={nextMonth}
                className="px-3 py-1 border border-[#e8e4de] rounded-lg text-sm bg-white"
              >
                →
              </button>
            </div>

            {loadingCalendar ? (
              <p className="text-[#a39e96] text-center py-10">読み込み中...</p>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#a39e96] mb-2">
                  {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
                    <div key={w} className="py-2">
                      {w}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {calendarDays.map((cell, i) => {
                    if (!cell) return <div key={"e-" + i} />;
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
                        className={
                          "aspect-square rounded-lg text-sm transition " +
                          (selected
                            ? "bg-[#5c564f] text-white"
                            : disabled
                            ? "text-[#d4cfc8] cursor-not-allowed"
                            : "bg-white text-[#3d3935] hover:bg-[#efebe6]")
                        }
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#a39e96] mb-6 text-center">
                  薄い日は予約できません（過去・NG日・満席）
                </p>
              </>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-[#c4bdb3] py-3 rounded-full text-sm"
              >
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
            <h2 className="text-base mb-2 text-center text-[#7a746c]">
              希望時間を選択してください
            </h2>
            <p className="text-[#a39e96] text-sm mb-6 text-center">{date}</p>

            {availableTimes.length === 0 ? (
              <p className="text-[#a39e96] mb-8 text-center">
                この日は空きがありません。別の日を選んでください。
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-8">
                {availableTimes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={
                      "py-3 rounded-xl border text-sm " +
                      (time === t
                        ? "border-[#5c564f] bg-[#5c564f] text-white"
                        : "border-[#e8e4de] bg-white hover:border-[#c4bdb3]")
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-[#c4bdb3] py-3 rounded-full text-sm"
              >
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
            <h2 className="text-base mb-6 text-center text-[#7a746c]">
              お客様情報を入力してください
            </h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs text-[#a39e96]">お名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 花子"
                  className="w-full bg-white border border-[#e8e4de] rounded-xl px-4 py-3 mt-1 text-[#3d3935]"
                />
              </div>
              <div>
                <label className="text-xs text-[#a39e96]">電話番号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="090-1234-5678"
                  className="w-full bg-white border border-[#e8e4de] rounded-xl px-4 py-3 mt-1 text-[#3d3935]"
                />
              </div>
            </div>

            <div className="bg-white border border-[#e8e4de] rounded-2xl p-5 mb-8 text-sm">
              <p className="text-[#a39e96] mb-2 text-xs">ご予約内容</p>
              <p>メニュー：{menu}</p>
              <p>
                日時：{date} {time}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 border border-[#c4bdb3] py-3 rounded-full text-sm"
              >
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