import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getConferenceContent } from '../data/conference'
import { useLanguage } from '../i18n'

const extraText = {
  ru: { program: 'регистрация кофе научная программа доклады спикеры инженеры обед aquariuz clear supra', venue: 'отель москва radisson collection украина кутузовский коллекшен лаунж указатели', info: 'регистрация контакты организаторы менеджер фемтомед черкашина екатерина букина ольга телефон оперативные вопросы', culture: 'джаз-клуб бутмана ужин музыка группа ва-банкъ сбор автобус навигация фемтомед', recording: 'выступления видео запись', photos: 'галерея фотографии', abstracts: 'тезисы zum 2026 после мероприятия обновления', materials: 'буклеты aquariuz flow suite книга ценностей opto xlink ferrara ring clear для пациентов femtomed сайт', feedback: 'отзыв оценка пожелания' },
  en: { program: 'registration coffee scientific programme talks speakers engineers lunch aquariuz clear supra', venue: 'hotel moscow radisson collection ukraine kutuzovsky collection lounge signs', info: 'registration contacts organisers manager femtomed cherkashina ekaterina bukina olga phone operational questions', culture: 'butman jazz club dinner music va-bank band gathering bus navigation femtomed', recording: 'talks video recording', photos: 'gallery photos', abstracts: 'zum 2026 abstracts after the event updates', materials: 'booklets aquariuz flow suite book of values opto xlink ferrara ring clear for patients femtomed website', feedback: 'feedback rating suggestions' },
}

export function SearchPanel({ query, onClose }) {
  const { language, t } = useLanguage()
  const { sections, pageContent, schedule = [], cultureSchedule = [], programMeta = [] } = getConferenceContent(language)
  const needle = query.trim().toLocaleLowerCase(language)
  const toSearchText = (items) => items
    .flatMap((item) => [item.time, item.title, item.speaker, item.note, item.label, item.value, ...(item.speakers || []).flatMap((speaker) => [speaker.name, speaker.note])])
    .filter(Boolean)
    .join(' ')
  const programSearchText = toSearchText([...schedule, ...programMeta])
  const cultureSearchText = toSearchText(cultureSchedule)
  const results = !needle ? [] : sections
    .map((section) => {
      const page = pageContent[section.id]
      const extra = `${extraText[language][section.id]} ${section.id === 'program' ? programSearchText : section.id === 'culture' ? cultureSearchText : ''}`
      const text = `${section.title} ${section.caption} ${page.title} ${page.text} ${extra}`.toLocaleLowerCase(language)
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
