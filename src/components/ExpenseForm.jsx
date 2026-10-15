import { useState, useRef, useEffect, useMemo } from "react";
import { categoriesFor, normalizeCategory, isLoan } from "../constants/categories";
import {
  validateExpense,
  formatMoney,
  getBalances,
  getLoanPeople,
  normalizePerson,
} from "../utils/helpers";
import { inputClass, labelClass, secondaryButton } from "../constants/styles";

// ♻️ One reusable form used in two places: AddExpense and EditExpenseModal
// initial          = starting values of the form (type, title, amount, category, customCategory, date)
// onSubmit         = called with the data when validation passes 📞
// onCancel         = (optional) shows a Cancel button
// resetAfterSubmit = true to clear the form after submit
// entries          = all entries — used to check savings and loan balances
// editingId        = id of the entry being edited (it's left out of those checks)
function ExpenseForm({ initial, submitLabel, onSubmit, onCancel, resetAfterSubmit, entries = [], editingId }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current.focus();
  }, []);

  const isIncome = form.type === "income";
  const isSavings = form.type === "saving" || form.type === "withdrawal";
  const isWithdrawal = form.type === "withdrawal";
  const isLoanType = isLoan(form.type);
  const categories = categoriesFor(form.type);

  // Balances *without* the entry being edited (so its own amount counts as available)
  const others = useMemo(() => entries.filter((e) => e.id !== editingId), [entries, editingId]);
  const maxWithdraw = useMemo(() => getBalances(others).savings, [others]);
  const people = useMemo(() => getLoanPeople(others), [others]);

  // 🤝 Loan status with the person typed in the box
  const person = people.find((p) => p.name.toLowerCase() === form.category.trim().toLowerCase());

  // One change handler for every input.
  // [name] = computed key: updates whichever field matches the input's name
  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  // Switching type also switches the category list
  function changeType(type) {
    if (type === form.type) return;
    // saving ⇄ withdrawal share the same pots, loan types share the person
    const sameGroup =
      (isSavings && (type === "saving" || type === "withdrawal")) || (isLoanType && isLoan(type));
    setForm({
      ...form,
      type,
      category: sameGroup ? form.category : isLoan(type) ? "" : categoriesFor(type)[0].name,
      customCategory: sameGroup ? form.customCategory : "",
    });
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    const message = validateExpense(form); // 🚪 validation
    if (message) {
      setError(message);
      return;
    }

    const amount = Number(form.amount);

    // 🏦 can't take out more than what's in savings
    if (isWithdrawal && amount > maxWithdraw) {
      setError(`You only have ${formatMoney(maxWithdraw)} in savings`);
      return;
    }

    // 🤝 can't repay / collect more than what's actually owed
    const name = form.category.trim();
    if (form.type === "repay") {
      const owe = person ? person.youOwe : 0;
      if (owe <= 0) return setError(`You don't owe ${name} anything`);
      if (amount > owe) return setError(`You only owe ${name} ${formatMoney(owe)}`);
    }
    if (form.type === "collect") {
      const owed = person ? person.owedToYou : 0;
      if (owed <= 0) return setError(`${name} doesn't owe you anything`);
      if (amount > owed) return setError(`${name} only owes you ${formatMoney(owed)}`);
    }

    let category = form.category;
    let title = form.title.trim();

    if (isLoanType) {
      category = normalizePerson(name, people.map((p) => p.name));
      // no note typed? make a readable title automatically
      if (title === "") {
        title = {
          borrow: `Loan from ${category}`,
          lend: `Loan to ${category}`,
          repay: `Repaid ${category}`,
          collect: `${category} repaid me`,
        }[form.type];
      }
    } else if (form.category === "Other" && form.customCategory.trim() !== "") {
      // "Other" + something typed → use the typed name (e.g. "Gym")
      category = normalizeCategory(form.customCategory, form.type);
    }

    setError("");
    onSubmit({ type: form.type, title, amount, category, date: form.date });

    if (resetAfterSubmit) {
      // keep the last type, category and date — handy when adding several in a row
      setForm({ ...form, title: "", amount: "" });
      titleRef.current.focus();
    }
  }

  // Text under the loan options: what this entry will do / what's owed
  function loanHint() {
    const name = form.category.trim();
    if (person && person.net > 0) return `${person.name} owes you ${formatMoney(person.net)}`;
    if (person && person.net < 0) return `You owe ${person.name} ${formatMoney(-person.net)}`;
    if (person) return `All settled with ${person.name} ✓`;
    return {
      borrow: "Adds to your current balance — you'll owe them",
      lend: "Takes from your current balance — they'll owe you",
      repay: name ? `You don't owe ${name} anything yet` : "Pick who you're paying back",
      collect: name ? `${name} doesn't owe you anything yet` : "Pick who paid you back",
    }[form.type];
  }

  const tabs = [
    { type: "expense", emoji: "➖", label: "Expense", active: "text-rose-600 dark:text-rose-400", on: form.type === "expense" },
    { type: "income", emoji: "➕", label: "Income", active: "text-emerald-600 dark:text-emerald-400", on: isIncome },
    { type: "saving", emoji: "🏦", label: "Savings", active: "text-sky-600 dark:text-sky-400", on: isSavings },
    { type: "borrow", emoji: "🤝", label: "Loan", active: "text-amber-600 dark:text-amber-400", on: isLoanType },
  ];

  const color = isLoanType ? "amber" : isSavings ? "sky" : isIncome ? "emerald" : "indigo";
  const buttonColor = {
    amber: "bg-amber-600 hover:bg-amber-700",
    sky: "bg-sky-600 hover:bg-sky-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
  }[color];

  const buttonText =
    submitLabel ||
    {
      expense: "Add Expense",
      income: "Add Income",
      saving: "Add to Savings",
      withdrawal: "Withdraw from Savings",
      borrow: "Save Loan Taken",
      lend: "Save Loan Given",
      repay: "Save Repayment",
      collect: "Save Money Received",
    }[form.type];

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* 🔀 Expense / Income / Savings / Loan tabs */}
      <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {tabs.map((t) => (
          <button
            key={t.type}
            type="button"
            // clicking the tab you're already in does nothing (keeps e.g. "withdraw" selected)
            onClick={() => (t.on ? null : changeType(t.type))}
            aria-pressed={t.on}
            className={
              "flex flex-col items-center rounded-md py-1.5 text-xs font-semibold transition sm:text-sm " +
              (t.on
                ? "bg-white shadow-sm dark:bg-slate-900 " + t.active
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")
            }
          >
            <span aria-hidden="true">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* 🏦 Savings: put money in, or take it out */}
      {isSavings && (
        <div className="space-y-1">
          <div className="flex gap-4 text-sm">
            {[
              { type: "saving", label: "Add to savings" },
              { type: "withdrawal", label: "Withdraw" },
            ].map((o) => (
              <label key={o.type} className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="savingDirection"
                  checked={form.type === o.type}
                  onChange={() => changeType(o.type)}
                  className="accent-sky-600"
                />
                {o.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isWithdrawal
              ? `Available in savings: ${formatMoney(maxWithdraw)}`
              : "Moves money from your current balance into savings"}
          </p>
        </div>
      )}

      {/* 🤝 Loans: four kinds, then who it's with */}
      {isLoanType && (
        <>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { type: "borrow", label: "📥 I borrowed" },
              { type: "lend", label: "📤 I lent" },
              { type: "repay", label: "✅ I repaid" },
              { type: "collect", label: "✅ They repaid me" },
            ].map((o) => (
              <label
                key={o.type}
                className={
                  "flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1.5 transition " +
                  (form.type === o.type
                    ? "border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-500/10"
                    : "border-slate-200 dark:border-slate-700")
                }
              >
                <input
                  type="radio"
                  name="loanType"
                  checked={form.type === o.type}
                  onChange={() => changeType(o.type)}
                  className="accent-amber-600"
                />
                {o.label}
              </label>
            ))}
          </div>

          <div>
            <label className={labelClass} htmlFor="person">Person</label>
            <input
              id="person"
              name="category"
              value={form.category}
              onChange={handleChange}
              maxLength={30}
              list="loan-people"
              autoComplete="off"
              placeholder="e.g. Ali, Uncle Rashid"
              className={inputClass}
            />
            {/* 💡 suggestions from people you already have loans with */}
            <datalist id="loan-people">
              {people.map((p) => (
                <option key={p.name} value={p.name} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{loanHint()}</p>
          </div>
        </>
      )}

      <div>
        <label className={labelClass} htmlFor="title">
          {isLoanType ? "Note" : "Title"}
          {isLoanType && <span className="font-normal"> (optional)</span>}
        </label>
        <input
          id="title"
          name="title"
          ref={titleRef}
          value={form.title}
          onChange={handleChange}
          placeholder={
            isLoanType
              ? "e.g. For bike repair"
              : isSavings
                ? "e.g. Monthly saving, Laptop fund"
                : isIncome
                  ? "e.g. October salary, Client payment"
                  : "e.g. Groceries, Bus fare"
          }
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
            inputMode="numeric"
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

      {!isLoanType && (
        <div>
          <label className={labelClass} htmlFor="category">
            {isSavings ? "Savings pot" : isIncome ? "Source" : "Category"}
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ✍️ Only shown when "Other" is selected */}
      {!isLoanType && form.category === "Other" && (
        <div>
          <label className={labelClass} htmlFor="customCategory">
            {isSavings ? "Pot name" : isIncome ? "Source name" : "Category name"}{" "}
            <span className="font-normal">(optional)</span>
          </label>
          <input
            id="customCategory"
            name="customCategory"
            value={form.customCategory}
            onChange={handleChange}
            maxLength={20}
            placeholder={
              isSavings ? "e.g. Hajj, Wedding, Car" : isIncome ? "e.g. Rent received, Tuition" : "e.g. Gym, Gifts, Rent"
            }
            autoFocus={!resetAfterSubmit}
            className={inputClass}
          />
        </div>
      )}

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
        <button
          type="submit"
          className={
            "flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.98] " +
            buttonColor
          }
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;
