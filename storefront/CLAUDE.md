# storefront/ — веб-витрина покупателя (Next.js)

> База — официальный Medusa Next.js Starter Storefront. Кастомизации: оформление через
> `POST /store/orders` (наш placeOrder + delivery_method), гейт логина в чекауте, оплата Kaspi в
> чекауте и чате (init/поллинг через наш роут, `KaspiPaymentButton`, общий блок счёта
> `common/components/kaspi-pay-panel`, env `KASPI_MOCK_SCENARIO` для мока),
> бонусы в чекауте (`lib/data/bonus.ts`, `bonus-form`, строка в cart-totals из `credit_lines` —
> `*credit_lines` обязателен в fields, иначе total без вычета), decodeURIComponent для
> кириллических handle. Текущее состояние — docs/STATE.md.

## Правила
- Витрина — ТОНКИЙ клиент: только отображение и вызовы API (Medusa JS SDK). Бизнес-правил здесь нет —
  скидки, лимиты, бонусы, остатки считает бэкенд.
- Паритет с mobile/apps/buyer: та же функциональность, свой UX. Новая фича покупателя добавляется на обе платформы
  (правило в ARCHITECTURE.md → «Клиенты и распределение ролей»).
- App Router, Server Components по умолчанию; клиентские компоненты — только там, где есть интерактив.
- Стили и компоненты стартера переиспользуем; кастомные компоненты — в `src/components/`, по одному на файл.
- Локализация UI: СЛОВАРНЫЙ i18n в `src/lib/i18n/` (ru основной, kk, en; выбран вместо next-intl, DECISIONS 2026-07-21).
  Локаль — из cookie `_medusa_locale` (resolve-locale), провайдер сидируется в корневом `app/layout.tsx`. Строки в
  компонентах — через `useMessages()` (клиент); новые строки добавлять в `messages/en.ts` (канон) + ru.ts/kk.ts.
  Переключатель — `modules/layout/components/language-switcher`. Локализация экранов — инкрементально. (Отдельно:
  бэкенд-контентная локаль — `x-medusa-locale`/`/store/locales`, про переводы контента, не UI-строки.)

## Дизайн-система (с T3.1)
- Цвета/шрифт/радиусы — ТОЛЬКО токены: `src/styles/tokens.css` (палитра каналами, свет в `:root`,
  тьма в `.dark` на `<html>`) + классы Tailwind `text-ink`, `text-ink-secondary`, `border-line`,
  `bg-surface`, `bg-surface-dim`, `text-accent`, `bg-accent-container`, `success`/`warning`/`error`,
  `kaspi`, `scrim`, радиусы `rounded-chip|card|bubble|field`, кегли `text-body-large` и т.п.
  Источник значений — `mobile/packages/ui_kit` (`AppColors`/`AppColorsDark`, `AppTypography`).
- Гарнитура — **Roboto** (решение владельца 2026-09-14, эталон Gemini): `src/lib/fonts/roboto.ts`,
  один переменный файл в `src/fonts`, подключается в корневом layout, берётся через `font-sans`.
  Знака ₸ в Roboto НЕТ — он приходит вырезкой `src/lib/fonts/roboto-tenge.ts` (1 КБ), стоящей в
  стеке сразу за основным шрифтом; `adjustFontFallback` у обеих гарнитур выключен намеренно (иначе
  ₸ забирает подстановочное начертание next). Кегли разговорного экрана — `text-assistant-*`
  (greeting / body / chip / caption), они крупнее общей шкалы витрины: так в эталоне.
- Разговорные маршруты `(chat)` идут БЕЗ шапки витрины (`Nav` только в `(main)`): оболочка чата
  сама себе шапка, марка магазина живёт сверху рельса диалогов.
- Утилиты палитры Tailwind по умолчанию (`bg-white`, `text-black`, `grey-*`, `gray-*`, `zinc-*`,
  `neutral-*`, `red-500` и пр.) НЕ использовать — ломают тёмную тему. Исключение одно: белая
  подложка Kaspi QR (помечена комментарием).
- Классы стартера `text-ui-fg-*`/`bg-ui-bg-*` работают: переменные `@medusajs/ui-preset`
  переопределены брендовыми в `tokens.css`. В новом коде предпочитать прямые токены.
