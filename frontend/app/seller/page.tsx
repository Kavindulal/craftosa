
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "../../components/notification-bell";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const menuItems = [
  { icon: "⌂", label: "Dashboard", href: "/seller" },
  { icon: "▦", label: "My Products", href: "/seller/products" },
  { icon: "▤", label: "Orders", href: "/seller/orders" },
  { icon: "✉", label: "Custom Requests", href: null },
  { icon: "⚙", label: "Shop Settings", href: "/seller/settings" },
];

type SellerUser = { name?: string; email?: string; role?: string; };
type SellerAnalytics = {
  totalProducts: number; activeProducts: number; outOfStockProducts: number;
  totalOrders: number; activeOrders: number; pendingOrders: number; deliveredOrders: number;
  revenue: number; monthlySales: { month: string; sales: number; orders: number }[];
  recentOrders: { id: string; customerName: string; status: string; createdAt?: string; sellerSubtotal: number; itemCount: number }[];
};
const money = (value: number) => Number(value || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SellerDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<SellerUser | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    const token = sessionStorage.getItem("craftosa_access_token");
    const savedUser = sessionStorage.getItem("craftosa_user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as SellerUser);
      } catch {
        setUser(null);
      }
    }

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const [productResponse, analyticsResponse] = await Promise.all([
        fetch(`${API_URL}/products/mine`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
        fetch(`${API_URL}/orders/seller/analytics`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
      ]);
      if (productResponse.status === 401 || productResponse.status === 403 || analyticsResponse.status === 401 || analyticsResponse.status === 403) {
        setNotice("Your session may have expired. Please sign in again.");
        return;
      }
      if (!productResponse.ok || !analyticsResponse.ok) throw new Error("Could not load live dashboard data.");
      const [products, data] = await Promise.all([productResponse.json(), analyticsResponse.json()]);
      if (Array.isArray(products)) setProductCount(products.length);
      setAnalytics(data as SellerAnalytics);
    } catch {
      setNotice("Unable to load live dashboard data. Please check that the backend is running.");
    } finally {
      setLoadingProducts(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  function handleLogout() {
    sessionStorage.removeItem("craftosa_access_token");
    sessionStorage.removeItem("craftosa_user");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#35271f]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#eee5db] bg-white p-6 md:flex">
          <Link href="/" className="mb-12 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8b4c35] text-lg font-bold text-white">
              C
            </span>
            <span className="text-2xl font-semibold tracking-tight">
              craftosa<span className="text-[#b86c4d]">.</span>
            </span>
          </Link>

          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#a89a8e]">
            Workspace
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const active = item.label === "Dashboard";

              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-[#8b4c35] text-white shadow-md shadow-[#8b4c35]/10"
                        : "text-[#76675d] hover:bg-[#f8f1e9] hover:text-[#8b4c35]"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    setNotice(`${item.label} will be connected in a later step.`)
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#76675d] transition hover:bg-[#f8f1e9] hover:text-[#8b4c35]"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-[#f8f1e9] p-4">
            <p className="text-sm font-semibold">Made by hand.</p>
            <p className="mt-1 text-xs leading-5 text-[#88766a]">
              Share your craft with the world.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <section className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-4 border-b border-[#eee5db] bg-white px-5 py-5 sm:px-8 lg:px-10">
            <div>
              <p className="text-xs font-medium text-[#a5684e]">
                SELLER WORKSPACE
              </p>
              <h1 className="mt-1 text-xl font-semibold sm:text-2xl">
                My Dashboard
              </h1>
              {user?.name && (
                <p className="mt-1 text-sm text-[#918277]">
                  Welcome back, {user.name}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <NotificationBell />
              <Link
                href="/seller/settings"
                className="rounded-xl border border-[#e8dcd1] px-4 py-2.5 text-sm font-medium text-[#785341] transition hover:bg-[#f8f1e9]"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-[#e8dcd1] px-4 py-2.5 text-sm font-medium text-[#785341] transition hover:bg-[#f8f1e9]"
              >
                Sign out
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8 lg:p-10">
            {notice && (
              <div
                role="status"
                className="flex items-start justify-between gap-3 rounded-xl border border-[#efd8c8] bg-[#fff4eb] p-4 text-sm text-[#80452f]"
              >
                <p>{notice}</p>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss notice"
                  className="font-semibold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl bg-[#75422f] p-7 text-white sm:p-10">
              <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
              <div className="absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-[#d5a17e]/10" />

              <div className="relative max-w-2xl">
                <span className="inline-flex rounded-full border border-white/25 px-3 py-1.5 text-xs text-[#f2d4bc]">
                  YOUR CREATIVE SPACE
                </span>

                <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
                  Every handmade piece
                  <br className="hidden sm:block" /> has a story.
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-6 text-white/75">
                  Welcome to your shop workspace. Manage your creations and
                  prepare to share them with the Craftosa community.
                </p>

                <Link
                  href="/seller/products"
                  className="mt-6 inline-flex items-center rounded-xl bg-[#f1c5a3] px-5 py-3 text-sm font-semibold text-[#563525] transition hover:bg-[#ffdbc0]"
                >
                  + Add your first product
                </Link>
              </div>
            </section>

            {/* Overview */}
            <section>
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Shop overview</h2>
                <p className="mt-1 text-sm text-[#918277]">
                  Your shop activity at a glance.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Total Products", value: loadingProducts ? "..." : String(analytics?.totalProducts ?? productCount ?? "—"), icon: "▧", hint: `${analytics?.activeProducts ?? 0} active` },
                  { label: "Active Orders", value: loadingProducts ? "..." : String(analytics?.activeOrders ?? "—"), icon: "▤", hint: `${analytics?.pendingOrders ?? 0} pending` },
                  { label: "Delivered Orders", value: loadingProducts ? "..." : String(analytics?.deliveredOrders ?? "—"), icon: "✓", hint: "Successfully delivered" },
                  { label: "Revenue", value: loadingProducts ? "..." : analytics ? `Rs. ${money(analytics.revenue)}` : "—", icon: "↗", hint: "From delivered orders" },
                ].map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-[#eee5db] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-[#88796e]">{stat.label}</p>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8eee5] text-lg text-[#a5684e]">
                        {stat.icon}
                      </span>
                    </div>
                    <p className="mt-5 break-words text-2xl font-semibold sm:text-3xl">{stat.value}</p>
                    <p className="mt-2 text-xs text-[#a09185]">{stat.hint}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Sales analytics */}
            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-[#eee5db] bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h2 className="text-lg font-semibold">Sales overview</h2><p className="mt-1 text-sm text-[#918277]">Monthly revenue from delivered orders.</p></div>
                  <span className="rounded-full bg-[#f8eee5] px-3 py-1.5 text-xs font-semibold text-[#8b4c35]">Last 6 months</span>
                </div>
                {!analytics?.monthlySales.length ? <div className="mt-6 rounded-xl bg-[#faf7f2] p-6 text-sm text-[#918277]">Your sales chart will appear here after orders are delivered.</div> : <div className="mt-7 flex h-48 items-end gap-3 sm:gap-5">{analytics.monthlySales.map((point) => { const max = Math.max(...analytics.monthlySales.map(row => row.sales), 1); const height = Math.max(8, (point.sales / max) * 150); return <div key={point.month} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="max-w-full truncate text-[10px] text-[#8b4c35] sm:text-xs">{point.sales >= 1000 ? `Rs.${(point.sales / 1000).toFixed(1)}k` : `Rs.${Math.round(point.sales)}`}</span><div title={`Rs. ${money(point.sales)}`} className="w-full max-w-12 rounded-t-lg bg-[#a5684e] transition-all" style={{ height: `${height}px` }} /><span className="text-[10px] text-[#918277] sm:text-xs">{point.month}</span></div>; })}</div>}
                <p className="mt-4 text-xs text-[#a09185]">Revenue is calculated from delivered items in your shop only.</p>
              </div>
              <div className="rounded-2xl border border-[#eee5db] bg-white p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Inventory snapshot</h2><p className="mt-1 text-sm text-[#918277]">Keep your product stock ready.</p></div><span className="text-2xl">▦</span></div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#faf7f2] p-4"><p className="text-sm text-[#918277]">Active products</p><p className="mt-2 text-2xl font-semibold">{analytics?.activeProducts ?? "—"}</p></div>
                  <div className="rounded-xl bg-[#fff4eb] p-4"><p className="text-sm text-[#918277]">Out of stock</p><p className="mt-2 text-2xl font-semibold">{analytics?.outOfStockProducts ?? "—"}</p></div>
                </div>
                <Link href="/seller/products" className="mt-5 inline-flex text-sm font-semibold text-[#8b4c35] hover:underline">Manage inventory →</Link>
              </div>
            </section>

            <section className="rounded-2xl border border-[#eee5db] bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Recent orders</h2><p className="mt-1 text-sm text-[#918277]">Latest orders containing your products.</p></div><Link href="/seller/orders" className="text-sm font-semibold text-[#8b4c35] hover:underline">Manage orders →</Link></div>
              {!analytics?.recentOrders.length ? <p className="mt-6 rounded-xl bg-[#faf7f2] p-5 text-sm text-[#918277]">No orders yet. When customers order your products, they will appear here.</p> : <div className="mt-5 divide-y divide-[#f0e8e0]">{analytics.recentOrders.map(order => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="font-medium">{order.customerName}</p><p className="mt-1 text-xs text-[#918277]">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Date unavailable"} · {order.itemCount} item(s)</p><p className="mt-1 break-all text-[11px] text-[#a09185]">#{order.id}</p></div><div className="text-right"><p className="font-semibold">Rs. {money(order.sellerSubtotal)}</p><span className="mt-1 inline-block rounded-full bg-[#f8eee5] px-2.5 py-1 text-xs capitalize text-[#8b4c35]">{order.status}</span></div></div>)}</div>}
            </section>

            {/* Shop setup */}
            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-[#eee5db] bg-white p-6 sm:p-8">
                <h2 className="text-lg font-semibold">Get your shop ready</h2>
                <p className="mt-2 text-sm leading-6 text-[#918277]">
                  Complete these steps to prepare your handmade shop for
                  customers.
                </p>

                <div className="mt-6 space-y-5">
                  {[
                    [
                      "01",
                      "Set up your shop profile",
                      "Tell customers about your craft.",
                    ],
                    [
                      "02",
                      "Add your products",
                      "Showcase your handmade creations.",
                    ],
                    [
                      "03",
                      "Prepare for orders",
                      "Get ready to manage customer requests.",
                    ],
                  ].map(([number, title, description]) => (
                    <div key={number} className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f8eee5] text-sm font-semibold text-[#9a6044]">
                        {number}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-sm text-[#918277]">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/seller/products"
                  className="mt-7 inline-flex rounded-xl border border-[#e8dcd1] px-4 py-3 text-sm font-semibold text-[#75422f] transition hover:bg-[#f8f1e9]"
                >
                  Manage products →
                </Link>
              </div>

              <div className="rounded-2xl border border-[#eee5db] bg-white p-6 sm:p-8">
                <span className="text-2xl">✦</span>
                <h2 className="mt-4 text-lg font-semibold">
                  Your craft matters
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#918277]">
                  Craftosa brings customers closer to the people behind
                  handmade products. Your creative journey starts here.
                </p>

                <div className="mt-6 rounded-xl bg-[#f8f1e9] p-4">
                  <p className="text-sm font-medium text-[#75422f]">
                    Your next step
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[#88766a]">
                    Add your first product and start building your collection.
                  </p>
                  <Link
                    href="/seller/products"
                    className="mt-4 inline-flex text-sm font-semibold text-[#8b4c35] hover:underline"
                  >
                    Open My Products →
                  </Link>
                </div>
              </div>
            </section>

            <footer className="pb-4 text-center text-xs text-[#a89a8e]">
              © 2026 Craftosa · Crafted with care.
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
