"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Sparkles } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message || "Unable to request a password reset.");
      setMessage(data.message || "If an account exists for that email, password reset instructions will be sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to Craftosa. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7eee4] p-0 sm:p-4 lg:p-7">
      <div className="mx-auto grid min-h-screen max-w-[1440px] overflow-hidden bg-[#fffdf9] shadow-2xl sm:min-h-[calc(100vh-32px)] sm:rounded-[30px] lg:min-h-[calc(100vh-56px)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative isolate hidden min-h-[650px] overflow-hidden lg:flex lg:flex-col lg:justify-between">
          <img src="/craftosa-hero.png" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" onError={(event) => { event.currentTarget.src = "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1400&q=85"; }} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#2b1b12]/60 via-[#4c2d20]/35 to-[#2b1b12]/90" />
          <Link href="/" className="p-12 font-serif text-2xl tracking-widest text-white">CRAFTOSA<span className="text-[#f1c5a3]">.</span></Link>
          <div className="max-w-xl px-12 pb-14">
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#f1c5a3]"><Sparkles size={15} /> A little help getting back</p>
            <h1 className="font-serif text-5xl leading-tight text-white xl:text-6xl">Your handmade favourites are waiting.</h1>
            <p className="mt-5 max-w-md font-serif text-lg leading-8 text-white/80">Reset your password securely and come back to discover the stories behind every creation.</p>
          </div>
          <p className="px-12 pb-7 text-xs text-white/65">© 2026 Craftosa. Crafted with care.</p>
        </section>
        <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <Link href="/login" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[#8b4c35] hover:text-[#713b29]"><ArrowLeft size={17} /> Back to sign in</Link>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#a65335]"><Mail size={16} /> Account recovery</p>
            <h2 className="font-serif text-4xl tracking-tight text-[#39271d]">Forgot your password?</h2>
            <p className="mt-3 text-sm leading-6 text-[#817064]">Enter the email address connected to your Craftosa account. If it matches an account, we’ll send a secure reset link.</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#40332c]">Email address</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-[#e8dcd0] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b3a79d] focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10" />
              </div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9b4e32] px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#7f3f2a] disabled:opacity-70">{loading ? "Sending request…" : <>Send reset link <ArrowRight size={17} /></>}</button>
            </form>
            {message && <div role="status" className="mt-5 flex gap-3 rounded-xl border border-[#d8e4d1] bg-[#f2f7ed] p-4 text-sm leading-6 text-[#42623c]"><CheckCircle2 className="mt-0.5 shrink-0" size={19} /><p>{message}</p></div>}
            {error && <p role="alert" className="mt-5 rounded-xl border border-[#ead7c9] bg-[#faf1e9] p-4 text-sm leading-6 text-[#75402e]">{error}</p>}
            <p className="mt-8 text-center text-xs leading-5 text-[#a69a90]">For your security, this page never confirms whether an email address has an account.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
