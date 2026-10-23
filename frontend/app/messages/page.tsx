"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
type Participant = { _id?: string; name?: string };
type Product = { _id?: string; name?: string; imageUrl?: string; price?: number };
type Conversation = {
  _id: string;
  otherParticipant?: Participant;
  productId?: Product | string | null;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
};

export default function MessagesInboxPage() {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "seller" | "">("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConversations = useCallback(async (quiet = false) => {
    const token = sessionStorage.getItem("craftosa_access_token");
    const rawUser = sessionStorage.getItem("craftosa_user");
    if (!token || !rawUser) { router.replace("/login"); return; }
    try {
      const user = JSON.parse(rawUser) as { role?: string };
      if (user.role !== "customer" && user.role !== "seller") {
        setError("Messaging is available for customer and seller accounts.");
        setLoading(false);
        return;
      }
      setRole(user.role);
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json().catch(() => []);
      if (response.status === 401 || response.status === 403) { router.replace("/login"); return; }
      if (!response.ok) throw new Error(data.message || "Could not load conversations.");
      setConversations(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      if (!quiet) setError(err instanceof Error ? err.message : "Could not load conversations.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadConversations();
    const timer = window.setInterval(() => { void loadConversations(true); }, 5000);
    return () => window.clearInterval(timer);
  }, [loadConversations]);

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#35271f]">
      <header className="border-b border-[#eee3d8] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-bold text-[#8b4c35]">Craftosa<span className="text-stone-700">.</span></Link>
          <Link href={role === "seller" ? "/seller" : "/"} className="rounded-xl border border-[#e8dcd1] px-4 py-2 text-sm font-semibold hover:bg-[#faf4ee]">{role === "seller" ? "Seller dashboard" : "Marketplace"}</Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a5684e]">Craftosa messages</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Your conversations</h1>
            <p className="mt-2 text-sm text-[#81756d]">Talk directly with customers and makers, all in one place.</p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8b4c35]">{conversations.length} conversations</span>
        </div>
        {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {loading ? <div className="py-20 text-center text-[#81756d]">Loading your conversations…</div> : !error && conversations.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-[#dfcfc1] bg-white px-6 py-16 text-center">
            <div className="text-5xl">✉️</div>
            <h2 className="mt-4 text-xl font-semibold">No conversations yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#81756d]">{role === "customer" ? "Open a product and choose “Chat with seller” to ask a question about it." : "When customers message you about your products, your conversations will appear here."}</p>
            {role === "customer" && <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#8b4c35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#713b29]">Explore handmade products →</Link>}
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-3xl border border-[#eee3d8] bg-white shadow-sm">
            {conversations.map((conversation) => {
              const participant = conversation.otherParticipant;
              const product = conversation.productId && typeof conversation.productId === "object" ? conversation.productId : null;
              return (
                <Link key={conversation._id} href={`/messages/${conversation._id}`} className="flex items-center gap-4 border-b border-[#f0e8e0] p-5 transition last:border-b-0 hover:bg-[#fffaf5]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3e4d8] text-lg font-semibold text-[#8b4c35]">{(participant?.name || (role === "seller" ? "C" : "S")).charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{participant?.name || (role === "seller" ? "Customer" : "Seller")}</p>
                      <time className="text-xs text-[#9a8b80]">{conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleString() : ""}</time>
                    </div>
                    {product?.name && <p className="mt-0.5 text-xs font-medium text-[#a5684e]">About: {product.name}</p>}
                    <p className="mt-1 truncate text-sm text-[#81756d]">{conversation.lastMessage || "Conversation started — send a message."}</p>
                  </div>
                  {(conversation.unreadCount || 0) > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#8b4c35] px-2 text-xs font-bold text-white">{conversation.unreadCount}</span>}
                  <span className="text-xl text-[#a5684e]">›</span>
                </Link>
              );
            })}
          </div>
        )}
        <p className="mt-4 text-center text-xs text-[#9a8b80]">Inbox refreshes automatically every few seconds.</p>
      </section>
    </main>
  );
}
