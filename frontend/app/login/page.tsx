
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type LoginResponse = {
  accessToken?: string;
  access_token?: string;
  user?: {
    id?: string;
    _id?: string;
    role?: string;
    name?: string;
    email?: string;
  };
  message?: string | string[];
};

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;

        setMessage(
          errorMessage || "Invalid email or password. Please try again."
        );
        return;
      }

      const token = data.accessToken || data.access_token;

      if (!token) {
        setMessage(
          "Login response did not include an access token. Check the backend response format."
        );
        return;
      }

      // Demo integration: store the JWT in sessionStorage.
      // For production, prefer a server-managed HttpOnly cookie.
      sessionStorage.setItem("craftosa_access_token", token);

      if (data.user) {
        sessionStorage.setItem(
          "craftosa_user",
          JSON.stringify(data.user)
        );
      }

      setMessage("Login successful! Redirecting...");

      const role = data.user?.role;

      if (role === "admin") {
        router.push("/admin");
      } else if (role === "seller") {
        router.push("/seller");
      } else {
        router.push("/");
      }
    } catch {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1440px] overflow-hidden rounded-3xl bg-white shadow-xl sm:min-h-[calc(100vh-40px)] lg:grid-cols-2 lg:rounded-[32px]">
        <section className="relative hidden min-h-[650px] overflow-hidden bg-[#713f2d] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-65"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1400&q=85')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#271810]/45 via-[#57311f]/25 to-[#271810]/90" />

          <div className="relative z-10">
            <a href="/" className="inline-flex items-center gap-3 text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9b58e] text-xl font-bold text-[#633b29]">
                C
              </span>
              <span className="text-2xl font-semibold tracking-tight">
                craftosa<span className="text-[#e9b58e]">.</span>
              </span>
            </a>
          </div>

          <div className="relative z-10 max-w-lg pb-5">
            <span className="mb-5 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium tracking-widest text-white backdrop-blur-md">
              MADE BY HAND. MADE WITH HEART.
            </span>

            <h1 className="text-5xl font-semibold leading-[1.13] tracking-tight text-white xl:text-6xl">
              Find something
              <br />
              <span className="font-serif italic text-[#efc49f]">
                wonderfully
              </span>
              <br />
              different.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/80">
              Discover beautiful handmade creations and the talented artisans
              who bring them to life.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#8b6049] bg-[#e6bda1] text-sm">
                  A
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#8b6049] bg-[#d6d7b8] text-sm">
                  K
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#8b6049] bg-[#f0d3bd] text-sm">
                  M
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  A community of creators
                </p>
                <p className="mt-1 text-xs text-white/65">
                  Every piece has a story.
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-white/60">
            © 2026 Craftosa. Crafted with care.
          </p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            <a
              href="/"
              className="mb-12 inline-flex items-center gap-3 lg:hidden"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8b4c35] text-lg font-bold text-white">
                C
              </span>
              <span className="text-2xl font-semibold tracking-tight text-[#34251e]">
                craftosa<span className="text-[#b86c4d]">.</span>
              </span>
            </a>

            <div className="mb-9">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#a5684e]">
                Welcome back
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#30241e] sm:text-4xl">
                Sign in to Craftosa
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#81756d]">
                Your next favourite handmade piece is waiting for you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#40332c]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#e8e0d8] bg-[#fdfcf9] px-4 py-3.5 text-sm text-[#30241e] outline-none transition placeholder:text-[#b3a79d] focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#40332c]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setMessage("Password recovery will be added later.")
                    }
                    className="text-xs font-semibold text-[#a65e43] transition hover:text-[#75402e]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#e8e0d8] bg-[#fdfcf9] px-4 py-3.5 pr-20 text-sm text-[#30241e] outline-none transition placeholder:text-[#b3a79d] focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 text-xs font-semibold text-[#8c7b70] hover:text-[#a65e43]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 accent-[#8b4c35]"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-[#81756d]"
                >
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b4c35] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#8b4c35]/15 transition hover:-translate-y-0.5 hover:bg-[#713c29] hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <span aria-hidden="true">→</span>}
              </button>

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-[#ead7c9] bg-[#faf1e9] p-3 text-sm leading-6 text-[#75402e]"
                >
                  {message}
                </p>
              )}
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#eee7e0]" />
              <span className="text-xs text-[#a69a90]">NEW TO CRAFTOSA?</span>
              <div className="h-px flex-1 bg-[#eee7e0]" />
            </div>

            <a
              href="/register"
              className="flex w-full items-center justify-center rounded-xl border border-[#ded2c8] px-5 py-3.5 text-sm font-semibold text-[#554137] transition hover:border-[#a65e43] hover:bg-[#fbf6f0]"
            >
              Create an account
            </a>

            <p className="mt-8 text-center text-xs leading-5 text-[#a69a90]">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-4">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
