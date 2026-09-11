import { useEffect, useState } from "react";
import { Download, Languages, MonitorSmartphone, Share } from "lucide-react";
import { useLanguage } from "../i18n";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export function InstallGate({ children }) {
  const { language, setLanguage, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(
    () => window.__pwaInstallPrompt ?? null,
  );
  const [standalone, setStandalone] = useState(isStandalone);
  const [installStarted, setInstallStarted] = useState(false);
  const ios = isIos();

  useEffect(() => {
    const onInstallReady = () => setDeferredPrompt(window.__pwaInstallPrompt);
    const syncStandalone = () => setStandalone(isStandalone());
    const displayMode = window.matchMedia("(display-mode: standalone)");
    window.addEventListener("pwa-install-ready", onInstallReady);
    window.addEventListener("appinstalled", syncStandalone);
    window.addEventListener("focus", syncStandalone);
    document.addEventListener("visibilitychange", syncStandalone);
    displayMode.addEventListener?.("change", syncStandalone);
    return () => {
      window.removeEventListener("pwa-install-ready", onInstallReady);
      window.removeEventListener("appinstalled", syncStandalone);
      window.removeEventListener("focus", syncStandalone);
      document.removeEventListener("visibilitychange", syncStandalone);
      displayMode.removeEventListener?.("change", syncStandalone);
    };
  }, []);

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      window.__pwaInstallPrompt = null;
      if (outcome === "accepted") setInstallStarted(true);
      return;
    }
    if (ios && navigator.share) {
      try {
        await navigator.share({
          title: "ZIEMER USER MEETING",
          url: window.location.href,
        });
      } catch {
        // User can cancel the native share sheet; keep the install instructions visible.
      }
      setInstallStarted(true);
      return;
    }
    setInstallStarted(true);
  }

  if (standalone) return children;

  return (
    <main className="install-page">
      <button
        className="language-button page-language-button"
        type="button"
        onClick={() => setLanguage(language === "ru" ? "en" : "ru")}
      >
        <Languages size={16} />
        {t("language")}
      </button>
      <section className="install-card">
        <div className="install-icon">
          <MonitorSmartphone size={30} />
        </div>
        <p className="auth-kicker">{t("portal")}</p>
        <h1>{t("installTitle")}</h1>
        <p>{t("installText")}</p>
        {ios ? (
          <div className="ios-instructions">
            <Share size={18} />
            <span>{t("ios")}</span>
          </div>
        ) : (
          <p className="install-hint">
            {installStarted || !deferredPrompt
              ? t("openInstalledApp")
              : t("installHint")}
          </p>
        )}
        <button className="primary-button" type="button" onClick={install}>
          <Download size={17} /> {t("install")}
        </button>
      </section>
    </main>
  );
}
