# Модуль `order-status` — жизненный цикл заказа + workflow `placeOrder`

**Статус:** проектирование; реализуется подзадачами (см. низ файла и бэклог `docs/STATE.md`).
**Код (по мере реализации):** `backend/src/modules/order-status/`, `backend/src/links/order-order-status.ts`,
`backend/src/workflows/place-order.ts` (+ переходы), `backend/src/subscribers/order-status-changed.ts`,
`backend/src/api/store/orders/`, `backend/src/api/admin/orders/`, `backend/src/admin/routes/orders/`.

## Назначение
Корзина, заказ, оплата, fulfillment, резерв остатков — всё это ЯДРО Medusa (не переизобретаем).
ТЗ вводит СВОЙ жизненный цикл заказа, которого в ядре нет целиком:
`Новый → Подтверждён → В сборке → Частично/Полностью собран → В доставке → Доставлен → Закрыт`
(+ `Отменён`, `Возврат`). Модуль `order-status` хранит этот статус как **source of truth** для
клиентов и уведомлений и ведёт **лог переходов** (ТЗ: статусы заказов логируются бессрочно).
Переходы синхронизированы с ядровыми операциями (fulfillment/shipment/complete/cancel).

Имя модуля — `order-status` (ключ `order_status`), НЕ `order`: ключ `order` занят ядровым
модулем заказов (`Modules.ORDER`), коллизия ломает контейнер.

## Что закрывает ядро Medusa (не переизобретаем)
- **Корзина → заказ + резерв остатков** — `completeCartWorkflow` (создаёт order, внутри
  `reserveInventoryStep` резервирует inventory по складам). `placeOrder` оборачивает именно его.
- **Fulfillment / отгрузка / доставка** — `createOrderFulfillmentWorkflow` (сборка, в т.ч. частичная —
  указываются позиции/кол-во), `createOrderShipmentWorkflow` (отгрузка → shipped),
  `markOrderFulfillmentAsDeliveredWorkflow` (доставлено).
- **Завершение / отмена** — `completeOrderWorkflow` (pending → completed), `cancelOrderWorkflow`.
- **Ядровые статусы order** — три измерения: `status` (pending/completed/canceled/…),
  `fulfillment_status` (not_fulfilled/partially_fulfilled/fulfilled/partially_shipped/shipped/
  partially_delivered/delivered/canceled), `payment_status`. Они отражают ФИЗИКУ оплаты и fulfillment,
  но не бизнес-этапы ТЗ «Подтверждён» и «В сборке».

## Почему нужна кастомная статусная модель (сопоставление ТЗ ↔ ядро)
| Статус ТЗ | Ядро | Кастом? |
|---|---|---|
| Новый | order создан, `fulfillment_status=not_fulfilled` | статус выставляем мы (`new`) |
| **Подтверждён** | — (в ядре нет) | **только кастом** (менеджер подтвердил заявку) |
| **В сборке** | — (в ядре нет) | **только кастом** (кладовщик начал комплектацию) |
| Частично собран | `fulfillment_status=partially_fulfilled` | синхрон с ядром |
| Полностью собран | `fulfillment_status=fulfilled` | синхрон с ядром |
| В доставке | `shipped` / `partially_shipped` | синхрон (createOrderShipment) |
| Доставлен | `delivered` | синхрон (markDelivered) |
| Закрыт | `order.status=completed` (после окна возврата) | синхрон (completeOrder) |
| Отменён | `order.status=canceled` | синхрон (cancelOrder) |
| Возврат | return flow (`ReturnStatus`) — Фаза returnFlow | отдельный сценарий |

Вывод: этапы «Подтверждён»/«В сборке» ядро не знает — свой статус обязателен. Но он не дублирует
ядро: где у ядра есть операция (сборка/отгрузка/доставка/закрытие/отмена), наш переход ВЫЗЫВАЕТ
ядровый workflow и синхронно двигает свой статус. Единый статус нужен клиентам (buyer/partner) и
уведомлениям — они читают одно поле, а не склеивают три ядровых.

## Кастом: модели (link к order ядра)
`backend/src/modules/order-status/models/`:
- **`OrderStatus`** (1:1 с order ядра через link) — `status` (enum ниже, default `new`),
  `previous_status` (nullable, для удобства/уведомлений), `note` (nullable — последняя причина/комментарий).
  Relation `hasMany` → history.
- **`OrderStatusHistory`** — лог переходов (бессрочно): `from_status` (nullable для самого первого),
  `to_status`, `actor_type` (enum `buyer | seller | admin | system`), `actor_id` (nullable text),
  `reason` (nullable text). `created_at` — встроенный timestamp модели. `belongsTo` → OrderStatus.

