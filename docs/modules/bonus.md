# Модуль `bonus` — бонусный счёт покупателя

**Статус:** МОДУЛЬ ГОТОВ (2026-07-17) — все 4 подзадачи: дизайн + модуль, начисление, списание
в оформлении, сгорание + admin API/UI.
**Код:** `backend/src/modules/bonus/`, `backend/src/links/customer-bonus-account.ts`,
`backend/src/links/order-bonus-transaction.ts`, `backend/src/workflows/` (начисление/списание/конфиг),
`backend/src/jobs/accrue-bonuses.ts` + `expire-bonuses.ts`, `backend/src/api/store/bonus/`,
`backend/src/api/admin/bonus-config/`, `backend/src/api/admin/customers/[id]/bonus/`,
админ-UI: `backend/src/admin/routes/settings/bonus-program/` + `widgets/customer-bonus-card.tsx`.

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
- **Кредитные линии КОРЗИНЫ — механизм «оплаты бонусами» (подзадача 3, РЕАЛИЗОВАНО 2026-07-17)**:
  `createCartCreditLinesWorkflow`/`deleteCartCreditLinesWorkflow` ядра; ядро вычитает линии из
  `cart.total`, `completeCartWorkflow` копирует их в заказ (суммы «деньгами/бонусами» разделены для
  `documents`), а при total=0 (всё покрыто бонусами) пропускает платёж вовсе. Кандидат из раннего
  дизайна — order credit lines — отвергнут: оплата должна уменьшиться ДО создания заказа
  (DECISIONS 2026-07-17).
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
  для отката), `expiry_notified_at` (nullable — маркер «о скором сгорании лота предупредили»,
  идемпотентность bonus.expiring_soon между прогонами джобы сгорания), `note` (nullable),
  `account` belongsTo.
  Заказ-основание (начисления/списания) — через module link, FK в модели нет (правило изоляции).
- **`BonusConfig`** — настройки платформы, singleton-строка (MVP — один продавец; `getOrCreateConfig`
  создаёт с дефолтами): `accrual_percent` (default 1), `segment_percents` (json nullable —
  переопределения по сегментам каталога, напр. `{"business": 2}`; ключи — строки, тип сегмента
  НЕ импортируем из `catalog` — изоляция), `max_spend_percent` (default 50 — дефолт до уточнения
  владельцем, ТЗ значения не задаёт), `expiry_days` (nullable, null = сгорание выключено),
  `expiry_notice_days` (default 7 — за сколько дней предупреждать о сгорании, 0 = выключено),
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
`bonus.expired`. Эмитятся из workflows (accrued/spent) и джобы сгорания (expiring_soon/expired —
напрямую через event bus); подписчики-уведомления — заглушки до notification-провайдера
(идиома order-lifecycle).

