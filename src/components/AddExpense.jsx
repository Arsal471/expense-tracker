import { memo } from "react";
import ExpenseForm from "./ExpenseForm";
import { today } from "../utils/helpers";
import { cardClass } from "../constants/styles";

function AddExpense({ onAdd }) {
  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        ➕ New Expense
      </h2>
      <ExpenseForm
        initial={{ title: "", amount: "", category: "Food", date: today() }}
        submitLabel="Add Expense"
        onSubmit={onAdd}
        resetAfterSubmit
      />
    </section>
  );
}

export default memo(AddExpense);
