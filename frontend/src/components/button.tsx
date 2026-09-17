import type { ReactElement } from "react"
import { LoaderIcon } from "../icons/loaderIcon"

type varients = "primary" | "secondary" | "danger" | "ghost"

interface ButtonProps {
  varient: varients
  size: "sm" | "md" | "lg"
  text: string
  startIcon?: ReactElement
  endIcon?: ReactElement
  onClick?: () => void
  fullWidth?: boolean
  loading?: boolean
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

const varientStyles = {
  primary:
    "bg-[#2d4a31] text-white shadow-sm shadow-green-900/20 hover:bg-[#3a5e40] hover:shadow-md hover:shadow-green-900/30 border border-white/10 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white dark:border-emerald-400/20 dark:shadow-[0_0_20px_rgba(16,185,129,0.25)]",
  secondary:
    "bg-white text-stone-700 hover:text-stone-900 border border-stone-200/90 hover:bg-stone-50/90 hover:border-stone-300 shadow-xs hover:shadow-sm dark:bg-[#142017] dark:text-emerald-100 dark:border-emerald-900/60 dark:hover:bg-[#1b2b20] dark:hover:border-emerald-700/60 dark:hover:text-white",
  danger:
    "bg-red-50/90 text-red-600 hover:text-red-700 border border-red-200/80 hover:bg-red-100/80 hover:border-red-300 shadow-xs dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60 dark:hover:bg-red-900/50 dark:hover:border-red-700",
  ghost:
    "bg-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 border border-transparent dark:text-stone-300 dark:hover:text-white dark:hover:bg-white/5",
}

const sizeStyles = {
  sm: "min-h-[36px] py-1.5 px-3 text-xs sm:text-sm font-medium gap-1.5 whitespace-nowrap",
  md: "min-h-[44px] py-2.5 px-4 text-sm font-semibold gap-2 whitespace-nowrap",
  lg: "min-h-[48px] py-3 px-6 text-base font-semibold gap-2.5 whitespace-nowrap",
}

const defaultStyles =
  "hover:cursor-pointer rounded-xl inline-flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 dark:focus-visible:ring-emerald-500 dark:focus-visible:ring-offset-[#0b110d] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 select-none tracking-tight box-border min-w-0"

export const Button = (props: ButtonProps) => {
  return (
    <button
      type={props.type || "button"}
      disabled={props.loading || props.disabled}
      onClick={props.onClick}
      className={`
        relative
        ${varientStyles[props.varient]}
        ${sizeStyles[props.size]}
        ${defaultStyles}
        ${props.fullWidth ? "w-full" : ""}
        ${props.className || ""}
      `}
    >
      {props.loading && (
        <span className="absolute flex items-center justify-center">
          <LoaderIcon />
        </span>
      )}

      <span className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap min-w-0 ${props.loading ? "opacity-0" : ""}`}>
        {props.startIcon && <span className="shrink-0 flex items-center justify-center">{props.startIcon}</span>}
        <span className="truncate">{props.text}</span>
        {props.endIcon && <span className="shrink-0 flex items-center justify-center">{props.endIcon}</span>}
      </span>
    </button>
  )
}