Enum статусов (`ORDER_STATUSES`):
`new`, `confirmed`, `assembling`, `partially_assembled`, `assembled`, `in_delivery`, `delivered`,
`closed`, `canceled`, `returned`.

Link `backend/src/links/order-order-status.ts`: `order` ядра ↔ `orderStatus` (1:1), FK на order в
модели нет (правило изоляции — как `product-product-card`).

## Стейт-машина (разрешённые переходы)
Инвариант — чистая функция `assertOrderStatusTransition(from, to, method)` (в `service.ts`, тестируется
без БД и переиспользуется в шагах); применение перехода (лог + обновление статуса + проверка кода
получения) — метод сервиса `recordTransition`; сами сценарные переходы с вызовом ядровых workflow —
в `src/workflows/`. Карта переходов — на каждый способ получения (`delivery_method` фиксируется при
создании lifecycle). Путь `delivery` (полный):
```
new            → confirmed | canceled
confirmed      → assembling | canceled
assembling     → partially_assembled | assembled | canceled
partially_assembled → assembled | in_delivery | canceled   (отгрузка собранной части)
assembled      → in_delivery | canceled
in_delivery    → delivered           (только с верным кодом получения)
delivered      → closed | returned
closed         → returned            (возврат в окне 14 дней после закрытия — см. returnFlow)
canceled       → —  (терминальный)
returned       → —  (терминальный)
```
Отличия `pickup`: без `in_delivery` — выдача у окна `assembled → delivered` (без кода, по накладной);
частичной выдачи нет (`partially_assembled → assembled | canceled`).
Отличия `counter`: свёрнутый путь `new → delivered → closed` (плюс `new → canceled`); промежуточные
статусы недостижимы.

## Дополнение (2026-07-15): способы получения, приёмка, продажа у окна
Поправка владельца поверх ТЗ (см. DOMAIN.md → Заказ). РЕАЛИЗОВАНО 2026-07-16 (подзадача 5, детали —
DECISIONS 2026-07-16): `delivery_method` + `delivery_code` — поля OrderLifecycle; код выдаёт шаг
`issue-delivery-code` при отгрузке (6 цифр, виден только покупателю в store-lifecycle); проверка кода —
`assertDeliveryConfirmation` в `recordTransition`; продажа у окна — workflow `place-counter-order` +
`POST /admin/counter-orders` (+ шаг `get-order-items`); store place принимает `delivery_method`
(`delivery|pickup`).

**Способ получения** — атрибут заказа: `delivery | pickup | counter`. Влияет и на путь по стейт-машине, и на
механизм приёмки:
- `delivery` (доставка) — полный путь. Приёмку подтверждает покупатель **кодом получения**: бэкенд выдаёт код
  при `in_delivery`, переход `delivered` валиден только с верным кодом (дублируется SMS). «Передан по коду» —
  НЕ статус, а способ подтвердить `delivered`.
- `pickup` (самовывоз) — покупатель заказал онлайн, забирает у окна склада; кладовщик выдаёт, подтверждение =
  накладная/скан (код не нужен — покупатель осматривает на месте). Путь без `in_delivery`:
  `assembled → delivered` (выдача) → `closed`.
- `counter` (продажа у окна, POS) — покупатель на месте без предзаказа: продавец в partner-приложении собирает
  заказ, принимает оплату, выдаёт накладную. **Свёрнутый путь**: заказ создаётся сразу выданным
  (`new → delivered → closed`), минуя `confirmed/assembling/in_delivery`. Нужен отдельный workflow
  (`place-counter-order`) и разрешение перехода `new → delivered` для метода `counter` в стейт-машине.

Во всех случаях документы (счёт/накладная) — модуль `documents`; POS-оплата — `payment-kaspi`; покупка видна
покупателю в ЛК read-only. Прилавочная продажа — это сторона продавца: buyer-раунд дизайна её не покрывает,
partner-app POS проектируется отдельным раундом.

