# Модуль `payment-kaspi` — платёжный провайдер Kaspi Pay / QR

**Статус:** проектирование; реализуется подзадачами (см. низ файла и бэклог `docs/STATE.md`).
**Код (по мере реализации):** `backend/src/modules/payment-kaspi/` (провайдер + адаптер + мок),
регистрация провайдера в `medusa-config.ts` под ядровым `@medusajs/payment`,
интеграция оплаты в `backend/src/workflows/place-order.ts`, роуты `backend/src/api/**`.

## Назначение
Реализация **Payment Provider API** ядра Medusa для Kaspi Pay / Kaspi QR. Оплата, платёжные сессии,
capture/refund, статусы — всё это **ЯДРО Medusa** (модуль `@medusajs/payment`), не переизобретаем.
ТЗ (3.2) требует единый платёжный шлюз, за которым Kaspi — один из провайдеров, а другие эквайеры
подключаются параллельно тем же интерфейсом. Значит наш код — это **один провайдер за шлюзом ядра**,
а не своя платёжная подсистема.

## Что закрывает ядро Medusa (не переизобретаем)
Модуль `@medusajs/payment` (ключ `Modules.PAYMENT`) даёт целиком:
- **Payment Collection** — сумма к оплате, привязана к корзине/заказу (`createPaymentCollectionForCartWorkflow`).
- **Payment Session** — попытка оплаты конкретным провайдером; `data` (jsonb) — провайдер-специфичное
  состояние (наш invoice_id, QR-токен, polling-курсор — храним здесь, отдельная таблица не нужна).
- **Payment / Capture / Refund** — записи о фактической оплате и возвратах (суммы, время) — ядро ведёт само,
  это и есть «лог платёжных событий» из ТЗ по деньгам; наш провайдер их порождает через возвращаемые статусы.
- **Payment Provider API** — контракт, который реализует наш класс; ядро вызывает его методы из своих workflow
  (`authorizePaymentSessionStep` внутри `completeCartWorkflow`, capture/refund из admin-роутов заказа и т.д.).
- **Webhook-роут** — ядро даёт `POST /hooks/payment/:provider` и само дергает `getWebhookActionAndData`.

Вывод: пишем **только провайдер** (класс + транспорт к Kaspi) и **точки интеграции в оформление заказа**.
Свои модели/сервис домена НЕ нужны для MVP (состояние — в `data` сессии; деньги — в ядровых Payment/Refund).

## Payment Provider API (методы, которые реализует `KaspiPaymentProvider`)
Класс наследует `AbstractPaymentProvider<TConfig>` из `@medusajs/framework/utils`, статический
`identifier = "kaspi"`. Полный id провайдера у ядра — `pp_kaspi_kaspi`. Методы (Medusa v2):

| Метод | Роль в потоке Kaspi |
|---|---|
| `initiatePayment` | создать **инвойс Kaspi** + получить **QR/ссылку**; вернуть их в `data` сессии |
| `authorizePayment` | проверить оплату; пока покупатель не оплатил → статус `requires_more`/`pending`, после подтверждения → `authorized` |
| `getPaymentStatus` | опросить статус инвойса Kaspi (**polling**), маппинг в `PaymentSessionStatus` |
| `capturePayment` | подтвердить списание (для QR обычно совпадает с оплатой — capture = confirm) |
| `refundPayment` | возврат средств по регламенту эквайера (частичный/полный) |
| `cancelPayment` | отменить неоплаченный инвойс |
| `retrievePayment` | вернуть актуальные данные инвойса из Kaspi |
| `updatePayment` | пересчёт суммы сессии (частичное исполнение — см. «Сценарии») |
| `deletePayment` | удалить сессию/инвойс (корзина брошена) |
| `getWebhookActionAndData` | разобрать webhook Kaspi → `{ action, data: { session_id, amount } }` |

`PaymentSessionStatus`: `pending` · `requires_more` · `authorized` · `captured` · `canceled` · `error`.
Webhook `action`: `authorized` · `captured` · `canceled` · `failed` · `pending` · `requires_more` · `not_supported`.

