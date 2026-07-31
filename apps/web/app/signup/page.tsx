"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { BookOpen, Lock, Mail, Sparkles, User, Users2 } from "lucide-react";
import { createUserAccount } from "./actions";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
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
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await createUserAccount({ name: fullName, email, password });
      if (!result.success) {
        setError(result.error || "Something went wrong. Please try again.");
        return;
      }
      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        // Account created but sign-in failed — redirect to login
        router.push("/login?success=1");
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClasses =
    "w-full rounded-card border border-border bg-surface py-2 pl-9 pr-3 text-[15px] text-text-primary outline-none transition focus:border-blue focus:bg-background focus:ring-2 focus:ring-blue/10";

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left — branding */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-brand p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <Sparkles className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <span className="text-[19px] font-bold tracking-tight">Novr Academy</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-[38px] font-semibold leading-tight tracking-tight">
            Start your learning journey.
          </h1>
          <p className="mt-4 text-[16px] text-white/85">
            Create your account to access courses, connect with mentors, and earn certificates.
          </p>

          <div className="mt-10 space-y-4">
            <Feature icon={BookOpen} text="Structured courses with certificates that verify instantly" />
            <Feature icon={Users2} text="A real community — mentors, events, and a job board" />
          </div>
        </div>

        <p className="relative text-[13px] text-white/60">© {new Date().getFullYear()} Novr Academy</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white">
              <Sparkles className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-text-primary">Novr Academy</span>
          </div>

          <h1 className="text-[24px] font-semibold text-text-primary">Create your account</h1>
          <p className="mt-1 text-[15px] text-text-secondary">Join Novr Academy today.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="fullName" className="text-[13px] font-medium text-text-secondary">
                Full name
              </label>
              <div className="relative mt-1">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={2} />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-[13px] font-medium text-text-secondary">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={2} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-[13px] font-medium text-text-secondary">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={2} />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-[13px] font-medium text-text-secondary">
                Confirm password
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={2} />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-card bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-card bg-blue px-4 py-2.5 text-[15px] font-medium text-white shadow-card transition hover:bg-blue/90 hover:shadow-card-hover disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[12px] text-text-secondary">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-card border border-border bg-background px-4 py-2.5 text-[14px] font-medium text-text-primary shadow-card transition hover:bg-surface"
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-card border border-border bg-background px-4 py-2.5 text-[14px] font-medium text-text-primary shadow-card transition hover:bg-surface"
            >
              <MicrosoftIcon />
              Continue with Microsoft
            </button>
          </div>

          <p className="mt-8 text-center text-[13px] text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, text }: { icon: typeof BookOpen; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      </div>
      <p className="text-[14px] text-white/85">{text}</p>
    </div>
  );
}
