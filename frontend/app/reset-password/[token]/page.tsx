"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Sparkles } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function ResetPasswordForm() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message || "This reset link is invalid or expired.");
      setMessage(data.message || "Your password has been changed. You can now sign in.");
      window.setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to Craftosa. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7eee4] px-4 py-10">
      <div className="w-full max-w-lg rounded-[28px] border border-[#eaded2] bg-[#fffdf9] p-6 shadow-xl sm:p-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b4c35] hover:text-[#713b29]"><ArrowLeft size={17} /> Back to sign in</Link>
        <div className="mt-9 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5dfcd] text-[#8b4c35]"><KeyRound size={24} /></div>
        <p className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#a65335]"><Sparkles size={15} /> Account security</p>
        <h1 className="mt-2 font-serif text-4xl text-[#39271d]">Choose a new password</h1>
        <p className="mt-3 text-sm leading-6 text-[#817064]">Choose a strong password you haven’t used for this account before. Reset links expire after 30 minutes and can only be used once.</p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#40332c]">New password</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="w-full rounded-xl border border-[#e8dcd0] bg-white px-4 py-3.5 pr-12 text-sm outline-none focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10" />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center px-2 text-[#8c7b70]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[#40332c]">Confirm new password</label>
            <input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter the password again" className="w-full rounded-xl border border-[#e8dcd0] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10" />
          </div>
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9b4e32] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#7f3f2a] disabled:opacity-70">{loading ? "Updating password…" : <>Update password <ArrowRight size={17} /></>}</button>
        </form>
        {message && <div role="status" className="mt-5 flex gap-3 rounded-xl border border-[#d8e4d1] bg-[#f2f7ed] p-4 text-sm leading-6 text-[#42623c]"><CheckCircle2 className="mt-0.5 shrink-0" size={19} /><p>{message}</p></div>}
        {error && <p role="alert" className="mt-5 rounded-xl border border-[#ead7c9] bg-[#faf1e9] p-4 text-sm leading-6 text-[#75402e]">{error}</p>}
      </div>
    </main>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#f7eee4] px-4 py-10"><p className="text-sm text-[#817064]">Loading password reset page…</p></main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
