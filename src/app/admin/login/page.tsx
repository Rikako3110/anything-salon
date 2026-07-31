"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // ここに決めたパスワードを入れる（後で変更できます）
    const correctPassword = "copperkitten48";

    if (password === correctPassword) {
      localStorage.setItem("admin_logged_in", "true");
      router.push("/admin/dashboard");
    } else {
      setError("パスワードが違います");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm border border-gray-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Anything</h1>
        <p className="text-gray-500 text-center text-sm mb-8">管理システム</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white"
              placeholder="パスワードを入力"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-full font-medium hover:bg-gray-200 transition"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}