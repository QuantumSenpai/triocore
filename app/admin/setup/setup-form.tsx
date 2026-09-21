"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, KeyRound, User, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";

export function SetupForm() {
  const router = useRouter();
  const [setupKey, setSetupKey] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!setupKey.trim()) {
      toast.error("ADMIN_SETUP_KEY is required.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupKey: setupKey.trim(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Setup failed");
      }

      toast.success("Owner account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/admin/login");
      }, 1200);
    } catch (err) {
      toast.error((err as Error).message || "Setup failed. Please check setup key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FC] text-[#14141A] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-4">
          <Logo size="md" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#374BFF]/10 text-[#374BFF] text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>TrioCore OS • First-Time Setup</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#14141A]">
          Create Studio Owner Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#2B2B38]">
          This one-time setup provisions the primary administrative owner account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-black/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14141A]">
                Admin Setup Key <span className="text-[#374BFF]">*</span>
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B2B38]">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  placeholder="Enter ADMIN_SETUP_KEY"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-black/15 rounded-xl bg-[#F5F6FC] text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14141A]">
                Full Name <span className="text-[#374BFF]">*</span>
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B2B38]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Krishnendu Roy"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-black/15 rounded-xl bg-[#F5F6FC] text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14141A]">
                Email Address <span className="text-[#374BFF]">*</span>
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B2B38]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@triocore.in"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-black/15 rounded-xl bg-[#F5F6FC] text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14141A]">
                Password <span className="text-[#374BFF]">*</span>
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="block w-full pl-4 pr-10 py-2.5 sm:text-sm border border-black/15 rounded-xl bg-[#F5F6FC] text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#2B2B38] hover:text-[#14141A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] rounded-lg cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14141A]">
                Confirm Password <span className="text-[#374BFF]">*</span>
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="block w-full pl-4 pr-10 py-2.5 sm:text-sm border border-black/15 rounded-xl bg-[#F5F6FC] text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#2B2B38] hover:text-[#14141A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] rounded-lg cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#374BFF] hover:bg-[#14141A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating Owner Account...
                  </span>
                ) : (
                  <>
                    <span>Initialize TrioCore OS</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
