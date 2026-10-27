import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import CraftosaLogo from "../components/craftosa-logo";

export const metadata: Metadata = {
  title: "Craftosa | Handmade Marketplace",
  description:
    "Discover beautiful handmade creations from talented artisans.",
};

function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#eadfd3] bg-[#fffdf9] text-[#55372d]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_1fr_1fr] md:px-10">
        <div>
          <CraftosaLogo href="/" tagline />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#88766a]">
            A handmade marketplace connecting people with unique creations and the makers behind them.
          </p>
          <p className="mt-4 text-xs text-[#a09185]">© {new Date().getFullYear()} Craftosa. Crafted with care.</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#a5684e]">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><a className="transition hover:text-[#a5684e]" href="mailto:kavindulal2003@gmail.com">kavindulal2003@gmail.com</a></li>
            <li><a className="transition hover:text-[#a5684e]" href="tel:+94763922749">076 392 2749</a></li>
            <li><a className="transition hover:text-[#a5684e]" href="https://wa.me/94763922749" target="_blank" rel="noreferrer">Chat on WhatsApp ↗</a></li>
            <li className="leading-6 text-[#88766a]">Kavindu Lal<br />No. 34, Arunodagama,<br />Habarana, Sri Lanka</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#a5684e]">Connect</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><a className="transition hover:text-[#a5684e]" href="https://www.linkedin.com/in/kavindu-lal" target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
            <li><a className="transition hover:text-[#a5684e]" href="https://github.com/Kavindulal" target="_blank" rel="noreferrer">GitHub ↗</a></li>
            <li><Link className="transition hover:text-[#a5684e]" href="/help">Help & Support</Link></li>
            <li><Link className="transition hover:text-[#a5684e]" href="/privacy">Privacy Policy</Link></li>
            <li><Link className="transition hover:text-[#a5684e]" href="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
