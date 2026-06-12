"use client";
import { useState } from "react";
import { createBooking } from "@/lib/queries";

type Props = {
  experienceId: string;
  experienceTitle: string;
};

export default function BookingForm({ experienceId, experienceTitle }: Props) {
  const [form, setForm] = useState({
    parentName: "", parentEmail: "", parentPhone: "",
    childrenCount: 1, adultsCount: 1, message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experienceId, ...form }),
    });
    setLoading(false);
    if (res.ok) setSubmitted(true);
    else setError(true);
  };

  if (submitted) {
    return (
      <div className="bg-[#F5F3FA] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="font-bold text-gray-800 mb-2">予約を受け付けました！</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          ご登録のメールアドレスに確認のご連絡をします。<br />しばらくお待ちください。
        </p>
        <p className="mt-4 text-xs text-gray-400">{experienceTitle}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="font-bold text-gray-800 mb-4">予約する</h2>
      {error && (
        <p className="text-red-500 text-xs mb-3 bg-red-50 p-2 rounded-lg">送信に失敗しました。もう一度試してください。</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">お名前 *</label>
          <input type="text" required value={form.parentName}
            onChange={(e) => setForm({ ...form, parentName: e.target.value })}
            placeholder="山田 花子"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7B6BA8]" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">メールアドレス *</label>
          <input type="email" required value={form.parentEmail}
            onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
            placeholder="example@email.com"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7B6BA8]" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">電話番号</label>
          <input type="tel" value={form.parentPhone}
            onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
            placeholder="090-0000-0000"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7B6BA8]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">大人の人数 *</label>
            <select value={form.adultsCount} onChange={(e) => setForm({ ...form, adultsCount: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7B6BA8]">
              {[1,2,3].map(n => <option key={n} value={n}>{n}人</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">子どもの人数 *</label>
            <select value={form.childrenCount} onChange={(e) => setForm({ ...form, childrenCount: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7B6BA8]">
              {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}人</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">メッセージ（任意）</label>
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={3} placeholder="アレルギーや不安なことがあれば"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7B6BA8] resize-none" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-[#7B6BA8] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#6a5b97] transition-colors disabled:opacity-60">
          {loading ? "送信中..." : "予約を申し込む"}
        </button>
        <p className="text-xs text-center text-gray-400">予約後、担当者からご連絡します</p>
      </form>
    </div>
  );
}
