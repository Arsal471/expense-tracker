import { memo } from "react";
import { formatMoney } from "../utils/helpers";
import { cardClass } from "../constants/styles";

// 🤝 Who owes whom. Clicking a person filters the list to their loan entries.
// people = [{ name, net }] from getLoanPeople() — net > 0: they owe you, net < 0: you owe them
function LoansSummary({ people, youOwe, owedToYou, selectedPerson, onSelectPerson }) {
  const open = people.filter((p) => p.net !== 0); // still has money pending
  const settled = people.filter((p) => p.net === 0);

  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        🤝 Loans
      </h2>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-500/10">
          <p className="text-xs font-medium text-rose-700 dark:text-rose-300">You owe</p>
          <p className="text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400">
            {formatMoney(youOwe)}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Owed to you</p>
          <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatMoney(owedToYou)}
          </p>
        </div>
      </div>

      {people.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No loans yet. Use the <span className="font-semibold">🤝 Loan</span> tab to add one.
        </p>
      ) : (
        <ul className="space-y-1">
          {[...open, ...settled].map((p) => {
            const active = p.name === selectedPerson;
            return (
              <li key={p.name}>
                <button
                  onClick={() => onSelectPerson(active ? "" : p.name)}
                  className={
                    "flex w-full items-center gap-3 rounded-lg p-2 text-left transition " +
                    (active
                      ? "bg-amber-50 ring-1 ring-amber-300 dark:bg-amber-500/10 dark:ring-amber-500/40"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800")
                  }
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-sm font-bold uppercase text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                    {p.name[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {p.net > 0 ? "owes you" : p.net < 0 ? "you owe" : "settled ✓"}
                    </span>
                  </span>
                  {p.net !== 0 && (
                    <span
                      className={
                        "shrink-0 text-sm font-semibold tabular-nums " +
                        (p.net > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")
                      }
                    >
                      {formatMoney(Math.abs(p.net))}
                    </span>
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

export default memo(LoansSummary);
