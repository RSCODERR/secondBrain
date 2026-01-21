import type { ReactElement } from "react"
import { LoaderIcon } from "../icons/loaderIcon"

type varients = "primary" | "secondary"

interface ButtonProps {
  varient: varients
  size: "sm" | "md" | "lg"
  text: string
  startIcon?: ReactElement
  endIcon?: ReactElement
  onClick?: () => void
  fullWidth?: boolean
  loading?: boolean
}

const varientStyles = {
  primary: "bg-indigo-600 text-white enabled:hover:bg-indigo-700",
  secondary: "bg-indigo-200 text-indigo-500 enabled:hover:bg-indigo-300",
}

const sizeStyles = {
  sm: "py-1 px-2 text-sm",
  md: "py-2 px-4 text-md",
  lg: "py-4 px-6 text-xl",
}

const defaultStyles =
  "hover:cursor-pointer rounded-md flex items-center justify-center shadow-md transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:scale-100"

export const Button = (props: ButtonProps) => {
  return (
    <button
      disabled={props.loading}
      onClick={props.onClick}
      className={`
        relative
        ${varientStyles[props.varient]}
        ${sizeStyles[props.size]}
        ${defaultStyles}
        ${props.fullWidth ? "w-full" : ""}
        disabled:opacity-60
      `}
    >
      {props.loading && (
        <span className="absolute">
          <LoaderIcon />
        </span>
      )}

      <span className={props.loading ? "opacity-0" : "flex items-center gap-2"}>
        {props.startIcon}
        {props.text}
        {props.endIcon}
      </span>
    </button>
  )
}
