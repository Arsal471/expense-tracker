// 📅 Today's date as "2026-10-15" (the format input type="date" expects)
export function today() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d - offset).toISOString().slice(0, 10);
}

// 📅 Monday of the current week as "2026-10-12"
// getDay(): Sunday = 0, Monday = 1 ... Saturday = 6
export function startOfWeek() {
  const d = new Date();
  const daysSinceMonday = (d.getDay() + 6) % 7; // Mon → 0, Tue → 1 ... Sun → 6
  d.setDate(d.getDate() - daysSinceMonday);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d - offset).toISOString().slice(0, 10);
}

// 💰 1500 → "Rs 1,500"   (-200 → "-Rs 200")
export function formatMoney(amount) {
  const sign = amount < 0 ? "-" : "";
  return sign + "Rs " + Math.abs(amount).toLocaleString("en-PK");
}

// ➕ Adds up the amounts of one type, e.g. sumBy(list, "income")
export function sumBy(list, type) {
  return list.filter((e) => e.type === type).reduce((sum, e) => sum + e.amount, 0);
}

// 🧮 All the balances in one place:
//   savings   = put into savings − taken out
//   youOwe    = borrowed − what you repaid
//   owedToYou = lent − what they repaid you
//   current   = income − expenses − savings + borrowed − lent − repaid + collected
//   total     = current + savings   (the cash you have)
export function getBalances(list) {
  const income = sumBy(list, "income");
  const expense = sumBy(list, "expense");
  const savings = sumBy(list, "saving") - sumBy(list, "withdrawal");
  const borrow = sumBy(list, "borrow");
  const lend = sumBy(list, "lend");
  const repay = sumBy(list, "repay");
  const collect = sumBy(list, "collect");
  const current = income - expense - savings + borrow - lend - repay + collect;
  return {
    income,
    expense,
    savings,
    current,
    total: current + savings,
    youOwe: borrow - repay,
    owedToYou: lend - collect,
  };
}

// 🤝 Loan balance with each person, e.g.
// [{ name: "Ali", owedToYou: 2000, youOwe: 0, net: 2000 }, ...]
// net > 0 → they owe you, net < 0 → you owe them, 0 → settled
export function getLoanPeople(list) {
  const people = {};
  list.forEach((e) => {
    if (!["borrow", "lend", "repay", "collect"].includes(e.type)) return;
    if (!people[e.category]) people[e.category] = { name: e.category, owedToYou: 0, youOwe: 0 };
    const p = people[e.category];
    if (e.type === "lend") p.owedToYou += e.amount;
    if (e.type === "collect") p.owedToYou -= e.amount;
    if (e.type === "borrow") p.youOwe += e.amount;
    if (e.type === "repay") p.youOwe -= e.amount;
  });
  return Object.values(people)
    .map((p) => ({ ...p, net: p.owedToYou - p.youOwe }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net) || a.name.localeCompare(b.name));
}

// "  ali  khan " → "Ali Khan"; if "ali khan" already exists, reuse that exact spelling
export function normalizePerson(text, existingNames = []) {
  const clean = text.trim().replace(/\s+/g, " ");
  const match = existingNames.find((n) => n.toLowerCase() === clean.toLowerCase());
  if (match) return match;
  return clean.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

// 📅 "2026-10-15" → "15 Oct 2026"
export function formatDate(date) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// 📅 "2026-10" → "October 2026"
export function formatMonth(month) {
  return new Date(month + "-01T00:00:00").toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

// 🚪 Validation shared by Add and Edit.
// Returns an error message, or "" (empty) when everything is valid
export function validateExpense({ type, title, amount, date, category, customCategory = "" }) {
  const loan = ["borrow", "lend", "repay", "collect"].includes(type);
  if (loan) {
    // loans: the person is required, the note (title) is optional
    if (category.trim() === "") return "Please enter the person's name";
    if (!isNaN(category.trim())) return "Name cannot be just a number";
    if (category.trim().length > 30) return "Name must be 30 characters or less";
  } else {
    if (title.trim() === "") return "Title cannot be empty";
    if (!isNaN(title.trim())) return "Title cannot be just a number";
  }
  if (amount === "") return "Amount is required";
  if (isNaN(Number(amount))) return "Amount must be a valid number";
  if (Number(amount) <= 0) return "Amount must be greater than 0";
  if (!date) return "Please pick a date";
  if (category === "Other" && customCategory.trim() !== "") {
    if (!isNaN(customCategory.trim())) return "Category cannot be just a number";
    if (customCategory.trim().length > 20) return "Category name must be 20 characters or less";
  }
  return "";
}
