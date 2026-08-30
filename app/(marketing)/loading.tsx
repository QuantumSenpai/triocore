import { TrioCoreMark } from "@/components/shared/logo";

export default function MarketingLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F5F6FC] dark:bg-[#14141A] transition-colors duration-200">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 rounded-full bg-[#374BFF] opacity-20 blur-2xl animate-pulse" />
        
        <div className="relative flex items-center justify-center text-[#14141A] dark:text-[#FFFFFF] animate-pulse">
          <TrioCoreMark className="h-16 w-16" />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="font-heading font-black tracking-[0.24em] text-sm text-[#14141A] dark:text-[#F5F6FC]">
          TRIOCORE
        </span>
        <span className="font-sans font-bold tracking-[0.3em] uppercase text-[9px] text-[#374BFF] dark:text-[#CFFF04]">
          BUILDING DIGITAL ESSENCE
        </span>
      </div>
    </div>
  );
}
