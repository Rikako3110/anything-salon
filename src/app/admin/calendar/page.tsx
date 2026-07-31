"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminNav from "@/components/AdminNav";

type Reservation = {
  id: string;
  date: string;
  time: string;
  menu_id: string;
  status: string;
  customers: {
    name: string;
  } | null;
};

export default function AdminCalendar() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in");
    if (loggedIn !== "true") {
      router.push("/admin/login");
      return;
    }
    setIsLoggedIn(true);
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchReservations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          id, date, time, menu_id, status,
          customers (name)
        `)
        .eq("date", selectedDate)
        .order("time", { ascending: true });

      if (!error) setReservations(data || []);
      setLoading(false);
    };

    fetchReservations();
  }, [selectedDate, isLoggedIn]);

  const menuNames: Record<string, string> = {
    facial: "フェイシャル",
    body: "ボディ",
    hair: "脱毛",
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">確認中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNav />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-light mb-6">予約カレンダー</h2>

        <div className="mb-8">
          <label className="text-sm text-gray-400">日付を選択</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="block w-full max-w-xs bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-2 text-white"
          />
        </div>

        <h3 className="text-lg mb-4">{selectedDate} の予約</h3>

        {loading ? (
          <p className="text-gray-400">読み込み中...</p>
        ) : reservations.length === 0 ? (
          <div className="border border-gray-800 rounded-2xl p-10 text-center text-gray-500">
            この日の予約はありません
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="border border-gray-800 rounded-2xl p-5 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg">
                    {r.time}　{r.customers?.name || "名前なし"} 様
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {menuNames[r.menu_id] || r.menu_id}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    r.status === "visited"
                      ? "bg-green-900 text-green-300"
                      : "border border-gray-600 text-gray-300"
                  }`}
                >
                  {r.status === "visited" ? "来店済み" : "予約済"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}