## Архитектура: провайдер + адаптер транспорта + мок (ключевое решение)
Публичной песочницы Kaspi нет (см. «Риски»), реальный договор эквайринга появится позже. Поэтому
**транспорт к Kaspi изолирован за интерфейсом**, провайдер от него не зависит:

```
KaspiPaymentProvider (реализует Payment Provider API ядра)
        │ зависит только от интерфейса
        ▼
interface KaspiClient { createInvoice, getInvoiceStatus, refund, cancel, parseWebhook }
   ├── KaspiMockClient  — dev/тесты: детерминированный QR, статус по «сценарию»,
   │                      симуляция webhook; НИКАКИХ сетевых вызовов
   └── KaspiHttpClient  — реальный транспорт (порт флоу из tapter-dev, см. «Референсы»);
                          заменяется на официальный API при получении договора
```
Выбор реализации — по env: `KASPI_MODE=mock|live` (по умолчанию `mock`, если не заданы `KASPI_MERCHANT_ID`/
`KASPI_API_KEY`). Так вся бизнес-логика оформления и тесты не зависят от наличия реальных ключей.
Секреты — только через env (`backend/.env.example` пополняется плейсхолдерами).

### Как «оплатить» на стенде (T8.6)
Исход мока кодируется в `invoice_id` при СОЗДАНИИ инвойса, а покупатель платит позже — поэтому у мока
есть карта назначенных исходов (`setMockInvoiceState` / `clearMockInvoiceStates` в
`kaspi-mock-client.ts`): она главнее закодированного состояния, живёт в памяти процесса и только в
mock-режиме. Подтверждение оплаты:

- `POST /store/carts/:id/payment/kaspi/mock-pay` — отмечает инвойс оплаченным и прогоняет обычный
  `syncCartKaspiPaymentWorkflow`. Вне `KASPI_MODE=mock` роут отвечает **404**. Доступ — как у
  поллинга статуса (гостевая корзина подтверждается своим `cart_id`). С T10.8 корзина чата всегда
  принадлежит вошедшему покупателю (счёт выставляется только после входа), поэтому на стенде нужен
  его токен: `CUSTOMER_TOKEN=<jwt> npm run kaspi:pay`.
- `cd backend && npm run kaspi:pay` — утилита: сама находит последнюю неоплаченную мок-сессию в базе
  стенда и вызывает этот роут (id вручную не нужны). Для корзины зарегистрированного покупателя —
  `CUSTOMER_TOKEN=<jwt> npm run kaspi:pay`.
- **Панель → Настройки → «Оплата Kaspi»** (T12.23) — то же самое кнопкой, без захода на сервер:
  `GET /admin/kaspi-mock-payments` показывает неоплаченные счета (покупатель, сумма, корзина),
  `POST /admin/kaspi-mock-payments` подтверждает оплату — без тела берётся самый свежий счёт
  (поведение `npm run kaspi:pay`), с `payment_session_id` — выбранный. Админ-роут ходит к сессии
  напрямую, поэтому токен покупателя ему не нужен. Вне `KASPI_MODE=mock`: GET отвечает
  `mock_mode: false` и пустым списком, POST — **404**.

**Граница мока, важная для показов:** `payment_url` мока — `https://kaspi.kz/pay/kaspi_mock_…`,
то есть ссылка на НАСТОЯЩИЙ kaspi.kz, где такого счёта нет. С телефона кнопка «Оплатить в Kaspi»
на стенде приведёт на 404; оплату по-прежнему подтверждают кнопкой в панели. Задача — T12.25.

В контракт (`contracts/openapi.json`) роут НЕ выносится: в проде его нет (DECISIONS 2026-08-11).
В тестах исход по-прежнему задаётся сценарием при создании (`scenario: "paid"`), мок остаётся
стателесс по умолчанию.

## Флоу Kaspi Pay / QR (сопоставление с методами)
1. Оформление начинается → ядро создаёт **payment collection** на сумму к оплате и **сессию** провайдера `kaspi`.
2. Ядро зовёт `initiatePayment` → `KaspiClient.createInvoice` → в `data` сессии кладём `kaspi_invoice_id`,
   `qr_payload`/`payment_url`, `status=pending`. Клиент (mobile/web) показывает **QR** покупателю.
