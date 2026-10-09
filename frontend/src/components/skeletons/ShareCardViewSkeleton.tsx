import { CardSkeleton } from "./CardSkeleton";

export function ShareCardViewSkeleton() {
  return (
    <div
      className="min-h-screen bg-zinc-100 dark:bg-[#0b110d] flex flex-col text-gray-900 dark:text-zinc-100 transition-colors duration-200"
      aria-busy="true"
      aria-label="Loading shared card"
    >
      {/* Top Navbar Skeleton */}
      <nav className="flex justify-between items-center px-4 sm:px-8 py-3.5 bg-white/95 dark:bg-[#0e1610]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-30 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-stone-200 dark:bg-emerald-950/80" />
          <div className="h-6 w-32 rounded-lg bg-stone-200 dark:bg-emerald-950/70" />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-200/70 dark:bg-emerald-950/60" />
          <div className="h-8 w-36 rounded-xl bg-stone-200/90 dark:bg-emerald-900/60" />
        </div>
      </nav>

      {/* Main Single Card Content Skeleton */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg">
          {/* Header Title Skeleton */}
          <div className="mb-4 text-center flex flex-col items-center gap-1.5 animate-pulse">
            <div className="h-3.5 w-24 rounded bg-stone-200/80 dark:bg-emerald-950/60" />
            <div className="h-6 sm:h-7 w-48 rounded-lg bg-stone-200 dark:bg-emerald-950/70" />
          </div>

          {/* Centered Single Card Skeleton */}
          <CardSkeleton type="note" index={0} />

          {/* Footer Callout Skeleton */}
          <div className="mt-6 text-center flex justify-center animate-pulse">
            <div className="h-4 w-72 rounded bg-stone-200/70 dark:bg-emerald-950/50" />
          </div>
        </div>
      </main>
    </div>
  );
}
