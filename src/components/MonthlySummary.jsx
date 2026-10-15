import { useMemo } from "react";
import { formatMoney, formatMonth } from "../utils/helpers";
import { cardClass } from "../constants/styles";
import { isLoan } from "../constants/categories";

// 📊 Income vs expenses (and savings) per month. Clicking a month filters the list to that month
function MonthlySummary({ expenses, selectedMonth, onSelectMonth }) {
  const months = useMemo(() => {
    // group with reduce: { "2026-10": { income, expense, saving, withdrawal }, ... }
    const groups = expenses.reduce((acc, e) => {
      if (isLoan(e.type)) return acc; // loans aren't income or expenses — skip them
      const key = e.date.slice(0, 7); // "2026-10-15" → "2026-10"
      if (!acc[key]) acc[key] = { income: 0, expense: 0, saving: 0, withdrawal: 0 };
      acc[key][e.type] += e.amount; // "income", "expense", "saving" or "withdrawal"
      return acc;
    }, {});

    return Object.entries(groups)
      .map(([month, data]) => ({
        month,
        ...data,
        net: data.income - data.expense,
        saved: data.saving - data.withdrawal, // can be negative if you withdrew more
      }))
      .sort((a, b) => b.month.localeCompare(a.month)); // newest month first
  }, [expenses]);

  // biggest number across all months — used to size the bars
  const max = Math.max(...months.map((m) => Math.max(m.income, m.expense)), 1);

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
                    <span
                      className={
                        "font-semibold tabular-nums " +
                        (m.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")
                      }
                      title="Income − expenses"
                    >
                      {m.net > 0 ? "+" : ""}
                      {formatMoney(m.net)}
                    </span>
                  </div>

                  <Bar label="In" value={m.income} max={max} color="bg-emerald-500" />
                  <Bar label="Out" value={m.expense} max={max} color="bg-rose-500" />
                  {/* only show the savings bar for months that had savings activity */}
                  {(m.saving > 0 || m.withdrawal > 0) && (
                    <Bar label="Saved" value={m.saved} max={max} color="bg-sky-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Bar({ label, value, max, color }) {
  return (
    <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <span className="w-9">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={"h-full rounded-full " + color}
          style={{ width: (Math.max(value, 0) / max) * 100 + "%" }}
        />
      </div>
      <span className="w-20 text-right tabular-nums">{formatMoney(value)}</span>
    </div>
  );
}

export default MonthlySummary;
