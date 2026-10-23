"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
type NotificationItem = { _id: string; orderId: string; title: string; message: string; status?: string; read: boolean; createdAt: string };

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const load = useCallback(async () => {
    const accessToken = sessionStorage.getItem("craftosa_access_token");
    const raw = sessionStorage.getItem("craftosa_user");
    if (!accessToken || !raw) { router.replace("/login?next=/notifications"); return; }
    try {
      if ((JSON.parse(raw) as { role?: string }).role !== "customer") { router.replace("/"); return; }
      setToken(accessToken);
      const response = await fetch(`${API_URL}/orders/notifications/mine`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load notifications.");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load notifications."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 8000);
    return () => window.clearInterval(timer);
  }, [load]);

  const markRead = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/notifications/${id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) setItems(current => current.map(item => item._id === id ? { ...item, read: true } : item));
    } catch { setError("Could not update notification read status."); }
  };
  const markAllRead = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/notifications/read-all`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Could not mark notifications as read.");
      setItems(current => current.map(item => ({ ...item, read: true })));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not mark notifications as read."); }
  };
  const unread = items.filter(item => !item.read).length;

  return <main className="min-h-screen bg-[#faf7f2] text-[#34251e]">
    <header className="border-b border-[#eee2d7] bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5"><Link href="/" className="text-2xl font-bold text-[#8b4c35]">craftosa.</Link><Link href="/my-orders" className="text-sm text-stone-600">My Orders</Link></div></header>
    <div className="mx-auto max-w-4xl px-5 py-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a45b43]">Updates</p><h1 className="mt-2 text-3xl font-semibold">Order Notifications</h1><p className="mt-2 text-stone-500">Recent updates about your purchases.</p></div><button type="button" onClick={() => void markAllRead()} disabled={unread === 0 || loading} className="rounded-full border border-[#e8dcd1] bg-white px-4 py-2 text-sm font-semibold text-[#8b4c35] disabled:opacity-40">Mark all as read</button></div>
      <p className="mt-3 text-sm text-stone-500">{unread} unread notification{unread === 1 ? "" : "s"}</p>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {loading ? <p className="mt-8 text-stone-500">Loading notifications…</p> : items.length === 0 ? <section className="mt-8 rounded-2xl border border-[#eee2d7] bg-white p-10 text-center"><div className="text-4xl">🔔</div><h2 className="mt-3 text-xl font-semibold">No notifications yet</h2><p className="mt-2 text-sm text-stone-500">Order updates will appear here when an order is placed or its status changes.</p><Link href="/my-orders" className="mt-5 inline-flex rounded-full bg-[#8b4c35] px-5 py-3 text-sm font-semibold text-white">View My Orders</Link></section> : <div className="mt-7 space-y-3">{items.map(item => <article key={item._id} className={`rounded-2xl border border-[#eee2d7] p-5 ${item.read ? "bg-white" : "bg-[#fff8f1]"}`}><div className="flex gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.read ? "bg-stone-100" : "bg-[#f3e8df]"}`}>{item.read ? "✓" : "🔔"}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{item.title}</p><span className="text-xs text-stone-400">{new Date(item.createdAt).toLocaleString()}</span></div><p className="mt-1 text-sm text-stone-600">{item.message}</p><p className="mt-2 break-all text-xs text-[#8b4c35]">Order: {item.orderId}</p><div className="mt-3 flex gap-4 text-sm">{!item.read && <button type="button" onClick={() => void markRead(item._id)} className="font-semibold text-[#8b4c35] hover:underline">Mark as read</button>}<Link href={`/my-orders/${item.orderId}`} onClick={() => { if (!item.read) void markRead(item._id); }} className="font-semibold text-[#8b4c35] hover:underline">View order →</Link></div></div></div></article>)}</div>}
    </div>
  </main>;
}
