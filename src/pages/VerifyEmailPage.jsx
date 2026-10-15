import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAuthError } from "../utils/authErrors";
import { primaryButton, secondaryButton, cardClass } from "../constants/styles";

const COOLDOWN = 60; // seconds before "Resend" can be clicked again

function VerifyEmailPage() {
  const { user, resendVerification, reloadUser, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // ⏱️ Count down once per second while cooldown > 0
  useEffect(() => {
    if (cooldown === 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id); // 🧹 cleanup
  }, [cooldown]);

  // 🔄 When the user comes back to this tab (after clicking the link in their inbox),
  // quietly check whether the email is verified now.
  useEffect(() => {
    function handleFocus() {
      reloadUser().catch(() => {});
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [reloadUser]);

  async function handleCheck() {
    setError("");
    setMessage("");
    setChecking(true);
    try {
      const verified = await reloadUser();
      // If verified, ProtectedRoute re-renders and shows the tracker automatically
      if (!verified) setError("Not verified yet — click the link in your email first.");
    } catch (err) {
      setError(getAuthError(err));
    } finally {
      setChecking(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    try {
      await resendVerification();
      setMessage("📧 New verification email sent. Check your inbox (and spam folder).");
      setCooldown(COOLDOWN);
    } catch (err) {
      setError(getAuthError(err));
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-md">
      <div className={cardClass + " text-center"}>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-100 text-3xl dark:bg-indigo-500/20">
          📬
        </span>
        <h1 className="mt-4 text-xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          We sent a verification link to
          <br />
          <span className="font-semibold text-slate-800 dark:text-slate-100">{user.email}</span>
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Click the link in that email, then come back here.
        </p>

        {message && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            ⚠️ {error}
          </p>
        )}

        <div className="mt-5 space-y-2">
          <button onClick={handleCheck} disabled={checking} className={primaryButton + " w-full disabled:opacity-60"}>
            {checking ? "Checking..." : "I've verified my email"}
          </button>
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className={secondaryButton + " w-full disabled:cursor-not-allowed disabled:opacity-60"}
          >
            {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend verification email"}
          </button>
        </div>

        <button
          onClick={logout}
          className="mt-4 text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          Wrong email? Log out and sign up again
        </button>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
