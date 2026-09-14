# Модуль `reviews` — отзывы и претензии

**Статус:** ГОТОВ (4/4 подзадачи: модуль + store API + admin API + админ-UI) + рабочее место
претензий (T4.11, 2026-08-18) · **Код:** `backend/src/modules/reviews/`,
`backend/src/workflows/` (create-review/open-dispute/register-dispute/moderate-review/
transition-dispute + шаги), `backend/src/api/{store,admin}/` (роуты), `backend/src/admin/`
(экраны «Претензии» и «Отзывы», рабочее место претензии, widget заказа)

## Назначение
Отзывы покупателя по завершённому заказу (рейтинг **поставщика и доставки — раздельно**, ТЗ) и
диспуты «проблема с заказом». Область добавлена из ревью дизайна мобилки (2026-07-15); идёт после
заказа/оплаты/документов.

## Что закрывает ядро / что кастом
- Ядро отзывов/диспутов НЕ имеет — домен полностью кастомный.
- Право оставить отзыв / открыть диспут (заказ принадлежит покупателю и доставлен/закрыт; доставку
  оценивает только заказ со способом `delivery`) — гейт слоя API/workflow (подзадача 2), не модели:
  проверяется через `query.graph` по заказу и его `order_lifecycle.status`/`delivery_method`.

## Модели
- `Review` — отзыв: `order_id`/`customer_id` (опазные ссылки-колонки, НЕ FK/link — как `documents`),
  `target` (`supplier`|`delivery` — раздельная оценка), `rating` (1..5, границы в сервисе),
  `comment` (nullable), `status` (`published`|`hidden` — модерация видимости).
- `Dispute` — претензия: `order_id`/`customer_id`, `category` (`not_delivered`|`damaged`|`wrong_item`|
  `quality`|`other`), `description`, `status` (`open`→`in_review`→`resolved`|`rejected`),
  `resolution` (текст решения оператора, заполняется при закрытии), `outcome`
  (последствие решения: `refund`|`redelivery`|`replacement`|`bonus`|`none`, до закрытия — null),
  `source` (`buyer` — заявил покупатель через чат, `operator` — записал оператор с его слов).

### Почему `order_id`/`customer_id` колонками, а не module link
Как в `documents`: сервису они нужны сами — инвариант «один отзыв на (заказ, покупатель, объект)»,
«один активный диспут на заказ», агрегация рейтинга по `target`. Это внутренняя логика домена; FK нет,
модули order/customer не импортируются — изоляция цела. Выборка отзывов/диспутов заказа (подзадача 2) —
прямым `query.graph(entity:"review"|"dispute", filters:{order_id})`. Link можно добавить позже.

## Сервис (подзадача 1 — готово)
- `createReview({order_id, customer_id, target, rating, comment?})` — оценка целое 1..5; запрещён
  повторный отзыв на тот же `(order_id, customer_id, target)` (оба объекта одного заказа независимы).
- `setReviewStatus({id, status})` — модерация видимости (скрыть/опубликовать).
- `getRatingSummary(target)` — среднее и количество ТОЛЬКО опубликованных отзывов по объекту
  (маркетплейс одного продавца — глобальная сводка; среднее округляется до 0.1).
- `openDispute({order_id, customer_id, category, description, source?})` — запрещён второй АКТИВНЫЙ
  (`open`/`in_review`) диспут по заказу; закрытые не мешают открыть новый. `source` по умолчанию
  `buyer`.
- `recordDisputeTransition({id, to, resolution?, outcome?})` — перевод по стейт-машине оператором;
  последствие решения обязательно при `resolved` (см. ниже).
- `assertDisputeTransition(from, to)` — чистая проверка перехода (standalone-функция в `constants.ts`,
  не метод сервиса: правило `service-methods-must-be-async`; идиома bonus `assertSpendWithinCap`).

## Стейт-машина претензии
`open → {in_review, resolved, rejected}` · `in_review → {resolved, rejected}` · `resolved`/`rejected` —
терминальные. `resolution` сохраняется при закрытии.

**Последствие решения обязательно (T4.11).** Удовлетворение (`resolved`) без `outcome` — ошибка
400 (`disputeOutcomeForTransition` в `models/constants.ts`): «возврат / повторная доставка / бонусы»
должны быть названы явно, иначе решение нельзя ни объяснить покупателю, ни проверить через месяц.
Отказ (`rejected`) всегда пишет `outcome: "none"` — присланное значение игнорируется, чтобы в
журнале не осталось «отказано, но возврат». Автокомпенсации нет: возврат и довоз оператор проводит
сам, поле фиксирует обещанное.

