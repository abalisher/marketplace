# Модуль `reviews` — отзывы и диспуты

**Статус:** ГОТОВ (4/4 подзадачи: модуль + store API + admin API + админ-UI) · **Код:** `backend/src/modules/reviews/`,
`backend/src/workflows/` (create-review/open-dispute/moderate-review/transition-dispute + шаги),
`backend/src/api/{store,admin}/` (роуты), `backend/src/admin/` (очередь диспутов + widget заказа)

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
- `Dispute` — диспут: `order_id`/`customer_id`, `category` (`not_delivered`|`damaged`|`wrong_item`|
  `quality`|`other`), `description`, `status` (`open`→`in_review`→`resolved`|`rejected`),
  `resolution` (текст решения оператора, заполняется при закрытии).

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
- `openDispute({order_id, customer_id, category, description})` — запрещён второй АКТИВНЫЙ
  (`open`/`in_review`) диспут по заказу; закрытые не мешают открыть новый.
- `recordDisputeTransition({id, to, resolution?})` — перевод по стейт-машине оператором.
- `assertDisputeTransition(from, to)` — чистая проверка перехода (standalone-функция в `constants.ts`,
  не метод сервиса: правило `service-methods-must-be-async`; идиома bonus `assertSpendWithinCap`).

## Стейт-машина диспута
`open → {in_review, resolved, rejected}` · `in_review → {resolved, rejected}` · `resolved`/`rejected` —
терминальные. `resolution` сохраняется при закрытии.

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

## Отложено (вне MVP)
- Ответы продавца на отзыв, голоса «полезно», фото в отзыве.
- Мультипродавцовые рейтинги (сейчас один продавец — глобальная сводка по `target`).
- Автокомпенсация по диспуту (бонусы/возврат) — оператор решает вручную, связь с `bonus`/возвратом позже.
