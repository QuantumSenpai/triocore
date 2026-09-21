"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export default function Error({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 console.error(error);
 }, [error]);

 return (
 <div className="min-h-screen flex flex-col justify-between p-6 sm:p-12 bg-[#F5F6FC] text-center text-[#14141A] transition-colors duration-200">
 <div className="flex justify-center">
 <Logo size="md" />
 </div>

 <div className="mx-auto max-w-md my-auto space-y-6">
 <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/20 text-red-500 shadow-xl">
 <AlertTriangle className="h-10 w-10" />
 </div>

 <div className="space-y-2">
 <h1 className="font-heading text-3xl font-black text-[#14141A] tracking-tight">
 Something went wrong!
 </h1>
 <p className="text-sm text-[#14141A] leading-relaxed font-medium">
 An unexpected client error occurred while rendering this view.
 </p>
 </div>

 <div className="flex items-center justify-center gap-4 pt-2">
 <button
 onClick={() => reset()}
 className="inline-flex items-center gap-2 rounded-2xl bg-[#374BFF] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#374BFF] hover:bg-[#14141A] interactive-lift transition-all cursor-pointer"
 >
 <RotateCcw className="h-4 w-4" />
 <span>Try Again</span>
 </button>
 <Link
 href="/"
 className="inline-flex items-center gap-2 rounded-2xl border border-[#14141A] bg-white px-6 py-3 text-sm font-bold text-[#14141A] hover:border-[#374BFF] transition-all"
 >
 <Home className="h-4 w-4" />
 <span>Home</span>
 </Link>
 </div>
 </div>

 <div className="text-xs text-[#14141A] font-semibold">
 TrioCore — Think. Build. Scale.
 </div>
 </div>
 );
}