## Подзадачи
- [x] **1. Дизайн + модуль:** модели `Review`/`Dispute`, сервис (инварианты рейтинга/уникальности/
  стейт-машины), константы, миграция, тесты. Без API/workflows/UI.
- [x] **2a. Store API + workflows:** ГОТОВО 2026-07-21. Покупатель — оставить отзыв (`POST /store/orders/:id/reviews`,
  гейт `validate-review-eligibility`: свой доставленный/закрытый заказ, доставку — только delivery, один на
  (заказ,target)) и открыть диспут (`POST /store/orders/:id/disputes`, гейт `require-own-order` + блок второго
  активного); чтение своих (`GET` тех же путей). Workflows `create-review`/`open-dispute` (тонкие роуты →
  workflow, гейт в шаге через query.graph, компенсации удаляют строку); события `review.created`/`dispute.opened`
  + subscriber-заглушки `review-created.ts`/`dispute-opened.ts`. OAS в store/orders/orders.oas.json (tag Reviews),
  контракт 106 путей/666 схем, Dart 32 клиента. Детали — DECISIONS 2026-07-21.
- [x] **2b. Admin API + workflows:** ГОТОВО 2026-07-21. `GET /admin/orders/:id/reviews` (все отзывы заказа, вкл.
  скрытые) + `GET /admin/orders/:id/disputes` + `GET /admin/reviews/summary` (сводка supplier+delivery через
  `getRatingSummary`) + `POST /admin/reviews/:id/moderate` (hide/publish, workflow `moderate-review` с компенсацией) +
  `GET /admin/disputes` (очередь: фильтр status, дефолт активные, пагинация) + `POST /admin/disputes/:id/transition`
  (workflow `transition-dispute` → `recordDisputeTransition` + событие `dispute.status_changed` + subscriber-заглушка).
  OAS-фрагмент `admin/reviews/reviews.oas.json` (tag Reviews). Контракт 112 путей/677 схем/8 фрагментов, Dart 32 клиента.
  Детали — DECISIONS 2026-07-21.
- [x] **3. Админ-UI:** ГОТОВО 2026-07-21. Очередь диспутов `src/admin/routes/disputes/page.tsx` (идиома
  `order-queue`: копия DataTableFilter ядра, статус точкой, server-side фильтр status, дефолт — активные; клик по
  строке → drawer `dispute-transition-drawer.tsx` — ведение по стейт-машине с обязательной резолюцией при
  resolved/rejected). Widget `src/admin/widgets/order-reviews-card.tsx` (`order.details.after`): отзывы заказа с
  модерацией hide/publish в «...»-меню, диспуты заказа (клик → тот же drawer), глобальная сводка рейтинга в шапке.
  Хук `hooks/use-reviews.ts` (мутации moderate/transition), типы/meta `lib/reviews.ts`. Контракт/Dart не трогали
  (admin-UI). Верификация: tsc обоих tsconfig чистый, lint 0 ошибок, `medusa build` backend+frontend зелёный;
  headless-прокликивание — остаточный долг (build+tsc+http покрывают; идиома order-queue/order-lifecycle-card).
  Детали — DECISIONS 2026-07-21. **Модуль `reviews` закрыт (4/4).**
  **Долг «headless-прокликивание» выстрелил (T4.11a, 2026-08-18):** клик по строке очереди РОНЯЛ
  экран — `useDataTable` отдавал в `onRowClick` обёртку TanStack, drawer получал объект без
  `status`, и `DISPUTE_STATUS_META[undefined].color` рушил рендер. Ф-прогон панели поймал это
  двумя персонами, а build/tsc/http — нет: тип колбэка обещает строку, а подменяется она в рантайме.
  Правка — общий `admin/lib/data-table-row.ts`. Обрати внимание: в виджете заказа
  (`order-reviews-card.tsx`) drawer открывается из обычного `map` по диспутам с настоящим объектом —
  поэтому там он работал всегда, и это маскировало дефект очереди.

## Вход покупателя — только чат (2026-08-17)

Экрана претензии нет ни на витрине, ни в mobile buyer, и после пивота он не планируется: единственный
канал покупателя — диалог с ассистентом. Претензию принимает инструмент `open_dispute`
(`lib/assistant/tools/open-dispute.ts`) — тонкая обёртка над тем же `openDisputeWorkflow`, что и роут
`POST /store/orders/:id/disputes`; статус претензии покупатель узнаёт через `track_order`. Роут
остаётся рабочим (им пользуются тесты и любой другой клиент), но UI поверх него не строим.
Инварианты (один активный диспут на заказ, гейт принадлежности) живут в модуле — оба входа их делят.

