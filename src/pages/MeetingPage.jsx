import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getConferenceContent } from "../data/conference";
import { useLanguage } from "../i18n";

const tileThemes = ["tile-sand", "tile-soft-blue", "tile-coral", ""];

export function MeetingPage() {
  const { language } = useLanguage();
  const { sections } = getConferenceContent(language);
  const en = language === "en";

  return (
    <main className="meeting-page">
      <section className="meeting-hero">
        <Link className="meeting-back" to="/"><ArrowLeft size={17} />{en ? "ZIEMER Club home" : "На главную клуба"}</Link>
        <p className="club-kicker club-kicker-light"><span />{en ? "Club event · Moscow" : "Событие клуба · Москва"}</p>
        <h1><em>ZIEMER</em><br />USER MEETING</h1>
        <div className="meeting-hero-meta">
          <span><CalendarDays size={18} />{en ? "9 October 2026" : "9 октября 2026"}</span>
          <span><MapPin size={18} />Radisson Collection Hotel</span>
        </div>
      </section>
      <section className="meeting-navigation" aria-labelledby="meeting-sections-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{en ? "Meeting archive" : "Архив встречи"}</p>
            <h2 id="meeting-sections-title">{en ? "Programme and materials" : "Программа и материалы"}</h2>
          </div>
          <span className="section-count">09</span>
        </div>
        <nav className="tiles" aria-label={en ? "Meeting sections" : "Разделы встречи"}>
          {sections.map(({ id, title, caption, icon: Icon }, index) => (
            <Link className={`tile ${tileThemes[index % tileThemes.length]}`} to={`/${id}`} key={id}>
              <span className="tile-icon"><Icon size={21} /></span>
              <span className="tile-copy"><strong>{title}</strong><small>{caption}</small></span>
              <ArrowUpRight className="tile-arrow" size={19} />
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
