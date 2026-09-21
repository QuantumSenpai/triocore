"use client";

import { useState } from "react";
import { Eye, EyeOff, ShieldAlert, KeyRound, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { validatePassword } from "@/lib/password-rules";
import { useRouter } from "next/navigation";

export function RecoverForm() {
  const router = useRouter();
  const [setupKey, setSetupKey] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!setupKey.trim()) {
      toast.error("ADMIN_SETUP_KEY is required.");
      return;
    }
    if (!email.trim()) {
      toast.error("Owner email is required.");
      return;
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      toast.error(pwCheck.error || "Password does not meet complexity requirements.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupKey: setupKey.trim(),
          email: email.trim().toLowerCase(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Recovery failed.");
      }

      toast.success("Password successfully reset! Redirecting to login...");
      setTimeout(() => {
        router.push("/admin/login");
      }, 1200);
    } catch (err) {
      toast.error((err as Error).message || "Recovery failed.");
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldAlert className="h-4 w-4" />
          <span>Emergency Account Recovery</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#14141A]">
          Reset Owner Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-black/10">
          <form onSubmit={handleRecover} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14141A]">
                Setup Key <span className="text-[#374BFF]">*</span>
              </label>
              <input
                type="password"
                required
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                placeholder="Enter ADMIN_SETUP_KEY"
                className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-black/15 rounded-xl bg-[#F5F6FC] text-[#14141A] focus:border-[#374BFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14141A]">
                Owner Email <span className="text-[#374BFF]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@triocore.in"
                className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-black/15 rounded-xl bg-[#F5F6FC] text-[#14141A] focus:border-[#374BFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14141A]">
                New Password <span className="text-[#374BFF]">*</span>
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 12 characters (no 'triocore' or 'admin')"
                  className="block w-full pl-4 pr-10 py-2.5 sm:text-sm border border-black/15 rounded-xl bg-[#F5F6FC] text-[#14141A] focus:border-[#374BFF] focus:outline-none"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#374BFF] hover:bg-[#14141A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] transition-all cursor-pointer"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
