import { useState, useEffect, type FormEvent } from "react";
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
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email verification step if account is not yet verified
  const [step, setStep] = useState<"login" | "verify">("login");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setError("Please enter your username or email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BACKEND_URL}/api/v1/signin`,
        {
          identifier: trimmedIdentifier,
          password: password,
          rememberMe: rememberMe,
        },
        { withCredentials: true }
      );

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      await checkAuth();
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (err.response?.status === 403 && data?.requiresVerification) {
          setUnverifiedEmail(data.email || trimmedIdentifier);
          setStep("verify");
          setResendCooldown(60);
          setError("Your email address is not yet verified. A fresh 6-digit code was sent.");
        } else if (err.response?.status === 401) {
          setError("Invalid username/email or password. Please try again.");
        } else {
          setError(data?.error || data?.msg || "Failed to sign in. Please check your details.");
        }
      } else {
        setError("Network error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BACKEND_URL}/api/v1/verify-email`,
        {
          email: unverifiedEmail.trim().toLowerCase(),
          code: trimmedOtp,
        },
        { withCredentials: true }
      );

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (res.data?.verified) {
        await checkAuth();
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Invalid or expired verification code");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    setResendSuccess(null);

    try {
      setResending(true);
      const res = await axios.post(`${BACKEND_URL}/api/v1/resend-verification`, {
        email: unverifiedEmail.trim().toLowerCase(),
      });
      setResendSuccess(res.data?.msg || "Verification code resent!");
      setResendCooldown(60);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to resend code");
      }
    } finally {
      setResending(false);
    }
  }

  if (step === "verify") {
    return (
      <AuthLayout
        activeTab="signin"
        title="Verify your email"
        subtitle={`Enter the 6-digit code sent to ${unverifiedEmail}`}
        footer={
          <p className="text-stone-600 dark:text-stone-400">
            Need to sign in as a different user?{" "}
            <button
              type="button"
              onClick={() => {
                setStep("login");
                setError(null);
              }}
              className="text-[#3a5e40] dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              Back to sign in
            </button>
          </p>
        }
      >
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="text-center pb-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-3">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Your account requires email verification before accessing your Second Brain.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2 text-center">
              Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setOtp(val);
                if (error) setError(null);
              }}
              placeholder="••••••"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full text-center text-2xl tracking-[12px] font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-stone-200 dark:border-emerald-900/60 rounded-xl py-3 focus:outline-none focus:border-[#4a7a50] dark:focus:border-emerald-500 focus:ring-4 focus:ring-[#4a7a50]/10 shadow-xs"
            />
          </div>

          {resendSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
              {resendSuccess}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <Button
            varient="primary"
            size="lg"
            text="Verify & Enter Dashboard"
            type="submit"
            fullWidth
            loading={loading}
          />

          <div className="text-center pt-2">
            <button
              type="button"
              disabled={resendCooldown > 0 || resending}
              onClick={handleResendCode}
              className={`text-xs font-semibold ${
                resendCooldown > 0
                  ? "text-stone-400 dark:text-stone-600 cursor-not-allowed"
                  : "text-[#3a5e40] dark:text-emerald-400 hover:underline cursor-pointer"
              }`}
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : resending
                ? "Sending..."
                : "Didn't receive the code? Resend"}
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      activeTab="signin"
      title="Welcome back"
      subtitle="Sign in to resume organizing your digital memory"
      footer={
        <p className="text-stone-600 dark:text-stone-400">
          New to Second Brain?{" "}
          <Link
            to="/signup"
            className="text-[#3a5e40] dark:text-emerald-400 font-semibold hover:text-[#2d4a31] dark:hover:text-emerald-300 hover:underline transition-colors"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username or Email Field */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
            Username or Email
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none">
              <UserIcon size="sm" />
            </span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. johndoe or john@example.com"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-10 pr-4 py-2.5 text-[16px] sm:text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:border-[#4a7a50] dark:focus:border-emerald-500 focus:ring-4 focus:ring-[#4a7a50]/10 dark:focus:ring-emerald-500/15 shadow-xs"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-[#3a5e40] dark:text-emerald-400 hover:text-[#2d4a31] dark:hover:text-emerald-300 hover:underline cursor-pointer"
            >
              Forgot password?
            </Link>
          </div>
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
              placeholder="••••••••"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full pl-10 pr-11 py-2.5 text-[16px] sm:text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:border-[#4a7a50] dark:focus:border-emerald-500 focus:ring-4 focus:ring-[#4a7a50]/10 dark:focus:ring-emerald-500/15 shadow-xs"
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
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center pt-1">
          <label className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 dark:border-emerald-900/60 focus:ring-[#4a7a50] cursor-pointer accent-[#2d4a31] dark:accent-emerald-600"
            />
            <span>Keep me logged in for 7 days</span>
          </label>
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
            text={loading ? "Signing in..." : "Sign In"}
            fullWidth
            loading={loading}
          />
        </div>
      </form>
    </AuthLayout>
  );
}
