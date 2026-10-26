"use client";

import Link from "next/link";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import CraftosaLogo from "../../components/craftosa-logo";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#35271f]">
      <header className="border-b border-[#eaded2] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
          <CraftosaLogo />
          <Link href="/" className="rounded-xl border border-[#e8dcd1] px-4 py-2 text-sm font-semibold text-[#8b4c35] hover:bg-[#faf4ee]">Back to marketplace</Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1dfd1] text-[#8b4c35]"><ShieldCheck size={24} /></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#a5684e]">Craftosa · Privacy</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-6 text-[#81756d]">This is a concise starter privacy notice for the Craftosa project. Review it against the data actually collected by the final service and applicable law before public launch.</p>
        <div className="mt-8 space-y-7 text-sm leading-7 text-[#5f5047]">
          <section><h2 className="text-lg font-semibold text-[#35271f]">1. Information you provide</h2><p>Craftosa may process account details such as your name and email address, seller and product information, order details, and messages exchanged through the marketplace. Do not include passwords or sensitive payment credentials in messages.</p></section>
          <section><h2 className="text-lg font-semibold text-[#35271f]">2. How information is used</h2><p>Information is used to operate accounts, show product listings, support orders and custom requests, enable customer–seller communication, protect the service, and respond to support requests.</p></section>
          <section><h2 className="text-lg font-semibold text-[#35271f]">3. Sharing and visibility</h2><p>Product listings and seller-provided shop details may be visible to marketplace visitors. Relevant order and conversation details may be shared with the customer or seller involved so they can fulfil an order or respond to a request. Craftosa should not sell personal information to advertisers.</p></section>
          <section><h2 className="text-lg font-semibold text-[#35271f]">4. Security and retention</h2><p>We aim to use reasonable safeguards to protect information. No online service can guarantee absolute security. Information should be retained only as needed to operate the service, meet legal obligations, resolve disputes, and protect users.</p></section>
          <section><h2 className="text-lg font-semibold text-[#35271f]">5. Your choices and requests</h2><p>For questions about your information or to request an account-data review or correction, contact Craftosa using the details below. We may need to verify your identity before responding.</p></section>
        </div>
        <div className="mt-9 rounded-2xl border border-[#eaded2] bg-white p-5">
          <h2 className="font-semibold">Privacy contact</h2>
          <a href="mailto:kavindulal2003@gmail.com" className="mt-3 flex items-center gap-2 text-sm text-[#8b4c35] hover:underline"><Mail size={17} /> kavindulal2003@gmail.com</a>
          <a href="https://wa.me/94763922749" target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 text-sm text-[#8b4c35] hover:underline"><MessageCircle size={17} /> WhatsApp: 076 392 2749</a>
        </div>
      </article>
      <footer className="border-t border-[#eaded2] bg-white px-5 py-6 text-center text-xs text-[#918277]">© 2026 Craftosa. Crafted with care.</footer>
    </main>
  );
}
