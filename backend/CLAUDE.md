# backend/ — Medusa v2 (TypeScript)

> Скаффолд ещё не выполнен (см. docs/STATE.md). Этот файл — правила, которые действуют после него.

## Конвенции Medusa v2 (обязательны)
- **Модули изолированы**: `src/modules/<domain>/` — свои модели + сервис. Модуль НЕ импортирует другой модуль.
  Связи между моделями разных модулей — только через `src/links/`. Сквозная логика — только в `src/workflows/`.
- **API-роуты тонкие**: `src/api/**/route.ts` валидирует вход (zod) и вызывает workflow. Бизнес-логики в роутах нет.
- **Переиспользуй ядро**: прежде чем писать шаг workflow — проверь Core Workflows Reference; у ядра уже есть
  заказы, inventory с резервами, промо, store credit. Не дублируй ядро в кастомных модулях.
- **Админ-экраны**: `src/admin/` — widgets и UI routes на дизайн-ките `@medusajs/ui`. Никаких сторонних UI-библиотек.
- **События**: реакции (уведомления и т.п.) — в `src/subscribers/`; периодика (сгорание бонусов, пересчёт скоринга) — в `src/jobs/`.

## Структура src/ (фиксирована фреймворком)
`modules/` · `workflows/` · `api/{store,admin,driver,webhooks}` · `links/` · `subscribers/` · `jobs/` · `admin/` · `scripts/`

## После изменения API
Перегенерируй `contracts/openapi.json` и Dart-клиент (команды — в корневом CLAUDE.md после настройки конвейера).

## Тесты
Интеграционные тесты модуля — рядом с модулем (`src/modules/<domain>/__tests__/`); тесты workflows —
`integration-tests/`. Минимум на модуль: happy-path сервиса + инварианты из docs/modules/<domain>.md.
