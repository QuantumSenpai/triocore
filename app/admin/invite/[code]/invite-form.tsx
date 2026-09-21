"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { validatePassword } from "@/lib/password-rules";

export function InviteForm({ email, token, role }: { email: string; token: string; role: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      toast.error(pwCheck.error || "Password does not meet complexity requirements.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invite");
      }

      toast.success("Account created! Redirecting to login...");
      setTimeout(() => {
        router.push("/admin/login");
      }, 1200);
    } catch (err) {
      toast.error((err as Error).message || "Could not accept invite.");
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
          <UserPlus className="h-4 w-4" />
          <span>Team Invitation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#14141A]">
          Join TrioCore OS
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#2B2B38]">
          You have been invited to join as <span className="font-bold text-[#374BFF]">{role}</span> with email <span className="font-bold">{email}</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-black/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14141A]">
                Your Name <span className="text-[#374BFF]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="mt-1 block w-full px-3 py-2.5 sm:text-sm border border-black/15 rounded-xl bg-[#F5F6FC] text-[#14141A] focus:border-[#374BFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14141A]">
                Set Password <span className="text-[#374BFF]">*</span>
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  className="block w-full pl-4 pr-10 py-2.5 sm:text-sm border border-black/15 rounded-xl bg-[#F5F6FC] text-[#14141A] focus:border-[#374BFF] focus:outline-none"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#374BFF] hover:bg-[#14141A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] transition-all cursor-pointer"
            >
              {loading ? "Activating Account..." : "Accept Invitation & Join"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
