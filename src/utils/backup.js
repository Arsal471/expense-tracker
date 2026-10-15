// 💾 Backup / Restore helpers
import { today } from "./helpers";

const TYPES = ["expense", "income", "saving", "withdrawal", "borrow", "lend", "repay", "collect"];

// 🧹 Makes any saved entry safe to use: fills in missing fields and fixes bad amounts.
// Used when loading from localStorage AND when restoring a backup file.
export function cleanEntry(entry) {
  return {
    type: "expense", // everything saved before the income feature was an expense
    category: "Other",
    date: new Date(entry.id).toISOString().slice(0, 10), // id was created with Date.now()
    ...entry,
    amount: Number(entry.amount) || 0, // 🩹 turn null/NaN amounts into 0
  };
}

// ⬇️ Turns all entries into a .json file
export function makeBackupFile(entries) {
  const data = {
    app: "budget-tracker",
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
  };
  const name = `budget-backup-${today()}.json`;
  return new File([JSON.stringify(data, null, 2)], name, { type: "application/json" });
}

// ⬆️ Reads a backup file and returns its entries — throws a friendly error if it's not valid
export async function readBackupFile(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error("This file isn't a valid backup (could not read it)");
  }

  // accept { entries: [...] } (our format) or a plain [...] list
  const list = Array.isArray(data) ? data : data?.entries;
  if (!Array.isArray(list)) throw new Error("This file isn't a Budget Tracker backup");

  // keep only entries that look right
  return list
    .filter(
      (e) =>
        e &&
        typeof e === "object" &&
        typeof e.id === "number" &&
        typeof e.title === "string" &&
        (e.type === undefined || TYPES.includes(e.type)),
    )
    .map(cleanEntry);
}
