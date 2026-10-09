import { CardSkeletonGrid } from "./CardSkeletonGrid";

export function ShareViewSkeleton() {
  return (
    <div
      className="min-h-screen bg-zinc-100 dark:bg-[#0b110d] flex flex-col text-gray-900 dark:text-zinc-100 transition-colors duration-200"
      aria-busy="true"
      aria-label="Loading shared brain"
    >
      {/* Top Navbar Skeleton */}
      <nav className="flex justify-between items-center px-4 sm:px-8 py-3.5 bg-white/95 dark:bg-[#0e1610]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-30 animate-pulse">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-stone-200 dark:bg-emerald-950/80" />
          <div className="h-6 w-32 rounded-lg bg-stone-200 dark:bg-emerald-950/70" />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-200/70 dark:bg-emerald-950/60" />
          <div className="hidden sm:block h-8 w-20 rounded-xl bg-stone-200 dark:bg-emerald-950/70" />
          <div className="h-8 w-32 rounded-xl bg-stone-200/90 dark:bg-emerald-900/60" />
        </div>
      </nav>

      {/* Profile Header Banner Skeleton */}
      <header className="bg-white dark:bg-[#121c15] border-b border-gray-200 dark:border-white/5 py-8 px-4 sm:px-8 shadow-xs animate-pulse">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar skeleton */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-200 dark:bg-emerald-950/80 shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60" />
                <div className="h-4 w-16 rounded bg-stone-200/60 dark:bg-emerald-950/40" />
              </div>
              <div className="h-7 sm:h-8 w-56 sm:w-64 rounded-lg bg-stone-200 dark:bg-emerald-950/80" />
              <div className="h-4 w-40 rounded bg-stone-200/70 dark:bg-emerald-950/50" />
            </div>
          </div>

          {/* Type stats chips skeleton */}
          <div className="flex flex-wrap items-center gap-2">
            {[20, 24, 22, 20].map((w, i) => (
              <div
                key={i}
                className="h-8 rounded-lg bg-zinc-100 dark:bg-[#16231a] border border-gray-200 dark:border-white/10"
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Filter & Content Area Skeleton */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Filters and Search Bar Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-pulse">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-16 rounded-lg bg-stone-200 dark:bg-emerald-950/80" />
            <div className="h-8 w-24 rounded-lg bg-white dark:bg-[#141f17] border border-gray-200 dark:border-white/10" />
            <div className="h-8 w-28 rounded-lg bg-white dark:bg-[#141f17] border border-gray-200 dark:border-white/10" />
            <div className="h-8 w-24 rounded-lg bg-white dark:bg-[#141f17] border border-gray-200 dark:border-white/10" />
          </div>

          {/* Search Box Skeleton */}
          <div className="w-full sm:w-64 h-10 rounded-xl bg-white dark:bg-[#141f17] border border-gray-200 dark:border-white/10" />
        </div>

        {/* Skeleton Cards Grid */}
        <CardSkeletonGrid count={6} />
      </main>
    </div>
  );
}
