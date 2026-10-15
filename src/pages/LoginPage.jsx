import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthError } from "../utils/authErrors";
import { inputClass, labelClass, primaryButton, cardClass } from "../constants/styles";

function LoginPage() {
  const { user, login, signup, loginWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false); // prevents double submits

  // Already logged in? Go straight to the tracker
  if (user) return <Navigate to="/" replace />;

  const isSignup = mode === "signup";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function switchMode() {
    setMode(isSignup ? "login" : "signup");
    setError("");
    setInfo("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (isSignup && form.name.trim() === "") return setError("Name is required");
    if (form.email.trim() === "") return setError("Email is required");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");

    setBusy(true);
    try {
      if (isSignup) await signup(form.name.trim(), form.email.trim(), form.password);
      else await login(form.email.trim(), form.password);
      // ✅ success: AuthContext sets the user and the <Navigate> above redirects
    } catch (err) {
      setError(getAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(getAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot() {
    setError("");
    setInfo("");
    if (form.email.trim() === "") return setError("Enter your email above first");
    try {
      await resetPassword(form.email.trim());
      setInfo("📧 Password reset link sent — check your inbox (and spam folder)");
    } catch (err) {
      setError(getAuthError(err));
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-sm">
      <div className="mb-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-3xl text-white shadow-lg">
          💸
        </span>
        <h1 className="mt-3 text-2xl font-bold">
          {isSignup ? "Create an account" : "Welcome back"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isSignup ? "Start tracking your income and expenses" : "Log in to see your budget"}
        </p>
      </div>

      <div className={cardClass}>
        <button
          onClick={handleGoogle}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <GoogleIcon /> {isSignup ? "Sign up" : "Log in"} with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /> or with email
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {isSignup && (
            <div>
              <label className={labelClass} htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange}
                placeholder="Your name" className={inputClass} />
            </div>
          )}
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" autoComplete="email" className={inputClass} />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <label className={labelClass} htmlFor="password">Password</label>
              {!isSignup && (
                <button type="button" onClick={handleForgot}
                  className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
                  Forgot password?
                </button>
              )}
            </div>
            <input id="password" name="password" type="password" value={form.password}
              onChange={handleChange} placeholder="••••••"
              autoComplete={isSignup ? "new-password" : "current-password"} className={inputClass} />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              ⚠️ {error}
            </p>
          )}
          {info && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              {info}
            </p>
          )}

          <button type="submit" disabled={busy} className={primaryButton + " w-full disabled:opacity-60"}>
            {busy ? "Please wait..." : isSignup ? "Create Account" : "Log In"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button onClick={switchMode} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
          {isSignup ? "Log in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default LoginPage;
