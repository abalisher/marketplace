# Модуль `scoring` — рейтинг и лимиты отсрочки

**Статус:** MVP готов (1, 2a, 2b, 3; 2c-постоплата отложена) · **Код:** `backend/src/modules/scoring/`,
`backend/src/workflows/` (update-scoring-config/set-company-credit-limit/recompute-company-scoring + шаги),
`backend/src/jobs/recompute-scoring.ts`, `backend/src/api/admin/{scoring-config,companies/[id]/scorecard}/`,
`backend/src/admin/` (Settings правил + карточка на странице компании)

## Назначение
Расчётный рейтинг юрлица (балл 0..100) и вычисляемый из него лимит отсрочки/кредита (ТЗ 4.7).
Продавец видит карточку рейтинга ПЕРЕД одобрением отсрочки; правила расчёта — **НАСТРАИВАЕМЫЕ**
(веса/пороги в конфиге, не хардкод).

## Что закрывает ядро / что кастом
- Ядро скоринга/кредитных лимитов не имеет — домен полностью кастомный.
- **Постоплата юрлиц в чекауте ОТЛОЖЕНА** (payment-kaspi backlog «отложенные сценарии»). MVP scoring =
  вычислить + хранить + показать балл/лимит; применение свободного лимита к оформлению (блок заказа сверх
  лимита, движение `reserved`) — подзадача 2, когда постоплата будет включаться.

## Модели (подзадача 1 — готово)
- `ScoringConfig` — singleton настраиваемых правил (идиома BonusConfig/DocumentSetting; `getOrCreateConfig`):
  веса/потолки компонентов балла (`points_per_order`/`max_orders_points`, `volume_per_point`/`max_volume_points`,
  `days_per_point`/`max_tenure_points`, `penalty_per_return`) + маппинг балла в лимит (`min_score_for_credit`,
  `base_limit`, `limit_per_score_point`, `max_limit`). Дефолты — стартовые, владелец правит в админке (подзадача 3).
- `ScoreCard` — карточка компании (одна на компанию): `company_id` (опазная ссылка-колонка, НЕ FK/link — сервису
  нужен сам для upsert/выборки, идиома documents/reviews), `score`, `credit_limit` (вычисленный), `manual_limit`
  (ручная корректировка продавца — перекрывает вычисленный), `reserved` (занятая постоплатой часть — движение в
  подзадаче 2), `components` (json-разбивка балла для карточки продавцу), `note` (аудит изменений лимита, ТЗ 5.3).

## Сервис (подзадача 1 — готово)
- Чистые `calculateScore(inputs, weights)` (взвешенная сумма компонентов с потолками − штраф за возвраты, clamp
  0..100 + разбивка) и `scoreToLimit(score, weights)` (ниже порога 0, иначе линейно с потолком) — standalone-функции
  в `models/constants.ts` (не методы: правило `service-methods-must-be-async`; идиома bonus `calculateOrderAccrual`).
- `getOrCreateConfig`, `getScoreCard(company_id)`, `upsertScoreCard({company_id, inputs, note?})` (пересчёт по
  конфигу + сохранение, ручной лимит не трогает), `setManualLimit({company_id, manual_limit, note})` (override /
  сброс null), `availableCredit(company_id)` (эффективный лимит [ручной ∥ вычисленный] − reserved; нет карточки → 0).
- **Входные факторы** (`ScoringInputs`: orders_count/orders_total/returns_count/tenure_days) собираются СНАРУЖИ
  (workflow/джоба, подзадача 2) из истории заказов/возвратов и срока работы компании — модуль scoring заказы/
  компанию не знает (изоляция).

## Бизнес-правила (из ТЗ 4.7 / 5.3)
- Критерии: история заказов (кол-во/сумма), возвраты/отмены (штраф), срок работы с платформой. История ПЛАТЕЖЕЙ —
  когда появится постоплата (сейчас нет данных о просрочках).
