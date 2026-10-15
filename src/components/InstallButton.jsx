import { useEffect, useState } from "react";

// 📲 "Install" button — Chrome/Android tells us when the app can be installed
// (the "beforeinstallprompt" event). We keep that event and show it when clicked.
function InstallButton() {
  const [installEvent, setInstallEvent] = useState(null);

  useEffect(() => {
    function handleBeforeInstall(e) {
      e.preventDefault(); // stop Chrome's own mini banner — we show our button instead
      setInstallEvent(e);
    }
    function handleInstalled() {
      setInstallEvent(null); // installed → hide the button
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  // Nothing to install (already installed, or browser doesn't support it) → show nothing
  if (!installEvent) return null;

  async function handleClick() {
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null); // the event can only be used once
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
    >
      📲 Install
    </button>
  );
}

export default InstallButton;
