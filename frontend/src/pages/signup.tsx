import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Button } from "../components/button";
import { AuthLayout } from "../components/AuthLayout";
import { UserIcon } from "../icons/userIcon";
import { LockIcon } from "../icons/lockIcon";
import { EyeopenIcon } from "../icons/eyeopenIcon";
import { EyeoffIcon } from "../icons/eyeoffIcon";
import "../App.css";

export function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["Too short", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = [
    "bg-gray-200",
    "bg-red-500",
    "bg-amber-500",
    "bg-indigo-500",
    "bg-emerald-500"
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 4 || trimmedUsername.length > 25) {
      setError("Username must be between 4 and 25 characters");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username: trimmedUsername,
        password: password,
      });

      if (res.status === 201) {
        navigate("/signin");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          setError("Username must be 4-25 chars, password at least 6 chars");
        } else if (status === 409) {
          setError("Username already taken. Please pick another one.");
        } else if (status === 500) {
          setError("Server error. Please try again in a few moments.");
        } else {
          setError(err.response?.data?.error || "Failed to create account.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <AuthLayout
      activeTab="signup"
      title="Create your account"
      subtitle="Join Second Brain to collect, organize, and retrieve your digital knowledge"
      footer={
        <p className="text-stone-600 dark:text-stone-400">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-[#3a5e40] dark:text-emerald-400 font-semibold hover:text-[#2d4a31] dark:hover:text-emerald-300 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none">
              <UserIcon size="sm" />
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. alex_rivera"
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:border-[#4a7a50] dark:focus:border-emerald-500 focus:ring-4 focus:ring-[#4a7a50]/10 dark:focus:ring-emerald-500/15 shadow-xs"
            />
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
            4-25 characters, letters and numbers
          </span>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none">
              <LockIcon size="sm" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-11 py-2.5 text-sm sm:text-base text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:border-[#4a7a50] dark:focus:border-emerald-500 focus:ring-4 focus:ring-[#4a7a50]/10 dark:focus:ring-emerald-500/15 shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-400 dark:hover:text-stone-200 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeoffIcon /> : <EyeopenIcon />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5 animate-fade-in-up">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500 dark:text-stone-400">Password strength:</span>
                <span className="font-semibold text-stone-700 dark:text-stone-200">
                  {strengthLabels[strength]}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength >= step ? strengthColors[strength] : "bg-stone-100 dark:bg-stone-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none">
              <LockIcon size="sm" />
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Re-enter your password"
              className={`w-full pl-10 pr-11 py-2.5 text-sm sm:text-base text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:ring-4 shadow-xs ${
                confirmPassword && !passwordsMatch
                  ? "border-red-300 dark:border-red-800/80 focus:border-red-500 focus:ring-red-500/15"
                  : confirmPassword && passwordsMatch
                  ? "border-emerald-300 dark:border-emerald-700/80 focus:border-emerald-500 focus:ring-emerald-500/15"
                  : "border-stone-200 dark:border-emerald-900/60 focus:border-[#4a7a50] dark:focus:border-emerald-500 focus:ring-[#4a7a50]/10 dark:focus:ring-emerald-500/15"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-400 dark:hover:text-stone-200 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeoffIcon /> : <EyeopenIcon />}
            </button>
          </div>
          {confirmPassword && (
            <span
              className={`text-[11px] mt-1 block font-medium ${
                passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
              }`}
            >
              {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
            </span>
          )}
        </div>

        {/* Inline Error Pill */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2 animate-fade-in-up">
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            varient="primary"
            size="md"
            text={loading ? "Creating account..." : "Create Account"}
            fullWidth
            loading={loading}
          />
        </div>
      </form>
    </AuthLayout>
  );
}
