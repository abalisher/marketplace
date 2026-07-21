# Модуль `documents` — автогенерация документов

**Статус:** ГОТОВ (4/4 подзадачи) · **Код:** `backend/src/modules/documents/` (модель/сервис/шрифты) +
`backend/src/workflows/` (issue-order-document + update-document-settings + шаги + рендерер) +
`backend/src/subscribers/` (автовыпуск) + `backend/src/api/{store,admin}/orders/[id]/documents/` (ЛК/админ/экспорт) +
`backend/src/api/admin/document-settings/` (реквизиты) + `backend/src/admin/` (Settings-страница + widget заказа).

## Назначение
Автоматическое формирование документов-оснований по событиям заказа (счёт, накладная,
внутренний АВР) и их хранение с версионностью. Документы видны в ЛК обеих сторон
(покупатель + продавец/админ).

## Что закрывает ядро / что кастом
- **Хранение файла** — File Module ядра (`Modules.FILE`, локальный провайдер пишет в `static/`,
  в проде — S3/совместимый). Модуль documents хранит только МЕТАданные документа и ссылку `file_id`.
- **Рендер PDF** — кастом: `pdfkit` (чистый JS, без Chromium). Кириллица — встраиванием TTF-шрифта
  (стандартные шрифты PDF латиница-only). Рендер и связывание с File Module — в workflow-шаге
  (подзадача 2), не в сервисе модуля (модуль изолирован, File Module — другой модуль).
- **Нумерация, версионность, снапшот** — кастом, в сервисе модуля.

## Модели
- `Document` — строка документа: `type` (invoice|waybill|internal_avr), `order_id` (опазная ссылка
  на заказ ядра, не FK), `number` (человекочитаемый, INV-2026-000001), `version`, `is_latest`,
  `file_id`/`file_url` (ссылка на PDF в File Module; null пока не отрендерен), `snapshot` (json —
  замороженные исходные данные), `total_money`/`total_bonus` (суммы деньгами/бонусами раздельно —
  ТЗ 4.10), `currency_code`, `visible_to_buyer`/`visible_to_seller`, `note`.
- `DocumentSetting` — singleton реквизитов продавца для рендера (name/bin/address/bank/iban/footer);
  `getOrCreateSettings` создаёт с дефолтами. Идиома `BonusConfig`.
- `DocumentSequence` — счётчик номеров по ключу `<type>:<year>` (строка на тип/год).

### Почему `order_id` колонкой, а не module link
В order-lifecycle/bonus связь с заказом — забота workflow через link (сервис модуля заказ не знает).
В documents заказ нужен САМОМУ сервису: `issueDocument` группирует по `(order_id, type)` для
нумерации и версионности — это внутренняя логика домена. Поэтому храним заказ опазной ссылкой-колонкой
(без FK, без импорта модуля order — правило изоляции соблюдено). Выборка документов заказа для ЛК/админки
(подзадача 3) — прямым запросом `query.graph(entity:"document", filters:{order_id})`, link не нужен.
Link можно добавить позже, если понадобится graph-обход `order → documents` одним запросом.

## Сервис (подзадача 1 — готово)
- `getOrCreateSettings()` — singleton реквизитов.
- `nextDocumentNumber(type, now?)` — следующий номер из последовательности `<type>:<year>`
  (read-modify-write без блокировки; MVP-конкуренция низкая — документы формируются в workflow заказа).
- `issueDocument({order_id, type, snapshot, total_money?, total_bonus?, …})` — выпуск с версионностью:
  первая версия получает свежий номер; при наличии текущей версии по (order_id, type) — снимает с неё
  `is_latest`, новая версия = `version+1` с ТЕМ ЖЕ номером (переиздание — новая версия того же документа).
  `file_id` пуст (PDF рендерится позже).
- `attachRenderedFile({document_id, file_id, file_url})` — прикрепить отрендеренный PDF.

