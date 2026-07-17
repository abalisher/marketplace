# Лог архитектурных решений (ADR-lite)

> Append-only. Формат: дата · решение · причина · отвергнутые альтернативы. Не редактировать старые записи —
> если решение пересмотрено, добавить новую запись со ссылкой на старую.

## 2026-07-10 — Mobile-first: все операционные роли в мобильных приложениях
Покупатель, продавец, кладовщик, водитель работают с телефона; веб — только заполнение товаров, модерация и аналитика (админка Medusa).
**Причина:** реальное поведение пользователей на рынке (уточнение владельца продукта поверх ТЗ).
**Отвергнуто:** адаптивный веб как основной интерфейс (вариант из ТЗ).

## 2026-07-10 — Объём: полный MVP (вариант Б из ТЗ), архитектура сразу под всё
**Причина:** решение владельца; ИИ-модуль и мобильные приложения — отдельные этапы, но модель данных и границы модулей закладываются сразу.

## 2026-07-10 — Мобильные приложения: Flutter (кастом), 3 приложения из одной кодовой базы
`buyer` / `partner` (продавец+склад, экраны по ролям) / `driver`. Общий код — в пакетах Pub Workspace (`core`, `ui_kit`, `api_client`).
**Причина:** один Dart-код на все роли; зрелые GPS/камера/push; готовых open-source B2B-маркетплейс приложений нужного качества нет.
**Отвергнуто:** React Native/Expo (проиграл по предпочтению владельца и цельности с выбором ниже — не критично), нативная разработка (дорого ×2).

## 2026-07-10 — Бэкенд: Medusa v2 (TypeScript), кастомные домены как модули Medusa
**Причина:** ~50% системы — нестандартный домен (скоринг, отсрочка, бонусы, логистика с GPS, документы РК, Kaspi, 1С);
у Medusa кастомные модули — первоклассные граждане в том же репо; готовые: каталог, корзина, заказы, мульти-складской inventory,
промо, расширяемая админка (закрывает весь веб). Один язык всего серверного кода.
**Отвергнуто:** Saleor (Python/Django ядро + кастом только через внешние apps/webhooks → зоопарк сервисов, фрагментация контекста,
кастомные экраны админки выглядят «пришитыми» через iframe); самописный бэкенд с нуля (30–40% лишней работы).

## 2026-07-10 — Паритет платформ: веб дублирует функции мобилки (уточнение владельца)
Покупатель: `storefront/` на Next.js (официальный Medusa Starter Storefront как база — не пишем витрину с нуля).
Продавец/склад в вебе: расширенные экраны админки Medusa. Водитель — только мобилка.
**Причина:** каждый пользователь работает на удобной ему платформе. Дублирование дёшево, т.к. вся логика — в workflows
бэкенда, клиенты тонкие (правило: фича = workflow + экран mobile + экран web).
**Заменяет:** ранний вариант «веб — только админка» (решение «Mobile-first» выше — уточнено, не отменено: мобилки остаются главным каналом).

## 2026-07-10 — Инфраструктура: Docker Compose на VPS в Казахстане; PostgreSQL 16 + Redis 7
**Причина:** закон РК о персональных данных (локализация), дёшево, достаточно для нагрузки MVP (10–100 заказов/день, рост ×10).
**Отвергнуто:** AWS/GCP (дороже, вопрос локализации данных), PaaS (миграция при росте).

## 2026-07-10 — Мост TS ↔ Dart: только через OpenAPI-контракт (`contracts/openapi.json`)
Dart-клиент (`mobile/packages/api_client`) кодогенерится из спеки; агенты одной половины не читают код другой.
**Причина:** экономия контекста AI-сессий + исключение рассинхрона типов между бэкендом и мобилками.

## 2026-07-10 — ИИ-модуль (`estimator`): внешние API вместо своего ML
Распознавание смет/чертежей — Claude API; голосовой ввод ru/kz — внешний STT. Нормативная база расхода — администрируемый справочник в БД.
**Причина:** на MVP обучение своих моделей не окупается; при необходимости в Фазе 2 добавляется отдельный Python-сервис, не ломая архитектуру.

## 2026-07-13 — `backend/` — самостоятельное Medusa-приложение, без turborepo-обёртки
Актуальный `create-medusa-app` генерирует turborepo (`apps/backend`, корневой `turbo.json`, `@dtc/backend`). Мы вынимаем из обёртки только `apps/backend/*` в наш `backend/` (переименовали пакет в `@marketplace/backend`), turbo-обёртку отбрасываем.
**Причина:** монорепо уже структурировано по-своему (`backend/`, `storefront/`, `mobile/` верхнего уровня, витрина и мобилки — не JS-turbo-воркспейсы); лишний слой turbo только мешал бы и дублировал управление.
**Следствие:** при апгрейде стартера повторять извлечение вручную (записано в STATE.md → Известные проблемы). Бэкенд в dev запускается на хосте (`npm run dev`), Docker держит только инфраструктуру (postgres/redis) — Dockerfile бэкенда добавим перед деплоем на VPS.

## 2026-07-13 — Контракт API: официальная спека Medusa v2 Store API + мердж локальных OAS-фрагментов
`contracts/openapi.json` генерирует `backend/scripts/generate-contract.mjs` (`npm run contract:generate`): скачивает официальную Store-спеку с docs.medusajs.com (66 путей, 588 схем), подставляет `servers: localhost:9000` и мерджит фрагменты кастомных роутов `backend/src/api/**/*.oas.json` (ключи `paths`/`components`; конфликт имён = ошибка). Каждый будущий кастомный роут обязан класть рядом свой `*.oas.json`.
**Причина:** в Medusa v2 нет автогенерации OAS из кода роутов (`medusa-oas-cli` — только v1); официальная спека ядра + дисциплина фрагментов даёт рабочий контракт без ручной поддержки тысяч строк.
**Отвергнуто:** `@medusajs/medusa-oas-cli` (несовместим с v2); писать спеку целиком руками (не масштабируется); генерация из zod-схем роутов (нет кастомных роутов — преждевременно, можно пересмотреть в Фазе 2).
**Риск:** официальная спека может уехать от установленной версии ядра (2.17.2) — при апгрейде Medusa перегенерировать контракт и клиент.

## 2026-07-13 — Dart-кодоген: swagger_parser (pure Dart) + retrofit/dio + json_serializable
`mobile/packages/api_client`: `dart run swagger_parser` (конфиг `swagger_parser.yaml`) → `dart run build_runner build`. Смоук-тест пакета компилирует весь экспортированный код — это и есть верификация конвейера. Сгенерированное исключено из линтера (`analysis_options.yaml`), формат — `dart format` после кодогена.
**Причина:** pure-Dart цепочка без Java/Docker; сырую спеку Medusa кодоген не переваривает, поэтому `generate-contract.mjs` нормализует её (операторные $-фильтры → Map, nullable у опциональных композиций, чистка default с неверным типом — в спеке Medusa есть баг `deleted: boolean, default: "variant"`, object-параметры query → Map, requestBody всегда required).
**Отвергнуто:** openapi-generator-cli (нужна Java, на машине нет; docker-образ — лишняя зависимость конвейера); режим freezed у swagger_parser 1.44 (генерит классы в стиле freezed 2, несовместим с freezed 3; freezed 2 конфликтует с retrofit_generator 10 по source_gen).

## 2026-07-13 — Модуль `company`: форма моделей и границы логики
Три модели по плану `docs/modules/company.md`: `Company` (bin уникален среди неудалённых, статус модерации + `rejection_reason`, документы — jsonb-массив `{name,url}`), `Employee` (`role: admin|member`, без FK на customer — привязка через module link), `SpendLimit` — отдельная модель (не поле на Employee), у сотрудника может быть несколько лимитов с разными периодами (`order|day|week|month`), суммы в `bigNumber` + `currency_code` (дефолт `kzt`).
**Причина:** отдельный SpendLimit даёт «сумма/период» из ТЗ без миграций при добавлении новых периодов; несколько лимитов одновременно (дневной + месячный) — реалистичный кейс. Переходы модерации (approve/reject с обязательным комментарием) — методы сервиса модуля (инвариант одной модели); всё сквозное (регистрация компании с customer, проверка лимита при заказе) — только в workflows.
**Отвергнуто:** `spending_limit` полем на Employee (как в b2b-starter Medusa) — не выражает период; хранение `customer_id` полем в Employee — нарушает правило «связи между модулями только через links».

