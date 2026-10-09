import { CardSkeletonGrid } from "./CardSkeletonGrid";

export function DashboardSkeleton() {
  return (
    <div
      className="dashboard-scope min-h-screen bg-slate-50/70 dark:bg-[#0b110d] text-stone-800 dark:text-stone-100 w-full max-w-full overflow-x-hidden transition-colors duration-200"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {/* Sidebar Skeleton (Visible on Desktop) */}
      <aside className="hidden lg:flex h-screen bg-white dark:bg-[#0c120e] border-r border-stone-200 dark:border-emerald-950/70 w-72 fixed left-0 top-0 px-5 py-6 z-50 flex-col justify-between animate-pulse">
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-200/90 dark:bg-emerald-950/80" />
            <div className="h-6 w-36 rounded-lg bg-stone-200 dark:bg-emerald-950/70" />
          </div>

          {/* Navigation Items */}
          <div className="pt-7 flex flex-col gap-2">
            {/* Favorites item */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-transparent">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-amber-200/80 dark:bg-amber-900/50" />
                <div className="h-4 w-20 rounded bg-stone-200/80 dark:bg-emerald-950/60" />
              </div>
              <div className="h-4 w-6 rounded bg-stone-200/70 dark:bg-emerald-950/50" />
            </div>

            {/* Standard Category items */}
            {["Twitter", "Youtube", "Link", "Notes"].map((cat) => (
              <div
                key={cat}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
              >
                <div className="w-5 h-5 rounded-md bg-stone-200/80 dark:bg-emerald-950/60" />
                <div className="h-4 w-24 rounded bg-stone-200/70 dark:bg-emerald-950/50" />
              </div>
            ))}
          </div>

          {/* Tags Section */}
          <div className="pt-6 mt-4 border-t border-stone-200 dark:border-emerald-950/70">
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="h-3.5 w-14 rounded bg-stone-200/80 dark:bg-emerald-950/60" />
              <div className="h-3.5 w-6 rounded-full bg-stone-200/60 dark:bg-emerald-950/40" />
            </div>

            <div className="flex flex-col gap-1.5">
              {[65, 80, 50, 70].map((widthPercent, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 px-3 rounded-xl"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-emerald-900/70 shrink-0" />
                    <div
                      className="h-3 rounded bg-stone-200/70 dark:bg-emerald-950/50"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <div className="h-3 w-4 rounded-full bg-stone-200/50 dark:bg-emerald-950/40" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Footer Card */}
        <div className="pt-4 border-t border-stone-200 dark:border-emerald-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-200/80 dark:bg-emerald-950/70" />
            <div className="space-y-1">
              <div className="h-3.5 w-24 rounded bg-stone-200/80 dark:bg-emerald-950/60" />
              <div className="h-2.5 w-16 rounded bg-stone-200/50 dark:bg-emerald-950/40" />
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#142017]" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-0 lg:ml-72 min-h-screen p-4 md:p-6 lg:p-8 transition-all duration-300 min-w-0 max-w-full overflow-x-hidden">
        {/* Mobile Header Skeleton */}
        <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-emerald-950/70 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-200/80 dark:bg-emerald-950/70" />
            <div className="h-6 w-32 rounded-lg bg-stone-200 dark:bg-emerald-950/70" />
          </div>
          <div className="w-9 h-9 rounded-lg bg-stone-200/80 dark:bg-emerald-950/70" />
        </div>

        {/* Top Action Controls & Search Bar */}
        <div className="flex flex-col gap-3 mb-6 animate-pulse">
          {/* Row 1: Title + Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <div className="flex items-center gap-2.5">
              <div className="h-7 sm:h-8 w-28 sm:w-36 rounded-xl bg-stone-200 dark:bg-emerald-950/80" />
              <div className="h-6 w-16 rounded-full bg-stone-200/70 dark:bg-[#152219]" />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              <div className="hidden sm:block w-9 h-9 rounded-xl bg-stone-200/70 dark:bg-emerald-950/60" />
              <div className="h-9 w-28 sm:w-32 rounded-xl bg-stone-200/80 dark:bg-emerald-950/70 flex-1 sm:flex-initial" />
              <div className="h-9 w-32 sm:w-36 rounded-xl bg-stone-200/90 dark:bg-emerald-900/60 flex-1 sm:flex-initial" />
            </div>
          </div>

          {/* Row 2: Search Bar */}
          <div className="w-full h-11 rounded-xl bg-white dark:bg-[#121c15] border border-stone-200 dark:border-emerald-950/80 flex items-center px-3.5 gap-3">
            <div className="w-4 h-4 rounded bg-stone-300 dark:bg-emerald-900/50" />
            <div className="h-4 w-64 rounded bg-stone-200/70 dark:bg-emerald-950/50" />
          </div>
        </div>

        {/* Content Cards Grid Skeleton */}
        <CardSkeletonGrid count={6} />
      </div>
    </div>
  );
}
