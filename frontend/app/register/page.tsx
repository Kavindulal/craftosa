
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import CraftosaLogo from "../../components/craftosa-logo";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type RegisterResponse = {
  message?: string | string[];
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
};

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"customer" | "seller">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    if (password.length < 8) {
      setIsError(true);
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;

        throw new Error(
          errorMessage || "Registration failed. Please try again."
        );
      }

      setMessage("Account created successfully! Redirecting to login...");

      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#e8e0d8] bg-[#fdfcf9] px-4 py-3.5 text-sm text-[#30241e] outline-none transition placeholder:text-[#b3a79d] focus:border-[#a65e43] focus:ring-4 focus:ring-[#a65e43]/10";

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#713f2d] p-12 text-white lg:flex xl:p-16">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage:
                "url('/craftosa-hero.png')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#271810]/50 via-[#57311f]/40 to-[#271810]/90" />

          <CraftosaLogo href="/" light tagline className="relative z-10" />

          <div className="relative z-10 max-w-lg">
            <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs tracking-widest">
              MADE BY HAND. MADE WITH HEART.
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-tight xl:text-6xl">
              Your journey into the world of{" "}
              <span className="font-serif italic text-[#efc49f]">
                handmade
              </span>{" "}
              begins here.
            </h1>
            <p className="mt-6 leading-7 text-white/80">
              Discover unique creations, support local artisans, or share your
              own handmade products with the world.
            </p>
          </div>

          <p className="relative z-10 text-xs text-white/60">
            © 2026 Craftosa. Crafted with care.
          </p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">
            <CraftosaLogo href="/" tagline className="mb-8 lg:hidden" />

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#a5684e]">
                Join our community
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#30241e] sm:text-4xl">
                Create your account
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#81756d]">
                Join Craftosa to discover and share handmade treasures.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <fieldset>
                <legend className="mb-3 text-sm font-medium text-[#40332c]">
                  How would you like to use Craftosa?
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    aria-pressed={role === "customer"}
                    onClick={() => setRole("customer")}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === "customer"
                        ? "border-[#a65e43] bg-[#faf1e9] ring-2 ring-[#a65e43]/15"
                        : "border-[#e8e0d8] bg-white hover:border-[#c9a08b]"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      🛍️
                    </span>
                    <span className="mt-2 block text-sm font-semibold text-[#40332c]">
                      Customer
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#81756d]">
                      Shop handmade products
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={role === "seller"}
                    onClick={() => setRole("seller")}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === "seller"
                        ? "border-[#a65e43] bg-[#faf1e9] ring-2 ring-[#a65e43]/15"
                        : "border-[#e8e0d8] bg-white hover:border-[#c9a08b]"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      🏪
                    </span>
                    <span className="mt-2 block text-sm font-semibold text-[#40332c]">
                      Seller
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#81756d]">
                      Sell your creations
                    </span>
                  </button>
                </div>

                {role === "seller" && (
                  <p className="mt-3 rounded-lg bg-[#faf1e9] p-3 text-xs leading-5 text-[#75402e]">
                    Your account will be registered with the seller role.
                    Seller application approval may need to be completed
                    separately.
                  </p>
                )}
              </fieldset>

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-[#40332c]"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className={inputClass}
                />
              </div>

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
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[#40332c]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className={`${inputClass} pr-20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-4 text-xs font-semibold text-[#8c7b70] hover:text-[#a65e43]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-[#40332c]"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  className={inputClass}
                />
              </div>

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`rounded-xl border p-3 text-sm leading-6 ${
                    isError
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-green-200 bg-green-50 text-green-800"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b4c35] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#8b4c35]/15 transition hover:-translate-y-0.5 hover:bg-[#713c29] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Creating account..."
                  : `Create ${role === "customer" ? "customer" : "seller"} account`}
                {!loading && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#81756d]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#a65e43] hover:text-[#75402e]"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-6 text-center text-xs text-[#a69a90]">
              By creating an account, you agree to our terms and privacy policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
