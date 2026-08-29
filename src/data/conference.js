import { CalendarDays, CircleHelp, FileText, Image, MapPin, MessageCircleHeart, Play, Sparkles, Video } from 'lucide-react'

export const content = {
ru: {
sections: [
  { id: 'program', title: 'Программа ZUM', caption: 'Расписание и спикеры', icon: CalendarDays },
  { id: 'venue', title: 'Место проведения', caption: 'Как добраться', icon: MapPin },
  { id: 'info', title: 'Информация для участников', caption: 'Всё, что важно знать', icon: CircleHelp },
  { id: 'culture', title: 'Культурная программа', caption: 'Вечер ZIEMER', icon: Sparkles },
  { id: 'recording', title: 'Запись ZUM', caption: 'Смотрите после встречи', icon: Video },
  { id: 'photos', title: 'Фото ZUM', caption: 'Моменты мероприятия', icon: Image },
  { id: 'materials', title: 'Полезные материалы', caption: 'Видео и файлы', icon: FileText },
  { id: 'feedback', title: 'Отзывы и пожелания', caption: 'Ваше мнение важно', icon: MessageCircleHeart },
],

pageContent: {
  program: { eyebrow: '9 октября · 09:30–18:00', title: 'Программа ZIEMER USER MEETING', text: 'Программа встречи, выступления экспертов и время для общения будут опубликованы здесь.', icon: CalendarDays },
  venue: { eyebrow: 'г. Москва', title: 'Место проведения', text: 'Точная площадка, маршрут, парковка и схема входа появятся на этой странице перед мероприятием.', icon: MapPin },
  info: { eyebrow: 'Для участников', title: 'Полезная информация', text: 'Здесь мы соберём ответы на частые вопросы, контакты организаторов и важные обновления.', icon: CircleHelp },
  culture: { eyebrow: 'Вечерняя программа', title: 'Культурная программа', text: 'Подробности о вечерней программе и дресс-коде будут доступны участникам в ближайшее время.', icon: Sparkles },
  recording: { eyebrow: 'После мероприятия', title: 'Запись ZUM', text: 'Запись выступлений станет доступна здесь после завершения ZIEMER USER MEETING.', icon: Play },
  photos: { eyebrow: 'После мероприятия', title: 'Фото ZUM', text: 'Фотографии с мероприятия будут собраны в закрытой галерее для участников.', icon: Image },
  materials: { eyebrow: 'Медиатека', title: 'Полезные материалы', text: 'Видеоролики, материалы спикеров и макеты букетов будут доступны для скачивания.', icon: FileText },
  feedback: { eyebrow: 'Ваш голос', title: 'Отзывы и пожелания', text: 'Поделитесь впечатлениями — это поможет нам сделать следующие встречи ещё лучше.', icon: MessageCircleHeart },
},

schedule: [
  ['09:30', 'Регистрация и welcome coffee', 'Холл конференц-зала'],
  ['10:00', 'Открытие ZIEMER USER MEETING', 'Елена Ковалёва · ZIEMER'],
  ['10:25', 'Новые возможности FEMTO Z8 NEO', 'Александр Миронов'],
  ['11:15', 'Кофе-брейк', 'Фойе'],
  ['11:45', 'Клинические случаи: CLEAR Supra', 'Д-р Максим Черепов'],
  ['13:00', 'Обед и нетворкинг', 'Ресторан площадки'],
  ['14:30', 'Круглый стол с экспертами', 'Конференц-зал'],
  ['16:00', 'Закрытие деловой программы', 'Конференц-зал'],
],
},
en: {
sections: [
  { id: 'program', title: 'ZUM programme', caption: 'Schedule and speakers', icon: CalendarDays },
  { id: 'venue', title: 'Venue', caption: 'How to get there', icon: MapPin },
  { id: 'info', title: 'Participant information', caption: 'Everything you need to know', icon: CircleHelp },
  { id: 'culture', title: 'Cultural programme', caption: 'ZIEMER evening', icon: Sparkles },
  { id: 'recording', title: 'ZUM recording', caption: 'Watch after the meeting', icon: Video },
  { id: 'photos', title: 'ZUM photos', caption: 'Event moments', icon: Image },
  { id: 'materials', title: 'Useful materials', caption: 'Videos and files', icon: FileText },
  { id: 'feedback', title: 'Feedback and suggestions', caption: 'Your opinion matters', icon: MessageCircleHeart },
],
pageContent: {
  program: { eyebrow: '9 October · 09:30–18:00', title: 'ZIEMER USER MEETING programme', text: 'The meeting programme, expert talks and networking time will be published here.', icon: CalendarDays },
  venue: { eyebrow: 'Moscow', title: 'Venue', text: 'The exact venue, route, parking and entrance map will appear here before the event.', icon: MapPin },
  info: { eyebrow: 'For participants', title: 'Useful information', text: 'Here we will collect answers to common questions, organiser contacts and important updates.', icon: CircleHelp },
  culture: { eyebrow: 'Evening programme', title: 'Cultural programme', text: 'Details of the evening programme and dress code will be available to participants soon.', icon: Sparkles },
  recording: { eyebrow: 'After the event', title: 'ZUM recording', text: 'Recordings of the presentations will be available here after ZIEMER USER MEETING.', icon: Play },
  photos: { eyebrow: 'After the event', title: 'ZUM photos', text: 'Event photos will be collected in a private gallery for participants.', icon: Image },
  materials: { eyebrow: 'Media library', title: 'Useful materials', text: 'Videos, speaker materials and bouquet layouts will be available to download.', icon: FileText },
  feedback: { eyebrow: 'Your voice', title: 'Feedback and suggestions', text: 'Share your impressions — they will help us make future meetings better.', icon: MessageCircleHeart },
},
schedule: [
  ['09:30', 'Registration and welcome coffee', 'Conference hall lobby'],
  ['10:00', 'ZIEMER USER MEETING opening', 'Elena Kovalyova · ZIEMER'],
  ['10:25', 'New FEMTO Z8 NEO capabilities', 'Alexander Mironov'],
  ['11:15', 'Coffee break', 'Foyer'],
  ['11:45', 'Clinical cases: CLEAR Supra', 'Dr Maxim Cherepov'],
  ['13:00', 'Lunch and networking', 'Venue restaurant'],
  ['14:30', 'Expert round table', 'Conference hall'],
  ['16:00', 'Business programme closing', 'Conference hall'],
],
},
}

export const getConferenceContent = (language) => content[language] || content.ru
