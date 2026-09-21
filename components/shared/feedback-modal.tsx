"use client";

import React, { useState, useEffect } from "react";
import { MessageSquarePlus, Bug, Sparkles, Star, X, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<"feedback" | "bug" | "feature" | "testimonial">("feedback");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSubmitted(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!message.trim() || message.trim().length < 5) {
      toast.error("Please enter at least 5 characters for your message.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          email: email.trim() || null,
          consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setSubmitted(true);
      toast.success("Thank you! Your feedback has been recorded.");
      setMessage("");
      setEmail("");
    } catch (err) {
      toast.error((err as Error).message || "Could not submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: "feedback" as const, label: "Feedback", icon: MessageSquarePlus },
    { id: "bug" as const, label: "Bug Report", icon: Bug },
    { id: "feature" as const, label: "Feature Idea", icon: Sparkles },
    { id: "testimonial" as const, label: "Testimonial", icon: Star },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white border border-[#14141A]/10 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-xl border border-[#14141A]/10 flex items-center justify-center text-[#14141A] hover:bg-[#14141A]/5 hover:text-[#374BFF] transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-[#14141A]">
                Feedback Received!
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#2B2B38] font-medium">
                Thank you for helping us improve TrioCore. Your report is directly logged into our team queue.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="md" onClick={onClose}>
                Close Window
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#374BFF]">
                Community & Quality
              </span>
              <h2
                id="feedback-dialog-title"
                className="font-heading text-xl sm:text-2xl font-bold text-[#14141A]"
              >
                Send Feedback or Report a Bug
              </h2>
              <p className="text-xs text-[#2B2B38] font-medium">
                Found an issue or have a suggestion? Let us know directly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Category Pills */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14141A] mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const isSelected = type === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setType(c.id)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#374BFF] text-white border-[#374BFF] shadow-xs"
                            : "bg-[#F5F6FC] text-[#14141A] border-[#14141A]/10 hover:border-[#374BFF]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="feedback-message"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#14141A] mb-1.5"
                >
                  Your Message <span className="text-[#374BFF]">*</span>
                </label>
                <textarea
                  id="feedback-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your feedback, bug, or idea in detail..."
                  className="w-full rounded-xl border border-[#14141A]/10 bg-[#F5F6FC] p-3 text-xs sm:text-sm text-[#14141A] placeholder-[#14141A]/40 focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all font-medium resize-none"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="feedback-email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#14141A] mb-1.5"
                >
                  Your Email <span className="text-[10px] text-[#2B2B38] font-normal">(Optional, if you would like a reply)</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full rounded-xl border border-[#14141A]/10 bg-[#F5F6FC] px-3.5 py-2.5 text-xs sm:text-sm text-[#14141A] placeholder-[#14141A]/40 focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all font-medium"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  icon={<Send className="h-3.5 w-3.5" />}
                >
                  Send Report
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
