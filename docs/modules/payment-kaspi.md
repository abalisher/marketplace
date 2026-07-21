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
  Дополнение 2026-07-18 (POS-гэпы partner-раунда): продавец у окна инициализирует/поллит Kaspi-оплату
  POS-корзины через `POST|GET /admin/counter-carts/:id/payment/kaspi` — те же workflows
  `init/sync-cart-kaspi-payment`, что у store-варианта (store-роут требует customer-auth и владение
  корзиной — админский JWT туда не проходит); «наличные/перевод» — `POST .../payment/cash`
  (workflow `init-cart-cash-payment`, сессия `pp_system_default`). Общий вид ответа —
  `src/api/utils/kaspi-payment-response.ts`.
- **webhook**: используем ядровый `POST /hooks/payment/kaspi` (свой роут не пишем).
- **mobile/web**: тонкие экраны — показать QR, опросить статус (контракт → Dart-клиент как обычно).

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
