"use client";

import { useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    router.push("/admin/login");
  };

  return (
    <header className="border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold tracking-wider">Anything 管理</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white"
        >
          ログアウト
        </button>
      </div>
      <nav className="flex gap-1 px-4 pb-3 overflow-x-auto text-sm">
        <a
          href="/admin/dashboard"
          className="px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-900 whitespace-nowrap"
        >
          ダッシュボード
        </a>
        <a
          href="/admin/calendar"
          className="px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-900 whitespace-nowrap"
        >
          カレンダー
        </a>
        <a
          href="/admin/customers"
          className="px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-900 whitespace-nowrap"
        >
          顧客管理
        </a>
        <a
          href="/admin/messages"
          className="px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-900 whitespace-nowrap"
        >
          LINE配信
        </a>
          href="/admin/chart"
          className="px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-900 whitespace-nowrap"
        >
          電子カルテ
        </a>
        <a
          href="/"
          className="px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-900 whitespace-nowrap"
        >
          サイトを見る
        </a>
      </nav>
    </header>
  );
}