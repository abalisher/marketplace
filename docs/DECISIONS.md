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

## 2026-07-18 — Витрина, часть 2: Kaspi QR в чекауте + бонусы + чистка каталога
**Решение:** покупательский чекаут доведён до паритета с store API. (1) **Kaspi QR**: фильтр
`pp_kaspi_kaspi` в `lib/data/payment.ts` снят; на шаге Payment Kaspi инициализируется НАШИМ роутом
`POST /store/carts/:id/payment/kaspi` (server action `initKaspiPayment`), а не ядровым
`initiatePaymentSession` — бэкенд одним вызовом создаёт collection + сессию с инвойсом и возвращает
QR/ссылку; на шаге Review `KaspiPaymentButton` показывает QR (`react-qr-code`, единственная новая
зависимость) + ссылку и поллит `GET .../payment/kaspi` каждые 3с; `authorized|captured` →
`placeOrder()` автоматически (кнопка — ручной запасной вариант). ВАЖНО: первичная загрузка на
Review — через GET-статус, `initKaspiPayment` только fallback: init делает `revalidateTag(carts)` →
RSC-перерендер → ремаунт кнопки → повторный init — цикл перерендеров (наступили в e2e).
(2) **Мок-сценарий из env витрины**: `KASPI_MOCK_SCENARIO` (server-side env, не NEXT_PUBLIC) —
server action подкладывает `scenario` в init; для проходимого dev-чекаута ставить `paid`
(бэкенд в live сценарий игнорирует; мок без сценария вечно `pending`). Документировано в
`.env.template`; в локальный `.env` владельцу добавить руками.
(3) **Бонусы**: `lib/data/bonus.ts` (`retrieveBonusBalance` — null для гостя, `applyCartBonus`,
`removeCartBonus`), форма `checkout/components/bonus-form` по идиоме discount-code (баланс в
заголовке, применённая сумма строкой с корзинкой), строка «Bonuses» в `cart-totals` из
`credit_lines` c `reference="bonus_account"` (чистый хелпер `lib/util/bonus.ts`).
`applyCartBonus` ВОЗВРАЩАЕТ строку ошибки (идиома login/signup actions), не бросает: в prod Next
редактирует сообщения исключений server actions, а ошибки потолка/баланса — пользовательские.
(4) **`*credit_lines` в fields**: добавлен в `retrieveCart` и `retrieveOrder` — ядро 2.17.2 считает
`total` С ВЫЧЕТОМ кредитных линий только если они запрошены (эмпирика подтверждена и на
HTTP-роуте `GET /store/carts/:id`, не только в query.graph).
(5) **Оплата целиком бонусами** (`total=0`, платёжной сессии нет): `paidByBonus` по образцу
`paidByGiftcard` в payment/review/payment-button; отдельная кнопка Place order без сессии
(проверку «total=0 при кредитных линиях» делает бэкенд в `ensure-cart-payment-authorized`).
(6) **Чистка каталога**: скрипт `cleanup-starter-catalog.ts` — apparel-товары сида стартера
удаляются `deleteProductsWorkflow`; «Demo Order Product» НЕ удаляется (на нём демо-заказы с
резервами) — переводится в `draft` через сервис модуля product (событие не эмитится). Плюс
dev-утилита `grant-demo-bonus.ts <email> [amount]` — начислить бонусы покупателю для ручной
проверки (клиент из seed-demo-bonus без пароля в витрину не логинится).
**Отвергнуто:** инициализация Kaspi ядровым `initiatePaymentSession` (создаёт сессию без нашего
идемпотентного ответа с QR и дублирует путь mobile); ручной пересчёт тотала с бонусами на клиенте
(источник истины — `cart.total` ядра с запрошенными credit_lines); удаление «Demo Order Product»
(резервы/заказы демо-данных).
**Верификация:** e2e headless-Edge (playwright-core, скрипт в scratchpad), три сценария:
(A) цемент + «Доставка по Астане» → бонус 500 применён (тотал 5200→4700, строка Bonuses) →
Kaspi QR → мок paid → авто-оформление → подтверждение с Bonuses/Kaspi QR; admin API: lifecycle
new/delivery; леджер: баланс 6000→5500, spend-транзакция 500. (B) песок + самовывоз →
пред-инициализация сценарием pending → QR-панель на Review: svg + ссылка + «Waiting for payment»,
стабильна 6.5с (два цикла поллинга); затем потолок 100 через `POST /admin/bonus-config`, бонус на
весь тотал 8000 → тотал 0 → Place order без платёжной сессии → lifecycle new/pickup, баланс
−8000; конфиг возвращён (50). (C) превышение потолка (5000 при лимите 4000) → ошибка бэкенда
в форме «Bonus spend 5000 exceeds 50% of order amount 8000». Каталог: apparel и Demo Order
Product отсутствуют, KZ-товары на месте; cleanup-скрипт прогнан дважды (идемпотентен).
Консольных ошибок наших страниц 0 (2 hydration-warning'а стартера — upstream). Backend: tsc обоих
tsconfig чистый, lint 0 ошибок; storefront: lint без ошибок, tsc изменённых файлов чистый;
`bash scripts/ci.sh` — CI OK. Попутный нюанс среды: долгоживущий backend dev-процесс (сутки+)
деградирует — store-роуты виснут при живом `/health`; лечится перезапуском `npm run dev`.

## 2026-07-18 — Partner-app, дизайн-раунд 1: объём «Окно склада», бриф поверх зафиксированного ui_kit
**Решение:** дизайн-раунд partner-app скоуплен до связки «окно склада»: очередь заказов
(confirm → assembly → ship/выдача), выдача онлайн-самовывоза, POS-продажа у окна — ровно то, что
уже умеет бэкенд (`/admin/order-lifecycles`, lifecycle-переходы, `POST /admin/counter-orders`,
Kaspi QR). Дашборд руководителя, остатки/цены, возвраты, бухгалтерия — следующие раунды; вручение
доставки по коду — раунд driver-app (код вводит водитель, продавцу не показывается). Артефакты —
`mobile/design/partner/`: `BRIEF.md` (ТЗ для claude.ai/design, по образцу buyer-брифа) +
`domain-reconciliation.md` (сверка с бэкендом ДО дизайна, а не после, как было у buyer — гэпы
перечислены заранее: POS-корзина от продавца, admin-вариант Kaspi-инициализации, привязка
покупателя по телефону, поиск/фильтр очереди, накладная=`documents`, пуши, роли сотрудников
продавца, admin-auth в контракте). Визуальная система НЕ пересматривается: токены/компоненты
buyer-раунда (изумруд, Inter, статусные цвета) переиспользуются, новые компоненты (QueueOrderCard,
AssemblyItemRow, PaymentQRPanel, CartDockBar и др.) проектируются в тех же осях. Навигация —
4 вкладки (Заказы · Продажа · Выдача · Профиль); вход email+пароль (OTP не рисуем — партнёр
логинится admin-аккаунтом), контекст «выбранный склад» — аналог города buyer.
**Отвергнуто:** полный дизайн partner-app одним раундом (дашборд/остатки/цены не имеют бэкенда —
макеты повисли бы в воздухе); ролевые ветки экранов (иерархии продавца в бэкенде MVP нет);
показ кода получения продавцу (код = подпись покупателя о приёмке, вводит его водитель).
**Верификация:** только документы (кода нет) — бриф сверен с фактическим API построчно
(route.ts/workflow place-counter-order прочитаны, ограничения auth store-роутов Kaspi и отсутствие
`q` в очереди зафиксированы в reconciliation).

## 2026-07-18 — POS-гэпы бэкенда: admin-корзина `/admin/counter-carts` поверх ядровых cart-workflows
**Решение:** гэпы 1–2 сверки partner-раунда закрыты отдельным admin-ресурсом POS-корзины:
`POST /admin/counter-carts` (создание с контекстом склада) + `line-items`-роуты (add/update/delete)
+ `payment/kaspi` (те же workflows `init/sync-cart-kaspi-payment`, что у store-варианта) +
`payment/cash` (новый workflow `init-cart-cash-payment`: сессия `pp_system_default`, авторизуется
сама в completeCart). Вся механика корзины — ядровые workflows (`createCartWorkflow`,
`addToCartWorkflow`, `updateLineItemInCartWorkflow`, `deleteLineItemsWorkflow`,
`addShippingMethodToCartWorkflow`); наш код — только workflow `create-counter-cart` с шагом
`resolve-counter-cart-context`: регион (явный или единственный), канал продаж склада (предпочитая
дефолтный канал магазина), pickup-опция склада (completeCart требует shipping method — у продажи
с окна это самовывоз 0 ₸), адрес склада как shipping_address. POS-корзина помечается
`metadata.counter=true` — admin-роуты работают ТОЛЬКО с такими корзинами (покупательская → 404,
как чужой ресурс в store); покупатель у окна гостевой, email — служебный `pos@marketplace.local`
(заменяемый настоящим), привязка customer по телефону — гэп 3, осознанно отложен.
Смена способа оплаты (Kaspi ↔ наличные) — бесплатно через ядро: `createPaymentSessionsWorkflow`
удаляет прочие сессии коллекции при создании новой (подтверждено тестом; поэтому
`ensure-cart-payment-authorized` после переключения видит только актуальную сессию).
Общий маппер ответа Kaspi-роутов вынесен в `src/api/utils/kaspi-payment-response.ts` (store+admin).
**Отвергнуто:** ходить из partner-app в store API с publishable key (Kaspi-роуты требуют
customer-auth + владение корзиной — админский JWT не проходит; гостевые корзины без метки
смешивали бы покупательские и POS-потоки); генерализация `init-cart-kaspi-payment` под провайдер
параметром (не трогаем работающий Kaspi-флоу — новый шаг `get-cart-provider-payment-state`
обобщён, старый `get-cart-payment-state` оставлен как есть); привязка покупателя по телефону
(нет API поиска, отдельная задача).
**Нюанс тестов:** состояние БД НЕ переживает границу `it` в `medusaIntegrationTestRunner`
(строки заказов исчезают, display_id-последовательность сбрасывается; фикстуры beforeAll при этом
живут) — каждый тест обязан быть самодостаточным, сценарий очереди собран одним тестом. В ответе
`POST /admin/counter-orders` `lifecycle` — объект на момент создания (status `new`); свежий статус
перечитывать `GET /admin/orders/:id/lifecycle` (прецедент order-delivery-methods.spec).

## 2026-07-18 — Очередь `/admin/order-lifecycles`: поиск `q` вторым запросом со стороны order
**Решение:** гэп 4 сверки: `GET /admin/order-lifecycles` получил `delivery_method` (свой столбец —
обычный фильтр) и `q` — поиск по номеру заказа (display_id, ввод с «#» допускается) и email
покупателя ($ilike, частичное совпадение). Кросс-модульного фильтра по link-полям query.graph
не умеет → поиск реализован вторым запросом со стороны `order` (link-поле `order_lifecycle.id`
читается в обе стороны), найденные id подставляются фильтром `id` в основной запрос; кэп
совпадений 100 (номер почти уникален, email — десятки заказов). Пустой результат поиска —
пустая страница без запроса к order_lifecycle. Поиск по телефону появится вместе с привязкой
покупателя к POS-заказу (гэп 3).
**Отвергнуто:** фильтр по `order.*` прямо в query.graph (не поддерживается для link-полей);
денормализация display_id/email в order_lifecycle (дублирование данных ядра ради поиска MVP).

## 2026-07-18 — Контракт: точечная выборка ядровых admin-операций из Admin-спеки (гэп 8)
**Решение:** `generate-contract.mjs` дополнительно скачивает официальную Admin-спеку и мерджит
ТОЛЬКО whitelist `ADMIN_BASE_PATHS` (логин `/auth/user/{auth_provider}`, `/auth/token/refresh`,
`GET /admin/orders[/{id}]`, `GET /admin/products[/{id}]`, `GET /admin/stock-locations`) с
транзитивным замыканием схем по `$ref`; одноимённая схема уже в базе — идентичная пропускается,
различная — ошибка (молчаливая подмена сломала бы контракт). Эмпирика 1: официальный Store-бандл
уже несёт ПОЛНЫЙ набор схем (включая Admin*) — замыкание добавило 0 схем, но механизм оставлен:
при расхождении бандлов в будущих версиях схемы подтянутся. Эмпирика 2 (ловушка): Store- и
Admin-спеки используют ОДИНАКОВЫЕ operationId/теги для зеркальных операций (`GetProductsId` и в
/store, и в /admin) — Dart-кодоген группирует клиентов по тегу и генерирует два метода с одним
именем (compile error, который ловит ТОЛЬКО смоук-тест api_client: flutter analyze молчит,
.g.dart вне анализа). Поэтому merged admin-операциям принудительно префикс `Admin` в operationId
и тег `Admin <Tag>` → отдельные AdminAuth/AdminOrders/AdminProducts/AdminStockLocations-клиенты.
Устаревшие файлы прошлой генерации swagger_parser не удаляет — осиротевшие client-файлы (не
упомянутые в export.dart) чистить руками. Контракт: 101 путь / 652 схемы / 7 фрагментов;
Dart — 32 клиента (новые CounterCartsClient + Admin*-клиенты).
**Отвергнуто:** вся Admin-спека целиком (сотни путей — шум для Dart-кодогена и риск его поломок,
партнёрскому клиенту нужен точечный набор); ручные OAS-фрагменты для ядровых admin-роутов
(дублирование официальной спеки руками).

## 2026-07-19 — Модуль `documents`: дизайн + модель (подзадача 1)
**Решение:** новый модуль `documents` (ключ `documents`) для автогенерации документов-оснований
заказа (счёт/накладная/внутренний АВР, ТЗ 4.10). Формат документа для MVP — **PDF через `pdfkit`**
(выбор владельца): настоящий бинарник, чистый JS без Chromium; кириллица — встраиванием TTF-шрифта
(рендер в подзадаче 2). Хранение файла — File Module ядра, модуль хранит только метаданные + `file_id`.
Модели: `Document` (тип, `order_id`, `number`, `version`/`is_latest`, `file_id`, `snapshot`,
`total_money`/`total_bonus` раздельно, видимость по сторонам), `DocumentSetting` (singleton реквизитов
продавца, идиома BonusConfig), `DocumentSequence` (счётчик номеров `<type>:<year>`). Сервис:
`getOrCreateSettings`, `nextDocumentNumber` (последовательность на тип/год, read-modify-write без
блокировки — MVP-конкуренция низкая), `issueDocument` (версионность: переиздание снимает `is_latest`
с текущей, новая версия = +1 с ТЕМ ЖЕ номером; первая — свежий номер), `attachRenderedFile`.
**Заказ — опазной ссылкой-колонкой `order_id`, НЕ module link:** в отличие от order-lifecycle/bonus
(связь с заказом — забота workflow через link), здесь заказ нужен самому сервису — `issueDocument`
группирует по `(order_id, type)` для нумерации/версионности, это внутренняя логика домена. FK нет,
модуль order не импортируется — изоляция соблюдена. Выборка документов заказа (подзадача 3) — прямым
`query.graph(entity:"document", filters:{order_id})`, link не нужен (можно добавить позже под
graph-обход `order → documents`).
**Отвергнуто:** HTML-снапшот вместо PDF (проще с кириллицей, но не бинарный PDF для 1С/печати —
владелец выбрал pdfkit); headless-Chrome/puppeteer (тяжёлая нативная зависимость, риск на Windows-dev
и VPS КЗ); module link order↔document как единственная связь (сервис не смог бы группировать для
версионности без второго запроса на каждый выпуск); `DocumentTemplate` с шаблонами (избыточно для MVP —
один продавец, реквизиты singleton'ом).
**Верификация:** 6 тестов модуля (singleton, нумерация по типу/году, защита от неизвестного типа,
первая версия, переиздание с сохранением номера, attach), modules 71/71, tsc обоих tsconfig чистый,
lint 0 ошибок, миграция прогнана.

## 2026-07-20 — Модуль `documents`: рендер PDF + автовыпуск через подписчиков (подзадача 2)
**Решение:** рендер и выпуск документов — целиком в слое workflows/subscribers, модуль `documents`
остаётся изолированным (знает только свои метаданные, File Module и pdfkit не импортирует).
- **Шрифт:** кириллический TTF **PT Sans** (Regular+Bold, SIL OFL — свободно распространяется, спроектирован
  под кириллицу) закоммичен в `src/modules/documents/assets/fonts/` (+ `OFL.txt`). Стандартные шрифты PDF
  латиница-only. Путь резолвится относительно файла-рендерера с запасным вариантом от cwd.
- **Рендерер** `workflows/utils/render-document-pdf.ts` — чистая функция `(снапшот) → Buffer` (pdfkit, без
  Chromium): шапка, реквизиты продавца, покупатель, таблица позиций, итоги деньгами/бонусами раздельно
  (ТЗ 4.10), подвал. Типы `@types/pdfkit` добавлены в devDependencies.
- **Workflow** `issue-order-document` (шаги: `build-order-document-snapshot` → `issue-order-document` →
  `render-and-attach-document` → `emitEventStep(document.issued)`). Снапшот собирается из СЕРВИСА order
  (query.graph не отдаёт BigNumber-цены/количества надёжно, см. get-order-items); `total_money` = order.total
  (уже за вычетом бонусных кредитных линий), `total_bonus` = сумма кредитных линий. Загрузка PDF — ядровый
  File Module (`Modules.FILE.createFiles`, base64), компенсации удаляют файл и строку при откате.
- **Выпуск — в ПОДПИСЧИКАХ, не внутри place-order/ship-order.** Документ — вторичный артефакт: сбой рендера
  НЕ должен откатывать заказ. `order-invoice.ts` на ядровом `order.placed` (эмитится completeCartWorkflow —
  покрывает и place-order, и place-counter-order) выпускает счёт + внутренний АВР для заказов юрлиц (по link
  company↔order). `order-waybill.ts` на нашем `order_lifecycle.status_changed`: накладная при `in_delivery`
  для доставки и при `delivered` для самовывоза/counter (способ — из lifecycle). Идемпотентность — пропуск,
  если текущая версия документа этого типа уже есть. `document-issued.ts` — заглушка уведомления (идиома
  order-status-changed/bonus-accrued).
**Эмпирика:** локальная шина событий в `medusaIntegrationTestRunner` РЕАЛЬНО диспетчеризует подписчиков
(не только эмитит) — placeTestOrder триггерит выпуск счёта в фоне. Отсюда: (1) подписчиков тестируем прямым
вызовом хендлера или поллингом результата шины, а не и тем и другим (иначе гонка двойного выпуска —
проявление MVP-ограничения read-modify-write нумерации без блокировки; в проде `order.placed` один раз);
(2) идемпотентность проверяем изолированно на фейковом `order_id` без шины.
**Отвергнуто:** выпуск документа шагом внутри place-order (сбой pdfkit/File откатил бы заказ — недопустимо);
рендер/File в сервисе модуля (нарушил бы изоляцию — File это другой модуль); хранение PDF в snapshot/БД
(файл — в File Module, БД держит `file_id`).
**Прод-долг:** `medusa build` ассеты (TTF) в `.medusa/server` не копирует — при прод-развёртывании шрифты
доставить рядом или скопировать в build (задокументировано в docs/modules/documents.md, в известные проблемы
STATE). Частичная накладная на отгруженную часть (несколько накладных на заказ) — отложена (MVP: одна на заказ).
**Верификация:** 8 http-тестов (`documents-issue.spec.ts`: рендер валидного PDF с кириллицей, первая накладная
+ привязка файла, переиздание с сохранением номера, внутренний АВР, автосчёт на order.placed, идемпотентность,
накладная подписчиком на in_delivery + пропуск постороннего перехода), tsc обоих tsconfig чистый, lint 0 ошибок,
`@types/pdfkit` установлен.

## 2026-07-20 — Модуль `documents`, подзадача 3: store/admin API (список/скачивание/экспорт 1С)
**Решение:** тонкие read-only роуты поверх сервиса модуля (выборка по `order_id`, БЕЗ module link — как в дизайне).
- **Store** `GET /store/orders/:id/documents` — документы покупателя в ЛК: `listDocuments({order_id, is_latest:true,
  visible_to_buyer:true})`, владение — `requireOwnOrder` (чужой → 404); сериализатор `serializeDocumentForBuyer`
  отдаёт только публичные поля + `file_url` (скачивание PDF из File Module), БЕЗ `file_id`/`snapshot`. Под auth
  customer автоматически (`/store/orders*` в middlewares).
- **Admin** `GET /admin/orders/:id/documents` — все типы и ВСЕ версии заказа (история, новые сверху),
  `serializeDocumentForAdmin` (+`is_latest`/`file_id`, но без снапшота). Namespace `/documents` под ядровым `:id`
  не конфликтует с ядровыми `:id/{cancel,complete}` (как `/lifecycle`).
- **Экспорт 1С** `GET /admin/orders/:id/documents/export` — снапшоты текущих версий (реквизиты продавца, позиции,
  суммы деньгами/бонусами раздельно, замороженные на момент выпуска), формат JSON. Официальные ЭСФ/АВР бухгалтер
  оформляет вручную на kgd.gov.kz — платформа даёт только исходные данные (ТЗ 4.10). PDF — отдельно по `file_url`.
- **Выборка — сервисом модуля, не query.graph:** `total_money`/`total_bonus` — bigNumber, сервис возвращает их
  корректно (query.graph по своей модели тоже мог бы, но сервис проще и уже отдаёт полный ряд).
**Отвергнуто:** проксирующий download-эндпоинт (стрим PDF через бэкенд) — локальный File-провайдер уже отдаёт
публичный `file_url`, для MVP достаточно; отдельный ресурс `/store/documents` (список всех документов покупателя без
привязки к заказу) — отложен, ЛК показывает документы в контексте заказа; module link order↔document ради graph-обхода
— не нужен, прямой фильтр по `order_id` покрывает выборку.
**Верификация:** 4 http-теста (`documents-routes.spec.ts`: свои документы + `file_url` без внутренних полей, чужие
404, admin-список с `is_latest`/`file_id`, экспорт со снапшотом); tsc обоих tsconfig чистый, lint 0 ошибок; контракт
104 пути/658 схем/7 фрагментов (+3 пути документов, +6 схем; admin-пути POS-гэпа целы); Dart 32 клиента/120 запросов,
flutter analyze 0 проблем. Полный http-набор не перегонялся — роуты только read-only GET, существующих кодопутей не трогают.

## 2026-07-21 — Модуль `documents`, подзадача 4 (последняя): админ-UI реквизитов + widget документов
**Решение:** admin-конфиг реквизитов + widget документов на странице заказа — модуль `documents` закрыт.
- **API реквизитов** `GET/POST /admin/document-settings` — тонкие роуты поверх `getOrCreateSettings` +
  workflow `update-document-settings` (один шаг с компенсацией-откатом, идиома `update-bonus-config`;
  workflow ради правила «роут → workflow»). zod `AdminUpdateDocumentSettings` (все поля опциональны,
  nullable-строки принимают null для сброса, `seller_name` — непустая строка, `seller_email` — формат email).
  **Контракт/Dart НЕ трогаем** — admin-конфиг только для веб-админки (прецедент bonus-config).
- **Settings-страница** `admin/routes/settings/document-requisites/page.tsx` (+ drawer
  `document-requisites-drawer.tsx`) — идиома `settings/bonus-program`: секция «метка—значение» + Edit-drawer;
  пустое необязательное поле = null. Типы/поля продублированы в `admin/lib/documents.ts` (браузерный бандл не
  импортирует код модуля).
- **Widget** `admin/widgets/order-documents-card.tsx` (зона `order.details.after`): список документов заказа
  (`GET /admin/orders/:id/documents`), скачивание PDF по публичному `file_url` (локальный File-провайдер отдаёт
  `/static/*` без auth — прямой `<a href>`), экспорт 1С — кнопка тянет JSON через admin-API (нужен auth) и
  отдаёт Blob-файлом (прямой `<a>` не пронёс бы JWT).
**Отвергнуто:** проксирующий download PDF через бэкенд (file_url публичный — не нужен); прямой `<a href>` на
export-JSON (admin-API требует auth — токен в ссылку не подставить, поэтому fetch+Blob).
**Верификация:** http `documents-routes` 7/7 (+3 теста `/admin/document-settings`: дефолты, частичный апдейт +
сброс поля в null + непереданное не затирается, невалидный email 400); tsc обоих tsconfig чистый, lint 0 ошибок,
`medusa build` backend+frontend зелёный (админ-UI компилируется). Живой сервер+эндпоинты покрыты http-тестами;
прокликивание React-UI headless-браузером — остаточный долг (build+tsc покрывают компиляцию, UI — копия
проверенных идиом bonus-program/order-lifecycle-card; браузерную автоматизацию мешал повторный сон машины).
Контракт/Dart не трогались (admin-конфиг вне контракта). **Модуль `documents` закрыт (4/4 подзадачи).**

## 2026-07-21 — Модуль `reviews`: дизайн + модуль (подзадача 1)
**Решение:** новый модуль `reviews` (ключ `reviews`) — отзывы (рейтинг поставщика и доставки РАЗДЕЛЬНО, ТЗ) и
диспуты «проблема с заказом». Домен полностью кастомный (в ядре нет). Модели: `Review` (`target`
supplier|delivery, `rating` 1..5, `comment`, `status` published|hidden) и `Dispute` (`category`, `description`,
`status` open→in_review→resolved|rejected, `resolution`). `order_id`/`customer_id` — опазные ссылки-колонки
(НЕ FK/link, модули order/customer не импортируем): сервису они нужны сами — инвариант «один отзыв на
(заказ, покупатель, target)», «один активный диспут на заказ», агрегация рейтинга по target (идиома
`documents.order_id`). Сервис: `createReview` (границы оценки + уникальность), `setReviewStatus` (модерация),
`getRatingSummary` (среднее+кол-во ТОЛЬКО опубликованных, округление 0.1), `openDispute` (блок второго
активного), `recordDisputeTransition` (стейт-машина). Чистая `assertDisputeTransition` — standalone-функция в
`constants.ts`, НЕ метод сервиса (правило линта `@medusajs/service-methods-must-be-async` требует async у
публичных методов; чистый валидатор держим функцией — идиома bonus `assertSpendWithinCap`).
**Право оставить отзыв/открыть диспут** (свой доставленный/закрытый заказ; доставку — только delivery) —
гейт слоя API/workflow (подзадача 2), не модели: `query.graph` по заказу и `order_lifecycle`.
**Отвергнуто:** одна строка `Review` на заказ с двумя полями рейтинга (supplier/delivery) — раздельные
строки по `target` чище для агрегации и модерации по объекту; module link review↔order как единственная
связь (сервис не смог бы проверять уникальность/агрегировать без второго запроса — как в documents);
метод `assertDisputeTransition` на классе сервиса (падает `service-methods-must-be-async`).
**Верификация:** 7 тестов модуля (`reviews.spec.ts`: создание отзыва, границы оценки, уникальность на
(заказ,покупатель,target) + оба target, сводка по опубликованным, открытие диспута + блок второго активного,
стейт-машина + запрет из терминального, новый диспут после закрытия); tsc обоих tsconfig чистый, lint 0
ошибок, миграция `Migration20260721045616` прогнана, приложение с модулем поднимается (http-спек 4/4). API
не менялся → контракт/Dart не трогали. Подзадачи 2 (API+workflows) и 3 (админ-UI) — в docs/modules/reviews.md.

## 2026-07-21 — Модуль `reviews`, подзадача 2a: store API + workflows (отзыв/диспут покупателя)
**Решение:** тонкие store-роуты → workflows, гейт права — в шаге через query.graph (модуль reviews заказ не знает).
- `POST/GET /store/orders/:id/reviews` — оставить/читать свои отзывы. Workflow `create-review`: шаг
  `validate-review-eligibility` (заказ принадлежит покупателю И `order_lifecycle.status` ∈ delivered|closed;
  `target=delivery` — только если `delivery_method=delivery`, у pickup/counter доставки не было) → `create-review`
  (сервис: границы 1..5 + уникальность на (заказ,покупатель,target); компенсация удаляет) → событие `review.created`.
- `POST/GET /store/orders/:id/disputes` — открыть/читать свои диспуты. Workflow `open-dispute`: шаг
  `require-own-order` (диспут можно на ЛЮБОЙ свой заказ, в т.ч. до доставки — напр. «не доставлен») → `open-dispute`
  (сервис: блок второго активного) → событие `dispute.opened`. Отдельный гейт от review (у диспута нет «доставлен»).
- Роуты под `/store/orders*` — auth customer автоматически; владение читается гейт-шагом (чужой → 404).
  Сериализаторы `api/utils/serialize-review.ts`. Subscriber-заглушки `review-created`/`dispute-opened`.
**Отвергнуто:** проверять право в роуте до workflow (гейт — часть транзакции workflow, компенсируется вместе с
созданием); хелпер requireOwnOrder из api/store/orders для диспута (нужен шаг workflow, а не http-хелпер — гейт
внутри workflow-графа); единый гейт для отзыва и диспута (у отзыва требование «доставлен», у диспута — нет).
**Верификация:** 6 http-тестов (`reviews-routes.spec.ts`: отзыв на недоставленный 400, supplier+delivery на
доставленном + дубль 400 + чтение, delivery-отзыв для pickup 400 + supplier ok, чужой заказ 404; диспут open +
второй активный 400 + чтение, чужой 404); tsc обоих tsconfig чистый, lint 0 ошибок; контракт 106 путей/666 схем/7
фрагментов (+2 пути, +8 схем), Dart 32 клиента, flutter analyze 0 проблем. Полный http-набор не перегонялся —
роуты аддитивны (новые под-ресурсы заказа), события reviews.* эмитят только новые workflows. Подзадача 2b (admin) —
следующая.

## 2026-07-21 — Модуль `reviews`, подзадача 2b: admin API + workflows (модерация + очередь диспутов)
**Решение:** admin-роуты поверх сервиса/workflows. `GET /admin/orders/:id/reviews` (все отзывы, вкл. скрытые — для
модерации) + `GET /admin/orders/:id/disputes` (namespace не перекрывает ядровые :id/{cancel,complete}). Сводка
`GET /admin/reviews/summary` (supplier+delivery через `getRatingSummary`, только опубликованные). Модерация
`POST /admin/reviews/:id/moderate` (workflow `moderate-review` — setReviewStatus с компенсацией-откатом статуса).
Очередь `GET /admin/disputes` (фильтр status, дефолт — активные open+in_review, FIFO, пагинация; фильтр query
парсится в роуте — лёгкий admin-список, без validateAndTransformQuery). Ведение `POST /admin/disputes/:id/transition`
(workflow `transition-dispute` → recordDisputeTransition с компенсацией + событие `dispute.status_changed` +
subscriber-заглушка). Admin-сериализаторы (`serializeReviewForAdmin`/`serializeDisputeForAdmin`) добавляют customer_id.
OAS в НОВОМ фрагменте `admin/reviews/reviews.oas.json` (генератор мерджит по путям — сюда попали и order-sub-ресурсы).
**Отвергнуто:** отдельный /admin/reviews/:id GET (не нужен — модерация по order-списку); validateAndTransformQuery для
очереди диспутов (ручной парсинг проще для 3 параметров, прецедент order-lifecycles допускал бы, но тут меньше полей).
**Верификация:** reviews-routes.spec.ts дополнен 2 admin-тестами (всего 8/8: список отзывов+модерация+сводка
до/после скрытия; очередь диспутов+стейт-машина open→in_review→resolved+запрет из терминального 400); tsc обоих
tsconfig чистый, lint 0 ошибок; контракт 112 путей/677 схем/8 фрагментов (+6 путей, +11 схем), Dart 32 клиента,
flutter analyze 0 проблем. Полный http-набор не перегонялся — роуты аддитивны, событие dispute.status_changed эмитит
только новый workflow. Подзадача 3 (админ-UI) — следующая; после неё модуль reviews закрыт.

## 2026-07-21 — Модуль `reviews`, подзадача 3 (последняя): админ-UI (МОДУЛЬ ГОТОВ)
**Решение:** очередь диспутов + модерация отзывов + widget на заказе — модуль `reviews` закрыт.
- **Очередь диспутов** `admin/routes/disputes/page.tsx` — идиома `routes/order-queue`: копия внутреннего
  DataTableFilter ядра (чип Status → «Add filter» → «Clear all»), статус точкой (dotClass), server-side фильтр
  status (дефолт — активные open+in_review), пагинация. Диспут НЕ имеет ядровой страницы (в отличие от заказа) →
  клик по строке открывает drawer ведения, а не навигацию.
- **Drawer ведения** `components/dispute-transition-drawer.tsx` — кнопки доступных переходов (по
  `DISPUTE_TRANSITIONS` из lib, сервер перепроверяет) + резолюция ОБЯЗАТЕЛЬНА при resolved/rejected. Reopen из
  терминальных недоступен (кнопок нет).
- **Widget** `admin/widgets/order-reviews-card.tsx` (`order.details.after`): отзывы заказа с модерацией
  hide/publish в «...»-меню, диспуты заказа (клик → тот же drawer), глобальная сводка рейтинга (supplier/delivery)
  в шапке. Хук `hooks/use-reviews.ts` (мутации moderate/transition, инвалидируют order-reviews/order-disputes/
  dispute-queue/review-summary). Типы/meta продублированы в `admin/lib/reviews.ts` (браузерный бандл код модуля
  не импортирует).
**Отвергнуто:** навигация с очереди на «страницу диспута» (её нет — диспут не ядровая сущность; ведём в drawer);
общий вынесенный DataTableFilter-компонент (ядро его не экспортирует, все очереди копируют разметку — companies/
order-queue/product-moderation; так и здесь). Контракт/Dart не трогали — admin-UI только для веб-админки.
**Верификация:** tsc обоих tsconfig чистый, lint 0 ошибок, `medusa build` backend+frontend зелёный (админ-UI
компилируется). Живой сервер+эндпоинты покрыты http-тестами reviews-routes (8/8, подзадачи 2a/2b);
headless-прокликивание React-UI — остаточный долг (build+tsc покрывают компиляцию, UI — копия проверенных идиом
order-queue/order-lifecycle-card; браузерную автоматизацию мешал сон машины). **Модуль `reviews` закрыт (1+2a+2b+3).**

## 2026-07-21 — Модуль `scoring`: дизайн + модуль (подзадача 1)
**Решение:** новый модуль `scoring` (ключ `scoring`) — рейтинг юрлица (балл 0..100) и вычисляемый лимит отсрочки
(ТЗ 4.7). Правила НАСТРАИВАЕМЫЕ — конфиг-singleton `ScoringConfig` (веса/потолки компонентов балла + маппинг
балла→лимит; идиома BonusConfig/DocumentSetting, `getOrCreateConfig` с дефолтами). `ScoreCard` — карточка на
компанию: `company_id` опазной колонкой (НЕ FK/link — сервису нужен для upsert/выборки, идиома documents/reviews),
`score`, `credit_limit` (вычисленный), `manual_limit` (ручная корректировка продавца, перекрывает вычисленный),
`reserved` (занятая постоплатой часть), `components` json (разбивка для карточки продавцу), `note` (аудит, ТЗ 5.3).
Чистые `calculateScore` (взвешенная сумма orders/volume/tenure с потолками − штраф за возвраты, clamp 0..100) и
`scoreToLimit` (порог → линейно с потолком) — standalone-функции в constants (не методы: `service-methods-must-be-async`;
идиома bonus). Сервис: getOrCreateConfig, upsertScoreCard (пересчёт+сохранение, ручной лимит не трогает), setManualLimit
(override/сброс), availableCredit (эффективный − reserved). Входные факторы (`ScoringInputs`) собираются СНАРУЖИ
(workflow/джоба, подзадача 2) из истории компании — модуль заказы/компанию не знает.
**КЛЮЧЕВОЕ:** постоплата юрлиц в чекауте ОТЛОЖЕНА (payment-kaspi backlog) → MVP scoring = вычислить+хранить+показать
балл/лимит (DOMAIN 4.7 «продавец видит карточку рейтинга перед одобрением отсрочки»); применение лимита к оплате +
движение `reserved` — подзадача 2, когда постоплата включается. MVP-объём факторов/весов вынесен владельцу на ревью
(открытые вопросы в scoring.md).
**Отвергнуто:** хардкод формулы скоринга (ТЗ требует настраиваемости — веса в конфиге); module link company↔score_card
как единственная связь (сервис не смог бы upsert-ить по компании без второго запроса — как documents); история платежей
как фактор сейчас (постоплаты нет — данных о просрочках нет; добавится с постоплатой); отдельная модель аудита лимитов
(для MVP — поле note; полноценный лог при необходимости позже).
**Верификация:** 6 тестов модуля (`scoring.spec.ts`: чистые функции — потолки/штраф/clamp + порог/маппинг лимита;
singleton конфига; upsert одной карточки на компанию + пересчёт; ручной лимит перекрывает вычисленный + сброс;
неизвестная компания → 0); tsc обоих tsconfig чистый, lint 0 ошибок, миграция `Migration20260721054338` прогнана,
приложение с модулем поднимается (http-спек 4/4). API не менялся → контракт/Dart не трогали. Подзадачи 2/3 — в scoring.md.

## 2026-07-21 — Модуль `scoring`, подзадача 2a: admin API (конфиг + карточка + ручной лимит)
**Решение:** admin-роуты поверх сервиса/workflows. `GET/POST /admin/scoring-config` (настраиваемые правила, workflow
`update-scoring-config` с компенсацией-откатом, идиома bonus-config; bigNumber-поля наружу числами). `GET /admin/
companies/:id/scorecard` (карточка + `availableCredit`; нет карточки → нулевая, не 404 — скоринг мог ещё не считаться).
`POST /admin/companies/:id/scorecard/limit` (ручная корректировка `setManualLimit` + note, workflow
`set-company-credit-limit` с компенсацией: откат прежних manual_limit/note или удаление созданной карточки + событие
`scoring.limit_changed` для аудита ТЗ 5.3 + subscriber-заглушка). company_id — не FK (опазная колонка scoring), поэтому
роут карточки работает с любым company_id, реальная компания не требуется. **Контракт/Dart НЕ трогали** — admin-конфиг
только для веб-админки (прецедент bonus-config).
**Отвергнуто:** 404 на карточку несуществующей компании (нулевая карточка удобнее для UI — «скоринг не считался»);
тонкий роут прямо в сервис без workflow (правило «роут → workflow», + компенсация ручного лимита).
**Верификация:** 5 http-тестов (`scoring-routes.spec.ts`: конфиг дефолты+частичный апдейт+reread, порог вне диапазона
400; нулевая карточка неизвестной компании; ручной лимит set→available+сброс→0; отрицательный лимит 400); tsc обоих
tsconfig чистый, lint 0 ошибок. Полный http-набор не перегонялся — роуты аддитивны, событие scoring.limit_changed
эмитит только новый workflow. Подзадача 2b (пересчёт из истории компании) — следующая; 2c (постоплата) — отложена.

## 2026-07-21 — Модуль `scoring`, подзадача 2b: пересчёт рейтинга из истории компании
**Решение:** сбор факторов и пересчёт — в workflow-слое (модуль scoring заказы/компанию не знает). Шаг
`gather-company-scoring-inputs`: query.graph по link company↔order (+ вложенный `order_lifecycle.status`) даёт заказы
компании и их статусы; завершённые = delivered|closed (кол-во + сумма — суммы через СЕРВИС order, т.к. query.graph не
отдаёт BigNumber-тоталы надёжно, идиома get-order-items), штраф = canceled|returned; tenure из `company.created_at`
(new Date() в шаге допустим — ограничение Date только для Workflow-tool-скриптов, не для medusa-workflow-шагов).
Workflow `recompute-company-scoring` (gather → upsert-score-card с компенсацией → событие `scoring.recomputed`).
Триггеры: джоба `jobs/recompute-scoring.ts` (крон `0 3 * * *` по approved-компаниям — актуализирует tenure без событий)
+ событийный `subscribers/recompute-scoring-on-order-closed.ts` (на `order_lifecycle.status_changed` to=closed →
пересчёт компании заказа по link; заказы физлиц без company игнорируются). Пересчёт идемпотентен (upsert одной карточки).
**Отвергнуто:** подписка на закрытие для tenure недостаточна (растёт без событий) → крон-страховка; хранить историю
факторов помесячно (MVP — только текущая карточка); фильтровать заказы по company_id в query.graph со стороны order
(link читается надёжнее со стороны company.orders).
**Эмпирика:** при быстрых последовательных lifecycle-переходах в тесте асинхронный подписчик documents-waybill
(issue-order-document) иногда ловит «Transaction query already complete» — фоновый шум после закрытия тест-транзакции
(как «Connection ended unexpectedly» в documents-тестах), тест не роняет; в проде переходы разнесены во времени.
**Верификация:** 2 http-теста (`scoring-recompute.spec.ts`: балл из 1 завершённого заказа [orders-компонент 5, лимит 0
ниже порога]; штраф за отмену → clamp 0 + счёт только завершённых); tsc обоих tsconfig чистый, lint 0 ошибок. Полный
http-набор не перегонялся — пересчёт внутренний (workflow/джоба/subscriber), API не менялся, событие scoring.recomputed
эмитит только новый workflow. Подзадача 3 (админ-UI) — следующая; 2c (постоплата) — отложена.

## 2026-07-21 — Модуль `scoring`, подзадача 3: админ-UI (MVP модуля готов)
**Решение:** Settings-страница настраиваемых правил `admin/routes/settings/scoring-rules/page.tsx` + drawer
`scoring-config-drawer.tsx` (идиома bonus-program: секция «метка—значение» + Edit-drawer, 11 числовых полей; данные
`GET/POST /admin/scoring-config`). Карточка рейтинга/лимита — блок «Credit scoring» на НАШЕЙ странице компании
`routes/companies/[id]/page.tsx` (не widget: company — кастомная сущность, ядровой detail-зоны для widget'а нет),
показывает балл/вычисленный+ручной+свободный лимит (`GET /admin/companies/:id/scorecard`) + drawer ручной корректировки
`credit-limit-drawer.tsx` (`POST .../scorecard/limit`, пусто=сброс). Типы/поля — `admin/lib/scoring.ts` (дубль из модуля,
браузерный бандл). Контракт/Dart не трогали (admin-UI).
**Отвергнуто:** widget в зоне company.details.after (у company нет ядровой страницы/зоны — сущность кастомная);
отдельная страница рейтинга (данные компании логичнее на её же странице).
**Верификация:** tsc обоих tsconfig чистый, lint 0 ошибок, `medusa build` backend+frontend зелёный (админ-UI
компилируется). API-роуты покрыты http-тестами scoring-routes (2a). Headless-прокликивание — остаточный долг (build+tsc
покрывают компиляцию, UI — копия идиом bonus-program/companies). **Модуль `scoring` готов по MVP: 1+2a+2b+3;
подзадача 2c (применение лимита к постоплате + reserved) отложена вместе с включением постоплаты юрлиц (payment-kaspi).**

## 2026-07-21 — Модуль `estimator`: дизайн + модуль (подзадача 1, MVP без ИИ)
**Решение:** новый модуль `estimator` (ключ `estimator`) — расчёт материалов по нормативной базе. Реализован
«упрощённый первый шаг» ТЗ 7: РУЧНОЙ ввод параметров (площадь/объём/длина) + АДМИНИСТРИРУЕМАЯ нормативная база →
количества. ИИ-распознавание файлов (Claude API) и STT (kk-KZ) — ОТЛОЖЕНЫ отдельным этапом (ТЗ + DECISIONS 2026-07-10).
Модели: `MaterialNorm` (администрируемый справочник: code/work_type/material_kind/base[area|volume|length|count]/
consumption_per_unit/unit/active — не хардкод, ТЗ 7), `Estimate` (customer_id опазной колонкой nullable, source
manual|file|voice, status draft|calculated, params json, file_id для будущего распознавания, hasMany lines),
`EstimateLine` (material_kind/quantity/unit/norm_code + подборка segment/product_id/unit_price/total, belongsTo).
Чистые `calculateMaterialQuantity` (расход×измеритель по базе; volume из area×height; ceil 2 знака) и
`buildEstimateLines` (отсев нулевых) — standalone в constants (правило service-methods-must-be-async). Сервис:
getActiveNorms, createManualEstimate (по активным нормативам от параметров → Estimate+строки). Результат
рекомендательный; подборка товаров/цен/остатков по сегментам + API + справочник-UI — подзадача 2.
**Отвергнуто:** старт с ИИ-распознавания (ТЗ явно рекомендует сначала ручной путь; ИИ — отдельный этап, нужны ключи/
бюджет); хардкод норм расхода (ТЗ требует администрируемости); work_type/material_kind как enum (справочник ведёт
админ — свободные строки); привязка нормы к SKU в модели (норма описывает вид материала; сопоставление с товаром — при
подборке в подзадаче 2, с учётом сегмента/остатков).
**Верификация:** 6 тестов модуля (`estimator.spec.ts`: чистый расчёт по базам area/volume/count + ceil + нет измерителя;
неизвестная база; сборка строк с отсевом нулевых; ручной расчёт со строками из всех/выбранных нормативов; пустые
измерители → 0 строк), tsc обоих tsconfig чистый, lint 0 ошибок, миграция `Migration20260721061739` прогнана,
приложение с модулем поднимается (http-спек 4/4). API не менялся → контракт/Dart не трогали. Подзадачи 2/3 — в estimator.md.

## 2026-07-21 — Модуль `estimator`, подзадача 2a: store API + подборка по сегментам
**Решение:** сопоставление material_kind↔каталог — через `category_id` норматива (владелец «сам решай» → выбран
явный маппинг по категории: точно, надёжно, админ задаёт категорию у нормы). Добавлена колонка `category_id`
(nullable) в MaterialNorm. `POST /store/estimates` (расчёт по ручным параметрам, workflow `create-estimate` с
компенсацией; ГОСТЬ допускается — customer_id опционален, калькулятор рекомендательный) + `GET /store/estimates/:id`
(доступ по id, без владения — нет чувствительных данных) + `GET /store/estimates/:id/suggestions?currency_code=`
(read: по категории норматива query.graph берёт published-товары, группирует по `product_card.segment`, на каждый
сегмент — самый дешёвый вариант в валюте [variants.prices] + наличие [сумма stocked−reserved по уровням > 0];
total = количество × цена). Позиции без category_id — без опций. Сегменты можно смешивать при выборе на клиенте.
**Отвергнуто:** поиск по названию/тексту (ложные совпадения), тег/metadata товара (требует тегирования каждого
товара) — оба хуже явного маппинга по категории; полный pricing-context расчёт цены (для MVP-подборки достаточно
цены варианта в валюте из price set); авторизация покупателя на калькуляторе (расчёт рекомендательный, гость ок).
**Верификация:** 3 http-теста (`estimator-routes.spec.ts`: расчёт с количествами; подборка economy/comfort с ценами/
итогами/наличием; 404 на несуществующий расчёт); tsc обоих tsconfig чистый, lint 0 ошибок; контракт 115 путей/684
схемы/9 фрагментов (+3 пути, +7 схем), Dart, flutter analyze 0 проблем. Полный http-набор не перегонялся — роуты
аддитивны, без событий/подписчиков. Подзадача 2b (admin CRUD нормативов + UI) — следующая; 3 (ИИ) — отложена.

## 2026-07-21 — Модуль `estimator`, подзадача 2b: admin API + справочник-UI нормативов (MVP модуля готов)
**Решение:** `GET /admin/material-norms` + `POST` (upsert по code — существует обновить, иначе создать; workflow
`upsert-material-norm` с единой формой компенсации: created+id+previous, без union-ветвей чтобы не ломать вывод типов
createStep) + `DELETE /admin/material-norms/:id` (workflow `delete-material-norm` с компенсацией-воссозданием — мутация
в workflow, а не в роуте, по правилу no-service-mutations-in-api-route). Settings-страница `material-norms/page.tsx`
(таблица + drawer create/edit; категория выбирается Select'ом из ядрового `GET /admin/product-categories`; base Select,
active Switch). Типы — `admin/lib/estimator.ts`. Контракт/Dart НЕ трогали (admin-only справочник, прецедент bonus-config).
**Отвергнуто:** прямой service.delete в DELETE-роуте (ловит lint no-service-mutations-in-api-route → workflow);
union-ветви данных компенсации в upsert-шаге (ломали вывод типов — свёл к единой форме); сохранение выбора опции
подборки на EstimateLine (не критично для MVP — отложено).
**Верификация:** 3 http-теста (`material-norms-routes.spec.ts`: upsert по code create→update + список; consumption≤0 →
400; delete + 404 на неизвестный id); tsc обоих tsconfig чистый, lint 0 ошибок, `medusa build` backend+frontend зелёный.
Полный http-набор не перегонялся — роуты аддитивны. Headless-прокликивание UI — остаточный долг. **Модуль `estimator`
готов по MVP: 1+2a+2b; ИИ-подзадача 3 (распознавание файлов Claude API + STT) отложена (ключи/бюджет, отдельный этап).**

## 2026-07-21 — Модуль `logistics`: дизайн-проект (реализация ждёт ОК владельца по MVP-объёму)
**Решение:** расширен дизайн-стаб `docs/modules/logistics.md` до полного проекта с ПРЕДЛОЖЕННЫМИ границами MVP —
чистый дизайн, кода нет (прецедент payment-kaspi подзадача 0). Ключевые проектные решения (на ревью владельцу):
- `logistics` НЕ дублирует ядро/order-lifecycle: fulfillment/shipment/markDelivered и статусы in_delivery/delivered/
  delivery_code уже есть; logistics добавляет исполнительный слой водителя ПОД жизненным циклом (рейсы/точки/GPS).
  Отметка «выдано» на точке рейса триггерит существующий `deliver-order` (код получения переиспользуется).
- Модели-предложение: `Trip`, `TripStop` (delivery|return_pickup, proof фото/подпись, checklist возврата),
  `DeliveryTariff` (администрируемая сетка зона+вес/объём, чистый расчёт), `GpsPing` (координаты, TTL/сэмплирование).
- **Предложено отложить за MVP:** realtime-канал GPS (SSE/WebSocket) + живая карта → MVP отдаёт позицию polling'ом;
  оптимизация маршрута (ручной порядок); партнёрская логистика (Фаза 2, за интерфейсом); пуши (общий notification).
- Открытые вопросы владельцу: границы MVP (особенно GPS polling vs realtime), водитель = ядровый user или своя
  сущность (связано с гэпом ролей сотрудников), провайдер карт + хранение трека, модель тарифных зон.
**Отвергнуто (для MVP):** сразу realtime-GPS+карта (тяжёлая инфра/выбор канала — отложено на шаг после базового рейса);
своя платёжная/fulfillment-подсистема (переиспользуем ядро); старт реализации без подтверждения объёма (домен крупный,
пересекается с driver-app и ролями — риск переделок).
**Верификация:** дизайн-док согласован с существующими модулями (order-lifecycle in_delivery/delivered/delivery_code,
ядровый fulfillment). Кода/тестов нет — чистый дизайн. Реализация (подзадачи 1–3 в logistics.md) — после ОК владельца.

## 2026-07-21 — POS гэп 3 сверки: привязка покупателя к counter-заказу по телефону
**Решение:** `POST /admin/counter-carts` принимает опциональный `phone`. Шаг `resolve-counter-cart-customer`
(в create-counter-cart, ПЕРЕД createCart): по телефону находит покупателя (query.graph по customer.phone —
сервисный фильтр по phone недоступен) либо заводит гостевого (has_account:false; Medusa требует email — при
отсутствии синтезируем `pos+<digits>@marketplace.local`, уникален на телефон); возвращает customer_id+email,
которые уходят в createCart (customer_id явно + email покупателя). Компенсация удаляет ТОЛЬКО заведённого здесь
покупателя. Так POS-заказ привязывается к покупателю (ЛК/бонусы), а не остаётся анонимным.
**Эмпирика:** ядровый createCartWorkflow сам делает find-or-create customer по email (findOrCreateCustomer) —
поэтому customer_id у корзины есть ВСЕГДА (даже без телефона: fallback-гость по служебному email). Смысл гэпа 3
именно в привязке по ТЕЛЕФОНУ (реальный покупатель), а не в самом факте наличия customer_id — тесты проверяют, что
с телефоном у customer проставлен этот phone и повторная продажа переиспользует того же покупателя.
**Отвергнуто:** listCustomers({phone}) сервисом (FilterableCustomerProps не содержит phone → query.graph); создание
customer без email (email обязателен у Medusa-customer → синтетический плейсхолдер); привязка на этапе counter-order
(логичнее на создании корзины — customer_id доезжает до заказа через completeCart).
**Верификация:** counter-carts.spec.ts дополнен 2 тестами (11/11: заведение по телефону + переиспользование того же
покупателя при повторной продаже; без телефона — гость без нашего телефона); tsc обоих tsconfig чистый, lint 0 ошибок;
контракт перегенерирован (`phone` в AdminCreateCounterCart, 115 путей/684 схемы), Dart, flutter analyze 0 проблем.
Гэпы сверки partner-раунда: закрыты 1/2/3/4/5/8; открыты 6 (пуши), 7 (роли сотрудников).

## 2026-07-21 — Витрина: локализация UI (i18n) — каркас (подзадача 1)
**Решение:** локализация UI-СТРОК витрины (ru основной, kk, en) — СЛОВАРНЫЙ подход, НЕ next-intl (лёгкий, без
миграции роутинга стартера; CLAUDE.md допускал «next-intl или аналог»). Каркас `storefront/src/lib/i18n/`:
`config.ts` (Locale ru|kk|en, DEFAULT_LOCALE=ru), `messages/{en,ru,kk}.ts` (en — канонический, `Messages=typeof en`
без as const → строковые типы; ru/kk типизированы Messages, соответствие структуры проверяет tsc), `dictionaries.ts`
(getMessages, статические импорты), `resolve-locale.ts` (локаль из cookie `_medusa_locale` — переиспользует готовый
locale-actions; дефолт ru), `i18n-context.tsx` (клиентский I18nProvider + useMessages/useLocale). Провайдер сидируется
в КОРНЕВОМ `app/layout.tsx` (сделан async, читает cookie) — покрывает все страницы (main+checkout) одним изменением;
`<html lang>` от локали. Переключатель `modules/layout/components/language-switcher` (updateLocale + router.refresh) в
футере. Демонстратор — локализован свой компонент `checkout/components/bonus-form`. Покрытие остальных экранов —
инкрементально, экран за экраном (расширять словари).
**Отвергнуто:** next-intl/route-based локаль (тяжёлая миграция [countryCode]-роутинга; locale UI ≠ регион/страна —
это cookie, не путь); локаль из countryCode (kz-регион ≠ казахский язык — покупатель в KZ чаще пишет по-русски);
динамический import словарей (малы — статика проще). Отделено от бэкенд-контентной локали (`x-medusa-locale`,
`/store/locales`, cart.locale — ортогонально, про переводы контента с бэкенда).
**Верификация:** `next lint` чистый (только upstream react-hooks предупреждения стартера, мои файлы чисты), tsc
изменённых файлов чистый (в стартере есть pre-existing tsc-ошибки — не мои). Живой e2e/`next build` — остаточный долг
(нужен бэкенд+dev-сервер; при сне машины ненадёжно). Паттерн зафиксирован в storefront/CLAUDE.md для след. экранов.

## 2026-07-21 — Mobile buyer: старт трека паритета; фундамент ui_kit (дизайн-система)
**Контекст:** владелец выбрал направление после завершения локализации витрины — паритет `mobile/apps/buyer`
с витриной (каталог→товар→корзина→чекаут→аккаунт). Приложение было чистым скаффолдом (buyer/lib=Hello World;
`core`/`ui_kit` — заглушки `Calculator`; `api_client` сгенерирован). Все приложения по CLAUDE.md строятся ТОЛЬКО из
`ui_kit` — поэтому первый слайс — фундамент дизайн-системы.
**Решение:** `packages/ui_kit` наполнен токенами и темой Material 3. По файлу на сущность (глобальное правило
«один файл = одна сущность»): `app_colors.dart`, `app_spacing.dart` (база 4px), `app_radius.dart`,
`app_typography.dart`, `app_theme.dart` (`buildAppTheme()` → `ThemeData`). Холдеры токенов — `abstract final class`
со статикой (нельзя инстанцировать/наследовать). БЕЗ barrel-файла: удалён `ui_kit.dart`, консюмеры импортируют
конкретные файлы (`package:ui_kit/app_theme.dart`) — прямое следствие правила «без реэкспортов». Токены ПРОВИЗОРНЫЕ
(нейтральная палитра, синий primary `#2563EB`, шрифт Roboto) — помечены в доках как подлежащие уточнению после
дизайн-хэндоффа (тот блокирован для partner; buyer-дизайн отдельно не блокировался — бутстрапим дефолтами).
**Отвергнуто:** barrel `ui_kit.dart` с реэкспортами (запрещён правилами); `lib/src/`-приватная раскладка
(избыточно для дизайн-системы, консюмерам нужен прямой импорт токенов); тема «встык» в приложениях (нарушает
«только из ui_kit»).
**Верификация:** `flutter pub get` ок; `dart format --set-exit-if-changed packages/ui_kit` чист; `flutter analyze
packages/ui_kit` — «No issues found»; `flutter test` (ui_kit) — 2/2 зелёные (тема M3 + токены). Изоляция: только
mobile, TS/витрина не читались, `api_client` не редактировался.

## 2026-07-21 — Mobile core: Riverpod без кодогена (вынужденно) + обнаружен блокер api_client
**Контекст:** итерация 2 mobile buyer — фундамент `core` (конфиг, Dio, провайдер `MedusaStoreApi`). CLAUDE.md
предписывает Riverpod в ГЕНЕРАТОРНОМ синтаксисе (`@riverpod` + build_runner).
**Решение (отступление от правила, обоснованное):** используем ОБЫЧНЫЕ провайдеры `flutter_riverpod ^2.6.1`
(`final xProvider = Provider((ref) => ...)`), БЕЗ `riverpod_generator`/build_runner. Причина — неразрешимый конфликт
версий в общем workspace-резолве: сгенерированный `api_client` пинит `json_serializable 6.14.0` → требует
`analyzer >=10 <14` и `source_gen ^4.1.2`; при этом `riverpod_generator 2.x` требует `source_gen ^2.0.0`, а `3.x` —
`analyzer >=7 <9`. Ни одна доступная версия генератора Riverpod не совместима с тулчейном кодогена api_client.
Плюс — `import 'package:api_client/api_client.dart' show MedusaStoreApi` в `medusa_api_provider.dart`: имя `Provider`
одновременно объявлено в Riverpod и в моделях api_client (`models/provider.dart`) → `show` снимает неоднозначность.
**Отвергнуто:** апгрейд до Riverpod 3.x (тянет `analyzer <9`, всё равно конфликт); даунгрейд api_client-тулчейна
(нельзя — файлы генерируются, ветку версий диктует свежая спека); ручной кодоген .g.dart (запрет на правку api_client).
Если генераторный синтаксис станет обязателен — потребуется согласованный апгрейд связки analyzer/source_gen во всём
mobile-workspace (когда выйдут совместимые версии). Пока обычные провайдеры — эквивалентны по возможностям для
инфраструктурных провайдеров.
**Обнаружен БЛОКЕР (записан в docs/STATE.md → «Известные проблемы»):** `api_client` НЕ КОМПИЛИРУЕТСЯ —
`OrdersClient.getOrdersIdDocuments` объявлен дважды (admin + store order-documents делят `operationId`
`GetOrdersIdDocuments` в контракте). Фикс — уникальный operationId store-роуту в backend-OAS + регенерация. Блокирует
весь mobile-трек (всё, что импортирует api_client). Разблокировщик — следующая задача.
**Верификация core (частичная):** `dart format --set-exit-if-changed` чист, `flutter analyze packages/core` —
«No issues found». Тест core НЕ прогнан (падает на компиляции api_client, не из-за кода core).
