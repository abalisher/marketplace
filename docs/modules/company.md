# Модуль `company` — юрлица-покупатели

**Статус:** реализован полностью (модели, сервис, links, workflows, API, админ-UI модерации; с тестами) · **Код:** `backend/src/modules/company/`

## Назначение
Компании-покупатели: реквизиты (БИН), учредительные документы, модерация админом,
сотрудники компании и их лимиты на оформление заявок.

## Модели (реализовано)
- `Company` — `name`, `bin` (уникален среди неудалённых; формат «12 цифр» валидируется на уровне API/workflow),
  `status` (`pending`/`approved`/`rejected`, дефолт `pending`), `rejection_reason` (обязателен при reject,
  сбрасывается при approve), `documents` (jsonb, массив `{ name, url }` — файлы в file-провайдере Medusa).
- `Employee` — `role` (`admin`/`member`, дефолт `member`), belongsTo `Company`.
  Привязка к customer ядра — через module link, FK на customer в модели нет намеренно.
- `SpendLimit` — `amount` (bigNumber), `currency_code` (дефолт `kzt`), `period` (`order`/`day`/`week`/`month`),
  belongsTo `Employee`. У сотрудника может быть несколько лимитов с разными периодами — при оформлении
  заказа проверяются все (в workflow, не в модуле).

## Сервис
`CompanyModuleService` — сгенерированный CRUD по трём моделям + переходы модерации:
`approveCompany(id)` (сбрасывает `rejection_reason`), `rejectCompany(id, reason)` (reason обязателен).
Тесты: `backend/src/modules/company/__tests__/company.spec.ts` (нужен Postgres из docker-compose и `backend/.env.test`).

## Связи (links) — реализовано, `backend/src/links/`
- `employee-customer.ts` — Employee ↔ Customer (ядро), 1:1: сотрудники — это customers,
  сгруппированные в компанию; один покупатель состоит максимум в одной компании.
- `company-order.ts` — Company ↔ Order, 1:N: заказы от имени компании.
- Обход в обе стороны — `query.graph` (например, `customer.employee.company`).

## Workflows — реализовано, `backend/src/workflows/`
- `create-company` — регистрация юрлица: pending-компания + регистрирующий customer
  становится сотрудником-админом (валидации: БИН 12 цифр, customer ещё не сотрудник).
- `approve-company` / `reject-company` — модерация (reject — с обязательным комментарием).
- `create-employee` / `delete-employee` — принять customer в компанию / уволить
  (снимаются links, мягко удаляются лимиты сотрудника; customer ядра не трогаем).
- `create-spend-limit` / `delete-spend-limit` — назначить/снять лимит (amount > 0).
- Проверка прав (кто может звать) — на уровне API, не в workflows.
- Тесты: `backend/integration-tests/http/company-workflows.spec.ts` (`npm run test:integration:http`,
  нужен docker-postgres). Нюанс проверки ошибок workflow — см. DECISIONS.md (2026-07-13).

## Бизнес-правила (из ТЗ)
- Юрлицо регистрируется самостоятельно, но лимиты/отсрочка активируются ТОЛЬКО после модерации админом.
- Админ компании-покупателя управляет своими сотрудниками и их лимитами.
- Сотрудник оформляет заявки строго в рамках лимита; видит документы и ограниченную аналитику.
- Отсрочка платежа доступна только юрлицам — в рамках лимита из модуля `scoring`.

## API — реализовано (`backend/src/api/`)
Роуты тонкие: zod-валидация (схемы в `validators.ts`, подключены в `src/api/middlewares.ts`) → вызов
workflow с `throwOnError: true` (сериализованная ошибка шага несёт `type`, errorHandler ядра мапит её
в статус: NOT_FOUND→404, INVALID_DATA/NOT_ALLOWED→400).

Store (все — только для залогиненного customer, `authenticate("customer")` в middlewares):
- `POST /store/companies` — регистрация юрлица (вызывающий становится сотрудником-админом).
- `GET /store/companies/me` — компания текущего покупателя и его роль; 404 — не состоит в компании.
- `GET|POST /store/companies/me/employees` — список/принятие сотрудников (только админ компании).
- `DELETE /store/companies/me/employees/:id` — увольнение (админ не может удалить себя).
- `POST .../:id/spend-limits`, `DELETE .../:id/spend-limits/:limit_id` — лимиты сотрудника.

Проверка прав — хелперы `store/companies/helpers.ts` (`requireCompanyAdmin` и т.п., через `query.graph`);
чужие ресурсы отдают 404, не 403 — не светим существование чужих id.

Admin (защищены аутентификацией ядра автоматически):
- `GET /admin/companies?status=&q=&order=&limit=&offset=` — очередь модерации (по умолчанию FIFO
  по created_at; `q` — поиск по searchable-полям name/bin; `order` — `created_at`|`name`, префикс
  `-` — по убыванию). Реализован через сервис модуля, не `query.graph`: free-text `q`
  поддерживают только сгенерированные list-методы.
- `GET /admin/companies/:id` — карточка с сотрудниками и лимитами.
- `POST /admin/companies/:id/approve`, `POST /admin/companies/:id/reject` (reason обязателен).

Контракт: OAS-фрагмент `backend/src/api/store/companies/companies.oas.json` — только store-роуты
(admin-роуты в контракт не входят: он существует для Dart-кодогена мобилок, модерация — в веб-админке).
Тесты роутов: `backend/integration-tests/http/company-routes.spec.ts`.

## Админ-UI модерации — реализовано (`backend/src/admin/routes/companies/`)
Требование владельца: «никакой разницы» со стандартными страницами дашборда — вид и контролы
копируют списки ядра (Products/Inventory) точь-в-точь.
- `page.tsx` — пункт «Companies» в сайдбаре; список: блок фильтров — дословная копия внутреннего
  `DataTableFilter` дашборда (чипы → labeled «Add filter» → «Clear all»; чип `[Status | is | … | ×]`
  открывается сразу после добавления, пустой исчезает, «Add filter» скрывается, когда свободных
  фильтров нет), server-side поиск (`DataTable.Search` → `q`), меню сортировки
  (`DataTable.SortingMenu` → `order`, name/created_at), статус — точкой (идиома StatusCell
  списков ядра, не StatusBadge), «...»-меню действий в строке (`columnHelper.action`:
  Approve/Reject по статусу); клик по строке — карточка.
- `[id]/page.tsx` — карточка: реквизиты (БИН, дата заявки), rejection reason (для rejected),
  документы (ссылки), сотрудники с ролями и лимитами; статус — StatusBadge (как в шапках ядра);
  действия — в «...»-меню шапки: Approve (подтверждение через `usePrompt`) и Reject (Prompt
  с Textarea, кнопка недоступна без комментария — reason обязателен по ТЗ).
- Общий код: `src/admin/hooks/use-company-moderation.ts` (мутации + confirm),
  `src/admin/components/reject-company-prompt.tsx` (диалог отклонения).
- Данные — `@tanstack/react-query` + `@medusajs/js-sdk` (сессия админа, относительный baseUrl;
  без `import.meta` — файлы админки проходят и через CJS-компиляцию `medusa build`).
- Тексты — на английском, как всё ядро дашборда (ru-локали у ядра нет; локализация всего
  дашборда через `src/admin/i18n` — отдельная будущая задача).
- Ограничение: режим customize дашборда (Personal/Default, скрытие/перестановка секций) работает
  только на страницах ядра, собранных из его секций (`core:*`) — кастомные UI-роуты Admin SDK
  в него не включаются, это ограничение фреймворка, не нашего кода.
