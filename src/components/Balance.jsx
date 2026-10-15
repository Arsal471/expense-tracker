import { formatMoney } from "../utils/helpers";

// 3 summary cards — values come from the parent via props
function Balance({ total, monthTotal, highest }) {
  const cards = [
    { label: "Total Spent", value: total, accent: "text-rose-600 dark:text-rose-400" },
    { label: "This Month", value: monthTotal, accent: "text-indigo-600 dark:text-indigo-400" },
    { label: "Largest Expense", value: highest, accent: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <p className={"mt-1 text-2xl font-bold tabular-nums " + card.accent}>
            {formatMoney(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Balance;
