"use client";

import { useState } from "react";
import { 
 Mail, 
 Send, 
 CheckCircle2, 
 ShieldCheck, 
 BadgeCheck, 
 RefreshCw 
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { contactSchema, type ContactFormData } from "@/lib/validations/contact";

const needCategories = [
 "Business Website",
 "Mobile & Web Apps",
 "E-Commerce Store",
 "Web Application / SaaS",
 "NFC & Hardware Project",
 "Logo & Brand Identity",
 "Not Sure Yet — Let's Talk",
];

export function ContactFormSection() {
 const [formData, setFormData] = useState<ContactFormData>({
 name: "",
 email: "",
 phone: "",
 service: needCategories[0],
 budget: "",
 message: "",
 companyHp: "",
 });

 const [errors, setErrors] = useState<Record<string, string>>({});
 const [loading, setLoading] = useState(false);
 const [submitted, setSubmitted] = useState(false);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setFormData((prev) => ({ ...prev, [name]: value }));
 if (errors[name]) {
 setErrors((prev) => ({ ...prev, [name]: "" }));
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrors({});

 const parseResult = contactSchema.safeParse(formData);
 if (!parseResult.success) {
 const fieldErrors: Record<string, string> = {};
 parseResult.error.errors.forEach((err) => {
 if (err.path[0]) {
 fieldErrors[err.path[0].toString()] = err.message;
 }
 });
 setErrors(fieldErrors);
 toast.error("Please resolve the highlighted form errors.");
 return;
 }

 setLoading(true);

 try {
 const res = await fetch("/api/contact", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(formData),
 });

 const data = await res.json();

 if (!res.ok) {
 throw new Error(data.error || "Failed to submit form");
 }

 setSubmitted(true);
 toast.success("Inquiry sent successfully! We'll reply within 24 hours.");

 try {
 confetti({
 particleCount: 80,
 spread: 70,
 origin: { y: 0.6 },
 colors: ["#374BFF", "#CFFF04", "#14141A", "#FFFFFF"],
 });
 } catch {}
 } catch (err) {
 toast.error((err as Error).message || "Submission failed. Please try again.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <section id="contact" className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-7xl">
 <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
 <Reveal direction="down">
 <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] font-heading">
 Start Your Project
 </span>
 </Reveal>
 <Reveal direction="up" delay={0.1}>
 <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A]">
 Ready to Turn Your Vision <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
 Into Production Reality?
 </span>
 </h2>
 </Reveal>
 <Reveal direction="up" delay={0.2}>
 <p className="mt-4 text-sm sm:text-base md:text-lg text-[#14141A] font-sans font-medium">
 Drop us a message below. We review every inquiry personally and respond within 24 hours with timeline estimates, technical suggestions, and transparent pricing.
 </p>
 </Reveal>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
 <div className="lg:col-span-5 space-y-6">
 <Reveal direction="left">
 <div className="glass-card rounded-3xl p-6 sm:p-9 space-y-6">
 <div>
 <span className="text-xs font-bold uppercase tracking-wider text-[#374BFF]">
 Direct Inquiries • India 🇮🇳
 </span>
 <h3 className="mt-1 font-heading text-xl sm:text-2xl font-bold text-[#14141A]">
 Connect with Founders
 </h3>
 <p className="mt-2 text-xs sm:text-sm text-[#14141A] leading-relaxed font-medium">
 Have an urgent launch or custom software requirement? Reach us directly via email or our collaborative project portal.
 </p>
 </div>

 <div className="space-y-4 pt-2">
 <a
 href="mailto:triocorebusiness@gmail.com"
 className="flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-[#14141A] bg-white hover:border-[#374BFF] hover:shadow-md transition-all group"
 >
 <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#374BFF] text-white">
 <Mail className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-[10px] sm:text-xs font-bold text-[#14141A] uppercase tracking-wider">
 Official Business Inbox
 </p>
 <p className="text-xs sm:text-sm font-black text-[#14141A] group-hover:text-[#374BFF] transition-colors truncate">
 triocorebusiness@gmail.com
 </p>
 </div>
 </a>
 </div>

 <div className="pt-4 border-t border-[#14141A]/10 space-y-3">
 <p className="text-xs font-bold uppercase tracking-wider text-[#14141A]">
 Our Commitments to You
 </p>

 <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-[#14141A] font-semibold">
 <ShieldCheck className="h-4 w-4 text-[#374BFF] shrink-0" />
 <span>Strict Non-Disclosure & Full Code Ownership</span>
 </div>
 <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-[#14141A] font-semibold">
 <BadgeCheck className="h-4 w-4 text-[#374BFF] shrink-0" />
 <span>Clear Milestones & Zero Hidden Fees</span>
 </div>
 <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-[#14141A] font-semibold">
 <RefreshCw className="h-4 w-4 text-[#374BFF] shrink-0" />
 <span>Free Post-Launch Warranty & Revisions</span>
 </div>
 </div>
 </div>
 </Reveal>
 </div>

 <div className="lg:col-span-7">
 <Reveal direction="right">
 <div className="glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden">
 {submitted ? (
 <div className="text-center py-10 sm:py-12 space-y-6">
 <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#374BFF] text-white">
 <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
 </div>
 <div className="space-y-2">
 <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#14141A]">
 Inquiry Received!
 </h3>
 <p className="text-xs sm:text-sm text-[#14141A] max-w-md mx-auto font-medium">
 Thank you for reaching out to TrioCore. A core engineer will review your project requirements and email you back shortly.
 </p>
 </div>
 <button
 onClick={() => {
 setSubmitted(false);
 setFormData({
 name: "",
 email: "",
 phone: "",
 service: needCategories[0],
 budget: "",
 message: "",
 companyHp: "",
 });
 }}
 className="inline-flex items-center gap-2 rounded-xl bg-[#374BFF] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#14141A] interactive-lift transition-all cursor-pointer"
 >
 <span>Send Another Inquiry</span>
 </button>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
 <div className="hidden" aria-hidden="true">
 <input
 type="text"
 name="companyHp"
 tabIndex={-1}
 autoComplete="off"
 value={formData.companyHp}
 onChange={handleChange}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-[#14141A] ">
 Your Name <span className="text-[#374BFF]">*</span>
 </label>
 <input
 type="text"
 name="name"
 disabled={loading}
 placeholder="e.g. Alex Morgan"
 value={formData.name}
 onChange={handleChange}
 className={`w-full rounded-xl border border-[#14141A] bg-[#F5F6FC] px-4 py-3 text-sm text-[#14141A] placeholder-[#14141A] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all font-medium ${loading ? "opacity-60 animate-pulse cursor-not-allowed" : ""}`}
 />
 {errors.name && (
 <p className="text-[11px] text-red-500 font-medium">{errors.name}</p>
 )}
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-[#14141A] ">
 Email Address <span className="text-[#374BFF]">*</span>
 </label>
 <input
 type="email"
 name="email"
 disabled={loading}
 placeholder="alex@company.com"
 value={formData.email}
 onChange={handleChange}
 className={`w-full rounded-xl border border-[#14141A] bg-[#F5F6FC] px-4 py-3 text-sm text-[#14141A] placeholder-[#14141A] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all font-medium ${loading ? "opacity-60 animate-pulse cursor-not-allowed" : ""}`}
 />
 {errors.email && (
 <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-[#14141A] ">
 Phone Number <span className="text-[10px] text-[#14141A] font-normal">(Optional)</span>
 </label>
 <input
 type="tel"
 name="phone"
 disabled={loading}
 placeholder="+91 98765 43210"
 value={formData.phone}
 onChange={handleChange}
 className={`w-full rounded-xl border border-[#14141A] bg-[#F5F6FC] px-4 py-3 text-sm text-[#14141A] placeholder-[#14141A] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all font-medium ${loading ? "opacity-60 animate-pulse cursor-not-allowed" : ""}`}
 />
 </div>

 <div className="space-y-1.5">
 <label htmlFor="service-select" className="text-xs font-bold uppercase tracking-wider text-[#14141A]">
 What do you need? <span className="text-[#374BFF]">*</span>
 </label>
 <select
 id="service-select"
 name="service"
 aria-label="What do you need?"
 disabled={loading}
 value={formData.service}
 onChange={handleChange}
 className={`w-full rounded-xl border border-[#14141A]/10 bg-[#F5F6FC] px-4 py-3 text-sm text-[#14141A] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all font-medium ${loading ? "opacity-60 animate-pulse cursor-not-allowed" : ""}`}
 >
 {needCategories.map((cat) => (
 <option key={cat} value={cat} className="bg-white text-[#14141A]">
 {cat}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-[#14141A]">
 Estimated Budget <span className="text-[10px] text-[#2B2B38] font-normal">(e.g. ₹2,000 - ₹50,000)</span>
 </label>
 <input
 type="text"
 name="budget"
 disabled={loading}
 placeholder="e.g. ₹5,000 or ₹20,000 - ₹50,000"
 value={formData.budget || ""}
 onChange={handleChange}
 className={`w-full rounded-xl border border-black/15 bg-[#F5F6FC] px-4 py-3 text-sm text-[#14141A] placeholder-[#2B2B38] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all font-medium ${loading ? "opacity-60 animate-pulse cursor-not-allowed" : ""}`}
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-[#14141A] ">
 Project Scope & Goals <span className="text-[#374BFF]">*</span>
 </label>
 <textarea
 rows={4}
 name="message"
 disabled={loading}
 placeholder="Tell us about your business, target audience, preferred timeline, or any specific ideas you have in mind..."
 value={formData.message}
 onChange={handleChange}
 className={`w-full rounded-xl border border-[#14141A] bg-[#F5F6FC] px-4 py-3 text-sm text-[#14141A] placeholder-[#14141A] focus:border-[#374BFF] focus:ring-1 focus:ring-[#374BFF] focus:outline-none transition-all resize-none font-medium ${loading ? "opacity-60 animate-pulse cursor-not-allowed" : ""}`}
 />
 {errors.message && (
 <p className="text-[11px] text-red-500 font-medium">{errors.message}</p>
 )}
 </div>

 <div className="pt-2">
 <Button
 type="submit"
 variant="primary"
 size="lg"
 loading={loading}
 className="w-full"
 icon={<Send className="h-4 w-4" />}
 >
 {loading ? "Submitting Inquiry..." : "Send Project Inquiry"}
 </Button>
 </div>
 </form>
 )}
 </div>
 </Reveal>
 </div>
 </div>
 </div>
 </section>
 );
}
