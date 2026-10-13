import { useEffect, useState } from "react";
import { CalendarCheck, ChevronRight, FileText, Home, LogOut, MessageCircleHeart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Loader } from "./Loader";
import { api } from "../lib/api";
import { useLanguage } from "../i18n";

export function NavigationSidebar({ isClosing, onClose, onSignOut, profile }) {
  const { language, t } = useLanguage();

  return (
    <aside
      className={`drawer${isClosing ? " is-closing" : ""}`}
      aria-label={t('navigation')}
    >
      <button
        className="drawer-close"
        type="button"
        aria-label={`${t('close')} ${t('navigation').toLowerCase()}`}
        onClick={onClose}
      >
        <X size={19} />
      </button>
      <Logo />
      <h3>{t('sections')}</h3>
      <Link to="/" onClick={onClose}>
        <Home size={17} />
        <span>{language === "en" ? "Club home" : "Главная"}</span>
        <ChevronRight size={16} />
      </Link>
      <Link to="/meeting" onClick={onClose}>
        <CalendarCheck size={17} />
        <span>ZIEMER User Meeting 2026</span>
        <ChevronRight size={16} />
      </Link>
      <Link to="/feedback" onClick={onClose}>
        <MessageCircleHeart size={17} />
        <span>{language === "en" ? "Feedback" : "Отзывы"}</span>
        <ChevronRight size={16} />
      </Link>
      <Link to="/materials" onClick={onClose}>
        <FileText size={17} />
        <span>{language === "en" ? "Useful materials" : "Полезные материалы"}</span>
        <ChevronRight size={16} />
      </Link>
      <div className="sidebar-user">
        <div>
          <strong>{profile.full_name || t('participant')}</strong>
          <span>{profile.email}</span>
        </div>
        <button
          className="sidebar-signout-button"
          type="button"
          aria-label={t('signOutAccount')}
          onClick={onSignOut}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

export function NotificationsSidebar({ isClosing, onClose }) {
  const { language, t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api("/notifications/read-all", { method: "POST" })
      .then(() => api("/notifications"))
      .then(({ notifications: items }) => {
        if (active) setNotifications(Array.isArray(items) ? items : []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    function onPushMessage(event) {
      if (event.data?.type !== "push-received") return;
      const notification = event.data.notification;
      if (!notification || !active) return;
      setNotifications((items) => [
        {
          id: `push-${Date.now()}`,
          title: notification.title,
          body: notification.body,
          sent_at: new Date().toISOString(),
        },
        ...items,
      ]);
    }

    navigator.serviceWorker?.addEventListener("message", onPushMessage);
    return () => {
      active = false;
      navigator.serviceWorker?.removeEventListener("message", onPushMessage);
    };
  }, []);

  const formatDate = (value) =>
    new Intl.DateTimeFormat(language === 'en' ? "en-GB" : "ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  return (
    <aside
      className={`notifications-panel${isClosing ? " is-closing" : ""}`}
      aria-label={t('notifications')}
    >
      <button
        className="drawer-close"
        type="button"
        aria-label={`${t('close')} ${t('notifications').toLowerCase()}`}
        onClick={onClose}
      >
        <X size={19} />
      </button>
      <h2>{t('notifications')}</h2>
      {loading && <Loader label={t("loading")} variant="panel" />}
      {!loading && notifications.map((notification) => (
        <article className="notification-item" key={notification.id}>
          {!notification.read && <i className="notification-dot" />}
          <div>
            <strong>{notification.title}</strong>
            <p>{notification.body}</p>
            <time>
              {formatDate(notification.sent_at || notification.created_at)}
            </time>
          </div>
        </article>
      ))}
      {!loading && !notifications.length && !error && (
        <p className="empty-state">{language === 'en' ? 'There are no new notifications yet.' : 'Новых уведомлений пока нет.'}</p>
      )}
      {error && <p className="form-status">{error}</p>}
    </aside>
  );
}

export function SidebarBackdrop({ children, isClosing, onClose, onClosed }) {
  return (
    <div
      className={`drawer-backdrop${isClosing ? " is-closing" : ""}`}
      role="presentation"
      onAnimationEnd={(event) => {
        if (isClosing && event.target === event.currentTarget) onClosed();
      }}
      onMouseDown={(event) => {
        if (!isClosing && event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}
