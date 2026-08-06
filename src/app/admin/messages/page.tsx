"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";

export default function AdminMessages() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [target, setTarget] = useState("linked");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in");
    if (loggedIn !== "true") {
      router.push("/admin/login");
      return;
    }
    setIsLoggedIn(true);
  }, [router]);

  const handleSend = async () => {
    if (!body.trim()) {
      alert("本文を入力してください");
      return;
    }

    if (!confirm("LINE連携済みのお客様に送信します。よろしいですか？")) {
      return;
    }

    setSending(true);
    setResult("");

    try {
      const res = await fetch("/api/line/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, title, body }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult("送信に失敗しました: " + (data.error || "不明なエラー"));
      } else {
        setResult(
          "送信完了：成功 " +
            data.sent +
            "件 / 失敗 " +
            data.failed +
            "件 / 対象 " +
            data.total +
            "件"
        );
        setTitle("");
        setBody("");
      }
    } catch (e: any) {
      setResult("エラー: " + (e?.message || "通信に失敗しました"));
    } finally {
      setSending(false);
    }
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
        <h2 className="text-2xl font-light mb-2">LINE配信</h2>
        <p className="text-gray-500 text-sm mb-8">
          店舗からお客様へ情報発信できます
        </p>

        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-400">送信対象</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="target"
                  value="linked"
                  checked={target === "linked"}
                  onChange={(e) => setTarget(e.target.value)}
                />
                <span>LINE連携済みのお客様</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">タイトル（任意）</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="夏限定キャンペーン"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">本文</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="フェイシャル集中ケア 期間限定価格"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white"
            />
          </div>

          {result && (
            <p className="text-sm text-center text-gray-300">{result}</p>
          )}

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full bg-white text-black py-3 rounded-full font-medium disabled:opacity-40"
          >
            {sending ? "送信中..." : "送信"}
          </button>
        </div>
      </div>
    </div>
  );
}