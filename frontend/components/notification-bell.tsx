"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
type Notice = { _id: string; orderId?: string | null; conversationId?: string | null; type?: 'order' | 'chat'; title: string; message: string; read: boolean; status?: string; createdAt: string };

export default function NotificationBell() {
  const [items, setItems] = useState<Notice[]>([]);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");

  const load = useCallback(async () => {
    const savedToken = sessionStorage.getItem("craftosa_access_token") || "";
    const savedUser = sessionStorage.getItem("craftosa_user");
    if (!savedToken || !savedUser) return;
    try {
      const user = JSON.parse(savedUser) as { role?: string };
      if (user.role !== "customer" && user.role !== "seller") return;
      setToken(savedToken);
      setRole(user.role);
      const response = await fetch(`${API_URL}/orders/notifications/mine`, { headers: { Authorization: `Bearer ${savedToken}` }, cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) setItems(data);
      }
    } catch { /* Keep the last notification count if a poll temporarily fails. */ }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 8000);
    return () => window.clearInterval(timer);
  }, [load]);

  const markRead = async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/orders/notifications/${id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) setItems(current => current.map(item => item._id === id ? { ...item, read: true } : item));
    } catch { /* The next poll will retry the server state. */ }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/orders/notifications/read-all`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) setItems(current => current.map(item => ({ ...item, read: true })));
    } catch { /* Leave unread indicators unchanged if the request fails. */ }
  };

  const unread = items.filter(item => !item.read).length;
  const destination = role === "seller" ? "/seller/orders" : "/notifications";

  return <div className="relative">
    <button type="button" onClick={() => setOpen(value => !value)} aria-label={`Notifications, ${unread} unread`} aria-expanded={open} className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dcd1] text-xl text-[#785341] transition hover:bg-[#f8f1e9]">
      🔔
      {unread > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && typeof document !== "undefined" && createPortal(<div className="fixed right-4 top-20 z-[9999] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#eee2d7] bg-white text-[#34251e] shadow-xl sm:right-6">
      <div className="flex items-center justify-between border-b border-[#eee2d7] p-4"><div><p className="font-semibold">Notifications</p><p className="text-xs text-stone-500">{unread} unread</p></div><button type="button" onClick={() => void markAllRead()} disabled={unread === 0} className="text-xs font-semibold text-[#8b4c35] disabled:opacity-40">Mark all read</button></div>
      <div className="max-h-80 overflow-y-auto">
        {items.length === 0 ? <p className="p-5 text-sm text-stone-500">No notifications yet.</p> : items.slice(0, 8).map(item => <Link key={item._id} href={item.conversationId ? `/messages/${item.conversationId}` : role === "customer" && item.orderId ? `/my-orders/${item.orderId}` : destination} onClick={() => { if (!item.read) void markRead(item._id); setOpen(false); }} className={`block border-b border-stone-100 p-4 transition hover:bg-[#faf7f2] ${item.read ? "bg-white" : "bg-[#fff8f1]"}`}><div className="flex items-start gap-2"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-stone-200" : "bg-[#a45b43]"}`} /><div className="min-w-0"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-stone-600">{item.message}</p><p className="mt-1 text-[10px] text-stone-400">{new Date(item.createdAt).toLocaleString()}</p></div></div></Link>)}
      </div>
      <Link href={destination} onClick={() => setOpen(false)} className="block p-3 text-center text-sm font-semibold text-[#8b4c35] hover:bg-[#faf7f2]">{role === "seller" ? "View orders and messages" : "View all notifications"} →</Link>
    </div>, document.body)}
  </div>;
}
