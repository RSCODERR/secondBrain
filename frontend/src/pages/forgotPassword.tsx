import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Button } from "../components/button";
import { AuthLayout } from "../components/AuthLayout";
import { LockIcon } from "../icons/lockIcon";
import { EyeopenIcon } from "../icons/eyeopenIcon";
import { EyeoffIcon } from "../icons/eyeoffIcon";
import "../App.css";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Password strength logic
  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 10) score += 1;
    if (/[0-9]/.test(newPassword) && /[a-zA-Z]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["Too short", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = [
    "bg-stone-300 dark:bg-stone-700",
    "bg-red-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-emerald-600",
  ];

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Step 1: Request Password Reset
  async function handleRequestReset(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your account email address");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/v1/forgot-password`, {
        email: cleanEmail,
      });

      setStep("reset");
      setResendCooldown(60);
      setResendSuccess(res.data?.msg || "If an account exists, a reset code has been sent.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to send reset code. Please try again.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Submit Reset Password with OTP
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword.length > 25) {
      setError("Password cannot exceed 25 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/v1/reset-password`, {
        email: email.trim().toLowerCase(),
        code: cleanCode,
        newPassword,
      });

      setStep("success");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to reset password. Please check your code.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendCode() {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    setResendSuccess(null);

    try {
      setResending(true);
      const res = await axios.post(`${BACKEND_URL}/api/v1/forgot-password`, {
        email: email.trim().toLowerCase(),
      });
      setResendSuccess(res.data?.msg || "A fresh reset code has been sent!");
      setResendCooldown(60);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Could not resend code. Please try again.");
      }
    } finally {
      setResending(false);
    }
  }

  // Success Screen
  if (step === "success") {
    return (
      <AuthLayout
        activeTab="signin"
        title="Password Updated"
        subtitle="Your password has been changed successfully"
        footer={
          <p className="text-stone-600 dark:text-stone-400">
            Need help?{" "}
            <Link to="/signin" className="text-[#3a5e40] dark:text-emerald-400 font-semibold hover:underline">
              Back to Sign In
            </Link>
          </p>
        }
      >
        <div className="text-center py-6 space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm animate-bounce-short">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              You're all set!
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-xs mx-auto">
              Your Second Brain password has been updated. You can now sign in using your new credentials.
            </p>
          </div>
          <div className="pt-3">
            <Button
              varient="primary"
              size="lg"
              text="Proceed to Sign In"
              fullWidth
              onClick={() => navigate("/signin")}
            />
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Step 2 Screen: Enter OTP & New Password
  if (step === "reset") {
    return (
      <AuthLayout
        activeTab="signin"
        title="Reset your password"
        subtitle={`Enter the 6-digit code sent to ${email}`}
        footer={
          <p className="text-stone-600 dark:text-stone-400">
            Wrong email address?{" "}
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setError(null);
                setCode("");
              }}
              className="text-[#3a5e40] dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              Change email
            </button>
          </p>
        }
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="text-center pb-1">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-2.5">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Check your inbox for the 6-digit verification code
            </p>
          </div>

          {/* OTP Code */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2 text-center">
              6-Digit Reset Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setCode(val);
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

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none">
                <LockIcon size="sm" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="At least 6 characters"
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

            {/* Password Strength Meter */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1.5 animate-fade-in-up">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500 dark:text-stone-400">Password strength:</span>
                  <span className="font-semibold text-stone-700 dark:text-stone-200">
                    {strengthLabels[strength]}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((stepVal) => (
                    <div
                      key={stepVal}
                      className={`h-full rounded-full transition-all duration-300 ${
                        strength >= stepVal ? strengthColors[strength] : "bg-stone-100 dark:bg-stone-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
              Confirm New Password
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
                placeholder="Re-enter new password"
                autoCapitalize="none"
                autoCorrect="off"
                className={`w-full pl-10 pr-11 py-2.5 text-[16px] sm:text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:ring-4 shadow-xs ${
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
            {confirmPassword && !passwordsMatch && (
              <span className="text-[11px] text-red-500 dark:text-red-400 mt-1 block">
                Passwords do not match
              </span>
            )}
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

          <div className="pt-2">
            <Button
              varient="primary"
              size="lg"
              text={loading ? "Updating Password..." : "Update Password"}
              type="submit"
              fullWidth
              loading={loading}
            />
          </div>

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

  // Step 1 Screen: Request Reset
  return (
    <AuthLayout
      activeTab="signin"
      title="Forgot Password?"
      subtitle="Enter your email to receive a password reset code"
      footer={
        <p className="text-stone-600 dark:text-stone-400">
          Remember your password?{" "}
          <Link
            to="/signin"
            className="text-[#3a5e40] dark:text-emerald-400 font-semibold hover:text-[#2d4a31] dark:hover:text-emerald-300 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleRequestReset} className="space-y-4">
        <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2.5">
          <div className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <span>
            We will send a secure 6-digit OTP code to your registered email address that expires in 15 minutes.
          </span>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
            Registered Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. alex@example.com"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-10 pr-4 py-2.5 text-[16px] sm:text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:border-[#4a7a50] dark:focus:border-emerald-500 focus:ring-4 focus:ring-[#4a7a50]/10 dark:focus:ring-emerald-500/15 shadow-xs"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium animate-fade-in-up">
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            varient="primary"
            size="md"
            text={loading ? "Sending Reset Code..." : "Send Reset Code"}
            fullWidth
            loading={loading}
          />
        </div>

        <div className="text-center pt-2">
          <Link
            to="/signin"
            className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
