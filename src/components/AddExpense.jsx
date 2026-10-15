import { memo } from "react";
import ExpenseForm from "./ExpenseForm";
import { today } from "../utils/helpers";
import { cardClass } from "../constants/styles";

function AddExpense({ onAdd, entries }) {
  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        ➕ New Entry
      </h2>
      {/* no submitLabel → the form shows "Add Expense" or "Add Income" itself */}
      <ExpenseForm
        initial={{
          type: "expense",
          title: "",
          amount: "",
          category: "Food",
          customCategory: "",
          date: today(),
        }}
        onSubmit={onAdd}
        entries={entries}
        resetAfterSubmit
      />
    </section>
  );
}

export default memo(AddExpense);
