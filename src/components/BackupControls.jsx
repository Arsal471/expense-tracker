import { useRef, useState } from "react";
import { makeBackupFile, readBackupFile } from "../utils/backup";
import { formatDate, today } from "../utils/helpers";

// 💾 Download a backup of all entries, or restore one.
// Restore MERGES: entries already in the app (same id) are skipped, so nothing is duplicated or lost.
function BackupControls({ uid, entries, onImport }) {
  const fileInput = useRef(null);
  const [message, setMessage] = useState(null); // { text, ok }
  const lastKey = "lastBackup_" + uid;
  const [lastBackup, setLastBackup] = useState(() => localStorage.getItem(lastKey));

  function show(text, ok = true) {
    setMessage({ text, ok });
    setTimeout(() => setMessage(null), 5000);
  }

  // 💻 Normal file download (works everywhere)
  function download(file) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link); // some phones need the link to be on the page
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleBackup() {
    const file = makeBackupFile(entries);
    let how = "downloaded";

    try {
      // 📱 Try the phone's share sheet first (WhatsApp, Drive...)
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Budget Tracker backup" });
        how = "shared";
      } else {
        download(file);
      }
    } catch (err) {
      if (err.name === "AbortError") return; // user closed the share sheet — not an error
      // Some browsers refuse to share .json files → just download it instead
      try {
        download(file);
      } catch {
        show("Could not save the backup", false);
        return;
      }
    }

    localStorage.setItem(lastKey, today());
    setLastBackup(today());
    show(
      how === "shared"
        ? `✅ Backup shared (${entries.length} entries)`
        : `✅ Backup downloaded (${entries.length} entries) — check your Downloads folder`,
    );
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    try {
      const backup = await readBackupFile(file);
      const existing = new Set(entries.map((x) => x.id));
      const fresh = backup.filter((x) => !existing.has(x.id));

      if (fresh.length === 0) {
        show(`Nothing new — all ${backup.length} entries are already here`);
        return;
      }
      onImport(fresh);
      show(`✅ Restored ${fresh.length} entries` + (backup.length > fresh.length ? ` (${backup.length - fresh.length} already here)` : ""));
    } catch (err) {
      show(err.message, false);
    }
  }

  // 🔔 nudge if the last backup is older than 7 days
  const daysSince = lastBackup
    ? Math.floor((new Date(today()) - new Date(lastBackup)) / 86400000)
    : null;
  const stale = entries.length > 0 && (daysSince === null || daysSince > 7);

  const btn =
    "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleBackup} disabled={entries.length === 0} className={btn}>
          💾 Backup
        </button>
        <button onClick={() => fileInput.current.click()} className={btn}>
          📂 Restore
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {message ? (
        <p className={"text-xs " + (message.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
          {message.text}
        </p>
      ) : (
        <p className={"text-xs " + (stale ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400")}>
          {lastBackup
            ? `Last backup: ${formatDate(lastBackup)}${stale ? " — time for a new one!" : ""}`
            : entries.length > 0
              ? "No backup yet — your data lives only on this device"
              : ""}
        </p>
      )}
    </div>
  );
}

export default BackupControls;
