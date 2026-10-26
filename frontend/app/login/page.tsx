"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Leaf, LogIn, UserRound, Sparkles, Bookmark } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type LoginResponse = {
  accessToken?: string;
  access_token?: string;
  user?: { id?: string; _id?: string; role?: string; name?: string; email?: string };
  message?: string | string[];
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data: LoginResponse = await response.json();
      if (!response.ok) {
        const errorMessage = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        setMessage(errorMessage || "Invalid email or password. Please try again.");
        return;
      }
      const token = data.accessToken || data.access_token;
      if (!token) {
        setMessage("Login response did not include an access token. Please check the backend response.");
        return;
      }
      // The app currently uses sessionStorage for authentication. Remember me is kept for UI compatibility.
      sessionStorage.setItem("craftosa_access_token", token);
      if (data.user) sessionStorage.setItem("craftosa_user", JSON.stringify(data.user));
      setMessage("Welcome back! Redirecting…");
      if (data.user?.role === "admin") router.push("/admin");
      else if (data.user?.role === "seller") router.push("/seller");
      else router.push("/");
    } catch {
      setMessage("Cannot connect to the server. Make sure the backend is running on port 3001.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7eee4] p-0 sm:p-4 lg:p-7">
      <div className="mx-auto grid min-h-screen max-w-[1500px] overflow-hidden bg-[#fffdf9] shadow-2xl sm:min-h-[calc(100vh-32px)] sm:rounded-[30px] lg:min-h-[calc(100vh-56px)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative isolate hidden min-h-[760px] overflow-hidden lg:flex lg:flex-col lg:justify-between">
          <img src="/craftosa-hero.png" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" onError={(event) => { event.currentTarget.src = "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1400&q=85"; }} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#2b1b12]/55 via-[#4c2d20]/30 to-[#2b1b12]/90" />
          <div className="p-10 xl:p-14">
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/35 bg-[#f1c5a3]/95 text-[#75422f]"><Leaf size={25} /></span>
              <span className="font-serif text-2xl tracking-wide">CRAFTOSA<span className="text-[#f1c5a3]">.</span><span className="mt-1 block text-[9px] tracking-[0.2em] text-white/75">HANDMADE WITH HEART</span></span>
            </Link>
          </div>
          <div className="max-w-2xl px-10 pb-12 xl:px-14 xl:pb-14">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur"><Sparkles size={14} /> Made by hand. Made with heart.</p>
            <h1 className="font-serif text-5xl leading-[1.02] tracking-[-0.035em] text-white xl:text-6xl">Find something<span className="block italic text-[#f1c5a3]">wonderfully</span><span className="block">different.</span></h1>
            <div className="mt-6 flex items-center gap-2"><span className="h-px w-14 bg-[#e9b58e]" /><span className="h-2 w-2 rotate-45 bg-[#e9b58e]" /><span className="h-px w-14 bg-white/45" /></div>
            <p className="mt-5 max-w-md font-serif text-lg leading-8 text-white/85">Discover beautiful handmade creations and the talented artisans who bring them to life.</p>
            <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/25 bg-black/15 px-4 py-2.5 text-sm text-white/90 backdrop-blur"><Bookmark size={17} className="text-[#f1c5a3]" /> One-of-a-kind finds. Real local makers.</div>
          </div>
          <p className="px-10 pb-7 text-xs text-white/65 xl:px-14">© 2026 Craftosa. Crafted with care.</p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-9 inline-flex items-center gap-2 lg:hidden"><Leaf size={25} className="text-[#9b4e32]" /><span className="font-serif text-2xl tracking-wide text-[#39271d]">CRAFTOSA<span className="text-[#a65e42]">.</span></span></Link>
            <div className="mb-8">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#a65335]"><Sparkles size={15} /> Welcome back</p>
              <h2 className="font-serif text-4xl tracking-tight text-[#39271d] sm:text-[2.65rem]">Sign in to Craftosa</h2>
              <p className="mt-3 text-sm leading-6 text-[#817064]">Your next favourite handmade piece is waiting for you.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#40332c]">Email address</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-[#e8dcd0] bg-white px-4 py-3.5 text-sm text-[#30241e] outline-none transition placeholder:text-[#b3a79d] focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="password" className="text-sm font-medium text-[#40332c]">Password</label><Link href="/forgot-password" className="text-sm font-semibold text-[#a65335] transition hover:text-[#75402e]">Forgot password?</Link></div>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-[#e8dcd0] bg-white px-4 py-3.5 pr-12 text-sm text-[#30241e] outline-none transition placeholder:text-[#b3a79d] focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10" />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center rounded-lg px-2 text-[#8c7b70] hover:text-[#a65e43]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <label className="flex items-center gap-2.5 text-sm text-[#81756d]"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 accent-[#8b4c35]" />Remember me</label>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9b4e32] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#8b4c35]/15 transition hover:-translate-y-0.5 hover:bg-[#7f3f2a] disabled:cursor-not-allowed disabled:opacity-70">{loading ? "Signing in…" : <>Sign in <ArrowRight size={18} /></>}</button>
              {message && <p role="status" aria-live="polite" className="rounded-xl border border-[#ead7c9] bg-[#faf1e9] p-3 text-sm leading-6 text-[#75402e]">{message}</p>}
            </form>

            <div className="my-7 flex items-center gap-4"><div className="h-px flex-1 bg-[#eee3d8]" /><span className="text-[11px] font-semibold uppercase tracking-wider text-[#a69a90]">New to Craftosa?</span><div className="h-px flex-1 bg-[#eee3d8]" /></div>
            <Link href="/register" className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfcfc1] px-5 py-3.5 text-sm font-semibold text-[#554137] transition hover:border-[#a65e43] hover:bg-[#fbf2e9]"><UserRound size={17} /> Create an account</Link>
            <p className="mt-7 text-center text-xs leading-5 text-[#a69a90]">By continuing, you agree to our <Link href="/terms" className="underline underline-offset-4">Terms</Link> and <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
