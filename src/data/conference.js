import { CalendarDays, CircleHelp, FileText, Image, MapPin, MessageCircleHeart, Play, Sparkles, Video } from 'lucide-react'

export const sections = [
  { id: 'program', title: 'Программа ZUM', caption: 'Расписание и спикеры', icon: CalendarDays },
  { id: 'venue', title: 'Место проведения', caption: 'Как добраться', icon: MapPin },
  { id: 'info', title: 'Информация для участников', caption: 'Всё, что важно знать', icon: CircleHelp },
  { id: 'culture', title: 'Культурная программа', caption: 'Вечер ZIEMER', icon: Sparkles },
  { id: 'recording', title: 'Запись ZUM', caption: 'Смотрите после встречи', icon: Video },
  { id: 'photos', title: 'Фото ZUM', caption: 'Моменты мероприятия', icon: Image },
  { id: 'materials', title: 'Полезные материалы', caption: 'Видео и файлы', icon: FileText },
  { id: 'feedback', title: 'Отзывы и пожелания', caption: 'Ваше мнение важно', icon: MessageCircleHeart },
]

export const pageContent = {
  program: { eyebrow: '9 октября · 09:30–18:00', title: 'Программа ZIEMER USER MEETING', text: 'Программа встречи, выступления экспертов и время для общения будут опубликованы здесь.', icon: CalendarDays },
  venue: { eyebrow: 'г. Москва', title: 'Место проведения', text: 'Точная площадка, маршрут, парковка и схема входа появятся на этой странице перед мероприятием.', icon: MapPin },
  info: { eyebrow: 'Для участников', title: 'Полезная информация', text: 'Здесь мы соберём ответы на частые вопросы, контакты организаторов и важные обновления.', icon: CircleHelp },
  culture: { eyebrow: 'Вечерняя программа', title: 'Культурная программа', text: 'Подробности о вечерней программе и дресс-коде будут доступны участникам в ближайшее время.', icon: Sparkles },
  recording: { eyebrow: 'После мероприятия', title: 'Запись ZUM', text: 'Запись выступлений станет доступна здесь после завершения ZIEMER USER MEETING.', icon: Play },
  photos: { eyebrow: 'После мероприятия', title: 'Фото ZUM', text: 'Фотографии с мероприятия будут собраны в закрытой галерее для участников.', icon: Image },
  materials: { eyebrow: 'Медиатека', title: 'Полезные материалы', text: 'Видеоролики, материалы спикеров и макеты букетов будут доступны для скачивания.', icon: FileText },
  feedback: { eyebrow: 'Ваш голос', title: 'Отзывы и пожелания', text: 'Поделитесь впечатлениями — это поможет нам сделать следующие встречи ещё лучше.', icon: MessageCircleHeart },
}

export const schedule = [
  ['09:30', 'Регистрация и welcome coffee', 'Холл конференц-зала'],
  ['10:00', 'Открытие ZIEMER USER MEETING', 'Елена Ковалёва · ZIEMER'],
  ['10:25', 'Новые возможности FEMTO Z8 NEO', 'Александр Миронов'],
  ['11:15', 'Кофе-брейк', 'Фойе'],
  ['11:45', 'Клинические случаи: CLEAR Supra', 'Д-р Максим Черепов'],
  ['13:00', 'Обед и нетворкинг', 'Ресторан площадки'],
  ['14:30', 'Круглый стол с экспертами', 'Конференц-зал'],
  ['16:00', 'Закрытие деловой программы', 'Конференц-зал'],
]
