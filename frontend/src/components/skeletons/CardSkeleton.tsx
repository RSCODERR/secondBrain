export type SkeletonCardType = "note" | "link" | "youtube" | "twitter";

interface CardSkeletonProps {
  type?: SkeletonCardType;
  index?: number;
}

export function CardSkeleton({ type, index = 0 }: CardSkeletonProps) {
  // Infer a varied card type if not explicitly provided
  const resolvedType: SkeletonCardType =
    type || (index % 4 === 0 ? "note" : index % 4 === 1 ? "link" : index % 4 === 2 ? "youtube" : "note");

  // Vary title widths so adjacent skeletons look natural
  const titleWidths = ["w-3/4", "w-5/6", "w-2/3", "w-4/5"];
  const titleWidth = titleWidths[index % titleWidths.length];

  return (
    <div
      className="group relative flex flex-col bg-white dark:bg-[#121c15] rounded-2xl border border-stone-200/90 dark:border-emerald-950/70 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] overflow-hidden w-full min-w-0 max-w-full h-auto animate-pulse"
      aria-hidden="true"
    >
      {/* Top category accent bar with subtle gradient shimmer */}
      <div className="h-1 w-full bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-emerald-950/70 dark:via-emerald-900/50 dark:to-emerald-950/70" />

      <div className="p-4 sm:p-5 flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Header: Category Badge + Action Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 mb-3">
          {/* Top Row: Category Badge Pill + Star */}
          <div className="flex items-center justify-between gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              {/* Category pill */}
              <div className="h-6 w-22 rounded-full bg-stone-200/80 dark:bg-emerald-950/70" />
              {/* Star / Favorite placeholder */}
              {index % 3 === 0 && (
                <div className="h-5 w-16 rounded-full bg-amber-100/70 dark:bg-amber-950/40" />
              )}
            </div>

            {/* Mobile Actions toolbar skeleton */}
            <div className="flex md:hidden items-center gap-1.5 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#18261e]" />
              <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#18261e]" />
              <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#18261e]" />
            </div>
          </div>

          {/* Desktop Title Skeleton */}
          <div className={`hidden md:block h-5 ${titleWidth} rounded-md bg-stone-200 dark:bg-emerald-950/70 md:mx-2`} />

          {/* Desktop Actions toolbar skeleton */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#18261e]" />
            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#18261e]" />
            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#18261e]" />
            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#18261e]" />
          </div>
        </div>

        {/* Mobile Title Skeleton */}
        <div className={`block md:hidden h-5 ${titleWidth} rounded-md bg-stone-200 dark:bg-emerald-950/70 mb-3`} />

        {/* Card Body by Type */}
        <div className="flex-1 min-w-0">
          {resolvedType === "note" && (
            <div className="rounded-xl bg-stone-50/80 dark:bg-[#0c120e]/80 border border-stone-200/80 dark:border-emerald-950/80 p-3.5 sm:p-4 space-y-2.5">
              <div className="h-3.5 w-full rounded bg-stone-200/80 dark:bg-emerald-950/60" />
              <div className="h-3.5 w-11/12 rounded bg-stone-200/70 dark:bg-emerald-950/50" />
              <div className="h-3.5 w-4/5 rounded bg-stone-200/70 dark:bg-emerald-950/50" />
              {index % 2 === 0 && (
                <div className="h-3.5 w-3/5 rounded bg-stone-200/60 dark:bg-emerald-950/40" />
              )}
            </div>
          )}

          {resolvedType === "link" && (
            <div className="rounded-xl bg-stone-50/80 dark:bg-[#0c120e]/80 border border-stone-200/80 dark:border-emerald-950/80 p-3.5 sm:p-4 mt-1">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="h-5 w-28 rounded-full bg-stone-200/90 dark:bg-emerald-950/70" />
                <div className="h-3.5 w-10 rounded bg-stone-200/70 dark:bg-emerald-950/50" />
              </div>
              <div className="h-3 w-4/5 rounded bg-stone-200/70 dark:bg-emerald-950/50" />
            </div>
          )}

          {resolvedType === "youtube" && (
            <div className="rounded-xl bg-stone-50/80 dark:bg-[#0c120e]/80 border border-stone-200/80 dark:border-emerald-950/80 aspect-video w-full flex flex-col items-center justify-center gap-2 p-4">
              <div className="w-11 h-11 rounded-2xl bg-stone-200/90 dark:bg-emerald-950/70 flex items-center justify-center">
                <div className="w-0 h-0 border-y-5 border-y-transparent border-l-8 border-l-stone-400 dark:border-l-emerald-800/80 ml-0.5" />
              </div>
              <div className="h-3 w-32 rounded bg-stone-200/60 dark:bg-emerald-950/40" />
            </div>
          )}

          {resolvedType === "twitter" && (
            <div className="rounded-xl bg-stone-50/80 dark:bg-[#0c120e]/80 border border-stone-200/80 dark:border-emerald-950/80 p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-stone-200/90 dark:bg-emerald-950/70 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 w-24 rounded bg-stone-200/80 dark:bg-emerald-950/60" />
                  <div className="h-2.5 w-16 rounded bg-stone-200/60 dark:bg-emerald-950/40" />
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-full rounded bg-stone-200/70 dark:bg-emerald-950/50" />
                <div className="h-3 w-5/6 rounded bg-stone-200/70 dark:bg-emerald-950/50" />
              </div>
            </div>
          )}
        </div>

        {/* Footer: Tags row skeleton */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-stone-100 dark:border-emerald-950/60">
          <div className="h-5 w-16 rounded-full bg-stone-100 dark:bg-emerald-950/60" />
          <div className="h-5 w-20 rounded-full bg-stone-100 dark:bg-emerald-950/60" />
          {index % 2 === 0 && (
            <div className="h-5 w-14 rounded-full bg-stone-100 dark:bg-emerald-950/60" />
          )}
        </div>
      </div>
    </div>
  );
}
