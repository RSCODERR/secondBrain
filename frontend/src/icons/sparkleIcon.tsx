import { type Iconprops, iconSizeVarients } from "./iconprops";

interface SparkleIconProps extends Partial<Iconprops> {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SparkleIcon({ size = "md", className = "" }: SparkleIconProps) {
  const sizeClass = iconSizeVarients[size] || "size-4.5";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${sizeClass} ${className}`}
    >
      <path
        fillRule="evenodd"
        d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.944.974 1.682 1.918 1.918l1.036.258a.75.75 0 0 1 0 1.44l-1.036.258a2.625 2.625 0 0 0-1.918 1.918l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.918-1.918l-1.036-.258a.75.75 0 0 1 0-1.44l1.036-.258a2.625 2.625 0 0 0 1.918-1.918l.258-1.036A.75.75 0 0 1 18 1.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
