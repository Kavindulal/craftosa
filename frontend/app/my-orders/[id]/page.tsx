import { Suspense } from "react";
import OrderDetailClient from "./order-detail-client";

type OrderDetailPageProps = { params: Promise<{ id: string }> };

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f8f5ef] p-8 text-[#81756d]">Loading order details…</main>}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}

async function OrderDetailContent({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailClient orderId={id} />;
}
