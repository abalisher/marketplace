# Модуль `catalog` — сегменты, модерация карточек, мульти-склад

**Статус:** реализованы модель `ProductCard` (модуль + link + миграция + тесты), workflows модерации
с subscriber'ом повторной модерации, store/admin API с OAS-фрагментами и админ-UI
(очередь модерации + widget карточки) ·
**Код:** `backend/src/modules/catalog/`, `backend/src/workflows/`, `backend/src/subscribers/product-updated.ts`,
`backend/src/api/store/products/`, `backend/src/api/admin/products/`,
`backend/src/admin/routes/product-moderation/`, `backend/src/admin/widgets/product-catalog-card.tsx`

## Назначение
Расширение каталога ядра Medusa под требования ТЗ: сегмент товара (эконом/комфорт/бизнес),
модерация карточек админом, сертификаты, ед. изм. Принцип — НЕ дублировать ядро:
всё, что ядро умеет, берём из ядра; кастом — только недостающие поля и переходы.

## Что закрывает ядро Medusa (не переизобретаем)
- **Иерархия «категория → подкатегория»** — `product_category` ядра (вложенные категории).
- **Карточка товара** — `product` (наименование, описание, фото `images`, характеристики
  `options`/`metadata`) + варианты (`sku` = код, `weight`/габариты — нужны логистике;
  фасовка — это варианты одного товара: «мешок 25 кг», «мешок 50 кг»).
- **Статусы модерации** — `product.status` ядра ровно повторяет флоу ТЗ:
  `draft` (черновик продавца) → `proposed` (на модерации) → `published` (одобрено) / `rejected` (отклонено).
  Store API отдаёт только `published` — скрытие неодобренных карточек от покупателя бесплатно.
- **Мульти-склад «город → склад → остаток»** — `stock_location` (город = `address.city`,
  верхний уровень иерархии; отдельная модель City не нужна) + inventory-модуль:
  `inventory_item` (на вариант) → `inventory_level` (остаток на складе) → `reservation` (резерв под заказ).
- **Остатки в реальном времени** — `inventory_level` в разрезе склада; агрегат по городу —
  сумма по складам с одинаковым `address.city`.

## Кастом: модель `ProductCard` (link 1:1 с product)
Недостающие ядру поля карточки (`backend/src/modules/catalog/models/product-card.ts`):
- `segment` — enum `economy | comfort | business` (обязателен, у каждого товара ровно один).
- `unit` — ед. изм. (`шт`, `мешок`, `м³`, `тонна`…) — текст, отображается на карточке.
- `certificates` — jsonb-массив `{ name, url }` (файлы в file-провайдере Medusa).
  Обязательны при отправке на модерацию (валидация в workflow, не в модели).
- `rejection_reason` — комментарий админа при отклонении (обязателен при reject, сбрасывается при approve).

Link: `backend/src/links/product-product-card.ts` (product ядра ↔ product_card, 1:1) —
FK на product в модели нет намеренно (правило изоляции модулей).

## Бизнес-правила (из ТЗ)
- Сегмент — у каждого товара, ровно один из трёх.
- Модерация: продавец создаёт карточку (`draft`) → отправляет на модерацию (`proposed`,
  сертификаты и сегмент обязательны) → админ одобряет (`published`) или отклоняет
  (`rejected` + обязательный комментарий).
- Изменение ключевых характеристик одобренной карточки → снова `proposed`.
  Реализация: subscriber на `product.updated` — цены и остатки этим событием не меняются
  (у них свои события price set / inventory), так что `product.updated` у `published`-товара ≈
  изменение карточки.
- До 5 складов на город: проверка count по `address.city` в middleware на
  `POST /admin/stock-locations` (ядро не ограничивает; своей модели склада не заводим).
  Реализовано — см. «Ограничение складов» ниже.
- Альтернативы при отсутствии товара (категория/сегмент/характеристики) — store-роут
  подбора, подзадача API.

## Workflows модерации (подзадача 2 — готово)
Код: `backend/src/workflows/` (шаги — в `steps/`), тесты — `integration-tests/http/catalog-workflows.spec.ts`.
- `create-product-card` — карточка модуля к существующему товару ядра + link 1:1
  (создание товара — ядро; вторая карточка на товар запрещена).
- `submit-product-for-moderation` — `draft|rejected` → `proposed`; валидация: карточка есть,
  сертификаты непусты (сегмент обязателен на уровне модели); сброс `rejection_reason`.
- `approve-product-card` — `proposed` → `published`, сброс `rejection_reason`.
- `reject-product-card` — `proposed` → `rejected`, комментарий обязателен (инвариант сервиса).
- `remoderate-product` — `published` → `proposed`; вызывается subscriber'ом.
- `update-product-card` — правка полей карточки (сегмент/ед.изм./сертификаты);
  у published-товара дополнительно переводит статус в `proposed` — правка нашей модели
  `product.updated` не эмитит, subscriber не сработает, поэтому переход явный в workflow.
- Subscriber `src/subscribers/product-updated.ts` — повторная модерация: правка published-товара
  с карточкой возвращает его в `proposed`.

Ключевое решение (см. DECISIONS 2026-07-14): статус меняется общим шагом `update-product-status`
через СЕРВИС модуля product (не через ядровый `updateProductsWorkflow`) — сервис не эмитит
`product.updated`, поэтому approve не зацикливается с subscriber'ом; событие эмитят только
правки через ядровые workflows (API продавца/админа).