## 2026-07-13 — Интеграционные тесты модулей: `moduleIntegrationTestRunner` + `.env.test`
Тесты модуля живут в `src/modules/<domain>/__tests__/` и гоняются `npm run test:integration:modules` при поднятом docker-postgres. `@medusajs/test-utils` создаёт временную БД: креды берёт из `backend/.env.test` (`DB_USERNAME`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT`, значения = дефолты docker-compose; файл в репо — секретов нет, это локальные dev-креды). Понадобился явный devDep `pg-god` (peer у test-utils, npm его сам не ставит).

## 2026-07-13 — Links модуля `company`: employee ↔ customer (1:1), company ↔ orders (1:N)
Два `defineLink` в `backend/src/links/`: сотрудник — это customer ядра, сгруппированный в компанию (1:1, один покупатель состоит максимум в одной компании); заказы оформляются от имени компании (1:N через `isList: true` на стороне order). Синхронизация link-таблиц — `npx medusa db:migrate` (создаёт `company_employee_customer_customer`, `company_company_order_order`).
**Причина:** правило репо «модули не импортируют друг друга»; link-таблицы позволяют `query.graph` ходить в обе стороны (`customer.employee.company`) без FK в моделях.
**Отвергнуто:** link company ↔ customer напрямую — теряется роль/лимиты сотрудника; membership выражается через employee.

## 2026-07-13 — Workflows `company`: по одному на сценарий, шаги в `src/workflows/steps/`
Семь workflows: `create-company` (регистрация: pending-компания + сотрудник-админ из customer + link), `approve-company`/`reject-company` (модерация — тонкие обёртки над шагами с компенсацией «вернуть прежний статус»), `create-employee`/`delete-employee` (принять/уволить сотрудника; увольнение снимает links и мягко удаляет его лимиты), `create-spend-limit`/`delete-spend-limit`. Валидации сквозных инвариантов — в шагах: формат БИН (12 цифр) в `create-company`, «customer ещё не сотрудник» через `query.graph` в `validate-customer-not-employee`, `amount > 0` в `create-spend-limit`. Линковка — ядровые `createRemoteLinkStep`/`removeRemoteLinkStep` (своя компенсация из коробки).
**Причина:** конвенция бэкенда «роуты тонкие, сквозная логика в workflows»; каждый шаг с компенсацией — регистрация атомарна (упавшая линковка откатывает employee и company).
**Нюанс тестирования (важно):** `workflow(container).run()` по умолчанию НЕ бросает исключение (возвращает `errors`); с `throwOnError: true` бросает, но ошибка шага сериализована в plain object (`__isMedusaError: true`, не `instanceof Error`) — jest-матчер `expect(...).rejects.toThrow()` её не распознаёт и молча проваливается с «did not throw». В тестах отклонение проверяем try/catch-хелпером по `message` (см. `integration-tests/http/company-workflows.spec.ts`).

## 2026-07-13 — API `company`: тонкие роуты, контракт — только store-часть
Store-роуты `/store/companies/*` (регистрация, профиль `me`, сотрудники, лимиты) и admin-роуты `/admin/companies/*` (очередь модерации, approve/reject). Роут = zod-валидация (`validators.ts` + `validateAndTransformBody`/`Query` в `src/api/middlewares.ts`) → workflow с `throwOnError: true`: сериализованная ошибка шага сохраняет `type`, и errorHandler ядра корректно мапит её в HTTP-статус (NOT_FOUND→404, INVALID_DATA/NOT_ALLOWED→400) — обёртки не нужны. Проверка прав — хелперы на `query.graph` (`requireCompanyAdmin`...); ресурсы чужой компании отдают 404 (не 403), чтобы не раскрывать существование чужих id. Zod импортируется из `@medusajs/framework/zod` (правило линта + гарантия совместимости версии с валидатором ядра).
**Контракт:** в `contracts/openapi.json` мерджится только store-фрагмент (`store/companies/companies.oas.json`). Admin-роуты в контракт не входят: контракт существует исключительно для Dart-кодогена мобильных приложений, а модерация живёт в веб-админке Medusa (admin-UI берёт данные через JS SDK, не через контракт).
**Отвергнуто:** свой формат ошибок в роутах (дублировал бы errorHandler ядра); `validateAndTransformQuery` c `createFindParams` ядра (тянет чужую zod-инстанцию, наши фильтры проще).
**Нюанс тестов:** первый admin-user создаётся только через CLI/invite — HTTP-флоу `register → POST /admin/users` отдаёт 401; в интеграционных тестах admin создаётся через контейнер (`authService.register("emailpass")` + `createUsers` + `app_metadata.user_id`), логин — по HTTP (см. `company-routes.spec.ts`).

## 2026-07-13 — Админ-UI модерации: UI-роут на DataTable, данные через @medusajs/js-sdk
`backend/src/admin/routes/companies/` — список (блок DataTable из `@medusajs/ui`: пагинация, radio-фильтр по статусу) и карточка `[id]` (approve через `usePrompt`, reject через `Prompt` с обязательным Textarea-комментарием). Данные — `@tanstack/react-query` + `@medusajs/js-sdk` (`auth: session`, `baseUrl: "/"` — админку всегда отдаёт сам бэкенд); `@medusajs/js-sdk` и `@medusajs/icons` переведены из транзитивных зависимостей в прямые. В `src/admin/**` нельзя использовать `import.meta`: эти файлы проходят и через CJS-компиляцию `medusa build` (корневой tsconfig включает `src/admin`), где `import.meta` — ошибка компилятора.
**Язык:** тексты кастомных экранов — на русском (пользователь админки — оператор маркетплейса); ядро дашборда остаётся на английском, полная локализация дашборда — отдельная задача, если понадобится.
**Отвергнуто:** plain `Table` с ручной пагинацией и фильтрами (DataTable — штатный блок ровно для таких списков); импорт статусов из модели в UI (код модуля нельзя тянуть в браузерный бандл — статусы продублированы в `src/admin/lib/company.ts`).

## 2026-07-13 — Админ-UI: контролы кастомных экранов следуют идиомам ядра дашборда (уточнение владельца)
Пересматривает часть записи «Админ-UI модерации» выше. FilterBar/FilterMenu блока DataTable (иконка-воронка в отдельной полосе) и крупные цветные кнопки approve/reject в шапке карточки визуально выбивались из стандартных экранов дашборда (Products и т.п.) — владелец счёл, что это портит восприятие. Теперь: фильтр списка — secondary-кнопка «Статус: …» с radio-`DropdownMenu` в тулбаре; действия карточки — в «...»-меню (`IconButton` + `DropdownMenu` с иконками), как Edit/Delete у ядра.
**Правило на будущее:** кастомные админ-экраны копируют идиомы стандартных страниц дашборда (действия — в «...»-меню, контролы тулбара — secondary-кнопки), а не демонстрируют возможности блоков `@medusajs/ui`. Нюанс: ядро дашборда не шипит русскую локаль — кастомные экраны остаются русскими (решение выше), полная локализация ядра — отдельная задача.

## 2026-07-13 — Админ-UI: «никакой разницы» со стандартными экранами + английский язык (уточнение владельца)
Дополняет и частично пересматривает две записи выше — владелец потребовал полной неотличимости от списков ядра (Products/Inventory). Сделано в `routes/companies`: блок фильтров — построчная копия ВНУТРЕННЕГО `DataTableFilter` дашборда (`@medusajs/dashboard/dist`, он не экспортируется — разметка, классы и флоу перенесены дословно): порядок «чипы → Add filter → Clear all», labeled-кнопка «Add filter» (Popover со списком фильтров; скрывается, когда свободных фильтров не осталось), чип `[Status | is | … | ×]` открывается сразу после добавления и исчезает, если закрыт без значения, «Clear all» виден при активном фильтре (у публичного `DataTable.FilterMenu/FilterBar` триггер — только иконка-воронка, labeled-варианта и такого флоу нет); server-side поиск и сортировка (`DataTable.Search`/`SortingMenu` → новые параметры `q`/`order` в `GET /admin/companies`); статус в списке — точкой (идиома StatusCell ядра; StatusBadge остаётся только в шапке карточки, как у ядра); действия в строках — `columnHelper.action` («...»-меню). Общий код вынесен в `hooks/use-company-moderation.ts` и `components/reject-company-prompt.tsx`.
**Язык (пересмотр пункта о русских текстах):** тексты кастомных экранов — на английском, как всё ядро (смешение языков в одном дашборде хуже; ru-локали у ядра нет). Локализация всего дашборда (`src/admin/i18n` + перевод наших экранов) — отдельная задача на потом.
**API-нюанс:** free-text `q` по searchable-полям поддерживают только сгенерированные list-методы модуля — list-роут переведён с `query.graph` на `service.listAndCountCompanies` (детали-роуту `query.graph` остаётся — ему нужны links).
**Ограничение (не баг):** режим customize дашборда (Personal/Default, секции `core:*`) работает только на страницах ядра — кастомные UI-роуты Admin SDK в него не включаются.

## 2026-07-14 — Каталог: ядро Medusa + тонкий модуль `catalog` (ProductCard через link)
Иерархию категорий, карточку товара с вариантами, статусы модерации (`product.status`: `draft→proposed→published/rejected` — ровно флоу ТЗ) и мульти-склад «город → склад → остаток» (`stock_location.address.city` + inventory-модуль) закрывает ядро. Кастом — модуль `catalog` с одной моделью `ProductCard` (link 1:1 с product): `segment` (enum `economy|comfort|business`), `unit`, `certificates` (jsonb `{name,url}`), `rejection_reason`. Переходы модерации трогают product ядра → живут в workflows, не в сервисе модуля. Полный дизайн и план подзадач — `docs/modules/catalog.md`.
**Причина:** правило «не дублируй ядро»: своя статусная модель/склады/категории означали бы параллельный каталог и потерю штатной витрины и админки. Segment — поле модуля, а не product tag: enum гарантирует ровно одно значение из трёх, tags этого не выражают.
**Отвергнуто:** свои модели Category/Warehouse/Stock (дублируют ядро); segment/сертификаты в `product.metadata` (нет типизации и enum-гарантии, невозможны инварианты модуля); отдельная модель City (город — атрибут адреса склада, `до 5 складов на город` проверяется count'ом по `address.city`).
**Риск:** фильтр каталога по сегменту — двухшаговый (ids из модуля → фильтр products); на масштабе MVP (~1000 SKU) дёшево, при росте ×10 пересмотреть (материализация segment в tag или прямой SQL по link-таблице).

## 2026-07-14 — Модерация карточек: статус через сервис модуля product (без события), повторная модерация — subscriber на `product.updated`
Переходы `draft|rejected→proposed→published/rejected` делает общий шаг `update-product-status` (компенсация — возврат прежнего статуса), который меняет `product.status` НАПРЯМУЮ через сервис модуля product, а не через ядровый `updateProductsWorkflow`. Повторная модерация — subscriber `src/subscribers/product-updated.ts`: на `product.updated` проверяет «товар published и имеет карточку каталога» и возвращает его в `proposed` (workflow `remoderate-product`).
**Причина:** `product.updated` эмитят только ядровые workflows (правки продавца/админа через API); сервис модуля событий не эмитит — поэтому approve не будит subscriber и не откатывает сам себя в `proposed` (loop). Проверено интеграционным тестом: после approve товар остаётся `published`; после правки через `updateProductsWorkflow` — уходит в `proposed`. Цены/остатки повторную модерацию не триггерят: у них свои события, `product.updated` они не эмитят.
**Отвергнуто:** ядровый `updateProductsWorkflow` в шагах модерации (эмитит `product.updated` → зацикливание с subscriber'ом); фильтрация «своих» обновлений по таймстампам/флагам в карточке (хрупкие эвристики, не нужны при событийной асимметрии выше).
**Нюанс типов:** поля links в `query.graph` (например, `product.product_card`) появляются в типах только после генерации `.medusa/types` при старте dev-сервера — если tsc падает с «Property 'product_card' does not exist», поднять `npm run dev` до `/health`→200 и погасить.

## 2026-07-14 — API каталога: кастомный параметр ядрового роута через wildcard-middleware; очередь модерации — ядровый `/admin/products`
Фильтр `?segment=` добавлен к ЯДРОВОМУ `GET /store/products` (витрина сохраняет цены/каналы/пагинацию ядра): middleware `filterProductsBySegment` вырезает `segment` из сырого `req.query` ДО ядрового валидатора и подменяет его фильтром `id` (двухшагово: ids карточек сегмента из модуля catalog → пересечение с client-фильтром `id`; пустой список → пустая страница отдаётся сразу, ядро пустой `id` игнорирует). Ключ к порядку: матчер обязан быть wildcard (`/store/products*`) — `RoutesSorter` регистрирует middleware в порядке `global → wildcard → regex → static → params`, и wildcard встаёт раньше статических ядровых валидаторов; внутри middleware — guard по точному пути.
**Отвергнуто:** переопределение ядрового валидатора повторным `validateAndTransformQuery` на том же матчере — middleware НЕ заменяются, а конкатенируются (ядро первое: строгая схема режет незнакомый `segment` раньше нашей); мердж ядровой zod-схемы с `segment` — `StoreGetProductsParams` теперь `ZodPipe` (strict + transform), `.merge` недоступен, а пересборка из внутренних экспортов ядра хрупка к апгрейдам; отдельный роут `/store/catalog/products` — дублировал бы прайсинг/каналы/фильтры ядра.
**Очередь модерации карточек** — БЕЗ кастомного admin-роута: ядровый `GET /admin/products?status[]=proposed&order=updated_at&q=...&fields=*product_card` умеет статус/поиск/сортировку и отдаёт поля карточки через link (проверено интеграционным тестом). Кастом — только действия: `POST /admin/products/:id/moderation/{submit,approve,reject}` поверх готовых workflows. Store-остатки/альтернативы — свои роуты `GET /store/products/:id/{availability,alternatives}` (query.graph; неопубликованный товар → 404, город = `stock_location.address.city`).
**Контракт:** в `generate-contract.mjs` добавлен ключ фрагментов `x-extendPaths` — точечное добавление parameters к УЖЕ существующим операциям базовой спеки (конфликт целых путей остаётся ошибкой); так `segment` попал в спеку ядрового `/store/products`.

## 2026-07-14 — Админ-UI каталога: очередь + widget на ядровой странице товара; upsert-роут карточки; ре-модерация при правке карточки
Очередь — кастомный UI-роут `routes/product-moderation` по идиомам `routes/companies` (копия DataTableFilter-флоу ядра, статус точкой, server-side `q`/`order` — всё штатное у ядрового `GET /admin/products?fields=*product_card`); чип Status предустановлен на `Proposed` — страница открывается сразу очередью, фильтр снимается. Строка ведёт на ЯДРОВУЮ страницу товара: полями карточки (сегмент/ед.изм./сертификаты/причина отклонения) и действиями (create/edit в Drawer, submit/approve/reject в «...»-меню секции) управляет widget в зоне `product.details.after` со СВОИМ запросом — prop `data` виджета не содержит link-полей и не обновляется после наших мутаций. Правка карточки — один upsert-роут `POST /admin/products/:id/product-card`: роут диспетчеризует create/update по наличию карточки (это выбор workflow, не бизнес-логика), инварианты остаются в workflows (`create-product-card` — «дубль запрещён», новый `update-product-card` — «карточка есть»).
**Ре-модерация при правке карточки:** правка НАШЕЙ модели не эмитит `product.updated` (subscriber повторной модерации не сработает), поэтому workflow `update-product-card` сам переводит published-товар в `proposed` (`when(status === published)`), прочие статусы не трогает. Требование ТЗ «изменение ключевых характеристик одобренной карточки → снова модерация» закрыто для обоих путей правки: ядровые поля товара — subscriber, поля карточки — workflow. Проверено интеграционными тестами и вживую (правка published-карточки в UI вернула товар в Proposed; approve не зациклился).
**Отвергнуто:** отдельная страница карточки (поля должны жить на странице товара ядра — требование виджета из дизайна); пара роутов create/update (виджету пришлось бы выбирать эндпоинт; upsert проще и совместим с идиомой POST-обновлений ядра); кастомный GET для виджета (ядровый `GET /admin/products/:id?fields=id,status,*product_card` уже отдаёт карточку).
**Нюансы:** инвалидация react-query — корневые ключи `["catalog-moderation"]` (наши) и `["products"]` (ядровые запросы страницы товара; QueryClient общий с дашбордом, статус-бейдж ядра обновляется сам); admin-роуты каталога в контракт НЕ включаются (решение как для companies: спека — Store API мобильных клиентов); массив в query через js-sdk — литеральный ключ `"status[]"` (не зависит от arrayFormat сериализатора); сид демо-товаров с карточками во всех статусах — `npx medusa exec ./src/scripts/seed-demo-catalog.ts` (идемпотентен).

## 2026-07-14 — Ограничение ≤5 складов/город (middleware) + сид региона KZ
**Лимит складов** — middleware `limitStockLocationsPerCity` на `POST /admin/stock-locations` (статический матчер `defineMiddlewares` встаёт раньше ядрового валидатора тела → читает сырой `req.body.address.city`). Считает склады с тем же городом через `query.graph(stock_location, ["address.city"])`, сравнение регистронезависимое (trim+lowercase); ≥5 → `MedusaError.NOT_ALLOWED` (HTTP 400 в этой версии). Склады без города не ограничиваются. Своей модели склада/города НЕ заводим — город остаётся атрибутом `stock_location.address.city` (как решено при дизайне каталога 2026-07-14). Лимит — константа `MAX_STOCK_LOCATIONS_PER_CITY` (импортируется и в тест).
**Отвергнуто:** проверка в кастомном workflow-обёртке над созданием склада (роут ядровый, не наш — обёртки нет; middleware — штатная точка расширения ядрового роута); хранить счётчик складов в отдельной таблице City (город — атрибут адреса, отдельная модель избыточна).
**Сид KZ** — отдельный скрипт `seed-kz.ts` (published-каталог с ценами KZT и остатками), намеренно ОТДЕЛЬНЫЙ от `seed-demo-catalog.ts` (тот сеет товары в статусах draft/proposed/rejected для проверки очереди модерации — другое назначение). Товары выводятся в `published` через РЕАЛЬНЫЙ флоу модерации (create card → submit → approve), а не установкой статуса напрямую — сид заодно проверяет флоу. Регион `Kazakhstan` (kzt, страна kz, `pp_system_default`), 2 склада в Астане (linked к Default Sales Channel), 4 товара по сегментам с остатками на обоих складах. Идемпотентность — по имени каждой сущности.
**Нюанс:** `store.supported_currencies` — relation, `listStores()` её НЕ отдаёт → при `updateStoresWorkflow` терялся `is_default` и падало «There should be a default currency set». Читать через `query.graph("store", ["supported_currencies.currency_code","supported_currencies.is_default"])` и передавать полный список обратно. Дефолтную валюту магазина не меняем — валюту витрины задаёт регион.
**Осознанно отложено:** fulfillment set / service zone / shipping options для региона KZ — оформление заказа (`placeOrder`) ещё не реализовано; сид закрывает отображение каталога, цены и остатки. Витрина переключена на регион KZ (`storefront/.env`: `NEXT_PUBLIC_DEFAULT_REGION=kz`). Старые товары стартера (apparel) в регионе KZ цены не имеют — они не часть KZ-каталога, отобразятся без цены; при желании чистятся отдельно.

## 2026-07-14 — Заказ: кастомная статусная модель `order-lifecycle` поверх ядра
**Зачем кастом:** ядро Medusa даёт корзину→заказ+резерв (`completeCartWorkflow`), fulfillment/shipment/deliver/complete/cancel и три статуса order (`status`/`fulfillment_status`/`payment_status`). Но жизненный цикл ТЗ (`Новый → Подтверждён → В сборке → Частично/Полностью собран → В доставке → Доставлен → Закрыт` + Отменён/Возврат) ядро покрывает лишь частично: этапов **«Подтверждён»** и **«В сборке»** в ядре нет. Значит нужен свой статус как **source of truth** для клиентов/уведомлений; где у ядра есть операция (сборка/отгрузка/доставка/закрытие/отмена) — переход синхронно вызывает ядровый workflow. Сопоставление статусов и стейт-машина — `docs/modules/order.md`.
**Имя модуля/сущности:** модуль `order-lifecycle` (ключ `order_lifecycle`), НЕ `order` — ключ `order` занят ядровым модулем заказов. Сущность — `OrderLifecycle`, НЕ `OrderStatus`: Medusa выводит GraphQL-тип из имени сущности (`order_status → OrderStatus`), а тип `OrderStatus` уже определён ядровым enum модуля order — совпадение ломает `db:generate` («Cannot extend type OrderStatus because it is not defined»). Проверено эмпирически (первый вариант `OrderStatus` упал именно так).
**Модели:** `OrderLifecycle` (1:1 link к order ядра, `status` enum из 10 статусов ТЗ default `new`, `previous_status`, `note`) + `OrderLifecycleEvent` (лог переходов бессрочно — ТЗ: статусы логируются; from/to/actor_type buyer|seller|admin|system/actor_id/reason). Значения enum вынесены в `models/statuses.ts` — обе модели их импортируют, а держать в одной из моделей нельзя (циклическая инициализация значений между файлами моделей при живущих там же связях).
**Инвариант vs метод сервиса:** проверка перехода — чистая функция `assertOrderStatusTransition(from, to)` (тестируется без БД, переиспользуется в шагах), т.к. правило линта Medusa требует, чтобы публичные методы сервиса были async; применение перехода (проверка+лог+обновление статуса) — async-метод `recordTransition`. Вызов ядровых workflow — в `src/workflows/` (правило изоляции), не в сервисе.
**Отвергнуто:** деривация статуса ТЗ из ядровых `fulfillment_status`/`payment_status` (этапы «Подтверждён»/«В сборке» в них не выразить); имя сущности `OrderStatus`/`OrderState` (клэш GraphQL-типа с ядром).

## 2026-07-14 — Заказ, подзадача 2: `placeOrder` + переходы жизненного цикла (обёртки над ядром)
**Сквозное оформление** — workflow `place-order` (id `place-order`): `completeCartWorkflow.runAsStep` (ядро создаёт order + резервирует остатки) → шаг `create-order-lifecycle` (`OrderLifecycle=new`, компенсация — delete) → `createRemoteLinkStep` link 1:1 order↔lifecycle и (если покупатель — сотрудник компании, резолвится `resolve-order-company`) link order↔company. Пустой массив линков — no-op, поэтому company-link опционален без ветвления в самом createRemoteLink.
**Переходы** — общий шаг `record-status-transition` (находит lifecycle по order через link, применяет `service.recordTransition`, компенсация — восстановление прежнего статуса + удаление записи лога; поэтому `recordTransition` теперь возвращает `{lifecycle, event}` — id события нужен для отката) + хелпер `apply-order-transition` (шаг + `emitEventStep`). Сценарные workflow: `confirm-order`/`start-order-assembly` (чистый статус), `complete-order-assembly` (`createOrderFulfillmentWorkflow` → assembled/partially_assembled), `ship-order` (`createOrderShipmentWorkflow` → in_delivery), `deliver-order` (`markOrderFulfillmentAsDeliveredWorkflow` → delivered), `close-order` (`completeOrderWorkflow` → closed), `cancel-order` (`cancelOrderWorkflow` → canceled).
**Событие — одно кастомное `order_lifecycle.status_changed`** (namespace `order_lifecycle.*`), НЕ дизайновые `order.placed/order.status_changed/order.closed`. Причина: ядро УЖЕ эмитит `order.placed` (в completeCart), `order.completed` (complete), `order.canceled` (cancel) — свои `order.*` создали бы дубли/коллизии. «Заказ размещён» покрывает ядровый `order.placed`; на закрытие/отмену бонус/скоринг подпишутся на наш `status_changed` с `to=closed/canceled`. Один шаг → одно событие с `from/to/actor_type`; subscriber `order-status-changed` — заглушка уведомления (notification-провайдера нет). `emitEventStep` доставляет только после успеха workflow (на компенсации не шлётся).
**id workflow `cancel-order-lifecycle`, НЕ `cancel-order`** — ядровый `cancelOrderWorkflowId` уже `cancel-order`, совпадение id ломает реестр workflow'ов («already exists»). Остальные наши id (place-order/confirm-order/…/close-order) с ядром не пересекаются (проверено).
**Статус сборки считаем сами, НЕ по ядровому `fulfillment_status`:** вычисляемое `order.fulfillment_status` ни `retrieveOrder` (даже с relations), ни `query.graph` надёжно не отдают (undefined). Шаг `determine-assembly-status` сравнивает суммарно заказанное (сервис order — там доступно `quantity` позиций) против суммарно во fulfillment'ах (`query.graph` по link `fulfillments.items.quantity`, исключая `canceled_at`): всё → assembled, часть → partially_assembled.
**Нюанс query.graph:** вычисляемые/BigNumber-поля ядра НЕ возвращаются (order line item `quantity`, order `fulfillment_status` пришли пустыми) — их читаем через сервис модуля order (`retrieveOrder`). Link-поля (`order.order_lifecycle.*`, `order.customer.employee.company.id`, `order.fulfillments.*`) через query.graph работают. Касты строк query.graph к формам с link-полями требуют `as unknown as` (тип `Order` их не содержит — прямой каст tsc отвергает).
**Отвергнуто:** переэмит `order.placed` в place-order (дубль ядрового); деривация статуса сборки из `fulfillment_status` (ненадёжно доступен); хранение уведомлений в этой подзадаче (notification-провайдера нет — только событие + заглушка).
**Тест-фикстура (что понадобится региону KZ для реальной отгрузки):** сквозной тест строит полную инфраструктуру доставки — регион с `pp_system_default`, канал продаж, склад, `createFulfillmentSets`(shipping)+service zone, link склад↔fulfillment_set И склад↔fulfillment_provider (`manual_manual`, иначе createShippingOptions отклоняет провайдер), shipping option (flat, provider manual), link product↔shipping_profile (иначе completeCart: «items require shipping profiles»), payment collection + session (`pp_system_default`, авто-авторизация в completeCart). Это и есть отложенный при сиде KZ fulfillment-набор (DECISIONS 2026-07-14, склады+KZ) — при реализации API/сида доставки KZ повторить в `seed-kz.ts`.

## 2026-07-15 — Заказ, подзадача 3: store/admin API (тонкие роуты поверх workflow)
**Не переопределяем ядровые роуты заказа.** Ядро уже отдаёт `GET /store/orders[/:id]` (список/детали заказов покупателя), `GET /admin/orders[/:id]` (список/детали дашборда) и операции `POST /admin/orders/:id/{cancel,complete,fulfillments,...}`. Кастом добавляет ТОЛЬКО то, чего в ядре нет, не перекрывая эти пути:
- **Оформление** — `POST /store/orders` `{cart_id}` → `placeOrderWorkflow` (у ядра POST на этом пути нет; завершение корзины в ядре — через `POST /store/carts/:id/complete`, но оно НЕ заводит наш жизненный цикл, потому нужен свой роут).
- **Свой статус покупателя** — `GET /store/orders/:id/lifecycle` (статус ТЗ + лог переходов; подпуть, коллизии нет). Список/детали заказа покупатель по-прежнему берёт у ядра. Владение — `requireOwnOrder` (order.customer_id === auth.actor_id, иначе 404, чужой заказ не раскрываем).
- **Отмена покупателем** — `POST /store/orders/:id/cancel` (стейт-машина разрешает до отгрузки; ядро на store заказ не отменяет).
- **Очередь админа** — отдельный ресурс `GET /admin/order-lifecycles` (фильтр по нашему статусу, сортировка FIFO, пагинация; данные через `query.graph(order_lifecycle, [..., "order.display_id", "order.email", "order.created_at"])`). НЕ подпуть `/admin/orders/*`: статический сегмент под `/admin/orders` конфликтует с ядровым `/admin/orders/:id` (тот же класс неоднозначности статик-vs-`:id`, что и wildcard-порядок в каталоге), а перекрывать ядровый `GET /admin/orders` нельзя — он обслуживает список заказов дашборда.
- **Переходы админа** — под `POST /admin/orders/:id/lifecycle/{confirm,start-assembly,complete-assembly,ship,deliver,close,cancel}` + чтение `GET /admin/orders/:id/lifecycle`. Namespace `/lifecycle/` намеренный: ядро уже держит `POST /admin/orders/:id/cancel` и `/complete` — наши `cancel`/`close` под `/lifecycle/` их не перекрывают.
**actor_type:** store-роуты → `buyer` (actor_id = customer), admin-роуты → `admin` (actor_id = user). Разделение `seller`/`admin` появится с модулем продавца — сейчас dashboard-user един.
**`items` сборки обязателен** (в `AdminCompleteAssembly` и `CompleteOrderAssemblyWorkflowInput`): ядровый `createOrderFulfillmentWorkflow` типизирует `items` как required `CreateOrderFulfillmentItem[]` — «пропустить = собрать всё» на уровне типов невозможно; полная сборка = передать все позиции заказа (админ-UI их и так загрузил). Первоначальная попытка сделать `items` опциональным отвергнута компилятором.
**Контракт — мердж методов на существующем пути.** База Store-спеки уже содержит путь `/store/orders` (ядровый GET). Прежний `generate-contract.mjs` бросал на любом совпадении ключа пути; обобщён: если путь уже есть — дописываем НОВЫЕ методы (наш POST), коллизия ТОГО ЖЕ метода остаётся ошибкой (кастом не должен молча перекрыть ядровую операцию). Так `PostOrders` встал рядом с ядровыми операциями `/store/orders`. Контракт: 74→85 путей, 611→630 схем, 2→4 фрагмента (`store/orders/orders.oas.json`, `admin/orders/orders.oas.json`; admin-часть — в контракт для полноты, хотя мобильные клиенты используют store).
**Отвергнуто:** переопределение ядровых `GET /store/orders`/`GET /admin/orders` кастомными роутами (сломало бы витрину/дашборд); подпуть `/admin/orders/queue` для очереди (риск матча как `:id=queue`); буферизация `fulfillment_status` в очередь (вычисляемое поле query.graph не отдаёт — очередь опирается на наш статус).

## 2026-07-15 — Заказ, подзадача 4 (последняя): админ-UI жизненного цикла (очередь + widget)
**Путь роута очереди — `order-queue`, НЕ `orders`.** UI-роут `src/admin/routes/<path>/page.tsx` регистрируется как `/<path>` в дашборде; `orders` конфликтует с ядровым списком заказов (та же коллизия, что у API-очереди в подзадаче 3). Пункт сайдбара «Order Queue» (иконка `ShoppingCart`) рядом с ядровым «Orders». Данные — `GET /admin/order-lifecycles`; идиомы `routes/companies`/`routes/product-moderation` (построчная копия внутреннего DataTableFilter ядра: чип Status → «Add filter» → «Clear all», статус точкой-`StatusCell`, server-side фильтр+сортировка FIFO по created_at). Клик по строке → ядровая страница заказа `/orders/:id` (там widget). Предустановленного чипа НЕТ (обзор всех заказов по статусу, как companies) — в отличие от product-moderation (там пресет Proposed).
**Поиска в очереди нет** — эндпоинт `GET /admin/order-lifecycles` отдаёт только фильтр статуса + сортировку + пагинацию (`q` по link-полям order не поддержан). Не добавляли `DataTable.Search` (пустой поиск вводил бы в заблуждение); честно оставили фильтр+сортировку. Добавлять `q` (фильтр по display_id/email через link) — если понадобится, отдельной задачей на эндпоинт.
**Widget — зона `order.details.after`** (проверено: зона валидна в `@medusajs/admin-shared`), основная колонка (место под лог). Статус — `StatusBadge`, доступные из текущего статуса переходы — в «...»-меню секции (идиома `product-catalog-card`), ниже — лог переходов (новые сверху). Данные — свой запрос `GET /admin/orders/:id/lifecycle` (queryKey `["order-lifecycle","detail",id]`); `status=null` (заказ создан не нашим placeOrder) → «no lifecycle record».
**Карта доступных переходов — `ORDER_TRANSITIONS` в `lib/order.ts`, подмножество стейт-машины сервиса.** Из `partially_assembled` предлагаем только `ship` (отправка готовой части) + `cancel`, а не досборку: остаток позиций UI не отслеживает (полная сборка = все позиции заказа; частичная — расширенный кейс не для ручного UI). `returned` из `delivered/closed` не выставляем — отдельный сценарий returnFlow.
**Позиции/fulfillment для переходов — из данных ядровой страницы (prop `data`), НЕ своим запросом.** `complete-assembly`/`ship` шлют все позиции заказа (`data.items` → полная сборка/отгрузка), `ship`/`deliver` выбирают fulfillment из `data.fulfillments` (ship — не отгруженный, deliver — отгруженный без доставки, оба без `canceled_at`). Причина: `data` ядровой order-detail отдаёт `items[].quantity` и `fulfillments[]` полноценно (в отличие от `query.graph`, который BigNumber-`quantity` не отдаёт — DECISIONS 2026-07-14). После мутации инвалидируем `["orders"]` — ядро перезапрашивает и передаёт свежий `data`.
**Общий hook `use-order-lifecycle.ts`** — одна мутация перехода (`POST /admin/orders/:id/lifecycle/:path`), инвалидирует и наш статус (`["order-lifecycle"]`), и ядровый заказ (`["orders"]` — общий корень queryKey ядра), чтобы обновились и widget, и страница/бейдж. Отмена — через `CancelOrderPrompt` (danger, причина НЕОБЯЗАТЕЛЬНА — в отличие от reject карточки/компании; необратимость статуса canceled).
**Демо-данные — `src/scripts/seed-demo-order.ts`** (`npx medusa exec`): идемпотентен по маркер-email, строит минимальную доставку (fulfillment set/service zone/shipping option — тот самый отложенный при сиде KZ набор) и размещает 3 заказа (new/confirmed/in_delivery) через реальные workflow — для ручной проверки очереди (разные статусы) и widget'а (переходы на разных этапах).
**Верификация:** tsc обоих tsconfig чистый, lint 0 ошибок, `medusa build` (backend+frontend) зелёный; UI прокликан headless-браузером (playwright-core через системный Edge): логин → очередь (3 заказа, корректные #/email/статусы) → фильтр `status=in_delivery` (1 строка) → страница заказа (widget «Order lifecycle» виден) → «...»-меню (для `new`: Confirm | Cancel order) → Confirm → статус стал Confirmed, бейдж обновился, 0 ошибок консоли (единственная — ядровый `validateDOMNesting` в `CostBreakdown`, не наш код).
**Отвергнуто:** путь роута `orders` (клэш с ядровым списком); свой запрос позиций/fulfillment в widget (`data` ядра уже полон, лишний round-trip); `DataTable.Search` (эндпоинт `q` не отдаёт); зона `order.details.side.after` (лог переходов не влезает в узкую колонку).

## 2026-07-15 — Модуль `payment-kaspi`: дизайн (провайдер за платёжным шлюзом ядра + адаптер + мок)
**Kaspi — это Payment Provider ядра, а не своя платёжная подсистема.** ТЗ 3.2 требует единый шлюз с
подключаемыми эквайерами — в Medusa это и есть модуль `@medusajs/payment` с провайдерами. Пишем ТОЛЬКО класс
`KaspiPaymentProvider` (`AbstractPaymentProvider`, `identifier="kaspi"`, полный id `pp_kaspi_kaspi`) + точки
интеграции в оформление. Payment collection / session / Payment / Capture / Refund / webhook-роут
(`/hooks/payment/:provider`) / вызов методов провайдера из `completeCartWorkflow` — всё ядро.
**Свои модели домена НЕ заводим (для MVP).** Kaspi-специфичное состояние (invoice_id, QR-токен, polling-курсор) —
в `data` (jsonb) платёжной сессии, которым владеет провайдер; факт оплаты/возвратов — ядровые Payment/Capture/Refund
(это и есть «лог платёжных событий» ТЗ по деньгам). Отдельная таблица логов — только если реконсиляция потребует
(отложено). Поэтому `payment-kaspi` — provider-модуль, регистрируется в массиве `providers` ядрового
`@medusajs/payment`, а не как обычный доменный модуль в `modules: []`.
**Транспорт к Kaspi изолирован за интерфейсом `KaspiClient` (адаптер) — ключевое из-за отсутствия песочницы.**
Провайдер зависит только от интерфейса; две реализации: `KaspiMockClient` (dev/тесты, детерминированный QR/статус/
webhook, без сети — вся логика оформления и тесты не требуют реальных ключей) и `KaspiHttpClient` (порт неофициального
флоу tapter-dev, заменяется официальным API при договоре эквайринга). Выбор — env `KASPI_MODE=mock|live` (по умолчанию
`mock`, если нет `KASPI_MERCHANT_ID`/`KASPI_API_KEY`). Секреты — только env, в репо плейсхолдеры в `.env.example`.
**Флоу QR асинхронный, подтверждение берём двумя путями (надёжность):** `initiatePayment` создаёт инвойс+QR →
клиент показывает QR → оплата в приложении Kaspi → (а) webhook `/hooks/payment/kaspi` → `getWebhookActionAndData`
и (б) polling через `getPaymentStatus`; когда сессия `authorized` — `placeOrder` (`completeCartWorkflow` уже
авторизует сессию своим шагом). Сценарии оплаты (предоплата/частичная/постоплата/бонусы) — оркестрация суммой
payment collection и веткой workflow, НЕ логика провайдера (провайдер платит заданную сумму).
**Объём MVP — 100% предоплата.** Частичная предоплата, постоплата юрлиц (зависит от `scoring`+`SpendLimit`), оплата
бонусами (зависит от `bonus`), пересчёт при частичном исполнении — осознанно отложены до появления тех модулей.
**Подзадачи:** (1) провайдер+мок+100% предоплата, (2) оплата в оформлении заказа + контракт/Dart + http-тесты,
(3) живой `KaspiHttpClient`+webhook+refund, (4) отложенные сценарии. Дизайн целиком — `docs/modules/payment-kaspi.md`.
**Отвергнуто:** своя платёжная подсистема/шлюз (дублировала бы ядро, ломала «параллельные эквайеры»); хранение
Kaspi-состояния в отдельной таблице (сессия `data` для этого и предназначена); жёсткая зависимость от реального
Kaspi API в коде оформления (без песочницы заблокировало бы разработку — отсюда адаптер+мок).

## 2026-07-15 — payment-kaspi, подзадача 1: провайдер (мок) + регистрация под шлюзом ядра
**Что:** `backend/src/modules/payment-kaspi/` — класс `KaspiPaymentProvider extends AbstractPaymentProvider`
(`static identifier="kaspi"`, все 10 методов Payment Provider API), интерфейс `KaspiClient` + `types.ts`,
детерминированный `KaspiMockClient`, фабрика `create-kaspi-client.ts` (выбор mock|live по env), регистрация
через `ModuleProvider(Modules.PAYMENT, {services:[KaspiPaymentProvider]})` в `index.ts`, подключение в
`medusa-config.ts` внутри `options.providers` ядрового `@medusajs/medusa/payment`. Своих моделей домена НЕТ
(состояние — в `data` сессии, как в дизайне).
**Решения:**
- **Сигнатуры Payment Provider API выяснены через tsc, не по памяти** (node_modules закрыт для чтения агентом —
  риск из STATE.md). Метод: временный зонд-класс, пустой наследник → TS2655 перечисляет абстрактные члены;
  затем каждый метод с типом-«ловушкой» → TS2416 печатает ожидаемую сигнатуру (`--noErrorTruncation`); поля
  Input/Output — присваиванием `{}` (обязательные поля в тексте ошибки). Зонд удалён после сверки.
  Факты 2.17.2: Output'ы capture/cancel/delete/refund/retrieve = `{ data? }`; `initiate` возвращает обяз. `id`
  (= id платёжной сессии провайдера); webhook — `getWebhookActionAndData({data,rawData,headers}) → WebhookActionResult`.
- **Мок СТАТЕЛЕСС: исход оплаты закодирован в `invoice_id`** (`kaspi_mock_<state>_<uuid>`), `getInvoiceStatus`
  парсит состояние из id. Значит тесты гоняют сценарии через `data.kaspi_scenario` сессии, не залезая во
  внутреннее состояние мока; незнакомый формат id → `error` (страховка от рассинхрона, НЕ «оплачено»).
- **`session_id` в webhook = наш `invoice_id`** (ядро сохраняет возвращённый из `initiate` `id` и по нему находит
  сессию при webhook — как Stripe возвращает `paymentIntent.id`). `paid`→`AUTHORIZED` (не сразу `CAPTURED`):
  списание оставлено явным capture'ом ядра.
- **`MedusaError.Types.NOT_IMPLEMENTED` не существует** в 2.17.2 — для «live ещё не готов» использован `NOT_ALLOWED`.
  live-режим фабрики бросает до появления `KaspiHttpClient` (подзадача 3), а не молча уходит в мок.
- Тесты — **чистые unit** (`__tests__/*.unit.spec.ts`, раннер `test:unit`, без БД/docker → входят в CI): 16 шт.
**Верификация:** tsc обоих tsconfig 0 ошибок, lint 0 ошибок, `test:unit` 16/16, dev-сервер поднят —
в таблице `payment_provider` появился `pp_kaspi_kaspi` (enabled) рядом с `pp_system_default` (регистрация под
ядровым шлюзом работает, конструктор корректен с реальным DI). API-роутов пока нет → контракт/Dart не трогали
(это подзадача 2).

## 2026-07-15 — payment-kaspi, подзадача 2: оплата в оформлении заказа
**Что:** store-роуты `POST/GET /store/carts/:id/payment/kaspi` (инициализация оплаты: payment collection +
сессия Kaspi + QR; и статус/polling) поверх workflows `init-cart-kaspi-payment` / `sync-cart-kaspi-payment`,
плюс предусловие 100% предоплаты в `place-order` (шаг `ensure-cart-payment-authorized`).
**Решения:**
- **Polling статуса = попытка авторизации ядром.** У `IPaymentModuleService` НЕТ метода «спросить статус у
  провайдера без побочных эффектов» (полный список членов снят tsc-зондом; есть только `retrievePaymentSession`
  + `authorizePaymentSession(id, context) → Promise<PaymentDTO|null>`). Поэтому опрос реализован честно по
  дизайн-флоу: пока сессия pending — `authorizePaymentSession` (провайдер внутри опрашивает инвойс Kaspi);
  оплачено → сессия authorized + Payment ядра, не оплачено → остаётся pending, ошибка авторизации глотается
  (не-оплата — штатное состояние опроса). Общий хелпер — `workflows/utils/settle-kaspi-payment-session.ts`,
  его используют и polling-шаг, и предусловие placeOrder.
- **Предусловие в `place-order` — шаг `ensure-cart-payment-authorized` ПЕРЕД `completeCartWorkflow`:** сессия
  обязана существовать (иначе 400 «no payment session»), Kaspi-сессия — быть оплаченной (перед проверкой
  синхронизируется с инвойсом — страховка от гонки «оплатил, но не дождался polling'а»). Прочие провайдеры
  (pp_system_default, будущая постоплата юрлиц через scoring) авторизует сам completeCart. Дружественная
  ошибка вместо внутренней ошибки авторизации ядра.
- **Порядок шагов в workflow — зависимостью по данным, не порядком строк.** Движок workflow исполняет шаги по
  графу данных: шаг без входной зависимости от when-ветки может выполниться раньше неё. Приём: результат
  when().then() пропускается через transform, формирующий input следующего шага (`transform({input, created},
  d => ({cart_id: d.input.cart_id}))`), а completeCart получает `payment.cart_id` из шага-предусловия.
  Подтверждено эмпирически (тест «init создаёт collection + сессию» проверяет порядок collection→session).
- **Init идемпотентен через переиспользование:** существующая Kaspi-сессия возвращается как есть (новый инвойс
  не создаётся). Актуальность суммы collection при правках корзины поддерживают сами cart-workflows ядра.
- **Путь `/store/carts/:id/payment/kaspi`** — под-ресурс корзины (ядровые пути корзины не перекрываются);
  auth customer обязателен (ядровые роуты корзины гостевые), владение — `requireOwnCart` (чужая → 404,
  симметрично `requireOwnOrder`). `scenario` в теле POST — ТОЛЬКО для мока, live-транспорт игнорирует.
- **Сид `seed-kz.ts` дополнен блоком 2a:** идемпотентно добавляет `pp_kaspi_kaspi` в `payment_providers`
  региона Kazakhstan (иначе сессию Kaspi в dev не создать; `payment_providers` — link, читается query.graph).
**Верификация:** 12 новых http-тестов (`kaspi-payment.spec.ts`: init+QR/идемпотентность/чужая корзина 404/401/
polling pending→paid/сквозное оформление с оплатой/оформление без polling/отказы unpaid+canceled+без сессии),
весь `test:integration:http` — 87 зелёных, unit 16/16, tsc обоих tsconfig 0 ошибок, lint 0 ошибок, контракт
86 путей/633 схемы/5 фрагментов, Dart-клиент 26 клиентов/99 запросов, сид прогнан дважды (идемпотентен),
`bash scripts/ci.sh` — CI OK.

## 2026-07-16 — payment-kaspi, подзадача 3: живой транспорт `KaspiHttpClient`
**Что:** `backend/src/modules/payment-kaspi/kaspi-http-client.ts` — порт QR-флоу референса
`tapter-dev/kaspi-pos-automation` за адаптером `KaspiClient` (инвойс → polling → refund → webhook),
ветка `live` фабрики `create-kaspi-client.ts` перестала бросать, webhook с проверкой HMAC-подписи.
**Решения:**
- **QR-флоу референса, не invoice-флоу.** У референса два потока: invoice (`/api/invoice/create`, требует
  `phoneNumber` покупателя — у нас его нет в `CreateInvoiceInput`) и QR (`/api/qr/create` — ровно наш
  дизайн: покупатель сканирует QR). Портирован QR: `createInvoice` → `POST /api/qr/create`
  (`invoice_id` = `QrOperationId`, `qr_payload` = `payment_url` = `QrToken` — ссылка pay.kaspi.kz),
  `getInvoiceStatus` → `GET /api/qr/status?qrOperationId=`, `refund` → `POST /api/refund/create`
  (`qrOperationId`+`returnAmount`), `cancel` → `POST /api/invoice/cancel` (единственный cancel-эндпоинт
  референса; у QR своей отмены нет — QR истекает сам по `ExpireDate`, отмена best-effort).
- **Маппинг статусов — fail-safe:** `paid` ТОЛЬКО на явный `Processed`; `Expired`/`QrTokenDiscarded`/
  `CancelledByUser`/`RemotePaymentCanceled` → `canceled`; `Rejected`/`RemotePaymentRejected`/`Error` →
  `error`; всё незнакомое → `pending` (продолжаем опрашивать, НЕ авторизуем и НЕ роняем: набор статусов
  неофициального API может пополняться). Экспортированная чистая функция `mapKaspiStatus` покрыта тестами.
- **Webhook: подпись обязательна.** `X-Webhook-Signature: sha256=<hex>`, hex = HMAC-SHA256(secret, raw body);
  сравнение `timingSafeEqual`, отсутствие/невалидность → `MedusaError NOT_ALLOWED` (webhook меняет статус
  денег — молча пропускать нельзя). Состояние берём из сырого `status` Kaspi (тот же `mapKaspiStatus`),
  событие `payment.success|failed|expired` — запасной маппинг; `invoice_id` = `paymentId` пейлоуда.
  Отсюда новый ОБЯЗАТЕЛЬНЫЙ для live env `KASPI_WEBHOOK_SECRET`.
- **HTTP-транспорт — инжектируемый fetch, не nock/undici-mock.** Клиент принимает `fetch?: KaspiFetch`
  (минимальная структурная типизация; по умолчанию `globalThis.fetch` Node 18+), тесты подсовывают фейк —
  ни новых devDeps, ни перехвата глобалей. Таймаут — `AbortSignal.timeout` (10s). Ответы референса — конверт
  `{StatusCode, Data, Message}`: не-2xx и `StatusCode !== 0` → `MedusaError UNEXPECTED_STATE` с сообщением
  эквайера.
- **Live-конфигурация обязана быть полной:** `KASPI_MODE=live` без любого из `KASPI_API_URL`/
  `KASPI_MERCHANT_ID`/`KASPI_API_KEY`/`KASPI_WEBHOOK_SECRET` → ошибка со списком недостающих переменных
  (молчаливый откат в мок недопустим — это оплата). `KASPI_API_URL` — адрес РАЗВЁРНУТОГО
  automation-сервера, не kaspi.kz. Маппинг двух наших секретов на три заголовка референса
  (`X-Token-SN`/`X-Profile-Id` = merchant_id, `X-Vtoken-Secret` = api_key) — временный, до официального API.
- **Провайдер и оформление НЕ тронуты** — интерфейс `KaspiClient` не менялся; замена транспорта на
  официальный API при договоре эквайринга затронет только этот файл + фабрику.
**Верификация:** 21 новый unit-тест (`kaspi-http-client.unit.spec.ts`: запросы/заголовки/маппинги/конверт
ошибок/подпись webhook: валидная, отсутствует, tampered body, чужой секрет/фабрика live из опций и env),
unit всего 37/37, `test:integration:http --testPathPattern=kaspi-payment` — 12/12 (mock-путь не задет),
tsc обоих tsconfig 0 ошибок, lint 0 ошибок (10 предупреждений — старые, в сид-скриптах).

## 2026-07-16 — Заказ: способы получения `delivery|pickup|counter` + приёмка (подзадача 5)
Поправка владельца 2026-07-15 реализована внутри модуля `order-lifecycle` (свой модуль не заводился):
- **`delivery_method` — поле OrderLifecycle** (enum, default `delivery`, задаётся при создании и не меняется), а НЕ metadata заказа ядра: способ получения управляет нашей стейт-машиной, его место — рядом с ней.
- **Стейт-машина параметризована методом:** `ORDER_STATUS_TRANSITIONS` — карта на каждый метод; `assertOrderStatusTransition(from, to, method="delivery")`. pickup: без `in_delivery` (выдача `assembled → delivered`), частичной выдачи нет (`partially_assembled → assembled|canceled`); counter: свёрнутый путь `new → delivered → closed`.
- **Код получения (только delivery):** 6 цифр, выдаётся шагом `issue-delivery-code` при переходе в `in_delivery` (ship-order; повторная отгрузка код НЕ перевыпускает), хранится открыто в `lifecycle.delivery_code` (хэшировать нечего — код короткоживущий и одноцелевой; пересмотреть при выходе за MVP). Проверка — чистая функция `assertDeliveryConfirmation` в `recordTransition`: `delivered` при delivery валиден только с верным кодом; «передан по коду» — способ подтверждения, не статус. Код видит ТОЛЬКО покупатель (`GET /store/orders/:id/lifecycle`); в admin-ответах кода нет — водитель вводит его со слов покупателя (SMS — модуль уведомлений позже).
- **Порядок шагов deliver-order перевёрнут:** наш переход (с проверкой кода) идёт ПЕРВЫМ, ядровый `markOrderFulfillmentAsDelivered` — после. Наш шаг компенсируемый; неверный код отклоняется до того, как ядро пометит fulfillment доставленным (обратный порядок оставлял бы ядро «доставленным» при провале инварианта, полагаясь на компенсацию ядрового workflow).
- **Эмпирика ядра:** `markOrderFulfillmentAsDelivered` НЕ требует предварительного shipment — pickup/counter помечают fulfillment доставленным без `createOrderShipment` (подтверждено интеграционными тестами; обходных шагов не нужно).
- **Продажа у окна — `place-counter-order` + `POST /admin/counter-orders`:** отдельный workflow (completeCart с тем же предусловием оплаты → lifecycle `counter` + links → fulfillment ВСЕХ позиций (новый шаг `get-order-items` — количества через сервис order, не query.graph) → переход `new → delivered` → markDelivered). Отдельный ресурс, не под `/admin/orders` (статик конфликтует с ядровым `:id` — прецедент `/admin/order-lifecycles`). actor_type=admin; POS в partner-app — отдельный дизайн-раунд.
- **Store-валидатор разрешает только `delivery|pickup`** — counter покупателю недоступен по смыслу (продажа у окна — операция продавца).
**Отвергнуто:** метод в metadata ядрового order (стейт-машина не наша зона); перевыпуск кода на каждую отгрузку (частичные отгрузки одного заказа получали бы разные коды — путаница при вручении); shipment для pickup/counter «для консистентности» (ядро не требует, а фиктивная отгрузка врёт в данных).
**Верификация:** модульные 8/8; http `order-routes`/`order-lifecycle-workflows`/`order-delivery-methods` — 17/17 (полный цикл delivery с кодом: без кода/с неверным — 400 и статус не сдвигается; pickup без ship и без кода; counter одним вызовом: history `new → delivered`, fulfillment ядра delivered); контракт 87 путей/635 схем; Dart 26 клиентов/100 запросов; flutter analyze 0; tsc обоих tsconfig 0.

## 2026-07-16 — Модуль `bonus`: дизайн + модуль (лотовый леджер поверх кастомного кошелька)
**Что:** дизайн `docs/modules/bonus.md` + модуль `backend/src/modules/bonus/` (модели
`BonusAccount`/`BonusTransaction`/`BonusConfig`, сервис, links к customer и order, миграция, тесты).
**Решения:**
- **Кошелёк пишем сами — store credit в ядре OSS НЕТ.** Проверено tsc-зондом на 2.17.2: ни
  `Modules.STORE_CREDIT`, ни store-credit workflows (упоминание в `backend/CLAUDE.md` было ошибочным —
  исправлено на «кредитные линии заказа»). Промо-модуль не подходит: промо — скидки/кампании, а не
  накопительный счёт с лотами, сгоранием и запретом вывода. Зато ЕСТЬ `createOrderCreditLinesWorkflow`
  (вход `{ id, credit_lines: [...] }`) — кандидат механизма «оплата бонусами» в подзадаче 3.
- **Лотовый учёт (lot-based ledger), не «баланс минус что-то».** Каждое начисление — лот со своим
  `remaining`/`expires_at`; списание уменьшает лоты FIFO (ближайшее сгорание первым, затем по дате
  создания), сгорает только НЕсписанный остаток просроченных лотов. Без лотов корректное сгорание
  невозможно (сжигался бы и свежий бонус). `balance` счёта денормализован, поддерживается только
  методами сервиса (credit/spend/revertSpend/expireLots); расхождение баланса с лотами → UNEXPECTED_STATE.
- **amount транзакции всегда > 0, направление — в типе** (`accrual|spend|expiry|manual_credit|manual_debit`):
  знаковые суммы размывают инварианты, тип и так нужен для истории/документов.
- **`lot_breakdown` хранится в spend-транзакции** (`[{transaction_id, taken}]`) — откат списания
  (`revertSpend` для компенсации workflow-шага) не требует пересчёта, лоты восстанавливаются точно.
- **Идемпотентность начисления — link'ом order↔bonus_transaction (isList)**, не полем в модуле:
  заказа модуль не знает (изоляция). Условие начисления (closed + окно возврата от даты delivered) —
  в джобе/workflow подзадачи 2, единственный триггер — джоба (подписка на `to=closed` не годится:
  окно возврата ещё не истекло).
- **Сегментные проценты — json `segment_percents` со строковыми ключами**, тип сегмента из `catalog`
  НЕ импортируем (изоляция модулей); связывание сегмента позиции с процентом — в workflow подзадачи 2.
  Расчёт — чистая `calculateOrderAccrual` (по товарным позициям, доставка не бонусируется, floor по
  сумме); потолок списания — чистая `assertSpendWithinCap` (сервис заказа не знает — вызов из workflow).
- **`BonusConfig` — singleton-строка** (`getOrCreateConfig`, MVP — один продавец): `accrual_percent=1`,
  `max_spend_percent=50` (дефолт до уточнения владельцем — ТЗ не задаёт), `expiry_days=null` (сгорание
  выключено), `return_window_days=14` (при появлении модуля возвратов настройка станет общей).
- **Гонки при параллельном списании не блокируем** (MVP ~10 заказов/день); при росте — advisory lock
  по счёту.
**Отвергнуто:** промо/кампании ядра как носитель бонусов; знаковый amount; сгорание по «последней
активности» счёта; немедленное начисление по событию закрытия (окно возврата).
**Верификация:** 10 интеграционных тестов модуля (лоты FIFO/овердрафт/revert/expire идемпотентен/
конфиг-singleton/чистые функции) — зелёные; все modules 65/65, http 91/91 (приложение с модулем и
двумя link'ами поднимается), unit 37/37, lint 0 ошибок, tsc обоих tsconfig чистый; миграция прогнана
(таблицы bonus_account/bonus_transaction/bonus_config + 2 link-таблицы).

## 2026-07-16 — bonus, подзадача 2: начисление (джоба + workflow `accrue-order-bonus`)
**Что:** workflow `accrue-order-bonus` (шаги `prepare-order-bonus-accrual` / `get-or-create-bonus-account` /
`credit-bonus-account` + link к заказу + `bonus.accrued`), джоба `src/jobs/accrue-bonuses.ts` (ежечасно),
subscriber-заглушка `bonus-accrued.ts`.
**Решения:**
- **Инварианты начисления живут в workflow, джоба — тонкий сканер.** Шаг `prepare-order-bonus-accrual`
  сам проверяет: lifecycle=closed, переход `to=delivered` в логе есть и окно возврата истекло, accrual
  по link'у ещё нет. Джоба фильтрует то же самое заранее (не гонять workflow впустую), но workflow
  безопасен и при ручном/повторном вызове — двойное начисление отсекается инвариантом, а не дисциплиной
  вызывающего.
- **Нулевое начисление (процент 0 / копеечный заказ, floor → 0) — no-op без транзакции** (ветка
  `when("accrual-amount-positive")`): лот с amount=0 запрещён леджером, а транзакция-маркер «нулевого
  начисления» засоряла бы историю покупателя. Цена решения: такой заказ остаётся кандидатом каждого
  прогона джобы — безвредный no-op на MVP-масштабе.
- **Get-or-create счёта — один шаг с `link.create` внутри**, не `createRemoteLinkStep`: линк нужен
  ТОЛЬКО если счёт создан этим шагом (существующий найден по link'у customer↔bonus_account), условное
  создание внутри шага с компенсацией «удалить только созданное» проще, чем when-ветвление вокруг
  двух шагов.
- **База позиции — `unit_price × quantity` через сервис order** (query.graph не отдаёт надёжно
  BigNumber-поля позиций — известный нюанс; item.subtotal с промо-скидками — забота будущего, промо
  в MVP нет). Сегмент позиции — `product_card.segment` по link'у, одним query.graph по всем товарам заказа.
- **Дата доставки — последний переход `to=delivered` из `OrderLifecycleEvent`** (у counter-заказов
  он тоже есть: new→delivered→closed). `expires_at` лота — от момента НАЧИСЛЕНИЯ (не доставки):
  срок жизни бонуса отсчитывается с появления бонуса у покупателя.
- **Скан джобы линеен по всем closed-заказам** (кандидаты не сужаются датой): на MVP (~10 заказов/день)
  приемлемо; при росте — маркер обработки на lifecycle (отмечено в коде джобы). Ошибка одного заказа
  логируется и не роняет прогон.
**Отвергнуто:** триггер по событию `to=closed` (окно возврата ещё не истекло); нулевая транзакция-маркер;
`createRemoteLinkStep` для link'а счёта.
**Верификация:** 7 новых http-тестов (`bonus-accrual.spec.ts`: 1% без доставки + ленивый счёт,
идемпотентность, сегментный процент 2% + expiry лота, не-closed → 400, окно не истекло → 400, нулевое
начисление — no-op, джоба: начисляет должника / пропускает начисленное и открытое / повторный прогон
no-op); события `bonus.accrued` и subscriber-стаб видны в логах прогона; unit 37/37, modules 65/65,
tsc обоих tsconfig чистый, lint 0 ошибок.

## 2026-07-17 — bonus, подзадача 3: списание в оформлении (credit lines корзины)
**Что:** workflows `apply-cart-bonus`/`remove-cart-bonus` + шаг `spend-cart-bonus` в
`place-order`/`place-counter-order`; store API `POST/DELETE /store/carts/:id/bonus`, `GET /store/bonus`.
**Решения:**
- **Механизм уменьшения суммы — КРЕДИТНЫЕ ЛИНИИ КОРЗИНЫ ядра** (`createCartCreditLinesWorkflow` /
  `deleteCartCreditLinesWorkflow`, есть в 2.17.2), а не order credit lines из дизайн-дока: ядро само
  вычитает линии из `cart.total`, `completeCartWorkflow` сам копирует их в заказ (суммы «деньгами/
  бонусами» разделены для будущего `documents`), а `validate-cart-payments` ядра пропускает платёж,
  когда кредит покрывает весь total (первая проверка шага) — заказ полностью на бонусах не требует
  payment collection вовсе. Бонусная линия помечается `reference="bonus_account"`,
  `reference_id`=id счёта.
- **Применение — намерение, списание — при оформлении.** POST создаёт только кредитную линию
  (проверив баланс/валюту/потолок — fail fast, шаг `validate-cart-bonus-spend`); лоты списываются
  шагом `spend-cart-bonus` СТРОГО между `ensure-cart-payment-authorized` и `completeCartWorkflow`
  (цепочка закреплена зависимостями по данным): упавшая оплата не трогает леджер, упавший completeCart
  откатывает списание компенсацией `revertSpend`. Инварианты перепроверяются на момент оформления —
  корзина могла измениться, баланс — утечь в другой заказ (гонку не блокируем — MVP, идиома леджера).
- **Шаг `spend-cart-bonus` стоит В ОБОИХ workflow завершения корзины** (place-order И
  place-counter-order): корзина с применёнными бонусами, пробитая у окна, иначе получила бы скидку
  кредитной линии без движения по леджеру.
- **Согласование с Kaspi — через `refreshPaymentCollectionForCartWorkflow` ядра** после apply/remove
  (when-ветка: только если collection уже существует): ядро сверяет сумму collection с total и при
  расхождении УДАЛЯЕТ платёжные сессии — инвойс Kaspi на старую сумму сбрасывается, клиент
  инициализирует оплату заново (тест подтверждает). Если оплата ещё не инициализирована — collection
  создастся позже сразу на сумму за вычетом бонусов.
- **Повторный POST заменяет сумму** (старая линия удаляется when-веткой), DELETE идемпотентен.
  Потолок считается от суммы ДО вычета бонусов (`total + bonus_amount` — иначе повторное применение
  занижало бы базу).
- **ЭМПИРИКА query.graph (2.17.2): `cart.total` учитывает кредитные линии ТОЛЬКО если в fields
  запрошен `credit_lines.amount`** — с одним `credit_lines.id` total приходит без вычета. Все шаги,
  читающие total, обязаны запрашивать amount (закреплено комментарием в
  `ensure-cart-payment-authorized`, где это ловилось тестом полной оплаты бонусами).
- **`GET /store/bonus` не создаёт счёт лениво** (нулевой баланс без счёта — просто ответ);
  `lot_breakdown` списаний наружу не отдаётся (внутренняя механика отката).
**Отвергнуто:** order credit lines после completeCart (кандидат из дизайн-дока — ядро уже умеет
переносить линии из корзины, а оплата должна уменьшиться ДО создания заказа); списание лотов в момент
POST (отмена корзины требовала бы фонового возврата); хранение суммы в metadata корзины (дублирует
носитель ядра); запрет повторного POST (замена суммы удобнее тонким клиентам).
**Верификация:** 14 новых http-тестов (`bonus-spend.spec.ts`: баланс/история/401, применение и замена
суммы, потолок 400, недостаток баланса 400 (и без счёта), zod-валидация, чужая корзина 404, DELETE
идемпотентен, collection на сумму за вычетом бонусов + spend-транзакция + link к заказу + перенос
кредитной линии в заказ, сброс Kaspi-сессии при смене суммы + повторная инициализация, полная оплата
бонусами без payment collection (потолок 100), утёкший баланс → 400 без списания); весь http 112/112,
modules 65/65, unit 37/37, tsc обоих tsconfig чистый, lint 0 ошибок; контракт 89 путей/641 схема/
6 фрагментов, Dart 27 клиентов/103 запроса, flutter analyze 0 проблем, смоук api_client зелёный.

## 2026-07-17 — bonus, подзадача 4 (последняя): сгорание + admin API/UI
**Решение:** сгорание — джоба `src/jobs/expire-bonuses.ts` (ежечасно `30 * * * *`, в противофазе с
accrue-bonuses) БЕЗ workflow: обе фазы — операции одного модуля, компенсации не нужны, события джоба
эмитит сама через `Modules.EVENT_BUS`. Фаза 1 — сервисный `expireLots` (идемпотентен, готов с
подзадачи 1) + `bonus.expired` на каждый затронутый счёт; фаза 2 — предупреждение `bonus.expiring_soon`
(лоты с остатком, сгорающие в пределах `expiry_notice_days`) с агрегацией по счёту (сумма + ближайший
срок — одно уведомление покупателю, не по лоту). Admin API — `GET/POST /admin/bonus-config` (частичный
апдейт; GET читает сервисом, POST — workflow `update-bonus-config` с компенсацией-откатом полей) и
`GET /admin/customers/:id/bonus` (данные widget'а: баланс + 20 последних операций, `lot_breakdown`
наружу не отдаётся — идиома GET /store/bonus; статик-сегмент под ядровым `:id` — прецедент
`/admin/orders/:id/lifecycle`). Админ-UI: страница `src/admin/routes/settings/bonus-program/`
(Settings-экстеншен ядра — конфиг платформы живёт в Settings, не в основном сайдбаре; секция
«метка — значение» + Edit-drawer, идиома product-card-drawer) и widget `customer-bonus-card.tsx`
(зона `customer.details.after`, данные своим запросом — prop `data` link-полей не содержит).
- **Идемпотентность предупреждения — маркер `expiry_notified_at` на лоте** (новая колонка +
  `expiry_notice_days` в конфиге, default 7, 0 = выключено; миграция прогнана). Маркер ставится ПОСЛЕ
  эмита: упавший между ними прогон предупредит дважды — осознанно (лучше дважды, чем никогда).
  Альтернативы без маркера (вычислять «пересёк ли порог с прошлого прогона») хрупки к пропуску прогонов.
- **Джоба работает и при выключенном сгорании**: лоты несут собственный `expires_at` — уже созданные
  лоты досгорают после смены конфига (expiry_days=null влияет только на НОВЫЕ начисления).
- **Admin-роуты в контракт не входят** (конфиг правится только веб-админкой; admin/orders-фрагмент
  был исключением ради partner-app) → контракт/Dart не трогали.
- **Сегменты в UI конфига** — фиксированные ключи economy/comfort/business в `admin/lib/bonus.ts`
  (дублирование из lib/catalog.ts осознанно: модуль в браузерный бандл не импортируем, произвольный
  json-редактор хуже для владельца).
**Отвергнуто:** подписка на события вместо джобы (сгорание — чистая периодика); workflow для джобы
сгорания (нет ни кросс-модульных шагов, ни компенсируемых внешних эффектов); expiring_soon по лоту
без агрегации (спам покупателю при нескольких лотах); отдача баланса widget'у через ядровый
`GET /admin/customers/:id?fields=*bonus_account` (работает, но истории операций не даёт — свой тонкий
GET-роут покрывает и баланс, и историю).
**Верификация:** 11 новых http-тестов (`bonus-expiry.spec.ts`: сгорание частично потраченного лота +
bonus.expired + идемпотентность (spy на event bus), expiring_soon один раз на лот + маркер + вне окна
не шлётся + notice=0 выключает, конфиг 401/GET-дефолты/частичный апдейт/сброс null'ами/zod 400×3,
customer-bonus: баланс+история без lot_breakdown / нулевой без счёта / 404); весь http 123/123,
modules 65/65, unit 37/37, lint 0 ошибок, tsc обоих tsconfig чистый, `medusa build` зелёный. UI
прокликан headless-браузером (playwright-core + системный Edge): Settings → Bonus Program (строки,
Edit-drawer: accrual 2% + business 3% + expiry 180 → строки обновились; очистка полей → Disabled),
widget на странице customer (баланс 6,600 KZT, история Spent/Accrued) — 0 ошибок консоли. Демо-сид
`npx medusa exec ./src/scripts/seed-demo-bonus.ts` (счёт с обычным/скоро сгорающим/просроченным
лотами и списанием, идемпотентен).

## 2026-07-17 — Витрина: доставка региона KZ + оформление через placeOrder + способы получения
**Решение:** долг storefront закрыт тремя частями. (1) `seed-kz.ts` дополнен блоком доставки
(идемпотентно, по именам): default shipping profile + link всех товаров сида к нему (без него
completeCart отклоняет корзину), провайдер `manual_manual` на обоих складах, fulfillment-наборы —
«Kazakhstan Delivery» (type=shipping, опция «Доставка по Астане», flat 2000 KZT) и ПО НАБОРУ
`Pickup — <склад>` НА КАЖДЫЙ склад (type=pickup, опция «Самовывоз: <склад>», 0 KZT): стартер
нативно различает опции по `service_zone.fulfillment_set.type === "pickup"` и рисует переключатель
«Pick up your order» со списком складов (адрес — из link'а набор↔склад). (2) `placeOrder` витрины
переведён с ядрового `sdk.store.cart.complete` на наш `POST /store/orders` — иначе заказ оставался
бы без OrderLifecycle; `delivery_method` витрина выводит из ВЫБРАННОЙ опции корзины (тип её
fulfillment-набора pickup → `pickup`, иначе `delivery`) — отдельного UI-переключателя не нужно,
источник истины — выбор на шаге Delivery. (3) Чекаут закрыт гейтом логина (redirect на
`/{cc}/account` из `checkout/page.tsx`): `POST /store/orders` требует customer-аутентификацию,
гостевого оформления в маркетплейсе нет (покупатель идентифицируется ради бонусов/компаний/ЛК).
- **Kaspi спрятан из списка оплат витрины** (фильтр `pp_kaspi_kaspi` в `lib/data/payment.ts`):
  UI оплаты по QR (инициализация + поллинг `/store/carts/:id/payment/kaspi`) — отдельная подзадача;
  до неё провайдер в чекауте был бы тупиковым (кнопка Place order задизейблена). Демо-оплата — manual.
- **Кириллические handle**: стартер не декодирует `params.handle` (Next отдаёт percent-encoded) —
  страница товара падала 500 на наших товарах. Фикс в `products/[handle]/page.tsx`:
  `decodeURIComponent` (двумя местами) + проверка `!pricedProduct → notFound()` перенесена ДО
  `getImagesForVariant` (в стартере падал TypeError вместо 404).
- **Пустой каталог из дискового кэша Next**: `listProducts` со `force-cache` пережил рестарт в
  `.next` и отдавал пустой список, снятый до сида — при странностях витрины после пересида чистить
  `storefront/.next`.
**Отвергнуто:** передача `delivery_method` явным параметром из UI (дублирует выбор опции доставки —
рассинхрон источников истины); pickup «фиктивной» shipping-опцией в наборе type=shipping (стартер
не показал бы адреса складов и тумблер самовывоза); правка бэкенда под гостевое оформление
(домен требует идентифицированного покупателя).
**Верификация:** сид прогнан дважды (второй — все «уже есть»); e2e headless-браузером
(playwright-core + системный Edge, скрипт в scratchpad): каталог /kz/store с ценами KZT → товар
(кириллический handle) → корзина → гейт гостя на /kz/account → логин → адрес → «Доставка по
Астане» → Manual Payment (Kaspi в списке нет — проверено скриптом) → Place order → страница
подтверждения; второй заказ — тумблер «Pick up your order» → «Самовывоз: Склад Астана — Центр»;
у обоих заказов admin API подтвердил lifecycle: `status=new`, `delivery_method=delivery|pickup`.
Консольных ошибок наших страниц нет (2 гидрационных warning'а стартера на /kz/store и /kz/account —
upstream, были до правок). Backend: tsc чистый, lint 0 ошибок; storefront: lint без ошибок
(warnings react-hooks — upstream), tsc в изменённых файлах чистый (остальной шум — upstream стартера).
