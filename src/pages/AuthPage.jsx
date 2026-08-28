import { useState } from 'react'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { api, setToken } from '../lib/api'
import { Logo } from '../components/Logo'
import { BlockedPage } from './BlockedPage'

const emptyForm = { email: '', password: '', fullName: '', workplace: '', city: '', phone: '' }

export function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const register = mode === 'register'

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setStatus('')
    try {
      const result = await api(register ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify(register
          ? { email: form.email, password: form.password, fullName: form.fullName, workplace: form.workplace, city: form.city, phone: form.phone }
          : { email: form.email, password: form.password }),
      })
      setToken(result.token)
      window.location.reload()
    } catch (error) {
      if (error.code === 'ACCOUNT_BLOCKED') {
        setIsBlocked(true)
        return
      }
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (isBlocked) return <BlockedPage />

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Logo />
        <p className="auth-kicker">ZIEMER USER MEETING · 2026</p>
        <h1>{register ? 'Создайте аккаунт' : 'Добро пожаловать'}</h1>
        <p className="auth-subtitle">{register ? 'Заполните профиль участника, чтобы войти в закрытый портал.' : 'Войдите в закрытый портал участников.'}</p>
        <form className="auth-form" onSubmit={submit}>
          {register && <>
            <label>ФИО<input name="fullName" value={form.fullName} onChange={update} required autoComplete="name" /></label>
            <label>Место работы<input name="workplace" value={form.workplace} onChange={update} required autoComplete="organization" /></label>
            <label>Город<input name="city" value={form.city} onChange={update} required autoComplete="address-level2" /></label>
            <label>Телефон <span>необязательно</span><input name="phone" value={form.phone} onChange={update} autoComplete="tel" /></label>
          </>}
          <label>Почта<div className="input-icon"><Mail size={16} /><input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" /></div></label>
          <label>Пароль<div className="input-icon"><LockKeyhole size={16} /><input name="password" type="password" value={form.password} onChange={update} required minLength="6" autoComplete={register ? 'new-password' : 'current-password'} /></div></label>
          {status && <p className="form-status" role="status">{status}</p>}
          <button className="primary-button" disabled={loading} type="submit">{loading ? 'Подождите…' : register ? 'Зарегистрироваться' : 'Войти'} <ArrowRight size={17} /></button>
        </form>
        <button className="text-button" type="button" onClick={() => { setMode(register ? 'login' : 'register'); setStatus('') }}>
          <span>{register ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}</span>{' '}
          <span className="auth-switch-action">{register ? 'Войти' : 'Зарегистрироваться'}</span>
        </button>
      </section>
    </main>
  )
}
