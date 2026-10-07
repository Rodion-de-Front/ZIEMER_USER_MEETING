import {
  BookOpen,
  CalendarDays,
  CircleHelp,
  FileText,
  Image,
  MapPin,
  MessageCircleHeart,
  Play,
  Sparkles,
  Video,
} from "lucide-react";

export const content = {
  ru: {
    sections: [
      {
        id: "program",
        title: "Программа ZUM",
        caption: "Расписание и спикеры",
        icon: CalendarDays,
      },
      {
        id: "venue",
        title: "Место проведения",
        caption: "Как добраться",
        icon: MapPin,
      },
      {
        id: "info",
        title: "Информация для участников",
        caption: "Всё, что важно знать",
        icon: CircleHelp,
      },
      {
        id: "culture",
        title: "Культурная программа",
        caption: "Вечер ZIEMER CLUB",
        icon: Sparkles,
      },
      {
        id: "recording",
        title: "Запись ZUM",
        caption: "Смотрите после встречи",
        icon: Video,
      },
      {
        id: "photos",
        title: "Фото ZUM",
        caption: "Моменты мероприятия",
        icon: Image,
      },
      {
        id: "abstracts",
        title: "Тезисы ZUM 2026",
        caption: "После мероприятия",
        icon: BookOpen,
      },
      {
        id: "materials",
        title: "Полезные материалы",
        caption: "Буклеты",
        icon: FileText,
      },
      {
        id: "feedback",
        title: "Отзывы и пожелания",
        caption: "Ваше мнение важно",
        icon: MessageCircleHeart,
      },
    ],

    pageContent: {
      program: {
        eyebrow: "9 октября · 09:00–22:00",
        title: "Программа ZIEMER USER MEETING",
        text: "Программа включает регистрацию, научные доклады, консультации с инженерами и вечернюю встречу в Джаз-клубе Бутмана",
        icon: CalendarDays,
      },
      venue: {
        eyebrow: "Radisson Collection Hotel",
        title: "Место проведения",
        text: "Научная часть пройдёт в Radisson Collection Hotel, гостиница «Украина», зал «Коллекшен Лаунж». На площадке будут стоять указатели.",
        icon: MapPin,
      },
      info: {
        eyebrow: "Для участников",
        title: "Полезная информация",
        text: "Подтвердите участие у менеджера компании «ФЕМТОМЕД», с которым вы сотрудничаете, или у Черкашиной Екатерины.",
        icon: CircleHelp,
      },
      culture: {
        eyebrow: "Вечерняя программа",
        title: "Культурная программа",
        text: "В 16:45 — сбор в Джаз-клуб Бутмана. У входа в отель будут стоять 2 автобуса, отмеченные ZIEMER. Сотрудники ФЕМТОМЕД помогут с навигацией. С 17:30 гостей ждут ужин и выступление группы «Ва-Банкъ»",
        icon: Sparkles,
      },
      recording: {
        eyebrow: "После мероприятия",
        title: "Запись ZUM",
        text: "Запись выступлений станет доступна здесь после завершения ZIEMER USER MEETING.",
        icon: Play,
      },
      photos: {
        eyebrow: "После мероприятия",
        title: "Фото ZUM",
        text: "Фотографии с мероприятия будут собраны в закрытой галерее для участников.",
        icon: Image,
      },
      abstracts: {
        eyebrow: "После мероприятия",
        title: "Тезисы ZUM 2026",
        text: "Материалы будут доступны после мероприятия. Следите за обновлениями",
        icon: BookOpen,
      },
      materials: {
        eyebrow: "Медиатека",
        title: "Полезные материалы",
        text: "Буклеты для участников",
        icon: FileText,
      },
      feedback: {
        eyebrow: "Ваш голос",
        title: "Отзывы и пожелания",
        text: "Поделитесь впечатлениями — это поможет нам сделать следующие встречи ещё лучше.",
        icon: MessageCircleHeart,
      },
    },

    programMeta: [{ label: "Модератор", value: "Слонимский А. Ю." }],

    schedule: [
      { time: "09:00–10:00", title: "Регистрация и приветственный кофе" },
      {
        time: "10:00–10:30",
        title: "Вступительное слово",
        speakers: [
          { name: "Нероев Владимир Владимирович", note: "5 мин" },
          { name: "Мушкова Ирина Альфредовна", note: "3 мин" },
          { name: "Антонюк Владимир Дмитриевич", note: "3 мин" },
          { name: "Франк Цимер", note: "видео приветствие · 16 мин" },
          { name: "Слонимский Алексей Юрьевич", note: "2 мин" },
        ],
      },
      {
        time: "10:30–10:40",
        title:
          "AQUARIUZ сегодня и завтра: новые функции и клинические перспективы",
        speaker: "Виктор Руфф",
        note: "на русском языке",
      },
      {
        time: "10:40–10:50",
        title:
          "Результаты применения твердотельного абляционного лазера AQUARIUZ при коррекции миопии и миопического астигматизма",
        speaker: "Ханджян Ануш Тиграновна",
      },
      {
        time: "10:50–11:00",
        title:
          "Клиническая эффективность нового твердотельного абляционного лазера AQUARIUZ для фемтолазерной коррекции зрения методом LASIK",
        speaker: "Боян Паич",
        note: "видеодоклад",
      },
      {
        time: "11:00–11:15",
        title:
          "Сравнение докинга различных лентикулярных технологий (SMILE, CLEAR SUPRA с FLOW SUITE, SmartSight, SMILE PRO) как ключевой момент в позиционировании лентикулы — собственное мнение",
        speaker: "Бойко Александр Александрович",
      },
      {
        time: "11:15–11:35",
        title: "Живая хирургия CLEAR SUPRA из клиники 3Z",
        speaker: "Бойко Александр Александрович",
      },
      {
        time: "11:35–11:45",
        title: "CLEAR SUPRA + FLOW SUITE: первый опыт",
        speaker: "Золотарев Андрей Владимирович",
      },
      {
        time: "11:45–11:55",
        title: "FLOW SUITE в клинической практике",
        speaker: "Медведев Игорь Борисович",
      },
      {
        time: "11:55–12:05",
        title: "Искусство лентикулярной хирургии с фемтолазером Ziemer",
        speaker: "Баталина Лариса Владимировна",
      },
      {
        time: "12:05–12:15",
        title:
          "Персонализированное автоматизированное планирование рефракционной лентикулярной коррекции миопии с использованием Galilei G6 ColorZ",
        speaker: "Шевчук Мария Алексеевна",
      },
      {
        time: "12:15–12:25",
        title:
          "Путь к стандарту: три года лентикулярной хирургии — от освоения технологии к предсказуемому результату",
        speaker: "Мартынов Юрий Владимирович",
      },
      {
        time: "12:25–12:35",
        title:
          "Исследование локальных биомеханических свойств лентикулы как предиктор регресса рефракционного результата при коррекции миопии и миопического астигматизма по технологии CLEAR",
        speaker: "Кузнецова Татьяна Сергеевна",
      },
      {
        time: "12:35–12:45",
        title:
          "Лентикулярная хирургия CLEAR в комбинации с кросслинкингом: тактика ведения пациентов группы риска развития кератоэктазии",
        speaker: "Титоян Карине Хачатуровна",
      },
      {
        time: "12:45–12:55",
        title:
          "Коррекция остаточных аметропий с использованием FEMTO LDV Z8 после лентикулярных операций на других фемтосистемах",
        speaker: "Копылов Андрей Евгеньевич",
      },
      {
        time: "12:55–13:05",
        title:
          "Опыт технологии CLEAR. Более 3000 кейсов. Ретроспективный анализ",
        speaker: "Андреева Екатерина Алексеевна",
      },
      {
        time: "13:05–13:15",
        title: "Convex — новое решение пресбиопии",
        speaker: "Байтокова Талифа Муратовна",
      },
      {
        time: "13:15–13:30",
        title: "Вопросы-ответы по научной части и оборудованию с инженерами",
      },
      { time: "13:30–14:30", title: "Перерыв на обед" },
      {
        time: "14:30–14:40",
        title:
          "Коррекция астигматизма в катарактальной хирургии: от мануальной кератотомии до применения искусственного интеллекта",
        speaker: "Овечкин Николай Игоревич",
      },
      {
        time: "14:40–14:50",
        title:
          "Фемтосекундное сопровождение катаракты в нестандартных, осложненных случаях",
        speaker: "Курзин Максим Леонидович",
      },
      {
        time: "14:50–15:00",
        title: "Возможности фемто-лазера LDV Z8 в хирургии патологии роговицы",
        speaker: "Измайлова Светлана Борисовна",
      },
      {
        time: "15:00–15:10",
        title: "Фемтолазерассистированная трансплантация боуменовой мембраны",
        speaker: "Синицын Максим Владимирович",
      },
      {
        time: "15:10–15:20",
        title: "Фемтосекундные технологии в хирургии роговицы",
        speaker: "Ткаченко Иван Сергеевич",
      },
      {
        time: "15:20–15:30",
        title:
          "Новые возможности фемтосекундного лазера LDV Z8 в выкраивании аллогенных сегментов роговицы при лечении кератэктазий различного генеза",
        speaker: "Калинникова Светлана Юрьевна",
      },
      {
        time: "15:30–15:40",
        title:
          "Фемтосекундные технологии в кератопротезировании: этапы внедрения и отдаленные результаты",
        speaker: "Головин Андрей Владимирович",
      },
      {
        time: "15:40–15:50",
        title: "Современные подходы к хирургии птеригиума",
        speaker: "Казакбаев Ренат Амирович",
      },
      { time: "15:50–16:10", title: "Вопросы/ответы, научная часть" },
      {
        time: "16:10–16:30",
        title: "Вопросы и ответы по оборудованию с инженерами",
      },
      {
        time: "16:45–17:05",
        title: "Сбор в Джаз-клуб Бутмана",
        note: "У входа в отель будут стоять 2 автобуса, отмеченные ZIEMER. Сотрудники ФЕМТОМЕД помогут с навигацией",
        evening: true,
      },
      {
        time: "17:30–22:00",
        title: "Ужин и группа «Ва-Банкъ»",
        note: "Джаз-клуб Бутмана",
        evening: true,
      },
    ],
  },
  en: {
    sections: [
      {
        id: "program",
        title: "ZUM programme",
        caption: "Schedule and speakers",
        icon: CalendarDays,
      },
      {
        id: "venue",
        title: "Venue",
        caption: "How to get there",
        icon: MapPin,
      },
      {
        id: "info",
        title: "Participant information",
        caption: "Everything you need to know",
        icon: CircleHelp,
      },
      {
        id: "culture",
        title: "Cultural programme",
        caption: "ZIEMER CLUB evening",
        icon: Sparkles,
      },
      {
        id: "recording",
        title: "ZUM recording",
        caption: "Watch after the meeting",
        icon: Video,
      },
      {
        id: "photos",
        title: "ZUM photos",
        caption: "Event moments",
        icon: Image,
      },
      {
        id: "abstracts",
        title: "ZUM 2026 abstracts",
        caption: "After the event",
        icon: BookOpen,
      },
      {
        id: "materials",
        title: "Useful materials",
        caption: "Booklets",
        icon: FileText,
      },
      {
        id: "feedback",
        title: "Feedback and suggestions",
        caption: "Your opinion matters",
        icon: MessageCircleHeart,
      },
    ],

    pageContent: {
      program: {
        eyebrow: "9 October · 09:00–22:00",
        title: "ZIEMER USER MEETING programme",
        text: "The programme includes registration, scientific talks, engineer consultations and the evening gathering at Butman Jazz Club",
        icon: CalendarDays,
      },
      venue: {
        eyebrow: "Radisson Collection Hotel",
        title: "Venue",
        text: "The scientific programme will take place at Radisson Collection Hotel, Hotel Ukraine, Collection Lounge hall. Wayfinding signs will be placed on site.",
        icon: MapPin,
      },
      info: {
        eyebrow: "For participants",
        title: "Useful information",
        text: "Please confirm your participation with your FEMTOMED manager or with Ekaterina Cherkashina.",
        icon: CircleHelp,
      },
      culture: {
        eyebrow: "Evening programme",
        title: "Cultural programme",
        text: "Gathering for Butman Jazz Club starts at 16:45. Two buses marked ZIEMER will be waiting at the hotel entrance. FEMTOMED staff will help with navigation. From 17:30 guests are invited to dinner and a performance by the Va-Bank band",
        icon: Sparkles,
      },
      recording: {
        eyebrow: "After the event",
        title: "ZUM recording",
        text: "Recordings of the presentations will be available here after ZIEMER USER MEETING.",
        icon: Play,
      },
      photos: {
        eyebrow: "After the event",
        title: "ZUM photos",
        text: "Event photos will be collected in a private gallery for participants.",
        icon: Image,
      },
      abstracts: {
        eyebrow: "After the event",
        title: "ZUM 2026 abstracts",
        text: "They will be available after the event. Follow the updates",
        icon: BookOpen,
      },
      materials: {
        eyebrow: "Media library",
        title: "Useful materials",
        text: "Booklets for participants",
        icon: FileText,
      },
      feedback: {
        eyebrow: "Your voice",
        title: "Feedback and suggestions",
        text: "Share your impressions — they will help us make future meetings better.",
        icon: MessageCircleHeart,
      },
    },

    programMeta: [{ label: "Moderator", value: "Slonimsky A. Yu." }],

    schedule: [
      { time: "09:00–10:00", title: "Registration and welcome coffee" },
      {
        time: "10:00–10:30",
        title: "Opening remarks",
        speakers: [
          { name: "Vladimir Vladimirovich Neroev", note: "5 min" },
          { name: "Irina Alfredovna Mushkova", note: "3 min" },
          { name: "Vladimir Dmitrievich Antonyuk", note: "3 min" },
          { name: "Frank Ziemer", note: "video greeting · 16 min" },
          { name: "Alexey Yuryevich Slonimsky", note: "2 min" },
        ],
      },
      {
        time: "10:30–10:40",
        title:
          "AQUARIUZ today and tomorrow: new features and clinical prospects",
        speaker: "Viktor Ruff",
        note: "in Russian",
      },
      {
        time: "10:40–10:50",
        title:
          "Outcomes of the AQUARIUZ solid-state ablation laser for myopia and myopic astigmatism correction",
        speaker: "Anush Tigranovna Khandzhyan",
      },
      {
        time: "10:50–11:00",
        title:
          "Clinical efficacy of the new AQUARIUZ solid-state ablation laser for femtosecond LASIK",
        speaker: "Bojan Paic",
        note: "video presentation",
      },
      {
        time: "11:00–11:15",
        title:
          "Comparison of docking across lenticular technologies (SMILE, CLEAR SUPRA with FLOW SUITE, SmartSight, SMILE PRO) as a key factor in lenticule positioning — a personal view",
        speaker: "Alexander Alexandrovich Boyko",
      },
      {
        time: "11:15–11:35",
        title: "Live CLEAR SUPRA surgery from 3Z clinic",
        speaker: "Alexander Alexandrovich Boyko",
      },
      {
        time: "11:35–11:45",
        title: "CLEAR SUPRA + FLOW SUITE: first experience",
        speaker: "Andrey Vladimirovich Zolotarev",
      },
      {
        time: "11:45–11:55",
        title: "FLOW SUITE in clinical practice",
        speaker: "Igor Borisovich Medvedev",
      },
      {
        time: "11:55–12:05",
        title:
          "The art of lenticular surgery with the Ziemer femtosecond laser",
        speaker: "Larisa Vladimirovna Batalina",
      },
      {
        time: "12:05–12:15",
        title:
          "Personalized automated planning of refractive lenticule correction of myopia using Galilei G6 ColorZ",
        speaker: "Maria Alekseyevna Shevchuk",
      },
      {
        time: "12:15–12:25",
        title:
          "The path to a standard: three years of lenticular surgery — from adopting the technology to a predictable result",
        speaker: "Yury Vladimirovich Martynov",
      },
      {
        time: "12:25–12:35",
        title:
          "Local biomechanical properties of the lenticule as a predictor of refractive regression after myopia and myopic astigmatism correction with CLEAR",
        speaker: "Tatyana Sergeevna Kuznetsova",
      },
      {
        time: "12:35–12:45",
        title:
          "CLEAR lenticular surgery combined with crosslinking: management of patients at risk of keratectasia",
        speaker: "Karine Khachaturovna Titoyan",
      },
      {
        time: "12:45–12:55",
        title:
          "Correction of residual ametropia with FEMTO LDV Z8 after lenticular surgery on other femtosecond systems",
        speaker: "Andrey Evgenyevich Kopylov",
      },
      {
        time: "12:55–13:05",
        title:
          "CLEAR experience: more than 3,000 cases. A retrospective analysis",
        speaker: "Ekaterina Alekseyevna Andreeva",
      },
      {
        time: "13:05–13:15",
        title: "Convex — a new solution for presbyopia",
        speaker: "Talifa Muratovna Baytokova",
      },
      {
        time: "13:15–13:30",
        title: "Q&A on the scientific session and equipment with engineers",
      },
      { time: "13:30–14:30", title: "Lunch break" },
      {
        time: "14:30–14:40",
        title:
          "Astigmatism correction in cataract surgery: from manual keratotomy to artificial intelligence",
        speaker: "Nikolay Igorevich Ovechkin",
      },
      {
        time: "14:40–14:50",
        title:
          "Femtosecond support of cataract surgery in non-standard, complicated cases",
        speaker: "Maxim Leonidovich Kurzin",
      },
      {
        time: "14:50–15:00",
        title:
          "Capabilities of the LDV Z8 femtosecond laser in corneal pathology surgery",
        speaker: "Svetlana Borisovna Izmailova",
      },
      {
        time: "15:00–15:10",
        title: "Femtosecond-assisted Bowman layer transplantation",
        speaker: "Maxim Vladimirovich Sinitsyn",
      },
      {
        time: "15:10–15:20",
        title: "Femtosecond technologies in corneal surgery",
        speaker: "Ivan Sergeyevich Tkachenko",
      },
      {
        time: "15:20–15:30",
        title:
          "New capabilities of the LDV Z8 femtosecond laser in cutting allogeneic corneal segments for keratectasia of various origins",
        speaker: "Svetlana Yuryevna Kalinnikova",
      },
      {
        time: "15:30–15:40",
        title:
          "Femtosecond technologies in keratoprosthetics: implementation stages and long-term results",
        speaker: "Andrey Vladimirovich Golovin",
      },
      {
        time: "15:40–15:50",
        title: "Current approaches to pterygium surgery",
        speaker: "Renat Amirovich Kazakbayev",
      },
      { time: "15:50–16:10", title: "Q&A, scientific session" },
      { time: "16:10–16:30", title: "Q&A on equipment with engineers" },
      {
        time: "16:45–17:05",
        title: "Gathering for Butman Jazz Club",
        note: "Two buses marked ZIEMER will be waiting at the hotel entrance. FEMTOMED staff will help with navigation",
        evening: true,
      },
      {
        time: "17:30–22:00",
        title: "Dinner and the Va-Bank band",
        note: "Butman Jazz Club",
        evening: true,
      },
    ],
  },
};

export const getConferenceContent = (language) => {
  const data = content[language] || content.ru;
  return {
    ...data,
    cultureSchedule: data.schedule.filter((item) => item.evening),
  };
};
