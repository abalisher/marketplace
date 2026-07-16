# Модуль `bonus` — бонусный счёт покупателя

**Статус:** подзадача 1 (дизайн + модуль) ГОТОВА (2026-07-16); остальное — по подзадачам внизу.
**Код (по мере реализации):** `backend/src/modules/bonus/`, `backend/src/links/customer-bonus-account.ts`,
`backend/src/links/order-bonus-transaction.ts`, далее `backend/src/workflows/` (начисление/списание),
`backend/src/jobs/` (начисление по расписанию, сгорание), `backend/src/api/store/bonus/`,
`backend/src/api/admin/bonus-config/`.

## Назначение
Начисление бонусов за закрытые заказы и их списание как частичной оплаты будущих заказов.
Вывод бонусов деньгами ЗАПРЕЩЁН — только покупки внутри платформы (ТЗ 4.16).

## Бизнес-правила (из ТЗ 4.16 + DOMAIN.md «Бонусы»)
- **Начисление**: 1% от суммы заказа (настраиваемый: уровень платформы + переопределение по сегменту
  товара), ПОСЛЕ закрытия заказа И истечения окна возврата (14 дней с даты доставки).
- **Списание**: частичная оплата будущего заказа, не более настраиваемого % от суммы нового заказа.
- **Сгорание**: опционально (настраиваемый срок жизни начисления) + уведомление о скором сгорании.
- **Документы**: суммы «деньгами» и «бонусами» — раздельно (интеграция с `documents` позже).

## Что закрывает ядро Medusa (проверено tsc-зондом, 2026-07-16)
- **Store credit в ядре OSS 2.17.2 НЕТ**: ни `Modules.STORE_CREDIT`, ни store-credit workflows
  (упоминание store credit в `backend/CLAUDE.md` было ошибочным — исправлено). Кошелёк пишем сами.
- **Промо-модуль не подходит**: промо — это скидки/кампании, а не накопительный счёт покупателя
  с лотами, сгоранием и запретом вывода.
- **`createOrderCreditLinesWorkflow` ЕСТЬ** (вход `{ id, credit_lines: Omit<CreateOrderCreditLineDTO,
  "order_id">[] }`) — кредитные линии заказа уменьшают его сумму к оплате. Это КАНДИДАТ механизма
  «оплата бонусами» в подзадаче 3 (бонусная часть — credit line, остаток — Kaspi); окончательное
  решение — при реализации подзадачи 3.
- **Суммы/валюта** — идиома ядра: `model.bigNumber()` в главных единицах валюты (KZT без тиынов),
  как `SpendLimit` в `company`.

## Модели (`backend/src/modules/bonus/models/`)
- **`BonusAccount`** — кошелёк покупателя (физ и юр; 1:1 к customer ядра через link):
  `balance` (bigNumber, default 0 — денормализованная сумма `remaining` активных лотов, поддерживается
  сервисом), `currency_code` (default `kzt`), `transactions` hasMany.
- **`BonusTransaction`** — леджер, строка = движение:
  `type` (enum `accrual | spend | expiry | manual_credit | manual_debit`), `amount` (bigNumber,
  ВСЕГДА > 0 — направление определяет тип), `remaining` (bigNumber nullable — несписанный остаток
  ЛОТА, только у кредитных типов `accrual`/`manual_credit`), `expires_at` (nullable — срок сгорания
  лота), `lot_breakdown` (json nullable — у списаний: разбивка по лотам `[{transaction_id, taken}]`
  для отката), `note` (nullable), `account` belongsTo.
  Заказ-основание (начисления/списания) — через module link, FK в модели нет (правило изоляции).
- **`BonusConfig`** — настройки платформы, singleton-строка (MVP — один продавец; `getOrCreateConfig`
  создаёт с дефолтами): `accrual_percent` (default 1), `segment_percents` (json nullable —
  переопределения по сегментам каталога, напр. `{"business": 2}`; ключи — строки, тип сегмента
  НЕ импортируем из `catalog` — изоляция), `max_spend_percent` (default 50 — дефолт до уточнения
  владельцем, ТЗ значения не задаёт), `expiry_days` (nullable, null = сгорание выключено),
  `return_window_days` (default 14 — окно возврата для условия начисления; при появлении модуля
  возвратов источник этой настройки станет общим).

**Учёт лотами (lot-based ledger)**: каждое начисление — лот со своим `remaining` и `expires_at`.
Списание уменьшает `remaining` лотов FIFO (ближайший срок сгорания первым, затем по дате создания);
сгорает только НЕпотраченный остаток просроченного лота. Без лотов корректное сгорание невозможно
(«баланс минус что-то» сжигает и свежие бонусы). `balance` счёта денормализован для быстрого чтения.

## Сервис (`service.ts`)
Чистые функции (тестируются без БД, переиспользуются в workflow-шагах):
- `calculateOrderAccrual({ items: [{subtotal, segment?}], accrual_percent, segment_percents? })` —
  сумма начисления по позициям: процент сегмента позиции или платформенный; доставка НЕ бонусируется
  (база — только товарные позиции); floor до целой единицы валюты в конце.
