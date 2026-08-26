"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { createUserAccount } from "./actions";

const fieldClassName =
  "h-[42px] w-full rounded-none border border-[#C6C5D3] bg-white px-3 text-[14px] text-[#1A1A2E] outline-none transition placeholder:text-[#767782] focus:border-[#4451A2] focus:ring-2 focus:ring-[#4451A2]/10";

function BrandMark({ mobile = false }: { mobile?: boolean }) {
  return (
    <img
      src="/novracademy-logo.png"
      alt="Novr Academy"
      className={mobile ? "h-16 w-auto object-contain" : "h-24 w-auto object-contain"}
    />
  );
}

function PasswordField({
  id,
  value,
  onChange,
  visible,
  onToggle,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required
        minLength={id === "password" ? 8 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="••••••••"
        className={`${fieldClassName} pr-12`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-0 top-0 flex h-[42px] w-11 items-center justify-center text-[#767782] transition hover:text-[#1A1A2E]"
      >
        {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationCode, setOrganizationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!termsAccepted) return "Please agree to the Terms of Service and Privacy Policy.";
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (signInResult?.error) {
        router.push("/login?success=1");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid h-screen grid-cols-1 overflow-hidden bg-gradient-to-br from-white to-[#FCF8FF] lg:grid-cols-[40%_60%]">
      {/* Left — brand panel with image */}
      <aside className="relative hidden h-screen overflow-hidden bg-[#F4ECF8] lg:flex">
        <img
          src="/IMG_20251030_114400.jpg"
          alt="Novr Academy security training"
          className="h-full w-full object-cover"
        />
      </aside>

      {/* Right — form */}
      <section className="flex h-screen items-center justify-center overflow-y-auto bg-white px-6 py-12 sm:px-10 lg:px-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark mobile />
          </div>

          <div className="mb-8 hidden justify-center lg:flex">
            <BrandMark />
          </div>

          <h1 className="font-serif text-[32px] font-bold leading-[40px] text-[#1A1A2E]">
            Join your security program
          </h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]"
              >
                FULL NAME
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Doe"
                className={`${fieldClassName} mt-2`}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]"
              >
                WORK EMAIL
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={`${fieldClassName} mt-2`}
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label
                  htmlFor="organizationCode"
                  className="text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]"
                >
                  ORGANIZATION CODE
                </label>
                <span className="text-right text-[12px] font-medium text-[#767782]">
                  Provided by your administrator
                </span>
              </div>
              <input
                id="organizationCode"
                type="text"
                value={organizationCode}
                onChange={(event) => setOrganizationCode(event.target.value)}
                placeholder="e.g. NOVR-2024"
                className={`${fieldClassName} mt-2`}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]"
              >
                PASSWORD
              </label>
              <div className="mt-2">
                <PasswordField
                  id="password"
                  value={password}
                  onChange={setPassword}
                  visible={showPassword}
                  onToggle={() => setShowPassword((visible) => !visible)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]"
              >
                CONFIRM PASSWORD
              </label>
              <div className="mt-2">
                <PasswordField
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((visible) => !visible)}
                />
              </div>
            </div>

            <div className="pt-0">
              <label className="flex items-start gap-3 text-[12px] font-medium leading-5 text-[#767782]">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded-[2px] border border-[#C6C5D3] accent-[#4451A2]"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-[#4451A2] hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-[#4451A2] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {error && (
              <p className="bg-red-50 px-3 py-2 text-[13px] text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-[42px] w-full rounded-none bg-[#4451A2] px-4 text-[12px] font-bold tracking-[0.6px] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-[#39458f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
            </button>
          </form>

          <footer className="mt-8 border-t border-[#C6C5D3] pt-4 text-center text-[14px] text-[#454651]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#4451A2] hover:underline"
            >
              Sign in
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
