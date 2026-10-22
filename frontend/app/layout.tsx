
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Craftosa | Handmade Marketplace",
  description:
    "Discover beautiful handmade creations from talented artisans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
