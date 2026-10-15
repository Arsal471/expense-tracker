import { useEffect } from "react";
import { formatMoney } from "../utils/helpers";

// 🔔 Small coloured message at the top for 2 seconds after saving an entry
// toast = { entry, action: "added" | "updated", key } — key changes every time, so a new toast restarts
const COLORS = {
  expense: "bg-rose-600",
  income: "bg-emerald-600",
  saving: "bg-sky-600",
  withdrawal: "bg-sky-600",
  borrow: "bg-amber-500",
  lend: "bg-amber-500",
  repay: "bg-amber-500",
  collect: "bg-amber-500",
};

// What the toast says for each type
function message({ type, title, amount, category }) {
  const rs = formatMoney(amount);
  return {
    expense: `➖ Expense added · ${title} · ${rs}`,
    income: `➕ Income added · ${title} · ${rs}`,
    saving: `🏦 ${rs} saved to ${category}`,
    withdrawal: `🏦 ${rs} withdrawn from ${category}`,
    borrow: `🤝 Borrowed ${rs} from ${category}`,
    lend: `🤝 Lent ${rs} to ${category}`,
    repay: `🤝 Repaid ${rs} to ${category}`,
    collect: `🤝 ${category} repaid you ${rs}`,
  }[type];
}

function Toast({ toast, onDone }) {
  // ⏱️ hide after 2 seconds (and clear the timer if a new toast comes first)
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onDone, 2000);
    return () => clearTimeout(id);
  }, [toast, onDone]);

  if (!toast) return null;

  const text =
    toast.action === "updated" ? `✏️ Updated · ${toast.entry.title}` : message(toast.entry);

  return (
    <div
      key={toast.key} // new key → React makes a fresh element → the animation plays again
      role="status"
      aria-live="polite"
      className={
        "toast-anim fixed left-1/2 top-4 z-[60] w-[min(92vw,26rem)] rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg " +
        COLORS[toast.entry.type]
      }
      style={{ top: "max(1rem, env(safe-area-inset-top))" }} // stay below the phone's notch
    >
      {text}
    </div>
  );
}

export default Toast;