- Пересчёт — событийно (закрытие заказа/возврат) и/или кроном (подзадача 2).
- Заказ с постоплатой блокируется при превышении свободного лимита (подзадача 2).
- Изменения лимитов логируются (`note`; полноценный аудит-лог — при необходимости отдельной моделью).

## Подзадачи
- [x] **1. Дизайн + модуль:** модели `ScoringConfig`/`ScoreCard`, сервис (конфиг, пересчёт, ручной лимит,
  свободный кредит), чистые функции расчёта, миграция, тесты. Без API/workflows/UI.
- [x] **2a. Admin API:** ГОТОВО 2026-07-21. `GET/POST /admin/scoring-config` (настраиваемые правила, workflow
  `update-scoring-config` с компенсацией, идиома bonus-config) + `GET /admin/companies/:id/scorecard` (карточка +
  свободный лимит, нет карточки → нулевая) + `POST /admin/companies/:id/scorecard/limit` (ручная корректировка
  `setManualLimit` + note, workflow `set-company-credit-limit` с компенсацией + событие `scoring.limit_changed` +
  subscriber-заглушка `scoring-limit-changed`). Контракт/Dart НЕ трогали (admin-конфиг только для веб-админки,
  прецедент bonus-config). Верификация: 5 http-тестов (`scoring-routes.spec.ts`), tsc чистый, lint 0 ошибок.
- [x] **2b. Пересчёт из истории:** ГОТОВО 2026-07-21. Шаг `gather-company-scoring-inputs` (query.graph по link
  company↔order + вложенный `order_lifecycle.status`; кол-во/сумма завершённых [delivered|closed] заказов — суммы
  через сервис order; возвраты/отмены [canceled|returned]; tenure из `company.created_at`) → workflow
  `recompute-company-scoring` → `upsert-score-card` → событие `scoring.recomputed`. Джоба `jobs/recompute-scoring.ts`
  (крон `0 3 * * *`, по approved-компаниям) + событийный пересчёт `subscribers/recompute-scoring-on-order-closed.ts`
  (на `order_lifecycle.status_changed` to=closed, только для заказов юрлиц по link) + subscriber-заглушка
  `scoring-recomputed.ts`. Верификация: 2 http-теста (`scoring-recompute.spec.ts`: балл из 1 завершённого заказа;
  штраф за отмену + счёт только завершённых), tsc чистый, lint 0 ошибок. API не менялся → контракт/Dart не трогали.
- [ ] **2c. Постоплата (ОТЛОЖЕНО, блок):** применение свободного лимита в оформлении постоплатой + движение
  `reserved` — вместе с включением постоплаты юрлиц (payment-kaspi backlog).
- [x] **3. Админ-UI:** ГОТОВО 2026-07-21. Settings-страница правил `src/admin/routes/settings/scoring-rules/page.tsx`
  + drawer `scoring-config-drawer.tsx` (идиома bonus-program; данные `GET/POST /admin/scoring-config`). Блок «Credit
  scoring» на нашей странице компании `routes/companies/[id]/page.tsx` (балл/компоненты/вычисленный+ручной+свободный
  лимит из `GET /admin/companies/:id/scorecard`) + drawer ручной корректировки `credit-limit-drawer.tsx` (`POST
  .../scorecard/limit`). Карточка размещена на НАШЕЙ странице компании, т.к. company — кастомная сущность без ядровой
  detail-зоны для widget'а. Типы — `src/admin/lib/scoring.ts`. Контракт/Dart не трогали (admin-UI). Верификация: tsc
  обоих tsconfig чистый, lint 0 ошибок, `medusa build` backend+frontend зелёный; headless-прокликивание — остаточный
  долг. Детали — DECISIONS 2026-07-21. **Модуль `scoring` готов по MVP (2c-постоплата отложена).**

## Открытые вопросы (владельцу — на ревью дизайна)
- Точный набор факторов и стартовые веса/пороги MVP (текущие — предложение: заказы/объём/стаж − возвраты).
- Нужен ли отдельный аудит-лог изменений лимита (сейчас — поле `note`); связать ли с ядровым `SpendLimit` компании.