**Третий вход — оператор (T4.11).** Звонок и самовывоз проходят мимо чата, поэтому претензию можно
записать из панели: `POST /admin/disputes` → `registerDisputeWorkflow` (шаг
`resolve-order-customer` берёт покупателя из самого заказа, `openDisputeStep` помечает
`source: "operator"`). Гейта принадлежности здесь нет — оператор действует от лица магазина; блок
второго активного диспута общий, он в сервисе.

**Решение доходит до покупателя только через чат** (DECISIONS 2026-08-18, канала уведомлений нет):
`track_order` отдаёт статус, текст решения И последствие словами (`DISPUTE_OUTCOME_TEXT` в
`lib/assistant/tools/dispute-status.ts`). Панель говорит об этом прямо — блок «Как покупатель
узнает решение» в рабочем месте претензии.

## Рабочее место претензий (T4.11, 2026-08-18)

Ф-прогон панели 2026-08-18 (Асель, 1/5) дал 4 блокера: претензию нельзя было завести из панели, из
претензии не попасть в заказ (в списке — внутренний id, поиском не находится), последствия решения
нигде не фиксировались, и было непонятно, узнает ли покупатель о решении. Закрыто:

- `GET /admin/disputes` — очередь: строку целиком собирает бэкенд (`api/admin/disputes/rows.ts`) —
  номер заказа, покупатель, сумма, суть жалобы, **возраст обращения и просрочка** по сроку ответа
  (`DISPUTE_SLA_HOURS`, по умолчанию 24 ч) + счётчики по статусам для чипов; поиск `q` по номеру
  заказа, почте покупателя и тексту жалобы.
- `GET /admin/disputes/:id/card` — рабочее место одним ответом
  (`api/admin/disputes/[id]/card/card.ts`): претензия со сроком, **заказ готовой карточкой заказа**
  (`buildOrderCard` — состав, деньги, стадии, документы; не своя выборка, иначе спор о претензии
  станет спором о данных), отзывы заказа и история обращений покупателя (сколько, чем закончились).
- `POST /admin/disputes` — претензия по звонку (см. «Третий вход» выше).
- `POST /admin/disputes/:id/transition` — плюс `outcome`.
- `GET /admin/reviews` — раздел «Отзывы»: фильтры по объекту оценки и видимости, поиск, счётчики,
  сводки рейтинга; модерация — прежний `POST /admin/reviews/:id/moderate`.
- Карточка заказа (`/admin/orders/:id/lifecycle/card`) несёт `active_dispute` — предупреждение с
  кнопкой «Открыть претензию» стоит первым блоком: до этого продавец, открыв заказ, о претензии не
  узнавал.
- Дашборд: плитка «Претензии» (активные, просроченные, возраст самой старой).
- Ожидание на экранах — в человеческих единицах (`admin/lib/waiting.ts`, гейт U 2026-09-03): до
  двух суток часы (срок ответа 24 ч ещё что-то значит), дальше сутки — «18 дн», а не «443 ч». По
  ЗАКРЫТЫМ претензиям (`DISPUTE_CLOSED`) ожидание не показывается вовсе: ждать по ним нечего.
  Бэкенд по-прежнему отдаёт `age_hours` числом — единицу выбирает экран.
- UI: `routes/disputes/page.tsx` (переработана в идиоме экрана «Заказы»), `routes/reviews/page.tsx`,
  `components/dispute-card-drawer.tsx` (заменил `dispute-transition-drawer.tsx`),
  `components/dispute-register-drawer.tsx`. В меню и заголовках — **«Претензии»**, слово «диспут» с
  экранов убрано (в работе его не используют).
- Демо-данные для показа и кадров: `src/scripts/seed-demo-claims.ts`.

Осталось за границей таска: доказательства доставки (водитель, фото выгрузки, подпись получателя) —
их нет в домене, приходят с E5; в карточке об этом сказано прямо, чтобы оператор не искал их по
экранам.

## Отложено (вне MVP)
- Ответы продавца на отзыв, голоса «полезно», фото в отзыве.
- Мультипродавцовые рейтинги (сейчас один продавец — глобальная сводка по `target`).
- Автокомпенсация по диспуту (бонусы/возврат) — оператор решает вручную, связь с `bonus`/возвратом позже.
