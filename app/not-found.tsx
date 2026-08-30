import Link from "next/link";
import { Home, Compass } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-12 bg-[#F5F6FC] dark:bg-[#14141A] text-center text-[#14141A] dark:text-[#F5F6FC] transition-colors duration-200">
      <div className="flex justify-center">
        <Logo size="md" />
      </div>

      <div className="mx-auto max-w-md my-auto space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#374BFF] via-[#374BFF] to-[#14141A] text-white shadow-xl shadow-[#374BFF]/20">
          <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: "12s" }} />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-7xl font-black text-[#14141A] dark:text-[#F5F6FC] tracking-tighter">
            404
          </h1>
          <h2 className="font-heading text-2xl font-bold text-[#374BFF]">
            Page Not Found
          </h2>
          <p className="text-sm text-[#14141A]/70 dark:text-[#F5F6FC]/70 leading-relaxed font-medium">
            The page or digital resource you were looking for doesn&apos;t exist or has moved to a new route.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#374BFF] px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-[#374BFF]/20 hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] hover:scale-105 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>

      <div className="text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/60 font-semibold">
        TrioCore — Think. Build. Scale.
      </div>
    </div>
  );
}
