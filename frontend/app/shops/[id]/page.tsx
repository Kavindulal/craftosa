import { Suspense } from "react";
import ShopClient from "./shop-client";

export default async function PublicShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#faf7f2] p-10 text-stone-500">Loading shop…</main>}>
      <ShopClient userId={id} />
    </Suspense>
  );
}
