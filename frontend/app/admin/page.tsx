"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Application = {
  _id: string;
  shopName: string;
  bio: string;
  craftTypes: string[];
  city: string;
  status: string;
  createdAt?: string;
  user?: { name?: string; email?: string };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    const token = sessionStorage.getItem("craftosa_access_token");
    const userRaw = sessionStorage.getItem("craftosa_user");
    if (!token || !userRaw) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userRaw) as { role?: string };
      if (user.role !== "admin") {
        router.replace("/");
        return;
      }

      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/sellers?status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Could not load seller applications.",
        );
      }
      setApplications(Array.isArray(data) ? data : data.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load seller applications.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function reviewApplication(applicationId: string, status: "approved" | "rejected") {
    const token = sessionStorage.getItem("craftosa_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setBusyId(applicationId);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${API_URL}/sellers/${applicationId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.message === "string" ? data.message : "Could not review this application.");
      }
      setMessage(`${data.seller?.shopName || "Seller application"} ${status} successfully.`);
      setApplications((current) => current.filter((application) => application._id !== applicationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not review this application.");
    } finally {
      setBusyId("");
    }
  }

  function signOut() {
    sessionStorage.removeItem("craftosa_access_token");
    sessionStorage.removeItem("craftosa_user");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#34251e]">
      <header className="border-b border-[#eee2d7] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#8b4c35]">craftosa.</Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-500 sm:inline">Admin workspace</span>
            <button onClick={signOut} className="rounded-xl border border-[#e8dcd1] px-4 py-2 text-sm font-medium hover:bg-[#faf7f2]">Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <section className="rounded-3xl bg-[#75422f] px-7 py-9 text-white md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f1c5a3]">Craftosa administration</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Seller applications</h1>
          <p className="mt-3 max-w-2xl leading-7 text-white/75">Review artisan shop details and approve eligible sellers to make their shop profiles visible to customers.</p>
        </section>

        {message && <p role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
        {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        <div className="mt-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Pending review</h2>
            <p className="mt-1 text-sm text-stone-500">Applications waiting for an admin decision.</p>
          </div>
          <button onClick={() => void loadApplications()} className="rounded-xl border border-[#e4d3c5] bg-white px-4 py-2.5 text-sm font-semibold text-[#8b4c35] hover:bg-[#f8eee5]">Refresh</button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-[#eee2d7] bg-white p-8 text-stone-500">Loading seller applications…</div>
        ) : applications.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[#eee2d7] bg-white px-6 py-12 text-center">
            <div className="text-4xl">🌿</div>
            <h3 className="mt-4 text-lg font-semibold">No pending applications</h3>
            <p className="mt-2 text-sm text-stone-500">When a seller submits an application, it will appear here.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {applications.map((application) => (
              <article key={application._id} className="rounded-2xl border border-[#eee2d7] bg-white p-6 md:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Pending</span>
                    <h3 className="mt-3 text-xl font-semibold">{application.shopName}</h3>
                    <p className="mt-1 text-sm text-stone-500">{application.user?.name || "Seller"}{application.user?.email ? ` · ${application.user.email}` : ""}</p>
                  </div>
                  <p className="text-sm text-stone-500">{application.city}</p>
                </div>
                <p className="mt-5 whitespace-pre-line leading-7 text-stone-600">{application.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(application.craftTypes || []).map((craft) => <span key={craft} className="rounded-full bg-[#f8eee5] px-3 py-1.5 text-xs font-medium text-[#8b4c35]">{craft}</span>)}
                </div>
                <div className="mt-7 flex flex-wrap gap-3 border-t border-stone-100 pt-5">
                  <button disabled={busyId === application._id} onClick={() => void reviewApplication(application._id, "approved")} className="rounded-xl bg-[#8b4c35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#713b29] disabled:opacity-50">{busyId === application._id ? "Saving…" : "Approve seller"}</button>
                  <button disabled={busyId === application._id} onClick={() => void reviewApplication(application._id, "rejected")} className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50">Reject</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
