"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/motion/reveal";

export function FeedbackSection() {
  const [type, setType] = useState<"feedback" | "bug" | "feature">("feedback");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send feedback");
      }

      setSubmitted(true);
      toast.success("Thank you! Your feedback has been received.");
      setMessage("");
      setEmail("");
    } catch (err) {
      toast.error((err as Error).message || "Could not submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="relative py-16 sm:py-24 px-5 sm:px-6 lg:px-8 bg-white border-t border-black/10">
      <div className="mx-auto max-w-4xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Reveal direction="down">
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] font-heading">
              Feedback & Bug Reports
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-2 font-heading text-2xl sm:text-4xl font-black tracking-tight text-[#14141A]">
              Report an issue / Give feedback
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.16}>
            <p className="mt-2 text-xs sm:text-sm text-[#2B2B38] font-medium">
              Found a bug or have a suggestion? Share it directly with our engineering team.
            </p>
          </Reveal>
        </div>

        <div className="rounded-3xl border border-black/10 p-6 sm:p-8 bg-[#F5F6FC] shadow-sm">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#14141A]">
                Feedback Sent Successfully!
              </h3>
              <p className="text-xs text-[#2B2B38]">
                We review every report and continuously improve our digital systems.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-bold text-[#374BFF] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(["feedback", "bug", "feature"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      type === t
                        ? "bg-[#374BFF] text-white border-[#374BFF] shadow-sm"
                        : "bg-white text-[#14141A] border-black/10 hover:border-[#374BFF]"
                    }`}
                  >
                    {t === "bug" ? "🐛 Bug Report" : t === "feature" ? "💡 Feature Idea" : "💬 Feedback"}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#14141A]">
                  Message <span className="text-[#374BFF]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  disabled={submitting}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what happened or share your feedback in detail..."
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-xs sm:text-sm text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#14141A]">
                    Email <span className="text-[10px] text-[#2B2B38] font-normal">(Optional for follow-up)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled={submitting}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs sm:text-sm text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#374BFF] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#14141A] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
