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
Инвариант — чистая функция `assertOrderStatusTransition(from, to)` (в `service.ts`, тестируется без БД
и переиспользуется в шагах); применение перехода (лог + обновление статуса) — метод сервиса
`recordTransition`; сами сценарные переходы с вызовом ядровых workflow — в `src/workflows/`.
```
new            → confirmed | canceled
confirmed      → assembling | canceled
assembling     → partially_assembled | assembled | canceled
partially_assembled → assembled | in_delivery | canceled   (отгрузка собранной части)
assembled      → in_delivery | canceled
in_delivery    → delivered
delivered      → closed | returned
closed         → returned            (возврат в окне 14 дней после закрытия — см. returnFlow)
canceled       → —  (терминальный)
returned       → —  (терминальный)
```

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
- `order.placed` → счёт (`documents`), уведомление обеим сторонам (`notification`). Модулей пока нет —
  subscriber-заглушка/отложено.
- `order.status_changed` → уведомление обеим сторонам на каждом переходе (ТЗ).
- `order.closed` → начисление бонуса (`bonus`, после окна возврата) + пересчёт скоринга (`scoring`).

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
1. [ ] Дизайн + модуль `order-status` (модели `OrderStatus`/`OrderStatusHistory`, сервис с инвариантом
   переходов, link 1:1 к order ядра, миграция, тесты модуля). ← текущая.
2. [ ] `placeOrder` + переходы жизненного цикла (обёртки над ядровыми workflow) + subscriber уведомлений
   (заглушка) + события. Частичная сборка внутри `complete-order-assembly`.
3. [ ] Store/admin API (store: оформление, свой статус заказа; admin: очередь заказов, переходы) +
   OAS-фрагменты + перегенерация контракта и Dart-клиента.
4. [ ] Админ-UI: очередь заказов (в стиле `routes/companies`) + переходы статуса + виджет статуса на
   странице заказа ядра.
