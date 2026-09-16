import { useEffect, useState } from "react";
import { ChevronRight, LogOut, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Loader } from "./Loader";
import { getConferenceContent } from "../data/conference";
import { api } from "../lib/api";
import { useLanguage } from "../i18n";

export function NavigationSidebar({ isClosing, onClose, onSignOut, profile }) {
  const { language, t } = useLanguage();
  const { sections } = getConferenceContent(language);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase(language);
  const visibleSections = sections.filter(({ title, caption }) =>
    `${title} ${caption}`.toLocaleLowerCase(language).includes(normalizedQuery),
  );

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
      <label className="sidebar-search">
        <Search size={17} aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("search")}
        />
        {query && (
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setQuery("")}
          >
            <X size={15} />
          </button>
        )}
      </label>
      <h3>{t('sections')}</h3>
      {visibleSections.map(({ id, icon: Icon, title }) => (
        <Link key={id} to={`/${id}`} onClick={onClose}>
          <Icon size={17} />
          <span>{title}</span>
          <ChevronRight size={16} />
        </Link>
      ))}
      {normalizedQuery && !visibleSections.length && (
        <p className="sidebar-search-empty">{t("searchEmpty")}</p>
      )}
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
