import { useReducer, useEffect, useMemo, useState, useCallback } from "react";
import Balance from "../components/Balance";
import ExpenseList from "../components/ExpenseList";
import AddExpense from "../components/AddExpense";
import Filters from "../components/Filters";
import MonthlySummary from "../components/MonthlySummary";
import LoansSummary from "../components/LoansSummary";
import BackupControls from "../components/BackupControls";
import { cleanEntry } from "../utils/backup";
import { useAuth } from "../context/AuthContext";
import { today, startOfWeek, formatMoney, formatMonth, sumBy, getBalances, getLoanPeople } from "../utils/helpers";
import { cardClass } from "../constants/styles";
import { isBuiltInCategory, isLoan } from "../constants/categories";

// Entry shape: { id, type, title, amount, category, date }
// type: "expense" | "income" | "saving" | "withdrawal" | "borrow" | "lend" | "repay" | "collect"
// (for loans, category = the person's name)
function expenseReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload];
    case "DELETE":
      return state.filter((expense) => expense.id !== action.id);
    case "EDIT":
      // payload = { id, type, title, amount, category, date } — spread to overwrite fields
      return state.map((expense) =>
        expense.id === action.payload.id
          ? { ...expense, ...action.payload }
          : expense,
      );
    case "IMPORT":
      // payload = entries from a backup file that aren't in the app yet
      return [...state, ...action.payload];
    case "CLEAR_ALL":
      return [];
    default:
      return state;
  }
}

// 🔄 Older entries had no type/category/date — give them defaults.
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
  return list.map(cleanEntry); // fills in missing type/category/date, fixes bad amounts
}

