// 📅 Today's date as "2026-10-15" (the format input type="date" expects)
export function today() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d - offset).toISOString().slice(0, 10);
}

// 💰 1500 → "Rs 1,500"
export function formatMoney(amount) {
  return "Rs " + amount.toLocaleString("en-PK");
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
export function validateExpense({ title, amount, date }) {
  if (title.trim() === "") return "Title cannot be empty";
  if (!isNaN(title.trim())) return "Title cannot be just a number";
  if (amount === "") return "Amount is required";
  if (isNaN(Number(amount))) return "Amount must be a valid number";
  if (Number(amount) <= 0) return "Amount must be greater than 0";
  if (!date) return "Please pick a date";
  return "";
}
