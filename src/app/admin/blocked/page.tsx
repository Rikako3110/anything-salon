"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminNav from "@/components/AdminNav";

type BlockedDate = {
  id: string;
  date: string;
  reason: string | null;
};

export default function AdminBlocked() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in");
    if (loggedIn !== "true") {
      router.push("/admin/login");
      return;
    }
    setIsLoggedIn(true);
    fetchBlocked();
  }, [router]);

  const fetchBlocked = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("date", { ascending: true });
    setBlockedDates(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!date) {
      alert("日付を選んでください");
      return;
    }

    const { error } = await supabase.from("blocked_dates").insert([
      { date, reason: reason || null },
    ]);

    if (error) {
      alert("追加に失敗しました: " + error.message);
      return;
    }

    setDate("");
    setReason("");
    fetchBlocked();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このNG日を削除しますか？")) return;

    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("id", id);

    if (error) {
      alert("削除に失敗しました");
      return;
    }
    fetchBlocked();
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

      <div className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-2xl font-light mb-2">予約NG日の設定</h2>
        <p className="text-gray-500 text-sm mb-8">
          ここに登録した日は、お客様が予約できません
        </p>

        <div className="border border-gray-800 rounded-2xl p-6 mb-8 space-y-4">
          <div>
            <label className="text-sm text-gray-400">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">理由（任意）</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="定休日・研修など"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-white text-black py-3 rounded-full font-medium"
          >
            NG日に追加
          </button>
        </div>

        <h3 className="text-lg mb-4">登録済みのNG日</h3>
        {loading ? (
          <p className="text-gray-400">読み込み中...</p>
        ) : blockedDates.length === 0 ? (
          <p className="text-gray-500">まだありません</p>
        ) : (
          <div className="space-y-3">
            {blockedDates.map((b) => (
              <div
                key={b.id}
                className="border border-gray-800 rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p>{b.date}</p>
                  {b.reason && (
                    <p className="text-gray-500 text-sm">{b.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}