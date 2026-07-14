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
1. **Старт**: прочитай `docs/STATE.md` (текущее состояние и следующий шаг). Не сканируй репозиторий вслепую.
2. **Контекст по задаче**: карта системы — `ARCHITECTURE.md`; бизнес-правила — `docs/DOMAIN.md`;
   детали модуля — `docs/modules/<имя>.md`. Читай только то, что нужно задаче.
3. **Изоляция**: одна задача = один модуль/пакет. Работая над mobile, НЕ читай TypeScript-код —
   используй `contracts/openapi.json`. И наоборот.
4. **Финиш**: прогони lint + тесты затронутой части; обнови `docs/STATE.md` (что сделано, что дальше);
   архитектурные решения допиши в `docs/DECISIONS.md`; при изменении модуля — его `docs/modules/*.md`.
5. **Циклы**: при работе в режиме `/loop` следуй протоколу `docs/LOOPS.md` (одна задача за итерацию, верификация обязательна).

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
- Создать admin-пользователя: `cd backend && npx medusa user -e admin@example.com -p supersecret`
- Дев-сервер (админка на http://localhost:9000/app): `cd backend && npm run dev`
- Сборка / прод-старт: `npm run build` / `npm run start`
- Линт: `npm run lint` · Тесты: `npm run test:unit`, `npm run test:integration:modules`, `npm run test:integration:http`
  (интеграционные требуют поднятый docker-postgres; креды временной тест-БД — `backend/.env.test`, лежит в репо)
- Контракт API (после изменения API): `cd backend && npm run contract:generate` → обновляет `contracts/openapi.json`
  (база — официальная спека Medusa v2 Store API + фрагменты `backend/src/api/**/*.oas.json`; нужен интернет).
  Затем Dart-клиент: `cd mobile/packages/api_client && dart run swagger_parser && dart run build_runner build --delete-conflicting-outputs && dart format .`
  (если каталог `lib/src/generated` удалялся вручную — сначала `dart run build_runner clean`).

Витрина (Next.js, каталог `storefront/`, требует запущенный бэкенд на :9000):
- Установка зависимостей: `cd storefront && npm install`
- Настройка окружения: скопировать `storefront/.env.template` → `storefront/.env`, вписать publishable key
  (админка → Settings → Publishable API Keys; после сида есть «Default Publishable API Key»).
- Дев-сервер (http://localhost:8000): `cd storefront && npm run dev`
- Сборка / прод-старт: `npm run build` / `npm run start` · Линт: `npm run lint`

Mobile (Flutter Pub Workspace, каталог `mobile/`; все команды pub — из корня workspace):
- Зависимости (весь workspace разом): `cd mobile && flutter pub get`
- Формат / анализ (весь workspace): `cd mobile && dart format .` · `flutter analyze`
- Запуск приложения: `cd mobile/apps/buyer && flutter run` (аналогично `partner`, `driver`)
- Сборка: `flutter build web` / `flutter build apk` из каталога приложения
  (Windows-таргет недоступен: не установлен Visual Studio C++ workload).
