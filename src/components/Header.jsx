import { Bell, LogOut, Menu, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'

export function Header({ onMenuOpen, onNotificationsOpen, isAdmin, onSignOut, hasUnread }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <header className="topbar">
      {isHome ? <Logo /> : <Link className="header-logo-link" to="/"><Logo /></Link>}
      <div className="topbar-actions">
        {isAdmin && <Link className="icon-button admin-button" to="/admin" aria-label="Открыть кабинет администратора"><ShieldCheck size={19} /></Link>}
        <button className="icon-button notification-button" type="button" aria-label="Открыть уведомления" onClick={onNotificationsOpen}>
          <Bell size={19} />{hasUnread && <i />}
        </button>
        <button className="icon-button" type="button" aria-label="Открыть навигацию" onClick={onMenuOpen}>
          <Menu size={20} />
        </button>
        <button className="icon-button signout-button" type="button" aria-label="Выйти" onClick={onSignOut}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
