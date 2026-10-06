import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail } from 'lucide-react'
import { api, setToken } from '../lib/api'
import { Logo } from '../components/Logo'
import { Loader } from '../components/Loader'
import { BlockedPage } from './BlockedPage'
import { useLanguage } from '../i18n'

const emptyForm = { email: '', password: '', confirmPassword: '', fullName: '', workplace: '', city: '', phone: '', code: '', newPassword: '', confirmNewPassword: '' }

export function AuthPage() {
  const { language, setLanguage, t } = useLanguage()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('')
  const [statusType, setStatusType] = useState('error')
  const [loading, setLoading] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const register = mode === 'register'
  const registerCode = mode === 'register-code'
  const login = mode === 'login'
  const forgot = mode === 'forgot'
  const resetCode = mode === 'reset-code'
  const resetPassword = mode === 'reset-password'

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: name === 'code' ? value.replace(/\D/g, '').slice(0, 6) : value }))
  }

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setStatus('')
    setStatusType('error')
    setForm((current) => ({ ...current, code: '' }))
    if (nextMode !== 'reset-password') setResetToken('')
  }

  async function submitLogin(event) {
    event.preventDefault()
    setLoading(true)
    setStatus('')
    setStatusType('error')
    try {
      const result = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password }),
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

  async function requestRegistrationCode(event) {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setStatusType('error')
      setStatus(t('passwordMismatch'))
      return
    }
    setLoading(true)
    setStatus('')
    setStatusType('error')
    try {
      await api('/auth/registration-code/request', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, language }),
      })
      setForm((current) => ({ ...current, code: '' }))
      setMode('register-code')
      setStatusType('success')
      setStatus(t('registrationCodeSent'))
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function confirmRegistration(event) {
    event.preventDefault()
    setLoading(true)
    setStatus('')
    setStatusType('error')
    try {
      const { verificationToken } = await api('/auth/registration-code/verify', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, code: form.code }),
      })
      const result = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          workplace: form.workplace,
          city: form.city,
          phone: form.phone,
          verificationToken,
        }),
      })
      setToken(result.token)
      window.location.reload()
    } catch (error) {
      setStatus(error.code === 'INVALID_VERIFICATION_CODE' ? t('invalidVerificationCode') : error.message)
    } finally {
      setLoading(false)
    }
  }

  async function requestPasswordReset(event) {
    event.preventDefault()
    setLoading(true)
    setStatus('')
    setStatusType('error')
    try {
      await api('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, language }),
      })
      setForm((current) => ({ ...current, code: '' }))
      setMode('reset-code')
      setStatusType('success')
      setStatus(t('resetCodeSent'))
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function verifyPasswordResetCode(event) {
    event.preventDefault()
    setLoading(true)
    setStatus('')
    setStatusType('error')
    try {
      const result = await api('/auth/password-reset/verify', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, code: form.code }),
      })
      setResetToken(result.resetToken)
      setMode('reset-password')
      setStatus('')
    } catch (error) {
      setStatus(error.code === 'INVALID_RESET_CODE' ? t('invalidResetCode') : error.message)
    } finally {
      setLoading(false)
    }
  }

  async function confirmPasswordReset(event) {
    event.preventDefault()
    if (form.newPassword !== form.confirmNewPassword) {
      setStatusType('error')
      setStatus(t('passwordMismatch'))
      return
    }
    setLoading(true)
    setStatus('')
    setStatusType('error')
    try {
      await api('/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ resetToken, password: form.newPassword }),
      })
      setForm((current) => ({ ...current, password: '', code: '', newPassword: '', confirmNewPassword: '' }))
      setResetToken('')
      setMode('login')
      setStatusType('success')
      setStatus(t('passwordResetSuccess'))
    } catch (error) {
      if (error.code === 'INVALID_RESET_TOKEN') {
        setResetToken('')
        setMode('forgot')
      }
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (isBlocked) return <BlockedPage />

  const pageTitle = register
    ? t('createAccount')
    : registerCode
      ? t('confirmEmailTitle')
      : forgot
        ? t('forgotPasswordTitle')
        : resetCode
          ? t('resetCodeTitle')
          : resetPassword
            ? t('newPasswordTitle')
            : t('welcome')
  const pageSubtitle = register
    ? t('registerText')
    : registerCode
      ? t('confirmEmailText')
      : forgot
        ? t('forgotPasswordText')
        : resetCode
          ? t('resetCodeText')
          : resetPassword
            ? t('newPasswordText')
            : t('loginText')

  return (
    <main className="auth-page">
      <button className="language-button page-language-button" type="button" onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}>{t('language')}</button>
      <section className="auth-card">
        <Logo />
        <p className="auth-kicker">ZIEMER USER MEETING · 2026</p>
        <h1>{pageTitle}</h1>
        <p className="auth-subtitle">{pageSubtitle}</p>

        {(login || register) && <>
          <form className="auth-form" onSubmit={login ? submitLogin : requestRegistrationCode}>
            {register && <>
              <label>{t('fullName')}<input name="fullName" value={form.fullName} onChange={update} required autoComplete="name" /></label>
              <label>{t('workplace')}<input name="workplace" value={form.workplace} onChange={update} required autoComplete="organization" /></label>
              <label>{t('city')}<input name="city" value={form.city} onChange={update} required autoComplete="address-level2" /></label>
              <label>{t('phone')} <span>{t('optional')}</span><input name="phone" value={form.phone} onChange={update} autoComplete="tel" /></label>
            </>}
            <label>{t('email')}<div className="input-icon"><Mail className="input-leading-icon" size={16} /><input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" /></div></label>
            <label>{t('password')}<div className="input-icon password-field"><LockKeyhole className="input-leading-icon" size={16} /><input name="password" type={passwordVisible ? 'text' : 'password'} value={form.password} onChange={update} required minLength="6" autoComplete={register ? 'new-password' : 'current-password'} /><button className="password-toggle" type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? t('hidePassword') : t('showPassword')}>{passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {login && <button className="forgot-password-button" type="button" onClick={() => changeMode('forgot')}>{t('forgotPassword')}</button>}
            {register && <label>{t('confirmPassword')}<div className="input-icon password-field"><LockKeyhole className="input-leading-icon" size={16} /><input name="confirmPassword" type={confirmPasswordVisible ? 'text' : 'password'} value={form.confirmPassword} onChange={update} required minLength="6" autoComplete="new-password" /><button className="password-toggle" type="button" onClick={() => setConfirmPasswordVisible((visible) => !visible)} aria-label={confirmPasswordVisible ? t('hidePassword') : t('showPassword')}>{confirmPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
            {status && <p className={`form-status ${statusType === 'success' ? 'form-status-success' : ''}`} role="status">{status}</p>}
            <button className="primary-button" disabled={loading} type="submit">{loading ? <Loader label={t('wait')} /> : <>{register ? t('sendRegistrationCode') : t('login')} <ArrowRight size={17} /></>}</button>
          </form>
          <button className="text-button" type="button" onClick={() => changeMode(register ? 'login' : 'register')}>
            <span>{register ? t('hasAccount') : t('noAccount')}</span>{' '}
            <span className="auth-switch-action">{register ? t('login') : t('register')}</span>
          </button>
        </>}

        {registerCode && <>
          <form className="auth-form" onSubmit={confirmRegistration}>
            <label>{t('verificationCode')}<div className="input-icon"><KeyRound className="input-leading-icon" size={16} /><input className="verification-code-input" name="code" value={form.code} onChange={update} required minLength="6" maxLength="6" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" autoFocus /></div></label>
            {status && <p className={`form-status ${statusType === 'success' ? 'form-status-success' : ''}`} role="status">{status}</p>}
            <button className="primary-button" disabled={loading || form.code.length !== 6} type="submit">{loading ? <Loader label={t('wait')} /> : <>{t('confirmAndRegister')} <ArrowRight size={17} /></>}</button>
          </form>
          <button className="text-button auth-back-button" type="button" onClick={() => changeMode('register')}><ArrowLeft size={15} /> {t('changeRegistrationData')}</button>
        </>}

        {forgot && <>
          <form className="auth-form" onSubmit={requestPasswordReset}>
            <label>{t('email')}<div className="input-icon"><Mail className="input-leading-icon" size={16} /><input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" autoFocus /></div></label>
            {status && <p className="form-status" role="status">{status}</p>}
            <button className="primary-button" disabled={loading} type="submit">{loading ? <Loader label={t('wait')} /> : <>{t('sendResetCode')} <ArrowRight size={17} /></>}</button>
          </form>
          <button className="text-button auth-back-button" type="button" onClick={() => changeMode('login')}><ArrowLeft size={15} /> {t('backToLogin')}</button>
        </>}

        {resetCode && <>
          <form className="auth-form" onSubmit={verifyPasswordResetCode}>
            <label>{t('verificationCode')}<div className="input-icon"><KeyRound className="input-leading-icon" size={16} /><input className="verification-code-input" name="code" value={form.code} onChange={update} required minLength="6" maxLength="6" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" autoFocus /></div></label>
            {status && <p className={`form-status ${statusType === 'success' ? 'form-status-success' : ''}`} role="status">{status}</p>}
            <button className="primary-button" disabled={loading || form.code.length !== 6} type="submit">{loading ? <Loader label={t('wait')} /> : <>{t('confirmCode')} <ArrowRight size={17} /></>}</button>
          </form>
          <button className="text-button auth-back-button" type="button" onClick={() => changeMode('forgot')}><ArrowLeft size={15} /> {t('requestNewCode')}</button>
        </>}

        {resetPassword && <>
          <form className="auth-form" onSubmit={confirmPasswordReset}>
            <label>{t('newPassword')}<div className="input-icon password-field"><LockKeyhole className="input-leading-icon" size={16} /><input name="newPassword" type={passwordVisible ? 'text' : 'password'} value={form.newPassword} onChange={update} required minLength="6" autoComplete="new-password" /><button className="password-toggle" type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? t('hidePassword') : t('showPassword')}>{passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            <label>{t('confirmPassword')}<div className="input-icon password-field"><LockKeyhole className="input-leading-icon" size={16} /><input name="confirmNewPassword" type={confirmPasswordVisible ? 'text' : 'password'} value={form.confirmNewPassword} onChange={update} required minLength="6" autoComplete="new-password" /><button className="password-toggle" type="button" onClick={() => setConfirmPasswordVisible((visible) => !visible)} aria-label={confirmPasswordVisible ? t('hidePassword') : t('showPassword')}>{confirmPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {status && <p className={`form-status ${statusType === 'success' ? 'form-status-success' : ''}`} role="status">{status}</p>}
            <button className="primary-button" disabled={loading} type="submit">{loading ? <Loader label={t('wait')} /> : <>{t('resetPassword')} <ArrowRight size={17} /></>}</button>
          </form>
          <button className="text-button auth-back-button" type="button" onClick={() => changeMode('forgot')}><ArrowLeft size={15} /> {t('requestNewCode')}</button>
        </>}
      </section>
    </main>
  )
}
