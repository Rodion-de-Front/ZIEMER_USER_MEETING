import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { api, setToken } from '../lib/api'
import { Logo } from '../components/Logo'
import { BlockedPage } from './BlockedPage'
import { useLanguage } from '../i18n'

const emptyForm = { email: '', password: '', confirmPassword: '', fullName: '', workplace: '', city: '', phone: '' }

export function AuthPage() {
  const { language, setLanguage, t } = useLanguage()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const register = mode === 'register'

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function submit(event) {
    event.preventDefault()
    if (register && form.password !== form.confirmPassword) {
      setStatus(t('passwordMismatch'))
      return
    }
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
      <button className="language-button page-language-button" type="button" onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}>{t('language')}</button>
      <section className="auth-card">
        <Logo />
        <p className="auth-kicker">ZIEMER USER MEETING · 2026</p>
        <h1>{register ? t('createAccount') : t('welcome')}</h1>
        <p className="auth-subtitle">{register ? t('registerText') : t('loginText')}</p>
        <form className="auth-form" onSubmit={submit}>
          {register && <>
            <label>{t('fullName')}<input name="fullName" value={form.fullName} onChange={update} required autoComplete="name" /></label>
            <label>{t('workplace')}<input name="workplace" value={form.workplace} onChange={update} required autoComplete="organization" /></label>
            <label>{t('city')}<input name="city" value={form.city} onChange={update} required autoComplete="address-level2" /></label>
            <label>{t('phone')} <span>{t('optional')}</span><input name="phone" value={form.phone} onChange={update} autoComplete="tel" /></label>
          </>}
          <label>{t('email')}<div className="input-icon"><Mail className="input-leading-icon" size={16} /><input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" /></div></label>
          <label>{t('password')}<div className="input-icon password-field"><LockKeyhole className="input-leading-icon" size={16} /><input name="password" type={passwordVisible ? 'text' : 'password'} value={form.password} onChange={update} required minLength="6" autoComplete={register ? 'new-password' : 'current-password'} /><button className="password-toggle" type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? t('hidePassword') : t('showPassword')}>{passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {register && <label>{t('confirmPassword')}<div className="input-icon password-field"><LockKeyhole className="input-leading-icon" size={16} /><input name="confirmPassword" type={confirmPasswordVisible ? 'text' : 'password'} value={form.confirmPassword} onChange={update} required minLength="6" autoComplete="new-password" /><button className="password-toggle" type="button" onClick={() => setConfirmPasswordVisible((visible) => !visible)} aria-label={confirmPasswordVisible ? t('hidePassword') : t('showPassword')}>{confirmPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
          {status && <p className="form-status" role="status">{status}</p>}
          <button className="primary-button" disabled={loading} type="submit">{loading ? t('wait') : register ? t('register') : t('login')} <ArrowRight size={17} /></button>
        </form>
        <button className="text-button" type="button" onClick={() => { setMode(register ? 'login' : 'register'); setStatus('') }}>
          <span>{register ? t('hasAccount') : t('noAccount')}</span>{' '}
          <span className="auth-switch-action">{register ? t('login') : t('register')}</span>
        </button>
      </section>
    </main>
  )
}
