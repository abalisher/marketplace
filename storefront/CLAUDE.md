# storefront/ — веб-витрина покупателя (Next.js)

> База — официальный Medusa Next.js Starter Storefront. Кастомизации: оформление через
> `POST /store/orders` (наш placeOrder + delivery_method), гейт логина в чекауте, Kaspi QR в
> чекауте (init/поллинг через наш роут, `KaspiPaymentButton`, env `KASPI_MOCK_SCENARIO` для мока),
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

## Не делать
- Не обращаться к БД напрямую, не дублировать типы бэкенда руками — типы приходят из SDK/стартера.
- Не хранить секреты в клиентском коде — только публичные env (`NEXT_PUBLIC_*`).
