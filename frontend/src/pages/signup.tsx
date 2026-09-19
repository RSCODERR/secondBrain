import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Button } from "../components/button";
import { AuthLayout } from "../components/AuthLayout";
import { UserIcon } from "../icons/userIcon";
import { LockIcon } from "../icons/lockIcon";
import { EyeopenIcon } from "../icons/eyeopenIcon";
import { EyeoffIcon } from "../icons/eyeoffIcon";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email verification step states
  const [step, setStep] = useState<"register" | "verify">("register");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedUsername.length < 4 || trimmedUsername.length > 25) {
      setError("Username must be between 4 and 25 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
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
        email: trimmedEmail,
        password: password,
      });

      if (res.status === 201) {
        setStep("verify");
        setResendCooldown(60);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.error || err.response?.data?.msg;
        setError(msg || "Failed to create account. Please check your details.");
      } else {
        setError("Network error. Please check your connection.");
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
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BACKEND_URL}/api/v1/verify-email`,
        {
          email: email.trim().toLowerCase(),
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
        setError("Network error. Please check your connection.");
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
        email: email.trim().toLowerCase(),
      });
      setResendSuccess(res.data?.msg || "Verification code resent!");
      setResendCooldown(60);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to resend verification code");
      }
    } finally {
      setResending(false);
    }
  }

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  // Step 2: OTP Email Verification Screen
  if (step === "verify") {
    return (
      <AuthLayout
        activeTab="signup"
        title="Check your inbox"
        subtitle={`We sent a 6-digit code to ${email}`}
        footer={
          <p className="text-stone-600 dark:text-stone-400">
            Entered the wrong email?{" "}
            <button
              type="button"
              onClick={() => {
                setStep("register");
                setError(null);
              }}
              className="text-[#3a5e40] dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              Go back and edit
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
              Enter the 6-digit verification code sent from <strong className="text-stone-700 dark:text-stone-200">Second Brain</strong>
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
            text="Verify & Launch Brain"
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

  // Step 1: Registration Form
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
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-10 pr-4 py-2.5 text-[16px] sm:text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:border-[#4a7a50] dark:focus:border-emerald-500 focus:ring-4 focus:ring-[#4a7a50]/10 dark:focus:ring-emerald-500/15 shadow-xs"
            />
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
            4-25 characters, letters and numbers
          </span>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
            Email Address
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
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-10 pr-4 py-2.5 text-[16px] sm:text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:border-[#4a7a50] dark:focus:border-emerald-500 focus:ring-4 focus:ring-[#4a7a50]/10 dark:focus:ring-emerald-500/15 shadow-xs"
            />
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
            We'll send a 6-digit verification code to this address
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