function Tracker({ uid, userName, email }) {
  const [expenses, dispatch] = useReducer(expenseReducer, uid, loadExpenses);

  // 🔍 Filter state
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "expense" | "income" | "savings" | "loans"
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState(""); // "" = all months

  useEffect(() => {
    localStorage.setItem("expenses_" + uid, JSON.stringify(expenses));
  }, [expenses, uid]);

  // 💰 { total, current, savings, ... } — see getBalances() in helpers.js
  const balances = useMemo(() => getBalances(expenses), [expenses]);

  // 🤝 Loan balance per person
  const loanPeople = useMemo(() => getLoanPeople(expenses), [expenses]);
  const loanPeopleNames = useMemo(
    () => loanPeople.map((p) => p.name).sort((a, b) => a.localeCompare(b)),
    [loanPeople],
  );

  // 📅 This month's income and expenses
  const thisMonth = today().slice(0, 7);
  const { monthIncome, monthExpense } = useMemo(() => {
    const inMonth = expenses.filter((e) => e.date.startsWith(thisMonth));
    return { monthIncome: sumBy(inMonth, "income"), monthExpense: sumBy(inMonth, "expense") };
  }, [expenses, thisMonth]);

  // 🗓️ Spent this week = expenses from Monday up to today
  // Dates are "YYYY-MM-DD" strings, so normal string comparison (>=, <=) works
  const weekStart = startOfWeek();
  const weekExpense = useMemo(() => {
    const end = today();
    return sumBy(
      expenses.filter((e) => e.date >= weekStart && e.date <= end),
      "expense",
    );
  }, [expenses, weekStart]);

  // Apply filters + sort newest first
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(
        (e) =>
          (typeFilter === "all" ||
            e.type === typeFilter ||
            // "savings" shows both money put in and money taken out
            (typeFilter === "savings" && (e.type === "saving" || e.type === "withdrawal")) ||
            (typeFilter === "loans" && isLoan(e.type))) &&
          (categoryFilter === "All" || e.category === categoryFilter) &&
          (monthFilter === "" || e.date.startsWith(monthFilter)),
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }, [expenses, typeFilter, categoryFilter, monthFilter]);

  // Summary of what's shown:
  //   Savings filter → net saved, Loans filter → net owed to you, otherwise income − expenses
  const shown = getBalances(filteredExpenses);
  const showingSavings = typeFilter === "savings";
  const showingLoans = typeFilter === "loans";
  const filteredNet = showingSavings
    ? shown.savings
    : showingLoans
      ? shown.owedToYou - shown.youOwe
      : shown.income - shown.expense;

  // data = { type, title, amount, category, date } (from ExpenseForm)
  const addExpense = useCallback((data) => {
    dispatch({ type: "ADD", payload: { id: Date.now(), ...data } });
  }, []);

  const importEntries = useCallback((entries) => {
    dispatch({ type: "IMPORT", payload: entries });
  }, []);

  const deleteExpense = useCallback((id) => {
    dispatch({ type: "DELETE", id });
  }, []);

  const editExpense = useCallback((id, data) => {
    dispatch({ type: "EDIT", payload: { id, ...data } });
  }, []);

  // 📄 PDF report of whatever the filters currently show.
  // import() loads the PDF library only when the button is clicked (keeps the app fast).
  const [exporting, setExporting] = useState(false);

  async function handleDownloadPdf() {
    setExporting(true);
    try {
      const { downloadReport } = await import("../utils/pdfReport");
      downloadReport({
        expenses: filteredExpenses,
        typeFilter,
        categoryFilter,
        monthFilter,
        userName,
        email,
      });
    } finally {
      setExporting(false);
    }
  }

  // Custom category names in use, per type (Set removes duplicates)
  // e.g. { expense: ["Gym", "Rent"], income: ["Tuition"], savings: ["Hajj"] }
  const customCategories = useMemo(() => {
    const customFor = (...types) =>
      [...new Set(expenses.filter((e) => types.includes(e.type)).map((e) => e.category))]
        .filter((name) => !isBuiltInCategory(name, types[0]))
        .sort();
    return {
      expense: customFor("expense"),
      income: customFor("income"),
      savings: customFor("saving", "withdrawal"),
    };
  }, [expenses]);

  // 🤝 Click a person in the Loans box → show only their loan entries
  const selectPerson = useCallback((name) => {
    setTypeFilter(name ? "loans" : "all");
    setCategoryFilter(name || "All");
  }, []);

  // Changing the type resets the category (it may not exist in the new type)
  const changeTypeFilter = useCallback((type) => {
    setTypeFilter(type);
    setCategoryFilter("All");
  }, []);

  const resetFilters = useCallback(() => {
    setTypeFilter("all");
    setCategoryFilter("All");
    setMonthFilter("");
  }, []);

  return (
    <>
      <Balance
        total={balances.total}
        current={balances.current}
        savings={balances.savings}
        monthIncome={monthIncome}
        monthExpense={monthExpense}
        weekExpense={weekExpense}
        weekStart={weekStart}
        monthName={formatMonth(thisMonth)}
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* ⬅️ Left column */}
        <div className="space-y-6">
          <AddExpense onAdd={addExpense} entries={expenses} />
          <LoansSummary
            people={loanPeople}
            youOwe={balances.youOwe}
            owedToYou={balances.owedToYou}
            selectedPerson={typeFilter === "loans" ? categoryFilter : ""}
            onSelectPerson={selectPerson}
          />
          <MonthlySummary
            expenses={expenses}
            selectedMonth={monthFilter}
            onSelectMonth={setMonthFilter}
          />
        </div>

        {/* ➡️ Right column */}
        <section className={cardClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              🧾 Transactions
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filteredExpenses.length} {filteredExpenses.length === 1 ? "entry" : "entries"} ·{" "}
                <span
                  className={
                    "font-semibold " +
                    (showingSavings
                      ? "text-sky-600 dark:text-sky-400"
                      : filteredNet >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400")
                  }
                  title={
                    showingSavings
                      ? "Saved − withdrawn for the entries shown"
                      : showingLoans
                        ? "Owed to you − you owe (for the entries shown)"
                        : "Income − expenses for the entries shown"
                  }
                >
                  {filteredNet > 0 ? "+" : ""}
                  {formatMoney(filteredNet)}
                </span>
              </p>
              <button
                onClick={handleDownloadPdf}
                disabled={filteredExpenses.length === 0 || exporting}
                title="Download a PDF of the entries shown below"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {exporting ? "Preparing..." : "⬇️ PDF"}
              </button>
            </div>
          </div>

          <Filters
            type={typeFilter}
            category={categoryFilter}
            month={monthFilter}
            customCategories={customCategories}
            loanPeople={loanPeopleNames}
            onTypeChange={changeTypeFilter}
            onCategoryChange={setCategoryFilter}
            onMonthChange={setMonthFilter}
            onReset={resetFilters}
          />

          <ExpenseList
            expenses={filteredExpenses}
            allEntries={expenses}
            hasAnyExpense={expenses.length > 0}
            onDelete={deleteExpense}
            onEdit={editExpense}
          />

          {/* 💾 Backup / Restore on the left, Clear All on the right */}
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <BackupControls uid={uid} entries={expenses} onImport={importEntries} />
            {expenses.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Delete ALL entries (income, expenses, savings and loans)? This cannot be undone.")) {
                    dispatch({ type: "CLEAR_ALL" });
                  }
                }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                🗑️ Clear All
              </button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

// key={user.uid}: remount Tracker when the user changes (so one user never sees another's data)
function TrackerPage() {
  const { user } = useAuth();
  return (
    <Tracker
      key={user.uid}
      uid={user.uid}
      userName={user.displayName || user.email.split("@")[0]}
      email={user.email}
    />
  );
}

export default TrackerPage;
