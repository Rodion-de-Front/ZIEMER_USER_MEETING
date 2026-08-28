import { Mail, ShieldAlert } from 'lucide-react'

export function BlockedPage() {
  return (
    <main className="blocked-page">
      <section className="blocked-card">
        <div className="blocked-icon"><ShieldAlert size={29} /></div>
        <p className="auth-kicker">ДОСТУП ОГРАНИЧЕН</p>
        <h1>Ваш аккаунт заблокирован</h1>
        <p>Обратитесь к организаторам, если считаете, что блокировка произошла по ошибке.</p>
        <a className="blocked-contact" href="mailto:zum@femtomed.ru"><Mail size={17} /> zum@femtomed.ru</a>
      </section>
    </main>
  )
}
