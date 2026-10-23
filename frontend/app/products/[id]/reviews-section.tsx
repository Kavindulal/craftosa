"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
type Review = { _id: string; rating: number; comment: string; customerName?: string; createdAt?: string };
type ReviewData = { reviews: Review[]; summary: { averageRating: number; reviewCount: number; ratingCounts: { rating: number; count: number }[] } };
const stars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

export default function ReviewsSection({ productId }: { productId: string }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/products/public/${encodeURIComponent(productId)}/reviews`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not load reviews.");
      setData(result as ReviewData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load reviews.");
    } finally { setLoading(false); }
  }, [productId]);

  useEffect(() => {
    void load();
    const token = sessionStorage.getItem("craftosa_access_token");
    const raw = sessionStorage.getItem("craftosa_user");
    setSignedIn(Boolean(token));
    if (token && raw) {
      try { setCanReview((JSON.parse(raw) as { role?: string }).role === "customer"); } catch { setCanReview(false); }
    }
  }, [load]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const token = sessionStorage.getItem("craftosa_access_token");
    if (!token) { setError("Please sign in as a customer to submit a review."); return; }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/products/public/${encodeURIComponent(productId)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(" ") : result.message || "Could not submit review.");
      setComment("");
      setRating(5);
      setMessage("Thank you! Your verified-purchase review has been published.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit review.");
    } finally { setSubmitting(false); }
  };

  const summary = data?.summary;
  return <section className="mt-12 rounded-3xl border border-stone-200 bg-white px-5 py-7 sm:px-8 md:px-10 md:py-10">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#a45b43]">Customer feedback</p><h2 className="mt-2 text-2xl font-semibold">Product Reviews & Ratings</h2><p className="mt-2 text-sm text-stone-500">Reviews are accepted only from customers with a delivered order for this product.</p></div>
      <div className="rounded-2xl bg-[#faf3ec] px-5 py-3 text-center"><p className="text-2xl font-semibold text-[#8b4c35]">{summary && summary.reviewCount ? summary.averageRating.toFixed(1) : "—"} <span className="text-lg text-amber-500">★</span></p><p className="mt-1 text-xs text-stone-500">{summary?.reviewCount || 0} review{summary?.reviewCount === 1 ? "" : "s"}</p></div>
    </div>
    {summary && summary.reviewCount > 0 && <div className="mt-6 max-w-lg space-y-2">{summary.ratingCounts.slice().reverse().map(row => <div key={row.rating} className="flex items-center gap-3 text-xs text-stone-500"><span className="w-12">{row.rating} star</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(row.count / summary.reviewCount) * 100}%` }} /></div><span className="w-6 text-right">{row.count}</span></div>)}</div>}
    {canReview && <form onSubmit={submit} className="mt-7 rounded-2xl border border-[#eee2d7] bg-[#fffdf9] p-5 sm:p-6"><h3 className="font-semibold">Write a review</h3><p className="mt-1 text-sm text-stone-500">Your order must be delivered before you can review this product.</p><label className="mt-5 block text-sm font-medium" htmlFor="review-rating">Your rating</label><div className="mt-2 flex gap-1" role="radiogroup" aria-label="Your rating">{[1,2,3,4,5].map(value => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star${value > 1 ? "s" : ""}`} aria-pressed={rating === value} className={`text-3xl transition hover:scale-110 ${value <= rating ? "text-amber-400" : "text-stone-300"}`}>★</button>)}</div><label htmlFor="review-comment" className="mt-4 block text-sm font-medium">Your review</label><textarea id="review-comment" value={comment} onChange={event => setComment(event.target.value)} required minLength={3} maxLength={1000} rows={4} placeholder="Share what you liked about this handmade product…" className="mt-2 w-full rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-[#a45b43]" /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-stone-400">{comment.length}/1000 characters</span><button type="submit" disabled={submitting || comment.trim().length < 3} className="rounded-full bg-[#a45b43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#87452f] disabled:opacity-50">{submitting ? "Submitting…" : "Submit review"}</button></div></form>}
    {!canReview && !signedIn && <p className="mt-6 rounded-xl bg-[#faf7f2] p-4 text-sm text-stone-600">Sign in as a customer and complete a delivery to leave a verified review.</p>}
    {message && <p role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">{message}</p>}
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="mt-7 border-t border-stone-100 pt-6"><h3 className="font-semibold">What customers say</h3>{loading ? <p className="mt-4 text-sm text-stone-500">Loading reviews…</p> : data?.reviews.length ? <div className="mt-4 divide-y divide-stone-100">{data.reviews.map(review => <article key={review._id} className="py-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">{review.customerName || "Verified customer"} <span className="ml-2 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700">Verified purchase</span></p><span className="text-xs text-stone-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</span></div><p className="mt-2 text-lg tracking-wider text-amber-400" aria-label={`${review.rating} out of 5 stars`}>{stars(review.rating)}</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-stone-600">{review.comment}</p></article>)}</div> : <p className="mt-4 rounded-xl bg-[#faf7f2] p-5 text-sm text-stone-500">No reviews yet. Delivered customers can be the first to share their experience.</p>}</div>
  </section>;
}
