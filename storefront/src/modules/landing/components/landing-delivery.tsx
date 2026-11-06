"use client"

import KaspiLogo from "@modules/landing/components/kaspi-logo"
import { useLandingI18n } from "@lib/i18n/landing-i18n"
import {
  IconTruck,
  IconCrane,
  IconDumpTruck,
  IconMapPin,
  IconDocument,
  IconReturn,
  IconShieldCheck,
  IconClock,
} from "@modules/landing/components/icons"

// description — свой подзаголовок для страницы компании: текст лендинга
// называет склады площадки (Алаш, Коктал), а компания возит со своего склада.
// quiet — спокойный заголовок секции для страницы компании.
export default function LandingDelivery({
  description,
  quiet = false,
}: { description?: string; quiet?: boolean } = {}) {
  const { locale, t } = useLandingI18n()

  const fleet = locale === "kk" ? [
    {
      title: "Газель Next / Соболь",
      spec: "2.0 т дейін • 12 м³",
      time: "60–90 мин",
      desc: "Тұрғын үй кешендерінің жабық аулалары мен биіктігі шектелген паркингтеріне еркін кіреді.",
      Icon: IconTruck,
    },
    {
      title: "Кран-манипулятор",
      spec: "5.0 т дейін • жебе 8 м",
      time: "2 сағаттан",
      desc: "Палеттерді тікелей құрылыс алаңына немесе 2-қабатқа түсіреді. Жүк түсірушілер қажет емес.",
      Icon: IconCrane,
    },
    {
      title: "Самосвал Kamaz / Shacman",
      spec: "15–25 т • 16–20 м³",
      time: "Келісім бойынша",
      desc: "Жуымды құм, қиыршық тас, отсев карьерлерден тікелей жеткізіледі.",
      Icon: IconDumpTruck,
    },
  ] : [
    {
      title: "Газель Next / Соболь",
      spec: "до 2.0 т • 12 м³",
      time: "60–90 мин",
      desc: "Проходит в закрытые дворы ЖК и подземные паркинги Астаны с ограничением по высоте.",
      Icon: IconTruck,
    },
    {
      title: "Кран-манипулятор",
      spec: "до 5.0 т • стрела 8 м",
      time: "от 2 часов",
      desc: "Разгружает поддоны прямо на пятно застройки или подает на 2-й этаж. Без грузчиков.",
      Icon: IconCrane,
    },
    {
      title: "Самосвалы Камаз / Shacman",
      spec: "15–25 т • 16–20 м³",
      time: "По графику",
      desc: "Прямая поставка нерудных материалов с карьеров: мытый песок, щебень, отсев.",
      Icon: IconDumpTruck,
    },
  ]

  const districts = locale === "kk" ? [
    { name: "Есіл ауданы (Сол жағалау)", time: "2–2.5 сағат", fast: true },
    { name: "Алматы ауданы", time: "2–3 сағат", fast: true },
    { name: "Сарыарқа ауданы", time: "2–3 сағат", fast: true },
    { name: "Байқоңыр ауданы (Өндіріс аймағы)", time: "1.5–2 сағат", fast: true },
    { name: "Қала маңы (Қосшы, Үркер, Қоянды)", time: "3 сағаттан", fast: false },
  ] : [
    { name: "Есильский район (Левый берег)", time: "2–2.5 часа", fast: true },
    { name: "Алматинский район", time: "2–3 часа", fast: true },
    { name: "Сарыаркинский район", time: "2–3 часа", fast: true },
    { name: "Байконурский район (Промзона)", time: "1.5–2 часа", fast: true },
    { name: "Пригородные поселки (Косшы, Уркер, Коянды)", time: "от 3 часов", fast: false },
  ]

  const guarantees = locale === "kk" ? [
    {
      title: "Kaspi QR & Red",
      desc: "Нысанда қабылдаған соң төлеу",
      icon: <KaspiLogo size={18} />,
    },
    {
      title: "ҚҚС және ЭШФ бар",
      desc: "ЖШС/ЖК толық жабу құжаттары",
      icon: <IconDocument className="w-4 h-4 text-accent" />,
    },
    {
      title: "Қалдықты қайтару 14 күн",
      desc: "Артылған қаптарды кері сатып аламыз",
      icon: <IconReturn className="w-4 h-4 text-accent" />,
    },
    {
      title: "Зауыт сертификаттары",
      desc: "ГОСТ және ҚР ҚНжЕ сәйкестік",
      icon: <IconShieldCheck className="w-4 h-4 text-accent" />,
    },
  ] : [
    {
      title: "Оплата Kaspi QR & Red",
      desc: "После приемки товара на объекте",
      icon: <KaspiLogo size={18} />,
    },
    {
      title: "С НДС и ЭСФ для юрлиц",
      desc: "Договор, накладные и ЭСФ для ТОО/ИП",
      icon: <IconDocument className="w-4 h-4 text-accent" />,
    },
    {
      title: "Возврат остатков 14 дней",
      desc: "Выкупаем неиспользованные мешки",
      icon: <IconReturn className="w-4 h-4 text-accent" />,
    },
    {
      title: "Сертификаты качества",
      desc: "Паспорта заводов по ГОСТ и СНиП РК",
      icon: <IconShieldCheck className="w-4 h-4 text-accent" />,
    },
  ]

  return (
    <section id="delivery" className="scroll-mt-20 md:scroll-mt-28 py-16 md:py-24 bg-surface border-b border-line relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-container text-accent text-xs font-bold uppercase tracking-wider mb-2.5">
            <IconTruck className="w-3.5 h-3.5" />
            <span>{locale === "kk" ? "Логистика және кепілдіктер" : "Логистика и гарантии"}</span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl text-ink tracking-tight mb-3 ${
              quiet ? "font-bold" : "lg:text-4xl font-black"
            }`}
          >
            {locale === "kk"
              ? "Астана бойынша жедел жеткізу және автопарк"
              : "Оперативная доставка стройматериалов по Астане"}
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            {description ??
              (locale === "kk"
              ? "Шоссе Алаш және Көктал қоймаларынан қаланың кез келген нүктесіне. Манипулятормен түсіру және паркингтерге кіру."
              : "Собственный диспетчерский парк. Подача машин со складов Алаш и Коктал от 60 минут, заезд в паркинги и разгрузка манипулятором.")}
          </p>
        </div>

        {/* Combined Fleet + Districts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
          {/* Left: Dispatch Fleet (7 cols) */}
          <div className="lg:col-span-7 bg-surface-dim rounded-2xl p-6 sm:p-7 border border-line flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                  <IconTruck className="w-5 h-5 text-accent" />
                  <span>{locale === "kk" ? "Диспетчерлік автопарк" : "Диспетчерский автопарк"}</span>
                </h3>
                <span className="text-[11px] font-mono font-semibold text-accent bg-accent-container px-2.5 py-0.5 rounded-full">
                  GPS-tracking
                </span>
              </div>

              <div className="space-y-3">
                {fleet.map((car, idx) => {
                  const CarIcon = car.Icon
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-accent-container text-accent flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <CarIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-ink flex items-center gap-2">
                            <span>{car.title}</span>
                            <span className="text-[11px] font-mono font-semibold text-ink-secondary">
                              ({car.spec})
                            </span>
                          </div>
                          <div className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                            {car.desc}
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-line/60">
                        <span className="text-[11px] text-ink-secondary">
                          {locale === "kk" ? "Келу уақыты:" : "Подача:"}
                        </span>
                        <span className="text-xs font-mono font-bold text-accent inline-flex items-center gap-1">
                          <IconClock className="w-3 h-3" />
                          <span>{car.time}</span>
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Astana Delivery Zones (5 cols) */}
          <div className="lg:col-span-5 bg-surface-dim rounded-2xl p-6 sm:p-7 border border-line flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                  <IconMapPin className="w-5 h-5 text-accent" />
                  <span>{locale === "kk" ? "Астана аудандары" : "Зоны доставки по Астане"}</span>
                </h3>
                <span className="text-[11px] font-bold text-success bg-success/10 px-2.5 py-0.5 rounded-full border border-success/20">
                  {locale === "kk" ? "Күнделікті" : "Ежедневно"}
                </span>
              </div>

              <div className="space-y-2.5">
                {districts.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface border border-line flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span aria-hidden="true" className="w-2 h-2 rounded-full bg-success shrink-0" />
                      <span className="font-semibold text-ink truncate">{d.name}</span>
                    </div>
                    <span className="font-mono font-bold text-accent shrink-0 ml-2">
                      {d.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-line/70 flex items-center justify-between text-[11px] text-ink-secondary">
              <span>{locale === "kk" ? "Қоймадан тиеу: 08:00 – 20:00" : "Отгрузка со складов: 08:00 – 20:00"}</span>
              <span className="font-semibold text-accent">{locale === "kk" ? "Демалыссыз" : "Без выходных"}</span>
            </div>
          </div>
        </div>

        {/* Compact 4 Guarantees Strip (Kaspi, B2B VAT, Returns, Certificates) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guarantees.map((g, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface-dim border border-line flex items-start gap-3 hover:border-accent/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {g.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-ink mb-0.5">{g.title}</div>
                <div className="text-[11px] text-ink-secondary leading-snug">{g.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
