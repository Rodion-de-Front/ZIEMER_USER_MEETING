import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  MapPin,
  Play,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getConferenceContent } from "../data/conference";
import { Loader } from "../components/Loader";
import { useLanguage } from "../i18n";
import { api } from "../lib/api";

const PdfDocumentViewer = lazy(() =>
  import("../components/PdfDocumentViewer").then((module) => ({
    default: module.PdfDocumentViewer,
  })),
);

const yandexMapsVenueUrl =
  "https://yandex.com/maps/org/radisson_collection_hotel_moscow/1152255963/?filter=alternate_vertical%3ARequestWindow&ll=37.577682%2C55.748751&mode=search&sctx=ZAAAAAgBEAAaKAoSCcO68e7I1EJAEYEjgQab3EtAEhIJU3sRbcfU4D8RyxMIO8Wqxz8iBgABAgMEBSgKOABAhZIHSAFqAnJ1nQHNzMw9oAEAqAEAvQE%2FlLp5wgELsd7kzM8F24%2B4pQSCAiXQs9C%2B0YHRgtC40L3QuNGG0LAgwqvQo9C60YDQsNC40L3QsMK7igIAkgIAmgIMZGVza3RvcC1tYXBz2gIoChIJuoWuRKDIQkARVoT8qurfS0ASEgkAlC2SdqOnPxEAmEuqtpuQP%2BACAQ%3D%3D&sll=37.568949%2C55.748751&sspn=0.063507%2C0.022311&text=%D0%B3%D0%BE%D1%81%D1%82%D0%B8%D0%BD%D0%B8%D1%86%D0%B0%20%C2%AB%D0%A3%D0%BA%D1%80%D0%B0%D0%B8%D0%BD%D0%B0%C2%BB&z=14.92";

