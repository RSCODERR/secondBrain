import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/button";
import { AuthLayout } from "../components/AuthLayout";
import { UserIcon } from "../icons/userIcon";
import { LockIcon } from "../icons/lockIcon";
import { EyeopenIcon } from "../icons/eyeopenIcon";
import { EyeoffIcon } from "../icons/eyeoffIcon";
import "../App.css";

export function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Please enter your username");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${BACKEND_URL}/api/v1/signin`,
        {
          username: trimmedUsername,
          password: password,
        },
        { withCredentials: true }
      );

      await checkAuth();
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setError("Invalid username or password. Please try again.");
        } else if (status === 500) {
          setError("Username and password are required.");
        } else {
          setError(err.response?.data?.msg || "Something went wrong. Please check your connection.");
        }
      } else {
        setError("Network error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      activeTab="signin"
      title="Welcome back"
      subtitle="Sign in to resume organizing your digital memory"
      footer={
        <p className="text-stone-600">
          New to Second Brain?{" "}
          <Link
            to="/signup"
            className="text-[#3a5e40] font-semibold hover:text-[#2d4a31] hover:underline transition-colors"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <UserIcon size="sm" />
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. johndoe"
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base text-stone-900 bg-white border border-stone-200 rounded-xl transition-all duration-200 placeholder:text-stone-400 hover:border-stone-300 focus:outline-none focus:border-[#4a7a50] focus:ring-4 focus:ring-[#4a7a50]/10 shadow-xs"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => setForgotPasswordNotice(true)}
              className="text-xs font-medium text-[#3a5e40] hover:text-[#2d4a31] hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <LockIcon size="sm" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-2.5 text-sm sm:text-base text-stone-900 bg-white border border-stone-200 rounded-xl transition-all duration-200 placeholder:text-stone-400 hover:border-stone-300 focus:outline-none focus:border-[#4a7a50] focus:ring-4 focus:ring-[#4a7a50]/10 shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeoffIcon /> : <EyeopenIcon />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center pt-1">
          <label className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 focus:ring-[#4a7a50] cursor-pointer accent-[#2d4a31]"
            />
            <span>Keep me logged in for 7 days</span>
          </label>
        </div>

        {/* Forgot password dialog hint */}
        {forgotPasswordNotice && (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 flex items-start justify-between gap-2 animate-fade-in-up">
            <span>For password resets, contact your administrator or re-create an account.</span>
            <button
              type="button"
              onClick={() => setForgotPasswordNotice(false)}
              className="text-stone-500 hover:text-stone-900 font-bold px-1 shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Inline Error Pill */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2 animate-fade-in-up">
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            varient="primary"
            size="md"
            text={loading ? "Signing in..." : "Sign In"}
            fullWidth
            loading={loading}
          />
        </div>
      </form>
    </AuthLayout>
  );
}
