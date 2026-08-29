import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getConferenceContent } from '../data/conference'
import { useLanguage } from '../i18n'

const extraText = {
  ru: { program: 'регистрация кофе открытие клинические случаи обед круглый стол', venue: 'отель москва охотный ряд метро парковка', info: 'регистрация бейдж контакты организаторы', culture: 'ужин музыка вечер дресс-код', recording: 'выступления видео запись', photos: 'галерея фотографии', materials: 'видео презентации файлы скачать', feedback: 'отзыв оценка пожелания' },
  en: { program: 'registration coffee opening clinical cases lunch round table', venue: 'hotel moscow okhotny ryad metro parking', info: 'registration badge contacts organisers', culture: 'dinner music evening dress code', recording: 'talks video recording', photos: 'gallery photos', materials: 'videos presentations files download', feedback: 'feedback rating suggestions' },
}

export function SearchPanel({ query, onClose }) {
  const { language, t } = useLanguage()
  const { sections, pageContent } = getConferenceContent(language)
  const needle = query.trim().toLocaleLowerCase(language)
  const results = !needle ? [] : sections
    .map((section) => {
      const page = pageContent[section.id]
      const text = `${section.title} ${section.caption} ${page.title} ${page.text} ${extraText[language][section.id]}`.toLocaleLowerCase(language)
      const words = needle.split(/\s+/)
      const score = words.reduce((total, word) => total + (section.title.toLocaleLowerCase(language).includes(word) ? 5 : 0) + (page.text.toLocaleLowerCase(language).includes(word) ? 2 : 0) + (text.includes(word) ? 1 : 0), 0)
      return { ...section, text: page.text, score }
    })
    .filter((result) => result.score)
    .sort((a, b) => b.score - a.score)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!event.target.closest('.search-panel') && !event.target.closest('.header-search-input')) onClose()
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [onClose])

  return <section className="search-panel" role="dialog" aria-modal="true" aria-label={t('search')}>
      <div className="search-panel-header"><span>{t('search')}</span><button type="button" onClick={onClose} aria-label={t('close')}><X size={19} /></button></div>
      <div className="search-results">
        {!needle && <p className="empty-state">{t('searchHint')}</p>}
        {needle && !results.length && <p className="empty-state">{t('searchEmpty')}</p>}
        {results.map((result) => <Link to={`/${result.id}`} onClick={onClose} key={result.id}><strong>{result.title}</strong><span>{result.text}</span></Link>)}
      </div>
    </section>
}
