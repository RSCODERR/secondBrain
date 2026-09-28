/**
 * Deterministic, vibrant color palettes for tags supporting both light and dark modes.
 */
const tagPalettes = [
  "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-700",
  "bg-violet-50 text-violet-800 border-violet-200/80 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60 hover:border-violet-400 dark:hover:border-violet-700",
  "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60 hover:border-amber-400 dark:hover:border-amber-700",
  "bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60 hover:border-sky-400 dark:hover:border-sky-700",
  "bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60 hover:border-rose-400 dark:hover:border-rose-700",
  "bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-700",
  "bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60 hover:border-teal-400 dark:hover:border-teal-700",
  "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200/80 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:border-fuchsia-800/60 hover:border-fuchsia-400 dark:hover:border-fuchsia-700",
  "bg-orange-50 text-orange-800 border-orange-200/80 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60 hover:border-orange-400 dark:hover:border-orange-700",
  "bg-cyan-50 text-cyan-800 border-cyan-200/80 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/60 hover:border-cyan-400 dark:hover:border-cyan-700",
];

const dotPalettes = [
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-fuchsia-500",
  "bg-orange-500",
  "bg-cyan-500",
];

export function getTagIndex(tag: string): number {
  const normalized = (tag || "").trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % tagPalettes.length;
}

export function getTagColorClass(tag: string): string {
  return tagPalettes[getTagIndex(tag)];
}

export function getTagDotClass(tag: string): string {
  return dotPalettes[getTagIndex(tag)];
}

export function normalizeTag(tag: any): string {
  if (!tag) return "";
  const str = typeof tag === "string" ? tag : tag.title || "";
  return String(str).replace(/^#+/, "").trim().toLowerCase();
}
