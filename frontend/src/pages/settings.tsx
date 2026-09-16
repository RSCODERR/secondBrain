import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { BrainIcon } from "../icons/brainIcon";
import { MenuIcon } from "../icons/menuIcon";
import { LogoutIcon } from "../icons/logoutIcon";
import { EyeopenIcon } from "../icons/eyeopenIcon";
import { EyeoffIcon } from "../icons/eyeoffIcon";
import "../App.css";

/* ─── tiny helper: debounce ─── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─── availability states ─── */
type AvailStatus = "idle" | "checking" | "available" | "taken" | "self" | "error";

export default function Settings() {
  const { user, logout, updateUsername } = useAuth();
  const navigate = useNavigate();

  /* ── sidebar open state (mobile) ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ══════════════════════════════
     Change Username section
  ══════════════════════════════ */
  const [newUsername, setNewUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<AvailStatus>("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);

  const debouncedUsername = useDebounce(newUsername.trim().toLowerCase(), 500);

  /* Check availability whenever debounced value changes */
  useEffect(() => {
    const trimmed = debouncedUsername;
    if (!trimmed) {
      setUsernameStatus("idle");
      return;
    }
    if (trimmed === user?.username?.toLowerCase()) {
      setUsernameStatus("self");
      return;
    }
    if (trimmed.length < 4 || trimmed.length > 25) {
      setUsernameStatus("idle");
      return;
    }

    let cancelled = false;
    setUsernameStatus("checking");

    axios
      .get(`${BACKEND_URL}/api/v1/check-username`, {
        params: { username: trimmed },
      })
      .then((res) => {
        if (!cancelled) {
          setUsernameStatus(res.data.available ? "available" : "taken");
        }
      })
      .catch(() => {
        if (!cancelled) setUsernameStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedUsername, user?.username]);

  const handleSaveUsername = async () => {
    setUsernameError(null);
    setUsernameSuccess(null);

    const trimmed = newUsername.trim().toLowerCase();
    if (!trimmed) {
      setUsernameError("Please enter a new username.");
      return;
    }
    if (trimmed === user?.username?.toLowerCase()) {
      setUsernameError("That is already your current username.");
      return;
    }
    if (trimmed.length < 4 || trimmed.length > 25) {
      setUsernameError("Username must be between 4 and 25 characters.");
      return;
    }
    if (usernameStatus !== "available") {
      setUsernameError("Please wait for availability check or choose a different username.");
      return;
    }

    try {
      setSavingUsername(true);
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/user/username`,
        { newUsername: trimmed },
        { withCredentials: true }
      );
      updateUsername(res.data.username);
      setUsernameSuccess(`Username changed to @${res.data.username} successfully!`);
      setNewUsername("");
      setUsernameStatus("idle");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setUsernameError(err.response?.data?.error || "Failed to update username.");
      } else {
        setUsernameError("An unexpected error occurred.");
      }
    } finally {
      setSavingUsername(false);
    }
  };

  /* ══════════════════════════════
     Delete Account section
  ══════════════════════════════ */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showDeleteConfirm) {
      setTimeout(() => deleteInputRef.current?.focus(), 100);
    } else {
      setDeletePassword("");
      setDeleteError(null);
      setShowDeletePassword(false);
    }
  }, [showDeleteConfirm]);

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm.");
      return;
    }

    try {
      setDeletingAccount(true);
      await axios.delete(`${BACKEND_URL}/api/v1/user`, {
        data: { password: deletePassword },
        withCredentials: true,
      });
      // Clear auth state then redirect
      await logout();
      navigate("/signin", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setDeleteError(err.response?.data?.error || "Failed to delete account.");
      } else {
        setDeleteError("An unexpected error occurred.");
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  /* ── availability badge ── */
  const renderBadge = useCallback(() => {
    const trimmed = newUsername.trim();
    if (!trimmed || trimmed.length < 4) return null;

    if (usernameStatus === "checking") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
          <span className="w-3.5 h-3.5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin inline-block" />
          Checking…
        </span>
      );
    }
    if (usernameStatus === "available") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Available
        </span>
      );
    }
    if (usernameStatus === "taken") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Already taken
        </span>
      );
    }
    if (usernameStatus === "self") {
      return (
        <span className="text-xs text-stone-400 font-medium">That's your current username</span>
      );
    }
    return null;
  }, [newUsername, usernameStatus]);

  return (
    <div className="min-h-screen bg-slate-50/70 w-full">
      {/* ── Mobile sidebar backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`h-screen bg-white border-r-2 border-gray-200 w-72 fixed left-0 top-0 px-5 py-6 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
        }`}
      >
        <div>
          <div className="flex text-2xl sm:text-3xl items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 hover:cursor-pointer select-none"
            >
              <div className="text-purple-600"><BrainIcon /></div>
              <div className="font-semibold text-gray-900">Second Brain</div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900 lg:hidden cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="pt-8 flex flex-col gap-1.5">
            <Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex gap-4 py-2 cursor-pointer rounded-md px-3 transition-all duration-200 ease-in-out text-gray-800 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              Dashboard
            </Link>

            {/* Settings — active */}
            <div className="flex gap-4 py-2 cursor-default rounded-md px-3 bg-purple-100 text-purple-700 font-medium">
              <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Account Settings
            </div>
          </nav>
        </div>

        {/* Bottom: user info + logout */}
        <div className="border-t border-gray-200 pt-4 flex flex-col gap-2">
          {user && (
            <div className="px-3 py-1 text-xs text-gray-500 truncate">
              Signed in as <span className="font-semibold text-gray-800">@{user.username}</span>
            </div>
          )}
          <button
            onClick={() => { logout(); }}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium cursor-pointer border border-transparent hover:border-red-200"
          >
            <LogoutIcon size="md" />
            <span className="text-sm font-semibold">Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="ml-0 lg:ml-72 min-h-screen p-4 md:p-6 lg:p-8 transition-all duration-300">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer shadow-xs transition"
              aria-label="Open Navigation Menu"
            >
              <MenuIcon size="md" />
            </button>
            <div className="flex items-center gap-2 text-xl font-bold text-gray-900 select-none">
              <span className="text-[#2d4a31]"><BrainIcon /></span>
              <span>Second Brain</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50 text-red-600 cursor-pointer shadow-xs transition"
            aria-label="Logout"
          >
            <LogoutIcon size="md" />
          </button>
        </header>

        {/* Page heading */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage your account details and preferences
          </p>
        </div>

        <div className="max-w-2xl flex flex-col gap-5">

          {/* ── Current account info card ── */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2d4a31]/10 border border-[#2d4a31]/20 flex items-center justify-center text-[#2d4a31] font-bold text-lg shrink-0">
              {user?.username?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-gray-900 truncate">@{user?.username}</div>
              <div className="text-xs text-stone-500 mt-0.5">Your Second Brain account</div>
            </div>
          </div>

          {/* ══════════════════════════════
               Change Username card
          ══════════════════════════════ */}
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 className="text-base font-semibold text-gray-800">Change Username</h2>
              <p className="text-xs text-stone-500 mt-0.5">Pick a new unique username for your account</p>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">

              {/* Input + badge */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                  New Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </span>
                  <input
                    id="new-username-input"
                    type="text"
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      setUsernameError(null);
                      setUsernameSuccess(null);
                    }}
                    placeholder={`Current: @${user?.username}`}
                    maxLength={25}
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-stone-900 bg-white border border-stone-200 rounded-xl transition-all duration-200 placeholder:text-stone-400 hover:border-stone-300 focus:outline-none focus:border-[#4a7a50] focus:ring-4 focus:ring-[#4a7a50]/10 shadow-xs"
                  />
                </div>
                {/* Availability badge */}
                <div className="mt-2 h-5 flex items-center">
                  {renderBadge()}
                </div>
              </div>

              {/* Feedback messages */}
              {usernameError && (
                <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                  </svg>
                  {usernameError}
                </div>
              )}
              {usernameSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {usernameSuccess}
                </div>
              )}

              {/* Save button */}
              <button
                id="save-username-btn"
                onClick={handleSaveUsername}
                disabled={savingUsername || usernameStatus === "taken" || usernameStatus === "checking" || usernameStatus === "self" || !newUsername.trim()}
                className="w-full sm:w-auto sm:self-start px-5 py-2.5 rounded-xl bg-[#2d4a31] hover:bg-[#243d28] text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {savingUsername ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Saving…
                  </span>
                ) : (
                  "Save Username"
                )}
              </button>
            </div>
          </div>

          {/* ══════════════════════════════
               Danger Zone card
          ══════════════════════════════ */}
          <div className="bg-white border border-red-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-red-100 bg-red-50/40">
              <h2 className="text-base font-semibold text-red-700">Danger Zone</h2>
              <p className="text-xs text-red-500 mt-0.5">These actions are permanent and cannot be undone</p>
            </div>
            <div className="px-5 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Delete Account</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Permanently deletes your account and all saved content
                  </div>
                </div>
                {!showDeleteConfirm && (
                  <button
                    id="delete-account-btn"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="shrink-0 px-4 py-2 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 hover:border-red-400 transition-all duration-200 cursor-pointer"
                  >
                    Delete Account
                  </button>
                )}
              </div>

              {/* Confirmation panel */}
              {showDeleteConfirm && (
                <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-3 animate-fade-in-up">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                    ⚠ This cannot be undone
                  </p>
                  <p className="text-sm text-red-600">
                    Enter your password to permanently delete <strong>@{user?.username}</strong> and all associated content.
                  </p>

                  {/* Password field */}
                  <div className="relative">
                    <input
                      ref={deleteInputRef}
                      id="delete-password-input"
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(null); }}
                      placeholder="Enter your password"
                      className="w-full pl-4 pr-11 py-2.5 text-sm text-stone-900 bg-white border border-red-200 rounded-xl transition-all duration-200 placeholder:text-stone-400 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-400/10"
                      onKeyDown={(e) => { if (e.key === "Enter") handleDeleteAccount(); }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 rounded-lg transition-colors cursor-pointer"
                      aria-label={showDeletePassword ? "Hide password" : "Show password"}
                    >
                      {showDeletePassword ? <EyeoffIcon /> : <EyeopenIcon />}
                    </button>
                  </div>

                  {deleteError && (
                    <div className="p-3 bg-white border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2 animate-fade-in-up">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                      </svg>
                      {deleteError}
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                    <button
                      id="cancel-delete-btn"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deletingAccount}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      id="confirm-delete-btn"
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount || !deletePassword}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {deletingAccount ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                          Deleting…
                        </span>
                      ) : (
                        "Yes, Delete My Account"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
