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
- **`OrderStatusHistory`** — лог заказа (бессрочно): `kind` (`status` — переход стейт-машины,
  `slot` — перенос окна доставки, T5.6b), `from_status` (nullable для самого первого),
  `to_status`, `actor_type` (enum `buyer | seller | driver | admin | system`; `driver` добавлен в
  T5.2b — вручение отмечает водитель-gig из своего приложения, миграция `Migration20260904121500`),
  `actor_id` (nullable text),
  `reason` (nullable text), а у записей `kind = slot` — ещё и слот до и после переноса
  (`from_slot_date`/`from_slot_window`/`to_slot_date`/`to_slot_window`, миграция
  `Migration20260906100000`). `created_at` — встроенный timestamp модели. `belongsTo` → OrderStatus.

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
После пивота 2026-07-22 единственный способ получения — `delivery` (полный путь выше). Самовывоз
(`pickup`) и продажа у окна (`counter`/POS) сняты вместе с моделью «магазин у окна».

## Способ получения (пивот 2026-07-22: только доставка)
`delivery_method` + `delivery_code` — поля OrderLifecycle. Единственное значение — `delivery`
(константа-массив `DELIVERY_METHODS` и enum модели оставлены как точка расширения). Приёмку
подтверждает покупатель **кодом получения**: шаг `issue-delivery-code` выдаёт код при отгрузке
(6 цифр, виден только покупателю в store-lifecycle), переход `delivered` валиден только с верным кодом
(`assertDeliveryConfirmation` в `recordTransition`; «передан по коду» — НЕ статус, а способ подтвердить
`delivered`). Документы (счёт/накладная) — модуль `documents`; оплата — `payment-kaspi` (Kaspi QR).

**История (снято пивотом 2026-07-22, DECISIONS):** ранее было три способа получения —
`delivery | pickup | counter`. `pickup` (самовывоз у окна, приёмка по накладной без кода) и `counter`
(продажа у окна / POS: свёрнутый путь `new → delivered`, отдельный workflow `place-counter-order` +
`POST /admin/counter-orders`, а также admin-ресурс `/admin/counter-carts` с оплатой Kaspi/наличными
`init-cart-cash-payment`) удалены целиком: файлы, роуты, workflows, схемы контракта, admin/storefront-UI
и тесты (`counter-carts.spec`, `order-delivery-methods.spec`). Продавец продаёт только через приложение
с доставкой. Фильтр `delivery_method` и поиск `q` в очереди `GET /admin/order-lifecycles` сохранены.
Легаси DB-check-constraint на колонке `delivery_method` оставлен супермножеством `('delivery','pickup',
'counter')` — безвредно (пишется только `delivery`), миграция не тянется, чтобы не упасть на возможных
старых строках в dev-БД.

## Слот доставки (T5.6)
`delivery_date` + `delivery_window` — поля OrderLifecycle (nullable): астанинские сутки
`YYYY-MM-DD` и одно из трёх окон приезда — `morning` 09:00–13:00, `day` 13:00–17:00,
`evening` 17:00–21:00 (`DELIVERY_WINDOWS` в `models/statuses.ts`). До T5.6 домен не знал, КОГДА
везти: покупатель платил и не узнавал срок (блокер №1 обеих персон-покупателей в Ф-прогоне
2026-09-02), а очередь панели показывала вместо слота адрес.

**Домен слота — `src/lib/logistics/delivery-slots.ts`** (чистые функции, без контейнера и БД):
часы окон, запас на сборку (`SLOT_LEAD_HOURS = 3` — окно, до начала которого осталось меньше, не
предлагается), горизонт выбора (`SLOT_HORIZON_DAYS = 7`), генерация доступных слотов и подписи
для чата. Время считается сдвигом `ASTANA_UTC_OFFSET_HOURS = 5`, а не `Intl` с таймзоной:
Asia/Almaty с 2024-03-01 постоянно UTC+5, а icu-данные сборки — внешняя зависимость.
Правило доступности живёт в ОДНОМ месте: слот выбирают в чате, проверяют при оформлении,
показывают в панели и в кабинете, и все четыре обязаны отвечать одинаково.