3. Покупатель платит в приложении Kaspi. Подтверждение приходит **двумя путями** (берём оба — надёжность):
   - **webhook** Kaspi → ядровый `/hooks/payment/kaspi` → `getWebhookActionAndData` → `authorized`/`captured`;
   - **polling** клиентом/джобой → `getPaymentStatus` → `KaspiClient.getInvoiceStatus`.
4. Когда сессия `authorized` — вызывается `placeOrder` (`completeCartWorkflow` внутри дергает
   `authorizePaymentSessionStep`; если уже авторизована — подтверждает и создаёт заказ + резерв).
5. `capturePayment` — списание (для QR оплата и есть списание; capture идемпотентно подтверждает).
   **С T4.14 списание делает САМО оформление** — шаг `workflows/steps/capture-order-payment.ts`
   сразу после создания заказа гоняет ядровый `capturePaymentWorkflow` по всем несписанным
   платежам заказа. Иначе у заказа два состояния денег: наша очередь считает авторизацию оплатой
   (она ею и является), а ядровая страница заказа показывает «остаток к оплате» и предлагает
   продавцу нажать «Получить платеж» — подтвердить платёж, которого он не проводил.
   Шаг НЕ компенсируется и НЕ роняет оформление (деньги уже у эквайера — та же причина, по
   которой не компенсируется ядровый `capturePaymentStep`); несписанное находит и дожимает
   `npx medusa exec ./src/scripts/check-order-captures.ts` (`CAPTURE=1` — списать).
   **Грабля ядра:** у модели `Payment` нет `authorized_at` — запись создаётся уже по факту
   авторизации сессии, поэтому «ждёт списания» = запись есть, а `captured_at` пуст.
6. Возврат товара → `refundPayment` (частичный/полный) по регламенту эквайера; статус виден покупателю (ТЗ).

## Сценарии оплаты на уровне шлюза (ТЗ / DOMAIN «Оплата»)
Настраиваются **на уровне заказа/договора**, реализуются оркестрацией (workflow + сумма payment collection),
а НЕ внутри провайдера — провайдер лишь исполняет платёж на заданную сумму:

- **100% предоплата** — payment collection = полная сумма заказа; авторизация до `placeOrder`. **← MVP.**
- **Частичная предоплата (настраиваемый %)** — collection = сумма × prepay%; остаток — постоплата/при доставке.
  **Отложено:** нужна политика % (настройка продавца) и вторая (пост)оплата.
- **Постоплата / отсрочка (ТОЛЬКО юрлица, в рамках лимита)** — заказ размещается без предоплаты «в кредит»;
  проверка `SpendLimit` (модуль `company`) + одобренного лимита (`scoring`) в `placeOrder`.
  **Отложено:** зависит от модуля `scoring` (лимит) — его ещё нет.
- **Частичная оплата бонусами** — уменьшает сумму «живыми деньгами» в collection.
  **Отложено:** зависит от модуля `bonus` — его ещё нет.
- **Пересчёт при частичном исполнении** — возврат/зачёт разницы предоплаты (`updatePayment` + `refundPayment`).
  **Отложено:** увязать с частичной сборкой заказа (`complete-order-assembly`).

Счета формирует платформа от имени продавца (DOMAIN) — это модуль `documents` (счёт на `order.placed`), НЕ здесь.

## Интеграция в оформление заказа (`placeOrder`)
Сейчас `placeOrder` завершает корзину **без реальной оплаты** (осознанно отложено — DECISIONS 2026-07-14).
С этим модулем:
- перед `placeOrder` корзина получает payment collection + сессию `kaspi` (store-роут инициализации оплаты);
- `placeOrder` не меняется структурно — `completeCartWorkflow` уже авторизует платёжную сессию; добавляется
  предусловие «сессия авторизована» (для постоплаты юрлиц — ветка без предоплаты, когда появится `scoring`).

