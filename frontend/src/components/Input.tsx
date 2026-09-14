import { useState, type ChangeEvent } from "react";
import { EyeoffIcon } from "../icons/eyeoffIcon";
import { EyeopenIcon } from "../icons/eyeopenIcon";

interface InputProps {
  placeholder: string;
  reference?: any;
  type?: "text" | "password";
  error?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
  autoFocus?: boolean;
}

export function Input({
  placeholder,
  reference,
  type = "text",
  error = false,
  value,
  onChange,
  className = "",
  name,
  autoFocus
}: InputProps) {
  const [showpassword, setShowpassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`relative w-full ${error ? "animate-shake" : ""} ${className}`}>
      <input
        ref={reference}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        autoFocus={autoFocus}
        type={isPassword && !showpassword ? "password" : "text"}
        className={`w-full px-4 py-2.5 text-sm sm:text-base text-gray-900 bg-white border rounded-xl transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-4 ${
          isPassword ? "pr-11" : ""
        } ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
            : "border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:ring-purple-500/10 shadow-xs"
        }`}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowpassword(!showpassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
          aria-label={showpassword ? "Hide password" : "Show password"}
        >
          {showpassword ? <EyeoffIcon /> : <EyeopenIcon />}
        </button>
      )}
    </div>
  );
}
