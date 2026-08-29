import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getConferenceContent } from '../data/conference'
import { useLanguage } from '../i18n'

const tileThemes = ['tile-sand', 'tile-soft-blue', 'tile-coral', '']

export function HomePage() {
  const { language } = useLanguage()
  const { sections } = getConferenceContent(language)
  const copy = language === 'en'
    ? { meta: 'Moscow · 9 October 2026', date: 'DATE', location: 'Moscow', format: 'Format', inPerson: 'In person', nav: 'Navigation', title: 'All about the meeting', sections: '08 SECTIONS', aria: 'Key information', navAria: 'Meeting sections' }
    : { meta: 'Москва · 9 октября 2026', date: 'ДАТА', location: 'Москва', format: 'Формат', inPerson: 'Очно', nav: 'Навигация', title: 'Всё о встрече', sections: '08 РАЗДЕЛОВ', aria: 'Ключевая информация', navAria: 'Разделы встречи' }
  return (
    <>
      <section className="hero-section">
        <div className="hero-meta"><span className="meta-line" />{copy.meta}</div>
        <h1>ZIEMER<br />USER <em>MEETING</em></h1>
        <div className="hero-bottom">
          <div><p>{copy.date}</p><strong>09.10.2026</strong></div>
          <div className="hero-location"><MapPin size={14} />{copy.location}<br /><span>Four Seasons Hotel</span></div>
        </div>
      </section>
      <section className="stats" aria-label={copy.aria}>
        <div><CalendarDays size={22} /><span>{copy.date}</span><strong>09.10</strong></div>
        <div><Users size={22} /><span>{copy.format}</span><strong>{copy.inPerson}</strong></div>
      </section>
      <section aria-labelledby="sections-title">
        <div className="section-heading">
          <div><p className="eyebrow">{copy.nav}</p><h2 id="sections-title">{copy.title}</h2></div>
          <span className="section-count">{copy.sections}</span>
        </div>
        <nav className="tiles" aria-label={copy.navAria}>
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
