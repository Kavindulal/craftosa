"use client";

import Link from "next/link";
import { Mail, MessageCircle, PackageCheck, ShieldHelp } from "lucide-react";
import CraftosaLogo from "../../components/craftosa-logo";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#35271f]">
      <header className="border-b border-[#eaded2] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
          <CraftosaLogo />
          <Link href="/" className="rounded-xl border border-[#e8dcd1] px-4 py-2 text-sm font-semibold text-[#8b4c35] hover:bg-[#faf4ee]">Back to marketplace</Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1dfd1] text-[#8b4c35]"><ShieldHelp size={24} /></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#a5684e]">Craftosa · Support</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">How can we help?</h1>
        <p className="mt-4 text-sm leading-6 text-[#81756d]">Need help with your account, a handmade product, an order, or a custom request? Contact us using the details below.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-[#eaded2] bg-white p-5">
            <PackageCheck size={22} className="text-[#a65335]" />
            <h2 className="mt-3 font-semibold">Orders and products</h2>
            <p className="mt-2 text-sm leading-6 text-[#81756d]">For delivery, product details, or custom-made requests, include your order reference (if available) and explain what you need help with.</p>
          </section>
          <section className="rounded-2xl border border-[#eaded2] bg-white p-5">
            <ShieldHelp size={22} className="text-[#a65335]" />
            <h2 className="mt-3 font-semibold">Account and privacy</h2>
            <p className="mt-2 text-sm leading-6 text-[#81756d]">For sign-in problems, password reset issues, or privacy questions, contact us. Never send your password or reset token to anyone.</p>
          </section>
        </div>
        <section className="mt-6 rounded-2xl bg-[#75422f] p-6 text-white sm:p-8">
          <h2 className="font-serif text-2xl font-semibold">Contact Kavindulal</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">Reach out using email or WhatsApp. Please describe the issue clearly and avoid sharing passwords or sensitive payment details.</p>
          <a href="mailto:kavindulal2003@gmail.com" className="mt-5 flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 text-sm hover:bg-white/15"><Mail size={19} /><span><span className="block text-xs text-white/70">Email</span>kavindulal2003@gmail.com</span></a>
          <a href="https://wa.me/94763922749" target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 text-sm hover:bg-white/15"><MessageCircle size={19} /><span><span className="block text-xs text-white/70">WhatsApp</span>076 392 2749</span></a>
        </section>
        <p className="mt-6 text-xs leading-5 text-[#9a8b80]">Support hours and response times have not been specified. We cannot promise an immediate response.</p>
      </article>
      <footer className="border-t border-[#eaded2] bg-white px-5 py-6 text-center text-xs text-[#918277]">© 2026 Craftosa. Crafted with care.</footer>
    </main>
  );
}
