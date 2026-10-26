import { Suspense } from "react";
import ShopClient from "./shop-client";

type PublicShopPageProps = { params: Promise<{ id: string }> };

export default function PublicShopPage({ params }: PublicShopPageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#faf7f2] p-10 text-stone-500">Loading shop…</main>}>
      <PublicShopContent params={params} />
    </Suspense>
  );
}

async function PublicShopContent({ params }: PublicShopPageProps) {
  const { id } = await params;
  return <ShopClient userId={id} />;
}
