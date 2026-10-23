
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart } from "../../lib/cart";
import ReviewsSection from "./reviews-section";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  status: string;
  seller?: string | {
    _id?: string;
    shopName?: string;
    name?: string;
  };
};

const fallbackImage =
  "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80";

export default function ProductClient({ productId }: { productId: string }) {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    if (!productId) return;

    const controller = new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/products/public/${encodeURIComponent(productId)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (response.status === 404) {
          throw new Error("This product could not be found or is no longer available.");
        }

        if (!response.ok) {
          throw new Error(`Unable to load product (HTTP ${response.status}).`);
        }

        const data: Product = await response.json();
        setProduct(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the product."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => controller.abort();
  }, [productId]);

  useEffect(() => {
    const token = sessionStorage.getItem("craftosa_access_token");
    const userRaw = sessionStorage.getItem("craftosa_user");
    if (!token || !userRaw) return;
    try {
      const user = JSON.parse(userRaw) as { role?: string };
      if (user.role !== "customer") return;
    } catch {
      return;
    }
    fetch(`${API_URL}/products/wishlist/ids`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).then(async (response) => {
      if (!response.ok) return;
      const ids: string[] = await response.json();
      setIsSaved(ids.includes(productId));
    }).catch(() => undefined);
  }, [productId]);

  async function toggleWishlist() {
    const token = sessionStorage.getItem("craftosa_access_token");
    const userRaw = sessionStorage.getItem("craftosa_user");
    if (!token || !userRaw) {
      window.location.href = "/login";
      return;
    }
    try {
      const user = JSON.parse(userRaw) as { role?: string };
      if (user.role !== "customer") {
        setWishlistMessage("Wishlist is available for customer accounts.");
        return;
      }
    } catch {
      window.location.href = "/login";
      return;
    }
    setWishlistLoading(true);
    setWishlistMessage("");
    try {
      const response = await fetch(`${API_URL}/products/wishlist/${encodeURIComponent(productId)}`, {
        method: isSaved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not update your wishlist.");
      setIsSaved(!isSaved);
      setWishlistMessage(isSaved ? "Removed from your wishlist." : "Saved to your wishlist ❤️");
    } catch (err) {
      setWishlistMessage(err instanceof Error ? err.message : "Could not update your wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  }

  async function startSellerChat() {
    const token = sessionStorage.getItem("craftosa_access_token");
    const rawUser = sessionStorage.getItem("craftosa_user");
    if (!token || !rawUser) { router.push("/login"); return; }
    try {
      const user = JSON.parse(rawUser) as { role?: string };
      if (user.role !== "customer") {
        setChatError("Chat with sellers is available from a customer account.");
        return;
      }
    } catch { router.push("/login"); return; }
    if (!sellerId) { setChatError("Seller information is not available for this product."); return; }
    setChatLoading(true);
    setChatError("");
    try {
      const response = await fetch(`${API_URL}/chat/conversations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, productId: product?._id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not start a conversation.");
      router.push(`/messages/${data.conversationId}`);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Could not start a conversation.");
    } finally { setChatLoading(false); }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf7f2] px-5 py-20">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-8 h-4 w-40 rounded bg-stone-200" />
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square rounded-3xl bg-stone-200" />
            <div className="space-y-5 py-4">
              <div className="h-5 w-24 rounded bg-stone-200" />
              <div className="h-10 w-3/4 rounded bg-stone-200" />
              <div className="h-8 w-36 rounded bg-stone-200" />
              <div className="h-24 rounded bg-stone-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-5">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl">🌿</div>
          <h1 className="text-2xl font-semibold text-stone-800">
            Product unavailable
          </h1>
          <p className="mt-3 text-stone-600">
            {error || "We could not find this product."}
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex rounded-full bg-[#a45b43] px-7 py-3 font-medium text-white transition hover:bg-[#87452f]"
          >
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  const image = product.imageUrl || fallbackImage;
  const inStock = product.stock > 0;
  const sellerId = typeof product.seller === "string"
    ? product.seller
    : product.seller?._id;

  return (
    <main className="min-h-screen bg-[#faf7f2] text-stone-800">
      <header className="border-b border-stone-200 bg-[#fffdf9]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#a45b43]"
          >
            Craftosa<span className="text-stone-700">.</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-stone-600 transition hover:text-[#a45b43]"
          >
            ← Back to marketplace
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <nav className="mb-8 text-sm text-stone-500">
          <Link href="/" className="hover:text-[#a45b43]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>{product.category}</span>
          <span className="mx-2">/</span>
          <span className="text-stone-800">{product.name}</span>
        </nav>

        <section className="grid items-start gap-10 md:grid-cols-2 md:gap-14">
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="aspect-square bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackImage;
                }}
              />
            </div>
          </div>

          <div className="py-2 md:py-5">
            <span className="inline-flex rounded-full bg-[#efe2d6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b4c37]">
              {product.category}
            </span>

            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 text-3xl font-semibold text-[#a45b43]">
              Rs. {Number(product.price).toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>

            <div className="my-7 h-px bg-stone-200" />

            {sellerId && (
              <Link
                href={`/shops/${sellerId}`}
                className="mb-7 flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-[#c99b80] hover:shadow-sm"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a45b43]">Meet the maker</p>
                  <p className="mt-1 font-semibold text-stone-800">Discover this seller’s shop</p>
                  <p className="mt-1 text-sm text-stone-500">Read their story and explore their craft</p>
                </div>
                <span className="text-xl text-[#a45b43]">→</span>
              </Link>
            )}

            {sellerId && (
              <div className="mb-7">
                <button type="button" onClick={startSellerChat} disabled={chatLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#a45b43] bg-white px-6 py-3.5 text-sm font-semibold text-[#8b4c35] transition hover:bg-[#fff2eb] disabled:opacity-60">
                  <span aria-hidden="true">✉</span> {chatLoading ? "Opening chat…" : "Chat with seller"}
                </button>
                {chatError && <p role="alert" className="mt-2 text-sm text-red-700">{chatError}</p>}
              </div>
            )}

            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-700">
              About this product
            </h2>

            <p className="mt-3 whitespace-pre-line text-base leading-8 text-stone-600">
              {product.description}
            </p>

            <div className="mt-7 flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  inStock ? "bg-green-600" : "bg-red-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  inStock ? "text-green-700" : "text-red-600"
                }`}
              >
                {inStock
                  ? `${product.stock} items available`
                  : "Currently out of stock"}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              aria-pressed={isSaved}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#e6cfc1] bg-white px-5 py-3 text-sm font-semibold text-[#8b4c35] transition hover:bg-[#fff2eb] disabled:opacity-60"
            >
              <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
              {wishlistLoading ? "Saving..." : isSaved ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>
            {wishlistMessage && <p role="status" className="mt-2 text-sm text-[#8b4c35]">{wishlistMessage}{" "}<Link href="/wishlist" className="font-semibold underline">View wishlist</Link></p>}

            <div className="mt-8">
              <label
                htmlFor="quantity"
                className="mb-3 block text-sm font-semibold"
              >
                Quantity
              </label>

              <div className="inline-flex items-center overflow-hidden rounded-full border border-stone-300 bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1 || !inStock}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="h-12 w-12 text-xl transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>

                <span
                  id="quantity"
                  aria-live="polite"
                  className="min-w-12 text-center font-medium"
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={!inStock || quantity >= product.stock}
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(product.stock, current + 1)
                    )
                  }
                  className="h-12 w-12 text-xl transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <p className="mt-3 text-sm text-stone-500">
                Subtotal: Rs.{" "}
                {(Number(product.price) * quantity).toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <button
              type="button"
              disabled={!inStock}
              onClick={() => {
                addToCart({ productId: product._id, name: product.name, price: Number(product.price), imageUrl: product.imageUrl || fallbackImage, stock: product.stock }, quantity);
                setCartMessage("Added to your cart successfully.");
              }}
              className="mt-7 w-full rounded-full bg-[#a45b43] px-7 py-4 font-semibold text-white shadow-sm transition hover:bg-[#87452f] disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>
            {cartMessage && <div role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">{cartMessage} <Link href="/cart" className="font-semibold underline">View cart</Link></div>}
            <Link href="/cart" className="mt-4 block text-center text-sm font-semibold text-[#8b4c35]">View shopping cart →</Link>

            <p className="mt-4 text-center text-xs leading-6 text-stone-500">
              Thoughtfully made. Supporting local creativity.
            </p>
          </div>
        </section>

        <ReviewsSection productId={product._id} />

        <section className="mt-16 rounded-3xl border border-stone-200 bg-[#fffdf9] px-6 py-8 md:px-10 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a45b43]">
            Made with care
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Every handmade piece tells a story.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-stone-600">
            Discover unique handmade creations from local makers on Craftosa.
            Thank you for supporting independent artisans and their creativity.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex font-semibold text-[#a45b43] hover:text-[#87452f]"
          >
            Explore more products →
          </Link>
        </section>
      </div>

      <footer className="mt-12 border-t border-stone-200 bg-[#fffdf9] px-5 py-7 text-center text-sm text-stone-500">
        © 2026 Craftosa. Crafted with care.
      </footer>
    </main>
  );
}
