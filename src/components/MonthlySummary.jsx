import { useMemo } from "react";
import { formatMoney, formatMonth } from "../utils/helpers";
import { cardClass } from "../constants/styles";

// 📊 Total per month. Clicking a month filters the list to that month
function MonthlySummary({ expenses, selectedMonth, onSelectMonth }) {
  const months = useMemo(() => {
    // group with reduce: { "2026-10": { total, count }, ... }
    const groups = expenses.reduce((acc, e) => {
      const key = e.date.slice(0, 7); // "2026-10-15" → "2026-10"
      if (!acc[key]) acc[key] = { total: 0, count: 0 };
      acc[key].total += e.amount;
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.entries(groups)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month)); // newest month first
  }, [expenses]);

  const max = Math.max(...months.map((m) => m.total), 1);

  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        📅 Monthly Summary
      </h2>

      {months.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No data yet</p>
      ) : (
        <ul className="space-y-1">
          {months.map((m) => {
            const active = m.month === selectedMonth;
            return (
              <li key={m.month}>
                <button
                  onClick={() => onSelectMonth(active ? "" : m.month)}
                  className={
                    "w-full rounded-lg p-2 text-left transition " +
                    (active
                      ? "bg-indigo-50 ring-1 ring-indigo-300 dark:bg-indigo-500/10 dark:ring-indigo-500/40"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800")
                  }
                >
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{formatMonth(m.month)}</span>
                    <span className="font-semibold tabular-nums">{formatMoney(m.total)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: (m.total / max) * 100 + "%" }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {m.count} {m.count === 1 ? "expense" : "expenses"}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default MonthlySummary;
