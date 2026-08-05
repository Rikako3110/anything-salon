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
    phone: string;
  } | {
    name: string;
    phone: string;
  }[] | null;
};

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [monthCount, setMonthCount] = useState(0);
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.slice(0, 7);

  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in");
    if (loggedIn !== "true") {
      router.push("/admin/login");
      return;
    }
    setIsLoggedIn(true);

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          id, date, time, menu_id, status,
          customers (name, phone)
        `)
        .eq("date", today)
        .order("time", { ascending: true });

      if (!error) setReservations(data || []);

      const { count } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .gte("date", `${thisMonth}-01`)
        .lte("date", `${thisMonth}-31`);

      setMonthCount(count || 0);
      setLoading(false);
    };

    fetchData();
  }, [today, thisMonth, router]);

  const markAsVisited = async (id: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "visited" })
      .eq("id", id);

    if (!error) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "visited" } : r))
      );
    }
  };

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
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-gray-800 rounded-2xl p-5 text-center">
            <p className="text-gray-500 text-sm">今日の来店予定</p>
            <p className="text-2xl mt-2">{reservations.length}名</p>
          </div>
          <div className="border border-gray-800 rounded-2xl p-5 text-center">
            <p className="text-gray-500 text-sm">今月の予約数</p>
            <p className="text-2xl mt-2">{monthCount}件</p>
          </div>
          <div className="border border-gray-800 rounded-2xl p-5 text-center">
            <p className="text-gray-500 text-sm">来店済み</p>
            <p className="text-2xl mt-2">
              {reservations.filter((r) => r.status === "visited").length}名
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-light mb-2">本日の予約</h2>
        <p className="text-gray-500 text-sm mb-8">{today}</p>

        {loading ? (
          <p className="text-gray-400">読み込み中...</p>
        ) : reservations.length === 0 ? (
          <div className="border border-gray-800 rounded-2xl p-10 text-center text-gray-500">
            本日の予約はまだありません
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="border border-gray-800 rounded-2xl p-5 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-medium">
                    {Array.isArray(r.customers)
  ? r.customers[0]?.name || "名前なし"
  : r.customers?.name || "名前なし"}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {menuNames[r.menu_id] || r.menu_id}
                  </p>
                  <p className="text-gray-500 text-sm">{Array.isArray(r.customers)
  ? r.customers[0]?.phone
  : r.customers?.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {r.status === "visited" ? (
                    <span className="text-xs px-3 py-1 rounded-full bg-green-900 text-green-300">
                      来店済み
                    </span>
                  ) : (
                    <>
                      <span className="text-xs px-3 py-1 rounded-full border border-gray-600 text-gray-300">
                        予約済
                      </span>
                      <button
                        onClick={() => markAsVisited(r.id)}
                        className="text-xs px-3 py-1 rounded-full bg-white text-black"
                      >
                        来店済みにする
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}