import { Suspense } from "react";
import ProductClient from "./product-client";

type ProductDetailsPageProps = { params: Promise<{ id: string }> };

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#faf7f2] p-10 text-stone-500">Loading product…</main>}>
      <ProductDetailsContent params={params} />
    </Suspense>
  );
}

async function ProductDetailsContent({ params }: ProductDetailsPageProps) {
  const { id } = await params;
  return <ProductClient productId={id} />;
}
