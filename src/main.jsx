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

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider><App /></LanguageProvider>
  </StrictMode>,
)
