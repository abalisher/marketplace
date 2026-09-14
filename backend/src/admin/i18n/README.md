# Локализация кастомной админки

Дашборд Medusa Admin поддерживает несколько языков интерфейса через
[react-i18next](https://react.i18next.com/). Русский (Русский) — встроенная
community-локаль дашборда, поэтому доступен в переключателе языка
(Settings → Profile → Language); наши переводы мерджатся с ядровыми.

## Структура

- `json/en.json` — **канон** (английский, референс ключей).
- `json/ru.json` — русский перевод; структура ключей ЗЕРКАЛЬНА `en.json`.
- `index.ts` — экспортирует ресурсы (`{ en: { translation }, ru: { translation } }`).

Ключи сгруппированы по фича-областям: `common`, `dashboard`, `companies`,
`productModeration`, `orderQueue`, `orderCard`, `order`, `shipping`, `bonus`,
`documents`, `reviews`, `scoring`, `estimator`, `procurement`, `loginCodes`,
`priceStock`. Общие подписи (Save/Cancel/Edit/Status/подвал таблицы…) — в
`common`.

Особый случай — **ключи ЯДРА**: блоки `general`, `actions`, `fields`, `labels`,
`filters`, `layout`, `views`, `inventory`, `orders`, `products`, `customers`,
`addresses`, `profile`, `auth`, `dateTime`, `dataGrid`. Это не наши экраны — это
добивка русской локали дашборда (T10.14e, T4.13). Наши ресурсы мерджатся с
ядровыми вглубь и перекрывают их, поэтому перевод подхватывается без патча ядра.
Значения `en` в этих блоках — копия ядровых (канон ключей): при обновлении
Medusa сверять состав с
`packages/admin/dashboard/src/i18n/translations/en.json`.

Зачем понадобилось (T4.13):

1. **Пропуски.** В `ru.json` дашборда 2.17.2 нет 479 ключей из 2359 — они
   молча падают на английский (`fallbackLng: "en"`). Добили те, что видны на
   рабочих экранах: «Manage location quantity», «Awaiting shipping», «Export
   Order List», «Customize page», адреса покупателя, двухфакторный вход.
   Разделы владельца (акции, прайс-листы, налоги, роли, переводы) не трогали —
   у продавца они скрыты, MVP их не использует.
2. **Множественное число.** У русского четыре формы (`one/few/many/other`), а в
   локали ядра у ВСЕХ 45 множественных ключей есть только `_one` и `_other` —
   при `count = 2..4` i18next не находит `_few` и откатывается на английский.
   Отсюда «537 available at 2 locations» и «Show 3 more activities» при
   переведённом ключе. Формы `_few`/`_many` есть только в `ru.json` — в
   английском их не существует, и зеркальность `en.json` на них не
   распространяется (единственное исключение из правила выше).
3. **Формулировки.** Часть ядровых переводов существует, но говорит не на языке
   склада: «Статус фулфилмента», «Ожидает фулфилмента», «Со скидкой: ИСТИНА».
   Такие ключи перекрыты нашими значениями («Статус сборки», «Ожидает сборки»,
   «Скидки применяются: Да»).

Чего этим слоем сделать НЕЛЬЗЯ: надписи, которые дашборд печатает строкой в
коде («Total pending», `Pp_kaspi_kaspi`, «Add», даты) — ключа не существует. Ими
занимается `lib/shell-text.ts` (см. `src/admin/README.md`).

## Использование

В widgets и routes строки берутся через `useTranslation` из `react-i18next`:

```tsx
import { useTranslation } from "react-i18next"

const MyWidget = () => {
  const { t } = useTranslation()
  return <Heading>{t("companies.title")}</Heading>
}
```

Интерполяция — синтаксис `{{var}}`: `t("companies.approve.description", { name })`.

## Конвенции проекта

- Тексты статусов/сегментов/типов держат **i18n-ключи** в `lib/*.ts`
  (например `COMPANY_STATUS_META[...].label = "companies.status.pending"`),
  а компоненты рендерят их через `t(meta.label)`. Так карта остаётся единым
  реестром, а перевод централизован в JSON.
- Лейблы сайдбара в `defineRouteConfig({ label })` вычисляются вне React —
  хук `useTranslation` там недоступен. С T4.1 они берутся через
  `lib/route-label.ts`: он читает ту же локаль, что и детектор i18next
  (cookie `lng`, затем localStorage), и отдаёт `en`/`ru`-подпись. Значение
  вычисляется при загрузке бандла, поэтому смена языка в профиле применяется
  к сайдбару после перезагрузки страницы. Ключи в JSON для этих подписей не
  заводим — они не проходят через `t()`.
- Форматирование дат/чисел (`toLocaleString`, форматтеры денег) пока не
  локализовано по региону — отдельный небольшой долг.

## Добавить язык

Создай `json/<code>.json` (двухбуквенный код) с той же структурой ключей и
добавь его в `index.ts`. Язык появится в переключателе, только если он —
одна из поддерживаемых дашбордом локалей.

Подробнее:
[Translate Admin Customizations](https://docs.medusajs.com/learn/fundamentals/admin/translations).
