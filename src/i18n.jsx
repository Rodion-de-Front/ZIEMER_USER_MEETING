import { createContext, useContext, useEffect, useState } from 'react'

const dictionaries = {
  ru: {
    language: 'EN', offline: 'Нет подключения к интернету. Доступен ранее загруженный контент.',
    loading: 'Загрузка…', loadingProfile: 'Загрузка профиля…', close: 'Закрыть', back: 'Назад',
    signOut: 'Выйти', signOutAccount: 'Выйти из аккаунта', navigation: 'Навигация', notifications: 'Уведомления',
    sections: 'Разделы встречи', participant: 'Участник', search: 'Поиск по порталу', searchPlaceholder: 'Введите ключевое слово…',
    searchEmpty: 'Страницы по этому запросу не найдены.', searchHint: 'Начните вводить, чтобы найти страницу.',
    install: 'Установить приложение', portal: 'ЗАКРЫТЫЙ ПОРТАЛ', installTitle: 'Добавьте приложение на экран',
    installText: 'Портал доступен после установки ZIEMER USER MEETING как приложения.',
    ios: 'Нажмите «Поделиться», затем «На экран Домой».', installHint: 'Нажмите кнопку ниже и подтвердите установку в браузере.',
    installed: 'Я добавил(а) приложение', continueInstall: 'Продолжить после установки',
    blocked: 'ДОСТУП ОГРАНИЧЕН', blockedTitle: 'Ваш аккаунт заблокирован', blockedText: 'Обратитесь к организаторам, если считаете, что блокировка произошла по ошибке.',
    login: 'Войти', register: 'Зарегистрироваться', welcome: 'Добро пожаловать', createAccount: 'Создайте аккаунт',
    loginText: 'Войдите в закрытый портал участников.', registerText: 'Заполните профиль участника, чтобы войти в закрытый портал.',
    fullName: 'ФИО', workplace: 'Место работы', city: 'Город', phone: 'Телефон', optional: 'необязательно', email: 'Почта', password: 'Пароль',
    wait: 'Подождите…', hasAccount: 'Уже есть аккаунт?', noAccount: 'Нет аккаунта?',
    admin: 'АДМИНИСТРИРОВАНИЕ', adminTitle: 'Кабинет администратора', users: 'Пользователи', campaigns: 'Рассылки',
    user: 'Участник', status: 'Статус', actions: 'Действия', active: 'Активен', blockedStatus: 'Заблокирован',
    block: 'Заблокировать', unblock: 'Разблокировать', usersEmpty: 'Пользователи не найдены.', adminSearch: 'Поиск: ФИО, почта, город…',
    pushCampaign: 'Push-рассылка', title: 'Заголовок', text: 'Текст', sendTime: 'Время отправки', leaveEmpty: 'оставьте пустым для отправки сейчас',
    sendNow: 'Отправить сейчас', schedule: 'Запланировать', saving: 'Сохранение…', history: 'Последние кампании',
    sent: 'Доставлено', scheduled: 'Запланирована', requestError: 'Ошибка запроса', offlineError: 'Нет подключения к интернету.',
  },
  en: {
    language: 'RU', offline: 'You are offline. Previously loaded content remains available.',
    loading: 'Loading…', loadingProfile: 'Loading profile…', close: 'Close', back: 'Back',
    signOut: 'Sign out', signOutAccount: 'Sign out of account', navigation: 'Navigation', notifications: 'Notifications',
    sections: 'Meeting sections', participant: 'Participant', search: 'Search the portal', searchPlaceholder: 'Enter a keyword…',
    searchEmpty: 'No pages match this search.', searchHint: 'Start typing to find a page.',
    install: 'Install app', portal: 'MEMBERS PORTAL', installTitle: 'Add the app to your home screen',
    installText: 'The portal is available after installing ZIEMER USER MEETING as an app.',
    ios: 'Tap “Share”, then “Add to Home Screen”.', installHint: 'Press the button below and confirm installation in your browser.',
    installed: 'I added the app', continueInstall: 'Continue after installation',
    blocked: 'ACCESS RESTRICTED', blockedTitle: 'Your account is blocked', blockedText: 'Contact the organisers if you believe your account was blocked by mistake.',
    login: 'Sign in', register: 'Create account', welcome: 'Welcome', createAccount: 'Create your account',
    loginText: 'Sign in to the private participant portal.', registerText: 'Complete your participant profile to enter the private portal.',
    fullName: 'Full name', workplace: 'Workplace', city: 'City', phone: 'Phone', optional: 'optional', email: 'Email', password: 'Password',
    wait: 'Please wait…', hasAccount: 'Already have an account?', noAccount: 'No account yet?',
    admin: 'ADMINISTRATION', adminTitle: 'Administrator dashboard', users: 'Users', campaigns: 'Campaigns',
    user: 'Participant', status: 'Status', actions: 'Actions', active: 'Active', blockedStatus: 'Blocked',
    block: 'Block', unblock: 'Unblock', usersEmpty: 'No users found.', adminSearch: 'Search: name, email, city…',
    pushCampaign: 'Push campaign', title: 'Title', text: 'Message', sendTime: 'Send time', leaveEmpty: 'leave empty to send now',
    sendNow: 'Send now', schedule: 'Schedule', saving: 'Saving…', history: 'Recent campaigns',
    sent: 'Delivered', scheduled: 'Scheduled', requestError: 'Request failed', offlineError: 'No internet connection.',
  },
}

const LanguageContext = createContext(null)
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('ziemer-language') || 'ru')
  useEffect(() => {
    localStorage.setItem('ziemer-language', language)
    document.documentElement.lang = language
  }, [language])
  const t = (key) => dictionaries[language][key] ?? key
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}
export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider')
  return value
}
