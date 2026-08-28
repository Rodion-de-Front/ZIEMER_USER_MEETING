import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, Download, Eye, Image, MapPin, Play, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { pageContent, schedule } from '../data/conference'

export function DetailPage() {
  const { pageId } = useParams()
  const item = pageContent[pageId]
  const [sent, setSent] = useState(false)
  const [rating, setRating] = useState(0)
  if (!item) return null
  const Icon = item.icon
  const block = (title, children) => <section className="detail-block"><h3>{title}</h3>{children}</section>
  const bodies = {
    program: <><div className="program-date"><span>09</span><div><strong>ОКТЯБРЯ 2026</strong><small>пятница · Москва</small></div></div><div className="schedule">{schedule.map(([time, title, person]) => <article key={time}><time>{time}</time><div><strong>{title}</strong><span>{person}</span></div></article>)}</div></>,
    venue: <><div className="venue-card"><p className="eyebrow">Место встречи</p><h3>Four Seasons Hotel Moscow</h3><p>ул. Охотный Ряд, 2<br />Москва, Россия</p><div className="venue-pin"><MapPin size={19} /> Конференц-зал «Чайковский», 2 этаж</div></div>{block('Как добраться', <p>Ближайшая станция метро — «Охотный Ряд», выход № 7. Вход через главный вестибюль; стойка регистрации ZIEMER находится справа от входа.</p>)}</>,
    info: <>{block('Регистрация', <p>Стойка регистрации открывается в 09:30. Для получения бейджа назовите фамилию и покажите персональную ссылку.</p>)}{block('Контакты организаторов', <div className="contact-list"><a href="mailto:zum@femtomed.ru">zum@femtomed.ru</a><a href="tel:+74951234567">+7 (495) 123-45-67</a></div>)}</>,
    culture: <><div className="culture-cover"><Sparkles size={35} /><span>19:30 · 9 октября</span><h3>Вечер ZIEMER</h3><p>Ужин, музыка и общение в кругу коллег</p></div>{block('Программа вечера', <ul className="plain-list"><li>19:30 — Сбор гостей и welcome drink</li><li>20:00 — Приветствие и ужин</li><li>21:30 — Музыкальная программа</li></ul>)}</>,
    recording: <div className="media-grid">{['Открытие ZUM 2026', 'FEMTO Z8 NEO', 'CLEAR Supra'].map((name) => <article className="video-card" key={name}><div className="media-thumb"><Play size={26} /></div><strong>{name}</strong><small>Запись станет доступна после мероприятия</small></article>)}</div>,
    photos: <div className="gallery">{['Регистрация участников', 'Деловая программа', 'Вечер ZIEMER', 'Общение коллег', 'Круглый стол', 'Команда ZIEMER'].map((name, index) => <article key={name} className={`gallery-item gallery-${index + 1}`}><Image size={25} /><span>{name}</span></article>)}</div>,
    materials: <div className="downloads">{['Презентация ZUM', 'Каталог решений ZIEMER', 'Макеты букетов', 'Видео: CLEAR Supra'].map((name) => <button key={name}><span className="download-type">PDF</span><strong>{name}</strong><Download size={18} /></button>)}</div>,
    feedback: <form className="feedback-form" onSubmit={(event) => { event.preventDefault(); setSent(true) }}>
      <label>Ваше ФИО<input required name="fullName" placeholder="Иванов Иван Иванович" autoComplete="name" /></label>
      <fieldset className="rating-fieldset">
        <legend>Как прошла встреча?</legend>
        <div className="rating-scale" role="radiogroup" aria-label="Оценка встречи">
          {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={rating >= value ? 'is-selected' : ''} aria-label={`Оценка ${value} из 5`} aria-pressed={rating === value} onClick={() => setRating(value)}>
            <Eye size={22} />
          </button>)}
        </div>
        <div className="rating-captions"><span>Можно лучше</span><strong>{rating ? ['','Сдержанно','Неплохо','Полезно','Очень хорошо','Безупречно'][rating] : 'Выберите оценку'}</strong><span>Вдохновляюще</span></div>
      </fieldset>
      <label>Ваш отзыв<textarea required placeholder="Расскажите, что было особенно полезно" /></label>
      <button className="button button-primary" disabled={!rating}>{sent ? 'Спасибо за отзыв!' : 'Отправить отзыв'}<ArrowUpRight size={18} /></button>
    </form>,
  }
  return <main className="detail-page"><section className="detail-hero"><div className="detail-heading"><Link className="back-button" to="/"><ArrowLeft size={17} /> Назад</Link><p className="eyebrow">{item.eyebrow}</p></div><div className="detail-title-row"><span className="detail-icon"><Icon size={28} /></span><h1>{item.title}</h1></div><p>{item.text}</p></section><section className="detail-content">{bodies[pageId]}</section></main>
}
