// Локаль панели ВНЕ React-дерева.
//
// Штатный `useTranslation()` доступен только в компонентах, а локаль нужна и там,
// где его нет: в подписях сайдбара (`defineRouteConfig` вычисляется до React) и в
// модульных форматтерах дат. Берём ту же локаль, что и детектор i18next дашборда:
// сначала cookie `lng`, затем localStorage с тем же ключом.
//
// Значение читается ОДИН РАЗ при загрузке бандла: дашборд перезагружает страницу
// при смене языка в профиле, поэтому пересчёт на лету не нужен.

export type PanelLanguage = "en" | "ru"

const detectLanguage = (): PanelLanguage => {
  if (typeof document === "undefined") {
    return "en"
  }
  const fromCookie = document.cookie.match(/(?:^|;\s*)lng=([^;]+)/)?.[1]
  const raw =
    fromCookie ??
    (typeof localStorage === "undefined" ? null : localStorage.getItem("lng"))
  return raw?.toLowerCase().startsWith("ru") ? "ru" : "en"
}

export const panelLanguage = detectLanguage()

// Тег для Intl: у русского берём казахстанский регион — порядок компонентов даты
// тот же, что в ru-RU, но это честная локаль стенда.
export const panelLocale = panelLanguage === "ru" ? "ru-KZ" : "en-US"
