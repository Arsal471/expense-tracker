import { CATEGORIES } from "../constants/categories";
import { inputClass, labelClass } from "../constants/styles";

// Filter state lives in the parent — this component only displays it and reports changes up 📞
function Filters({ category, month, onCategoryChange, onMonthChange, onReset }) {
  const isFiltered = category !== "All" || month !== "";

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="min-w-36 flex-1">
        <label className={labelClass} htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={inputClass}
        >
          <option value="All">🗂️ All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-36 flex-1">
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
