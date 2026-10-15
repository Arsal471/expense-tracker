import { memo, useState, useCallback } from "react";
import EditExpenseModal from "./EditExpenseModal";
import { getCategory } from "../constants/categories";
import { formatDate, formatMoney } from "../utils/helpers";

function ExpenseList({ expenses, hasAnyExpense, onDelete, onEdit }) {
  // Which expense is being edited? null = none (modal closed)
  const [editing, setEditing] = useState(null);

  const closeModal = useCallback(() => setEditing(null), []);

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {hasAnyExpense
          ? "🔍 No expenses match these filters"
          : "📝 No expenses yet — add your first one!"}
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {expenses.map((expense) => {
          const cat = getCategory(expense.category);
          return (
            <li
              key={expense.id}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-indigo-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-500/40"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-xl shadow-sm dark:bg-slate-800">
                {cat.emoji}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{expense.title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className={"rounded-full px-2 py-0.5 font-medium " + cat.color}>
                    {cat.name}
                  </span>
                  <span>{formatDate(expense.date)}</span>
                </div>
              </div>

              <p className="shrink-0 font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                {formatMoney(expense.amount)}
              </p>

              <div className="flex shrink-0 gap-1 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                <button
                  onClick={() => setEditing(expense)}
                  className="rounded-lg p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                  aria-label="Edit"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="rounded-lg p-1.5 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                  aria-label="Delete"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* render the modal only while an expense is being edited */}
      {editing && (
        <EditExpenseModal
          expense={editing}
          onClose={closeModal}
          onSave={(data) => {
            onEdit(editing.id, data);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

export default memo(ExpenseList);
