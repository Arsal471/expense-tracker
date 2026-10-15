import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import InstallButton from "./InstallButton";

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // No display name (email-only user)? Use the part before @
  // user?. = optional chaining: returns undefined if user is null
  const name = user?.displayName || user?.email?.split("@")[0];

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-xl text-white shadow">
          💸
        </span>
        <div>
          <h1 className="text-xl font-bold leading-tight">Budget Tracker</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user ? `Hi, ${name} 👋` : "Track your money in and out"}
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-2">
        <InstallButton />
        <button
          onClick={toggleTheme}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {user && (
          <div className="ml-2 flex items-center gap-2 border-l border-slate-300 pl-3 dark:border-slate-700">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full" />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-sm font-bold uppercase text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {name?.[0]}
              </span>
            )}
            <button
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
