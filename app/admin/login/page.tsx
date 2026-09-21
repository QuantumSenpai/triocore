"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { Lock, Mail, ArrowLeft, ShieldCheck, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [unauthorizedError, setUnauthorizedError] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setUnauthorizedError(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Invalid credentials");
        toast.error(res.error.message || "Invalid credentials");
      } else {
        toast.success("Welcome back! Redirecting to TrioCore OS...");
        const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
        router.push(callbackUrl);
      }
    } catch {
      setErrorMessage("Authentication failed. Please check your credentials.");
      toast.error("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl glass-card border border-[#14141A] p-8 sm:p-10 shadow-2xl bg-white">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#374BFF] text-xs font-bold text-white mb-4 shadow-sm shadow-[#374BFF]/20">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
            <span>TrioCore OS Portal</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#14141A] tracking-tight">
            Sign In to OS
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#14141A] font-sans font-medium">
            Administrative access for authorized engineers only.
          </p>
        </div>

        {unauthorizedError && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-600 text-xs flex items-start gap-2.5 leading-relaxed font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              This email is not authorized for admin access. Contact TrioCore founders if you believe this is a mistake.
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-800 text-xs flex items-start gap-2.5 leading-relaxed font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#14141A]">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="itxkisu@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#14141A] bg-[#F5F6FC] pl-10 pr-4 py-3 text-sm text-[#14141A] placeholder-[#2B2B38]/40 focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all font-medium"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#14141A]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#14141A]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#14141A] bg-[#F5F6FC] pl-10 pr-11 py-3 text-sm text-[#14141A] placeholder-[#2B2B38]/40 focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all font-medium"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#14141A]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-0.5 text-[#14141A] hover:text-[#374BFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="interactive-lift w-full rounded-xl bg-[#374BFF] py-3 text-sm font-black text-white shadow-md shadow-[#374BFF] hover:bg-[#14141A] transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In with Password</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#14141A] text-center">
          <p className="text-xs text-[#14141A] font-medium">
            TrioCore OS • Security protected by DB-backed lockout
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#F5F6FC] text-[#14141A]">
      <header className="flex items-center justify-between mx-auto w-full max-w-5xl py-2">
        <Logo size="sm" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14141A] hover:text-[#374BFF] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Site</span>
        </Link>
      </header>

      <main className="flex items-center justify-center my-auto py-8">
        <Suspense fallback={<div className="text-xs font-bold text-[#14141A]">Loading portal...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <footer className="text-center py-4 text-xs text-[#14141A] font-bold">
        © 2026 TrioCore Agency OS • Authorized Access Only
      </footer>
    </div>
  );
}
