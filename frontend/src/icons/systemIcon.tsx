import { type Iconprops, iconSizeVarients } from "./iconprops";

export function SystemIcon(props?: Partial<Iconprops>) {
  const size = props?.size || "md";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      className={iconSizeVarients[size]}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4" />
    </svg>
  );
}
