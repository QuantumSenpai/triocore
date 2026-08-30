import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[#14141A]/8 dark:bg-white/8",
        shimmer ? "animate-pulse" : "",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function ShowcaseCardSkeleton() {
  return (
    <div className="rounded-3xl glass-card border border-[#14141A]/14 dark:border-[#374BFF]/20 overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="relative h-48 sm:h-56 w-full bg-[#14141A]/8 dark:bg-white/5 animate-pulse">
          <div className="absolute top-3.5 right-3.5">
            <Skeleton className="h-6 w-24 rounded-full bg-white/20 dark:bg-white/10" />
          </div>
        </div>

        <div className="p-6 sm:p-7 space-y-4">
          <Skeleton className="h-6 w-3/5 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-14 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-4 w-8 rounded-md" />
      </div>
    </div>
  );
}

export function AdminInquirySkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-[#374BFF]/20 space-y-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#14141A]/10 dark:border-white/10">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-lg" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Skeleton className="h-4 w-40 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="pt-2 flex justify-end">
        <Skeleton className="h-8 w-32 rounded-xl" />
      </div>
    </div>
  );
}
