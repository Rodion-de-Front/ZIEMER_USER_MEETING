import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import './styles/main.scss'
import App from './App.jsx'

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  window.__pwaInstallPrompt = event
  window.dispatchEvent(new Event('pwa-install-ready'))
})

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