- `assertSpendWithinCap({ spend_amount, order_amount, max_spend_percent })` — потолок списания
  (NOT_ALLOWED при превышении).

Методы (трогают только локальные модели; атомарность движения — внутри метода):
- `getOrCreateConfig()` / стандартный `updateBonusConfigs` — конфиг-singleton.
- `credit({ account_id, amount, type?, expires_at?, note? })` — создать лот + увеличить баланс;
  amount > 0, тип — кредитный. Возвращает `{ account, transaction }` (для компенсаций шагов).
- `spend({ account_id, amount, note? })` — проверка баланса (NOT_ALLOWED «insufficient»), списание
  FIFO по лотам, spend-транзакция с `lot_breakdown`, уменьшение баланса. Потолок % от заказа —
  НЕ здесь (сервис не знает заказ), а в workflow подзадачи 3 через `assertSpendWithinCap`.
- `revertSpend({ spend_transaction_id })` — компенсация списания: восстановить `remaining` лотов по
  `lot_breakdown`, удалить spend-транзакцию, вернуть баланс.
- `expireLots({ now })` — сжечь `remaining` всех просроченных лотов: по счетам — expiry-транзакция на
  сумму сожжённого + уменьшение баланса. Идемпотентен (второй вызов не находит лотов). Для джобы.

Гонки при параллельном списании не блокируем (MVP ~10 заказов/день); при росте — advisory lock
по счёту (см. «Масштаб» в DOMAIN.md).

## Links
- `customer-bonus-account.ts` — customer ядра ↔ `bonusAccount` (1:1). Счёт создаётся лениво
  (get-or-create в workflow первого начисления), у покупателя без операций счёта нет.
- `order-bonus-transaction.ts` — order ядра ↔ `bonusTransaction` (1:N, `isList`): у заказа может быть
  и начисление (после закрытия), и списание (оплата бонусами при оформлении).

## События (`events.ts`, namespace `bonus.*`)
`bonus.accrued` · `bonus.spent` · `bonus.expiring_soon` (уведомление о скором сгорании) ·
`bonus.expired`. Эмитятся из workflows/джоб (подзадачи 2/4), подписчики-уведомления — заглушки до
notification-провайдера (идиома order-lifecycle).

## Как считается начисление (подзадача 2)
Триггер — джоба (`src/jobs/accrue-bonuses.ts`, раз в час): найти заказы `order_lifecycle.status=closed`,
у которых дата перехода в `delivered` (из `OrderLifecycleEvent`) + `return_window_days` уже в прошлом
и НЕТ accrual-транзакции по link'у order↔bonus_transaction (идемпотентность). Для каждого — workflow
`accrue-order-bonus`: сумма по позициям заказа × процент (сегмент позиции — из `product_card` по
link'у), get-or-create счёта покупателя, `credit(type=accrual, expires_at = now + expiry_days)`,
link транзакции к заказу, `emitEventStep(bonus.accrued)`. Подписка на `order_lifecycle.status_changed
(to=closed)` НЕ триггерит начисление напрямую — окно возврата ещё не истекло; джоба — единственный
триггер (просто и идемпотентно).

## Осознанно отложено
- **Списание в оформлении** (подзадача 3): механизм применения к заказу (кандидат — ядровые order
  credit lines) + согласование с предусловием 100% предоплаты Kaspi (`ensure-cart-payment-authorized`
  должен требовать оплату СУММЫ ЗА ВЫЧЕТОМ бонусов). Разблокирует часть payment-kaspi подзадачи 4.
- **Пересчёт при частичном исполнении/возврате** — вместе с returnFlow: возврат в окне уже закрытого
  заказа при начисленном бонусе → сторно (manual_debit) при реализации возвратов.
- **Документы** — раздельные суммы «деньгами/бонусами» — при модуле `documents`.
- **Уведомления** (начислено/скоро сгорит) — заглушки до notification-провайдера.

## API (подзадачи 3–4)
- store: `GET /store/bonus` (баланс + история; авторизованный customer), применение к корзине —
  `POST/DELETE /store/carts/:id/bonus` (сумма списания; проверка потолка).
- admin: `GET/POST /admin/bonus-config` (проценты/потолок/сгорание), баланс покупателя — widget на
  ядровой странице customer.

## Подзадачи (порядок реализации — бэклог в STATE.md)
1. [x] Дизайн + модуль: модели `BonusAccount`/`BonusTransaction`/`BonusConfig`, сервис (лоты FIFO,
   credit/spend/revert/expire, чистые функции начисления и потолка), links к customer и order,
   миграция, тесты модуля.
2. [ ] Начисление: джоба + workflow `accrue-order-bonus` (идемпотентность по link'у, сегментные
   проценты из product_card, событие `bonus.accrued`, subscriber-заглушка уведомления).
3. [ ] Списание в оформлении: store API применения бонусов + механизм уменьшения суммы к оплате
   (кандидат — order credit lines) + согласование с предоплатой Kaspi + `GET /store/bonus` +
   OAS-фрагменты, контракт, Dart-клиент.
4. [ ] Сгорание: джоба `expire-bonuses` + `bonus.expiring_soon`/`bonus.expired` + admin API конфига +
   админ-UI (конфиг + widget баланса на странице customer ядра).
