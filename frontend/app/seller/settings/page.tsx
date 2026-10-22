"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const inputClass = "mt-2 w-full rounded-xl border border-[#e7d9ce] bg-white px-4 py-3 text-sm text-[#34251e] outline-none transition focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10";

type Shop = {
  shopName?: string;
  bio?: string;
  craftTypes?: string[];
  city?: string;
  status?: string;
};

export default function SellerSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({ shopName: "", bio: "", craftTypes: "", city: "" });
  const [status, setStatus] = useState("");
  const [hasApplication, setHasApplication] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadShop() {
      const token = sessionStorage.getItem("craftosa_access_token");
      const savedUser = sessionStorage.getItem("craftosa_user");
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        if (savedUser) {
          const user = JSON.parse(savedUser) as { role?: string };
          if (user.role !== "seller") {
            router.replace(user.role === "admin" ? "/admin" : "/");
            return;
          }
        }
        const response = await fetch(`${API_URL}/sellers/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await response.json();
        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }
        if (response.status === 404) {
          setHasApplication(false);
          setMessage("Set up your shop by completing the details below. Your application will be submitted for review.");
          return;
        }
        if (!response.ok) throw new Error(data.message || "Could not load shop details.");
        const shop: Shop = data.seller || data;
        setForm({
          shopName: shop.shopName || "",
          bio: shop.bio || "",
          craftTypes: Array.isArray(shop.craftTypes) ? shop.craftTypes.join(", ") : "",
          city: shop.city || "",
        });
        setStatus(shop.status || "");
        setHasApplication(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load shop details.");
      } finally {
        setLoading(false);
      }
    }
    void loadShop();
  }, [router]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    const token = sessionStorage.getItem("craftosa_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const response = await fetch(
        hasApplication ? `${API_URL}/sellers/me/shop` : `${API_URL}/sellers/apply`,
        {
        method: hasApplication ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopName: form.shopName.trim(),
          bio: form.bio.trim(),
          craftTypes: form.craftTypes.split(",").map((item) => item.trim()).filter(Boolean),
          city: form.city.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        throw new Error(detail || "Could not save shop details.");
      }
      const shop: Shop = data.seller || data;
      setForm({
        shopName: shop.shopName || "",
        bio: shop.bio || "",
        craftTypes: Array.isArray(shop.craftTypes) ? shop.craftTypes.join(", ") : "",
        city: shop.city || "",
      });
      setStatus(shop.status || (hasApplication ? status : "pending"));
      setHasApplication(true);
      setMessage(hasApplication
        ? "Your shop details have been saved successfully."
        : "Your seller application has been submitted successfully. It is now pending review.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save shop details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] px-4 py-8 text-[#35271f] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/seller" className="text-sm font-medium text-[#8b4c35] hover:underline">← Back to Seller Dashboard</Link>
        <header className="mt-6 rounded-3xl bg-[#75422f] p-7 text-white sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f1c5a3]">Seller workspace</p>
          <h1 className="mt-3 text-3xl font-semibold">Shop Settings</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">Tell customers about your shop, the crafts you make, and where your creations come from.</p>
          {status && <p className="mt-4 inline-flex rounded-full border border-white/25 px-3 py-1 text-xs capitalize">Application status: {status}</p>}
        </header>

        <section className="mt-6 rounded-3xl border border-[#eee3d8] bg-white p-6 sm:p-8">
          {loading ? <p className="text-sm text-[#85766b]">Loading shop details...</p> : (
            <>
              {error && <div role="alert" className="mb-5 rounded-xl border border-[#efd8c8] bg-[#fff4eb] p-4 text-sm text-[#80452f]">{error}</div>}
              {message && <div role="status" className="mb-5 rounded-xl border border-[#d4e8d3] bg-[#f1f8ef] p-4 text-sm text-[#315f36]">{message}</div>}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="shopName" className="text-sm font-semibold">Shop name</label>
                  <input id="shopName" required minLength={2} maxLength={100} value={form.shopName} onChange={(e) => updateField("shopName", e.target.value)} className={inputClass} placeholder="e.g. Test Artisan Studio" />
                </div>
                <div>
                  <label htmlFor="bio" className="text-sm font-semibold">Shop description</label>
                  <textarea id="bio" required minLength={20} maxLength={1000} rows={5} value={form.bio} onChange={(e) => updateField("bio", e.target.value)} className={inputClass} placeholder="Tell customers about your craft, materials, and story (at least 20 characters)." />
                  <p className="mt-1 text-xs text-[#918277]">{form.bio.length}/1000 characters</p>
                </div>
                <div>
                  <label htmlFor="craftTypes" className="text-sm font-semibold">Craft categories</label>
                  <input id="craftTypes" required value={form.craftTypes} onChange={(e) => updateField("craftTypes", e.target.value)} className={inputClass} placeholder="Jewellery, Pottery, Wood Crafts" />
                  <p className="mt-1 text-xs text-[#918277]">Separate categories with commas.</p>
                </div>
                <div>
                  <label htmlFor="city" className="text-sm font-semibold">City</label>
                  <input id="city" required minLength={2} maxLength={100} value={form.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass} placeholder="Your city or town" />
                </div>
                <div className="flex flex-col gap-3 border-t border-[#eee3d8] pt-5 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => router.push("/seller")} className="rounded-xl border border-[#e8dcd1] px-5 py-3 text-sm font-semibold text-[#785341] hover:bg-[#f8f1e9]">Cancel</button>
                  <button type="submit" disabled={saving} className="rounded-xl bg-[#8b4c35] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#713b29] disabled:opacity-60">{saving ? "Saving..." : "Save shop details"}</button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