**Путь слота до заказа:** заказа во время оформления ещё нет, поэтому слот держится в метаданных
корзины (`delivery_slot_date` / `delivery_slot_window` — ключи и запись в
`src/lib/logistics/cart-delivery-slot.ts`; метаданные ядро ЗАМЕЩАЕТ целиком, поэтому пишем поверх
прочитанных). `placeOrderWorkflow` снимает их шагом `resolve-cart-delivery-slot` ДО `completeCart`
и передаёт в `createOrderLifecycleStep`. Шаг читает слот сам, а не получает аргументом, чтобы он
доезжал одинаково с обоих входов в оформление — из чата и из `POST /store/orders`. Доступность
окна на этом шаге НЕ перепроверяется: покупатель уже заплатил, и отказ оформить оплаченный заказ
из-за наступившего окна оставил бы деньги без заказа; проверяется только валидность значений.

**Кто выбирает и кто видит:** выбирает покупатель в чате — инструмент `set_delivery` без
`slot_date`/`slot_window` возвращает `available_slots` с готовыми подписями и НЕ пускает к оплате
(адрес при этом уже сохранён, повторный вызов спросит только окно). Видит: покупатель —
`GET /store/orders/:id/lifecycle` и `GET /store/order-lifecycles`, плюс `track_order` на вопрос
«когда привезут»; продавец — колонка «Доставка» очереди заказов и карточка заказа
(`slot_date`/`slot_window` в `AdminOrderCardDelivery`). После оформления слот двигает продавец —
перенос доставки описан ниже (T5.6b).

**Слот на экранах покупателя (T5.6a).** Вставка `order_status` ленты чата несёт слот теми же
кодами, что и lifecycle-роуты (`delivery_date` + `delivery_window`): готовую фразу бэкенд не
отдаёт — иначе окно приезда приходило бы по-русски и не переводилось. Подпись
«6 сент., 13:00–17:00» собирают клиенты: `storefront/src/lib/util/delivery-slot.ts` и
`mobile/apps/buyer/lib/shared/delivery_slot_label.dart` — короткие месяцы берутся из словаря
локали, часы окон лежат в таблице-зеркале `DELIVERY_WINDOW_HOURS` (меняются часы в домене —
правятся обе таблицы). Строка стоит в трёх местах: вставка «статус заказа», карточка заказа и
строка списка заказов кабинета; слота нет — строки нет (пустой подписи не показываем).

**Перенос слота (T5.6b).** Слот перестал быть неизменным: продавец двигает окно по звонку
покупателя («объект не готов, привезите в четверг утром»). Перенос — НЕ переход стейт-машины:
статус заказа не меняется, поэтому у него свой путь.

- **Домен:** `assertSlotRescheduleAllowed` + `SLOT_RESCHEDULE_STATUSES` (сервис модуля) —
  двигать можно, пока заказ не уехал: `new`, `confirmed`, `assembling`, `partially_assembled`,
  `assembled`. С `in_delivery` и дальше перенос отклоняется: машина в пути, вручение уже
  случилось или заказа нет. Метод сервиса `rescheduleDeliverySlot` пишет запись лога и обновляет
  слот; `status`, `previous_status` и `note` он НЕ трогает (`note` хранит причину последнего
  ПЕРЕХОДА — причина переноса её бы затёрла). Перенос «на то же окно» отклоняется: пустая запись
  в логе врала бы, что доставку подвинули.
- **Доступность нового окна** проверяет шаг workflow (`steps/reschedule-delivery-slot.ts`)
  функцией `parseDeliverySlot` — тем же правилом, которым чат предлагает окна покупателю. Окно,
  которого покупателю уже не предложат, продавец из панели поставить не может.
- **Workflow** `reschedule-order-delivery` (шаг + `emitEventStep`). Ядровых workflow здесь нет —
  слот наш домен, ядро о нём не знает. Компенсация возвращает прежнее окно и удаляет запись лога.
