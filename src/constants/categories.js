// 🏷️ All categories in one place — add a new one here
export const CATEGORIES = [
  { name: "Food", emoji: "🍔", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  { name: "Travel", emoji: "🚌", color: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  { name: "Bills", emoji: "💡", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300" },
  { name: "Shopping", emoji: "🛍️", color: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300" },
  { name: "Health", emoji: "💊", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { name: "Education", emoji: "📚", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { name: "Other", emoji: "📦", color: "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300" },
];

export function getCategory(name) {
  return CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
}
