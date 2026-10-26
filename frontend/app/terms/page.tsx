"use client";

import Link from "next/link";
import CraftosaLogo from "../../components/craftosa-logo";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#35271f]">
      <header className="border-b border-[#eaded2] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <CraftosaLogo />
          <Link href="/" className="rounded-xl border border-[#e8dcd1] px-4 py-2 text-sm font-semibold text-[#8b4c35] hover:bg-[#faf4ee]">
            Back to marketplace
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a5684e]">Craftosa</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">Terms and Conditions</h1>
        <p className="mt-4 text-sm leading-6 text-[#81756d]">
          These terms describe the basic expectations for using the Craftosa handmade marketplace.
          Update this page with your final approved legal terms before making the marketplace publicly available.
        </p>
        <div className="mt-8 space-y-7 text-sm leading-7 text-[#5f5047]">
          <section>
            <h2 className="text-lg font-semibold text-[#35271f]">1. Using Craftosa</h2>
            <p>Use the marketplace lawfully and provide accurate information when creating an account, listing products, or placing an order. Keep your sign-in details secure and tell us if you suspect unauthorised access.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#35271f]">2. Products and sellers</h2>
            <p>Products are offered by independent sellers. Sellers are responsible for accurate descriptions, pricing, availability, product quality, and arranging delivery as agreed with the customer.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#35271f]">3. Orders and payment</h2>
            <p>Review your order details before submitting an order. Where cash on delivery is offered, payment is made according to the delivery arrangement confirmed by the seller. Contact the seller promptly if you need to discuss an order.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#35271f]">4. Custom orders and messages</h2>
            <p>Custom requests, quotations, production details, and delivery expectations should be confirmed between the customer and seller through the available communication features. Do not share passwords or sensitive payment credentials in messages.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#35271f]">5. Acceptable use</h2>
            <p>Do not upload unlawful, misleading, abusive, or infringing content; attempt to access another account; interfere with the service; or use Craftosa to deceive other users.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#35271f]">6. Changes and contact</h2>
            <p>These are starter terms for the project and are not a substitute for legal advice. Review them for compliance with applicable law before launching the marketplace publicly.</p>
          </section>
        </div>
        <section className="mt-9 rounded-2xl border border-[#eaded2] bg-white p-5">
          <h2 className="font-semibold text-[#35271f]">Contact Craftosa</h2>
          <p className="mt-2 text-sm text-[#81756d]">For questions about these terms, contact Kavindulal.</p>
          <a href="mailto:kavindulal2003@gmail.com" className="mt-3 block text-sm text-[#8b4c35] hover:underline">kavindulal2003@gmail.com</a>
          <a href="https://wa.me/94763922749" target="_blank" rel="noreferrer" className="mt-2 block text-sm text-[#8b4c35] hover:underline">WhatsApp: 076 392 2749</a>
          <Link href="/help" className="mt-4 inline-block text-sm font-semibold text-[#8b4c35] underline underline-offset-4">Help & Contact</Link>
        </section>
      </article>
      <footer className="border-t border-[#eaded2] bg-white px-5 py-6 text-center text-xs text-[#918277]">© 2026 Craftosa. Crafted with care.</footer>
    </main>
  );
}
