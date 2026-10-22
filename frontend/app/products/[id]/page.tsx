import { Suspense } from "react";
import ProductClient from "./product-client";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#faf7f2] p-10 text-stone-500">Loading product…</main>}>
      <ProductClient productId={id} />
    </Suspense>
  );
}
