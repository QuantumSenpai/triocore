"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, Clock, ArrowRight, ShieldCheck, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface WaitlistModalProps {
  serviceName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistModal({ serviceName, isOpen, onClose }: WaitlistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please provide both your name and email.");
      return;
    }

    setSubmitting(true);
    try {
      const waitlistMessage = `[Waitlist Early Access: ${serviceName || "Upcoming Service"}]\nName: ${name.trim()}\nEmail: ${email.trim()}\nNotes: ${notes.trim() || "No additional notes provided."}`;

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "waitlist",
          message: waitlistMessage,
          email: email.trim(),
          consent: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join waitlist");
      }

      setSubmitted(true);
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
      toast.success("You're on the early-access waitlist!");
    } catch (err) {
      toast.error((err as Error).message || "Could not join waitlist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setName("");
    setEmail("");
    setNotes("");
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-black/10 text-[#14141A]">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-xl border border-black/10 flex items-center justify-center text-[#14141A] hover:bg-[#374BFF]/5 hover:text-[#374BFF] hover:border-[#374BFF] transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                Priority Early Access
              </span>
              <h3 className="font-heading text-xl font-bold text-[#14141A] mt-1">
                You're on the Waitlist!
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#2B2B38] font-medium leading-relaxed">
                Thank you for your interest in{" "}
                <strong className="text-[#14141A]">{serviceName}</strong>. Our engineering team will contact you with early access and an exclusive launch discount before public rollout.
              </p>
            </div>

            <div className="pt-3 border-t border-black/10 space-y-2">
              <a
                href="#contact"
                onClick={handleResetAndClose}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#2A3DE0] transition-all cursor-pointer shadow-xs"
              >
                <span>Have an urgent project? Inquire Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full px-4 py-2 rounded-xl text-xs font-bold text-[#2B2B38] hover:text-[#14141A] hover:bg-[#F5F6FC] transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-1.5 pr-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                <Clock className="h-3 w-3 text-amber-600" />
                Coming Soon
              </div>
              <h2
                id="waitlist-dialog-title"
                className="font-heading text-xl sm:text-2xl font-bold text-[#14141A]"
              >
                Join the Early Waitlist
              </h2>
              <p className="text-xs text-[#2B2B38] font-medium">
                Reserve priority access to{" "}
                <strong className="text-[#374BFF]">{serviceName || "this upcoming service"}</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14141A] mb-1">
                  Full Name <span className="text-[#374BFF]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2B2B38]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-black/15 bg-[#F5F6FC] pl-10 pr-3.5 py-2.5 text-xs text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:bg-white focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14141A] mb-1">
                  Email Address <span className="text-[#374BFF]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2B2B38]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-black/15 bg-[#F5F6FC] pl-10 pr-3.5 py-2.5 text-xs text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:bg-white focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14141A] mb-1">
                  Project Details or Requirements <span className="text-[10px] text-[#2B2B38] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us what you're looking to create..."
                  className="w-full rounded-xl border border-black/15 bg-[#F5F6FC] p-3 text-xs text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:bg-white focus:outline-none transition-all font-medium resize-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#374BFF] text-white hover:bg-[#2A3DE0] text-xs font-bold py-2.5 rounded-xl shadow-xs"
                >
                  {submitting ? "Reserving spot..." : "Join Priority Waitlist"}
                </Button>
              </div>

              <div className="text-center pt-1">
                <a
                  href="#contact"
                  onClick={handleResetAndClose}
                  className="text-[11px] text-[#2B2B38] hover:text-[#374BFF] font-semibold underline"
                >
                  Need something right now? Request a custom quote →
                </a>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