- **Событие** `order_lifecycle.slot_changed` (`{ order_id, order_lifecycle_id, from, to,
  actor_type, reason }`) — отдельное от `status_changed`: статус не менялся, а уведомить
  покупателя нужно именно о новом окне. Подписчик `subscribers/order-slot-changed.ts` — та же
  заглушка-лог, что и у переходов: notification-провайдера (push/SMS/email) на MVP нет,
  покупателю о переносе сообщает продавец голосом, а новое окно он видит в чате и кабинете.
- **API:** `GET /admin/orders/:id/lifecycle/reschedule` — доступные окна КОДАМИ + `can_reschedule`
  + текущий слот; `POST` того же адреса — перенос (`slot_date`, `slot_window`, ОБЯЗАТЕЛЬНАЯ
  `reason`). Роут стоит рядом с переходами, но не среди них: `.../lifecycle/<переход>` двигает
  статус, а перенос — нет.
- **Панель:** кнопка «Перенести доставку» в шапке блока «Доставка» карточки заказа и пункт
  «...»-меню виджета на странице заказа (обе видимости — `canRescheduleDelivery` в
  `admin/lib/order.ts`, зеркало `SLOT_RESCHEDULE_STATUSES`); диалог
  `components/reschedule-delivery-prompt.tsx` (текущее окно, выбор из списка бэкенда,
  обязательная причина, подпись «покупателю уведомление не уходит»). В логе заказа запись
  переноса рисуется своей строкой — «Доставка перенесена на 8 сент. 2026 г., 13:00–17:00» с
  прежним окном, именем сотрудника и причиной.
- **Заказу без слота** (оформлен до T5.6) окно этим же диалогом можно НАЗНАЧИТЬ — текущее
  показывается прочерком. Отдельного действия «назначить слот» не заводили: для продавца это
  одно и то же движение.
- **Чего нет:** покупатель не может попросить другое окно сам (в чате инструмента переноса нет —
  звонит продавцу), и уведомление о переносе не уходит автоматически (нет провайдера).

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

## Деньги заказа: одно состояние (T4.14a)
`placeOrder` после создания заказа СПИСЫВАЕТ платёж (`steps/capture-order-payment.ts` → ядровый
`capturePaymentWorkflow`). При QR-оплате авторизация и есть оплата, а несписанный платёж оставлял
заказу второе состояние денег: очередь показывала «Оплачен», ядровая страница того же заказа —
«Остаток к оплате», и продавцу оставалась кнопка «Получить платеж». Детали и грабли — в
`docs/modules/payment-kaspi.md`; починка заказов, размещённых до правки, —
`src/scripts/check-order-captures.ts`.

## Догон за ядром: два цикла свести в один (T4.14b)
Наш цикл вызывает ядро под собой, но ядровые эндпоинты доступны и напрямую — прямым запросом,
интеграциям и самой Medusa. Поэтому расхождение («в ядре отгружено, у нас Собран») закрыто не
запретом, а ДОГОНОМ: пять подписчиков `subscribers/sync-lifecycle-on-*.ts` на ядровые
`order.fulfillment_created` → `assembled`/`partially_assembled`, `shipment.created` → `in_delivery`,
`delivery.created` → `delivered`, `order.canceled` → `canceled`, `order.completed` → `closed`.
Каждый вызывает `workflows/sync-order-lifecycle.ts` (шаг `steps/sync-lifecycle-status.ts` +
планировщик `sync-path.ts`).

- **Путь, а не один переход.** Ядро может уйти вперёд на несколько этапов: планировщик ищет по
  стейт-машине кратчайший путь и проходит его по хопам — каждый отдельной строкой лога, актором
  `system`, с причиной-догоном. Один шаг на весь путь: число переходов заранее неизвестно, а
  workflow-sdk не умеет динамическое число шагов; компенсация откатывает путь целиком.
- **Эхо собственных workflow гасится сравнением состояний**, а не пометкой источника: наши workflow
  сами дёргают ядро и получают его событие обратно, но к тому моменту цикл уже в целевом статусе —
  путь пустой, догон молчит. Тот же механизм покрывает повтор события и гонку.
