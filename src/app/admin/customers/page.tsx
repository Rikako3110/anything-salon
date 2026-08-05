"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminNav from "@/components/AdminNav";

type Customer = {
  id: string;
  name: string;
  phone: string;
  line_user_id: string | null;
  created_at: string;
};

type LineUser = {
  line_user_id: string;
  last_message_at: string | null;
};

type Reservation = {
  id: string;
  date: string;
  time: string;
  menu_id: string;
  status: string;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lineUsers, setLineUsers] = useState<LineUser[]>([]);
  const [searchName, setSearchName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerReservations, setCustomerReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in");
    if (loggedIn !== "true") {
      router.push("/admin/login");
      return;
    }
    setIsLoggedIn(true);
  }, [router]);

  const handleSearch = async () => {
    setLoading(true);
    setSelectedCustomer(null);
    setMessage("");

    let query = supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (searchName.trim()) {
      query = query.ilike("name", `%${searchName.trim()}%`);
    }

    const { data } = await query.limit(20);
    setCustomers(data || []);
    setLoading(false);
  };

  const selectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedLineId(customer.line_user_id || "");
    setMessage("");
    setLoading(true);

    const { data: reservations } = await supabase
      .from("reservations")
      .select("id, date, time, menu_id, status")
      .eq("customer_id", customer.id)
      .order("date", { ascending: false });

    setCustomerReservations(reservations || []);

    const { data: lines } = await supabase
      .from("line_users")
      .select("line_user_id, last_message_at")
      .order("last_message_at", { ascending: false });

    setLineUsers(lines || []);
    setLoading(false);
  };

  const handleLink = async () => {
    if (!selectedCustomer || !selectedLineId) {
      alert("LINE IDを選択してください");
      return;
    }

    const { error } = await supabase
      .from("customers")
      .update({ line_user_id: selectedLineId })
      .eq("id", selectedCustomer.id);

    if (error) {
      alert("紐づけに失敗しました: " + error.message);
      return;
    }

    setSelectedCustomer({ ...selectedCustomer, line_user_id: selectedLineId });
    setMessage("LINE IDを紐づけました");
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
        <h2 className="text-2xl font-light mb-6">顧客管理</h2>

        {!selectedCustomer && (
          <>
            <div className="flex gap-3 mb-8">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="名前で検索"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-white text-black px-6 py-3 rounded-xl font-medium"
              >
                検索
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="text-gray-400">検索中...</p>
              ) : customers.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  検索ボタンを押すか、名前を入力して検索してください
                </p>
              ) : (
                customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCustomer(c)}
                    className="w-full border border-gray-800 rounded-2xl p-5 text-left hover:border-gray-600 transition"
                  >
                    <p className="text-lg">{c.name} 様</p>
                    <p className="text-gray-500 text-sm mt-1">{c.phone}</p>
                    <p className="text-gray-600 text-xs mt-1">
                      {c.line_user_id ? "LINE連携済み" : "LINE未連携"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {selectedCustomer && (
          <div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-sm text-gray-400 hover:text-white mb-6"
            >
              ← 一覧に戻る
            </button>

            <div className="border border-gray-800 rounded-2xl p-6 mb-8">
              <h3 className="text-xl mb-4">{selectedCustomer.name} 様</h3>
              <p className="text-gray-400 text-sm">電話番号：{selectedCustomer.phone}</p>
              <p className="text-gray-400 text-sm mt-1">
                来店回数：{customerReservations.length}回
              </p>
              <p className="text-gray-400 text-sm mt-1">
                LINE：{selectedCustomer.line_user_id ? "連携済み" : "未連携"}
              </p>
            </div>

            {/* LINE紐づけ */}
            <div className="border border-gray-800 rounded-2xl p-6 mb-8">
              <h4 className="text-lg mb-4">LINE連携</h4>
              <select
                value={selectedLineId}
                onChange={(e) => setSelectedLineId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white mb-4"
              >
                <option value="">LINEユーザーを選択</option>
                {lineUsers.map((u) => (
                  <option key={u.line_user_id} value={u.line_user_id}>
                    {u.line_user_id.slice(0, 12)}...
                    {u.last_message_at
                      ? `（最終：${u.last_message_at.slice(0, 10)}）`
                      : ""}
                  </option>
                ))}
              </select>
              <button
                onClick={handleLink}
                className="bg-white text-black px-6 py-2 rounded-full text-sm"
              >
                このお客様に紐づける
              </button>
              {message && (
                <p className="text-green-400 text-sm mt-3">{message}</p>
              )}
            </div>

            <h4 className="text-lg mb-4">過去の予約</h4>
            {loading ? (
              <p className="text-gray-400">読み込み中...</p>
            ) : customerReservations.length === 0 ? (
              <p className="text-gray-500">予約履歴がありません</p>
            ) : (
              <div className="space-y-3">
                {customerReservations.map((r) => (
                  <div
                    key={r.id}
                    className="border border-gray-800 rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <p>
                        {r.date} {r.time}
                      </p>
                      <p className="text-gray-400 text-sm">
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
        )}
      </div>
    </div>
  );
}