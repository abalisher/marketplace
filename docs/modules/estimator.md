# Модуль `estimator` — расчёт материалов

**Статус:** MVP готов (1, 2a, 2b; ИИ-подзадача 3 отложена) · **Код:** `backend/src/modules/estimator/`,
`backend/src/workflows/` (create-estimate/upsert-material-norm/delete-material-norm + шаги),
`backend/src/api/{store/estimates,admin/material-norms}/`, `backend/src/admin/routes/settings/material-norms/`

## Назначение
Помогает покупателю определить состав и объём черновых материалов: расчёт по нормативной базе от
введённых параметров (площадь/периметр/высота), подборка в трёх сегментах (эконом/комфорт/бизнес),
учёт остатков. ИИ-распознавание файлов проекта и голосовой ввод — отдельный этап (ТЗ 7, DECISIONS 2026-07-10).

## Что закрывает ядро / что кастом
- Ядро расчёта нет — домен кастомный. Подборка товаров — поверх каталога (product_card.segment, цены, остатки).
- **ИИ ОТЛОЖЕН** (отдельный этап после базового MVP, ТЗ «упрощённый первый шаг»): MVP = ручной ввод параметров +
  администрируемая нормативная база + расчёт количеств. Распознавание файлов (Claude API) и STT (kk-KZ) — позже,
  за тем же API модуля (DECISIONS 2026-07-10).

## Модели (подзадача 1 — готово)
- `MaterialNorm` — АДМИНИСТРИРУЕМЫЙ норматив расхода (ТЗ 7, не хардкод): `code` (уникальный), `name`, `work_type`
  (вид работ), `material_kind` (вид материала — сопоставляется с каталогом при подборке), `base`
  (area|volume|length|count), `consumption_per_unit` (расход на единицу базы), `unit`, `active`, `note`.
- `Estimate` — расчёт покупателя: `customer_id` (опазная колонка, nullable — черновик может быть анонимным),
  `source` (manual|file|voice — MVP manual), `status` (draft|calculated), `params` (json введённых параметров),
  `file_id` (nullable — исходный файл при source=file, распознавание позже), `note`; `lines` (hasMany).
- `EstimateLine` — позиция: `material_kind`, `quantity`, `unit`, `norm_code` (трассировка); подборка (заполняется
  при матчинге с каталогом, подзадача 2): `segment`, `product_id` (опазная ссылка), `unit_price`, `total`;
  `estimate` (belongsTo).

## Сервис (подзадача 1 — готово)
- Чистые `calculateMaterialQuantity(base, consumption, params)` (расход × измеритель по базе; volume из area×height;
  ceil до 2 знаков; неизвестная база → ошибка) и `buildEstimateLines(norms, params)` (черновые строки, отсев нулевых)
  — standalone в `models/constants.ts` (не методы: правило service-methods-must-be-async; идиома bonus/scoring).
- `getActiveNorms(codes?)`, `createManualEstimate({customer_id?, params, norm_codes?, source?, note?})` — расчёт сметы
  по активным нормативам (все либо выбранные) + сохранение Estimate(status=calculated) со строками-количествами.
- Результат РЕКОМЕНДАТЕЛЬНЫЙ (ТЗ 7) — правки/подборка/цены/остатки в подзадаче 2.

## Бизнес-правила (из ТЗ 7)
- Входные форматы для ИИ-этапа: PDF, DOC/DOCX, XLS/XLSX, JPEG/PNG; нечитаемый файл → понятная ошибка + ручной ввод.
- Результат явно рекомендательный, покупатель правит позиции/количества.
- Подборка в 3 сегментах с итогом; сегменты можно смешивать; учитывает остатки (нет товара → альтернатива/скрыть).
- Голосовой ввод: минимум ru и kk (STT → структурированный запрос).

## Подзадачи
- [x] **1. Дизайн + модуль (MVP без ИИ):** модели `MaterialNorm`/`Estimate`/`EstimateLine`, сервис (расчёт количеств
  по нормативам от ручных параметров), чистые функции, миграция, тесты. Без API/UI/ИИ/подборки каталога.
- [x] **2a. Store API + подборка:** ГОТОВО 2026-07-21. Сопоставление material_kind↔каталог — через `category_id`
  норматива (решение владельца «сам решай» → явный маппинг по категории). `POST /store/estimates` (расчёт по
  параметрам, гость допускается, workflow `create-estimate`) + `GET /store/estimates/:id` + `GET
  /store/estimates/:id/suggestions?currency_code=` (по категории норматива берёт published-товары, группирует по
  `product_card.segment`, на сегмент — самый дешёвый вариант в валюте + признак наличия по остаткам; total=кол-во×цена).
  OAS-фрагмент `store/estimates/estimates.oas.json`, контракт 115 путей/684 схемы, Dart. Детали — DECISIONS 2026-07-21.
- [x] **2b. Admin API + справочник-UI:** ГОТОВО 2026-07-21. `GET /admin/material-norms` + `POST` (upsert по code,
  workflow `upsert-material-norm` с компенсацией) + `DELETE /admin/material-norms/:id` (workflow `delete-material-norm`
  с компенсацией-восстановлением). Settings-страница `src/admin/routes/settings/material-norms/page.tsx` (таблица норм +
  drawer `material-norm-drawer.tsx` создания/правки; категория — Select из `GET /admin/product-categories` ядра; base
  Select; active Switch). Типы — `src/admin/lib/estimator.ts`. Контракт/Dart НЕ трогали (admin-only). Верификация: 3
  http-теста (`material-norms-routes.spec.ts`), tsc обоих tsconfig чистый, lint 0 ошибок, `medusa build` зелёный.
  Сохранение выбранной опции на EstimateLine — отложено (не критично для MVP). Детали — DECISIONS 2026-07-21.
  **Модуль `estimator` готов по MVP (ИИ-подзадача 3 отложена).**
- [ ] **3. ИИ-этап (ОТЛОЖЕН, отдельный этап):** распознавание файлов проекта через Claude API (площади/периметры) +
  STT (ru/kk) → параметры; за тем же API модуля. Требует ключей/бюджета — согласовать с владельцем.

## Открытые вопросы (владельцу — на ревью)
- Приоритет ИИ-этапа vs ручного MVP (ТЗ выносит ИИ отдельно — сейчас реализован ручной путь).
- Как сопоставлять `material_kind` норматива с товарами каталога (по коду/категории/атрибуту?) — влияет на подзадачу 2.
- Стартовое наполнение нормативной базы (кто заводит нормы по видам работ).