- Тема: cookie `_sm_theme` (`system`/`light`/`dark`), переключатель — `layout/components/theme-switcher`,
  скрипт первого кадра — `layout/components/theme-script` (его логика зеркалит `lib/theme/apply-theme.ts`,
  правки синхронизировать).
- Скриншоты гейта U: `node scripts/screenshots.mjs --spec scripts/shots/<таск>.mjs --out
  ../docs/qa/screens/<таск>` при поднятой витрине (свет/тьма × локали, headless Chrome по CDP, без
  внешних зависимостей). Список кадров — отдельная спека на таск в `scripts/shots/`; кадр может
  проигрывать сценарий (`fill`/`click`/`waitFor`/`goto`/`scrollTo`/`offline`/`eval`). Креды для
  кадров с входом — только через переменные окружения, не в файлах. `eval` — для состояний в
  localStorage (история диалогов чата), иначе диалог с оформленным заказом пришлось бы каждый кадр
  проигрывать через модель.
- Чат ассистента: вставки хода (`payment`/`order_status`/`documents`/`auth_prompt`) —
  `modules/assistant/components/*`; карточек подбора в ленте НЕТ (T10.19) — количество правится
  только в полосе корзины `cart-bar`, вторую точку счётчиков в ленту не возвращать;
  разбор по дискриминатору в `attachment-list`, неизвестный тип пропускается. История диалогов —
  `lib/chat-history/` (localStorage `sm_chat_history`, бэкенд stateless). Оформление требует входа
  (T10.8): вставка `auth_prompt` ведёт на `/account?redirect=…/chat?logged_in=1`, вход по номеру
  возвращает по `redirect`, а шаблон чата по метке `logged_in` сам продолжает диалог. Документы заказа —
  `lib/data/documents.ts` + `modules/order/components/order-documents`.
- **Оболочка чата — по эталону Gemini** (T10.1b, бриф `docs/qa/2026-08-27-T10.1-gemini-brief.md`; он же
  эталон сверки гейта U для покупательских чат-экранов). Рельс истории `chat-rail` (280px / 72px
  свёрнутый, состояние в localStorage `sm_chat_rail_collapsed`; на мобильном — drawer `absolute`
  внутри области чата, НЕ `fixed`: `fixed` уводит верх под шапку витрины), строка списка —
  `chat-history-row` (меню «⋮», инлайн-переименование), удаление — `chat-delete-dialog`.
  Ответ ассистента — `assistant-answer` (без пузыря, метка-аватар, вставки ВНУТРИ блока ответа,
  ряд действий `message-actions`); `chat-bubble` — только реплика покупателя; общий рендер текста —
  `message-content`. Переименованный диалог помечен `titleCustom` — автозаголовок его не перетирает.
  Композер не блокируется на время хода (недоступна только отправка), авторост до 8 строк.
- **Ответ печатается стримингом** (T10.1d): браузер идёт в свой route handler
  `app/api/assistant/stream/route.ts` (он добавляет авторизацию из httpOnly-cookie и
  publishable-ключ и проксирует SSE бэкенда `POST /store/assistant/chat/stream`), читает поток
  `lib/data/assistant-stream.ts`. Итог хода берётся из события `done` — оно авторитетно; дельты
  только печатаются. Поток не открылся → тот же ход уходит обычным POST через второй прокси
  `app/api/assistant/chat/route.ts` (`lib/data/assistant-post.ts`; server action не годится — с
  вложением тело до 12 МБ против предела действий Next в 1 МБ). После первого события откат
  ЗАПРЕЩЁН (инструменты хода могли сработать), а 400 не откатывается вовсе — тело забраковано, и
  второй такой же запрос забракуют снова. Кнопка отправки на время хода становится «Стоп»
  (`chat-stop-button`) — она рвёт соединение, и напечатанное остаётся ответом в ленте. Семантика
  событий и «Стопа» — `docs/modules/assistant.md`, решения — DECISIONS 2026-08-27.
- **Вложения в композере** (T10.4b): правила приёма — `lib/assistant/file-attachment.ts` (зеркало
  `backend/src/lib/assistant/file-input.ts`: jpeg/png/webp/heic + PDF, 8 МБ на файл, 12 МБ на ход,
  3 файла, отдельный отказ по таблицам), набор до отправки — хук `use-file-attachments`, чипы —
  `attachment-chip` + `attachment-thumb`, превью в пузыре — `message-attachments`. Файлы уходят в
  `files[]` того же хода и живут РОВНО один ход; превью отправленных вложений шаблон чата держит в
  памяти вкладки по месту реплики в ленте — в `localStorage` их НЕ пишем (квота). Отказ говорит
  причину строкой на месте дисклеймера, ручной ввод не отнимается. На узком экране (<640px) поле и
  ряд кнопок стоят в два ряда: три тап-таргета по 48px не помещаются в строку рядом с полем.
