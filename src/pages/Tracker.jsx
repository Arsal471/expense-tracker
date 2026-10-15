import { useReducer, useEffect, useMemo, useState, useCallback } from "react";
import Balance from "../components/Balance";
import ExpenseList from "../components/ExpenseList";
import AddExpense from "../components/AddExpense";
import Filters from "../components/Filters";
import MonthlySummary from "../components/MonthlySummary";
import { useAuth } from "../context/AuthContext";
import { today, formatMoney } from "../utils/helpers";
import { cardClass } from "../constants/styles";

// Expense shape: { id, title, amount, category, date: "2026-10-15" }
function expenseReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload];
    case "DELETE":
      return state.filter((expense) => expense.id !== action.id);
    case "EDIT":
      // payload = { id, title, amount, category, date } — spread to overwrite fields
      return state.map((expense) =>
        expense.id === action.payload.id
          ? { ...expense, ...action.payload }
          : expense,
      );
    case "CLEAR_ALL":
      return [];
    default:
      return state;
  }
}

// 🔄 Older expenses had no category/date — give them defaults.
// Defaults first, then ...expense — real values win when present
// 🔐 Each user gets their own storage key: "expenses_<uid>"
// uid = Firebase's unique ID for each user
function loadExpenses(uid) {
  let saved = localStorage.getItem("expenses_" + uid);

  // 📦 Migrate pre-login data (key: "expenses") to the first user who logs in
  if (saved === null && localStorage.getItem("expenses") !== null) {
    saved = localStorage.getItem("expenses");
    localStorage.removeItem("expenses");
  }

  const list = saved ? JSON.parse(saved) : [];
  return list.map((expense) => ({
    category: "Other",
    date: new Date(expense.id).toISOString().slice(0, 10), // id was created with Date.now()
    ...expense,
    amount: Number(expense.amount) || 0, // 🩹 turn null/NaN amounts into 0
  }));
}

function Tracker({ uid }) {
  const [expenses, dispatch] = useReducer(expenseReducer, uid, loadExpenses);

  // 🔍 Filter state
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState(""); // "" = all months

  useEffect(() => {
    localStorage.setItem("expenses_" + uid, JSON.stringify(expenses));
  }, [expenses, uid]);

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const highest = useMemo(
    () => (expenses.length ? Math.max(...expenses.map((e) => e.amount)) : 0),
    [expenses],
  );

  const monthTotal = useMemo(() => {
    const thisMonth = today().slice(0, 7);
    return expenses
      .filter((e) => e.date.startsWith(thisMonth))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Apply filters + sort newest first
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(
        (e) =>
          (categoryFilter === "All" || e.category === categoryFilter) &&
          (monthFilter === "" || e.date.startsWith(monthFilter)),
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }, [expenses, categoryFilter, monthFilter]);

  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // data = { title, amount, category, date } (from ExpenseForm)
  const addExpense = useCallback((data) => {
    dispatch({ type: "ADD", payload: { id: Date.now(), ...data } });
  }, []);

  const deleteExpense = useCallback((id) => {
    dispatch({ type: "DELETE", id });
  }, []);

  const editExpense = useCallback((id, data) => {
    dispatch({ type: "EDIT", payload: { id, ...data } });
  }, []);

  const resetFilters = useCallback(() => {
    setCategoryFilter("All");
    setMonthFilter("");
  }, []);

  return (
    <>
      <Balance total={total} monthTotal={monthTotal} highest={highest} />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* ⬅️ Left column */}
        <div className="space-y-6">
          <AddExpense onAdd={addExpense} />
          <MonthlySummary
            expenses={expenses}
            selectedMonth={monthFilter}
            onSelectMonth={setMonthFilter}
          />
        </div>

        {/* ➡️ Right column */}
        <section className={cardClass}>
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              🧾 Expenses
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? "expense" : "expenses"} ·{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {formatMoney(filteredTotal)}
              </span>
            </p>
          </div>

          <Filters
            category={categoryFilter}
            month={monthFilter}
            onCategoryChange={setCategoryFilter}
            onMonthChange={setMonthFilter}
            onReset={resetFilters}
          />

          <ExpenseList
            expenses={filteredExpenses}
            hasAnyExpense={expenses.length > 0}
            onDelete={deleteExpense}
            onEdit={editExpense}
          />

          {expenses.length > 0 && (
            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  if (confirm("Delete all expenses? This cannot be undone.")) {
                    dispatch({ type: "CLEAR_ALL" });
                  }
                }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                🗑️ Clear All
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

// key={user.uid}: remount Tracker when the user changes (so one user never sees another's data)
function TrackerPage() {
  const { user } = useAuth();
  return <Tracker key={user.uid} uid={user.uid} />;
}

export default TrackerPage;
