"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CraftosaLogo from "../components/craftosa-logo";
import { resolveImageUrl } from "./lib/image-url";
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  CircleUserRound,
  Grid2X2,
  House,
  Leaf,
  LogIn,
  MessageCircle,
  MoreHorizontal,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  UserRound,
  Gift,
  Gem,
  Menu,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  seller?: { shopName?: string; name?: string };
};

const categories = [
  { label: "All Products", icon: Grid2X2 },
  { label: "Jewellery", icon: Gem },
  { label: "Home Decor", icon: House },
  { label: "Gifts", icon: Gift },
  { label: "Pottery", icon: Package },
  { label: "Wood Crafts", icon: Leaf },
  { label: "Textiles", icon: Tag },
  { label: "Other", icon: MoreHorizontal },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=85";

function normalizeCategory(value = "") {
  return value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

function categoryMatches(productCategory = "", selectedCategory: string) {
  if (selectedCategory === "All Products") return true;

  const actual = normalizeCategory(productCategory);
  const selected = normalizeCategory(selectedCategory);
  if (actual === selected) return true;

  const aliases: Record<string, string[]> = {
    jewellery: ["jewelry", "jewel", "jewelleryandaccessories", "accessories"],
    homedecor: ["homeanddecor", "homedecoration", "decor", "homedecorations"],
    gifts: ["gift", "giftitems", "personalisedgifts", "personalizedgifts"],
    pottery: ["ceramics", "ceramic", "clay", "claycrafts"],
    woodcrafts: ["woodcraft", "woodwork", "wooden", "woodenitems", "woodcarving"],
    textiles: ["textile", "fabric", "fabriccrafts", "clothing", "weaving"],
    other: ["others", "miscellaneous", "misc"],
  };

  const selectedAliases = aliases[selected] || [];
  const actualAliases = aliases[actual] || [];
  return selectedAliases.includes(actual) || actualAliases.includes(selected);
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedInUser, setSignedInUser] = useState<SignedInUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        const response = await fetch(`${API_URL}/products`, { cache: "no-store" });
        if (!response.ok) throw new Error(`Products could not be loaded (HTTP ${response.status}).`);
        const data: unknown = await response.json();
        const list = Array.isArray(data)
          ? data
          : data && typeof data === "object" && "products" in data && Array.isArray(data.products)
            ? data.products
            : [];
        setProducts(list as Product[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to connect to the marketplace.");
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
      const matchesSearch = `${name} ${description} ${productCategory}`.toLowerCase().includes(query);
      const matchesSelectedCategory = categoryMatches(productCategory, category);
      const isAvailable = product.status !== "inactive" && product.status !== "rejected";
      return matchesSearch && matchesSelectedCategory && isAvailable;
    });
  }, [products, search, category]);

  const signOut = () => {
    sessionStorage.removeItem("craftosa_access_token");
    sessionStorage.removeItem("craftosa_user");
    setSignedInUser(null);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf6f0] text-[#35271f]">
      <header className="sticky top-0 z-30 border-b border-[#eaded2] bg-[#fffdf9]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-9">
          <CraftosaLogo tagline className="shrink-0" />

          <nav className="hidden items-center gap-6 text-sm font-medium text-[#665247] xl:flex">
            <a href="#shop" className="transition hover:text-[#a65335]">Shop</a>
            <a href="#categories" className="transition hover:text-[#a65335]">Categories</a>
            <a href="#our-story" className="transition hover:text-[#a65335]">Our Story</a>
          </nav>

          <div className="hidden items-center gap-1.5 md:flex">
            <Link href="/cart" className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-[#8b4c35] transition hover:bg-[#f7e9dc]">
              <ShoppingCart size={18} /> <span>Cart</span>
            </Link>
            {signedInUser?.role === "customer" && (
              <>
                <Link href="/wishlist" aria-label="Saved items" title="Saved items" className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-[#6a5143] transition hover:bg-[#f7e9dc]">
                  <Bookmark size={18} /> <span>Saved</span>
                </Link>
                <Link href="/messages" className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-[#6a5143] transition hover:bg-[#f7e9dc]">
                  <MessageCircle size={18} /> <span>Messages</span>
                </Link>
              </>
            )}

            {signedInUser ? (
              <>
                <Link
                  href={signedInUser.role === "seller" ? "/seller" : signedInUser.role === "admin" ? "/admin" : "/profile"}
                  className="ml-1 inline-flex items-center gap-2 rounded-xl border border-[#e9c6ad] bg-[#f5dfcd] px-3.5 py-2.5 text-sm font-semibold text-[#673b2a] shadow-sm transition hover:border-[#c98a68] hover:bg-[#efd1ba]"
                >
                  <CircleUserRound size={18} />
                  <span>{signedInUser.role === "seller" ? "Seller Dashboard" : signedInUser.role === "admin" ? "Admin Dashboard" : "My Account"}</span>
                  <ChevronDown size={14} />
                </Link>
                <button type="button" onClick={signOut} className="rounded-xl bg-[#8b4c35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#713b29]">
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#8b4c35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#713b29]">
                <LogIn size={17} /> Sign in
              </Link>
            )}
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex rounded-xl border border-[#eaded2] p-2 text-[#75422f] md:hidden"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#eaded2] bg-[#fffdf9] px-4 py-4 md:hidden">
            <label className="mb-3 flex items-center gap-2 rounded-xl border border-[#e8d8c9] bg-[#faf5ef] px-3 py-2.5">
              <Search size={17} className="text-[#8b4c35]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search handmade products..." aria-label="Search products" className="w-full bg-transparent text-sm outline-none" />
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <a href="#shop" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-[#f7e9dc]">Shop</a>
              <a href="#categories" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-[#f7e9dc]">Categories</a>
              <a href="#our-story" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-[#f7e9dc]">Our Story</a>
              <Link href="/cart" className="rounded-lg px-3 py-2 hover:bg-[#f7e9dc]">Cart</Link>
              {signedInUser ? (
                <>
                  <Link href={signedInUser.role === "seller" ? "/seller" : signedInUser.role === "admin" ? "/admin" : "/profile"} className="rounded-lg bg-[#f5dfcd] px-3 py-2 font-semibold text-[#673b2a]"><UserRound size={16} className="mr-2 inline" />My Account</Link>
                  <button type="button" onClick={signOut} className="rounded-lg px-3 py-2 text-left hover:bg-[#f7e9dc]">Sign out</button>
                </>
              ) : <Link href="/login" className="rounded-lg bg-[#8b4c35] px-3 py-2 font-semibold text-white"><LogIn size={16} className="mr-2 inline" />Sign in</Link>}
            </div>
          </div>
        )}
      </header>

      <section className="relative isolate overflow-hidden bg-[#f7eee4]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_35%,rgba(255,253,247,0.98)_0%,rgba(250,242,231,0.96)_36%,rgba(250,242,231,0.12)_67%,transparent_100%)]" />
        <div className="mx-auto grid max-w-[1440px] lg:min-h-[610px] lg:grid-cols-[0.86fr_1.14fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#a65335] sm:text-xs">
              <Sparkles size={15} /> Made by hand. Made with heart.
            </p>
            <h1 className="mt-6 max-w-2xl font-serif text-[clamp(3rem,5.6vw,5.5rem)] leading-[0.99] tracking-[-0.045em] text-[#39271d]">
              Find something
              <span className="block font-serif italic text-[#a65e42]">wonderfully</span>
              <span className="block">different.</span>
            </h1>
            <div className="mt-7 flex items-center gap-2" aria-hidden="true">
              <span className="h-px w-16 bg-[#b86c4b]" />
              <span className="h-2.5 w-2.5 rotate-45 bg-[#b86c4b]" />
              <span className="h-px w-16 bg-[#e5c8b4]" />
            </div>
            <p className="mt-6 max-w-xl font-serif text-base leading-7 text-[#796354] sm:text-lg sm:leading-8">
              Discover one-of-a-kind handmade creations from talented local artisans. Every piece has a story, and yours is waiting to begin.
            </p>
            <a href="#shop" className="mt-7 inline-flex w-fit items-center gap-3 rounded-xl bg-[#9b4e32] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(125,63,40,0.18)] transition hover:-translate-y-0.5 hover:bg-[#7f3f2a]">
              <Leaf size={18} /> Explore the collection <ArrowRight size={18} />
            </a>
          </div>

          <div className="relative min-h-[300px] sm:min-h-[430px] lg:min-h-[610px]">
            <img
              src="/craftosa-hero.png"
              onError={(event) => { event.currentTarget.src = fallbackImage; }}
              alt="A Sri Lankan artisan carefully carving a traditional wooden design in a sunlit workshop"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f7eee4] via-[#f7eee4]/45 to-transparent lg:from-[#f7eee4] lg:via-[#f7eee4]/10 lg:to-transparent" />
            <div className="absolute bottom-6 right-5 max-w-[250px] rounded-2xl border border-white/70 bg-[#fffdf9]/90 p-4 shadow-xl backdrop-blur-md sm:bottom-8 sm:right-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a65335]">The beauty of handmade</p>
              <p className="mt-1 font-serif text-lg font-semibold text-[#39271d]">Unique pieces. Real people.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="border-b border-[#eaded2] bg-[#fffdf9]">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-7 sm:py-7 lg:px-10">
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin] sm:flex-wrap sm:justify-center sm:overflow-visible">
            {categories.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                aria-pressed={category === label}
                onClick={() => { setCategory(label); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className={`inline-flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-3 text-sm font-medium transition duration-200 sm:px-5 ${category === label ? "border-[#9b4e32] bg-[#9b4e32] text-white shadow-md shadow-[#9b4e32]/15" : "border-[#e8d9cc] bg-white text-[#543a2d] hover:border-[#c58c70] hover:bg-[#faf0e7]"}`}
              >
                <Icon size={18} strokeWidth={1.8} /> {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 py-12 sm:px-7 lg:px-9 lg:py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a65335]">The Craftosa collection</p>
            <h2 className="mt-2 font-serif text-3xl text-[#39271d] sm:text-4xl">Find your favourite</h2>
            <p className="mt-2 text-sm text-[#8c796c]">Thoughtfully made, ready to be loved.</p>
          </div>
          <label className="flex w-full items-center gap-3 rounded-full border border-[#e8d8c9] bg-[#faf5ef] px-4 py-3 transition focus-within:border-[#b87556] sm:max-w-sm">
            <Search size={19} className="shrink-0 text-[#8b4c35]" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search handmade products..." aria-label="Search products" className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#aa9a8d]" />
          </label>
        </div>

        {!loading && !error && (
          <p className="mt-7 text-sm text-[#8c796c]">
            Showing <span className="font-semibold text-[#543a2d]">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "piece" : "pieces"}
            {category !== "All Products" ? ` in ${category}` : ""}
          </p>
        )}

        {loading && <div className="py-20 text-center text-[#85766b]">Discovering handmade treasures…</div>}
        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-[#efd8c8] bg-[#fff4eb] p-6">
            <h3 className="font-semibold text-[#80452f]">We could not load the products.</h3>
            <p className="mt-2 text-sm text-[#80452f]">{error}</p>
            <p className="mt-2 text-sm text-[#80452f]">Check that the backend is running and GET /products is available.</p>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-[#dfcfc1] bg-white px-6 py-16 text-center">
            <ShoppingBag size={36} className="mx-auto text-[#b85f45]" aria-hidden="true" />
            <h3 className="mt-4 font-serif text-xl font-semibold">No products found just yet</h3>
            <p className="mt-2 text-sm text-[#918277]">Try another category or search term to discover more handmade finds.</p>
            <button type="button" onClick={() => { setSearch(""); setCategory("All Products"); }} className="mt-5 rounded-xl bg-[#8b4c35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#713b29]">
              <Check size={16} className="mr-2 inline" /> Clear filters
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => {
              const name = product.name || product.title || "Handmade item";
              const image = resolveImageUrl(product.imageUrl || product.image) || fallbackImage;
              const id = product._id || product.id || String(index);
              return (
                <article key={id} className="group overflow-hidden rounded-2xl border border-[#eee3d8] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6f4b35]/10">
                  <Link href={`/products/${id}`} className="block" aria-label={`View ${name}`}>
                    <div className="relative overflow-hidden bg-[#f0e8df]">
                      <img src={image} alt={name} loading="lazy" onError={(event) => { event.currentTarget.src = fallbackImage; }} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" />
                      {typeof product.stock === "number" && product.stock > 0 && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-[#47734c]">Ready to order</span>}
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#a5684e]">{product.category || "Handmade"}</p>
                      <h3 className="mt-2 line-clamp-2 min-h-12 font-semibold leading-6 text-[#35271f]">{name}</h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#918277]">{product.description || "Carefully made by a local artisan."}</p>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between gap-3 px-4 pb-4">
                    <p className="text-lg font-semibold text-[#8b4c35]">{typeof product.price === "number" ? `LKR ${product.price.toLocaleString("en-LK")}` : "Price unavailable"}</p>
                    <Link href={`/products/${id}`} className="rounded-lg border border-[#e8dcd1] px-3 py-2 text-sm font-medium transition hover:bg-[#f8eee5]">View</Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="our-story" className="bg-[#75422f] text-white">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-5 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-9 lg:py-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f1c5a3]">More than a marketplace</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Every piece tells a story.</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">Discover the people, passion and creativity behind the things you bring into your life.</p>
          </div>
          <Link href="/login" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#f1c5a3] px-5 py-3 text-sm font-semibold text-[#563525] transition hover:bg-[#ffdbc0]">
            Become part of Craftosa <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <footer className="bg-white px-5 py-6 text-center text-xs text-[#918277]">© 2026 Craftosa. Crafted with care.</footer>
    </main>
  );
}