- Деньги — только `convertToLocale` (ru-KZ, символ ₸, тенге без копеек); в новых экранах добавлять
  `tabular-nums`. Даты — только `lib/i18n/format-date.ts` (свой `toLocaleDateString` в компоненте =
  регресс локали, T3.9).
- **Итоги заказа: `order.subtotal` ядра включает ДОСТАВКУ** (проверено на №43: 266 000 =
  `item_total` 264 000 + `shipping_total` 2 000). Строка «Товары» считается от `item_total`, иначе
  подытог + доставка не сходятся с «Итого» (T3.11). Нулевые строки (скидка, бонусы, налоги) не
  печатаем — пустое значение читается как потерянная цифра.
- Текст ответа ассистента разбирается `lib/util/assistant-markdown.ts` (абзацы + `ul`/`ol`);
  инлайн-`**жирный**` рисует сам `chat-bubble`. Полного markdown-рендера нет и не нужно.
- Возврат на `/chat` поднимает последний диалог из локальной истории (лента и токены), а не
  начинает новый (T3.11). Вставки при этом не восстанавливаются — они эфемерны.
- **Кабинет клиента** (T10.6b) — в оболочке чата: `modules/cabinet` (`CabinetShell` — тот же
  `chat-rail`, разделы в нём же `cabinet-rail-links`, ряд чипов `cabinet-nav` ТОЛЬКО на мобильном)
  и страницы `(chat)/cabinet/{orders,orders/[id],cart,documents,profile}`. Данные — `lib/data/
  {order-lifecycle,documents,my-cart}.ts` поверх личных роутов бэкенда (`/store/order-lifecycles`,
  `/store/documents`, `/store/carts/me`), кэша нет. Стартерные `/account/{orders,orders/details/:id,
  profile,addresses}` и обзор — редиректы в кабинет; второй страницы заказов быть не должно.
  Диалог из кабинета открывается ссылкой `/chat?conversation=<id>`.
- **Корзины в интерфейсе НЕТ** (T3.10): её ведёт ассистент в диалоге (`cart_id` держит клиент),
  cookie-корзина стартера (`_medusa_cart_id`) не наполняется вовсе. Пункта в шапке и меню нет,
  `/cart` уводится в чат редиректом middleware (`CHAT_ONLY_PREFIXES`), страницы `/cart` и
  `/checkout` остались в репозитории недостижимыми. Не возвращать счётчик и не строить второй
  редактируемый вход в состав заказа — DECISIONS 2026-08-14. Раздел «Корзина» кабинета (T10.6b)
  этому не противоречит: он ТОЛЬКО показывает состав и итог и ведёт обратно в чат.
- **Заказы не кэшируем** (`cache: "no-store"` в `lib/data/orders.ts`): их оформляет бэкенд — и через
  чат, и через панель, — инвалидировать тег `orders` из витрины некому (T3.9, блокер Б3).

## Важно про стенд
После `npm run build` перезапускайте `npm start`: старый процесс отдаёт HTML со ссылками на уже
перезаписанные чанки, и все страницы падают с `ChunkLoadError` (выглядит как баг кода, но это стенд).
`next build` ломает и ПОДНЯТЫЙ `npm run dev` — он пишет в тот же `.next`, дев-сервер начинает
отвечать 500 (`ENOENT … .next/server/pages/_app/build-manifest.json`). Собирали при живом стенде —
перезапустите `npm run dev` (найдено 2026-08-13 в T3.8).
Первый запрос на новый `_medusa_cache_id` может вернуть 307 в себя, если бэкенд ещё не поднялся
(`middleware → getRegionMap → fetch failed`): сначала дождитесь `:9000/health`, потом повторите.

## Не делать
- Не обращаться к БД напрямую, не дублировать типы бэкенда руками — типы приходят из SDK/стартера.
- Не хранить секреты в клиентском коде — только публичные env (`NEXT_PUBLIC_*`).
