"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

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

  const menus = [
    { id: "facial", name: "フェイシャル", duration: "90分", price: "¥12,000" },
    { id: "body", name: "ボディ", duration: "90分", price: "¥15,000" },
    { id: "hair", name: "脱毛", duration: "60分〜", price: "¥8,000〜" },
  ];

  const times = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];

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
            date: date,
            time: time,
            status: "confirmed",
          },
        ]);

      if (reservationError) {
        alert("予約保存エラー: " + reservationError.message);
        return;
      }

      // LINE通知（失敗しても予約は成功扱い）
      try {
        await fetch("/api/line/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            menu,
            date,
            time,
          }),
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
          {name} 様<br />
          {date} {time}<br />
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

        {step === 2 && (
          <div>
            <h2 className="text-xl mb-6">希望日を選択してください</h2>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white mb-8"
            />
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

        {step === 3 && (
          <div>
            <h2 className="text-xl mb-6">希望時間を選択してください</h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {times.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`py-3 rounded-xl border ${
                    time === t
                      ? "border-white bg-white text-black"
                      : "border-gray-700 hover:border-gray-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-600 py-3 rounded-full"
              >
                戻る
              </button>
              <button
                onClick={() => time && setStep(4)}
                disabled={!time}
                className="flex-1 bg-white text-black py-3 rounded-full disabled:opacity-40"
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl mb-6">お客様情報を入力してください</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm text-gray-400">お名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 花子"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">電話番号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="090-1234-5678"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white"
                />
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5 mb-8 text-sm">
              <p className="text-gray-400 mb-2">ご予約内容</p>
              <p>メニュー：{menu}</p>
              <p>
                日時：{date} {time}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 border border-gray-600 py-3 rounded-full"
              >
                戻る
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name || !phone || loading}
                className="flex-1 bg-white text-black py-3 rounded-full disabled:opacity-40"
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