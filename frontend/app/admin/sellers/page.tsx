"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Store, RefreshCw, ShieldCheck, ShieldOff, MapPin, Mail, FileText, Users, Bell, Package, Settings, LogOut } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
type Status = "pending" | "approved" | "rejected" | "suspended";
type Seller = { _id: string; shopName: string; bio: string; craftTypes: string[]; city: string; status: Status; createdAt?: string; user?: { name?: string; email?: string } };
const tabs: { label: string; value: "all" | Status }[] = [
  { label: "All sellers", value: "all" }, { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" }, { label: "Rejected", value: "rejected" }, { label: "Suspended", value: "suspended" },
];
const statusStyle: Record<Status, string> = { approved: "bg-green-50 text-green-700", pending: "bg-amber-50 text-amber-800", rejected: "bg-red-50 text-red-700", suspended: "bg-stone-100 text-stone-700" };

export default function AdminSellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | Status>("all");
  const [busyId, setBusyId] = useState("");

  const loadSellers = useCallback(async () => {
    const token = sessionStorage.getItem("craftosa_access_token");
    const raw = sessionStorage.getItem("craftosa_user");
    if (!token || !raw) { router.replace("/login"); return; }
    try {
      if ((JSON.parse(raw) as { role?: string }).role !== "admin") { router.replace("/"); return; }
      setLoading(true); setError("");
      const response = await fetch(`${API_URL}/sellers`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.message === "string" ? data.message : "Could not load sellers.");
      setSellers(Array.isArray(data) ? data : data.sellers || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load sellers."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void loadSellers(); }, [loadSellers]);

  const counts = useMemo(() => ({
    all: sellers.length,
    approved: sellers.filter(s => s.status === "approved").length,
    pending: sellers.filter(s => s.status === "pending").length,
    rejected: sellers.filter(s => s.status === "rejected").length,
    suspended: sellers.filter(s => s.status === "suspended").length,
  }), [sellers]);

  const visible = useMemo(() => sellers.filter(s => {
    const matchesStatus = activeTab === "all" || s.status === activeTab;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [s.shopName, s.city, s.user?.name, s.user?.email, ...(s.craftTypes || [])].some(v => v?.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  }), [sellers, activeTab, search]);

  async function updateStatus(seller: Seller, status: "approved" | "rejected" | "suspended") {
    const token = sessionStorage.getItem("craftosa_access_token");
    if (!token) { router.replace("/login"); return; }
    if (status === "rejected" && !window.confirm(`Reject the application for "${seller.shopName}"?`)) return;
    if (status === "suspended" && !window.confirm(`Suspend "${seller.shopName}"? Its public shop will be hidden until reactivated.`)) return;
    setBusyId(seller._id); setError(""); setMessage("");
    try {
      const isReview = seller.status === "pending" && (status === "approved" || status === "rejected");
      const response = await fetch(isReview ? `${API_URL}/sellers/${seller._id}/review` : `${API_URL}/sellers/${seller._id}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(status === "rejected" ? { status, rejectionReason: "Rejected by marketplace administrator." } : { status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.message === "string" ? data.message : "Could not update seller status.");
      setMessage(`${seller.shopName}: status changed to ${status}.`);
      await loadSellers();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update seller status."); }
    finally { setBusyId(""); }
  }

  return <main className="min-h-screen bg-[#faf7f2] text-[#34251e]">
    <header className="sticky top-0 z-30 border-b border-[#eee2d7] bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
<Link href="/" className="text-2xl font-bold tracking-tight text-[#8b4c35]">craftosa<span className="text-[#c16b4d]">.</span></Link>
<nav aria-label="Admin navigation" className="flex flex-wrap items-center gap-2 text-sm">
<Link href="/admin"  className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium text-stone-600 transition hover:bg-[#faf7f2] hover:text-[#8b4c35]"><FileText size={17}/><span>Seller Applications</span></Link>
<Link href="/admin/sellers" aria-current="page" className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 bg-[#f8eee5] font-semibold text-[#8b4c35]"><Users size={17}/><span>Seller Management</span></Link>
<Link href="/admin/notifications"  className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium text-stone-600 transition hover:bg-[#faf7f2] hover:text-[#8b4c35]"><Bell size={17}/><span>Notifications</span></Link>
<Link href="/admin/orders"  className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium text-stone-600 transition hover:bg-[#faf7f2] hover:text-[#8b4c35]"><Package size={17}/><span>Order Management</span></Link>
<span className="hidden items-center gap-2 border-l border-[#eadfd3] px-3 text-stone-500 lg:inline-flex"><Settings size={16}/> Admin workspace</span>
<button onClick={() => { sessionStorage.removeItem("craftosa_access_token"); sessionStorage.removeItem("craftosa_user"); router.replace("/login"); }} className="inline-flex items-center gap-2 rounded-xl border border-[#e8dcd1] px-3 py-2.5 font-medium transition hover:bg-[#faf7f2]"><LogOut size={17}/><span>Sign out</span></button>
</nav></div></header>
    <div className="mx-auto max-w-6xl px-5 py-9 md:px-8">
      <Link href="/admin" className="text-sm font-medium text-[#8b4c35] hover:underline">← Back to Admin</Link>
      <section className="mt-5 rounded-3xl bg-[#75422f] px-7 py-8 text-white md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f1c5a3]">Craftosa administration</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold md:text-4xl">Seller Management</h1><p className="mt-3 max-w-2xl leading-7 text-white/75">Review seller accounts, monitor shop status, and keep the marketplace trustworthy.</p></div>
          <div className="rounded-2xl bg-white/10 px-5 py-3"><p className="text-sm text-white/70">Total seller accounts</p><p className="mt-1 text-3xl font-semibold">{counts.all}</p></div></div>
      </section>
      {message && <p role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <section className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">{(["approved", "pending", "rejected", "suspended"] as Status[]).map(status =>
        <button key={status} onClick={() => setActiveTab(status)} className={`rounded-2xl border bg-white p-4 text-left transition ${activeTab === status ? "border-[#b85f45] ring-2 ring-[#b85f45]/15" : "border-[#eee2d7] hover:border-[#d6b8a5]"}`}>
          <p className="text-sm capitalize text-stone-500">{status} sellers</p><p className="mt-1 text-2xl font-semibold">{counts[status]}</p>
        </button>)}</section>
      <section className="mt-7 rounded-2xl border border-[#eee2d7] bg-white p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shop, seller, email, city…" className="w-full rounded-xl border border-[#e8dcd1] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#b85f45]" /></div>
          <button onClick={() => void loadSellers()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4d3c5] px-4 py-2.5 text-sm font-semibold text-[#8b4c35] hover:bg-[#faf7f2] disabled:opacity-50"><RefreshCw size={16} /> Refresh</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{tabs.map(tab => <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === tab.value ? "bg-[#8b4c35] text-white" : "bg-[#f8eee5] text-[#75422f] hover:bg-[#f1dfd1]"}`}>{tab.label} · {counts[tab.value]}</button>)}</div>
      </section>
      {loading ? <div className="mt-5 rounded-2xl border border-[#eee2d7] bg-white p-8 text-stone-500">Loading sellers…</div>
      : visible.length === 0 ? <div className="mt-5 rounded-2xl border border-[#eee2d7] bg-white px-6 py-14 text-center"><Store size={36} className="mx-auto text-[#b85f45]" /><h2 className="mt-4 text-lg font-semibold">No sellers found</h2><p className="mt-2 text-sm text-stone-500">Try another status filter or search term.</p></div>
      : <div className="mt-5 grid gap-4">{visible.map(seller => <article key={seller._id} className="rounded-2xl border border-[#eee2d7] bg-white p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f8eee5] text-[#8b4c35]"><Store size={22} /></div>
          <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{seller.shopName}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle[seller.status]}`}>{seller.status}</span></div>
            <p className="mt-1 text-sm text-stone-500">{seller.user?.name || "Seller name unavailable"}{seller.createdAt ? ` · Joined ${new Date(seller.createdAt).toLocaleDateString()}` : ""}</p>
            {seller.user?.email && <p className="mt-2 flex items-center gap-2 text-sm text-stone-600"><Mail size={15} />{seller.user.email}</p>}
            <p className="mt-1 flex items-center gap-2 text-sm text-stone-600"><MapPin size={15} />{seller.city}</p></div></div>
          <div className="flex flex-wrap gap-2">
            {seller.status === "pending" && <><button disabled={busyId === seller._id} onClick={() => void updateStatus(seller, "approved")} className="rounded-xl bg-[#8b4c35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#713b29] disabled:opacity-50">Approve</button><button disabled={busyId === seller._id} onClick={() => void updateStatus(seller, "rejected")} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Reject</button></>}
            {seller.status === "approved" && <button disabled={busyId === seller._id} onClick={() => void updateStatus(seller, "suspended")} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><ShieldOff size={16} /> Suspend shop</button>}
            {seller.status === "suspended" && <button disabled={busyId === seller._id} onClick={() => void updateStatus(seller, "approved")} className="inline-flex items-center gap-2 rounded-xl bg-[#8b4c35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#713b29] disabled:opacity-50"><ShieldCheck size={16} /> Reactivate</button>}
          </div>
        </div>
        {seller.bio && <p className="mt-5 whitespace-pre-line text-sm leading-6 text-stone-600">{seller.bio}</p>}
        <div className="mt-4 flex flex-wrap gap-2">{(seller.craftTypes || []).map(craft => <span key={craft} className="rounded-full bg-[#f8eee5] px-3 py-1 text-xs font-medium text-[#8b4c35]">{craft}</span>)}</div>
      </article>)}</div>}
      <p className="mt-6 text-center text-xs text-stone-400">Seller status changes are restricted to administrators.</p>
    </div>
  </main>;
}
