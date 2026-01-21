import { useState } from "react";
import { EyeoffIcon } from "../icons/eyeoffIcon";
import { EyeopenIcon } from "../icons/eyeopenIcon";

interface InputProps{
  placeholder: string;
  reference?: any;
  type?: "text" | "password";
  error?: boolean;
}

export function Input({
  placeholder,
  reference,
  type = "text",
  error = false
}: InputProps) {
  const [showpassword, setShowpasword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className={`relative w-full m-2 ${error ? "animate-shake" : ""}`}>
      <input
        ref={reference}
        placeholder={placeholder}
        type={isPassword && !showpassword ? "password" : "text"}
        className={`w-full px-4 py-2 border rounded pr-10 focus:outline-none focus:ring-2
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-400 focus:ring-indigo-500"}
        `}
      />

      {isPassword && (
        <div
          onClick={() => setShowpasword(!showpassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
        >
          {showpassword ? <EyeoffIcon /> : <EyeopenIcon />}
        </div>
      )}
    </div>
  );
}
