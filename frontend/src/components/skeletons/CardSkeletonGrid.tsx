import { CardSkeleton, type SkeletonCardType } from "./CardSkeleton";

interface CardSkeletonGridProps {
  count?: number;
  type?: SkeletonCardType;
  className?: string;
}

export function CardSkeletonGrid({
  count = 6,
  type,
  className = "",
}: CardSkeletonGridProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6 w-full min-w-0 ${className}`}
      aria-busy="true"
      aria-label="Loading contents"
    >
      {items.map((idx) => (
        <CardSkeleton key={idx} index={idx} type={type} />
      ))}
    </div>
  );
}
