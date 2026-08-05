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
          `送信完了：成功 ${data.sent}件 / 失敗 ${data.failed}件 / 対象 ${data.total}件`
        );
        setTitle("");
        setBody("");
      }
    } catch (e: any) {
      setResult("エラー: " + (e?.message || "通信に失敗しました"));
