import { useEffect, useState } from "react";
import { BellRing, ChevronRight, LogOut, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { sections } from "../data/conference";
import { api } from "../lib/api";

export function NavigationSidebar({ isClosing, onClose, onSignOut, profile }) {
  return (
    <aside
      className={`drawer${isClosing ? " is-closing" : ""}`}
      aria-label="Навигация"
    >
      <button
        className="drawer-close"
        type="button"
        aria-label="Закрыть навигацию"
        onClick={onClose}
      >
        <X size={19} />
      </button>
      <Logo />
      <h3>Разделы встречи</h3>
      {sections.map(({ id, icon: Icon, title }) => (
        <Link key={id} to={`/${id}`} onClick={onClose}>
          <Icon size={17} />
          <span>{title}</span>
          <ChevronRight size={16} />
        </Link>
      ))}
      <div className="sidebar-user">
        <div>
          <strong>{profile.full_name || "Участник"}</strong>
          <span>{profile.email}</span>
        </div>
        <button
          className="sidebar-signout-button"
          type="button"
          aria-label="Выйти из аккаунта"
          onClick={onSignOut}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

export function NotificationsSidebar({ isClosing, onClose, onEnablePush }) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api("/notifications/read-all", { method: "POST" })
      .then(() => api("/notifications"))
      .then(({ notifications: items }) => {
        if (active) setNotifications(Array.isArray(items) ? items : []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
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
    new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  return (
    <aside
      className={`notifications-panel${isClosing ? " is-closing" : ""}`}
      aria-label="Уведомления"
    >
      <button
        className="drawer-close"
        type="button"
        aria-label="Закрыть уведомления"
        onClick={onClose}
      >
        <X size={19} />
      </button>
      <h2>Уведомления</h2>
      {notifications.map((notification) => (
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
      {!notifications.length && !error && (
        <p className="empty-state">Новых уведомлений пока нет.</p>
      )}
      {error && <p className="form-status">{error}</p>}
      <button
        className="enable-push-button"
        type="button"
        onClick={onEnablePush}
      >
        <BellRing size={16} /> Включить push-уведомления
      </button>
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
