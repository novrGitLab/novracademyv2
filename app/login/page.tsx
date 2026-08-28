"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3c-1.08.72-2.46 1.15-4.08 1.15-3.13 0-5.79-2.11-6.74-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.26 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.27a12 12 0 0 0 0 10.78l3.99-3.11Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l3.99 3.11C6.21 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="grid h-screen grid-cols-1 overflow-hidden bg-white lg:grid-cols-[40%_60%]">
      {/* Left — brand panel with image */}
      <aside className="relative hidden h-screen overflow-hidden bg-[#F4ECF8] lg:flex">
        <img
          src="/signin/signup.jpeg"
          alt="Novr Academy security training"
          className="h-full w-full object-cover"
        />
      </aside>

      {/* Right — form */}
      <section className="flex h-screen items-center justify-center overflow-y-auto bg-white px-6 py-10 sm:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <img
              src="/novracademy-logo.png"
              alt="Novr Academy"
              className="h-16 w-auto object-contain"
            />
          </div>

          <div className="mb-10 text-center">
            <img
              src="/novracademy-logo.png"
              alt="Novr Academy"
              className="mx-auto mb-8 h-16 w-auto object-contain"
            />
            <h1 className="font-serif text-[34px] leading-[51px] text-auth-ink">
              Welcome back
            </h1>
            <p className="text-[15px] leading-[22.5px] text-auth-secondary">
              Sign in to your security portal.
            </p>
          </div>

          {searchParams.get("success") === "1" && (
            <div className="mb-5 rounded-auth bg-green-50 px-3 py-2 text-[13px] text-green-700">
              Account created successfully! Please sign in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-base text-auth-ink">
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="mt-2 h-12 w-full rounded-auth border border-auth-border bg-white px-4 text-base text-auth-ink outline-none transition placeholder:text-auth-placeholder focus:border-auth-primary focus:ring-2 focus:ring-auth-primary/10"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-base text-auth-ink"
              >
                PASSWORD
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-auth border border-auth-border bg-white py-[13.5px] pl-4 pr-12 text-base text-auth-ink outline-none transition placeholder:text-auth-placeholder focus:border-auth-primary focus:ring-2 focus:ring-auth-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-auth-muted transition hover:text-auth-ink"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-auth bg-red-50 px-3 py-2 text-[13px] text-auth-red">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-auth bg-auth-primary px-4 text-base text-white transition hover:bg-auth-primary/90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-0">
            <div className="h-px flex-1 bg-auth-border" />
            <span className="px-4 text-sm text-auth-muted">Or</span>
            <div className="h-px flex-1 bg-auth-border" />
          </div>

          <div className="space-y-3">
            <button
              onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-auth border border-auth-border bg-white px-4 text-base text-auth-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-auth-tint"
            >
              <MicrosoftIcon />
              Continue with Microsoft 365
            </button>
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-auth border border-auth-border bg-white px-4 text-base text-auth-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-auth-tint"
            >
              <GoogleIcon />
              Continue with Google Workspace
            </button>
          </div>

          <p className="mt-10 text-center text-base text-auth-tertiary">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-auth-red hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-3 text-center text-[13px] text-auth-secondary">
            Have a claim link instead?{" "}
            <Link
              href="/"
              className="font-medium text-auth-primary hover:underline"
            >
              Go to homepage
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