- **При равной длине путь ведётся через `assembled`, а не `partially_assembled`:** частичность —
  наша величина, ядро о ней не сообщает.
- **Цель недостижима** (цикл ушёл вперёд ядра или упёрся в терминальный статус) — предупреждение в
  лог, перехода НЕТ: видимое расхождение лучше выдуманной истории.
- **Инвариант кода получения при догоне снят осознанно** (DECISIONS 2026-09-03): код выдаётся на
  хопе `in_delivery` и подставляется на хопе `delivered`, причина в логе говорит «без кода
  получения». Проверка «кода со слов покупателя» защищает НАШ путь вручения, а не запись уже
  случившегося факта.
- **События.** Каждый догнанный хоп эмитит тот же `order_lifecycle.status_changed` (актор
  `system`) — уведомления, документы, бонус и скоринг не различают источник перехода.
- **Ядровые workflow из догона НЕ вызываются** — иначе он зациклился бы на собственных событиях.
- Тесты: юниты планировщика `modules/order-lifecycle/__tests__/sync-path.unit.spec.ts`, сквозные —
  блок `sync from core` в `integration-tests/http/order-lifecycle-workflows.spec.ts`.
- **В панели ядровых действий перехода больше нет** (T4.14c): «Выполнить заказ», «Отметить как
  отправленный» и «Отметить как доставленный» убраны со страницы заказа, ядровый адрес
  `/app/orders` открывает наш экран «Заказы». Это слой ВИДА (`src/admin/styles/shell.css` +
  `lib/shell-redirect.ts`, детали — `src/admin/README.md`), а не гарантия: целостность держит догон
  выше. Ядровая «Отмена выполнения» оставлена — она не переход цикла.

## Осознанно отложено (зависит от будущих модулей/задач)
- **Оплата** — сценарии частичной предоплаты и постоплаты юрлиц: `payment-kaspi` + payment collection
  в placeOrder. На MVP работает 100% предоплата Kaspi QR: предусловие
  `ensure-cart-payment-authorized` + списание сразу после оформления (раздел «Деньги заказа» выше).
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
     (свой статус + лог, владение через `requireOwnOrder`), `POST /store/orders/:id/cancel`,
     `GET /store/order-lifecycles` (T10.6a: стадии ВСЕХ заказов покупателя одним запросом — список
     заказов кабинета показывает бейдж стадии, а ядровый `GET /store/orders` про наш модуль не
     знает; раньше клиенты дочитывали стадию по запросу на заказ. Заказ без цикла в ответ не
     попадает — клиент рисует его без бейджа);
   - admin: `GET /admin/order-lifecycles` (очередь: фильтр статуса, сортировка FIFO, пагинация;
     отдельный ресурс, НЕ переопределение ядрового `/admin/orders`; с T4.2a — строка панели целиком
     и счётчики чипов, см. «Данные строки очереди» ниже), `GET /admin/orders/:id/lifecycle`
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
6. [x] **Пивот 2026-07-22 — только доставка**: `pickup` и `counter`/POS удалены (см. «Способ получения»
   выше). Снято: workflows `place-counter-order`/`create-counter-cart`/`init-cart-cash-payment` + их
   шаги, роуты `/admin/counter-orders` и `/admin/counter-carts/*`, схемы `AdminPlaceCounterOrder(Res)`,
   способы `pickup`/`counter` из стейт-машины (сервис + admin `lib/order.ts`), i18n-метки, pickup-опция
   в `seed-kz`, скрипт `seed-demo-delivery-methods`, тесты `counter-carts.spec`/`order-delivery-methods.spec`.
   Storefront/buyer шлют только `delivery_method=delivery`. Контракт (116 путей/691 схема) + Dart
   перегенерированы (инлайновый `order`-объект `StorePlaceOrderRes` вынесен в схему `StorePlacedOrderRef` —
   иначе коллизия имени с sort-enum `Order`). Верификация: tsc 0, lint 0 ошибок, модуль 8/8, http order 13/13,
   buyer 30/30, flutter analyze чист.
