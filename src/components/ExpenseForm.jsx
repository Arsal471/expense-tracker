import { useState, useRef, useEffect } from "react";
import { CATEGORIES } from "../constants/categories";
import { validateExpense } from "../utils/helpers";
import { inputClass, labelClass, primaryButton, secondaryButton } from "../constants/styles";

// ♻️ One reusable form used in two places: AddExpense and EditExpenseModal
// initial          = starting values of the form
// onSubmit         = called with the data when validation passes 📞
// onCancel         = (optional) shows a Cancel button
// resetAfterSubmit = true to clear the form after submit
function ExpenseForm({ initial, submitLabel, onSubmit, onCancel, resetAfterSubmit }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current.focus();
  }, []);

  // One change handler for every input.
  // [name] = computed key: updates whichever field matches the input's name
  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const message = validateExpense(form); // 🚪 validation
    if (message) {
      setError(message);
      return;
    }

    setError("");
    onSubmit({
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
    });

    if (resetAfterSubmit) {
      setForm({ ...initial, category: form.category, date: form.date });
      titleRef.current.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div>
        <label className={labelClass} htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          ref={titleRef}
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Groceries, Bus fare"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="amount">Amount (Rs)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            value={form.amount}
            onChange={handleChange}
            placeholder="500"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          ⚠️ {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton + " flex-1"}>
            Cancel
          </button>
        )}
        <button type="submit" className={primaryButton + " flex-1"}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;
