"use client"

import React, { createContext, useContext, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/i18n/config"

export type LandingLocale = "ru" | "kk"

export interface LandingTranslations {
  nav: {
    city: string
    warehouseSchedule: string
    warehousesOpen: string
    vatBadge: string
    calculator: string
    delivery: string
    faq: string
    estimate: string
    aiForeman: string
    whatsapp: string
    workflow: string
    suppliers: string
    cityShort: string
    whatsappWrite: string
    openChat: string
    estimateHint: string
    menuOpen: string
    menuClose: string
    languageLabel: string
  }
  hero: {
    titlePart1: string
    titlePart2: string
    titlePart3: string
    desc: string
    ctaCalc: string
    promptsTitle: string
    prompts: { label: string; query: string }[]
  }
  calculator: {
    badge: string
    title: string
    desc: string
    tabs: {
      screed: string
      plaster: string
      blocks: string
      drywall: string
    }
    parametersTitle: string
    screedArea: string
    screedThickness: string
    screedThicknessStandard: string
    plasterArea: string
    plasterThickness: string
    plasterThicknessStandard: string
    blockLength: string
    blockHeight: string
    blockHeightStandard: string
    drywallArea: string
    disclaimer: string
    billOfMaterials: string
    warehousesAstana: string
    estTotal: string
    deliveryTime: string
    ctaOrderAi: string
    // Materials localized data
    materials: {
      screed: {
        title: (area: number, thickness: number) => string
        cementName: string
        cementDesc: string
        cementUnit: string
        sandName: string
        sandDesc: string
        sandUnit: string
        fiberName: string
        fiberDesc: string
        fiberUnit: string
        tapeName: string
        tapeDesc: string
        tapeUnit: string
      }
      plaster: {
        title: (area: number, thickness: number) => string
        rotbandName: string
        rotbandDesc: string
        rotbandUnit: string
        primerName: string
        primerDesc: string
        primerUnit: string
        beaconName: string
        beaconDesc: string
        beaconUnit: string
        meshName: string
        meshDesc: string
        meshUnit: string
      }
      blocks: {
        title: (length: number, height: number, area: string) => string
        blockName: string
        blockDesc: string
        blockUnit: string
        glueName: string
        glueDesc: string
        glueUnit: string
        meshName: string
        meshDesc: string
        meshUnit: string
        hangerName: string
        hangerDesc: string
        hangerUnit: string
      }
      drywall: {
        title: (area: number) => string
        sheetName: string
        sheetDesc: string
        sheetUnit: string
        profileCdName: string
        profileCdDesc: string
        profileCdUnit: string
        profileUdName: string
        profileUdDesc: string
        profileUdUnit: string
        screwsName: string
        screwsDesc: string
        screwsUnit: string
      }
    }
  }
  howItWorks: {
    badge: string
    title: string
    desc: string
    steps: {
      num: string
      tag: string
      title: string
      desc: string
      interactiveBadge: string
    }[]
    stageLabel: (current: number, total: number) => string
    ctaBtn: string
  }
  supplierBenefits: {
    sectionBadge: string
    title: string
    titleAccent: string
    desc: string
    pillar1: {
      tag: string
      title: string
      desc: string
      features: {
        title: string
        desc: string
      }[]
      metricValue: string
      metricLabel: string
    }
    pillar2: {
      tag: string
      title: string
      desc: string
      features: {
        title: string
        desc: string
      }[]
      dashboardMockup: {
        title: string
        badgeLive: string
        statInflow: string
        statInflowLabel: string
        statStock: string
        statStockLabel: string
        statOutflow: string
        statOutflowLabel: string
        statActiveTrips: string
        statActiveTripsLabel: string
        recentLogs: {
          time: string
          type: "in" | "out" | "reserve"
          text: string
          status: string
        }[]
      }
    }
    ctaPartnerBtn: string
    partnerWhatsappText: string
  }
  faq: {
    badge: string
    title: string
    desc: string
    filterAll: string
    filterPayment: string
    filterDelivery: string
    filterCalc: string
    items: {
      category: "payment" | "delivery" | "calc"
      q: string
      a: string
    }[]
    helpTitle: string
    helpDesc: string
    helpChat: string
    helpWhatsapp: string
  }
  cta: {
    badge: string
    title: string
    desc: string
    btnAi: string
    btnCabinet: string
    tagWarehouses: string
    tagKaspi: string
    tagVat: string
  }
  footer: {
    brandDesc: string
    address: string
    schedule: string
    navTitle: string
    materialsTitle: string
    matCement: string
    matBlocks: string
    matDrywall: string
    matSand: string
    matInsulation: string
    matRebar: string
    servicesTitle: string
    srvAiForeman: string
    srvCabinet: string
    copyright: (year: number) => string
    paymentInfo: string
  }
  floatingAi: {
    text: string
    highlight: string
  }
}

const translations: Record<LandingLocale, LandingTranslations> = {
  ru: {
    nav: {
      city: "г. Астана",
      warehouseSchedule: "База и склады: 08:00 – 20:00 (без выходных)",
      warehousesOpen: "Склады Алаш / Коктал в наличии",
      vatBadge: "С НДС и ЭСФ для ТОО/ИП",
      calculator: "Калькулятор",
      delivery: "Доставка и Kaspi",
      faq: "FAQ",
      estimate: "Смета",
      aiForeman: "AI-Прораб",
      whatsapp: "WhatsApp",
      workflow: "Процесс доставки",
      suppliers: "Поставщикам",
      cityShort: "Астана",
      whatsappWrite: "Написать в WhatsApp",
      openChat: "Открыть AI-чат",
      estimateHint: "Перейти к расчету сметы",
      menuOpen: "Открыть меню",
      menuClose: "Закрыть меню",
      languageLabel: "Язык",
    },
    hero: {
      titlePart1: "Черновые стройматериалы в Астане",
      titlePart2: "с оперативной доставкой",
      titlePart3: "от 2 часов",
      desc: "Цемент Бухтарма, автоклавный газоблок «Экотон», гипсокартон Knauf и металлопрокат напрямую со складов Астаны. Точный расчет сметы через AI-прораба и оплата через Kaspi QR.",
      ctaCalc: "Рассчитать смету с AI‑прорабом",
      promptsTitle: "Популярные запросы строителей и прорабов Астаны:",
      prompts: [
        {
          label: "Стяжка 75 м² в ЖК «Grand Turan»",
          query: "Нужен цемент М400 Бухтарма и мытый песок на стяжку 75 кв.м в ЖК Grand Turan, слой 5 см",
        },
        {
          label: "Газоблок 600×300×100 на Есильский район",
          query: "Посчитай перегородочный газоблок Экотон 600x300x100 на 35 кв.м перегородок с клеем и сеткой",
        },
        {
          label: "Ротбанд 40 мешков с подъемом на этаж",
          query: "Knauf Ротбанд 40 мешков, грунтовка Тифенгрунд 3 канистры и маяки 6мм с подъемом на 8 этаж",
        },
        {
          label: "Гипсокартон Knauf влагостойкий 50 листов",
          query: "ГКЛВ Knauf 12.5мм 50 листов, профили CD 60/27 и подвесы с доставкой в Алматинский район",
        },
      ],
    },
    calculator: {
      badge: "ИНЖЕНЕРНЫЙ ОНЛАЙН-КАЛЬКУЛЯТОР",
      title: "Точный расчет сметы черновых работ в Астане",
      desc: "Выберите конструкцию, укажите геометрические размеры и получите детальную спецификацию с актуальными ценами столичных складов.",
      tabs: {
        screed: "Стяжка пола",
        plaster: "Штукатурка",
        blocks: "Газоблок",
        drywall: "Гипсокартон",
      },
      parametersTitle: "ГЕОМЕТРИЧЕСКИЕ ПАРАМЕТРЫ ОБЪЕКТА:",
      screedArea: "Площадь помещения:",
      screedThickness: "Толщина слоя стяжки:",
      screedThicknessStandard: "50 мм (стандарт)",
      plasterArea: "Площадь стен:",
      plasterThickness: "Средний слой штукатурки:",
      plasterThicknessStandard: "15 мм (типовой)",
      blockLength: "Длина перегородки:",
      blockHeight: "Высота потолков:",
      blockHeightStandard: "2.4 м (типовой)",
      drywallArea: "Площадь обшивки (потолок / стены):",
      disclaimer: "Расчет соответствует технологическим регламентам Knauf и Экотон. Автоматически заложен нормативный запас 5% на подрезку и бой.",
      billOfMaterials: "ВЕДОМОСТЬ МАТЕРИАЛОВ",
      warehousesAstana: "Склады Астана",
      estTotal: "Ориентировочная сумма материалов:",
      deliveryTime: "Доставка от 2 ч",
      ctaOrderAi: "Заказать партию в AI-чате",
      materials: {
        screed: {
          title: (area, thickness) => `Стяжка пола: ${area} м² при толщине ${thickness} мм`,
          cementName: "Цемент М400 Бухтарма (50 кг)",
          cementDesc: "с запасом 5% на усадку",
          cementUnit: "мешков",
          sandName: "Песок мытый сеяный (Астана)",
          sandDesc: "навалом или в биг-бэгах",
          sandUnit: "тонн",
          fiberName: "Фиброволокно полипропиленовое",
          fiberDesc: "армирование от микротрещин",
          fiberUnit: "упак",
          tapeName: "Демпферная краевая лента 100 мм",
          tapeDesc: "по периметру комнат",
          tapeUnit: "пог. м",
        },
        plaster: {
          title: (area, thickness) => `Штукатурка стен: ${area} м² при толщине ${thickness} мм`,
          rotbandName: "Штукатурка гипсовая Knauf Ротбанд (30 кг)",
          rotbandDesc: "официальный завод Knauf",
          rotbandUnit: "мешков",
          primerName: "Грунтовка акриловая глубокая (10 л)",
          primerDesc: "обеспыливание основания",
          primerUnit: "канистр",
          beaconName: "Маяки оцинкованные 6 мм (3.0 м)",
          beaconDesc: "шаг установки 1.2–1.4 м",
          beaconUnit: "шт",
          meshName: "Сетка армирующая серпянка (50 мм)",
          meshDesc: "стыки и примыкания",
          meshUnit: "рулонов",
        },
        blocks: {
          title: (len, h, area) => `Перегородка из газоблока: ${len}м × ${h}м (${area} м²)`,
          blockName: "Газоблок «Экотон» 600×300×100 мм",
          blockDesc: "плотность D500, заводская геометрия",
          blockUnit: "блоков",
          glueName: "Клей для газобетона тонкошовный (25 кг)",
          glueDesc: "толщина шва 2–3 мм",
          glueUnit: "мешков",
          meshName: "Базальтовая кладочная сетка 50×50",
          meshDesc: "армирование каждые 3 ряда",
          meshUnit: "рулонов",
          hangerName: "Прямые усиленные подвесы",
          hangerDesc: "привязка к монолиту",
          hangerUnit: "шт",
        },
        drywall: {
          title: (area) => `Гипсокартонная система: ${area} м²`,
          sheetName: "ГКЛВ Knauf влагостойкий 12.5 мм (2.5×1.2м)",
          sheetDesc: "зеленый картон для помещений",
          sheetUnit: "листов",
          profileCdName: "Профиль потолочный CD 60/27 (0.6 мм, 3м)",
          profileCdDesc: "не прогибается под нагрузкой",
          profileCdUnit: "шт",
          profileUdName: "Профиль направляющий UD 28/27 (3м)",
          profileUdDesc: "периметр каркаса",
          profileUdUnit: "шт",
          screwsName: "Саморезы TN 25 + подвесы с тягой",
          screwsDesc: "крепежный комплект",
          screwsUnit: "шт",
        },
      },
    },
    howItWorks: {
      badge: "Сквозной процесс доставки",
      title: "От заказа до доставки на объект: 5 прозрачных шагов",
      desc: "Полная автоматизация цепочки поставок. Бот берет на себя рутину, склад мгновенно комплектует заказ, а вы отслеживаете машину с товаром в реальном времени.",
      steps: [
        {
          num: "01",
          tag: "ИИ-прием заявки",
          title: "Заявка голосом, текстом или фото сметы",
          desc: "Покупатель диктует список материалов в чат-боте на казахском или русском, прикрепляет фото сметы или накладной. Бот моментально распознает номенклатуру по СНиП РК.",
          interactiveBadge: "«Grand Turan, 60 мешков цемента М400, 20 листов ГКЛВ...»",
        },
        {
          num: "02",
          tag: "Kaspi QR • Мгновенный счет",
          title: "Авторасчет сметы и оплата в 1 клик",
          desc: "ИИ подсчитывает точный объем, вес партии и габариты, проверяет остатки на складе и выставляет счет: Kaspi QR, Kaspi Red или безналичный расчет с ЭСФ для юрлиц.",
          interactiveBadge: "Счет #SM-8492 • Вес: 3.4 т • Kaspi QR выставлен",
        },
        {
          num: "03",
          tag: "Складской конвейер",
          title: "Умное распределение и сборка со смартфона",
          desc: "Оплаченный заказ автоматически делится на задания сборки по категориям и зонам склада. Сборщики комплектуют товар со смартфонов с фиксацией в системе.",
          interactiveBadge: "Зона А: Цемент [Собрано] • Зона B: Профиль [Собрано]",
        },
        {
          num: "04",
          tag: "Логистический хаб",
          title: "Автоподбор транспорта и погрузка",
          desc: "Платформа автоматически назначает Газель или кран-манипулятор под точный вес и габариты груза. Водитель принимает рейс через мобильное приложение.",
          interactiveBadge: "Назначен манипулятор 5т • Госномер 842 ABC 01",
        },
        {
          num: "05",
          tag: "GPS-трекинг • Код приёмки",
          title: "Доставка на объект и безопасная приемка",
          desc: "Покупатель видит движение машины на онлайн-карте. Выгрузка на объекте подтверждается 4-значным SMS-кодом получения — никаких бумаг и спорных ситуаций.",
          interactiveBadge: "Машина у объекта: ул. Туран, 48 • Код подтверждения: 4819",
        },
      ],
      stageLabel: (cur, total) => `Этап ${cur} из ${total}`,
      ctaBtn: "Запустить заказ через AI-бота",
    },
    supplierBenefits: {
      sectionBadge: "Для поставщиков и складов стройматериалов",
      title: "Никакой операционки для поставщика.",
      titleAccent: "Полная прозрачность предприятия.",
      desc: "Уберите ручные механические действия и телефонный хаос. Умный бот берет на себя прием заявок и распределение, а вы в реальном времени видите полную картину: от прихода с завода до каждой отгрузки.",
      pillar1: {
        tag: "Автоматизация 95% рутины",
        title: "Поставщик не загружен в операционке",
        desc: "Все механические движения по сути убираются — их выполняет бот. Больше никаких сотен звонков прорабам, расшифровки почерка на бумажках и ручного забивания номенклатуры в учетные программы.",
        features: [
          {
            title: "Бот сам принимает заказы 24/7",
            desc: "Распознает голосовые сообщения, фото смет от руки, текст на казахском и русском языках без участия менеджера.",
          },
          {
            title: "Автоматический расчет и Kaspi QR",
            desc: "Бот моментально проверяет остатки склада, выставляет Kaspi QR на оплату или формирует счет на безнал с ЭСФ.",
          },
          {
            title: "Мгновенные задания на склад и водителям",
            desc: "После оплаты заказ без менеджера распадается на сборочные листы по зонам склада и передается свободной машине.",
          },
        ],
        metricValue: "0 мин",
        metricLabel: "Ручной рутины менеджера на типовой заказ",
      },
      pillar2: {
        tag: "Учет и контроль без слепых зон",
        title: "Прозрачная статистика: видно всё, что пришло и ушло",
        desc: "Руководитель видит полную картину того, что творится на предприятии в режиме реального времени: от прихода вагонов с цементом до статуса выгрузки каждого мешка.",
        features: [
          {
            title: "Сквозной учет движения товаров",
            desc: "Четкая фиксация: сколько поступило от завода, сколько в наличии, сколько в броне, сколько отгружено в пути. Никакой пересортицы.",
          },
          {
            title: "Живая статистика и финансовая картина",
            desc: "Маржинальность, средний чек, загрузка складов, динамика выручки и рейтинг позиций доступны руководителю со смартфона.",
          },
          {
            title: "GPS-мониторинг каждой машины",
            desc: "Точное время подачи, маршрут движения, фотофиксация погрузки и подтверждение выгрузки по безопасному SMS-коду.",
          },
        ],
        dashboardMockup: {
          title: "Складской учет и аналитика предприятия",
          badgeLive: "В реальном времени",
          statInflow: "+48.5 т",
          statInflowLabel: "Приход за сегодня (вагоны/фуры)",
          statStock: "98.4%",
          statStockLabel: "Актуальность остатков складов",
          statOutflow: "32 отгрузки",
          statOutflowLabel: "Отгружено клиентам сегодня",
          statActiveTrips: "8 машин",
          statActiveTripsLabel: "На линии в рейсе с GPS",
          recentLogs: [
            {
              time: "10:42",
              type: "in",
              text: "Приход цемента М400 Бухтарма (партия 418) — 20.0 т",
              status: "Оприходовано",
            },
            {
              time: "10:35",
              type: "out",
              text: "Отгрузка #SM-8492: Газель 842 ABC — ЖК Grand Turan",
              status: "В пути (GPS)",
            },
            {
              time: "10:28",
              type: "reserve",
              text: "ИИ-резерв: 50 листов Knauf ГКЛВ — ТОО СтройСервис",
              status: "Оплачено Kaspi",
            },
          ],
        },
      },
      ctaPartnerBtn: "Подключить склад к платформе",
      partnerWhatsappText: "Здравствуйте! Хотим подключить склад к СтройМаркет",
    },
    faq: {
      badge: "Вопрос — ответ",
      title: "Часто задаваемые вопросы",
      desc: "Ответы на популярные вопросы прорабов, мастеров и заказчиков ремонта в Астане",
      filterAll: "Все вопросы",
      filterPayment: "Оплата и Kaspi",
      filterDelivery: "Доставка по Астане",
      filterCalc: "AI расчет и сметы",
      items: [
        {
          category: "payment",
          q: "Какая минимальная сумма заказа?",
          a: "Минимального порога нет. Вы можете оформить заказ как на 3 мешка ротбанда для срочной доделки с подачей легковой машины или Газели, так и оптовую партию кирпича, гипсокартона или газоблока на нескольких манипуляторах.",
        },
        {
          category: "delivery",
          q: "Как быстро машина приедет на объект в Астане?",
          a: "При экспресс-заказе среднее время подачи со складов шоссе Алаш составляет 2–3 часа. Также в AI-чате можно зафиксировать точный временной интервал — например, «завтра строго к 08:30 утра», чтобы мастера сразу приступили к разгрузке.",
        },
        {
          category: "payment",
          q: "Что делать, если после ремонта остались лишние невскрытые мешки или блоки?",
          a: "Мы осуществляем возврат неиспользованных материалов в течение 14 дней при сохранении товарного вида и заводской упаковки. Экспедитор заберет остатки с объекта, а денежные средства вернутся на ваш Kaspi счет или карту.",
        },
        {
          category: "payment",
          q: "Работаете ли вы с юридическими лицами (ТОО, ИП) с НДС?",
          a: "Да, работаем со строительными компаниями и бригадами по договору. Выставляем электронные счета-фактуры (ЭСФ) через ИС ЭСФ, формируем накладные (СНТ/АВР) и прикладываем паспорта качества и сертификаты СТ-KZ заводов-производителей.",
        },
        {
          category: "delivery",
          q: "Предоставляются ли услуги грузчиков и подъема на этаж?",
          a: "Да. При оформлении заказа в AI-чате укажите: «нужен подъем на 9 этаж, есть грузовой лифт». Модель подсчитает общий вес партии, подберет нужное число грузчиков и включит аккуратный подъем в прозрачную смету.",
        },
        {
          category: "calc",
          q: "Как AI-прораб рассчитывает расход стройматериалов?",
          a: "Алгоритм опирается на актуальные СНиП РК и технологические регламенты Knauf, AlinEX и Экотон. Система учитывает геометрию стен, толщину слоя и автоматически закладывает нормативный запас 5–7% на подрезку и технологическую усадку.",
        },
      ],
      helpTitle: "Не нашли ответ на свой вопрос?",
      helpDesc: "Задайте его AI-прорабу или свяжитесь с дежурным диспетчером склада в Астане",
      helpChat: "Спросить в чате",
      helpWhatsapp: "WhatsApp",
    },
    cta: {
      badge: "Экспресс-расчет за 2 минуты без регистрации",
      title: "Готовы начать отделку без простоев и переплат?",
      desc: "Опишите вашу задачу AI-прорабу прямо сейчас: он рассчитает нормы по СНиП РК, проверит складские остатки в Астане и сформирует счет Kaspi QR.",
      btnAi: "Запустить AI-чат «СтройМаркет»",
      btnCabinet: "Личный кабинет",
      tagWarehouses: "Склады в Астане (ш. Алаш)",
      tagKaspi: "Kaspi QR и рассрочка Red",
      tagVat: "ЭСФ с НДС и сертификаты СТ-KZ",
    },
    footer: {
      brandDesc: "Цифровой маркетплейс черновых стройматериалов с искусственным интеллектом. Прямые поставки от заводов-производителей, экспресс-доставка по Астане и расчет сметы 24/7.",
      address: "г. Астана, складской логистический комплекс (р-н ш. Алаш)",
      schedule: "Склад: 08:00 – 20:00 • AI-расчет: Круглосуточно 24/7",
      navTitle: "Навигация",
      materialsTitle: "Материалы",
      matCement: "Цемент и сухие смеси",
      matBlocks: "Газобетон и кирпич",
      matDrywall: "Гипсокартон и профили Knauf",
      matSand: "Мытый песок и щебень 5–20",
      matInsulation: "Теплоизоляция (Пеноплэкс)",
      matRebar: "Арматура А500С и кладочная сетка",
      servicesTitle: "Сервисы и связь",
      srvAiForeman: "AI-Прораб онлайн 24/7",
      srvCabinet: "Личный кабинет",
      copyright: (year) => `© ${year} «СтройМаркет» (Астана). Все права защищены.`,
      paymentInfo: "Оплата: Kaspi QR • Kaspi Red • Безналичный расчет с НДС",
    },
    floatingAi: {
      text: "Спроси у AI-Прораба:",
      highlight: "расчет сметы по проекту",
    },
  },
  kk: {
    nav: {
      city: "Астана қ.",
      warehouseSchedule: "Қоймалар мен база: 08:00 – 20:00 (демалыссыз)",
      warehousesOpen: "Алаш / Көктал қоймаларында бар",
      vatBadge: "ҚҚС және ЭШФ бар (ЖШС/ЖК)",
      calculator: "Калькулятор",
      delivery: "Жеткізу және Kaspi",
      faq: "Сұрақ-жауап",
      estimate: "Смета",
      aiForeman: "AI-Прораб",
      whatsapp: "WhatsApp",
      workflow: "Жеткізу процесі",
      suppliers: "Жеткізушілерге",
      cityShort: "Астана",
      whatsappWrite: "WhatsApp-қа жазу",
      openChat: "AI-чатты ашу",
      estimateHint: "Смета есебіне өту",
      menuOpen: "Мәзірді ашу",
      menuClose: "Мәзірді жабу",
      languageLabel: "Тіл",
    },
    hero: {
      titlePart1: "Астанада қара сылақ материалдары",
      titlePart2: "2 сағатта жедел жеткізумен",
      titlePart3: "қойма бағасымен",
      desc: "Бухтарма цементі, «Экотон» автоклавты газоблогы, Knauf гипсокартоны және металл прокаты тікелей Астана қоймаларынан. AI-прораб арқылы сметаны нақты есептеу және Kaspi QR арқылы төлеу.",
      ctaCalc: "AI‑прорабпен смета есептеу",
      promptsTitle: "Астана құрылысшылары мен прорабтарының танымал сұраныстары:",
      prompts: [
        {
          label: "«Grand Turan» ТК 75 м² еден құю",
          query: "Grand Turan ТК-дегі 75 ш.м еденге қалыңдығы 5 см болатын М400 Бухтарма цементі мен жуылған құм қажет",
        },
        {
          label: "Есіл ауданына 600×300×100 газоблок",
          query: "35 ш.м арақабырғаға Экотон 600x300x100 газоблогын, желімін және торын есептеп бер",
        },
        {
          label: "Ротбанд 40 қап қабатқа көтерумен",
          query: "Knauf Ротбанд 40 қап, Тифенгрунд праймері 3 канистра және 6мм маяктар 8-қабатқа көтерумен",
        },
        {
          label: "Knauf ылғалға төзімді гипсокартон 50 парақ",
          query: "Knauf ГКЛВ 12.5мм 50 парақ, CD 60/27 бейіндері мен аспалары Алматы ауданына жеткізумен",
        },
      ],
    },
    calculator: {
      badge: "ИНЖЕНЕРЛІК ОНЛАЙН-КАЛЬКУЛЯТОР",
      title: "Астанадағы қара жұмыстар сметасын нақты есептеу",
      desc: "Конструкция түрін таңдап, геометриялық өлшемдерін көрсетіңіз және елордалық қоймалардың өзекті бағаларымен толық спецификацияны алыңыз.",
      tabs: {
        screed: "Еден құю",
        plaster: "Сылақ",
        blocks: "Газоблок",
        drywall: "Гипсокартон",
      },
      parametersTitle: "НЫСАННЫҢ ГЕОМЕТРИЯЛЫҚ ПАРАМЕТРЛЕРІ:",
      screedArea: "Бөлме ауданы:",
      screedThickness: "Құю қабатының қалыңдығы:",
      screedThicknessStandard: "50 мм (стандарт)",
      plasterArea: "Қабырға ауданы:",
      plasterThickness: "Сылақтың орташа қалыңдығы:",
      plasterThicknessStandard: "15 мм (типтік)",
      blockLength: "Арақабырға ұзындығы:",
      blockHeight: "Төбе биіктігі:",
      blockHeightStandard: "2.4 м (типтік)",
      drywallArea: "Қаптау ауданы (төбе / қабырға):",
      disclaimer: "Есептеу Knauf және Экотон технологиялық регламенттеріне толық сай келеді. Кесу мен ысырапқа 5% нормативтік қор автоматты түрде қосылған.",
      billOfMaterials: "МАТЕРИАЛДАР ТІЗІМДЕМЕСІ",
      warehousesAstana: "Астана қоймалары",
      estTotal: "Материалдардың шамамен құны:",
      deliveryTime: "2 сағатта жеткізу",
      ctaOrderAi: "AI-чатта партияға тапсырыс беру",
      materials: {
        screed: {
          title: (area, thickness) => `Еден құю: ${area} м² қалыңдығы ${thickness} мм болғанда`,
          cementName: "Бухтарма М400 цементі (50 кг)",
          cementDesc: "шөгуге 5% қорымен",
          cementUnit: "қап",
          sandName: "Жуылған еленген құм (Астана)",
          sandDesc: "үйінді түрінде немесе биг-бэгтерде",
          sandUnit: "тонна",
          fiberName: "Полипропиленді фиброталшық",
          fiberDesc: "микрожарықтардан қорғайтын арматура",
          fiberUnit: "қап",
          tapeName: "Демпферлік жиек таспасы 100 мм",
          tapeDesc: "бөлмелердің периметрі бойынша",
          tapeUnit: "бойлық м",
        },
        plaster: {
          title: (area, thickness) => `Қабырға сылағы: ${area} м² қалыңдығы ${thickness} мм болғанда`,
          rotbandName: "Knauf Ротбанд гипстік сылағы (30 кг)",
          rotbandDesc: "ресми Knauf зауыты",
          rotbandUnit: "қап",
          primerName: "Терең енетін акрил праймері (10 л)",
          primerDesc: "негіздің шаңын басу",
          primerUnit: "канистр",
          beaconName: "Мырышталған маяктар 6 мм (3.0 м)",
          beaconDesc: "орнату қадамы 1.2–1.4 м",
          beaconUnit: "дана",
          meshName: "Серпянка арматуралаушы торы (50 мм)",
          meshDesc: "түйіспелер мен бұрыштар үшін",
          meshUnit: "орам",
        },
        blocks: {
          title: (len, h, area) => `Газоблок арақабырғасы: ${len}м × ${h}м (${area} м²)`,
          blockName: "«Экотон» газоблогы 600×300×100 мм",
          blockDesc: "тығыздығы D500, зауыттық дәл геометрия",
          blockUnit: "блок",
          glueName: "Газобетонға арналған жіңішке жікті желім (25 кг)",
          glueDesc: "жік қалыңдығы 2–3 мм",
          glueUnit: "қап",
          meshName: "Базальтты қалау торы 50×50",
          meshDesc: "әрбір 3 қатар сайын арматуралау",
          meshUnit: "орам",
          hangerName: "Тікелей күшейтілген аспалар",
          hangerDesc: "монолитке бекіту үшін",
          hangerUnit: "дана",
        },
        drywall: {
          title: (area) => `Гипсокартон жүйесі: ${area} м²`,
          sheetName: "Knauf ГКЛВ ылғалға төзімді 12.5 мм (2.5×1.2м)",
          sheetDesc: "бөлмелерге арналған жасыл картон",
          sheetUnit: "парақ",
          profileCdName: "Төбелік бейін CD 60/27 (0.6 мм, 3м)",
          profileCdDesc: "жүктеме астында майыспайды",
          profileCdUnit: "дана",
          profileUdName: "Бағыттаушы бейін UD 28/27 (3м)",
          profileUdDesc: "қаңқа периметрі",
          profileUdUnit: "дана",
          screwsName: "TN 25 бұрандамалары + тартқышты аспалар",
          screwsDesc: "бекіту жинағы",
          screwsUnit: "дана",
        },
      },
    },
    howItWorks: {
      badge: "Жеткізудің толық процесі",
      title: "Тапсырыстан нысанда түсіруге дейін: 5 ашық қадам",
      desc: "Жеткізу тізбегінің толық автоматтандырылуы. Бот барлық күнделікті жұмысты атқарады, қойма тапсырысты жедел жинайды, ал сіз тауар тиелген көлікті нақты уақытта бақылайсыз.",
      steps: [
        {
          num: "01",
          tag: "ИИ тапсырыс қабылдау",
          title: "Дауыспен, мәтінмен немесе смета фотосымен",
          desc: "Сатып алушы чат-ботта қазақ немесе орыс тілінде материалдар тізімін айтады, смета фотосын жібереді немесе мәтінмен жазады. Бот ҚР ҚНжЕ нормалары бойынша номенклатураны бірден таниды.",
          interactiveBadge: "«Grand Turan, 60 қап М400 цементі, 20 парақ ГКЛВ...»",
        },
        {
          num: "02",
          tag: "Kaspi QR • Жедел шот",
          title: "Сметаны автоматты есептеу және 1 басумен төлеу",
          desc: "ИИ нақты көлемді, салмақты және габаритті есептеп, қоймадағы қалдықты тексереді және шот шығарады: Kaspi QR, Kaspi Red немесе ЭШФ-мен қолма-қолсыз төлем.",
          interactiveBadge: "Шот #SM-8492 • Салмақ: 3.4 т • Kaspi QR ұсынылды",
        },
        {
          num: "03",
          tag: "Қоймалық конвейер",
          title: "Ақылды бөлу және смартфон арқылы жинау",
          desc: "Төленген тапсырыс автоматты түрде қойма санаттары мен аймақтары бойынша жинау тапсырмаларына бөлінеді. Жинақтаушылар тауарды смартфон арқылы белгілеп жинайды.",
          interactiveBadge: "А аймағы: Цемент [Жиналды] • B аймағы: Профиль [Жиналды]",
        },
        {
          num: "04",
          tag: "Логистикалық хаб",
          title: "Көлікті автоматты таңдау және тиеу",
          desc: "Платформа жүктің салмағы мен көлеміне сәйкес Газельді немесе кран-манипуляторды автоматты таңдайды. Жүргізуші рейсті мобильді қосымша арқылы қабылдайды.",
          interactiveBadge: "5т манипулятор тағайындалды • Мемнөмір 842 ABC 01",
        },
        {
          num: "05",
          tag: "GPS-трекинг • Қабылдау коды",
          title: "Нысанға жеткізу және қауіпсіз қабылдау",
          desc: "Сатып алушы көліктің қозғалысын онлайн картада көреді. Нысанда түсіру 4 таңбалы SMS-кодпен расталады — қағазбастылық пен даулы мәселелерсіз.",
          interactiveBadge: "Көлік нысанда: Тұран даңғылы, 48 • Растау коды: 4819",
        },
      ],
      stageLabel: (cur, total) => `${total} кезеңнің ${cur}-кезеңі`,
      ctaBtn: "AI-бот арқылы тапсырысты бастау",
    },
    supplierBenefits: {
      sectionBadge: "Құрылыс материалдарын жеткізушілер мен қоймаларға",
      title: "Жеткізуші үшін артық операционка жоқ.",
      titleAccent: "Кәсіпорынның толық ашықтығы.",
      desc: "Қолмен жасалатын механикалық әрекеттер мен телефондағы бейберекеттікті жойыңыз. Ақылды бот өтінімдерді қабылдау мен таратуды өз мойнына алады, ал сіз зауыттан түскен тауардан әрбір жөнелтілімге дейінгі толық көріністі нақты уақытта көресіз.",
      pillar1: {
        tag: "Күнделікті жұмыстың 95%-ын автоматтандыру",
        title: "Жеткізуші операционкаға байланбайды",
        desc: "Барлық механикалық әрекеттер жойылады — оны бот атқарады. Енді прорабтарға жүздеген рет қоңырау шалу, қағаздағы қолжазбаны оқу және есеп бағдарламаларына тауарларды қолмен енгізу қажет емес.",
        features: [
          {
            title: "Бот тапсырыстарды 24/7 қабылдайды",
            desc: "Дауыстық хабарламаларды, қолдан жазылған смета фотоларын, қазақ және орыс тілдеріндегі мәтіндерді менеджерсіз таниды.",
          },
          {
            title: "Автоматты есеп және Kaspi QR",
            desc: "Бот қоймадағы қалдықты жедел тексеріп, төлемге Kaspi QR ұсынады немесе ЭШФ бар қолма-қолсыз төлем шот-фактурасын жасайды.",
          },
          {
            title: "Қоймаға және жүргізушілерге жедел тапсырма",
            desc: "Төлемнен кейін тапсырыс менеджердің қатысуынсыз қойма аймақтары бойынша жинау тізіміне бөлініп, бос көлікке жіберіледі.",
          },
        ],
        metricValue: "0 мин",
        metricLabel: "Әдеттегі тапсырысқа менеджердің қол еңбегі",
      },
      pillar2: {
        tag: "Көлеңкесіз есеп және бақылау",
        title: "Ашық статистика: кірген және шыққан тауардың бәрі көрінеді",
        desc: "Басшы нақты уақыт режимінде кәсіпорында не болып жатқанының толық көрінісін көреді: цемент вагондарының келуінен әр қаптың түсірілуіне дейін.",
        features: [
          {
            title: "Тауар қозғалысының үздіксіз есебі",
            desc: "Нақты тіркеу: зауыттан қанша келді, қаншасы қалдықта, қаншасы бронда, қаншасы жолда. Ешқандай сәйкессіздік пен шатасу жоқ.",
          },
          {
            title: "Тікелей статистика және қаржылық көрініс",
            desc: "Маржиналдылық, орташа чек, қоймалардың жүктемесі және түсім динамикасы басшының смартфонында қолжетімді.",
          },
          {
            title: "Әрбір көлікті GPS арқылы бақылау",
            desc: "Көліктің келу уақыты, бағыты, тиеу фотосы және қауіпсіз SMS-код арқылы түсіруді растау.",
          },
        ],
        dashboardMockup: {
          title: "Қоймалық есеп және кәсіпорын аналитикасы",
          badgeLive: "Нақты уақытта",
          statInflow: "+48.5 т",
          statInflowLabel: "Бүгінгі түсім (вагондар/жүк көліктері)",
          statStock: "98.4%",
          statStockLabel: "Қойма қалдықтарының өзектілігі",
          statOutflow: "32 жөнелтілім",
          statOutflowLabel: "Бүгін клиенттерге жөнелтілді",
          statActiveTrips: "8 көлік",
          statActiveTripsLabel: "GPS арқылы рейс желісінде",
          recentLogs: [
            {
              time: "10:42",
              type: "in",
              text: "М400 Бухтарма цементінің келуі (партия 418) — 20.0 т",
              status: "Кіріске алынды",
            },
            {
              time: "10:35",
              type: "out",
              text: "#SM-8492 жөнелтілім: Газель 842 ABC — Grand Turan ТК",
              status: "Жолда (GPS)",
            },
            {
              time: "10:28",
              type: "reserve",
              text: "ИИ-бронь: 50 парақ Knauf ГКЛВ — СтройСервис ЖШС",
              status: "Kaspi төленді",
            },
          ],
        },
      },
      ctaPartnerBtn: "Қойманы платформаға қосу",
      partnerWhatsappText: "Сәлеметсіз бе! Қоймамызды СтройМаркетке қосқымыз келеді",
    },
    faq: {
      badge: "Сұрақ — жауап",
      title: "Жиі қойылатын сұрақтар",
      desc: "Астанадағы прорабтар, шеберлер мен пәтер иелерінің танымал сұрақтарына жауаптар",
      filterAll: "Барлық сұрақтар",
      filterPayment: "Төлем және Kaspi",
      filterDelivery: "Астана бойынша жеткізу",
      filterCalc: "AI есептеу және сметалар",
      items: [
        {
          category: "payment",
          q: "Тапсырыстың ең аз сомасы қандай?",
          a: "Ең төменгі шектеу жоқ. Сіз шұғыл жөндеуге арналған 3 қап ротбандты жеңіл көлікпен немесе Газельмен алдыра аласыз, сондай-ақ бірнеше манипулятормен көтерме кірпіш, гипсокартон немесе газоблок топтамасына тапсырыс бере аласыз.",
        },
        {
          category: "delivery",
          q: "Көлік Астанадағы нысанға қанша уақытта жетеді?",
          a: "Жедел тапсырыс берген кезде Алаш тас жолындағы қоймалардан орташа жеткізу уақыты 2–3 сағатты құрайды. Сондай-ақ AI-чатта нақты уақытты белгілеуге болады — мысалы, «ертең таңғы сағат 08:30-ға», шеберлер бірден жүк түсіруге кірісуі үшін.",
        },
        {
          category: "payment",
          q: "Жөндеуден кейін ашылмаған артық қаптар немесе блоктар қалса не істеу керек?",
          a: "Тауарлық түрі мен зауыттық қаптамасы сақталған жағдайда, біз 14 күн ішінде пайдаланылмаған материалдарды қайтарып аламыз. Экспедитор артық тауарды нысаннан алып кетеді, ал ақша Kaspi шотыңызға немесе картаңызға қайтарылады.",
        },
        {
          category: "payment",
          q: "Сіздер ҚҚС бар заңды тұлғалармен (ЖШС, ЖК) жұмыс істейсіздер ме?",
          a: "Иә, құрылыс компанияларымен және бригадалармен шарт негізінде жұмыс істейміз. ЭШФ АЖ арқылы электронды шот-фактураларды жазып береміз, жүкқұжаттарды (СНТ/АВР) қалыптастырамыз және зауыттық сапа төлқұжаттары мен СТ-KZ сертификаттарын қоса береміз.",
        },
        {
          category: "delivery",
          q: "Жүк тиеушілер мен қабатқа көтеру қызметі бар ма?",
          a: "Иә. AI-чатта тапсырыс бергенде: «9-қабатқа көтеру қажет, жүк лифті бар» деп көрсетіңіз. Жүйе жүктің жалпы салмағын есептеп, қажетті жүк тиеушілер санын таңдап, бағасын ашық сметаға енгізеді.",
        },
        {
          category: "calc",
          q: "AI-прораб құрылыс материалдарының шығынын қалай есептейді?",
          a: "Алгоритм өзекті ҚР ҚНжЕ және Knauf, AlinEX және Экотон технологиялық регламенттеріне сүйенеді. Жүйе қабырғалардың өлшемдерін, қабат қалыңдығын ескереді және кесу мен қалдыққа 5–7% нормативтік қорды автоматты түрде қосады.",
        },
      ],
      helpTitle: "Сұрағыңызға жауап таппадыңыз ба?",
      helpDesc: "Оны AI-прорабқа қойыңыз немесе Астанадағы қойманың кезекші диспетчеріне хабарласыңыз",
      helpChat: "Чатта сұрау",
      helpWhatsapp: "WhatsApp",
    },
    cta: {
      badge: "Тіркелусіз 2 минутта экспресс-есептеу",
      title: "Жөндеуді кідіріссіз және артық төлемсіз бастауға дайынсыз ба?",
      desc: "Тапсырмаңызды дәл қазір AI-прорабқа жазыңыз: ол ҚР ҚНжЕ бойынша нормаларды есептейді, Астана қоймасындағы қалдықтарды тексереді және Kaspi QR шотын шығарып береді.",
      btnAi: "«СтройМаркет» AI-чатын қосу",
      btnCabinet: "Жеке кабинет",
      tagWarehouses: "Астанадағы қоймалар (Алаш т.ж.)",
      tagKaspi: "Kaspi QR және Red бөліп төлеу",
      tagVat: "ҚҚС қосылған ЭШФ және СТ-KZ сертификаттары",
    },
    footer: {
      brandDesc: "Жасанды интеллектпен жабдықталған қара құрылыс материалдарының цифрлық маркетплейсі. Өндіруші зауыттардан тікелей жеткізілімдер, Астана бойынша жедел жеткізу және 24/7 смета есептеу.",
      address: "Астана қ., қоймалық логистикалық кешен (Алаш т.ж. ауданы)",
      schedule: "Қойма: 08:00 – 20:00 • AI-есептеу: Тәулік бойы 24/7",
      navTitle: "Навигация",
      materialsTitle: "Материалдар",
      matCement: "Цемент және құрғақ қоспалар",
      matBlocks: "Газобетон және кірпіш",
      matDrywall: "Гипсокартон және Knauf бейіндері",
      matSand: "Жуылған құм және қиыршық тас 5–20",
      matInsulation: "Жылуоқшаулағыш (Пеноплэкс)",
      matRebar: "А500С арматурасы және қалау торы",
      servicesTitle: "Қызметтер және байланыс",
      srvAiForeman: "AI-Прораб онлайн 24/7",
      srvCabinet: "Жеке кабинет",
      copyright: (year) => `© ${year} «СтройМаркет» (Астана). Барлық құқықтар қорғалған.`,
      paymentInfo: "Төлем: Kaspi QR • Kaspi Red • ҚҚС қосылған қолма-қол ақшасыз есеп айырысу",
    },
    floatingAi: {
      text: "AI-Прорабтан сұраңыз:",
      highlight: "жоба бойынша смета есептеу",
    },
  },
}

interface LandingI18nContextType {
  locale: LandingLocale
  setLocale: (loc: LandingLocale) => void
  t: LandingTranslations
}

const LandingI18nContext = createContext<LandingI18nContextType>({
  locale: "ru",
  setLocale: () => {},
  t: translations.ru,
})

// Словарь лендинга есть только для ru и kk; локаль en (запасная/дев) читает
// русский словарь, но cookie пользователя при этом не трогаем.
const toLandingLocale = (locale: Locale): LandingLocale =>
  locale === "kk" ? "kk" : "ru"

// Провайдер сидируется локалью, которую страница резолвит на сервере
// (resolveLocale, cookie `_medusa_locale`), — первый кадр сразу на нужном
// языке, без вспышки ru → kk. Смена языка идёт только через server action
// updateLocale (тот же cookie и те же атрибуты, что у переключателя витрины),
// затем router.refresh() — корневой layout пересидирует `lang` и словарь витрины.
export function LandingI18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<LandingLocale>(() =>
    toLandingLocale(initialLocale)
  )
  const router = useRouter()
  const [, startTransition] = useTransition()

  const setLocale = (next: LandingLocale) => {
    if (next === locale) {
      return
    }
    setLocaleState(next)
    startTransition(async () => {
      try {
        await updateLocale(next)
      } catch {
        // updateLocale сначала пишет cookie, потом обновляет корзину; сбой
        // второго шага не откатывает выбранный язык лендинга
      }
      router.refresh()
    })
  }

  return (
    <LandingI18nContext.Provider
      value={{ locale, setLocale, t: translations[locale] }}
    >
      {children}
    </LandingI18nContext.Provider>
  )
}

export function useLandingI18n() {
  return useContext(LandingI18nContext)
}