## Бизнес-правила (из ТЗ 4.10)
- Счёт на оплату — автоматически сразу после оформления заказа, покупателю (ЛК + email/push позже).
- Накладная — при отгрузке; при частичной отгрузке — на отгруженную часть.
- Внутренний АВР для юрлиц — информационный документ платформы (НЕ официальный).
- Официальные АВР/ЭСФ — бухгалтер вручную на kgd.gov.kz; платформа даёт экспорт исходных данных
  заказа (API/выгрузка) — вне периметра автоматизации MVP.
- Суммы «деньгами» и «бонусами» — раздельно (данные из `bonus`).
- Хранение: у обеих сторон, с версионностью и историей.

## Подзадачи
- [x] **1. Дизайн + модуль:** модели `Document`/`DocumentSetting`/`DocumentSequence`, сервис
  (нумерация, версионность, attach), миграция, тесты. Без workflows/API/рендера.
- [x] **2. Рендер + выпуск:** ГОТОВО 2026-07-20. Рендерер `workflows/utils/render-document-pdf.ts`
  (чистая функция `(снапшот)→Buffer`, pdfkit + встроенный **PT Sans** TTF из `assets/fonts/`, SIL OFL);
  workflow `issue-order-document` (шаги `build-order-document-snapshot` → `issue-order-document` →
  `render-and-attach-document` → `document.issued`); загрузка PDF — ядровый File Module. **Выпуск — в
  подписчиках, НЕ внутри place-order/ship-order** (документ вторичен, сбой рендера не откатывает заказ):
  `order-invoice.ts` на `order.placed` (счёт + internal_avr для заказов юрлиц по link company↔order),
  `order-waybill.ts` на `order_lifecycle.status_changed` (накладная: `in_delivery` для доставки, `delivered`
  для самовывоза/counter), `document-issued.ts` — заглушка уведомления. Идемпотентность — пропуск, если
  текущая версия документа типа уже есть. Детали и эмпирика шины — DECISIONS 2026-07-20.
  **Прод-долг:** `medusa build` не копирует ассеты (TTF) в `.medusa/server` — при прод-развёртывании
  доставить шрифты рядом с рантаймом. Частичная накладная на отгруженную часть — отложена (MVP: одна на заказ).
- [x] **3. Store/admin API:** ГОТОВО 2026-07-20. `GET /store/orders/:id/documents` (документы покупателя в ЛК:
  текущие версии, видимые покупателю, скачивание по `file_url`; чужой заказ 404) + `GET /admin/orders/:id/documents`
  (все типы/версии заказа) + `GET /admin/orders/:id/documents/export` (снапшоты текущих версий — экспорт исходных
  данных для 1С, JSON). Выборка — сервисом по `order_id` (link не нужен); сериализаторы `api/utils/serialize-document.ts`
  (покупателю без `file_id`/snapshot). OAS-фрагменты в `store|admin/orders/orders.oas.json`, контракт 104 пути/658 схем,
  Dart 32 клиента/120 запросов. Детали — DECISIONS 2026-07-20.
- [x] **4. Админ-UI:** ГОТОВО 2026-07-21. API реквизитов `GET/POST /admin/document-settings` (тонкие роуты +
  workflow `update-document-settings` с компенсацией, zod-валидатор; контракт/Dart НЕ трогаем — admin-конфиг только
  для веб-админки, прецедент bonus-config). Settings-страница `admin/routes/settings/document-requisites/` (+ drawer,
  идиома `settings/bonus-program`) + widget `admin/widgets/order-documents-card.tsx` (`order.details.after`: список
  документов заказа со скачиванием PDF по `file_url` + кнопка экспорта 1С через fetch+Blob). Типы — `admin/lib/documents.ts`.
  Детали — DECISIONS 2026-07-21. **Модуль `documents` закрыт (4/4).** Остаточный долг: прокликать UI headless-браузером
  (покрыт tsc+build+http, вживую не прокликан — мешал сон машины).

## Отложено (вне MVP)
- Официальные ЭСФ/АВР через госпорталы (только выгрузка данных).
- Бинарный PDF/A, электронная подпись документов.
- Мультипродавцовые реквизиты (сейчас singleton — один продавец).