export function DetailPage() {
  const { pageId } = useParams();
  const { language, t } = useLanguage();
  const { pageContent, schedule, programMeta, cultureSchedule } =
    getConferenceContent(language);
  const item = pageContent[pageId];
  const [sent, setSent] = useState(false);
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [previewItem, setPreviewItem] = useState(null);
  const previewCloseButtonRef = useRef(null);
  const en = language === "en";
  const materials = [
    {
      title: "AQUARIUZ",
      href: "/materials/aquariuz.pdf",
    },
    {
      title: "FLOW SUITE",
      href: "/materials/flow-suite.pdf",
    },
    {
      title: en ? "Book of values" : "КНИГА ЦЕННОСТЕЙ",
      href: "/materials/ziemer-values.pdf",
    },
    {
      title: "OPTO XLINK",
      href: "/materials/opto-xlink.pdf",
    },
    {
      title: "FERRARA RING",
      href: "/materials/ferrara-ring.pdf",
    },
    {
      title: en ? "CLEAR for patients" : "CLEAR ДЛЯ ПАЦИЕНТОВ",
      href: "/materials/clear-for-patients.pdf",
    },
    {
      title: en ? "Information on the website" : "Информация на сайте",
      href: "https://femtomed.ru",
      external: true,
    },
  ];

  useEffect(() => {
    if (!previewItem) return undefined;

    const scrollY = window.scrollY;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setPreviewItem(null);
    };

    document.documentElement.classList.add("pdf-preview-open");
    document.body.style.top = `-${scrollY}px`;
    window.addEventListener("keydown", closeOnEscape);
    previewCloseButtonRef.current?.focus();

    return () => {
      document.documentElement.classList.remove("pdf-preview-open");
      document.body.style.top = "";
      window.removeEventListener("keydown", closeOnEscape);
      window.scrollTo(0, scrollY);
    };
  }, [previewItem]);

  if (!item) return null;
  const Icon = item.icon;

  const renderSchedule = (items) => (
    <div className="schedule">
      {items.map((entry) => (
        <article key={entry.time}>
          <time>{entry.time}</time>
          <div>
            <strong>{entry.title}</strong>
            {entry.speaker && (
              <span>
                {entry.speaker}
                {entry.note ? ` · ${entry.note}` : ""}
              </span>
            )}
            {!entry.speaker && entry.note && <span>{entry.note}</span>}
            {entry.speakers?.map((speaker) => (
              <span key={speaker.name}>
                {speaker.name}
                {speaker.note ? ` · ${speaker.note}` : ""}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
  const block = (title, children) => (
    <section className="detail-block">
      <h3>{title}</h3>
      {children}
    </section>
  );
  async function sendFeedback(event) {
    event.preventDefault();
    if (!rating) return;
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    setSending(true);
    setError("");
    try {
      await api("/feedback", {
        method: "POST",
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          rating,
          message: formData.get("message"),
        }),
      });
      setSent(true);
      formElement.reset();
      setRating(0);
    } catch (feedbackError) {
      setError(feedbackError.message);
    } finally {
      setSending(false);
    }
  }
  const bodies = {
    program: (
      <>
        <div className="program-date">
          <span>09</span>
          <div>
            <strong>{en ? "OCTOBER 2026" : "ОКТЯБРЯ 2026"}</strong>
            <small>{en ? "Friday · Moscow" : "пятница · Москва"}</small>
          </div>
        </div>
        <div className="program-meta">
          {programMeta.map((meta) => (
            <p key={meta.label}>
              <strong>{meta.label}</strong>
              {meta.value}
            </p>
          ))}
        </div>
        {renderSchedule(schedule)}
      </>
    ),
    venue: (
      <>
        <div className="venue-card">
          <p className="eyebrow">{en ? "Meeting venue" : "Место встречи"}</p>
          <h3>Radisson Collection Hotel</h3>
          <p>
            {en
              ? "Kutuzovsky Prospekt, 2/1, building 1"
              : "Кутузовский проспект, 2/1, стр. 1"}
            <br />
            {en ? "Hotel Ukraine, Moscow" : "гостиница «Украина», Москва"}
          </p>
          <div className="venue-pin">
            <MapPin size={19} />{" "}
            {en ? "Collection Lounge hall" : "Зал «Коллекшен Лаунж»"}
          </div>
        </div>
        <a
          className="button button-primary venue-map-button"
          href={yandexMapsVenueUrl}
          target="_blank"
          rel="noreferrer"
        >
          {en ? "Open in Yandex Maps" : "Смотреть в Яндекс Картах"}
          <ArrowUpRight size={18} />
        </a>
      </>
    ),
    info: (
      <>
        <p className="info-highlight">
          {en
            ? "On 9 October at ZUM 2026, for operational questions please call Olga Bukina: "
            : "09 октября на ZUM 2026 по оперативным вопросам звоните, пожалуйста, Ольге Букиной: "}
          <a href="tel:+79033284903">+79033284903</a>
        </p>
        {block(
          en ? "Registration" : "Регистрация",
          <p>
            {en
              ? "Registration and welcome coffee run from 09:00 to 10:00 at Radisson Collection Hotel."
              : "Регистрация и приветственный кофе пройдут с 09:00 до 10:00 в Radisson Collection Hotel."}
          </p>,
        )}
        {block(
          en ? "Organiser contacts" : "Контакты организаторов",
          <div className="contact-list">
            <span>
              {en
                ? "Your FEMTOMED manager"
                : "Ваш менеджер компании «ФЕМТОМЕД»"}
            </span>
            <div className="contact-person">
              <small>{en ? "Until 7 October" : "До 07 октября"}</small>
              <strong>
                {en ? "Ekaterina Cherkashina" : "Черкашина Екатерина"}
              </strong>
              <a href="tel:+79035126837">+79035126837</a>
            </div>
            <div className="contact-person">
              <small>{en ? "8–9 October" : "08–09 октября"}</small>
              <strong>{en ? "Olga Bukina" : "Букина Ольга"}</strong>
              <a href="tel:+79033284903">+79033284903</a>
            </div>
          </div>,
        )}
      </>
    ),
    culture: (
      <>
        <div className="program-date">
          <span>09</span>
          <div>
            <strong>{en ? "OCTOBER 2026" : "ОКТЯБРЯ 2026"}</strong>
            <small>
              {en ? "Friday · Butman Jazz Club" : "пятница · Джаз-клуб Бутмана"}
            </small>
          </div>
        </div>
        {renderSchedule(cultureSchedule)}
      </>
    ),
    recording: (
      <section className="materials-placeholder">
        <Play size={28} />
        <p>
          {en
            ? "Materials will appear after the event"
            : "Материалы появятся после мероприятия"}
        </p>
      </section>
    ),
    photos: (
      <section className="materials-placeholder">
        <p>
          {en
            ? "Materials will appear after the event"
            : "Материалы появятся после мероприятия"}
        </p>
      </section>
    ),
    abstracts: (
      <section className="materials-placeholder">
        <p>
          {en
            ? "They will be available after the event. Follow the updates"
            : "Материалы будут доступны после мероприятия. Следите за обновлениями"}
        </p>
      </section>
    ),
    materials: (
      <>
        <div className="downloads">
          {materials.map((item) =>
            item.external ? (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="download-type">WEB</span>
                <strong>{item.title}</strong>
                <ArrowUpRight size={18} />
              </a>
            ) : (
              <button
                className="download-row"
                key={item.title}
                type="button"
                onClick={() => setPreviewItem(item)}
                aria-label={
                  en ? `View ${item.title}` : `Просмотреть ${item.title}`
                }
              >
                <span className="download-type">PDF</span>
                <strong>{item.title}</strong>
                <Eye size={19} />
              </button>
            ),
          )}
        </div>
        <p className="materials-note">
          {en
            ? "Further information and videos are available at "
            : "Дополнительная информация и видео доступны на сайте "}
          <a href="https://femtomed.ru" target="_blank" rel="noreferrer">
            femtomed.ru
          </a>
          .
        </p>
      </>
    ),
    feedback: (
      <form className="feedback-form" onSubmit={sendFeedback}>
        <label>
          {t("fullName")}
          <input
            required
            name="fullName"
            placeholder={en ? "Jane Smith" : "Иванов Иван Иванович"}
            autoComplete="name"
          />
        </label>
        <fieldset className="rating-fieldset">
          <legend>
            {en
              ? "How was the meeting? Please rate it on a scale of one to five"
              : "Как прошла встреча? Оцените по пятибальной шкале"}
          </legend>
          <div
            className="rating-scale"
            role="radiogroup"
            aria-label={en ? "Meeting rating" : "Оценка встречи"}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={rating >= value ? "is-selected" : ""}
                aria-label={
                  en ? `Rating ${value} of 5` : `Оценка ${value} из 5`
                }
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
              >
                <Eye size={22} />
              </button>
            ))}
          </div>
          <div className="rating-captions">
            <span>{en ? "Could be better" : "Можно лучше"}</span>
            <strong>
              {rating
                ? (en
                    ? [
                        "",
                        "Reserved",
                        "Not bad",
                        "Useful",
                        "Very good",
                        "Excellent",
                      ]
                    : [
                        "",
                        "Сдержанно",
                        "Неплохо",
                        "Полезно",
                        "Очень хорошо",
                        "Безупречно",
                      ])[rating]
                : en
                  ? "Choose a rating"
                  : "Выберите оценку"}
            </strong>
            <span>{en ? "Inspiring" : "Вдохновляюще"}</span>
          </div>
        </fieldset>
        <label>
          {en ? "Your feedback" : "Ваш отзыв"}
          <textarea
            required
            name="message"
            placeholder={
              en
                ? "Tell us what was especially useful"
                : "Расскажите, что было особенно полезно"
            }
          />
        </label>
        {error && (
          <p className="form-status" role="alert">
            {error}
          </p>
        )}
        {sent && !error && (
          <p className="form-status" role="status">
            {en ? "Thank you for your feedback!" : "Спасибо за отзыв!"}
          </p>
        )}
        <button className="button button-primary" disabled={!rating || sending}>
          {sending ? (
            <Loader label={t("saving")} />
          ) : (
            <>
              {en ? "Send feedback" : "Отправить отзыв"}{" "}
              <ArrowUpRight size={18} />
            </>
          )}
        </button>
      </form>
    ),
  };
  return (
    <>
      <main className="detail-page">
        <section className="detail-hero">
          <div className="detail-heading">
            <Link className="back-button" to="/">
              <ArrowLeft size={17} /> {t("back")}
            </Link>
            <p className="eyebrow">{item.eyebrow}</p>
          </div>
          <div className="detail-title-row">
            <span className="detail-icon">
              <Icon size={28} />
            </span>
            <h1>{item.title}</h1>
          </div>
          <p>{item.text}</p>
        </section>
        <section className="detail-content">{bodies[pageId]}</section>
      </main>
      {previewItem && (
        <div
          className="pdf-viewer-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewItem(null);
          }}
        >
          <section
            className="pdf-viewer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-viewer-title"
          >
            <header className="pdf-viewer-header">
              <div>
                <span>PDF</span>
                <strong id="pdf-viewer-title">{previewItem.title}</strong>
              </div>
              <div className="pdf-viewer-actions">
                <button
                  ref={previewCloseButtonRef}
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  aria-label={en ? "Close brochure" : "Закрыть брошюру"}
                  title={en ? "Close" : "Закрыть"}
                >
                  <X size={22} />
                </button>
              </div>
            </header>
            <Suspense
              fallback={
                <div className="pdf-document-status">
                  <Loader
                    label={en ? "Loading brochure…" : "Загружаем брошюру…"}
                    variant="panel"
                  />
                </div>
              }
            >
              <PdfDocumentViewer
                src={previewItem.href}
                loadingLabel={en ? "Loading brochure…" : "Загружаем брошюру…"}
                errorLabel={
                  en
                    ? "The brochure could not be displayed"
                    : "Не удалось отобразить брошюру"
                }
              />
            </Suspense>
          </section>
        </div>
      )}
    </>
  );
}
