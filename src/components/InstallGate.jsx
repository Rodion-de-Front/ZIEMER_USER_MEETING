import { useEffect, useState } from 'react'
import { Download, MonitorSmartphone, Share } from 'lucide-react'

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

export function InstallGate({ children }) {
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
      <section className="install-card">
        <div className="install-icon"><MonitorSmartphone size={30} /></div>
        <p className="auth-kicker">ЗАКРЫТЫЙ ПОРТАЛ</p>
        <h1>Добавьте приложение на экран</h1>
        <p>Портал доступен после установки ZIEMER USER MEETING как приложения.</p>
        {isIos()
          ? <div className="ios-instructions"><Share size={18} /><span>Нажмите «Поделиться», затем «На экран Домой».</span></div>
          : <p className="install-hint">Нажмите кнопку ниже и подтвердите установку в браузере.</p>}
        <button className="primary-button" type="button" onClick={install}>
          <Download size={17} /> {deferredPrompt ? 'Установить приложение' : isIos() ? 'Я добавил(а) приложение' : 'Продолжить после установки'}
        </button>
      </section>
    </main>
  )
}
