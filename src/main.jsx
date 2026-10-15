import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import './styles/main.scss'
import App from './App.jsx'
import { LanguageProvider } from './i18n.jsx'

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  window.__pwaInstallPrompt = event
  window.dispatchEvent(new Event('pwa-install-ready'))
})

registerSW({
  immediate: true,
  onRegisteredSW(_serviceWorkerUrl, registration) {
    if (!registration) return

    const checkForUpdate = () => {
      if (navigator.onLine) registration.update().catch(() => {})
    }

    // Installed PWAs can stay open for days, so a navigation alone is not a
    // reliable update trigger. Check while the app is open and whenever the
    // user returns to it. autoUpdate reloads once the new worker is activated.
    window.setInterval(checkForUpdate, 5 * 60 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    })
    window.addEventListener('online', checkForUpdate)
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider><App /></LanguageProvider>
  </StrictMode>,
)
