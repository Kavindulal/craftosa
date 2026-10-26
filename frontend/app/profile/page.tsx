"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bell, LogOut, MessageCircle, Package, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "../../components/notification-bell";
import CraftosaLogo from "../../components/craftosa-logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
};

type ProfileResponse = {
  message?: string;
  user?: Profile;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-[#e7d9ce] bg-white px-4 py-3 text-sm text-[#34251e] outline-none transition placeholder:text-[#b3a79d] focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = sessionStorage.getItem("craftosa_access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data: ProfileResponse = await response.json();

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("craftosa_access_token");
          sessionStorage.removeItem("craftosa_user");
          router.replace("/login");
          return;
        }
        if (!response.ok || !data.user) {
          throw new Error(data.message || "Could not load your profile.");
        }

        setProfile(data.user);
        setForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          city: data.user.city || "",
          postalCode: data.user.postalCode || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    const token = sessionStorage.getItem("craftosa_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data: ProfileResponse = await response.json();

      if (!response.ok || !data.user) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Your profile could not be saved.",
        );
      }

      setProfile(data.user);
      setForm({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        address: data.user.address || "",
        city: data.user.city || "",
        postalCode: data.user.postalCode || "",
      });
      sessionStorage.setItem("craftosa_user", JSON.stringify(data.user));
      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("craftosa_access_token");
    sessionStorage.removeItem("craftosa_user");
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-4">
        <p className="text-sm text-[#75675e]">Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-2xl border border-[#eee4dc] bg-white/90 px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-4">
              <CraftosaLogo tagline className="shrink-0" />
              <div className="xl:hidden">
                <NotificationBell />
              </div>
            </div>
            <nav aria-label="Account navigation" className="flex flex-wrap items-center gap-2">
              <Link href="/my-orders" className="inline-flex items-center gap-2 rounded-xl border border-[#e7d9ce] px-3.5 py-2.5 text-sm font-medium text-[#8b4c35] transition hover:bg-[#fbf6f0]">
                <Package size={17} /> <span>My Orders</span>
              </Link>
              <Link href="/messages" className="inline-flex items-center gap-2 rounded-xl border border-[#e7d9ce] px-3.5 py-2.5 text-sm font-medium text-[#8b4c35] transition hover:bg-[#fbf6f0]">
                <MessageCircle size={17} /> <span>Messages</span>
              </Link>
              <Link href="/notifications" className="inline-flex items-center gap-2 rounded-xl border border-[#e7d9ce] px-3.5 py-2.5 text-sm font-medium text-[#8b4c35] transition hover:bg-[#fbf6f0]">
                <Bell size={17} /> <span>Notifications</span>
              </Link>
              <div className="hidden xl:block">
                <NotificationBell />
              </div>
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-[#ded2c8] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#554137] transition hover:bg-[#fbf6f0]">
                <Store size={17} /> <span>Marketplace</span>
              </Link>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-[#8b4c35] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#713c29]">
                <LogOut size={17} /> <span>Log out</span>
              </button>
            </nav>
          </div>
        </header>

        <div className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a5684e]">Account settings</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#30241e] sm:text-4xl">My profile</h1>
          <p className="mt-2 text-sm leading-6 text-[#81756d]">Keep your contact details and delivery address up to date.</p>
        </div>

        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {message && <p role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-[#eee4dc] bg-white p-6 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f2e2d5] text-2xl font-semibold text-[#8b4c35]">
              {(profile?.name || "C").trim().charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#34251e]">{profile?.name || "Craftosa customer"}</h2>
            <p className="mt-1 break-all text-sm text-[#81756d]">{profile?.email}</p>
            <span className="mt-4 inline-flex rounded-full bg-[#f8f0e9] px-3 py-1 text-xs font-semibold capitalize text-[#8b4c35]">
              {profile?.role || "customer"} account
            </span>
            <div className="mt-6 border-t border-[#eee4dc] pt-5 text-sm text-[#81756d]">
              <p className="font-medium text-[#554137]">Account security</p>
              <p className="mt-2 leading-6">Your profile is available only after signing in.</p>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[#eee4dc] bg-white p-5 shadow-sm sm:p-8">
            <section>
              <h2 className="text-lg font-semibold text-[#34251e]">Personal information</h2>
              <p className="mt-1 text-sm text-[#81756d]">Your name and email address for your account.</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[#554137]">Full name
                  <input className={inputClass} required minLength={2} maxLength={80} value={form.name} onChange={(e) => updateField("name", e.target.value)} />
                </label>
                <label className="block text-sm font-medium text-[#554137]">Email address
                  <input className={inputClass} type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                </label>
                <label className="block text-sm font-medium text-[#554137]">Phone number
                  <input className={inputClass} type="tel" maxLength={30} placeholder="Your contact number" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
                </label>
              </div>
            </section>

            <div className="h-px bg-[#eee4dc]" />

            <section>
              <h2 className="text-lg font-semibold text-[#34251e]">Delivery address</h2>
              <p className="mt-1 text-sm text-[#81756d]">Add the address you would like to use for deliveries.</p>
              <div className="mt-5 space-y-5">
                <label className="block text-sm font-medium text-[#554137]">Street address
                  <textarea className={inputClass} rows={3} maxLength={200} placeholder="House number, street, village..." value={form.address} onChange={(e) => updateField("address", e.target.value)} />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-[#554137]">City / Town
                    <input className={inputClass} maxLength={100} value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                  </label>
                  <label className="block text-sm font-medium text-[#554137]">Postal code
                    <input className={inputClass} maxLength={20} value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
                  </label>
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-[#eee4dc] pt-5 sm:flex-row sm:justify-end">
              <Link href="/" className="rounded-xl border border-[#ded2c8] px-5 py-3 text-center text-sm font-semibold text-[#554137] hover:bg-[#fbf6f0]">Cancel</Link>
              <button type="submit" disabled={saving} className="rounded-xl bg-[#8b4c35] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#713c29] disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Saving changes..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
