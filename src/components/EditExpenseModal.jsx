import { useEffect } from "react";
import ExpenseForm from "./ExpenseForm";

// 🪟 Edit popup (modal) — replaces the old prompt()
function EditExpenseModal({ expense, onSave, onClose }) {
  // Close on Escape — and remove the listener in cleanup 🧹
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose} // click outside = close
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()} // clicks inside should not close it
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-4 text-lg font-bold">✏️ Edit Expense</h2>
        <ExpenseForm
          initial={{
            title: expense.title,
            amount: String(expense.amount),
            category: expense.category,
            date: expense.date,
          }}
          submitLabel="Save Changes"
          onSubmit={onSave}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

export default EditExpenseModal;
