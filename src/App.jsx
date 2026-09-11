import { useEffect, useState } from 'react'
import { LogOut, X } from 'lucide-react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { InstallGate } from './components/InstallGate'
import { PushPermissionGate } from './components/PushPermissionGate'
import { NavigationSidebar, NotificationsSidebar, SidebarBackdrop } from './components/Sidebars'
import { api, clearToken, getToken, savePushSubscription } from './lib/api'
import { AuthPage } from './pages/AuthPage'
import { AdminPage } from './pages/AdminPage'
import { BlockedPage } from './pages/BlockedPage'
import { DetailPage } from './pages/DetailPage'
import { HomePage } from './pages/HomePage'
import { useLanguage } from './i18n'

function Application({ profile, onSignOut }) {
  const { t } = useLanguage()
  const [sidebar, setSidebar] = useState(null)
  const [isSidebarClosing, setIsSidebarClosing] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const openSidebar = (name) => {
    setIsSidebarClosing(false)
    setSidebar(name)
  }
  const closeSidebar = () => {
    if (sidebar) setIsSidebarClosing(true)
  }
  const requestSignOut = () => {
    closeSidebar()
    setIsSignOutDialogOpen(true)
  }
  const isAdmin = profile.role === 'admin'

  useEffect(() => {
    if (!sidebar) return
    const scrollY = window.scrollY
    document.documentElement.classList.add('sidebar-open')
    document.body.style.top = `-${scrollY}px`
    return () => {
      document.documentElement.classList.remove('sidebar-open')
      document.body.style.top = ''
      window.scrollTo(0, scrollY)
    }
  }, [sidebar])
  useEffect(() => {
    api('/notifications')
      .then(({ notifications }) => setHasUnread(Array.isArray(notifications) && notifications.some((notification) => !notification.read)))
      .catch(() => setHasUnread(false))

    function onPushMessage(event) {
      if (event.data?.type === 'push-received') setHasUnread(true)
    }

    navigator.serviceWorker?.addEventListener('message', onPushMessage)
    return () => navigator.serviceWorker?.removeEventListener('message', onPushMessage)
  }, [])
  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
    }
  }, [])

  async function enablePush() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return
    const registration = await navigator.serviceWorker.ready
    await savePushSubscription(registration)
    closeSidebar()
  }

  return (
    <div className="app-shell">
      <ScrollToTop />
      {!isOnline && <p className="offline-banner" role="status">{t('offline')}</p>}
      <Header onMenuOpen={() => openSidebar('navigation')} onNotificationsOpen={() => { setHasUnread(false); openSidebar('notifications') }} isAdmin={isAdmin} onSignOut={onSignOut} hasUnread={hasUnread} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
        <Route path="/:pageId" element={<DetailPage />} />
      </Routes>
      <Footer />
      {sidebar && (
        <SidebarBackdrop
          isClosing={isSidebarClosing}
          onClose={closeSidebar}
          onClosed={() => {
            setSidebar(null)
            setIsSidebarClosing(false)
          }}
        >
          {sidebar === 'navigation'
            ? <NavigationSidebar isClosing={isSidebarClosing} onClose={closeSidebar} onSignOut={requestSignOut} profile={profile} />
            : <NotificationsSidebar isClosing={isSidebarClosing} onClose={closeSidebar} onEnablePush={enablePush} />}
        </SidebarBackdrop>
      )}
      {isSignOutDialogOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsSignOutDialogOpen(false)
        }}>
          <section className="modal signout-modal" role="dialog" aria-modal="true" aria-labelledby="signout-dialog-title">
            <button className="modal-close" type="button" aria-label={t('close')} onClick={() => setIsSignOutDialogOpen(false)}><X size={19} /></button>
            <div className="modal-icon"><LogOut size={23} /></div>
            <h2 id="signout-dialog-title">{t('signOutAccount')}?</h2>
            <p>{t('language') === 'RU' ? 'You will need to sign in again to continue.' : 'Для продолжения работы потребуется войти снова.'}</p>
            <div className="signout-modal-actions">
              <button className="button signout-cancel-button" type="button" onClick={() => setIsSignOutDialogOpen(false)}>{t('language') === 'RU' ? 'Cancel' : 'Отмена'}</button>
              <button className="button button-primary" type="button" onClick={onSignOut}>{t('signOut')}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { t } = useLanguage()
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      setSession(null)
      return
    }
    api('/auth/me').then(({ user }) => {
      setProfile(user)
      setSession({ user })
    }).catch((error) => {
      clearToken()
      if (error.code === 'ACCOUNT_BLOCKED') setIsBlocked(true)
      setSession(null)
    })
  }, [])

  if (session === undefined) return <main className="loading-page">{t('loading')}</main>
  if (isBlocked) return <BlockedPage />

  return (
    <BrowserRouter>
      <InstallGate>
        {!session
          ? <AuthPage />
          : !profile
            ? <main className="loading-page">{t('loadingProfile')}</main>
            : (
              <PushPermissionGate>
                <Application profile={profile} onSignOut={() => { clearToken(); window.location.reload() }} />
              </PushPermissionGate>
            )}
      </InstallGate>
    </BrowserRouter>
  )
}
