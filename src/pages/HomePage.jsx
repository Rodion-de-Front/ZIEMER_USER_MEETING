import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sections } from '../data/conference'

const tileThemes = ['tile-sand', 'tile-soft-blue', 'tile-coral', '']

export function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-meta"><span className="meta-line" />Москва · 9 октября 2026</div>
        <h1>ZIEMER<br />USER <em>MEETING</em></h1>
        <div className="hero-bottom">
          <div><p>ДАТА</p><strong>09.10.2026</strong></div>
          <div className="hero-location"><MapPin size={14} />Москва<br /><span>Four Seasons Hotel</span></div>
        </div>
      </section>
      <section className="stats" aria-label="Ключевая информация">
        <div><CalendarDays size={22} /><span>Дата</span><strong>09.10</strong></div>
        <div><Users size={22} /><span>Формат</span><strong>Очно</strong></div>
      </section>
      <section aria-labelledby="sections-title">
        <div className="section-heading">
          <div><p className="eyebrow">Навигация</p><h2 id="sections-title">Всё о встрече</h2></div>
          <span className="section-count">08 РАЗДЕЛОВ</span>
        </div>
        <nav className="tiles" aria-label="Разделы встречи">
          {sections.map(({ id, title, caption, icon: Icon }, index) => (
            <Link className={`tile ${tileThemes[index % tileThemes.length]}`} to={`/${id}`} key={id}>
              <span className="tile-icon"><Icon size={21} /></span>
              <span className="tile-copy"><strong>{title}</strong><small>{caption}</small></span>
              <ArrowUpRight className="tile-arrow" size={19} />
            </Link>
          ))}
        </nav>
      </section>
    </>
  )
}
