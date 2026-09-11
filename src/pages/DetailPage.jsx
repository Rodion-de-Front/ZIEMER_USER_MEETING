import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, Download, Eye, Image, MapPin, Play, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getConferenceContent } from '../data/conference'
import { useLanguage } from '../i18n'
import { api } from '../lib/api'

export function DetailPage() {
  const { pageId } = useParams()
  const { language, t } = useLanguage()
  const { pageContent, schedule } = getConferenceContent(language)
  const item = pageContent[pageId]
  const [sent, setSent] = useState(false)
  const [rating, setRating] = useState(0)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  if (!item) return null
  const Icon = item.icon
  const en = language === 'en'
  const block = (title, children) => <section className="detail-block"><h3>{title}</h3>{children}</section>
  async function sendFeedback(event) {
    event.preventDefault()
    if (!rating) return
    const formData = new FormData(event.currentTarget)
    setSending(true)
    setError('')
    try {
      await api('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.get('fullName'),
          rating,
          message: formData.get('message'),
        }),
      })
      setSent(true)
      event.currentTarget.reset()
      setRating(0)
    } catch (feedbackError) {
      setError(feedbackError.message)
    } finally {
      setSending(false)
    }
  }
  const bodies = {
    program: <><div className="program-date"><span>09</span><div><strong>{en ? 'OCTOBER 2026' : 'ОКТЯБРЯ 2026'}</strong><small>{en ? 'Friday · Moscow' : 'пятница · Москва'}</small></div></div><div className="schedule">{schedule.map(([time, title, person]) => <article key={time}><time>{time}</time><div><strong>{title}</strong><span>{person}</span></div></article>)}</div></>,
    venue: <><div className="venue-card"><p className="eyebrow">{en ? 'Meeting venue' : 'Место встречи'}</p><h3>Four Seasons Hotel Moscow</h3><p>{en ? '2 Okhotny Ryad St.' : 'ул. Охотный Ряд, 2'}<br />Moscow, Russia</p><div className="venue-pin"><MapPin size={19} /> {en ? 'Tchaikovsky conference hall, floor 2' : 'Конференц-зал «Чайковский», 2 этаж'}</div></div>{block(en ? 'How to get there' : 'Как добраться', <p>{en ? 'The nearest metro station is Okhotny Ryad, exit 7. Enter through the main lobby; the ZIEMER registration desk is to the right of the entrance.' : 'Ближайшая станция метро — «Охотный Ряд», выход № 7. Вход через главный вестибюль; стойка регистрации ZIEMER находится справа от входа.'}</p>)}</>,
    info: <>{block(en ? 'Registration' : 'Регистрация', <p>{en ? 'Registration opens at 09:30. To receive your badge, state your surname and show your personal link.' : 'Стойка регистрации открывается в 09:30. Для получения бейджа назовите фамилию и покажите персональную ссылку.'}</p>)}{block(en ? 'Organiser contacts' : 'Контакты организаторов', <div className="contact-list"><a href="mailto:zum@femtomed.ru">zum@femtomed.ru</a><a href="tel:+74951234567">+7 (495) 123-45-67</a></div>)}</>,
    culture: <><div className="culture-cover"><Sparkles size={35} /><span>{en ? '19:30 · 9 October' : '19:30 · 9 октября'}</span><h3>ZIEMER {en ? 'evening' : 'Вечер'}</h3><p>{en ? 'Dinner, music and conversations with colleagues' : 'Ужин, музыка и общение в кругу коллег'}</p></div>{block(en ? 'Evening programme' : 'Программа вечера', <ul className="plain-list"><li>{en ? '19:30 — Guest arrival and welcome drink' : '19:30 — Сбор гостей и welcome drink'}</li><li>{en ? '20:00 — Welcome and dinner' : '20:00 — Приветствие и ужин'}</li><li>{en ? '21:30 — Music programme' : '21:30 — Музыкальная программа'}</li></ul>)}</>,
    recording: <div className="media-grid">{(en ? ['ZUM 2026 opening', 'FEMTO Z8 NEO', 'CLEAR Supra'] : ['Открытие ZUM 2026', 'FEMTO Z8 NEO', 'CLEAR Supra']).map((name) => <article className="video-card" key={name}><div className="media-thumb"><Play size={26} /></div><strong>{name}</strong><small>{en ? 'Recording will be available after the event' : 'Запись станет доступна после мероприятия'}</small></article>)}</div>,
    photos: <div className="gallery">{(en ? ['Participant registration', 'Business programme', 'ZIEMER evening', 'Colleague networking', 'Round table', 'ZIEMER team'] : ['Регистрация участников', 'Деловая программа', 'Вечер ZIEMER', 'Общение коллег', 'Круглый стол', 'Команда ZIEMER']).map((name, index) => <article key={name} className={`gallery-item gallery-${index + 1}`}><Image size={25} /><span>{name}</span></article>)}</div>,
    materials: <div className="downloads">{(en ? ['ZUM presentation', 'ZIEMER solutions catalogue', 'Bouquet layouts', 'Video: CLEAR Supra'] : ['Презентация ZUM', 'Каталог решений ZIEMER', 'Макеты букетов', 'Видео: CLEAR Supra']).map((name) => <button key={name}><span className="download-type">PDF</span><strong>{name}</strong><Download size={18} /></button>)}</div>,
    feedback: <form className="feedback-form" onSubmit={sendFeedback}>
      <label>{t('fullName')}<input required name="fullName" placeholder={en ? 'Jane Smith' : 'Иванов Иван Иванович'} autoComplete="name" /></label>
      <fieldset className="rating-fieldset">
        <legend>{en ? 'How was the meeting?' : 'Как прошла встреча?'}</legend>
        <div className="rating-scale" role="radiogroup" aria-label={en ? 'Meeting rating' : 'Оценка встречи'}>
          {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={rating >= value ? 'is-selected' : ''} aria-label={en ? `Rating ${value} of 5` : `Оценка ${value} из 5`} aria-pressed={rating === value} onClick={() => setRating(value)}>
            <Eye size={22} />
          </button>)}
        </div>
        <div className="rating-captions"><span>{en ? 'Could be better' : 'Можно лучше'}</span><strong>{rating ? (en ? ['', 'Reserved', 'Not bad', 'Useful', 'Very good', 'Excellent'] : ['', 'Сдержанно', 'Неплохо', 'Полезно', 'Очень хорошо', 'Безупречно'])[rating] : (en ? 'Choose a rating' : 'Выберите оценку')}</strong><span>{en ? 'Inspiring' : 'Вдохновляюще'}</span></div>
      </fieldset>
      <label>{en ? 'Your feedback' : 'Ваш отзыв'}<textarea required name="message" placeholder={en ? 'Tell us what was especially useful' : 'Расскажите, что было особенно полезно'} /></label>
      {error && <p className="form-status" role="alert">{error}</p>}
      {sent && !error && <p className="form-status" role="status">{en ? 'Thank you for your feedback!' : 'Спасибо за отзыв!'}</p>}
      <button className="button button-primary" disabled={!rating || sending}>{sending ? t('saving') : (en ? 'Send feedback' : 'Отправить отзыв')}<ArrowUpRight size={18} /></button>
    </form>,
  }
  return <main className="detail-page"><section className="detail-hero"><div className="detail-heading"><Link className="back-button" to="/"><ArrowLeft size={17} /> {t('back')}</Link><p className="eyebrow">{item.eyebrow}</p></div><div className="detail-title-row"><span className="detail-icon"><Icon size={28} /></span><h1>{item.title}</h1></div><p>{item.text}</p></section><section className="detail-content">{bodies[pageId]}</section></main>
}