## Как считается начисление (подзадача 2 — РЕАЛИЗОВАНО 2026-07-16)
Триггер — джоба (`src/jobs/accrue-bonuses.ts`, раз в час): найти заказы `order_lifecycle.status=closed`,
у которых дата перехода в `delivered` (из `OrderLifecycleEvent`) + `return_window_days` уже в прошлом
и НЕТ accrual-транзакции по link'у order↔bonus_transaction (идемпотентность). Для каждого — workflow
`accrue-order-bonus`: сумма по позициям заказа × процент (сегмент позиции — из `product_card` по
link'у), get-or-create счёта покупателя, `credit(type=accrual, expires_at = now + expiry_days)`,
link транзакции к заказу, `emitEventStep(bonus.accrued)`. Подписка на `order_lifecycle.status_changed
(to=closed)` НЕ триггерит начисление напрямую — окно возврата ещё не истекло; джоба — единственный
триггер (просто и идемпотентно).

Нюансы реализации (решения — DECISIONS 2026-07-16, начисление):
- Инварианты (closed / окно истекло / ещё не начислено) проверяет сам workflow (шаг
  `prepare-order-bonus-accrual`) — джоба лишь предфильтр, ручной вызов безопасен.
- База позиции — `unit_price × quantity` через сервис order (query.graph не отдаёт BigNumber-поля
  позиций); доставка не бонусируется.
- Нулевая сумма (процент 0 / floor → 0) — no-op без транзакции: заказ остаётся кандидатом следующих
  прогонов джобы (безвредно на MVP-масштабе).
- Скан джобы линеен по всем closed-заказам; при росте — маркер обработки на lifecycle.

## Как работает списание (подзадача 3 — РЕАЛИЗОВАНО 2026-07-17)
Применение и списание разделены (решения — DECISIONS 2026-07-17, списание):
- **Применение** — `POST /store/carts/:id/bonus {amount}` → workflow `apply-cart-bonus`: проверки
  fail fast (счёт есть, баланс достаточен, валюта совпадает, потолок `assertSpendWithinCap` от суммы
  ДО вычета бонусов) → кредитная линия корзины (`reference="bonus_account"`, `reference_id`=счёт) →
  `refreshPaymentCollectionForCartWorkflow` (если оплата уже инициализирована: сумма collection
  синхронизируется, устаревшие сессии/инвойс Kaspi сбрасываются ядром — клиент инициализирует оплату
  заново). Повторный POST заменяет сумму; `DELETE` снимает (идемпотентен).
- **Списание лотов** — шаг `spend-cart-bonus` в workflow завершения корзины `place-order`
  (после пивота 2026-07-22 `place-counter-order` удалён), строго между `ensure-cart-payment-authorized` и `completeCartWorkflow`:
  перепроверяет потолок, списывает FIFO (`spend`), компенсация — `revertSpend`. После completeCart —
  link заказа к spend-транзакции + `bonus.spent`. Без бонусной линии шаг — no-op.
- **Полная оплата бонусами**: total=0 → `ensure-cart-payment-authorized` не требует платёжной сессии,
  `validate-cart-payments` ядра пропускает платёж (кредит покрывает total).
- **Нюанс query.graph**: `cart.total` учитывает кредитные линии только если запрошен
  `credit_lines.amount` (эмпирика 2.17.2) — шаги, читающие total, обязаны запрашивать amount.

## Как работает сгорание (подзадача 4 — РЕАЛИЗОВАНО 2026-07-17)
Джоба `src/jobs/expire-bonuses.ts` (ежечасно `30 * * * *`, в противофазе с accrue-bonuses), без
workflow — обе фазы внутри одного модуля, события эмитятся через event bus (решения — DECISIONS
2026-07-17, сгорание):
- **Сгорание**: сервисный `expireLots` (идемпотентен — сжигает только несписанный остаток
  просроченных лотов, на счёт — одна expiry-транзакция) + `bonus.expired` на каждый затронутый счёт.
  Лоты несут собственный `expires_at`, поэтому джоба досжигает старые лоты и после выключения
  сгорания в конфиге.
- **Предупреждение**: лоты с остатком, сгорающие в пределах `expiry_notice_days` (0 — выключено), —
  `bonus.expiring_soon` с агрегацией по счёту (сумма + ближайший срок). Идемпотентность — маркер
  `expiry_notified_at` на лоте; ставится после эмита (упавший прогон предупредит дважды — лучше,
  чем никогда).

## Осознанно отложено
- **Пересчёт при частичном исполнении/возврате** — вместе с returnFlow: возврат в окне уже закрытого
  заказа при начисленном бонусе → сторно (manual_debit) при реализации возвратов.
- **Документы** — раздельные суммы «деньгами/бонусами» — при модуле `documents`.
- **Уведомления** (начислено/скоро сгорит) — заглушки до notification-провайдера.

## API
- store (ГОТОВО, подзадача 3): `GET /store/bonus` (баланс + история, новые первыми, пагинация;
  `lot_breakdown` наружу не отдаётся; счёт лениво НЕ создаётся — без счёта нулевой ответ),
  `POST/DELETE /store/carts/:id/bonus` (применение/снятие; ответ — `{amount, cart_total,
  currency_code}`). Все — авторизованный customer, чужая корзина → 404.
- admin (ГОТОВО, подзадача 4): `GET/POST /admin/bonus-config` (частичный апдейт процентов/потолка/
  сгорания/окна возврата; POST — workflow `update-bonus-config`), `GET /admin/customers/:id/bonus`
  (баланс + 20 последних операций — данные widget'а). В контракт admin-роуты не входят (правятся
  только веб-админкой). Админ-UI: Settings → Bonus Program (`src/admin/routes/settings/bonus-program/`,
  секция «метка — значение» + Edit-drawer) и widget `customer-bonus-card.tsx` на ядровой странице
  customer. Демо-данные: `npx medusa exec ./src/scripts/seed-demo-bonus.ts`.

## Подзадачи (порядок реализации — бэклог в STATE.md)
1. [x] Дизайн + модуль: модели `BonusAccount`/`BonusTransaction`/`BonusConfig`, сервис (лоты FIFO,
   credit/spend/revert/expire, чистые функции начисления и потолка), links к customer и order,
   миграция, тесты модуля.
2. [x] Начисление: джоба + workflow `accrue-order-bonus` (идемпотентность по link'у, сегментные
   проценты из product_card, событие `bonus.accrued`, subscriber-заглушка уведомления).
3. [x] Списание в оформлении: store API применения бонусов + кредитные линии корзины ядра +
   согласование с предоплатой Kaspi (refresh collection) + `GET /store/bonus` + OAS-фрагменты,
   контракт, Dart-клиент — ГОТОВО 2026-07-17.
4. [x] Сгорание: джоба `expire-bonuses` + `bonus.expiring_soon`/`bonus.expired` + admin API конфига +
   админ-UI (конфиг + widget баланса на странице customer ядра) — ГОТОВО 2026-07-17.
