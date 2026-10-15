import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SAVING_CATEGORIES } from "../constants/categories";
import { inputClass, labelClass } from "../constants/styles";

// Filter state lives in the parent — this component only displays it and reports changes up 📞
// customCategories = { expense: ["Gym"], income: ["Tuition"], savings: ["Hajj"] } — names typed under "Other"
// loanPeople       = ["Ali", "Sara"] — everyone you have loan entries with
function Filters({
  type,
  category,
  month,
  customCategories,
  loanPeople,
  onTypeChange,
  onCategoryChange,
  onMonthChange,
  onReset,
}) {
  const isFiltered = type !== "all" || category !== "All" || month !== "";

  // Only show the categories that belong to the chosen type
  const showExpense = type === "all" || type === "expense";
  const showIncome = type === "all" || type === "income";
  const showSavings = type === "all" || type === "savings";
  const showLoans = type === "all" || type === "loans";

  return (
    // 📱 phones: 2 columns; bigger screens: one row
    <div className="mb-4 grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
      <div className="sm:min-w-28 sm:flex-1">
        <label className={labelClass} htmlFor="filter-type">Type</label>
        <select
          id="filter-type"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className={inputClass}
        >
          <option value="all">↕️ All</option>
          <option value="expense">➖ Expenses</option>
          <option value="income">➕ Income</option>
          <option value="savings">🏦 Savings</option>
          <option value="loans">🤝 Loans</option>
        </select>
      </div>

      <div className="sm:min-w-36 sm:flex-1">
        <label className={labelClass} htmlFor="filter-category">
          {type === "loans" ? "Person" : "Category"}
        </label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={inputClass}
        >
          <option value="All">{type === "loans" ? "👥 Everyone" : "🗂️ All categories"}</option>
          {showExpense && (
            <optgroup label="Expenses">
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={"e-" + c.name} value={c.name}>
                  {c.emoji} {c.name}
                </option>
              ))}
              {customCategories.expense.map((name) => (
                <option key={"e-" + name} value={name}>📦 {name}</option>
              ))}
            </optgroup>
          )}
          {showIncome && (
            <optgroup label="Income">
              {INCOME_CATEGORIES.filter((c) => !(showExpense && c.name === "Other")).map((c) => (
                <option key={"i-" + c.name} value={c.name}>
                  {c.emoji} {c.name}
                </option>
              ))}
              {customCategories.income.map((name) => (
                <option key={"i-" + name} value={name}>💰 {name}</option>
              ))}
            </optgroup>
          )}
          {showSavings && (
            <optgroup label="Savings">
              {SAVING_CATEGORIES.filter((c) => !((showExpense || showIncome) && c.name === "Other")).map((c) => (
                <option key={"s-" + c.name} value={c.name}>
                  {c.emoji} {c.name}
                </option>
              ))}
              {customCategories.savings.map((name) => (
                <option key={"s-" + name} value={name}>💎 {name}</option>
              ))}
            </optgroup>
          )}
          {showLoans && loanPeople.length > 0 && (
            <optgroup label="Loans (people)">
              {loanPeople.map((name) => (
                <option key={"l-" + name} value={name}>🤝 {name}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      <div className="sm:min-w-36 sm:flex-1">
        <label className={labelClass} htmlFor="filter-month">Month</label>
        <input
          id="filter-month"
          type="month"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className={inputClass}
        />
      </div>

      {isFiltered && (
        <button
          onClick={onReset}
          className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
        >
          ✕ Clear filters
        </button>
      )}
    </div>
  );
}

export default Filters;
