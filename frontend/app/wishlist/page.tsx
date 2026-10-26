"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  stock?: number;
};

type WishlistEntry = { _id: string; savedAt?: string; product: Product };

const fallbackImage = "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=700&q=80";

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [removingId, setRemovingId] = useState("");

  const loadWishlist = useCallback(async () => {
    const token = sessionStorage.getItem("craftosa_access_token");
    const storedUser = sessionStorage.getItem("craftosa_user");
    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(storedUser) as { role?: string };
      if (user.role !== "customer") {
        setError("Wishlist is available for customer accounts.");
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_URL}/products/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error(data.message || "Could not load your wishlist.");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void loadWishlist(); }, [loadWishlist]);

  async function removeItem(productId: string) {
    const token = sessionStorage.getItem("craftosa_access_token");
    if (!token) { router.replace("/login"); return; }
    setRemovingId(productId);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/products/wishlist/${encodeURIComponent(productId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not remove this item.");
      setItems((current) => current.filter((entry) => entry.product._id !== productId));
      setMessage("Item removed from your wishlist.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove this item.");
    } finally {
      setRemovingId("");
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#35271f]">
      <header className="border-b border-[#eee3d8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-bold text-[#8b4c35]">Craftosa<span className="text-stone-700">.</span></Link>
          <div className="flex gap-3">
            <Link href="/" className="rounded-xl border border-[#e8dcd1] px-4 py-2 text-sm font-semibold hover:bg-[#faf4ee]">Marketplace</Link>
            <Link href="/cart" className="rounded-xl bg-[#8b4c35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#713b29]"><ShoppingCart size={17} className="mr-1.5 inline" />Cart</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a5684e]">Your saved treasures</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">My Wishlist <Heart size={25} className="ml-2 inline text-[#b85f45]" aria-hidden="true" /></h1>
            <p className="mt-2 text-sm text-[#81756d]">Keep the handmade pieces you love in one place.</p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8b4c35]">{items.length} {items.length === 1 ? "item" : "items"}</span>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {message && <p role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}

        {loading ? (
          <div className="py-20 text-center text-[#81756d]">Loading your wishlist...</div>
        ) : !error && items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-[#dfcfc1] bg-white px-6 py-16 text-center">
            <Heart size={42} className="mx-auto text-[#b85f45]" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">Your wishlist is waiting for something lovely</h2>
            <p className="mt-2 text-sm text-[#81756d]">Browse handmade items and tap the heart to save your favourites.</p>
            <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#8b4c35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#713b29]">Explore the collection →</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(({ product }) => (
              <article key={product._id} className="overflow-hidden rounded-2xl border border-[#eee3d8] bg-white shadow-sm">
                <Link href={`/products/${product._id}`} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrl || fallbackImage} alt={product.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }} className="h-64 w-full object-cover" />
                </Link>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wider text-[#a5684e]">{product.category || "Handmade"}</p>
                  <Link href={`/products/${product._id}`} className="mt-2 block font-semibold hover:text-[#8b4c35]">{product.name}</Link>
                  <p className="mt-2 text-lg font-semibold text-[#8b4c35]">LKR {Number(product.price).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className={`mt-2 text-sm ${(product.stock || 0) > 0 ? "text-green-700" : "text-red-600"}`}>{(product.stock || 0) > 0 ? `${product.stock} available` : "Out of stock"}</p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/products/${product._id}`} className="flex-1 rounded-xl bg-[#8b4c35] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#713b29]">View product</Link>
                    <button type="button" disabled={removingId === product._id} onClick={() => void removeItem(product._id)} aria-label={`Remove ${product.name} from wishlist`} className="rounded-xl border border-[#e8dcd1] px-4 py-2.5 text-lg text-[#a45b43] hover:bg-[#fff2eb] disabled:opacity-60">{removingId === product._id ? "…" : <X size={18} /> }</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <footer className="mt-12 border-t border-stone-200 bg-white px-5 py-7 text-center text-sm text-stone-500">© 2026 Craftosa. Crafted with care.</footer>
    </main>
  );
}
