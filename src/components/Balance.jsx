import { formatMoney, formatDate } from "../utils/helpers";

// 6 summary cards in two rows — values come from the parent via props
// Row 1: where your money is   (total = current + savings)
// Row 2: this month / this week
function Balance({ total, current, savings, monthIncome, monthExpense, weekExpense, weekStart, monthName }) {
  // "2026-10-12" → "12 Oct" (drop the year — it's always this week)
  const since = formatDate(weekStart).split(" ").slice(0, 2).join(" ");

  const green = "text-emerald-600 dark:text-emerald-400";
  const red = "text-rose-600 dark:text-rose-400";

  const balanceCards = [
    {
      label: "Total Balance",
      value: total,
      accent: total >= 0 ? "text-slate-900 dark:text-white" : red,
      hint: `${formatMoney(current)} current + ${formatMoney(savings)} savings`,
      big: true,
    },
    {
      label: "Current Balance",
      value: current,
      // red when you've spent more than you have
      accent: current >= 0 ? green : red,
      hint: "Available to spend",
    },
    {
      label: "Savings",
      value: savings,
      accent: "text-sky-600 dark:text-sky-400",
      hint: "Put aside so far",
    },
  ];

  const activityCards = [
    { label: "Income", value: monthIncome, accent: green, hint: monthName },
    { label: "Expenses", value: monthExpense, accent: red, hint: monthName },
    {
      label: "Spent This Week",
      value: weekExpense,
      accent: "text-amber-600 dark:text-amber-400",
      hint: `Since Mon, ${since}`,
    },
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* on phones: Total on its own row, Current + Savings side by side */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
        {balanceCards.map((card) => (
          <div key={card.label} className={card.big ? "col-span-2 sm:col-span-1" : ""}>
            <Card card={card} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {activityCards.map((card) => (
          <Card key={card.label} card={card} small />
        ))}
      </div>
    </div>
  );
}

function Card({ card, small }) {
  return (
    <div
      className={
        "rounded-2xl border bg-white shadow-sm dark:bg-slate-900 " +
        (card.big
          ? "border-indigo-200 ring-1 ring-indigo-100 dark:border-indigo-500/40 dark:ring-indigo-500/20 "
          : "border-slate-200 dark:border-slate-800 ") +
        (small ? "p-3 sm:p-4" : "h-full p-4 sm:p-5")
      }
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {card.label}
      </p>
      <p
        className={
          "mt-1 font-bold tabular-nums " +
          (small ? "text-base sm:text-xl " : card.big ? "text-2xl " : "text-xl sm:text-2xl ") +
          card.accent
        }
      >
        {formatMoney(card.value)}
      </p>
      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{card.hint}</p>
    </div>
  );
}

export default Balance;
