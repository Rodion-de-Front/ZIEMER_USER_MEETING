import { Mail, ShieldAlert } from 'lucide-react'
import { useLanguage } from '../i18n'

export function BlockedPage() {
  const { t } = useLanguage()
  return (
    <main className="blocked-page">
      <section className="blocked-card">
        <div className="blocked-icon"><ShieldAlert size={29} /></div>
        <p className="auth-kicker">{t('blocked')}</p>
        <h1>{t('blockedTitle')}</h1>
        <p>{t('blockedText')}</p>
        <a className="blocked-contact" href="mailto:zum@femtomed.ru"><Mail size={17} /> zum@femtomed.ru</a>
      </section>
    </main>
  )
}