7. [x] **T4.2a — данные строки очереди для панели продавца** (экран «Заказы», макет 1b):
   `GET /admin/order-lifecycles` отдаёт заказ уже в виде готовой строки — сборка в
   `src/api/admin/order-lifecycles/rows.ts` (роут остался тонким):
   `customer_name` (компания → ФИО → email), `company_id` + `is_company` (через link-цепочку
   `customer.employee.company`), `item_count`, `total` + `currency_code`, `payment_state`
   (`paid`/`awaiting`/`canceled` — нормализация статуса платёжной сессии; подпись — в i18n клиента),
   `address` (улица + город). В ответе добавились `counts` — `total` и `by_status` по ВСЕМ статусам
   при текущих поиске/способе получения (счётчики чипов-фильтров); фильтр `status` принимает список
   (чип «Сборка» = `assembling` + `partially_assembled`).
   **Итог заказа — только через сервис модуля `order`** (`loadOrderTotals`): ядро считает итоги при
   выборке, а `query.graph` по полю `total` отдаёт неверное значение — на стенде 2026-08-04 у заказа
   №24 с итогом 242 000 ₸ graph давал 2 000 ₸ (стоимость доставки). Тем же дефектом болела сводка
   дашборда (`api/admin/dashboard/summary.ts`) — исправлена в этом же таске.
   **Слота доставки в домене тогда не было** (ни даты, ни окна «сегодня 15–18»): колонка
   «Доставка» показывала адрес. Слот заведён в T5.6 (см. раздел «Слот доставки»), и колонка
   показывает его; адрес остался в карточке заказа и на экране «Отгрузка».
   Тесты: `api/admin/order-lifecycles/__tests__/rows.unit.spec.ts` (12), сводка дашборда — тест
   «итог берётся из сервиса, а не из graph», http `order-routes.spec.ts` проверяет поля строки,
   счётчики и список статусов. Контракт перегенерирован (`AdminOrderLifecycleOrder` +
   `AdminOrderLifecycleCounts`); Dart-клиент этих admin-путей не использует — регенерация вместе с
   ближайшим mobile-таском (T5.3).
8. [x] **T4.2b — экран «Заказы» по макету 1b** (заменил очередь из п. 4):
   `routes/order-queue/page.tsx` переписан — плотная таблица (строки 44 px, `styles/orders.css`),
   чипы-фильтры со счётчиками (`ORDER_QUEUE_CHIPS`/`orderQueueChipCount` в admin `lib/order.ts`:
   «Все» + чип на статус, группируется только «Сборка»), поиск `DataTable.Search` (debounce 400,
   бэкендовый `q` — номер `#24`/почта/имя), пагинация с переведёнными подписями (у компонента ядра
   свои строки), колонка оплаты `payment_state` (`ORDER_PAYMENT_STATE_META` + безопасный
   `orderPaymentStateMeta`). **Действие в строке** — первый неопасный переход текущего статуса:
   `confirm`/`start-assembly`/`close` выполняются мутацией на месте (`use-order-lifecycle`),
   переходы с позициями/fulfillment/кодом ведут на ядровую страницу заказа (drawer — T4.2c).
   Ядровый пункт «Заказы» скрыт из сайдбара всем ролям (`styles/shell.css`), наш пункт
   переименован в «Заказы». Грабли ядрового DataTable (задокументированы в page.tsx/orders.css):
   id колонки `action` зарезервирован под узкую колонку «…»-меню (у нас `row_action`), ширины
   `columnDef.size` работают только с нашим `table-layout: fixed`, ячейки несут `px-6` — колонке
   «№» нужно ≥90 px. Тесты admin lib: чипы покрывают все статусы ровно один раз, счёт чипа,
   фолбэк оплаты (`order.unit.spec.ts`, +3).
