"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
type Message = { _id: string; body: string; senderRole: string; createdAt?: string; readAt?: string | null };
type ConversationData = { conversationId: string; messages: Message[] };

export default function ChatConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;
  const router = useRouter();
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async (quiet = false) => {
    const token = sessionStorage.getItem("craftosa_access_token");
    const rawUser = sessionStorage.getItem("craftosa_user");
    if (!token || !rawUser) { router.replace("/login"); return; }
    try {
      const user = JSON.parse(rawUser) as { role?: string };
      if (user.role !== "customer" && user.role !== "seller") { setError("Messaging is available for customer and seller accounts."); setLoading(false); return; }
      setRole(user.role);
      const response = await fetch(`${API_URL}/chat/conversations/${encodeURIComponent(conversationId)}/messages`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data: ConversationData | { message?: string } = await response.json().catch(() => ({ message: "Unable to read server response." }));
      if (response.status === 401 || response.status === 403) { router.replace("/login"); return; }
      if (!response.ok) throw new Error("message" in data ? data.message || "Could not load this conversation." : "Could not load this conversation.");
      setMessages(Array.isArray((data as ConversationData).messages) ? (data as ConversationData).messages : []);
      setError("");
    } catch (err) {
      if (!quiet) setError(err instanceof Error ? err.message : "Could not load messages.");
    } finally { setLoading(false); }
  }, [conversationId, router]);

  useEffect(() => {
    void loadMessages();
    const timer = window.setInterval(() => { void loadMessages(true); }, 3000);
    return () => window.clearInterval(timer);
  }, [loadMessages]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    const token = sessionStorage.getItem("craftosa_access_token");
    if (!token) { router.replace("/login"); return; }
    setSending(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Message could not be sent.");
      setDraft("");
      await loadMessages(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message could not be sent.");
    } finally { setSending(false); }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f8f5ef] text-[#35271f]">
      <header className="border-b border-[#eee3d8] bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-5 py-4">
          <Link href="/messages" aria-label="Back to messages" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8dcd1] text-xl hover:bg-[#faf4ee]">←</Link>
          <div className="min-w-0 flex-1"><p className="font-semibold">Craftosa Messages</p><p className="text-xs text-[#81756d]">Private customer–seller conversation</p></div>
          <span className="flex items-center gap-2 text-xs font-medium text-green-700"><span className="h-2 w-2 rounded-full bg-green-600" />Auto-refreshing</span>
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 sm:px-6">
        <div className="mb-4 rounded-2xl border border-[#eee3d8] bg-white p-4">
          <p className="text-sm font-semibold">Keep your conversation helpful and respectful.</p>
          <p className="mt-1 text-xs leading-5 text-[#81756d]">Never share passwords or payment card details in chat.</p>
        </div>
        {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div className="flex min-h-[360px] flex-1 flex-col gap-3 rounded-3xl border border-[#eee3d8] bg-white p-4 sm:p-6">
          {loading ? <p className="py-16 text-center text-sm text-[#81756d]">Loading messages…</p> : messages.length === 0 ? (
            <div className="m-auto max-w-sm py-14 text-center"><div className="text-4xl">👋</div><p className="mt-3 font-semibold">Start the conversation</p><p className="mt-1 text-sm text-[#81756d]">Send a message to discuss product details, customisation or availability.</p></div>
          ) : messages.map((message) => {
            const own = message.senderRole === role;
            return <div key={message._id} className={`flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[72%] ${own ? "rounded-br-md bg-[#8b4c35] text-white" : "rounded-bl-md bg-[#f5eee7] text-[#35271f]"}`}><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p><div className={`mt-1 text-right text-[10px] ${own ? "text-white/70" : "text-[#958579]"}`}>{message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}{own && message.readAt ? " · Read" : ""}</div></div></div>;
          })}
        </div>
        <form onSubmit={sendMessage} className="mt-4 rounded-2xl border border-[#eee3d8] bg-white p-3 shadow-sm">
          <label htmlFor="message" className="sr-only">Write a message</label>
          <div className="flex items-end gap-3">
            <textarea id="message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={2} placeholder="Write your message…" className="max-h-36 min-h-14 flex-1 resize-y rounded-xl bg-[#faf7f2] px-4 py-3 text-sm outline-none ring-[#cda58d] focus:ring-2" />
            <button type="submit" disabled={!draft.trim() || sending} className="rounded-xl bg-[#8b4c35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#713b29] disabled:cursor-not-allowed disabled:opacity-50">{sending ? "Sending…" : "Send ↗"}</button>
          </div>
          <p className="mt-2 px-1 text-right text-[11px] text-[#9a8b80]">{draft.length}/2000 characters</p>
        </form>
      </section>
    </main>
  );
}
