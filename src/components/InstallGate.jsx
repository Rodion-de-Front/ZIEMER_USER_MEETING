import { useEffect, useState } from "react";
import {
  CheckCircle,
  Compass,
  Copy,
  Download,
  Languages,
  MonitorSmartphone,
  Share,
} from "lucide-react";
import { useLanguage } from "../i18n";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isIosSafari = () => {
  const ua = navigator.userAgent;
  return (
    isIos() &&
    /safari/i.test(ua) &&
    !/crios|fxios|edgios|opios|mercury|yabrowser|gsa|instagram|fban|fbav|line|micromessenger|whatsapp|telegram/i.test(
      ua,
    )
  );
};

export function InstallGate({ children }) {
  const { language, setLanguage, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(
    () => window.__pwaInstallPrompt ?? null,
  );
  const [standalone, setStandalone] = useState(isStandalone);
  const [installStarted, setInstallStarted] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const ios = isIos();
  const iosSafari = isIosSafari();

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
    setInstallStarted(true);
  }

  async function copyCurrentLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2600);
    } catch {
      setLinkCopied(false);
    }
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
        {ios && !iosSafari ? (
          <div className="ios-safari-warning">
            <Compass size={20} />
            <div>
              <strong>{t("iosSafariRequiredTitle")}</strong>
              <p>{t("iosSafariRequiredText")}</p>
              <button className="secondary-button" type="button" onClick={copyCurrentLink}>
                {linkCopied ? <CheckCircle size={17} /> : <Copy size={17} />}
                {linkCopied ? t("linkCopied") : t("copyLink")}
              </button>
            </div>
          </div>
        ) : ios ? (
          <div className="ios-instructions">
            <Share size={18} />
            <div>
              <p>{t("iosIntro")}</p>
              <ol>
                {t("iosSteps").map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="ios-help">
                <strong>{t("iosNoOptionTitle")}</strong>
                <ul>
                  {t("iosNoOptionSteps").map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="install-hint">
            {installStarted || !deferredPrompt
              ? t("openInstalledApp")
              : t("installHint")}
          </p>
        )}
        {!ios && (
          <button className="primary-button" type="button" onClick={install}>
            <Download size={17} /> {t("install")}
          </button>
        )}
      </section>
    </main>
  );
}
