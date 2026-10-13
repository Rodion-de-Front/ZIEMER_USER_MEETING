import { ArrowRight, ArrowUpRight, Camera, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { clubGallery, galleryUrl } from "../data/gallery";
import { useLanguage } from "../i18n";

export function HomePage() {
  const { language } = useLanguage();
  const en = language === "en";
  const copy = en
    ? {
        eyebrow: "A private professional community",
        intro: "A place for those shaping the future of ophthalmology",
        body: "Knowledge, clinical experience and conversations that continue beyond the conference room.",
        eventEyebrow: "The latest club event",
        eventTitle: "ZIEMER User Meeting 2026",
        eventText: "One day of live surgery, clinical cases, expert discussion and meetings with colleagues.",
        eventCta: "Explore the meeting",
        photosEyebrow: "Club chronicle · 09.10.2026",
        photosTitle: "How it was",
        photosText: "The people, conversations and atmosphere of ZIEMER × FEMTOMED in Moscow.",
        galleryCta: "Open all 862 photos",
        date: "9 October 2026",
        place: "Moscow",
        photographer: "Photo: Slava Semenov",
      }
    : {
        eyebrow: "Закрытое профессиональное сообщество",
        intro: "Место для тех, кто формирует будущее офтальмологии",
        body: "Знания, клинический опыт и общение, которое продолжается за пределами конференц-зала.",
        eventEyebrow: "Последнее событие клуба",
        eventTitle: "ZIEMER User Meeting 2026",
        eventText: "Один день живой хирургии, клинических кейсов, экспертных дискуссий и встреч с коллегами.",
        eventCta: "Перейти к встрече",
        photosEyebrow: "Хроника клуба · 09.10.2026",
        photosTitle: "Как это было",
        photosText: "Люди, разговоры и атмосфера встречи ZIEMER × FEMTOMED в Москве.",
        galleryCta: "Смотреть все 862 фото",
        date: "9 октября 2026",
        place: "Москва",
        photographer: "Фото: Слава Семёнов",
      };

  return (
    <main className="club-home">
      <section className="club-hero">
        <div className="club-hero-copy">
          <p className="club-kicker"><span />{copy.eyebrow}</p>
          <h1><span>ZIEMER</span> CLUB</h1>
          <p className="club-hero-lead">{copy.intro}</p>
          <p className="club-hero-body">{copy.body}</p>
          <Link className="club-primary-link" to="/meeting">
            {copy.eventCta}<ArrowRight size={18} />
          </Link>
        </div>
        <div className="club-hero-collage" aria-label={en ? "ZIEMER Club members" : "Участники ZIEMER Club"}>
          <figure className="club-hero-photo club-hero-photo-main">
            <img src={clubGallery[1].src} alt={en ? clubGallery[1].altEn : clubGallery[1].altRu} />
          </figure>
          <figure className="club-hero-photo club-hero-photo-side">
            <img src={clubGallery[5].src} alt={en ? clubGallery[5].altEn : clubGallery[5].altRu} />
          </figure>
          <span className="club-hero-mark" aria-hidden="true">Z</span>
        </div>
      </section>

      <section className="club-event-section" aria-labelledby="club-event-title">
        <div className="club-event-card">
          <div className="club-event-number" aria-hidden="true">09</div>
          <div className="club-event-copy">
            <p className="club-kicker club-kicker-light"><span />{copy.eventEyebrow}</p>
            <h2 id="club-event-title">{copy.eventTitle}</h2>
            <p>{copy.eventText}</p>
            <div className="club-event-meta">
              <span><CalendarDays size={17} />{copy.date}</span>
              <span><MapPin size={17} />{copy.place}</span>
            </div>
          </div>
          <Link className="club-event-link" to="/meeting" aria-label={copy.eventCta}>
            <ArrowUpRight size={24} />
          </Link>
        </div>
      </section>

      <section className="club-gallery-section" aria-labelledby="club-gallery-title">
        <div className="club-gallery-heading">
          <div>
            <p className="club-kicker"><span />{copy.photosEyebrow}</p>
            <h2 id="club-gallery-title">{copy.photosTitle}</h2>
          </div>
          <p>{copy.photosText}</p>
        </div>
        <div className="club-photo-grid club-photo-grid-preview">
          {clubGallery.slice(0, 6).map((photo, index) => (
            <a href={galleryUrl} target="_blank" rel="noreferrer" className={`club-photo club-photo-${index + 1}`} key={photo.src}>
              <img loading={index > 1 ? "lazy" : "eager"} src={photo.src} alt={en ? photo.altEn : photo.altRu} />
            </a>
          ))}
        </div>
        <div className="club-gallery-footer">
          <span><Camera size={18} />{copy.photographer}</span>
          <a className="club-outline-link" href={galleryUrl} target="_blank" rel="noreferrer">
            {copy.galleryCta}<ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}
