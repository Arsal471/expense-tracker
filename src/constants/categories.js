// 🏷️ All categories in one place — add a new one here
// Entry types:
//   "expense"    = money going out
//   "income"     = money coming in
//   "saving"     = money moved from current balance into savings
//   "withdrawal" = money taken out of savings back into current balance
//   🤝 Loans (the "category" field holds the person's name):
//   "borrow"  = you took a loan from someone   → current balance goes up, you owe them
//   "lend"    = you gave a loan to someone     → current balance goes down, they owe you
//   "repay"   = you paid back what you owed    → current balance goes down
//   "collect" = they paid you back             → current balance goes up
const OTHER_COLOR = "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300";

export const EXPENSE_CATEGORIES = [
  { name: "Food", emoji: "🍔", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  { name: "Travel", emoji: "🚌", color: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  { name: "Bills", emoji: "💡", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300" },
  { name: "Shopping", emoji: "🛍️", color: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300" },
  { name: "Health", emoji: "💊", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  { name: "Education", emoji: "📚", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { name: "Other", emoji: "📦", color: OTHER_COLOR },
];

export const INCOME_CATEGORIES = [
  { name: "Salary", emoji: "💼", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { name: "Freelance", emoji: "💻", color: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300" },
  { name: "Business", emoji: "🏪", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300" },
  { name: "Gift", emoji: "🎁", color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300" },
  { name: "Investment", emoji: "📈", color: "bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300" },
  { name: "Other", emoji: "💰", color: OTHER_COLOR },
];

// Savings "pots" — used for both saving and withdrawal entries
export const SAVING_CATEGORIES = [
  { name: "General", emoji: "🏦", color: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  { name: "Emergency Fund", emoji: "🛟", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  { name: "Goal", emoji: "🎯", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" },
  { name: "Other", emoji: "💎", color: OTHER_COLOR },
];

export const LOAN_TYPES = ["borrow", "lend", "repay", "collect"];

export function isLoan(type) {
  return LOAN_TYPES.includes(type);
}

// Loans have no category list — the person's name is used instead
export function categoriesFor(type) {
  if (isLoan(type)) return [];
  if (type === "income") return INCOME_CATEGORIES;
  if (type === "saving" || type === "withdrawal") return SAVING_CATEGORIES;
  return EXPENSE_CATEGORIES;
}

// 🎨 How each type looks in the list (sign + colour + small tag)
export const TYPE_STYLES = {
  expense: { sign: "−", text: "text-rose-600 dark:text-rose-400" },
  income: { sign: "+", text: "text-emerald-600 dark:text-emerald-400" },
  saving: { sign: "", text: "text-sky-600 dark:text-sky-400", tag: "🏦 To savings" },
  withdrawal: { sign: "", text: "text-sky-600 dark:text-sky-400", tag: "↩️ From savings" },
  borrow: { sign: "+", text: "text-amber-600 dark:text-amber-400", tag: "📥 Borrowed" },
  lend: { sign: "−", text: "text-amber-600 dark:text-amber-400", tag: "📤 Lent" },
  repay: { sign: "−", text: "text-amber-600 dark:text-amber-400", tag: "✅ You repaid" },
  collect: { sign: "+", text: "text-amber-600 dark:text-amber-400", tag: "✅ Repaid you" },
};

const LOAN_LOOK = { emoji: "🤝", color: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" };

export function isBuiltInCategory(name, type) {
  return categoriesFor(type).some((c) => c.name === name);
}

// Unknown (custom) names like "Gym" get the "Other" look, but keep their own name
export function getCategory(name, type = "expense") {
  if (isLoan(type)) return { ...LOAN_LOOK, name }; // name = the person
  const list = categoriesFor(type);
  const found = list.find((c) => c.name === name);
  if (found) return found;
  return { ...list[list.length - 1], name: name || "Other" };
}

// Turns what the user typed into a tidy category name:
// "  gym  " → "Gym", "food" → "Food" (matches the built-in one)
export function normalizeCategory(text, type = "expense") {
  const clean = text.trim().replace(/\s+/g, " ");
  const builtIn = categoriesFor(type).find((c) => c.name.toLowerCase() === clean.toLowerCase());
  if (builtIn) return builtIn.name;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