## API и клиенты (тонкие роуты поверх ядра/провайдера)
- **store** (покупатель): инициализация оплаты корзины (создать collection+сессию Kaspi, вернуть QR/URL),
  статус оплаты (polling), запрос возврата — поверх ядровых payment-workflow.
- **admin** (продавец/менеджер): просмотр платежей заказа, ручной capture/refund — по возможности ядровые роуты.
  (Снято пивотом 2026-07-22: admin-роуты Kaspi/наличных для POS-корзины `/admin/counter-carts/:id/payment/*`
  и workflow `init-cart-cash-payment` удалены вместе с POS — оплата идёт только store-путём Kaspi QR.)
  Общий вид ответа — `src/api/utils/kaspi-payment-response.ts`.
- **webhook**: используем ядровый `POST /hooks/payment/kaspi` (свой роут не пишем).
- **mobile/web**: тонкие экраны — показать счёт, опросить статус (контракт → Dart-клиент как обычно).
  **Как именно показывать — зависит от устройства (T12.24, DECISIONS 2026-09-14).** `qr_payload` и
  `payment_url` в живом транспорте — одна и та же ссылка `pay.kaspi.kz`, поэтому QR это способ
  ПЕРЕНЕСТИ счёт на другое устройство, а не заплатить. Телефон переносить никуда не нужно:
  первична кнопка «Оплатить в Kaspi» (универсальная ссылка поднимает приложение), QR — под
  раскрывашкой «Оплатить с другого устройства»; на широком экране витрины наоборот. Рядом —
  «Отправить/скопировать ссылку»: заказывает прораб, платит бухгалтер. Возврат из Kaspi
  проверяется немедленно (`visibilitychange` / `AppLifecycleState.resumed`) поверх поллинга.
  Раскладка общая: `storefront/src/modules/common/components/kaspi-pay-panel`, `AppKaspiPayBlock`
  (ui_kit) + `mobile/apps/buyer/lib/shared/kaspi_pay_actions.dart`.

## Безопасность
Полные данные карт НЕ храним и НЕ проксируем — PCI DSS на стороне Kaspi/эквайера (QR-редирект в приложение Kaspi).
В `data` сессии — только идентификаторы инвойса и токен QR. Все платёжные события (авторизация/списание/возврат/
webhook) логируются: суммы — ядровые Payment/Capture/Refund, транспортные события — через логгер провайдера.

## События / хуки для будущих модулей
- `order.placed` (ядро, из `completeCart`) → счёт (`documents`), уведомление (notification).
- Ядровые payment-события (capture/refund) → уведомление о статусе оплаты/возврата покупателю.
- Закрытие заказа после окна возврата → бонус (`bonus`) + скоринг (`scoring`) — подписка на
  `order_lifecycle.status_changed` c `to=closed` (уже эмитится модулем `order-lifecycle`).

## Риски
- **Нет публичной песочницы Kaspi** → строим на моке + адаптере; реальные мерчант-ключи запросить у клиента
  заранее (STATE.md → риски). Живой транспорт (`KaspiHttpClient`) тестируем на моках до получения договора.
- Референс `tapter-dev/kaspi-pos-automation` — **неофициальный** API (имитация Kaspi Pay Business); в прод как есть
  не берём, транспорт заменяем на официальный при подключении эквайринга.

## Референсы (найдены владельцем, 2026-07-10)
- **github.com/tapter-dev/kaspi-pos-automation** (Node.js, MIT, ~129★) — автоматизация Kaspi Pay:
  инвойс → QR → polling статуса → webhooks → refund, SMS-авторизация мерчанта, доки ru/kz.
  ⚠ НЕОФИЦИАЛЬНЫЙ API (имитация Kaspi Pay Business) — в прод как есть НЕ брать.
  Использование: портировать флоу в `KaspiHttpClient` за адаптером + сделать из него дев-мок;
  транспорт заменить на официальный при получении договора эквайринга.
- **github.com/abdymazhit/kaspi-merchant-api** (Go, MIT) — НЕ платежи: Merchant API маркетплейса kaspi.kz
  (заказы/товары/отзывы продавца на Kaspi Магазине). Не для MVP; референс на Фазу 2,
  если понадобится синхронизация нашего продавца с Kaspi Магазином.

