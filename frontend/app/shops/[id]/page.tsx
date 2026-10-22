"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ShopProduct = { _id: string; name: string; description: string; price: number; category: string; stock: number; imageUrl: string };

type PublicShop = {
  id: string;
  userId: string;
  sellerName: string;
  shopName: string;
  bio: string;
  craftTypes: string[];
  city: string;
  status: string;
};

export default function PublicShopPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const [shop, setShop] = useState<PublicShop | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();

    async function loadShop() {
      try {
        setLoading(true);
        setError("");
        const [response, productsResponse] = await Promise.all([
          fetch(`${API_URL}/sellers/public/${encodeURIComponent(userId)}`, { cache: "no-store", signal: controller.signal }),
          fetch(`${API_URL}/products/public/seller/${encodeURIComponent(userId)}`, { cache: "no-store", signal: controller.signal }),
        ]);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "This shop is not available publicly yet.");
        setShop(data as PublicShop);
        const productsData = await productsResponse.json();
        setProducts(productsResponse.ok && Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Could not load this shop.");
      } finally {
        if (!controller.signal.aborted) { setLoading(false); setProductsLoading(false); }
      }
    }

    void loadShop();
    return () => controller.abort();
  }, [userId]);

  return (
    <main className="min-h-screen bg-[#faf7f2] text-stone-800">
      <header className="border-b border-stone-200 bg-[#fffdf9]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#a45b43]">
            Craftosa<span className="text-stone-700">.</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-stone-600 hover:text-[#a45b43]">
            ← Back to marketplace
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        {loading ? (
          <div className="animate-pulse space-y-5">
            <div className="h-48 rounded-3xl bg-stone-200" />
            <div className="h-8 w-1/3 rounded bg-stone-200" />
            <div className="h-24 rounded bg-stone-200" />
          </div>
        ) : error || !shop ? (
          <section className="rounded-3xl border border-stone-200 bg-white px-6 py-14 text-center">
            <div className="text-5xl">🌿</div>
            <h1 className="mt-4 text-2xl font-semibold">Shop not available yet</h1>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-stone-600">
              {error || "This shop cannot be viewed right now."} Shops appear publicly after the seller application is approved.
            </p>
            <Link href="/" className="mt-7 inline-flex rounded-full bg-[#a45b43] px-7 py-3 font-semibold text-white hover:bg-[#87452f]">
              Explore products
            </Link>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl bg-[#75422f] px-7 py-10 text-white md:px-12 md:py-14">
              <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
              <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-[#f1c5a3]">Meet the maker</p>
              <h1 className="relative mt-4 text-3xl font-semibold md:text-5xl">{shop.shopName}</h1>
              <p className="relative mt-3 text-white/75">{shop.city} · Craftosa artisan</p>
            </section>

            <section className="mt-7 grid gap-6 md:grid-cols-[1.4fr_0.6fr]">
              <article className="rounded-3xl border border-stone-200 bg-white p-6 md:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a45b43]">Our story</p>
                <h2 className="mt-3 text-2xl font-semibold">Handmade with care</h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-stone-600">{shop.bio}</p>
              </article>

              <aside className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8eee5] text-2xl text-[#a45b43]">✦</div>
                <h2 className="mt-4 text-lg font-semibold">About the artisan</h2>
                {shop.sellerName && <p className="mt-2 text-sm text-stone-600">{shop.sellerName}</p>}
                <p className="mt-2 text-sm text-stone-500">Based in {shop.city}</p>
                <div className="mt-5 border-t border-stone-100 pt-5">
                  <p className="text-sm font-semibold">Craft categories</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {shop.craftTypes.map((craft) => (
                      <span key={craft} className="rounded-full bg-[#f8eee5] px-3 py-1.5 text-xs font-medium text-[#8b4c37]">{craft}</span>
                    ))}
                  </div>
                </div>
              </aside>
            </section>

            <section className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a45b43]">Made by this artisan</p><h2 className="mt-2 text-2xl font-semibold md:text-3xl">Shop products</h2><p className="mt-2 text-sm text-stone-500">Explore handmade pieces from {shop.shopName}.</p></div>
                <span className="rounded-full bg-[#efe2d6] px-4 py-2 text-sm font-semibold text-[#8b4c37]">{products.length} {products.length === 1 ? "product" : "products"}</span>
              </div>
              {productsLoading ? <p className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 text-stone-500">Loading products…</p> : products.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center"><div className="text-4xl">🧺</div><h3 className="mt-3 text-lg font-semibold">No products listed yet</h3><p className="mt-2 text-sm text-stone-500">Products will appear here when this artisan publishes them.</p></div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <Link key={product._id} href={`/products/${product._id}`} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="aspect-square overflow-hidden bg-stone-100">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={product.imageUrl || "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80"} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /></div>
                      <div className="p-4"><p className="text-xs font-medium uppercase tracking-wider text-[#a45b43]">{product.category}</p><h3 className="mt-2 line-clamp-2 font-semibold">{product.name}</h3><p className="mt-3 text-lg font-semibold text-[#a45b43]">Rs. {Number(product.price).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p><p className={`mt-2 text-xs ${product.stock > 0 ? "text-green-700" : "text-red-600"}`}>{product.stock > 0 ? "In stock" : "Out of stock"}</p></div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <div className="mt-8 text-center">
              <Link href="/" className="inline-flex rounded-full border border-[#d8c4b5] px-6 py-3 font-semibold text-[#8b4c37] transition hover:bg-white">
                Discover more handmade products →
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
