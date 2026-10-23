
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

type SellerUser = {
  name?: string;
  email?: string;
  role?: string;
};

export default function SellerDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<SellerUser | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
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
      const response = await fetch(`${API_URL}/products/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        setNotice("Your session may have expired. Please sign in again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load your products.");
      }

      const products = await response.json();

      if (Array.isArray(products)) {
        setProductCount(products.length);
      }
    } catch {
      setNotice(
        "Unable to load live dashboard data. Please check that the backend is running."
      );
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
                  {
                    label: "Total Products",
                    value: loadingProducts
                      ? "..."
                      : String(productCount ?? "—"),
                    icon: "▧",
                  },
                  { label: "Active Orders", value: "—", icon: "▤" },
                  { label: "Custom Requests", value: "—", icon: "✧" },
                  { label: "Shop Visits", value: "—", icon: "↗" },
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
                    <p className="mt-5 text-3xl font-semibold">
                      {stat.value}
                    </p>
                  </article>
                ))}
              </div>
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
