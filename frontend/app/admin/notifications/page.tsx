"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Store, PackageX, ShieldAlert, MessageSquareWarning, Check, CheckCheck, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
type Notice = {
  _id: string;
  type: "seller_application" | "customer_complaint" | "seller_suspended" | "product_flagged" | "out_of_stock" | "system";
  title: string;
  message: string;
  targetUrl?: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
  isVirtual?: boolean;
};
const typeMeta: Record<Notice["type"], { label: string; icon: typeof Bell; color: string }> = {
  seller_application: { label: "Seller application", icon: Store, color: "bg-amber-50 text-amber-800" },
  customer_complaint: { label: "Customer complaint", icon: MessageSquareWarning, color: "bg-red-50 text-red-700" },
  seller_suspended: { label: "Seller suspended", icon: ShieldAlert, color: "bg-stone-100 text-stone-700" },
  product_flagged: { label: "Flagged product", icon: ShieldAlert, color: "bg-red-50 text-red-700" },
  out_of_stock: { label: "Out of stock", icon: PackageX, color: "bg-orange-50 text-orange-800" },
  system: { label: "System alert", icon: Bell, color: "bg-blue-50 text-blue-700" },
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const token = sessionStorage.getItem("craftosa_access_token");
    const raw = sessionStorage.getItem("craftosa_user");
    if (!token || !raw) { router.replace("/login"); return; }
    try {
      if ((JSON.parse(raw) as { role?: string }).role !== "admin") { router.replace("/"); return; }
      setLoading(true); setError("");
      const response = await fetch(`${API_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.message === "string" ? data.message : "Could not load notifications.");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load notifications."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void load(); }, [load]);
  const unreadCount = useMemo(() => items.filter(n => !n.isRead).length, [items]);
  const visible = useMemo(() => filter === "unread" ? items.filter(n => !n.isRead) : items, [items, filter]);

  async function markRead(item: Notice) {
    if (item.isVirtual) return;
    const token = sessionStorage.getItem("craftosa_access_token");
    if (!token) { router.replace("/login"); return; }
    setBusy(item._id); setError(""); setMessage("");
    try {
      const response = await fetch(`${API_URL}/admin/notifications/${item._id}/read`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update notification.");
      setItems(current => current.map(n => n._id === item._id ? { ...n, isRead: true } : n));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update notification."); }
    finally { setBusy(""); }
  }

  async function markAllRead() {
    const token = sessionStorage.getItem("craftosa_access_token");
    if (!token) { router.replace("/login"); return; }
    setBusy("all"); setError(""); setMessage("");
    try {
      const response = await fetch(`${API_URL}/admin/notifications/read-all`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not mark notifications as read.");
      setItems(current => current.map(n => n.isVirtual ? n : { ...n, isRead: true }));
      setMessage("All stored notifications marked as read.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update notifications."); }
    finally { setBusy(""); }
  }

  return <main className="min-h-screen bg-[#faf7f2] text-[#34251e]">
    <header className="border-b border-[#eee2d7] bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 md:px-8">
      <Link href="/" className="text-2xl font-bold tracking-tight text-[#8b4c35]">craftosa.</Link>
      <nav className="flex flex-wrap items-center gap-4 text-sm"><Link href="/admin" className="text-stone-600 hover:text-[#8b4c35]">Seller Applications</Link><Link href="/admin/sellers" className="text-stone-600 hover:text-[#8b4c35]">Seller Management</Link><Link href="/admin/orders" className="text-stone-600 hover:text-[#8b4c35]">Orders</Link></nav>
    </div></header>
    <div className="mx-auto max-w-6xl px-5 py-9 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a45b43]">Craftosa administration</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="flex items-center gap-3 text-3xl font-semibold"><Bell className="text-[#b85f45]" /> Notifications & Alerts</h1><p className="mt-2 text-stone-500">Monitor seller applications and stock issues that need attention.</p></div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#e4d3c5] bg-white px-4 py-2.5 text-sm font-semibold text-[#8b4c35] disabled:opacity-50"><RefreshCw size={16} /> Refresh</button>
      </div>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">{message}</p>}
      <section className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[#eee2d7] bg-white p-5"><p className="text-sm text-stone-500">Total alerts</p><p className="mt-1 text-3xl font-semibold">{items.length}</p></div>
        <div className="rounded-2xl border border-[#eee2d7] bg-white p-5"><p className="text-sm text-stone-500">Unread alerts</p><p className="mt-1 text-3xl font-semibold text-[#8b4c35]">{unreadCount}</p></div>
        <div className="col-span-2 rounded-2xl border border-[#eee2d7] bg-white p-5 md:col-span-1"><p className="text-sm text-stone-500">Out-of-stock products</p><p className="mt-1 text-3xl font-semibold">{items.filter(n => n.type === "out_of_stock").length}</p></div>
      </section>
      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eee2d7] bg-white p-4">
        <div className="flex gap-2"><button onClick={() => setFilter("all")} className={`rounded-full px-4 py-2 text-sm font-medium ${filter === "all" ? "bg-[#8b4c35] text-white" : "bg-[#f8eee5] text-[#75422f]"}`}>All alerts</button><button onClick={() => setFilter("unread")} className={`rounded-full px-4 py-2 text-sm font-medium ${filter === "unread" ? "bg-[#8b4c35] text-white" : "bg-[#f8eee5] text-[#75422f]"}`}>Unread ({unreadCount})</button></div>
        <button onClick={() => void markAllRead()} disabled={busy === "all" || unreadCount === 0} className="inline-flex items-center gap-2 rounded-xl border border-[#e4d3c5] px-4 py-2 text-sm font-semibold text-[#8b4c35] disabled:opacity-40"><CheckCheck size={16} /> Mark all read</button>
      </section>
      {loading ? <div className="mt-5 rounded-2xl border border-[#eee2d7] bg-white p-8 text-stone-500">Loading alerts…</div>
        : visible.length === 0 ? <div className="mt-5 rounded-2xl border border-[#eee2d7] bg-white p-12 text-center"><Bell size={36} className="mx-auto text-[#b85f45]" /><h2 className="mt-4 text-lg font-semibold">You're all caught up</h2><p className="mt-2 text-sm text-stone-500">New admin alerts will appear here.</p></div>
        : <div className="mt-5 space-y-3">{visible.map(item => {
          const meta = typeMeta[item.type] || typeMeta.system;
          const Icon = meta.icon;
          return <article key={item._id} className={`rounded-2xl border bg-white p-5 ${item.isRead ? "border-[#eee2d7]" : "border-[#d9b29b]"}`}>
            <div className="flex items-start gap-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.color}`}><Icon size={20} /></div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{item.title}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}>{meta.label}</span>{item.priority === "high" && <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">High priority</span>}{!item.isRead && <span className="h-2 w-2 rounded-full bg-[#b85f45]" aria-label="Unread" />}</div>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.message}</p><p className="mt-3 text-xs text-stone-400">{new Date(item.createdAt).toLocaleString()}</p>
                <div className="mt-4 flex flex-wrap gap-3">{item.targetUrl && <Link href={item.targetUrl} className="text-sm font-semibold text-[#8b4c35] hover:underline">View details →</Link>}{!item.isRead && !item.isVirtual && <button onClick={() => void markRead(item)} disabled={busy === item._id} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#8b4c35] disabled:opacity-50"><Check size={15} /> Mark as read</button>}{item.isVirtual && <span className="text-xs text-orange-700">Live stock alert · clears when stock is replenished</span>}</div>
              </div></div>
          </article>;
        })}</div>}
      <p className="mt-6 text-center text-xs text-stone-400">Customer complaint and flagged-product alerts will appear here once reporting and moderation workflows are enabled.</p>
    </div>
  </main>;
}
