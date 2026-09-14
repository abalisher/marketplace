# Маркетплейс черновых стройматериалов (Астана)

Монорепо. Паритет платформ: каждый работает там, где удобно — функции покупателя и продавца доступны
и в мобильных приложениях, и в вебе. Вся бизнес-логика ТОЛЬКО в бэкенде; клиенты — тонкие
(дублируются экраны, но не логика).

## Стек
- `backend/` — Medusa v2 (Node.js / TypeScript) + PostgreSQL + Redis. Кастомные домены — в `backend/src/modules/`.
  Веб продавца/админа — расширяемая админка Medusa (`backend/src/admin/`).
- `storefront/` — веб-витрина покупателя: Next.js (Medusa Starter Storefront, кастомизируется).
- `mobile/` — Flutter (Dart 3.6+, Pub Workspace): 3 приложения (`buyer`, `partner`, `driver`) + общие пакеты.
- `contracts/openapi.json` — автогенерируемый контракт API, ЕДИНСТВЕННЫЙ мост между TS и Dart.
- `infra/` — Docker Compose (локально и прод, VPS в Казахстане).

## Порядок работы сессии (обязательно)
1. **Старт**: прочитай `docs/STATE.md` (сводка «где мы») и `docs/PLAN.md` (бэклог: эпики/таски/гейты).
   Не сканируй репозиторий вслепую.
2. **Контекст по задаче**: карта системы — `ARCHITECTURE.md`; бизнес-правила — `docs/DOMAIN.md`;
   детали модуля — `docs/modules/<имя>.md`. Читай только то, что нужно задаче.
3. **Изоляция**: одна задача = один модуль/пакет. Работая над mobile, НЕ читай TypeScript-код —
   используй `contracts/openapi.json`. И наоборот.
4. **Финиш**: пройди гейты качества таска по `docs/QUALITY.md` (К — код всегда; U — UI/UX и
   Ф — фокус-группа, если назначены); отметь статус и результат гейтов в `docs/PLAN.md`; обнови
   `docs/STATE.md` (журнал + следующий шаг); архитектурные решения — в `docs/DECISIONS.md`;
   при изменении модуля — его `docs/modules/*.md`.
5. **Циклы**: при работе в режиме `/loop` следуй протоколу `docs/LOOPS.md` (один таск за итерацию, гейты обязательны).

## Жёсткие правила кода
- Один файл = одна сущность/класс/экран. Без barrel-файлов и реэкспортов.
- `mobile/packages/api_client/` генерируется из контракта — руками не редактировать.
- Кастомные модули Medusa не импортируют друг друга напрямую — только module links и workflows.
- Секреты — только через env; в репо — только `.env.example`.
- Названия и код — на английском; комментарии и документация — на русском.

## Команды
Локальный CI (lint + тесты всего монорепо): `bash scripts/ci.sh` (Windows — из Git Bash).

Инфраструктура (Postgres + Redis):
- Поднять: `docker compose -f infra/docker-compose.yml up -d`
- Остановить: `docker compose -f infra/docker-compose.yml down`

Бэкенд (Medusa v2, каталог `backend/`, запускается на хосте и ходит в контейнеры БД/Redis):
- Установка зависимостей: `cd backend && npm install`
- Настройка окружения: `cp backend/.env.example backend/.env` (значения по умолчанию совпадают с docker-compose)
- Миграции ядра: `cd backend && npx medusa db:migrate`
- Создать admin-пользователя (владелец, видит панель целиком): `cd backend && npx medusa user -e admin@example.com -p supersecret`
- Создать учётку обычного продавца (роль `seller`, урезанная панель):
  `cd backend && npx medusa exec ./src/scripts/create-seller-user.ts`
  (креды — `SELLER_EMAIL`/`SELLER_PASSWORD`, по умолчанию `seller@stroymarket.kz` / `seller123456`)
- Создать учётки сборщиков (по одной на категорию, роль `picker`, видят только свою группу):
  `cd backend && npx medusa exec ./src/scripts/create-picker-users.ts`
  (`picker.<handle>@stroymarket.kz`, пароль — `PICKER_PASSWORD`, по умолчанию `picker123456`)
