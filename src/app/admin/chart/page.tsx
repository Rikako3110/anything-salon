"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminNav from "@/components/AdminNav";

type Customer = {
  id: string;
  name: string;
  phone: string;
};

export default function AdminChart() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchName, setSearchName] = useState("");
  const [menu, setMenu] = useState("フェイシャル");
  const [skinCondition, setSkinCondition] = useState("");
  const [comment, setComment] = useState("");
  const [nextRecommend, setNextRecommend] = useState("");
  const [saving, setSaving] = useState(false);
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
    let query = supabase
      .from("customers")
      .select("id, name, phone")
      .order("created_at", { ascending: false })
      .limit(20);

    if (searchName.trim()) {
      query = query.ilike("name", `%${searchName.trim()}%`);
    }

    const { data } = await query;
    setCustomers(data || []);
    setSelectedCustomer(null);
  };

  const handleSave = async () => {
    if (!selectedCustomer) return;
    if (!skinCondition) {
      alert("肌状態を選択してください");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("charts").insert([
      {
        customer_id: selectedCustomer.id,
        menu,
        skin_condition: skinCondition,
        comment,
        next_recommend: nextRecommend,
      },
    ]);

    setSaving(false);

    if (error) {
      alert("保存に失敗しました: " + error.message);
      return;
    }

    setMessage("カルテを保存しました");
    setSkinCondition("");
    setComment("");
    setNextRecommend("");
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
        <h2 className="text-2xl font-light mb-6">電子カルテ</h2>

        {!selectedCustomer && (
          <div>
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="お客様の名前"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-white text-black px-5 py-3 rounded-xl"
              >
                検索
              </button>
            </div>

            <div className="space-y-3">
              {customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="w-full border border-gray-800 rounded-2xl p-4 text-left hover:border-gray-600"
                >
                  <p className="text-lg">{c.name} 様</p>
                  <p className="text-gray-500 text-sm">{c.phone}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedCustomer && (
          <div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-sm text-gray-400 hover:text-white mb-6"
            >
              ← 顧客選択に戻る
            </button>

            <div className="border border-gray-800 rounded-2xl p-6 mb-6">
              <p className="text-xl mb-1">{selectedCustomer.name} 様</p>
              <p className="text-gray-500 text-sm">{selectedCustomer.phone}</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-400">本日のメニュー</label>
                <select
                  value={menu}
                  onChange={(e) => setMenu(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white"
                >
                  <option value="フェイシャル">フェイシャル</option>
                  <option value="ボディ">ボディ</option>
                  <option value="脱毛">脱毛</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400">肌状態</label>
                <div className="flex gap-4 mt-2">
                  {["良好", "乾燥", "敏感"].map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="skin"
                        value={s}
                        checked={skinCondition === s}
                        onChange={(e) => setSkinCondition(e.target.value)}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">コメント・施術後の状態</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white"
                  placeholder="例：乾燥肌傾向、保湿ケアがおすすめ"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">次回おすすめ</label>
                <input
                  type="text"
                  value={nextRecommend}
                  onChange={(e) => setNextRecommend(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white"
                  placeholder="例：プレミアムケア"
                />
              </div>

              {message && (
                <p className="text-green-400 text-center text-sm">{message}</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-white text-black py-3 rounded-full font-medium disabled:opacity-40"
              >
                {saving ? "保存中..." : "保存する"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}