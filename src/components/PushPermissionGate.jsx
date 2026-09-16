import { useEffect, useState } from 'react'
import { BellRing, Languages } from 'lucide-react'
import { savePushSubscription } from '../lib/api'
import { Loader } from './Loader'
import { useLanguage } from '../i18n'

const supportsPush = () => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window

export function PushPermissionGate({ children }) {
  const { language, setLanguage, t } = useLanguage()
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function checkSubscription() {
      if (!supportsPush()) {
        setStatus('unsupported')
        return
      }
      if (Notification.permission === 'denied') {
        setStatus('denied')
        return
      }
      if (Notification.permission !== 'granted') {
        setStatus('permission-required')
        return
      }

      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (!active) return
        setStatus(subscription ? 'ready' : 'subscription-required')
      } catch (subscriptionError) {
        if (!active) return
        setError(subscriptionError.message)
        setStatus('subscription-required')
      }
    }

    checkSubscription()
    return () => {
      active = false
    }
  }, [])

  async function enablePush() {
    setError('')
    setStatus('saving')
    try {
      if (!supportsPush()) {
        setStatus('unsupported')
        return
      }

      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission()

      if (permission === 'denied') {
        setStatus('denied')
        return
      }
      if (permission !== 'granted') {
        setStatus('permission-required')
        return
      }

      const registration = await navigator.serviceWorker.ready
      await savePushSubscription(registration)
      setStatus('ready')
    } catch (pushError) {
      setError(pushError.message)
      setStatus('subscription-required')
    }
  }

  if (status === 'ready') return children

  const isSaving = status === 'saving' || status === 'checking'
  const details = {
    checking: t('pushChecking'),
    saving: t('pushSaving'),
    denied: t('pushDenied'),
    unsupported: t('pushUnsupported'),
  }[status] || t('pushRequiredText')

  return (
    <main className="install-page">
      <button className="language-button page-language-button" type="button" onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}><Languages size={16} />{t('language')}</button>
      <section className="install-card">
        <div className="install-icon"><BellRing size={30} /></div>
        <p className="auth-kicker">{t('portal')}</p>
        <h1>{t('pushRequiredTitle')}</h1>
        <p>{details}</p>
        {error && <p className="form-status" role="status">{error}</p>}
        <button className="primary-button" type="button" onClick={enablePush} disabled={isSaving || status === 'unsupported'}>
          {isSaving ? <Loader label={t('wait')} /> : <><BellRing size={17} /> {status === 'denied' ? t('pushCheckAgain') : t('pushEnable')}</>}
        </button>
      </section>
    </main>
  )
}