- Дев-сервер (админка на http://localhost:9000/app): `cd backend && npm run dev`
- Сборка / прод-старт: `npm run build` / `npm run start`
- Скриншоты панели продавца для гейта U (стенд поднят): `cd backend && node scripts/admin-screenshots.mjs
  --spec scripts/shots/<таск>.mjs --out ../docs/qa/screens/<ТАСК>` (правила слоя стилей — `src/admin/README.md`)
- Линт: `npm run lint` · Тесты: `npm run test:unit`, `npm run test:integration:modules`, `npm run test:integration:http`
  (интеграционные требуют поднятый docker-postgres; креды временной тест-БД — `backend/.env.test`, лежит в репо)
- Уборка тестовых БД: перед `test:integration:http` автоматически идёт `npm run test:clean` (сносит одноразовые
  базы оборванных прогонов — при `--forceExit` тест-раннер не успевает их дропнуть). Снести заодно и базы
  модульных тестов (они переиспользуются): `npm run test:clean:all`
- Контракт API (после изменения API): `cd backend && npm run contract:generate` → обновляет `contracts/openapi.json`
  (база — официальная спека Medusa v2 Store API + фрагменты `backend/src/api/**/*.oas.json`; нужен интернет).
  Затем Dart-клиент: `cd mobile/packages/api_client && dart run swagger_parser && dart run build_runner build --delete-conflicting-outputs && dart format .`
  (если каталог `lib/src/generated` удалялся вручную — сначала `dart run build_runner clean`).

Прод-стенд на VPS (адрес — **https://stand.kenenai.com**, именованный туннель Cloudflare; запасной
вход `https://95.47.96.14:4440`; подробности и раскладка путей — `infra/prod/README.md`):
- Развернуть/обновить с этой машины: `bash scripts/deploy.sh`
  (доставляет исходник tar'ом по ssh, запускает `infra/prod/deploy-server.sh`, собирает окно
  сборщика под `/picker/`; хост — алиас `stroymarket` в `~/.ssh/config`)
- **Миграции на чистой базе — только так:** `bash scripts/migrate-remote.sh`
  (в контейнере `medusa db:migrate` зависает — причина и замер в шапке скрипта и в DECISIONS 2026-09-08)
- Секрет или модель в окружении сервера (скрытый ввод, без следа в истории команд):
  `ssh -t stroymarket 'cd ~/stroymarket/infra/prod && bash set-env.sh GEMINI_API_KEY'`
- Логи и состояние: `ssh stroymarket 'cd ~/stroymarket/infra/prod && docker compose ps'` ·
  `docker compose logs -f backend`
- Скрипты стенда на сервере идут по исходнику из `/app`:
  `docker compose exec backend sh -lc 'cd /app && npx medusa exec ./src/scripts/prepare-demo-stand.ts'`
- **Смена адреса стенда — только скриптом:** `ssh stroymarket 'cd ~/stroymarket/infra/prod && bash
  set-origin.sh https://новый.адрес'`, затем `bash scripts/deploy.sh`. Адрес лежит в пяти строках
  `.env`, вшивается в бандлы витрины и окна сборщика и хранится абсолютными ссылками в базе
  (фото товаров, PDF документов) — правка одного `PUBLIC_ORIGIN` даёт наполовину переехавший стенд.
- Пересборка витрины нужна при смене адреса стенда, `FEATURE_COMPANIES` или публикуемого ключа:
  `NEXT_PUBLIC_*` вшиваются в бандл на сборке.

Витрина (Next.js, каталог `storefront/`, требует запущенный бэкенд на :9000):
- Установка зависимостей: `cd storefront && npm install`
- Настройка окружения: скопировать `storefront/.env.example` → `storefront/.env`, вписать publishable key
  (админка → Settings → Publishable API Keys; после сида есть «Default Publishable API Key»).
- Дев-сервер (http://localhost:8000): `cd storefront && npm run dev`
- Сборка / прод-старт: `npm run build` / `npm run start` · Линт: `npm run lint`

Mobile (Flutter Pub Workspace, каталог `mobile/`; все команды pub — из корня workspace):
- Зависимости (весь workspace разом): `cd mobile && flutter pub get`
- Формат / анализ (весь workspace): `cd mobile && dart format .` · `flutter analyze`
- Запуск приложения: `cd mobile/apps/buyer && flutter run` (аналогично `partner`, `driver`)
- Сборка: `flutter build web` / `flutter build apk` из каталога приложения
  (Windows-таргет недоступен: не установлен Visual Studio C++ workload).