9. [x] **T4.2c — карточка заказа drawer'ом (макет 1c)**: клик по строке очереди открывает
   `src/admin/components/order-card-drawer.tsx` (560 px, класс `sm-order-card`) — очередь остаётся
   под ним, фильтр и место в списке не теряются. Всё, что рисует карточка, отдаёт ОДИН роут
   **`GET /admin/orders/:id/lifecycle/card`** (сборка — `api/admin/orders/[id]/lifecycle/card/card.ts`,
   роут тонкий): статус + лог переходов, покупатель (компания → ФИО → почта, БИН, признак юрлица) и
   **лимит отсрочки** из модуля `scoring`, позиции с ценами, итоги, состояние оплаты, доставка,
   актуальные версии документов и **цели переходов** (`transition_targets`: позиции к сборке +
   fulfillment под отгрузку и под вручение). Выбор fulfillment'а переехал из браузера на бэкенд —
   виджет страницы заказа считал его по ядровым данным страницы, drawer'у их не видно.
   Деньги — сервисом модуля `order` (`listOrders` с `select: [total, item_total, shipping_total,
   discount_total]`), разбивка добирается из позиций и способов доставки: на экране «Товары» +
   «Доставка» = «Итого». Лог переходов сериализуется в поля контракта
   (`AdminOrderLifecycleEvent`) — служебные `order_lifecycle_id`/`updated_at`/`deleted_at` наружу не
   уходят; выборка статуса вынесена в `lifecycle/lifecycle-detail.ts` (её читают оба роута).
   Контракт: путь `/admin/orders/{id}/lifecycle/card` + схемы `AdminOrderCard*` (119 путей,
   717 схем); Dart-клиент этих admin-путей не использует — регенерация вместе с ближайшим
   mobile-таском.
   **Грабля ядрового DataTable (третья):** `useDataTable({ onRowClick })` отдаёт в колбэк НЕ строку
   данных, как обещает документация Medusa UI, а обёртку TanStack (`{ original }`). Из-за этого с
   T4.2b клик по строке молча ничего не делал (`row.order` был `undefined`) — очередь оставалась
   тупиком, хотя в отчёте значилось «клик ведёт на страницу заказа». Читаем оба варианта —
   с T4.11a это общий `admin/lib/data-table-row.ts` (`dataTableRow`), а не копия в экране.
   Проверять клик по строке нужно НАСТОЯЩЕЙ мышью: синтетический `el.click()` до обработчика ядра
   не доходит — для этого у скриншотера появилось действие `clickAt` (CDP `Input.dispatchMouseEvent`).
   **Класс появился второй раз (T4.11a, 2026-08-18):** в «Спорах» он не молчал, а РОНЯЛ экран
   (`DISPUTE_STATUS_META[undefined].color`), в реестре документов снова молчал. Почему дожил:
   там, где `getRowId` возвращает id сущности (`companies`, `product-moderation`), обёртка
   маскируется под строку — `row.id` совпадает, и клик-навигация работает по случайности. Дефект
   виден только там, где после клика читают НЕ `id`. **Правило: в `onRowClick` строку всегда
   пропускать через `dataTableRow()`.**