## Подзадачи (порядок реализации — бэклог в STATE.md)
1. [x] **Провайдер (мок) + регистрация под шлюзом ядра** — ГОТОВО (2026-07-15). Класс `KaspiPaymentProvider`
   (`AbstractPaymentProvider`, все 10 методов), интерфейс `KaspiClient` (`types.ts`) + детерминированный
   `KaspiMockClient` (стателесс: исход закодирован в `invoice_id`) + фабрика `create-kaspi-client.ts` (mock|live
   по env `KASPI_MODE`), регистрация `ModuleProvider(Modules.PAYMENT, ...)` (`index.ts`) → подключение в
   `medusa-config.ts` внутри `options.providers` ядрового `@medusajs/medusa/payment`. Своих моделей нет
   (состояние — в `data` сессии). Тесты — 16 unit (`__tests__/payment-kaspi.unit.spec.ts`). Сигнатуры Provider
   API сверены через tsc (node_modules закрыт), полный id провайдера — `pp_kaspi_kaspi`. Детали — DECISIONS 2026-07-15.
2. [x] **Оплата в оформлении заказа** — ГОТОВО (2026-07-15). Store-роуты `POST /store/carts/:id/payment/kaspi`
   (инициализация: collection ядра + сессия Kaspi + QR/ссылка; идемпотентен) и `GET` того же пути (статус/
   polling: пока сессия pending — попытка авторизации ядром, внутри провайдер опрашивает инвойс; оплачено →
   authorized + Payment ядра). Workflows `init-cart-kaspi-payment` (оркестрация ядровых
   `createPaymentCollectionForCartWorkflow`/`createPaymentSessionsWorkflow`) и `sync-cart-kaspi-payment`;
   общий хелпер `workflows/utils/settle-kaspi-payment-session.ts`. Предусловие 100% предоплаты — шаг
   `ensure-cart-payment-authorized` перед `completeCartWorkflow` в `place-order` (сессия обязана быть,
   Kaspi-сессия — оплачена; перед проверкой синхронизируется с инвойсом). Владение корзиной —
   `requireOwnCart` (чужая → 404), auth customer обязателен. OAS-фрагмент `store/carts/carts.oas.json`,
   контракт и Dart-клиент перегенерированы. `seed-kz.ts` идемпотентно подключает `pp_kaspi_kaspi` к региону
   Kazakhstan. 12 http-тестов (`kaspi-payment.spec.ts`). Решения — DECISIONS 2026-07-15 (подзадача 2).
3. [x] **Живой транспорт `KaspiHttpClient`** — ГОТОВО (2026-07-16). Порт QR-флоу tapter-dev за адаптером
   (`kaspi-http-client.ts`): `POST /api/qr/create` → `GET /api/qr/status` → `POST /api/refund/create`,
   cancel через единственный cancel-эндпоинт референса. Маппинг статусов fail-safe (`paid` только на явный
   `Processed`, незнакомое → `pending`). Webhook — подпись `X-Webhook-Signature` (HMAC SHA-256 от raw body)
   ОБЯЗАТЕЛЬНА, невалидная → NOT_ALLOWED. Ветка `live` фабрики собирает клиент из `KASPI_API_URL`/
   `KASPI_MERCHANT_ID`/`KASPI_API_KEY`/`KASPI_WEBHOOK_SECRET` (все обязательны, ошибка перечисляет
   недостающие). HTTP — инжектируемый fetch (Node 18+), 21 unit-тест на фейковом fetch без сети.
   ⚠ Транспорт неофициальный — заменить на официальный API при договоре эквайринга (меняется только этот
   файл + фабрика). Реальные ключи — от клиента. Детали — DECISIONS 2026-07-16.
4. [ ] **Отложенные сценарии** (по мере появления модулей): частичная предоплата, постоплата юрлиц
   (`scoring`+`SpendLimit`), оплата бонусами (`bonus`), пересчёт при частичном исполнении.
</content>
</invoke>
