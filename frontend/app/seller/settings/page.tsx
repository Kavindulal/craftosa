"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const inputClass = "mt-2 w-full rounded-xl border border-[#e7d9ce] bg-white px-4 py-3 text-sm text-[#34251e] outline-none transition focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10";

type Shop = {
  shopName?: string;
  bio?: string;
  craftTypes?: string[];
  city?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  status?: string;
};

export default function SellerSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({ shopName: "", bio: "", craftTypes: "", city: "", profileImageUrl: "", coverImageUrl: "" });
  const [status, setStatus] = useState("");
  const [hasApplication, setHasApplication] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"profile" | "cover" | "">("");
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
          profileImageUrl: shop.profileImageUrl || "",
          coverImageUrl: shop.coverImageUrl || "",
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

  async function uploadShopImage(kind: "profile" | "cover", file?: File) {
    if (!file) return;
    setError(""); setMessage("");
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) { setError("Choose a JPG, PNG, WebP, or GIF image."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Each image must be 5 MB or smaller."); return; }
    const token = sessionStorage.getItem("craftosa_access_token");
    if (!token) { router.replace("/login"); return; }
    setUploading(kind);
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch(`${API_URL}/products/upload-image`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
      const data = await response.json();
      if (!response.ok || typeof data.imageUrl !== "string") throw new Error(data.message || "Could not upload image.");
      updateField(kind === "profile" ? "profileImageUrl" : "coverImageUrl", data.imageUrl);
      setMessage("Image uploaded. Remember to save shop details to keep the change.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not upload image."); }
    finally { setUploading(""); }
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
      const payload = {
        shopName: form.shopName.trim(),
        bio: form.bio.trim(),
        craftTypes: form.craftTypes.split(",").map((item) => item.trim()).filter(Boolean),
        city: form.city.trim(),
        profileImageUrl: form.profileImageUrl.trim(),
        coverImageUrl: form.coverImageUrl.trim(),
      };
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      let response = await fetch(
        hasApplication ? `${API_URL}/sellers/me/shop` : `${API_URL}/sellers/apply`,
        {
          method: hasApplication ? "PATCH" : "POST",
          headers,
          body: JSON.stringify(payload),
        },
      );
      let data = await response.json();

      // If an application already exists despite the initial lookup, update it
      // instead of showing a duplicate-application error.
      if (
        !hasApplication &&
        response.status === 409 &&
        typeof data.message === "string" &&
        data.message.toLowerCase().includes("already exists")
      ) {
        const existingResponse = await fetch(`${API_URL}/sellers/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (existingResponse.ok) {
          const existingData = await existingResponse.json();
          const existingShop: Shop = existingData.seller || existingData;
          setHasApplication(true);
          setStatus(existingShop.status || "");
          response = await fetch(`${API_URL}/sellers/me/shop`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(payload),
          });
          data = await response.json();
        }
      }

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
        profileImageUrl: shop.profileImageUrl || "",
        coverImageUrl: shop.coverImageUrl || "",
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
        <Link href="/seller" className="text-sm font-medium text-[#8b4c35] hover:underline"><ArrowLeft size={16} className="mr-1.5 inline" />Back to Seller Dashboard</Link>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <section className="overflow-hidden rounded-2xl border border-[#ead9ca] bg-[#fffaf5]">
                  <div className="relative h-36 overflow-hidden bg-gradient-to-r from-[#633a2b] via-[#a85f42] to-[#d6a06c] sm:h-48">
                    {form.coverImageUrl ? <img src={form.coverImageUrl} alt="Shop cover preview" className="h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center gap-4"><span className="h-20 w-20 rounded-full border-[12px] border-white/10" /><span className="h-28 w-28 rounded-full border-[16px] border-[#f1c5a3]/20" /><span className="h-16 w-16 rounded-full border-[10px] border-[#e8bd63]/30" /></div>}
                    <span className="absolute left-4 top-4 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold tracking-wider text-white backdrop-blur">SHOP COVER</span>
                  </div>
                  <div className="px-5 pb-5">
                    <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex items-end gap-4">
                        <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#fffaf5] bg-white shadow-lg">{form.profileImageUrl ? <img src={form.profileImageUrl} alt="Shop profile preview" className="h-full w-full object-contain p-1" /> : <span className="text-3xl font-serif font-bold text-[#a95737]">{form.shopName.trim().charAt(0).toUpperCase() || "C"}</span>}</div>
                        <div className="pb-1"><p className="font-semibold text-[#573728]">{form.shopName || "Your handmade shop"}</p><p className="mt-1 text-xs text-[#8e7969]">{form.city || "Your city"} · Craftosa seller</p></div>
                      </div>
                      <span className="mb-1 inline-flex w-fit items-center gap-2 rounded-full bg-[#e8f4e8] px-3 py-1.5 text-xs font-semibold text-[#47734c]"><span className="h-2 w-2 rounded-full bg-[#5b965f]" /> Branding preview</span>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#ead9ca] bg-white p-4 transition hover:border-[#b96e4c] hover:shadow-sm"><span><span className="block text-sm font-semibold">Profile photo</span><span className="mt-1 block text-xs text-[#918277]">Logo or shop image · 5 MB max</span></span><span className="rounded-lg bg-[#f8eee5] px-3 py-2 text-xs font-semibold text-[#8b4c35]">{uploading === "profile" ? "Uploading…" : "Choose"}</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={Boolean(uploading)} onChange={(e) => { void uploadShopImage("profile", e.target.files?.[0]); e.currentTarget.value = ""; }} /></label>
                      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#ead9ca] bg-white p-4 transition hover:border-[#b96e4c] hover:shadow-sm"><span><span className="block text-sm font-semibold">Cover photo</span><span className="mt-1 block text-xs text-[#918277]">Wide banner · 5 MB max</span></span><span className="rounded-lg bg-[#f8eee5] px-3 py-2 text-xs font-semibold text-[#8b4c35]">{uploading === "cover" ? "Uploading…" : "Choose"}</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={Boolean(uploading)} onChange={(e) => { void uploadShopImage("cover", e.target.files?.[0]); e.currentTarget.value = ""; }} /></label>
                    </div>
                    <p className="mt-3 text-xs text-[#918277]">JPG, PNG, WebP or GIF. Upload images, then save shop details to apply them.</p>
                  </div>
                </section>
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