## Дополнение (2026-07-18): POS-корзина продавца + поиск очереди (гэпы partner-раунда)
РЕАЛИЗОВАНО (DECISIONS 2026-07-18, POS-гэпы): admin-ресурс **`/admin/counter-carts`** — корзина
продажи у окна с admin-стороны (store-роуты корзины покупательские, Kaspi там требует
customer-auth): `POST /admin/counter-carts` ({location_id, region_id?, email?} → workflow
`create-counter-cart`: ядровый createCart с контекстом склада из шага `resolve-counter-cart-context`
+ pickup-опция склада 0 ₸; метка `metadata.counter=true` — не-POS корзина по этим роутам 404);
`GET /admin/counter-carts/:id` (позиции/тоталы/сессии, хелпер `retrieveCounterCart`: тоталы —
query.graph, позиции — сервис cart, BigNumber-эмпирика); `POST .../line-items`,
`POST|DELETE .../line-items/:line_id` — ядровые cart-workflows; оплата: `POST|GET .../payment/kaspi`
(те же init/sync-workflows, что store) и `POST .../payment/cash` (workflow `init-cart-cash-payment`,
сессия `pp_system_default`; переключение Kaspi↔cash — ядро заменяет сессию коллекции). Завершение —
существующий `POST /admin/counter-orders` (в ответе `lifecycle` на момент создания — статус
перечитывать GET'ом). Очередь `GET /admin/order-lifecycles` расширена: фильтр `delivery_method`
и поиск `q` (display_id, «#» допускается; email $ilike) — вторым запросом со стороны order.
Покупатель POS гостевой (`pos@marketplace.local` или email из запроса); привязка customer по
телефону — отложенный гэп 3 сверки.

## workflow `placeOrder` (сквозной)
Обёртка вокруг `completeCartWorkflow`: корзина → ядро создаёт order + резервирует остатки →
шаг создаёт `OrderStatus=new` + link к order (компенсация — удаление) → если покупатель-сотрудник
компании, link заказа к company (для лимитов/скоринга позже) → `emitEventStep("order.placed")`.
`throwOnError: true` в роуте. Проверка остатков/склада — ядро (reserveInventory) + фильтр по городу
из каталога (availability); своего резерва не пишем.

## Переходы (workflows)
Общий шаг `record-status-transition` (валидирует переход через сервис + пишет OrderStatus и history +
emit `order.status_changed`). Поверх — сценарные workflow, дергающие ядро:
- `confirm-order` (`new → confirmed`).
- `start-order-assembly` (`confirmed → assembling`).
- `complete-order-assembly` — `createOrderFulfillmentWorkflow`; частичная сборка → `partially_assembled`,
  полная → `assembled` (по `fulfillment_status` ядра после операции).
- `ship-order` — `createOrderShipmentWorkflow` → `in_delivery`.
- `deliver-order` — `markOrderFulfillmentAsDeliveredWorkflow` → `delivered`.
- `close-order` — `completeOrderWorkflow` → `closed` (по джобе после окна возврата).
- `cancel-order` — `cancelOrderWorkflow` → `canceled`.

## События (хуки для будущих модулей)
**Реализация (подзадача 2, отступ от первоначального наброска — см. DECISIONS 2026-07-14):**
одно кастомное событие `order_lifecycle.status_changed` (namespace `order_lifecycle.*`) на КАЖДЫЙ переход,
payload `{ order_id, order_lifecycle_id, from, to, actor_type }`. Своих `order.*` НЕ эмитим — ядро уже
шлёт `order.placed` (completeCart), `order.completed` (complete), `order.canceled` (cancel); дубли/коллизии
не нужны. Хуки будущих модулей:
- «заказ размещён» → счёт (`documents`), уведомление обеим сторонам (`notification`) — подписка на
  ядровый `order.placed`.
- `order_lifecycle.status_changed` → уведомление обеим сторонам на каждом переходе (ТЗ). Сейчас
  subscriber `order-status-changed` — заглушка (notification-провайдера нет).
- «заказ закрыт» → бонус (`bonus`, после окна возврата) + скоринг (`scoring`) — подписка на
  `order_lifecycle.status_changed` с `to=closed`.

## Осознанно отложено (зависит от будущих модулей/задач)
- **Оплата** — сценарии предоплата/частичная/постоплата/Kaspi: `payment-kaspi` + payment collection в
  placeOrder. Сейчас placeOrder завершает корзину без реальной оплаты (payment_status ядра как есть).
- **Лимиты юрлица** (`SpendLimit`) при постоплате — проверка в placeOrder, когда будут payment+scoring.
- **Документы** (счёт при заказе, накладная при отгрузке) и **уведомления** (push/SMS/email) —
  модули `documents` + notification provider; сейчас только эмитим события.
- **Бонусы/скоринг** при закрытии — модули `bonus`/`scoring`.
- **fulfillment set / service zone / shipping options региона KZ** — нужны для реальной отгрузки;
  осознанно отложены при сиде KZ (DECISIONS 2026-07-14, склады+KZ). Понадобятся здесь для `ship-order`.
- **returnFlow** (Возврат, 14 дней, чек-лист водителя) — отдельный сквозной сценарий (ARCHITECTURE).

## Подзадачи (порядок реализации — бэклог в STATE.md)
1. [x] Дизайн + модуль (реализован как `order-lifecycle` — имя `order-status`/`OrderStatus` конфликтует
   с ядром, см. DECISIONS 2026-07-14): модели `OrderLifecycle`/`OrderLifecycleEvent`, сервис с инвариантом
   переходов, link 1:1 к order ядра, миграция, тесты модуля.
2. [x] `placeOrder` + переходы жизненного цикла (обёртки над ядровыми workflow) + subscriber уведомлений
   (заглушка) + событие `order_lifecycle.status_changed`. Частичная сборка внутри `complete-order-assembly`.
   Файлы: `src/workflows/place-order.ts` + `confirm-order`/`start-order-assembly`/`complete-order-assembly`/
   `ship-order`/`deliver-order`/`close-order`/`cancel-order` + шаги `steps/{create-order-lifecycle,
   record-status-transition,determine-assembly-status,resolve-order-company}` + `apply-order-transition` +
   subscriber `subscribers/order-status-changed`. Тесты — `integration-tests/http/order-lifecycle-workflows.spec.ts`.
3. [x] Store/admin API (тонкие роуты поверх workflow из подзадачи 2, не перекрывают ядровые
   роуты заказа — см. DECISIONS 2026-07-15):
   - store: `POST /store/orders` (`{cart_id}` → placeOrder), `GET /store/orders/:id/lifecycle`
     (свой статус + лог, владение через `requireOwnOrder`), `POST /store/orders/:id/cancel`;
   - admin: `GET /admin/order-lifecycles` (очередь: фильтр статуса, сортировка FIFO, пагинация;
     отдельный ресурс, НЕ переопределение ядрового `/admin/orders`), `GET /admin/orders/:id/lifecycle`
     (статус + история), переходы `POST /admin/orders/:id/lifecycle/{confirm,start-assembly,
     complete-assembly,ship,deliver,close,cancel}` (namespace `/lifecycle/` — не перекрывает
     ядровые `/admin/orders/:id/{cancel,complete}`);
   - OAS-фрагменты `store/orders/orders.oas.json` + `admin/orders/orders.oas.json`, контракт
     перегенерирован (85 путей, 630 схем, 4 фрагмента; `generate-contract.mjs` обобщён — мерджит
     новые методы на уже существующий путь `/store/orders`), Dart-клиент перегенерирован.
4. [x] Админ-UI: очередь заказов (`src/admin/routes/order-queue/` — путь `order-queue`, НЕ `orders`:
   статик `/orders` конфликтует с ядровым списком заказов; данные `GET /admin/order-lifecycles`, статус
   точкой, server-side фильтр по статусу + сортировка FIFO, поиска нет — эндпоинт очереди его не отдаёт;
   клик по строке → ядровая страница заказа) + widget `src/admin/widgets/order-lifecycle-card.tsx`
   (зона `order.details.after`): статус StatusBadge'ом, доступные из него переходы в «...»-меню (карта
   `ORDER_TRANSITIONS` в `lib/order.ts` — подмножество стейт-машины сервиса), лог переходов; позиции/
   fulfillment для сборки/отгрузки/доставки берутся из данных ядровой страницы (prop `data`), отмена —
   через диалог (необязательная причина). Общий hook `hooks/use-order-lifecycle.ts` инвалидирует наш
   статус и ядровый заказ (`["orders"]`). Демо-данные — `npx medusa exec ./src/scripts/seed-demo-order.ts`
   (3 заказа: new/confirmed/in_delivery; строит минимальную доставку KZ).
5. [x] **Способы получения + приёмка** (поправка 2026-07-15, см. «Дополнение» выше): поля
   `delivery_method`/`delivery_code` в OrderLifecycle (миграция), карта переходов на каждый метод,
   код получения для доставки (шаг `issue-delivery-code` в ship-order, проверка
   `assertDeliveryConfirmation` в `recordTransition`, код виден только покупателю), выдача самовывоза
   `assembled → delivered` без кода (ядровый markDelivered работает без shipment — проверено),
   workflow `place-counter-order` + `POST /admin/counter-orders` + шаг `get-order-items`,
   `delivery_method` в store place/lifecycle и admin lifecycle/очереди, админ-UI (метод в виджете и
   очереди, карта переходов по методу, диалог кода при вручении). Тесты: модуль 8/8, http 17/17
   (`order-delivery-methods.spec.ts` новый). Partner-app POS — отдельный дизайн-раунд.
