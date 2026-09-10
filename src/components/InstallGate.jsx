import { useEffect, useState } from 'react'
import { Download, Languages, MonitorSmartphone, Share } from 'lucide-react'
import { useLanguage } from '../i18n'

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

export function InstallGate({ children }) {
  const { language, setLanguage, t } = useLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState(() => window.__pwaInstallPrompt ?? null)
  const [installed, setInstalled] = useState(isStandalone)
  const [acknowledged, setAcknowledged] = useState(() => sessionStorage.getItem('pwa-install-acknowledged') === 'true')

  useEffect(() => {
    const onInstallReady = () => setDeferredPrompt(window.__pwaInstallPrompt)
    const onInstalled = () => setInstalled(true)
    window.addEventListener('pwa-install-ready', onInstallReady)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('pwa-install-ready', onInstallReady)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      window.__pwaInstallPrompt = null
      if (outcome === 'accepted') setInstalled(true)
      return
    }
    // iOS and some browsers cannot report installation state. Require an explicit acknowledgement.
    sessionStorage.setItem('pwa-install-acknowledged', 'true')
    setAcknowledged(true)
  }

  if (installed || acknowledged) return children

  return (
    <main className="install-page">
      <button className="language-button page-language-button" type="button" onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}><Languages size={16} />{t('language')}</button>
      <section className="install-card">
        <div className="install-icon"><MonitorSmartphone size={30} /></div>
        <p className="auth-kicker">{t('portal')}</p>
        <h1>{t('installTitle')}</h1>
        <p>{t('installText')}</p>
        {isIos()
          ? <div className="ios-instructions"><Share size={18} /><span>{t('ios')}</span></div>
          : <p className="install-hint">{t('installHint')}</p>}
        <button className="primary-button" type="button" onClick={install}>
          <Download size={17} /> {deferredPrompt ? t('install') : isIos() ? t('installed') : t('continueInstall')}
        </button>
      </section>
    </main>
  )
}
