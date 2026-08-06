"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminNav from "@/components/AdminNav";

type Menu = {
  id: string;
  name: string;
  duration: string | null;
  price: string | null;
  description: string | null;
  category: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

export default function AdminMenus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in");
    if (loggedIn !== "true") {
      router.push("/admin/login");
      return;
    }
    setIsLoggedIn(true);
    fetchMenus();
  }, [router]);

  const fetchMenus = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("menus")
      .select("*")
      .order("sort_order", { ascending: true });
    setMenus(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      alert("メニュー名を入力してください");
      return;
    }

    const { error } = await supabase.from("menus").insert([
      {
        name: name.trim(),
        duration: duration || null,
        price: price || null,
        description: description || null,
        category: category || name.trim(),
        sort_order: menus.length + 1,
        is_active: true,
      },
    ]);

    if (error) {
      alert("追加に失敗しました: " + error.message);
      return;
    }

    setName("");
    setDuration("");
    setPrice("");
    setDescription("");
    setCategory("");
    fetchMenus();
  };

  const toggleActive = async (menu: Menu) => {
    const { error } = await supabase
      .from("menus")
      .update({ is_active: !menu.is_active })
      .eq("id", menu.id);

    if (error) {
      alert("更新に失敗しました");
      return;
    }
    fetchMenus();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このメニューを削除しますか？")) return;
    const { error } = await supabase.from("menus").delete().eq("id", id);
    if (error) {
      alert("削除に失敗しました: " + error.message);
      return;
    }
    fetchMenus();
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
        <h2 className="text-2xl font-light mb-2">メニュー設定</h2>
        <p className="text-gray-500 text-sm mb-8">
          ここで追加したメニューが予約画面に表示されます
        </p>

        <div className="border border-gray-800 rounded-2xl p-6 mb-8 space-y-4">
          <div>
            <label className="text-sm text-gray-400">メニュー名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1"
              placeholder="フェイシャル"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">カテゴリ</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1"
              placeholder="フェイシャル / ボディ など"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400">時間</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1"
                placeholder="90分"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">料金</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1"
                placeholder="¥12,000"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400">説明</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1"
              placeholder="簡単な説明"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-white text-black py-3 rounded-full font-medium"
          >
            メニューを追加
          </button>
        </div>

        <h3 className="text-lg mb-4">登録済みメニュー</h3>
        {loading ? (
          <p className="text-gray-400">読み込み中...</p>
        ) : menus.length === 0 ? (
          <p className="text-gray-500">まだありません</p>
        ) : (
          <div className="space-y-3">
            {menus.map((m) => (
              <div
                key={m.id}
                className="border border-gray-800 rounded-xl p-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-lg">
                      {m.name}
                      {!m.is_active && (
                        <span className="ml-2 text-xs text-gray-500">非表示</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {m.duration} / {m.price}
                    </p>
                    {m.description && (
                      <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleActive(m)}
                      className="text-xs px-3 py-1 rounded-full border border-gray-600"
                    >
                      {m.is_active ? "非表示にする" : "表示する"}
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-xs text-red-400"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}