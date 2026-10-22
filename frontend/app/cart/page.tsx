"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItem, readCart, saveCart } from "../lib/cart";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const money = (amount: number) => amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ id: string; total: number } | null>(null);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener("craftosa-cart-updated", sync);
    return () => window.removeEventListener("craftosa-cart-updated", sync);
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  function updateQuantity(id: string, quantity: number) {
    const updated = items.map((item) => item.productId === id ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) } : item);
    setItems(updated); saveCart(updated);
  }
  function removeItem(id: string) {
    const updated = items.filter((item) => item.productId !== id);
    setItems(updated); saveCart(updated);
  }
  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const token = sessionStorage.getItem("craftosa_access_token");
    const user = sessionStorage.getItem("craftosa_user");
    if (!token || !user) {
      router.push("/login?next=/cart");
      return;
    }
    try {
      const signedIn = JSON.parse(user) as { role?: string };
      if (signedIn.role !== "customer") { setError("Please sign in with a customer account to place an order."); return; }
    } catch { router.push("/login?next=/cart"); return; }
    if (!items.length) { setError("Your cart is empty."); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, items: items.map(item => ({ productId: item.productId, quantity: item.quantity })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message || "Order could not be placed.");
      setSuccess({ id: String(data.order.id), total: Number(data.order.total) });
      setItems([]); saveCart([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order could not be placed.");
    } finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#faf7f2] text-[#34251e]">
    <header className="border-b border-[#eee2d7] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Link href="/" className="text-2xl font-bold text-[#8b4c35]">craftosa.</Link><Link href="/" className="text-sm text-stone-600 hover:text-[#8b4c35]">Continue shopping</Link></div></header>
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      {success ? <section className="mx-auto max-w-xl rounded-3xl border border-green-200 bg-white p-8 text-center md:p-12"><div className="text-5xl">🎉</div><h1 className="mt-4 text-3xl font-semibold">Order placed!</h1><p className="mt-3 text-stone-600">Thank you for supporting local makers. Your order has been saved.</p><div className="mt-6 rounded-2xl bg-[#faf7f2] p-5 text-left"><p className="text-sm text-stone-500">Order reference</p><p className="mt-1 break-all font-semibold">{success.id}</p><p className="mt-4 text-sm text-stone-500">Order total · Cash on Delivery</p><p className="mt-1 text-xl font-semibold text-[#8b4c35]">Rs. {money(success.total)}</p></div><Link href="/" className="mt-7 inline-flex rounded-full bg-[#8b4c35] px-7 py-3 font-semibold text-white">Continue shopping</Link></section> : <>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a45b43]">Your basket</p><h1 className="mt-2 text-3xl font-semibold md:text-4xl">Shopping Cart & Checkout</h1><p className="mt-3 text-stone-500">Your next favourite handmade piece might be right here.</p>
        {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {items.length === 0 ? <section className="mt-8 rounded-3xl border border-[#eee2d7] bg-white px-6 py-14 text-center"><div className="text-5xl">🧺</div><h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2><p className="mt-2 text-stone-500">Explore the marketplace and add something handmade.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-[#8b4c35] px-7 py-3 font-semibold text-white">Explore products</Link></section> : <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">{items.map(item => <article key={item.productId} className="flex gap-4 rounded-2xl border border-[#eee2d7] bg-white p-4 sm:p-5"><img src={item.imageUrl || "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=300&q=80"} alt={item.name} className="h-24 w-24 rounded-xl bg-stone-100 object-cover sm:h-28 sm:w-28"/><div className="min-w-0 flex-1"><Link href={`/products/${item.productId}`} className="font-semibold hover:text-[#8b4c35]">{item.name}</Link><p className="mt-1 text-sm text-stone-500">Rs. {money(item.price)} each</p><div className="mt-3 flex flex-wrap items-center gap-3"><div className="flex items-center rounded-full border border-stone-200"><button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-3 py-1.5">−</button><span className="min-w-8 text-center text-sm">{item.quantity}</span><button type="button" disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-3 py-1.5 disabled:opacity-40">+</button></div><button type="button" onClick={() => removeItem(item.productId)} className="text-sm text-red-600 hover:underline">Remove</button></div></div><p className="whitespace-nowrap font-semibold">Rs. {money(item.price * item.quantity)}</p></article>)}</section>
          <form onSubmit={placeOrder} className="rounded-3xl border border-[#eee2d7] bg-white p-6 md:p-8"><h2 className="text-xl font-semibold">Delivery details</h2><p className="mt-1 text-sm text-stone-500">Enter where you want your order delivered.</p><div className="mt-6 space-y-4">{([{key:"customerName",label:"Full name",placeholder:"Your full name"},{key:"phone",label:"Phone number",placeholder:"07X XXX XXXX"},{key:"address",label:"Delivery address",placeholder:"House number, street, village"},{key:"city",label:"City",placeholder:"Your city"}] as const).map(field => <label key={field.key} className="block text-sm font-medium">{field.label}<input required value={form[field.key]} onChange={e => setForm(current => ({...current,[field.key]:e.target.value}))} placeholder={field.placeholder} className="mt-2 w-full rounded-xl border border-[#e7d9ce] px-4 py-3 outline-none focus:border-[#a65e43]"/></label>)}</div><div className="mt-6 rounded-2xl bg-[#faf7f2] p-5"><div className="flex justify-between text-sm text-stone-600"><span>Items ({items.reduce((n,item)=>n+item.quantity,0)})</span><span>Rs. {money(total)}</span></div><div className="mt-3 flex justify-between text-sm text-stone-600"><span>Payment</span><span>Cash on Delivery</span></div><div className="my-4 border-t border-stone-200"/><div className="flex justify-between text-lg font-semibold"><span>Total</span><span className="text-[#8b4c35]">Rs. {money(total)}</span></div></div><button disabled={loading || !items.length} className="mt-6 w-full rounded-full bg-[#8b4c35] px-6 py-4 font-semibold text-white hover:bg-[#713b29] disabled:opacity-50">{loading ? "Placing order…" : "Place order · Cash on Delivery"}</button><p className="mt-3 text-center text-xs text-stone-500">Your order will be confirmed after stock availability is checked.</p></form>
        </div>}
      </>}
    </div>
  </main>;
}