10. [x] **T4.12 — время, ответственный и деньги для управляющего** (блокер Тимура, Ф-прогон панели
   2026-08-18: «на дашборде нет ни одной денежной суммы», «в очереди нет ни даты, ни возраста
   заказа», «в истории переходов автор — роль, а не человек»):
   - **Сроки стадий** — `api/admin/order-lifecycles/sla.ts`: норма времени на каждый статус
     (`new` 2 ч, `confirmed` 4, `assembling`/`partially_assembled` 8, `assembled` 12,
     `in_delivery` 24; доставленный/закрытый/отменённый/возвращённый — без срока), правится env
     `ORDER_SLA_HOURS` («статус=часы» через запятую). `orderQueueTiming` считает возраст заказа
     (от оформления) и время в ТЕКУЩЕМ статусе (от `updated_at` жизненного цикла — запись меняется
     только переходом) плюс признак просрочки; `countOverdueOrders` — счётчик просрочки для шапки
     очереди (условием запроса это не берётся: срок зависит от статуса, поэтому открытые статусы
     читаются и считаются в памяти).
   - **Ответственный** — `api/admin/order-lifecycles/assignees.ts`: на стадиях сборки это сборщики,
     взявшие задания своих категорий (модуль `assembly`), в остальных статусах — сотрудник,
     последним переведший статус (лог `order_lifecycle_event`). Переход покупателя или системы
     ответственного НЕ назначает — строка честно говорит «не взят», и именно такие заказы стоят.
   - **Автор перехода — человек**: `actor_name` в `AdminOrderLifecycleEvent`
     (`orders/[id]/lifecycle/actor-names.ts`) — сотрудники резолвятся через модуль `user`,
     покупатель через `customer` (ФИО → телефон → почта). Роль остаётся подписью рядом: имя
     отвечает на «кто», роль — «в каком качестве». Учётка без имени подписывается логином из почты
     (общее правило `api/admin/user-names.ts` + `actor-label.ts`, туда же переехал помощник из
     `shipping-queue/rows.ts`).
   - **«В доставке» — открытый статус** (`dashboard/constants.ts`): именно он и был слепым пятном
     («три заказа шестой день висят „В доставке“»). Теперь он в сводке, в очереди дашборда, в
     деньгах в работе и в счётчике просрочки — одним срезом, чтобы числа плитки и экрана не
     расходились.
   - **Деньги дня** — `api/admin/dashboard/money.ts`: выручка за день магазина (не за день
     UTC-сервера — `SHOP_TIME_ZONE`, по умолчанию Asia/Almaty) и за скользящие 7 дней по
     ОПЛАЧЕННЫМ заказам, деньги в работе (итоги заказов до доставки) с выделением неоплаченного,
     заказы в чужой валюте отдельным числом (в суммы не идут), дебиторка юрлиц — только при
     `FEATURE_COMPANIES` (иначе `receivables: null`, «₸ 0» было бы неправдой; срок отсрочки —
     `COMPANY_RECEIVABLE_TERM_DAYS`).
   - **Отчёт по стадиям** — `api/admin/dashboard/stages.ts`: оформлен → принят → собран → отгружен
     → доставлен, среднее и худшее время в минутах по окну `DASHBOARD_STAGE_REPORT_DAYS` (30 дней).
     Считается по ПЕРВОМУ переходу в каждый статус (возврат в сборку стадию не удлиняет), стадия
     без прошедших заказов отдаётся как `null`, а не ноль.
   - **Уведомлений продавцу система не рассылает** (канала нет; решение владельца 2026-08-18
     «канал один, чат» — про покупателя), поэтому единственный сигнал о просрочке — сама панель:
     плитка «Заказы» краснеет и называет число, шапка экрана «Заказы» говорит словами. Внешний
     канал для продавца (push/почта) — вне MVP, вынесен владельцу.
   - UI: полоса денег и панель «Стадии заказа» на дашборде, колонка «Ждёт» в очереди дашборда
     (просрочка — цветом: подпись рядом с числом ломала строку 44 px), на экране «Заказы» —
     колонки «Оформлен», «В статусе» с меткой «вне срока» и «Ответственный». Отступы ячеек
     таблицы очереди уменьшены до 12 px (`styles/orders.css`): при ядровых px-6 одиннадцать
     колонок не помещались — «Статус» обрезался, «Действие» уезжало за край.
   - Контракт: `age_hours`/`status_hours`/`sla_hours`/`overdue`/`assignee` в
     `AdminOrderLifecycle`, `overdue` в `AdminOrderLifecycleCounts`, `actor_name` в
     `AdminOrderLifecycleEvent`, схема `AdminOrderAssignee`. Dart-клиент этих admin-путей не
     использует — регенерация вместе с ближайшим mobile-таском.
   - Тесты: юниты `order-lifecycles/__tests__/{sla,assignees}.unit.spec.ts`,
     `dashboard/__tests__/{money,stages}.unit.spec.ts` + сводка; http
     `integration-tests/http/dashboard-routes.spec.ts` (живой путь денег и стадий, флаг юрлиц в
     оба состояния) и новые проверки в `order-routes.spec.ts`.