## API (подзадача 3 — готово)
Код: `backend/src/api/store/products/` и `backend/src/api/admin/products/`,
тесты — `integration-tests/http/catalog-routes.spec.ts`, решения — DECISIONS (2026-07-14, API каталога).
- **Store, фильтр по сегменту** — параметр `?segment=` у ЯДРОВОГО `GET /store/products`
  (цены/каналы/пагинация ядра сохраняются). Middleware `filter-by-segment.ts` на
  wildcard-матчере `/store/products*` (wildcard регистрируются раньше статических ядровых
  валидаторов) вырезает `segment` до ядровой валидации и подменяет фильтром `id`
  (двухшагово: ids карточек по сегменту из модуля → пересечение с client-`id`;
  пусто → пустая страница сразу). Масштаб MVP ~1000 SKU это позволяет.
- **Store, остатки** — `GET /store/products/:id/availability`: вариант → города →
  склады (`город = stock_location.address.city`), `available = stocked − reserved`;
  неопубликованный товар → 404.
- **Store, альтернативы** — `GET /store/products/:id/alternatives?limit=1..20` (дефолт 5):
  published-товары той же категории и того же сегмента, исключая сам товар;
  товар без карточки → пустой список.
- **Admin, очередь модерации** — БЕЗ кастомного роута: ядровый
  `GET /admin/products?status[]=proposed&order=updated_at&q=...&fields=*product_card`
  (link отдаёт поля карточки, `q`/`order` — штатные).
- **Admin, действия** — `POST /admin/products/:id/moderation/{submit,approve,reject}`
  поверх workflows (reject — обязательный `reason`, zod в `admin/products/validators.ts`).
- **Admin, карточка (upsert)** — `POST /admin/products/:id/product-card` создаёт или
  обновляет карточку (роут выбирает workflow по наличию карточки; инварианты — в workflows).
  Правка карточки published-товара возвращает его в `proposed` (workflow
  `update-product-card`, см. ниже). В контракт admin-роуты не входят (спека — Store API).
- **Контракт** — фрагмент `store/products/products.oas.json`; для `segment` в ядровом пути
  используется `x-extendPaths` (расширение существующих операций в `generate-contract.mjs`).

## Админ-UI (подзадача 4 — готово)
- Очередь модерации — `backend/src/admin/routes/product-moderation/page.tsx`, идиомы
  `routes/companies` (копия DataTableFilter ядра, статус точкой, server-side `q`/`order`);
  чип Status предустановлен на `Proposed`; данные — ядровый
  `GET /admin/products?fields=*product_card`; клик по строке → ядровая страница товара.
- Widget `backend/src/admin/widgets/product-catalog-card.tsx` (зона `product.details.after`):
  сегмент/ед.изм./сертификаты/причина отклонения + «...»-меню (Create/Edit в Drawer,
  Submit/Approve/Reject); данные — своим запросом (`fields=id,status,*product_card`),
  prop `data` ядра link-полей не содержит. Общий код — `hooks/use-product-moderation.ts`,
  `components/{product-card-drawer,reject-product-card-prompt}.tsx`, `lib/catalog.ts`.
- Сид демо-товаров для ручной проверки: `npx medusa exec ./src/scripts/seed-demo-catalog.ts`
  (3 товара с карточками: draft / proposed / rejected; идемпотентен).

## Ограничение складов + сид региона KZ (подзадача 5 — готово)
Код: `backend/src/api/admin/stock-locations/limit-per-city.ts`, `backend/src/scripts/seed-kz.ts`,
тест — `integration-tests/http/stock-location-limit.spec.ts`, решение — DECISIONS (2026-07-14, склады+KZ).
- **Ограничение ≤5 складов/город** — middleware `limitStockLocationsPerCity` на `POST /admin/stock-locations`
  (статический матчер, встаёт раньше ядрового валидатора тела — читает сырой `req.body.address.city`).
  Считает существующие склады с тем же городом через `query.graph(stock_location, ["address.city"])`,
  сравнение регистронезависимое (trim + lowercase). ≥5 → `MedusaError.NOT_ALLOWED` (HTTP 400).
  Склады без города не ограничиваются. Лимит — константа `MAX_STOCK_LOCATIONS_PER_CITY = 5`.
- **Сид региона KZ** — `npx medusa exec ./src/scripts/seed-kz.ts` (идемпотентен по имени сущностей):
  добавляет валюту KZT в магазин (дефолт не трогает), регион `Kazakhstan` (kzt, страна kz,
  провайдер `pp_system_default`), 2 склада в Астане (`address.city = "Astana"`, привязаны к
  Default Sales Channel), категорию «Строительные материалы», 4 published-товара стройматериалов
  (эконом/комфорт/бизнес) с ценами в тенге и остатками по обоим складам. Товары проходят
  реальный флоу модерации (create card → submit → approve) до `published`.
  Fulfillment/доставку регион пока НЕ получает (оформление заказа — задача `placeOrder`).
- **Витрина** — `storefront/.env`: `NEXT_PUBLIC_DEFAULT_REGION=kz` (был `de`).

## Подзадачи (порядок реализации — бэклог в STATE.md)
1. [x] Дизайн + модуль `catalog` (модель, сервис, link, миграция, тесты).
2. [x] Workflows модерации + subscriber повторной модерации.
3. [x] Store/admin API + OAS-фрагменты + перегенерация контракта и Dart-клиента.
4. [x] Админ-UI: очередь модерации + widget полей карточки на странице товара.
5. [x] Ограничение ≤5 складов/город (middleware) + сид региона KZ (KZT, Астана, склады, демо-каталог).
