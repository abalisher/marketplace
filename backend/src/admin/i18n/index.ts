import en from "./json/en.json"
import ru from "./json/ru.json"

// Переводы кастомных админ-экранов (routes/widgets). Ключи — в json/<lang>.json,
// en — канон. Русский (Русский) — встроенная community-локаль дашборда Medusa,
// поэтому появляется в переключателе языка (Settings → Profile); наши ресурсы
// мерджатся с ядровыми. Компоненты берут строки через useTranslation() из
// react-i18next. Тексты статусов/сегментов держат i18n-ключи в lib/*.ts.
export default {
  en: {
    translation: en,
  },
  ru: {
    translation: ru,
  },
}
