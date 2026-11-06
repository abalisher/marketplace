"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import KaspiLogo from "@modules/landing/components/kaspi-logo"
import { useLandingI18n } from "@lib/i18n/landing-i18n"
import {
  IconBot,
  IconMapPin,
  IconClock,
  IconWhatsApp,
} from "@modules/landing/components/icons"
import { landingWhatsAppHref } from "@modules/landing/contacts"

export default function LandingFooter() {
  const { locale, t } = useLandingI18n()

  const materialPrompts = {
    cement:
      locale === "kk"
        ? "Сәлеметсіз бе! Мені Бұқтырма цементі (М400 / М500) және құрғақ құрылыс қоспалары қызықтырады. Алаш тас жолы қоймасындағы барын, қап бағасын және Астана бойынша жеткізу шарттарын айтып беріңізші."
        : "Здравствуйте! Меня интересует цемент Бухтарма (М400 / М500) и сухие строительные смеси. Подскажите наличие на складе Шоссе Алаш, актуальные цены за мешок и условия доставки по Астане.",
    blocks:
      locale === "kk"
        ? "Сәлеметсіз бе! Қабырғалық және қалқалық автоклавты газоблок (Экотон) пен кірпіш қажет. Текше көлемін, желімді және Астана бойынша манипулятормен жеткізуді есептеуге көмектесіңіз."
        : "Здравствуйте! Нужен автоклавный газоблок Экотон (стеновой и перегородочный) и кирпич. Помогите рассчитать количество кубов, клей и доставку манипулятором на объект в Астане.",
    drywall:
      locale === "kk"
        ? "Сәлеметсіз бе! Knauf гипсокартоны (стандартты ГКЛ және ылғалға төзімді ГКЛВ), CD/UD/CW/UW профильдері мен бекіткіштер қажет. Спецификация жасап, тапсырыс беруге көмектесіңіз."
        : "Здравствуйте! Нужен гипсокартон Knauf (стандартный ГКЛ 9.5/12.5 мм и влагостойкий ГКЛВ), профили CD/UD/CW/UW и комплектующие. Помогите составить спецификацию и оформить заказ.",
    sand:
      locale === "kk"
        ? "Сәлеметсіз бе! Стяжка мен бетонға арналған жуылған еленген құм және 5-20 қиыршықтас қажет. Ең аз партия көлемін, бағасын және Астана бойынша самосвалмен жедел жеткізуді нақтылап беріңізші."
        : "Здравствуйте! Требуется мытый сеяный песок и щебень фракции 5-20 / 20-40 для стяжки и бетона. Подскажите объем минимальной партии, цены и возможность оперативной доставки самосвалом по Астане.",
    insulation:
      locale === "kk"
        ? "Сәлеметсіз бе! Пеноплэкс жылытқышы (Комфорт/Фундамент 30, 50, 100 мм) және базальт мақтасы қызықтырады. Қоймадағы барын, бума көлемін және жеткізу бағасын айтып беріңізші."
        : "Здравствуйте! Интересует теплоизоляция Пеноплэкс (Комфорт/Фундамент 30, 50, 100 мм) и минеральная вата. Подскажите наличие, объем упаковок и цены с доставкой со склада.",
    rebar:
      locale === "kk"
        ? "Сәлеметсіз бе! А500С құрылыс арматурасы (10, 12, 14, 16 мм) және қалау торы (сетка) қажет. Тонна немесе метр бағасын, өлшемге сай кесуді және Астана бойынша жеткізуді айтып беріңізші."
        : "Здравствуйте! Нужна рифленая строительная арматура А500С (10, 12, 14, 16 мм) и кладочная сетка 50х50 / 100х100. Подскажите стоимость за тонну/метр, есть ли резка в размер и доставка по Астане.",
    aiForeman:
      locale === "kk"
        ? "Сәлем, AI-Прораб! Астанадағы нысанға қажетті қара сылақ материалдарының толық жиынтығын таңдап, жеткізу көлемін есептеп бер."
        : "Привет, AI-Прораб! Помоги подобрать полный комплект черновых стройматериалов на объект в Астане и рассчитай объем с оперативной доставкой.",
  }

  return (
    <footer className="bg-surface-dim border-t border-line py-14 text-ink-secondary text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Address */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/brand-logo.png"
                alt="СтройМаркет"
                className="w-10 h-10 rounded-xl shadow-sm object-contain shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-black text-ink text-xl tracking-tight leading-none">
                  СТРОЙ<span className="text-accent">МАРКЕТ</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-accent tracking-wider uppercase mt-1">
                  АСТАНА
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed max-w-sm">
              {t.footer.brandDesc}
            </p>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-start gap-2.5 text-ink">
                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <IconMapPin className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="leading-snug">{t.footer.address}</span>
              </div>
              <div className="flex items-start gap-2.5 text-ink">
                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <IconClock className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="leading-snug">{t.footer.schedule}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink mb-4 font-mono">
              {t.footer.navTitle}
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-accent transition-colors">
                  {t.nav.workflow}
                </a>
              </li>
              <li>
                <a href="#supplier-benefits" className="hover:text-accent transition-colors">
                  {t.nav.suppliers}
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-accent transition-colors">
                  {t.nav.calculator}
                </a>
              </li>
              <li>
                <a href="#delivery" className="hover:text-accent transition-colors">
                  {t.nav.delivery}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-accent transition-colors">
                  {t.nav.faq}
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink mb-4 font-mono">
              {t.footer.materialsTitle}
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <LocalizedClientLink
                  href={`/chat?prompt=${encodeURIComponent(materialPrompts.cement)}`}
                  className="hover:text-accent transition-colors"
                >
                  {t.footer.matCement}
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href={`/chat?prompt=${encodeURIComponent(materialPrompts.blocks)}`}
                  className="hover:text-accent transition-colors"
                >
                  {t.footer.matBlocks}
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href={`/chat?prompt=${encodeURIComponent(materialPrompts.drywall)}`}
                  className="hover:text-accent transition-colors"
                >
                  {t.footer.matDrywall}
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href={`/chat?prompt=${encodeURIComponent(materialPrompts.sand)}`}
                  className="hover:text-accent transition-colors"
                >
                  {t.footer.matSand}
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href={`/chat?prompt=${encodeURIComponent(materialPrompts.insulation)}`}
                  className="hover:text-accent transition-colors"
                >
                  {t.footer.matInsulation}
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href={`/chat?prompt=${encodeURIComponent(materialPrompts.rebar)}`}
                  className="hover:text-accent transition-colors"
                >
                  {t.footer.matRebar}
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Contacts & Actions */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink mb-4 font-mono">
              {t.footer.servicesTitle}
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <LocalizedClientLink
                  href={`/chat?prompt=${encodeURIComponent(materialPrompts.aiForeman)}`}
                  className="font-bold text-accent hover:underline flex items-center gap-1.5"
                >
                  <IconBot className="w-4 h-4 text-accent" />
                  <span>{t.footer.srvAiForeman}</span>
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/cabinet/profile"
                  className="hover:text-accent transition-colors"
                >
                  {t.footer.srvCabinet}
                </LocalizedClientLink>
              </li>
              <li>
                <a
                  href={landingWhatsAppHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group"
                >
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <IconWhatsApp className="w-3.5 h-3.5 text-[#25D366]" />
                  </div>
                  <span className="tracking-wide">WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-secondary">
          <p>{t.footer.copyright(new Date().getFullYear())}</p>
          <p className="flex items-center gap-2 font-medium">
            <KaspiLogo size={16} />
            <span>{t.footer.paymentInfo}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
