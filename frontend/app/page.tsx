
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CraftosaLogo from "../components/craftosa-logo";
import { ArrowRight, Heart, MessageCircle, Search, ShoppingCart } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SignedInUser = { name?: string; email?: string; role?: string };

type Product = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  imageUrl?: string;
  image?: string;
  status?: string;
  seller?: {
    shopName?: string;
    name?: string;
  };
};

const categories = [
  "All Products",
  "Jewellery",
  "Home Decor",
  "Gifts",
  "Pottery",
  "Wood Crafts",
  "Textiles",
  "Other",
];

const fallbackImage =
  "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=800&q=80";

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedInUser, setSignedInUser] = useState<SignedInUser | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("craftosa_user");
    const token = sessionStorage.getItem("craftosa_access_token");

    if (!token || !storedUser) {
      setSignedInUser(null);
      return;
    }

    try {
      setSignedInUser(JSON.parse(storedUser) as SignedInUser);
    } catch {
      sessionStorage.removeItem("craftosa_user");
      setSignedInUser(null);
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        // Public endpoint: list marketplace products.
        const response = await fetch(`${API_URL}/products`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Products could not be loaded (HTTP ${response.status}).`
          );
        }

        const data: unknown = await response.json();

        const list = Array.isArray(data)
          ? data
          : data &&
              typeof data === "object" &&
              "products" in data &&
              Array.isArray(data.products)
            ? data.products
            : [];

        setProducts(list as Product[]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to the marketplace."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const name = product.name || product.title || "";
      const description = product.description || "";
      const productCategory = product.category || "";

      const matchesSearch = `${name} ${description} ${productCategory}`
        .toLowerCase()
        .includes(query);

      const matchesCategory =
        category === "All Products" ||
        productCategory.toLowerCase() === category.toLowerCase();

      const isAvailable =
        product.status !== "inactive" &&
        product.status !== "rejected";

      return matchesSearch && matchesCategory && isAvailable;
    });
  }, [products, search, category]);

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#35271f]">
      {/* Navigation */}
      <header className="sticky top-0 z-20 border-b border-[#eee3d8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <CraftosaLogo tagline />

          <nav className="hidden items-center gap-7 text-sm text-[#76675d] md:flex">
            <a href="#shop" className="hover:text-[#8b4c35]">
              Shop
            </a>
            <a href="#categories" className="hover:text-[#8b4c35]">
              Categories
            </a>
            <a href="#our-story" className="hover:text-[#8b4c35]">
              Our Story
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#8b4c35] hover:bg-[#f8eee5]"><ShoppingCart size={17} className="mr-1.5 inline" />Cart</Link>
            {signedInUser?.role === "customer" && <><Link href="/wishlist" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#8b4c35] hover:bg-[#f8eee5]"><Heart size={17} className="mr-1.5 inline" />Wishlist</Link><Link href="/messages" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#8b4c35] hover:bg-[#f8eee5]"><MessageCircle size={17} className="mr-1.5 inline" />Messages</Link></>}
            {signedInUser ? (
              <>
                {signedInUser.role === "seller" ? (
                  <Link
                    href="/seller"
                    className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-[#f8eee5]"
                  >
                    <ShoppingCart size={16} className="mr-1.5 inline" />Seller Dashboard
                  </Link>
                ) : signedInUser.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-[#f8eee5]"
                  >
                    <ShoppingCart size={16} className="mr-1.5 inline" />Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-[#f8eee5]"
                  >
                    <Heart size={16} className="mr-1.5 inline" />My Account
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem("craftosa_access_token");
                    sessionStorage.removeItem("craftosa_user");
                    setSignedInUser(null);
                  }}
                  className="rounded-xl bg-[#8b4c35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#713b29]"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-[#f8eee5]"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="hidden rounded-xl bg-[#8b4c35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#713b29] sm:inline-flex"
                >
                  Join Craftosa
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:py-14 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
        <div className="py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a5684e]">
            Made by hand. Made with heart.
          </p>

          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find something{" "}
            <span className="font-serif italic text-[#a5684e]">
              wonderfully
            </span>{" "}
            different.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-[#85766b]">
            Discover one-of-a-kind handmade creations from talented local
            artisans. Every piece has a story, and yours is waiting to begin.
          </p>

          <a
            href="#shop"
            className="mt-7 inline-flex rounded-xl bg-[#8b4c35] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#713b29]"
          >
            Explore the collection <ArrowRight size={17} className="ml-2 inline" />
          </a>

          <div className="mt-8 flex items-center gap-3 text-sm text-[#85766b]">
            <span className="flex -space-x-2">
              {["A", "K", "M"].map((letter, index) => (
                <span
                  key={letter}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#faf7f2] bg-[#edc4a4] text-xs font-semibold text-[#593c2c]"
                  style={{
                    backgroundColor: ["#edc4a4", "#e8dfc2", "#d7b5a0"][
                      index
                    ],
                  }}
                >
                  {letter}
                </span>
              ))}
            </span>
            <span>Celebrating creativity and local makers</span>
          </div>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=85"
            alt="Handcrafted items displayed in a warm, natural setting"
            className="h-[330px] w-full rounded-[2rem] object-cover sm:h-[430px] lg:h-[520px]"
          />
          <div className="absolute bottom-5 left-5 max-w-xs rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-[#a5684e]">
              The beauty of handmade
            </p>
            <p className="mt-1 font-semibold">
              Unique pieces. Real people.
            </p>
          </div>
        </div>
      </section>

      {/* Category filters */}
      <section id="categories" className="border-y border-[#eee3d8] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  category === item
                    ? "bg-[#8b4c35] text-white"
                    : "border border-[#eadfd4] bg-white text-[#76675d] hover:border-[#b88972] hover:bg-[#faf4ee]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product collection */}
      <section id="shop" className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a5684e]">
              The Craftosa collection
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Find your favourite
            </h2>
            <p className="mt-2 text-sm text-[#918277]">
              Thoughtfully made, ready to be loved.
            </p>
          </div>

          <label className="flex w-full items-center gap-3 rounded-xl border border-[#e8dcd1] bg-white px-4 py-3 sm:max-w-sm">
            <Search size={19} className="shrink-0 text-[#a5684e]" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search handmade products..."
              aria-label="Search products"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#aa9c90]"
            />
          </label>
        </div>

        {loading && (
          <div className="py-20 text-center text-[#85766b]">
            Loading handmade treasures...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-[#efd8c8] bg-[#fff4eb] p-6">
            <h3 className="font-semibold text-[#80452f]">
              We could not load the products.
            </h3>
            <p className="mt-2 text-sm text-[#80452f]">{error}</p>
            <p className="mt-2 text-sm text-[#80452f]">
              Check that the backend is running and that GET /products is a
              public endpoint.
            </p>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#dfcfc1] bg-white px-6 py-16 text-center">
            <Heart size={34} className="mx-auto text-[#b85f45]" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold">
              No products found just yet
            </h3>
            <p className="mt-2 text-sm text-[#918277]">
              Try another search or category. New handmade finds are always
              welcome.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All Products");
              }}
              className="mt-5 rounded-xl bg-[#8b4c35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#713b29]"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <p className="mt-7 text-sm text-[#918277]">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => {
                const name = product.name || product.title || "Handmade item";
                const image = product.imageUrl || product.image || fallbackImage;
                const id = product._id || product.id || String(index);

                return (
                  <article
                    key={id}
                    className="group overflow-hidden rounded-2xl border border-[#eee3d8] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6f4b35]/10"
                  >
                    <Link
                      href={`/products/${id}`}
                      className="block"
                      aria-label={`View ${name}`}
                    >
                      <div className="relative overflow-hidden bg-[#f0e8df]">
                        <img
                          src={image}
                          alt={name}
                          loading="lazy"
                          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.src = fallbackImage;
                          }}
                        />
                        {typeof product.stock === "number" &&
                          product.stock > 0 && (
                            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-[#47734c]">
                              Ready to order
                            </span>
                          )}
                      </div>

                      <div className="p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-[#a5684e]">
                          {product.category || "Handmade"}
                        </p>
                        <h3 className="mt-2 line-clamp-2 min-h-12 font-semibold leading-6 text-[#35271f]">
                          {name}
                        </h3>
                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#918277]">
                          {product.description || "Carefully made by a local artisan."}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center justify-between gap-3 px-4 pb-4">
                      <p className="text-lg font-semibold text-[#8b4c35]">
                        {typeof product.price === "number"
                          ? `LKR ${product.price.toLocaleString("en-LK")}`
                          : "Price unavailable"}
                      </p>
                      <Link
                        href={`/products/${id}`}
                        className="rounded-lg border border-[#e8dcd1] px-3 py-2 text-sm font-medium transition hover:bg-[#f8eee5]"
                      >
                        View
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Story section */}
      <section id="our-story" className="bg-[#75422f] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-8 lg:py-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f1c5a3]">
              More than a marketplace
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Every piece tells a story.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Discover the people, passion and creativity behind the things
              you bring into your life.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex w-fit rounded-xl bg-[#f1c5a3] px-5 py-3 text-sm font-semibold text-[#563525] transition hover:bg-[#ffdbc0]"
          >
            Join our community →
          </Link>
        </div>
      </section>

      <footer className="bg-white px-5 py-6 text-center text-xs text-[#918277]">
        © 2026 Craftosa. Crafted with care.
      </footer>
    </main>
  );
}
